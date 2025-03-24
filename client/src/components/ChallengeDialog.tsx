
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Award, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChallengeDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

const ChallengeDialog = ({ onAccept, onDecline }: ChallengeDialogProps) => {
  const [seconds, setSeconds] = useState(10);
  const [animationStep, setAnimationStep] = useState(0);
  
  useEffect(() => {
    const stepTimer = setTimeout(() => {
      setAnimationStep(1);
    }, 100);
    
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(stepTimer);
    };
  }, []);
  
  useEffect(() => {
    if (seconds === 0) {
      onDecline();
      toast.error("Challenge time expired");
    }
  }, [seconds, onDecline]);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl animate-scale-in">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">AI Challenge</h2>
          <button 
            onClick={onDecline}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 py-6 flex flex-col items-center">
          <div className={`w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-opacity duration-500 ${animationStep >= 0 ? 'opacity-100' : 'opacity-0'}`}>
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
          
          <h3 className={`text-2xl font-bold mb-2 transition-opacity duration-500 delay-100 ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            Beat the AI
          </h3>
          
          <p className={`text-center text-muted-foreground mb-6 transition-opacity duration-500 delay-200 ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            Can you outsmart our advanced poker AI? Accept the challenge and test your skills against PokerChallenge's AI agent.
          </p>
          
          <div className={`flex items-center justify-center gap-4 mb-6 w-full transition-opacity duration-500 delay-300 ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">Win 1000 APT</span>
            </div>
            <div className="h-6 border-r border-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Entry: 50 APT</span>
            </div>
          </div>
          
          <div className={`w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-6 overflow-hidden transition-opacity duration-500 delay-400 ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-linear"
              style={{ width: `${(seconds / 10) * 100}%` }}
            ></div>
          </div>
          
          <div className={`flex gap-4 w-full transition-opacity duration-500 delay-500 ${animationStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              Decline
            </Button>
            <Button 
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all"
            >
              Accept Challenge ({seconds}s)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDialog;
