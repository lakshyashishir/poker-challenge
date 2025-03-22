import { useState, useEffect, useCallback } from 'react';
import { Card, GameAction } from '@/lib/types';

interface GameInfo {
  pot: number;
  round: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  communityCards: Card[];
  aiCards: Card[];
  aiChips: number;
  playerChips: number;
  actions: GameAction[];
}

interface AiDecision {
  action: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount?: number;
  confidence: number;
  reasoning?: string;
}

export const useAiAgent = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const response = await fetch('/api/agent/connect', {
          method: 'POST',
        });
        const data = await response.json();
        
        if (data.address) {
          setWalletAddress(data.address);
          setWalletBalance(data.balance);
        }
      } catch (error) {
        console.error('Failed to initialize agent:', error);
      }
    };

    initializeAgent();
  }, []);

  const getWalletBalance = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch('/api/agent/balance', {
        method: 'GET',
      });
      const data = await response.json();
      
      if (data.balance) {
        setWalletBalance(data.balance);
        return data.balance;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return 0;
    }
  }, []);

  const getAiDecision = useCallback(async (gameInfo: GameInfo): Promise<AiDecision> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/agent/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameInfo),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI decision');
      }
      
      const decision = await response.json();
      return decision;
    } catch (error) {
      console.error('Error getting AI decision:', error);
      return createFallbackDecision(gameInfo);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const performTransaction = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/agent/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, reason }),
      });
      
      if (!response.ok) {
        throw new Error('Transaction failed');
      }
      
      const result = await response.json();
      
      await getWalletBalance();
      return result.success;
    } catch (error) {
      console.error('Error performing transaction:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [getWalletBalance]);

  const createFallbackDecision = (gameInfo: GameInfo): AiDecision => {
    const { round, pot, aiChips, playerChips, actions } = gameInfo;
    
    const lastPlayerAction = [...actions].reverse().find(a => a.player === 'player1');
    
    let action: 'fold' | 'check' | 'call' | 'raise' | 'all-in' = 'check';
    let amount = 0;
    let confidence = 0.5;
    
    if (lastPlayerAction && (lastPlayerAction.type === 'raise' || lastPlayerAction.type === 'all-in')) {
      const randomFactor = Math.random();
      
      if (randomFactor < 0.2) {
        action = 'fold';
        confidence = 0.7;
      } else if (randomFactor < 0.7) {
        action = 'call';
        amount = lastPlayerAction.amount || 20;
        confidence = 0.6;
      } else {
        action = 'raise';
        amount = (lastPlayerAction.amount || 20) * 2;
        amount = Math.min(amount, aiChips);
        confidence = 0.8;
      }
    } else if (round === 'turn' || round === 'river') {
      const randomFactor = Math.random();
      
      if (randomFactor < 0.6) {
        action = 'check';
        confidence = 0.5;
      } else {
        action = 'raise';
        amount = Math.max(20, Math.floor(pot * 0.3));
        amount = Math.min(amount, aiChips);
        confidence = 0.6;
      }
    }
    
    if (aiChips <= 50 || (round === 'river' && Math.random() < 0.1)) {
      action = 'all-in';
      amount = aiChips;
      confidence = 0.9;
    }
    
    return {
      action,
      amount: amount > 0 ? amount : undefined,
      confidence,
      reasoning: 'Fallback decision due to AI agent unavailability'
    };
  };

  return {
    walletAddress,
    walletBalance,
    isProcessing,
    getWalletBalance,
    getAiDecision,
    performTransaction
  };
};