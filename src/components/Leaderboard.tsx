
import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const Leaderboard = ({ entries, className = '' }: LeaderboardProps) => {
  const [sortBy, setSortBy] = useState<'rank' | 'winRate' | 'totalEarnings' | 'gamesPlayed'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('');
  
  const filteredEntries = entries
    .filter(entry => entry.playerName.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  
  const toggleSort = (field: 'rank' | 'winRate' | 'totalEarnings' | 'gamesPlayed') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  const renderSortIndicator = (field: 'rank' | 'winRate' | 'totalEarnings' | 'gamesPlayed') => {
    if (sortBy !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-poker-gold" />
          Leaderboard
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            type="text" 
            placeholder="Search players..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 min-w-[250px]"
          />
        </div>
      </div>
      
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-left font-semibold text-sm cursor-pointer" onClick={() => toggleSort('rank')}>
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  {renderSortIndicator('rank')}
                </div>
              </th>
              <th className="p-3 text-left font-semibold text-sm">Player</th>
              <th className="p-3 text-left font-semibold text-sm cursor-pointer" onClick={() => toggleSort('winRate')}>
                <div className="flex items-center gap-1">
                  <span>Win Rate</span>
                  {renderSortIndicator('winRate')}
                </div>
              </th>
              <th className="p-3 text-left font-semibold text-sm cursor-pointer" onClick={() => toggleSort('totalEarnings')}>
                <div className="flex items-center gap-1">
                  <span>Total Earnings</span>
                  {renderSortIndicator('totalEarnings')}
                </div>
              </th>
              <th className="p-3 text-left font-semibold text-sm cursor-pointer" onClick={() => toggleSort('gamesPlayed')}>
                <div className="flex items-center gap-1">
                  <span>Games</span>
                  {renderSortIndicator('gamesPlayed')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <tr 
                  key={entry.playerId} 
                  className={`border-t border-border hover:bg-muted/20 transition-colors ${index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10' : ''}`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                            index === 1 ? 'bg-gray-300 text-gray-700' : 
                            'bg-amber-700 text-amber-100'}
                        `}>
                          {index + 1}
                        </div>
                      )}
                      {index >= 3 && (
                        <span className="text-muted-foreground">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full overflow-hidden">
                        {entry.avatar ? (
                          <img src={entry.avatar} alt={entry.playerName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                            {entry.playerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{entry.playerName}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${entry.winRate * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{(entry.winRate * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold">{entry.totalEarnings.toFixed(2)} APT</span>
                  </td>
                  <td className="p-3">
                    <span>{entry.gamesPlayed}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No players found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
