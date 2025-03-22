
import { useState, useEffect } from 'react';
import { Player as PlayerType, AIAgent as AIAgentType, Card as CardType, GameAction, GameState } from '@/lib/types';
import AIAgent from './AIAgent';
import Card from './Card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface PokerTableProps {
  gameState: GameState;
  onAction: (action: Omit<GameAction, 'timestamp' | 'player'>) => Promise<void>;
  isProcessing: boolean;
}

const PokerTable = ({ gameState, onAction }: PokerTableProps) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [isRaising, setIsRaising] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  
  const { pot, communityCards, players, aiAgent, currentPlayer, round, actions } = gameState;
  
  const humanPlayer = players[0];
  
  const isPlayerTurn = currentPlayer === humanPlayer.id;
  
  const lastAction = actions.length > 0 ? actions[actions.length - 1] : null;
  
  useEffect(() => {
    if (lastAction && (lastAction.type === 'raise' || lastAction.type === 'call') && lastAction.amount) {
      setCurrentBet(lastAction.amount);
      setRaiseAmount(lastAction.amount * 2);
    } else {
      setCurrentBet(0);
      setRaiseAmount(20);
    }
  }, [lastAction]);
  
  const handleFold = () => {
    onAction({ type: 'fold' });
    toast.info("You folded your hand");
  };
  
  const handleCheckCall = () => {
    if (currentBet === 0) {
      onAction({ type: 'check' });
      toast.info("You checked");
    } else {
      onAction({ type: 'call', amount: currentBet });
      toast.info(`You called ${currentBet} chips`);
    }
  };
  
  const handleRaise = () => {
    if (isRaising) {
      onAction({ type: 'raise', amount: raiseAmount });
      toast.info(`You raised to ${raiseAmount} chips`);
      setIsRaising(false);
    } else {
      setIsRaising(true);
    }
  };
  
  const handleAllIn = () => {
    onAction({ type: 'all-in', amount: humanPlayer.chips });
    toast.info(`You're all in with ${humanPlayer.chips} chips!`);
  };
  
  const cancelRaise = () => {
    setIsRaising(false);
  };
  
  const getCheckCallLabel = () => {
    if (currentBet === 0) return 'Check';
    return `Call ${currentBet}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <AIAgent agent={aiAgent} isActive={currentPlayer === aiAgent.id} />
      </div>
      
      <div className="relative w-full max-w-3xl h-64 md:h-80 bg-poker-felt rounded-full flex flex-col items-center justify-center shadow-xl border-8 border-poker-dark/80">
        <div className="absolute top-6 md:top-8 text-white">
          <div className="text-sm opacity-80">Pot</div>
          <div className="text-xl md:text-2xl font-bold">{pot} chips</div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-md">
          {communityCards.map((card, index) => (
            <Card 
              key={index} 
              card={card} 
              className="w-12 h-18 md:w-16 md:h-24" 
              delay={index * 200}
            />
          ))}
          
          {Array(5 - communityCards.length).fill(0).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="w-12 h-18 md:w-16 md:h-24 rounded-md border border-white/10 bg-white/5"
            ></div>
          ))}
        </div>
        
        <div className="absolute bottom-5 md:bottom-8 text-white/80 text-sm md:text-base tracking-wider uppercase">
          {round}
        </div>
      </div>
      
      <div className="mt-8 w-full flex flex-col items-center">
        <div className="flex gap-2 justify-center mb-6">
          {humanPlayer.cards.map((card, index) => (
            <Card 
              key={index} 
              card={card} 
              className="w-16 h-24 md:w-20 md:h-30" 
              delay={index * 200}
            />
          ))}
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Your Chips</div>
            <div className="text-xl font-bold">{humanPlayer.chips}</div>
          </div>
          
          {isPlayerTurn && (
            <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium">Your Turn</span>
            </div>
          )}
        </div>
        
        <div className={`flex flex-wrap justify-center gap-3 transition-opacity duration-300 ${isPlayerTurn ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          {!isRaising ? (
            <>
              <Button 
                variant="destructive" 
                onClick={handleFold}
                className="min-w-24"
              >
                Fold
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={handleCheckCall}
                className="min-w-24"
              >
                {getCheckCallLabel()}
              </Button>
              
              <Button 
                variant="default" 
                onClick={handleRaise}
                className="min-w-24"
                disabled={humanPlayer.chips <= currentBet}
              >
                Raise
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleAllIn}
                className="min-w-24 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600"
              >
                All In
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-md bg-gray-800/50 p-4 rounded-lg animate-fade-in">
              <div className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>Min: {currentBet * 2}</span>
                  <span>Max: {humanPlayer.chips}</span>
                </div>
                <input 
                  type="range" 
                  min={currentBet * 2} 
                  max={humanPlayer.chips} 
                  value={raiseAmount} 
                  onChange={(e) => setRaiseAmount(parseInt(e.target.value))} 
                  className="w-full"
                />
                <div className="text-center text-lg font-semibold mt-1">
                  {raiseAmount} chips
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={cancelRaise}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleRaise}
                >
                  Confirm Raise
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokerTable;
