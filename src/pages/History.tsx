
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import GameHistory from '@/components/GameHistory';
import { GameHistoryEntry } from '@/lib/types';

// Mock game history data
const mockHistoryData: GameHistoryEntry[] = [
  {
    id: '1',
    date: '2023-06-15T14:23:45',
    playerName: 'You',
    result: 'win',
    earningsChange: 250.75,
    aiDecisions: [
      { type: 'fold', player: 'ai', timestamp: 1623762225000 }
    ],
    finalHand: 'Two Pair, Aces and Kings'
  },
  {
    id: '2',
    date: '2023-06-14T10:15:32',
    playerName: 'You',
    result: 'loss',
    earningsChange: -120.50,
    aiDecisions: [
      { type: 'call', amount: 20, player: 'ai', timestamp: 1623675332000 },
      { type: 'raise', amount: 60, player: 'ai', timestamp: 1623675400000 },
      { type: 'call', amount: 100, player: 'ai', timestamp: 1623675450000 }
    ],
    finalHand: 'Flush, Diamonds'
  },
  {
    id: '3',
    date: '2023-06-12T18:42:10',
    playerName: 'You',
    result: 'win',
    earningsChange: 178.25,
    aiDecisions: [
      { type: 'check', player: 'ai', timestamp: 1623515055000 },
      { type: 'call', amount: 40, player: 'ai', timestamp: 1623515130000 },
      { type: 'fold', player: 'ai', timestamp: 1623515190000 }
    ]
  },
  {
    id: '4',
    date: '2023-06-10T09:30:05',
    playerName: 'You',
    result: 'loss',
    earningsChange: -200.00,
    aiDecisions: [
      { type: 'raise', amount: 80, player: 'ai', timestamp: 1623327005000 },
      { type: 'check', player: 'ai', timestamp: 1623327075000 },
      { type: 'raise', amount: 150, player: 'ai', timestamp: 1623327145000 },
      { type: 'all-in', amount: 200, player: 'ai', timestamp: 1623327215000 }
    ],
    finalHand: 'Full House, Aces over Kings'
  },
  {
    id: '5',
    date: '2023-06-08T20:15:45',
    playerName: 'You',
    result: 'win',
    earningsChange: 95.50,
    aiDecisions: [
      { type: 'call', amount: 20, player: 'ai', timestamp: 1623186945000 },
      { type: 'check', player: 'ai', timestamp: 1623187015000 },
      { type: 'call', amount: 50, player: 'ai', timestamp: 1623187085000 },
      { type: 'fold', player: 'ai', timestamp: 1623187155000 }
    ]
  },
  {
    id: '6',
    date: '2023-06-05T16:22:30',
    playerName: 'You',
    result: 'loss',
    earningsChange: -75.25,
    aiDecisions: [
      { type: 'check', player: 'ai', timestamp: 1622913750000 },
      { type: 'raise', amount: 40, player: 'ai', timestamp: 1622913820000 },
      { type: 'call', amount: 70, player: 'ai', timestamp: 1622913890000 }
    ],
    finalHand: 'Straight, 6 to 10'
  },
  {
    id: '7',
    date: '2023-06-03T11:05:15',
    playerName: 'You',
    result: 'win',
    earningsChange: 110.75,
    aiDecisions: [
      { type: 'raise', amount: 30, player: 'ai', timestamp: 1622727915000 },
      { type: 'check', player: 'ai', timestamp: 1622727985000 },
      { type: 'call', amount: 60, player: 'ai', timestamp: 1622728055000 },
      { type: 'fold', player: 'ai', timestamp: 1622728125000 }
    ]
  }
];

const HistoryPage = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="pt-24 pb-16 px-4 max-w-screen-xl mx-auto">
        <div className="w-full max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading game history...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Game History</h1>
                <p className="text-muted-foreground">Review your past games and learn from the AI's decisions.</p>
              </div>
              
              <GameHistory entries={mockHistoryData} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
