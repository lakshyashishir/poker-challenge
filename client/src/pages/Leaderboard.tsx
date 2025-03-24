
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';
import { LeaderboardEntry } from '@/lib/types';

// Mock leaderboard data
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: '1',
    playerName: 'PokerPro99',
    winRate: 0.76,
    totalEarnings: 15689.50,
    gamesPlayed: 142
  },
  {
    rank: 2,
    playerId: '2',
    playerName: 'AceKing',
    avatar: 'https://i.pravatar.cc/150?img=3',
    winRate: 0.68,
    totalEarnings: 9876.40,
    gamesPlayed: 85
  },
  {
    rank: 3,
    playerId: '3',
    playerName: 'RiverQueen',
    winRate: 0.65,
    totalEarnings: 7653.20,
    gamesPlayed: 92
  },
  {
    rank: 4,
    playerId: '4',
    playerName: 'CardShark',
    avatar: 'https://i.pravatar.cc/150?img=4',
    winRate: 0.59,
    totalEarnings: 5432.10,
    gamesPlayed: 63
  },
  {
    rank: 5,
    playerId: '5',
    playerName: 'BluffMaster',
    winRate: 0.54,
    totalEarnings: 3210.90,
    gamesPlayed: 48
  },
  {
    rank: 6,
    playerId: '6',
    playerName: 'FoldMaster',
    winRate: 0.51,
    totalEarnings: 2876.30,
    gamesPlayed: 52
  },
  {
    rank: 7,
    playerId: '7',
    playerName: 'RiverRat',
    avatar: 'https://i.pravatar.cc/150?img=7',
    winRate: 0.49,
    totalEarnings: 2654.80,
    gamesPlayed: 47
  },
  {
    rank: 8,
    playerId: '8',
    playerName: 'TexasHoldem',
    winRate: 0.48,
    totalEarnings: 2543.70,
    gamesPlayed: 62
  },
  {
    rank: 9,
    playerId: '9',
    playerName: 'AllInAlways',
    avatar: 'https://i.pravatar.cc/150?img=9',
    winRate: 0.46,
    totalEarnings: 2345.60,
    gamesPlayed: 38
  },
  {
    rank: 10,
    playerId: '10',
    playerName: 'PokerFace',
    winRate: 0.45,
    totalEarnings: 2134.50,
    gamesPlayed: 42
  },
  {
    rank: 11,
    playerId: '11',
    playerName: 'ChipStacker',
    winRate: 0.44,
    totalEarnings: 1987.30,
    gamesPlayed: 36
  },
  {
    rank: 12,
    playerId: '12',
    playerName: 'RoyalFlush',
    avatar: 'https://i.pravatar.cc/150?img=12',
    winRate: 0.43,
    totalEarnings: 1876.20,
    gamesPlayed: 31
  },
  {
    rank: 13,
    playerId: '13',
    playerName: 'StraightShooter',
    winRate: 0.42,
    totalEarnings: 1765.10,
    gamesPlayed: 28
  },
  {
    rank: 14,
    playerId: '14',
    playerName: 'FullHouse',
    avatar: 'https://i.pravatar.cc/150?img=14',
    winRate: 0.41,
    totalEarnings: 1654.00,
    gamesPlayed: 25
  },
  {
    rank: 15,
    playerId: '15',
    playerName: 'FourOfAKind',
    winRate: 0.40,
    totalEarnings: 1543.90,
    gamesPlayed: 22
  }
];

const LeaderboardPage = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
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
                <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Global Leaderboard</h1>
                <p className="text-muted-foreground">See how you stack up against the world's best PokerChallenge players.</p>
              </div>
              
              <Leaderboard entries={mockLeaderboardData} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
