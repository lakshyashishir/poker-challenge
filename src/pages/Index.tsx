
import { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
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
  }
];

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <Hero />
        <About />
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <Leaderboard entries={mockLeaderboardData} />
          </div>
        </section>
        
        <footer className="bg-poker-dark text-white py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-bold">PokerChallenge</h3>
                <p className="text-white/60 mt-2">Challenge your poker skills against AI</p>
              </div>
              
              <div className="flex items-center gap-4">
                <a href="#" className="text-white/80 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-white/80 hover:text-white transition-colors">Support</a>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/60 text-sm">
              © {new Date().getFullYear()} PokerChallenge. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
