
import { useState } from 'react';
import { Calendar, Search, ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { GameHistoryEntry } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GameHistoryProps {
  entries: GameHistoryEntry[];
  className?: string;
}

const GameHistory = ({ entries, className = '' }: GameHistoryProps) => {
  const [filter, setFilter] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'win' | 'loss'>('all');
  
  const filteredEntries = entries
    .filter(entry => 
      entry.playerName.toLowerCase().includes(filter.toLowerCase()) && 
      (resultFilter === 'all' || entry.result === resultFilter)
    );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatAction = (actionType: string) => {
    switch(actionType) {
      case 'fold': return 'Folded';
      case 'check': return 'Checked';
      case 'call': return 'Called';
      case 'raise': return 'Raised to';
      case 'all-in': return 'Went All-In with';
      default: return actionType;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Game History
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              type="text" 
              placeholder="Search games..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 min-w-[250px]"
            />
          </div>
          
          <Select 
            value={resultFilter} 
            onValueChange={(value) => setResultFilter(value as 'all' | 'win' | 'loss')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="win">Wins Only</SelectItem>
              <SelectItem value="loss">Losses Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Accordion key={entry.id} type="single" collapsible className="bg-card rounded-lg border border-border overflow-hidden">
              <AccordionItem value={entry.id} className="border-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 focus:bg-muted/20">
                  <div className="flex flex-col md:flex-row w-full justify-between md:items-center text-left gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${entry.result === 'win' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}
                      `}>
                        {entry.result === 'win' 
                          ? <TrendingUp className="w-5 h-5" /> 
                          : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium">{entry.playerName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Result</div>
                        <div className={`font-semibold ${
                          entry.result === 'win' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {entry.result === 'win' ? 'Win' : 'Loss'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Earnings</div>
                        <div className={`font-semibold ${
                          entry.earningsChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {entry.earningsChange >= 0 ? '+' : ''}{entry.earningsChange.toFixed(2)} APT
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="pt-2 border-t border-border">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">AI Decisions</h4>
                      <div className="space-y-2">
                        {entry.aiDecisions.map((decision, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm bg-muted/20 p-2 rounded">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs">
                              AI
                            </div>
                            <span>
                              {formatAction(decision.type)}
                              {decision.amount ? ` ${decision.amount} chips` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {entry.finalHand && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Final Hand</h4>
                        <div className="text-sm bg-muted/20 p-2 rounded">
                          {entry.finalHand}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <div className="text-muted-foreground">No game history found.</div>
        </div>
      )}
    </div>
  );
};

export default GameHistory;
