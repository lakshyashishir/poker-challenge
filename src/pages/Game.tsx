import { useState, useEffect } from "react";
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
  const [showChallenge, setShowChallenge] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [waitingForAi, setWaitingForAi] = useState(false);

  const {
    getAiDecision,
    getWalletBalance,
    walletAddress,
    walletBalance,
    performTransaction,
    isProcessing,
  } = useAiAgent();

  // const initializeGame = async () => {
  //   try {
  //     const balance = await getWalletBalance();
      
  //     console.log("Initializing game with balance:", balance);

  //     const initialGameState: GameState = {
  //       id: Math.random().toString(36).substring(2, 9),
  //       players: [
  //         {
  //           id: "player1",
  //           name: "You",
  //           chips: 1000,
  //           cards: [],
  //         },
  //       ],
  //       aiAgent: {
  //         id: "ai",
  //         name: "PokerMind AI",
  //         chips: balance || 1000,
  //         cards: [],
  //         thinking: false,
  //         walletAddress: walletAddress,
  //       },
  //       communityCards: [],
  //       pot: 0,
  //       currentPlayer: "",
  //       round: "preflop",
  //       actions: [],
  //       started: false,
  //       ended: false,
  //     };

  //     setGameState(initialGameState);
  //     toast.success("Connected to AI wallet on Aptos blockchain!");
  //   } catch (error) {
  //     console.error("Failed to initialize game:", error);
  //     toast.error("Failed to connect to blockchain. Using demo mode.");

  //     const demoGameState: GameState = {
  //       id: Math.random().toString(36).substring(2, 9),
  //       players: [
  //         {
  //           id: "player1",
  //           name: "You",
  //           chips: 1000,
  //           cards: [],
  //         },
  //       ],
  //       aiAgent: {
  //         id: "ai",
  //         name: "PokerMind AI (Demo)",
  //         chips: 1000,
  //         cards: [],
  //         thinking: false,
  //       },
  //       communityCards: [],
  //       pot: 0,
  //       currentPlayer: "",
  //       round: "preflop",
  //       actions: [],
  //       started: false,
  //       ended: false,
  //     };

  //     setGameState(demoGameState);
  //   }
  // };

  const initializeGame = async () => {
    const demoGameState: GameState = {
      id: Math.random().toString(36).substring(2, 9),
      players: [{ id: "player1", name: "You", chips: 1000, cards: [] }],
      aiAgent: { id: "ai", name: "PokerMind AI (Demo)", chips: 1000, cards: [], thinking: false },
      communityCards: [],
      pot: 0,
      currentPlayer: "",
      round: "preflop",
      actions: [],
      started: false,
      ended: false,
    };
    setGameState(demoGameState);
    toast.info("Using demo mode");
  };
  const startGame = () => {
    if (!gameState) return;
    
    console.log("Starting game...");
    
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
      
      console.log("Setting initial game state with blinds");
      
      return {
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
          thinking: false // Ensure AI isn't thinking initially
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
        round: 'preflop'
      };
    });
    
    toast.success("Game started! You have the big blind.");
  };

  const generateDeck = (): CardType[] => {
    const suits: ("hearts" | "diamonds" | "clubs" | "spades")[] = [
      "hearts",
      "diamonds",
      "clubs",
      "spades",
    ];
    const ranks: (
      | "2"
      | "3"
      | "4"
      | "5"
      | "6"
      | "7"
      | "8"
      | "9"
      | "10"
      | "J"
      | "Q"
      | "K"
      | "A"
    )[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    const deck: CardType[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
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
    setShowChallenge(false);
    await initializeGame();
    startGame();
  };

  const declineChallenge = () => {
    setShowChallenge(false);
    toast.info("Challenge declined");
  };

  const handlePlayerAction = async (action: TurnAction) => {
    if (!gameState) return;

    const { type, amount } = action;

    setGameState((prev) => {
      if (!prev) return null;

      let newPot = prev.pot;
      let playerChips = prev.players[0].chips;

      if (type === "fold") {
        return {
          ...prev,
          ended: true,
          winner: "ai",
        };
      } else if (type === "check") {
      } else if (type === "call") {
        if (amount) {
          newPot += amount;
          playerChips -= amount;
        }
      } else if (type === "raise") {
        if (amount) {
          newPot += amount;
          playerChips -= amount;
        }
      } else if (type === "all-in") {
        newPot += playerChips;
        playerChips = 0;
      }

      const newAction: GameAction = {
        type,
        amount,
        player: "player1",
        timestamp: Date.now(),
      };

      const updatedPlayers = [
        {
          ...prev.players[0],
          chips: playerChips,
        },
      ];

      const playersActedInRound = prev.actions.filter(
        (a) =>
          a.type !== "blind" && (a.player === "player1" || a.player === "ai")
      ).length;
      const totalNonBlindActions =
        prev.actions.filter((a) => a.type !== "blind").length + 1;
      const shouldAdvanceRound =
        totalNonBlindActions % 2 == 0 && (type === "check" || type === "call");

      let nextRound = prev.round;
      let newCommunityCards = [...prev.communityCards];
      let remainingDeck = [...(prev.deck || [])];

      if (shouldAdvanceRound) {
        nextRound = determineNextRound(prev.round);

        if (nextRound !== prev.round && remainingDeck.length > 0) {
          switch (nextRound) {
            case "flop":
              newCommunityCards = [
                remainingDeck.pop()!,
                remainingDeck.pop()!,
                remainingDeck.pop()!,
              ];
              break;
            case "turn":
              newCommunityCards = [
                ...prev.communityCards,
                remainingDeck.pop()!,
              ];
              break;
            case "river":
              newCommunityCards = [
                ...prev.communityCards,
                remainingDeck.pop()!,
              ];
              break;
            case "showdown":
              break;
            default:
              break;
          }
        }
      }

      return {
        ...prev,
        players: updatedPlayers,
        pot: newPot,
        communityCards: newCommunityCards,
        currentPlayer: "ai",
        round: nextRound,
        actions: [...prev.actions, newAction],
        aiAgent: {
          ...prev.aiAgent,
          thinking: true,
        },
        deck: remainingDeck,
      };
    });

    setWaitingForAi(true);
    await handleAITurn();
  };

  const handleAITurn = async () => {
    // if (!gameState) return;

    try {
      //   const gameInfo = {
      //     pot: gameState.pot,
      //     round: gameState.round,
      //     communityCards: gameState.communityCards,
      //     aiCards: gameState.aiAgent.cards,
      //     aiChips: gameState.aiAgent.chips,
      //     playerChips: gameState.players[0].chips,
      //     actions: gameState.actions,
      //   };

      //   const decision = await getAiDecision(gameInfo);

      //   processAIAction(decision.action, decision.amount);
      processAIAction("call", 10);
    } catch (error) {
      console.error("Error getting AI decision:", error);
      simulateAIAction();
    }
  };

  const processAIAction = (
    aiAction: "fold" | "check" | "call" | "raise" | "all-in",
    actionAmount: number = 0
  ) => {
    setWaitingForAi(false);

    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return null;

      let newPot = prev.pot;
      let aiChips = prev.aiAgent.chips;

      if (aiAction === "fold") {
        toast.success("AI folded! You win the pot.");

        if (prev.aiAgent.walletAddress && prev.pot > 0) {
          performTransaction(prev.pot, "Poker pot transfer - AI folded");
        }

        return {
          ...prev,
          aiAgent: {
            ...prev.aiAgent,
            thinking: false,
            lastAction: {
              type: aiAction,
              player: "ai",
              timestamp: Date.now(),
            },
          },
          ended: true,
          winner: "player1",
          players: [
            {
              ...prev.players[0],
              chips: prev.players[0].chips + prev.pot,
            },
          ],
          pot: 0,
          actions: [
            ...prev.actions,
            {
              type: aiAction,
              player: "ai",
              timestamp: Date.now(),
            },
          ],
        };
      } else if (aiAction === "check") {
      } else if (aiAction === "call") {
        newPot += actionAmount;
        aiChips -= actionAmount;
      } else if (aiAction === "raise") {
        newPot += actionAmount;
        aiChips -= actionAmount;
      } else if (aiAction === "all-in") {
        newPot += aiChips;
        actionAmount = aiChips;
        aiChips = 0;
      }

      const newAction: GameAction = {
        type: aiAction,
        amount: actionAmount > 0 ? actionAmount : undefined,
        player: "ai",
        timestamp: Date.now(),
      };

      const playersActedInRound =
        prev.actions.filter(
          (a) =>
            a.type !== "blind" && (a.player === "player1" || a.player === "ai")
        ).length + 1;

      const totalNonBlindActions =
        prev.actions.filter((a) => a.type !== "blind").length + 1;
      const shouldAdvanceRound =
        totalNonBlindActions % 2 == 0 &&
        (aiAction === "check" || aiAction === "call");

      let nextRound = prev.round;
      let newCommunityCards = [...prev.communityCards];
      let remainingDeck = [...(prev.deck || [])];

      if (shouldAdvanceRound) {
        nextRound = determineNextRound(prev.round);

        if (nextRound !== prev.round && remainingDeck.length > 0) {
          switch (nextRound) {
            case "flop":
              newCommunityCards = [
                remainingDeck.pop()!,
                remainingDeck.pop()!,
                remainingDeck.pop()!,
              ];
              break;
            case "turn":
              newCommunityCards = [
                ...prev.communityCards,
                remainingDeck.pop()!,
              ];
              break;
            case "river":
              newCommunityCards = [
                ...prev.communityCards,
                remainingDeck.pop()!,
              ];
              break;
            case "showdown":
              const updatedAICards = prev.aiAgent.cards.map((card) => ({
                ...card,
                hidden: false,
              }));

              const playerHand = evaluateHand([
                ...prev.players[0].cards,
                ...prev.communityCards,
              ]);
              const aiHand = evaluateHand([
                ...updatedAICards,
                ...prev.communityCards,
              ]);

              let winner;
              if (playerHand.rank > aiHand.rank) {
                winner = "player1";
              } else if (aiHand.rank > playerHand.rank) {
                winner = "ai";
              } else {
                if (playerHand.highCard > aiHand.highCard) {
                  winner = "player1";
                } else if (aiHand.highCard > playerHand.highCard) {
                  winner = "ai";
                } else {
                  winner = null;
                }
              }

              let updatedPlayerChips = prev.players[0].chips;
              let updatedAIChips = aiChips;

              if (winner === "player1") {
                updatedPlayerChips += newPot;
                toast.success(`You won with ${playerHand.name}!`);

                if (prev.aiAgent.walletAddress && newPot > 0) {
                  performTransaction(newPot, "Poker pot transfer - Player won");
                }
              } else if (winner === "ai") {
                updatedAIChips += newPot;
                toast.error(`AI won with ${aiHand.name}!`);
              } else {
                const halfPot = Math.floor(newPot / 2);
                updatedPlayerChips += halfPot;
                updatedAIChips += newPot - halfPot;
                toast.info("It's a tie! Pot split.");
              }

              return {
                ...prev,
                players: [
                  {
                    ...prev.players[0],
                    chips: updatedPlayerChips,
                  },
                ],
                aiAgent: {
                  ...prev.aiAgent,
                  cards: updatedAICards,
                  chips: updatedAIChips,
                  thinking: false,
                  lastAction: newAction,
                },
                pot: 0,
                communityCards: newCommunityCards,
                actions: [...prev.actions, newAction],
                round: nextRound,
                ended: true,
                winner,
                currentPlayer: "",
                handEvaluations: {
                  player: playerHand,
                  ai: aiHand,
                },
                deck: remainingDeck,
              };
            default:
              break;
          }
        }
      }

      return {
        ...prev,
        aiAgent: {
          ...prev.aiAgent,
          chips: aiChips,
          thinking: false,
          lastAction: newAction,
          confidence: 0.3 + Math.random() * 0.7,
        },
        pot: newPot,
        communityCards: newCommunityCards,
        currentPlayer: "player1",
        round: nextRound,
        actions: [...prev.actions, newAction],
        deck: remainingDeck,
      };
    });
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

    const lastPlayerAction = gameState.actions
      .slice()
      .reverse()
      .find((a) => a.player === "player1");
    if (
      lastPlayerAction &&
      (lastPlayerAction.type === "raise" ||
        lastPlayerAction.type === "all-in") &&
      actions[actionIndex] === "check"
    ) {
      actionIndex = 2;
    }

    const aiAction = actions[actionIndex] as
      | "fold"
      | "check"
      | "call"
      | "raise"
      | "all-in";

    let actionAmount = 0;

    switch (aiAction) {
      case "call":
        const lastBet = gameState.actions
          .slice()
          .reverse()
          .find((a) => a.type === "raise" || a.type === "call");
        actionAmount = lastBet?.amount || 20;
        break;
      case "raise":
        actionAmount = 20 * (2 + Math.floor(Math.random() * 3));
        break;
      case "all-in":
        actionAmount = gameState.aiAgent.chips;
        break;
      default:
        actionAmount = 0;
    }

    processAIAction(aiAction, actionAmount);
  };

  const determineNextRound = (
    currentRound: string
  ): "preflop" | "flop" | "turn" | "river" | "showdown" => {
    switch (currentRound) {
      case "preflop":
        return "flop";
      case "flop":
        return "turn";
      case "turn":
        return "river";
      case "river":
        return "showdown";
      default:
        return currentRound as
          | "preflop"
          | "flop"
          | "turn"
          | "river"
          | "showdown";
    }
  };

  const startNewHand = () => {
    initializeGame();
    setTimeout(() => {
      startGame();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900/50">
      <Header />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto">
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          {showChallenge && (
            <ChallengeDialog
              onAccept={acceptChallenge}
              onDecline={declineChallenge}
            />
          )}

          {!showChallenge && !gameState && (
            <div className="flex flex-col items-center gap-8 p-8 bg-poker-dark rounded-xl border border-gray-800 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center">
                PokerMind Challenge
              </h2>
              <p className="text-center text-gray-300">
                Play against an AI opponent powered by blockchain technology!
              </p>

              <div className="flex gap-4 mt-4">
                <Button
                  size="lg"
                  onClick={() => initializeGame()}
                  className="min-w-32"
                >
                  <PlayIcon className="mr-2" />
                  Start Game
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowCardPreview(true)}
                  className="min-w-32"
                >
                  Preview Cards
                </Button>
              </div>
            </div>
          )}

          {showCardPreview && (
            <CardPreview onClose={() => setShowCardPreview(false)} />
          )}

          {gameState && (
            <>
              <div className="w-full max-w-4xl mb-6">
                {gameState.aiAgent.walletAddress && (
                  <div className="bg-poker-dark rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">
                        AI Wallet Details
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                      >
                        Details{" "}
                        <ChevronDownIcon
                          className={`ml-1 transform ${
                            showDetails ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>

                    {showDetails && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Wallet Address:</span>
                          <span className="font-mono text-xs truncate max-w-xs">
                            {gameState.aiAgent.walletAddress}
                            <a
                              href="https://explorer.aptoslabs.com/account/${gameState.aiAgent.walletAddress}"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLinkIcon size={14} />
                            </a>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Blockchain Balance:
                          </span>
                          <span className="font-medium">
                            {walletBalance || "0"} APT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Game Chips:</span>
                          <span className="font-medium">
                            {gameState.aiAgent.chips} chips
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {gameState.ended && (
                  <div className="mt-4 mb-6">
                    <button
                      onClick={startNewHand}
                      className="poker-button-primary"
                    >
                      Play Another Hand
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full max-w-full rounded-xl overflow-hidden shadow-xl border border-gray-800">
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

      {process.env.NODE_ENV === 'development' && <DebugPanel gameState={gameState} />}
    </div>
  );
};

export default Game;
