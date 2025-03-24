
import { useState, useEffect } from 'react';
import { Card as CardType } from '@/lib/types';

interface CardProps {
  card?: CardType;
  hidden?: boolean;
  revealed?: boolean;
  className?: string;
  delay?: number;
}

const Card = ({ card, hidden = false, revealed = false, className = '', delay = 0 }: CardProps) => {
  const [isFlipped, setIsFlipped] = useState(hidden);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (revealed && hidden) {
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [revealed, hidden]);

  if (!card) {
    return (
      <div 
        className={`playing-card bg-gray-800/30 border border-gray-700/30 animate-pulse ${className} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: `${delay}ms` }}
      ></div>
    );
  }

  const { suit, rank } = card;
  
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const cardColor = isRed ? 'text-red-600' : 'text-gray-200';
  
  // Get suit symbol
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const suitSymbol = getSuitSymbol(suit);

  return (
    <div 
      className={`playing-card ${isFlipped ? 'flipped' : ''} ${className} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="playing-card-front bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className={`p-1 flex justify-between items-start ${cardColor}`}>
          <div className="text-sm font-bold">{rank}</div>
          <div className="text-sm">{suitSymbol}</div>
        </div>
        <div className={`flex-grow flex items-center justify-center text-2xl ${cardColor}`}>
          {suitSymbol}
        </div>
        <div className={`p-1 flex justify-between items-end rotate-180 ${cardColor}`}>
          <div className="text-sm font-bold">{rank}</div>
          <div className="text-sm">{suitSymbol}</div>
        </div>
      </div>
      <div className="playing-card-back bg-gradient-to-br from-poker-purple to-poker-blue rounded-md border border-blue-800 flex items-center justify-center">
        <div className="text-white text-xl font-bold tracking-wider">PM</div>
      </div>
    </div>
  );
};

export default Card;
