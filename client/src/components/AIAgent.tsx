
import { useState, useEffect } from 'react';
import { Brain, MessageCircle } from 'lucide-react';
import { AIAgent as AIAgentType } from '@/lib/types';
import Card from './Card';

interface AIAgentProps {
  agent: AIAgentType;
  isActive?: boolean;
}

const AIAgent = ({ agent, isActive = false }: AIAgentProps) => {
  const [showThinking, setShowThinking] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isActive && agent.thinking) {
      setShowThinking(true);
      const thinkingTime = 1500 + Math.random() * 2000;
      
      const timer = setTimeout(() => {
        setShowThinking(false);
        
        let actionMessage = '';
        switch(agent.lastAction?.type) {
          case 'fold':
            actionMessage = "I fold.";
            break;
          case 'check':
            actionMessage = "I'll check.";
            break;
          case 'call':
            actionMessage = `I call ${agent.lastAction.amount} chips.`;
            break;
          case 'raise':
            actionMessage = `I raise to ${agent.lastAction.amount} chips.`;
            break;
          case 'all-in':
            actionMessage = "All in!";
            break;
          default:
            actionMessage = "Let me think...";
        }
        
        setMessage(actionMessage);
        setShowMessage(true);
        
        const messageTimer = setTimeout(() => {
          setShowMessage(false);
        }, 3000);
        
        return () => clearTimeout(messageTimer);
      }, thinkingTime);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, agent.thinking, agent.lastAction]);

  return (
    <div className={`relative flex flex-col items-center ${isActive ? 'scale-105 transition-transform' : ''}`}>
      <div className={`
        w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-accent to-indigo-500 
        flex items-center justify-center shadow-lg
        ${isActive ? 'ring-4 ring-blue-400' : ''}
      `}>
        <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
      
      <div className="mt-2 text-center">
        <div className="font-medium text-sm sm:text-base">{agent.name}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">{agent.chips} chips</div>
      </div>
      
      <div className="mt-4 flex space-x-1">
        {agent.cards.map((card, index) => (
          <Card 
            key={index} 
            card={card} 
            hidden={card.hidden} 
            className="w-10 h-15 sm:w-14 sm:h-20" 
          />
        ))}
      </div>
      
      {showThinking && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-full px-3 py-1 animate-fade-in">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-thinking"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-thinking" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-thinking" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      
      {showMessage && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg px-4 py-2 shadow-lg animate-fade-in flex items-center gap-2 min-w-40 max-w-48">
          <MessageCircle className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="text-sm">{message}</span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      )}
      
      {agent.confidence !== undefined && (
        <div className="mt-2 w-full max-w-24 bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-accent h-1.5 rounded-full" 
            style={{ width: `${agent.confidence * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default AIAgent;
