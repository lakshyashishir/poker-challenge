
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl transition-opacity duration-1000 delay-300 ${loaded ? 'opacity-60' : 'opacity-0'}`}
        ></div>
        <div 
          className={`absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl transition-opacity duration-1000 delay-500 ${loaded ? 'opacity-70' : 'opacity-0'}`}
        ></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className={`mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium transition-all duration-700 ${loaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
          <Brain size={16} />
          <span>Powered by Move Agent Kit</span>
        </div>
        
        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ${loaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
        Outsmart the AI.  <br />
          <span className="text-gradient">Win the Pot.</span>
        </h1>
        
        <p className={`text-xl text-muted-foreground max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
        Step into the ultimate poker challenge where strategy meets innovation. Play against an adaptive AI and prove your mastery.
        </p>
        
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${loaded ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
          <Button 
            onClick={() => navigate('/game')}
            className="poker-button-primary flex items-center gap-2 text-lg py-6 px-8"
          >
            <span>Challenge the AI</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/leaderboard')}
            className="py-6 px-8 text-lg"
          >
            View Leaderboard
          </Button>
        </div>
      </div>
      
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex -space-x-4">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`w-20 h-28 rounded-lg shadow-xl transform transition-all duration-700 delay-${400 + i * 100} playing-card ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              transform: loaded ? `translateY(0) rotate(${(i - 1.5) * 10}deg)` : 'translateY(100px)',
              backgroundColor: i % 2 === 0 ? 'white' : '#1e293b',
              borderColor: i % 2 === 0 ? '#e2e8f0' : '#334155',
              transitionDelay: `${400 + i * 100}ms`
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-2xl font-bold ${i % 2 === 0 ? 'text-gray-900' : 'text-white'}`}>
                {i === 0 ? '♠' : i === 1 ? '♥' : i === 2 ? '♦' : '♣'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
