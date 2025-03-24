import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import PokerTable from "@/components/PokerTable";
import ChallengeDialog from "@/components/ChallengeDialog";
import {
  GameState,
  GameAction,
  Card as CardType,
  PokerHand,
  TurnAction,
} from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlayIcon, ChevronDownIcon, ExternalLinkIcon } from "lucide-react";
import CardPreview from "@/components/CardPreview";
import { evaluateHand } from "@/lib/poker-logic";
import { useAiAgent } from "@/hooks/useAiAgent";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import ConnectWallet from "@/components/ConnectWallet";

const DebugPanel = ({ gameState }: { gameState: GameState | null }) => {
  if (!gameState) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-lg text-xs">
      <pre>
        {JSON.stringify({
          started: gameState.started,
          currentPlayer: gameState.currentPlayer,
          pot: gameState.pot,
          round: gameState.round,
        }, null, 2)}
      </pre>
    </div>
  );
};

const Game = () => {
  const { connected, account } = useWallet();
  const [showChallenge, setShowChallenge] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [waitingForAi, setWaitingForAi] = useState(false);
  const [aiThought, setAiThought] = useState<string | null>(null);
  const [playerBalance, setPlayerBalance] = useState<number>(0);

  const aiTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    getAiDecision,
    getWalletBalance,
    walletAddress,
    walletBalance,
    performTransaction,
    isProcessing,
  } = useAiAgent();

  useEffect(() => {
    console.log("Game state updated:", {
      hasState: !!gameState,
      pot: gameState?.pot,
      currentPlayer: gameState?.currentPlayer,
      started: gameState?.started,
      round: gameState?.round,
    });
  }, [gameState]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && account) {
        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);
        
        try {
          const coinData = await aptos.getAccountCoinsData({
            accountAddress: account.address,
            options: { limit: 1 }
          });
          
          const aptCoin = coinData.find(coin => 
            coin.asset_type === "0x1::aptos_coin::AptosCoin"
          );
          
          if (aptCoin) {
            const balance = Number(aptCoin.amount) / 100_000_000; // Convert from octas to APT
            setPlayerBalance(balance);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
          toast.error("Failed to fetch wallet balance");
        }
      }
    };

    fetchBalance();
  }, [connected, account]);

  // Effect to handle AI turn when currentPlayer changes to "ai"
  useEffect(() => {
    if (gameState?.currentPlayer === "ai" && !waitingForAi && gameState.started && !gameState.ended) {
      console.log("AI turn triggered by effect");
      setWaitingForAi(true);
      setAiThought("Thinking...");
      
      handleAITurn();
      // Clear any existing timeout
      if (aiTurnTimeoutRef.current) {
        clearTimeout(aiTurnTimeoutRef.current);
      }
      
      // Add a small delay to make the AI seem more natural
      // aiTurnTimeoutRef.current = setTimeout(() => {
      //   handleAITurn().catch(error => {
      //     console.error("Error during AI turn:", error);
      //     setWaitingForAi(false);
      //     setAiThought(null);
      //   });
      // }, 2000);
    }
    
    // Cleanup function
    return () => {
      if (aiTurnTimeoutRef.current) {
        clearTimeout(aiTurnTimeoutRef.current);
      }
    };
  }, [gameState?.currentPlayer, gameState?.started, gameState?.ended, waitingForAi]);

  const initializeGame = () => {
    return new Promise<void>(async (resolve) => {
      if (!connected) {
        toast.error("Please connect your wallet to play");
        return;
      }

      const maxChips = Math.min(playerBalance * 1000, 2000); // Convert APT to chips, max 2000
      if (maxChips < 100) {
        toast.error("Insufficient balance. Minimum 0.1 APT required to play");
        return;
      }

      try {
        const initialGameState: GameState = {
          id: Math.random().toString(36).substring(2, 9),
          players: [
            {
              id: "player1",
              name: "You",
              chips: maxChips,
              cards: [],
            },
          ],
          aiAgent: {
            id: "ai",
            name: "PokerMind AI",
            chips: maxChips,
            cards: [],
            thinking: false,
            walletAddress: walletAddress,
          },
          communityCards: [],
          pot: 0,
          currentPlayer: "",
          round: "preflop",
          actions: [],
          started: false,
          ended: false,
        };

        setGameState(initialGameState);
        toast.success("Game initialized with " + maxChips + " chips!");
        resolve();
      } catch (error) {
        console.error("Error initializing game:", error);
        toast.error("Failed to initialize game");
      }
    });
  };

  const startGame = () => {
    return new Promise<void>((resolve) => {
      const deck = generateDeck();
      const shuffledDeck = shuffleDeck(deck);
      
      const playerCards: CardType[] = [shuffledDeck.pop()!, shuffledDeck.pop()!];
      const aiCards: CardType[] = [
        { ...shuffledDeck.pop()!, hidden: true }, 
        { ...shuffledDeck.pop()!, hidden: true }
      ];
      
      const smallBlind = 10;
      const bigBlind = 20;

      setGameState(prev => {
        if (!prev) return null;

        const newState = {
          ...prev,
          players: [{
            ...prev.players[0],
            cards: playerCards,
            chips: prev.players[0].chips - bigBlind
          }],
          aiAgent: {
            ...prev.aiAgent,
            cards: aiCards,
            chips: prev.aiAgent.chips - smallBlind,
            thinking: false
          },
          pot: smallBlind + bigBlind,
          currentPlayer: 'player1',
          started: true,
          actions: [
            { 
              type: 'blind', 
              amount: smallBlind, 
              player: 'ai', 
              timestamp: Date.now() - 1000 
            },
            { 
              type: 'blind', 
              amount: bigBlind, 
              player: 'player1', 
              timestamp: Date.now() 
            }
          ],
          deck: shuffledDeck,
          round: 'preflop',
          currentBet: bigBlind,
          lastRaise: bigBlind
        };
        
        return newState;
      });

      toast.success("Game started! You have the big blind.");
      resolve();
    });
  };

  const generateDeck = (): CardType[] => {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck: CardType[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank } as CardType);
      }
    }

    return deck;
  };

  const shuffleDeck = (deck: CardType[]): CardType[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const acceptChallenge = async () => {
    try {
      setShowChallenge(false);
      await initializeGame();
      await new Promise(resolve => setTimeout(resolve, 100));
      await startGame();
    } catch (error) {
      console.error("Error during game initialization:", error);
      toast.error("Failed to start game");
    }
  };

  const declineChallenge = () => {
    setShowChallenge(false);
    toast.info("Challenge declined");
  };

  const handlePlayerAction = async (action: TurnAction) => {
    if (!gameState || gameState.currentPlayer !== "player1" || gameState.ended) return;
  
    try {
      const { type, amount } = action;
      
      setGameState((prev) => {
        if (!prev) return null;
        
        let newPot = prev.pot;
        let playerChips = prev.players[0].chips;
        let currentBet = prev.currentBet || 0;
        let lastRaise = prev.lastRaise || 0;
        
        if (type === "fold") {
          return {
            ...prev,
            ended: true,
            winner: "ai",
            currentPlayer: "",
            aiAgent: {
              ...prev.aiAgent,
              chips: prev.aiAgent.chips + newPot,
              thinking: false
            },
            actions: [...prev.actions, {
              type,
              player: "player1",
              timestamp: Date.now()
            }]
          };
        } else if (type === "check") {
          if (currentBet > 0) {
            console.error("Cannot check when there's an active bet");
            return prev;
          }
        } else if (type === "call") {
          const callAmount = Math.min(currentBet, playerChips);
          newPot += callAmount;
          playerChips -= callAmount;
        } else if (type === "raise" && amount) {
          if (amount < currentBet * 2 && amount < playerChips) {
            console.error("Raise must be at least double the current bet");
            return prev;
          }
          
          newPot += amount;
          playerChips -= amount;
          currentBet = amount;
          lastRaise = amount - (prev.currentBet || 0);
        } else if (type === "all-in") {
          const allInAmount = playerChips;
          newPot += allInAmount;
          currentBet = Math.max(currentBet, allInAmount);
          if (allInAmount > currentBet) {
            lastRaise = allInAmount - currentBet;
          }
          playerChips = 0;
        }
        
        return {
          ...prev,
          players: [{
            ...prev.players[0],
            chips: playerChips
          }],
          pot: newPot,
          currentPlayer: "ai",
          currentBet,
          lastRaise,
          aiAgent: {
            ...prev.aiAgent,
            thinking: true
          },
          actions: [...prev.actions, {
            type,
            amount: amount || (type === "all-in" ? playerChips : undefined),
            player: "player1",
            timestamp: Date.now()
          }]
        };
      });
    } catch (error) {
      console.error("Error during player action:", error);
    }
  };

  const handleAITurn = async () => {
    // if (!gameState || gameState.currentPlayer !== "ai" || gameState.ended) {
    //   setWaitingForAi(false);
    //   setAiThought(null);
    //   return;
    // }

    console.log("handleAiTurn tak aaya kya")
  
    try {
      const gameInfo = {
        pot: gameState.pot,
        round: gameState.round,
        communityCards: gameState.communityCards,
        aiCards: gameState.aiAgent.cards.map(card => ({ ...card, hidden: false })),
        aiChips: gameState.aiAgent.chips,
        playerChips: gameState.players[0].chips,
        actions: gameState.actions,
      };
  
      const decision = await getAiDecision(gameInfo);
      // Display AI thought before action
      setAiThought(`${decision.action.toUpperCase()}${decision.amount ? ` $${decision.amount}` : ''} (${Math.round(decision.confidence * 100)}% confident)${decision.reasoning ? `\nReasoning: ${decision.reasoning}` : ''}`);
      
      // Add a delay to show the thought bubble
      await new Promise(resolve => setTimeout(resolve, 2000));
      await processAIAction(decision.action, decision.amount);
    } catch (error) {
      console.error("Error getting AI decision:", error);
      setAiThought("Hmm, let me think...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      simulateAIAction();
    } finally {
      setTimeout(() => {
        setWaitingForAi(false);
        setAiThought(null);
      }, 1000);
    }
  };

  const processAIAction = (
    aiAction: "fold" | "check" | "call" | "raise" | "all-in",
    actionAmount: number = 0
  ) => {
    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return null;

      let newPot = prev.pot;
      let aiChips = prev.aiAgent.chips;
      let currentBet = prev.currentBet || 0;
      let lastRaise = prev.lastRaise || 0;

      if (aiAction === "fold") {
        if (prev.aiAgent.walletAddress && prev.pot > 0) {
          performTransaction(prev.pot, "Poker pot transfer - AI folded");
        }
        return {
          ...prev,
          ended: true,
          winner: "player1",
          pot: 0,
          currentPlayer: "",
          players: [
            {
              ...prev.players[0],
              chips: prev.players[0].chips + prev.pot,
            },
          ],
          aiAgent: {
            ...prev.aiAgent,
            thinking: false
          },
          actions: [...prev.actions, {
            type: aiAction,
            player: "ai",
            timestamp: Date.now()
          }]
        };
      }

      if (aiAction === "check") {
        if (currentBet > 0) {
          console.error("AI cannot check when there's an active bet");
          aiAction = "call";
          actionAmount = currentBet;
        }
      }

      if (aiAction === "call") {
        const callAmount = Math.min(currentBet, aiChips);
        newPot += callAmount;
        aiChips -= callAmount;
      } else if (aiAction === "raise") {
        if (actionAmount < currentBet * 2 && actionAmount < aiChips) {
          actionAmount = currentBet * 2;
        }
        
        if (actionAmount > aiChips) {
          actionAmount = aiChips;
          aiAction = "all-in";
        }
        
        newPot += actionAmount;
        aiChips -= actionAmount;
        currentBet = actionAmount;
        lastRaise = actionAmount - (prev.currentBet || 0);
      } else if (aiAction === "all-in") {
        const allInAmount = aiChips;
        newPot += allInAmount;
        actionAmount = allInAmount;
        
        if (allInAmount > currentBet) {
          currentBet = allInAmount;
          lastRaise = allInAmount - (prev.currentBet || 0);
        }
        
        aiChips = 0;
      }

      const newAction: GameAction = {
        type: aiAction,
        amount: actionAmount > 0 ? actionAmount : undefined,
        player: "ai",
        timestamp: Date.now(),
      };

      // Check if both players have acted and it's time to advance the round
      const lastPlayerAction = prev.actions.filter(a => a.player === "player1").pop();
      const lastAiAction = prev.actions.filter(a => a.player === "ai" && a.type !== "blind").pop();
      
      const bothPlayersActed = 
        lastPlayerAction && 
        (lastAiAction || aiAction === "check" || aiAction === "call");
      
      const playerHasChecked = lastPlayerAction?.type === "check";
      const aiHasChecked = aiAction === "check";
      const playerHasCalled = lastPlayerAction?.type === "call";
      const aiHasCalled = aiAction === "call";
      
      const roundComplete = 
        (playerHasChecked && aiHasChecked) || 
        (playerHasCalled && (aiHasChecked || aiHasCalled)) ||
        (aiHasCalled && playerHasChecked);

      let nextRound = prev.round;
      let newCommunityCards = [...prev.communityCards];
      let remainingDeck = [...(prev.deck || [])];

      if (bothPlayersActed && roundComplete) {
        nextRound = determineNextRound(prev.round);
        currentBet = 0; // Reset current bet for new round
        
        if (nextRound !== prev.round) {
          console.log(`Advancing from ${prev.round} to ${nextRound}`);
          switch (nextRound) {
            case "flop":
              newCommunityCards = remainingDeck.splice(-3).reverse();
              toast.info("Dealing the flop!");
              break;
            case "turn":
              newCommunityCards = [...prev.communityCards, remainingDeck.pop()!];
              toast.info("Dealing the turn!");
              break;
            case "river":
              newCommunityCards = [...prev.communityCards, remainingDeck.pop()!];
              toast.info("Dealing the river!");
              break;
            case "showdown":
              toast.info("Showdown! Revealing cards...");
              return handleShowdown(prev, newAction, aiChips);
          }
        }
      }

      return {
        ...prev,
        aiAgent: {
          ...prev.aiAgent,
          chips: aiChips,
          thinking: false,
        },
        pot: newPot,
        communityCards: newCommunityCards,
        currentPlayer: "player1",
        currentBet,
        lastRaise,
        round: nextRound,
        actions: [...prev.actions, newAction],
        deck: remainingDeck,
      };
    });
  };
  
  const handleShowdown = (prevState: GameState, lastAction: GameAction, finalAiChips: number) => {
    const updatedAICards = prevState.aiAgent.cards.map(card => ({ ...card, hidden: false }));
    const playerHand = evaluateHand([...prevState.players[0].cards, ...prevState.communityCards]);
    const aiHand = evaluateHand([...updatedAICards, ...prevState.communityCards]);

    let winner;
    if (playerHand.rank > aiHand.rank) winner = "player1";
    else if (aiHand.rank > playerHand.rank) winner = "ai";
    else winner = playerHand.highCard > aiHand.highCard ? "player1" : 
                 aiHand.highCard > playerHand.highCard ? "ai" : null;

    const finalPot = prevState.pot;
    let updatedPlayerChips = prevState.players[0].chips;
    let updatedAIChips = finalAiChips;

    if (winner === "player1") {
      updatedPlayerChips += finalPot;
      if (prevState.aiAgent.walletAddress && finalPot > 0) {
        performTransaction(finalPot, "Poker pot transfer - Player won");
      }
      toast.success(`You won with ${playerHand.name}!`);
    } else if (winner === "ai") {
      updatedAIChips += finalPot;
      toast.error(`AI won with ${aiHand.name}!`);
    } else {
      const halfPot = Math.floor(finalPot / 2);
      updatedPlayerChips += halfPot;
      updatedAIChips += finalPot - halfPot;
      toast.info("It's a tie! Pot split.");
    }

    return {
      ...prevState,
      players: [{
        ...prevState.players[0],
        chips: updatedPlayerChips,
      }],
      aiAgent: {
        ...prevState.aiAgent,
        cards: updatedAICards,
        chips: updatedAIChips,
        thinking: false,
      },
      pot: 0,
      actions: [...prevState.actions, lastAction],
      round: "showdown",
      ended: true,
      winner,
      currentPlayer: "",
      handEvaluations: { player: playerHand, ai: aiHand },
    };
  };

  const simulateAIAction = () => {
    if (!gameState) return;

    const actions = ["fold", "check", "call", "raise", "all-in"];
    const weights = [0.1, 0.3, 0.3, 0.2, 0.1];
    let random = Math.random();
    let actionIndex = 0;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        actionIndex = i;
        break;
      }
    }

    const lastPlayerAction = gameState.actions.slice().reverse().find(a => a.player === "player1");
    if (lastPlayerAction && 
        (lastPlayerAction.type === "raise" || lastPlayerAction.type === "all-in") && 
        actions[actionIndex] === "check") {
      actionIndex = 2;  // Call index
    }

    const aiAction = actions[actionIndex] as "fold" | "check" | "call" | "raise" | "all-in";
    let actionAmount = 0;

    switch (aiAction) {
      case "call":
        const lastBet = gameState.actions.slice().reverse()
          .find(a => a.type === "raise" || a.type === "call");
        actionAmount = lastBet?.amount || 20;
        break;
      case "raise":
        actionAmount = 20 * (2 + Math.floor(Math.random() * 3));
        break;
      case "all-in":
        actionAmount = gameState.aiAgent.chips;
        break;
    }

    processAIAction(aiAction, actionAmount);
  };

  const determineNextRound = (currentRound: string): "preflop" | "flop" | "turn" | "river" | "showdown" => {
    switch (currentRound) {
      case "preflop": return "flop";
      case "flop": return "turn";
      case "turn": return "river";
      case "river": return "showdown";
      default: return currentRound as "preflop" | "flop" | "turn" | "river" | "showdown";
    }
  };

  const startNewHand = async () => {
    await initializeGame();
    await new Promise(resolve => setTimeout(resolve, 100));
    await startGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900/50">
      <Header />
      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          {showChallenge && !connected && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background p-8 rounded-xl max-w-md mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Connect Wallet to Play</h2>
                <p className="text-gray-400 mb-6">
                  Please connect your wallet to start playing. You need a minimum of 0.1 APT to join the game.
                </p>
                <ConnectWallet />
              </div>
            </div>
          )}

          {showChallenge && (
            <ChallengeDialog
              onAccept={acceptChallenge}
              onDecline={declineChallenge}
            />
          )}

          {!showChallenge && !gameState && (
            <div className="flex flex-col items-center gap-8 p-8 bg-poker-dark rounded-xl border border-gray-800 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center">PokerMind Challenge</h2>
              <p className="text-center text-gray-300">
                Play against an AI opponent powered by blockchain technology!
              </p>
              <div className="flex gap-4 mt-4">
                <Button size="lg" onClick={() => initializeGame().then(startGame)} className="min-w-32">
                  <PlayIcon className="mr-2" />
                  Start Game
                </Button>
                <Button variant="outline" size="lg" onClick={() => setShowCardPreview(true)} className="min-w-32">
                  Preview Cards
                </Button>
              </div>
            </div>
          )}

          {showCardPreview && <CardPreview onClose={() => setShowCardPreview(false)} />}

          {gameState && (
            <>
              <div className="w-full max-w-4xl mb-6">
                {gameState.aiAgent.walletAddress && (
                  <div className="bg-poker-dark rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">AI Wallet Details</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                        Details <ChevronDownIcon className={`ml-1 transform ${showDetails ? "rotate-180" : ""}`} />
                      </Button>
                    </div>
                    {showDetails && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Wallet Address:</span>
                          <span className="font-mono text-xs truncate max-w-xs">
                            {gameState.aiAgent.walletAddress}
                            <a
                              href={`https://explorer.aptoslabs.com/account/${gameState.aiAgent.walletAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLinkIcon size={14} />
                            </a>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Blockchain Balance:</span>
                          <span className="font-medium">{walletBalance || "0"} APT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Game Chips:</span>
                          <span className="font-medium">{gameState.aiAgent.chips} chips</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {gameState.ended && (
                  <div className="mt-4 mb-6">
                    <button onClick={startNewHand} className="poker-button-primary">
                      Play Another Hand
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full max-w-full rounded-xl shadow-xl border border-gray-800">
                <PokerTable
                  gameState={gameState}
                  onAction={handlePlayerAction}
                  isProcessing={waitingForAi || isProcessing}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {process.env.NODE_ENV === 'development' && (
        <DebugPanel gameState={gameState} />
      )}
    </div>
  );
};

export default Game;