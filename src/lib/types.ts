
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  hidden?: boolean;
}
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  chips: number;
  cards: Card[];
}

export interface AIAgent extends Player {
  walletAddress?: string;
  thinking?: boolean;
  confidence?: number;
  lastAction?: GameAction;
}

export type GameAction = {
  type: 'fold' | 'check' | 'call' | 'raise' | 'all-in' | 'blind';
  amount?: number;
  player: string;
  timestamp: number;
};

export interface GameState {
  id: string;
  players: Player[];
  aiAgent: AIAgent;
  communityCards: Card[];
  pot: number;
  currentPlayer: string;
  round: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  actions: GameAction[];
  started: boolean;
  ended: boolean;
  winner?: string;
  handEvaluations?: { player: PokerHand; ai: PokerHand };
  deck?: Card[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar?: string;
  winRate: number;
  totalEarnings: number;
  gamesPlayed: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  playerName: string;
  result: 'win' | 'loss';
  earningsChange: number;
  aiDecisions: GameAction[];
  finalHand?: string;
}

export interface PokerHand {
  rank: number;
  name: string;
  highCard: string;
}

export type TurnAction = {
  type: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount?: number;
};