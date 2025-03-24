
import { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Advanced AI Opponent",
      description: "Challenge our sophisticated AI agent that learns and adapts to your playing style. Built with cutting-edge machine learning algorithms for a realistic poker experience."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Blockchain Rewards",
      description: "All winnings are automatically transferred to your wallet through the Aptos blockchain. Secure, transparent, and instant transactions after each game."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Skill-Based Challenges",
      description: "Progress through increasingly difficult poker scenarios. Test your decision-making, bluffing skills, and strategic thinking against our AI."
    }
  ];
  
  useEffect(() => {
    if (!inView) return;
    
    setIsInView(true);
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [inView, features.length]);

  return (
    <div 
      ref={ref}
      className="py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${isInView ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
            About <span className="text-gradient">PokerChallenge</span>
          </h2>
          <p className={`text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 ${isInView ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
          PokerChallenge combines the thrill of Texas Hold'em poker with state-of-the-art artificial intelligence and blockchain technology.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className={`space-y-4 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
            {features.map((feature, index) => (
              <div 
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`
                  p-6 rounded-xl cursor-pointer transition-all duration-300
                  ${activeFeature === index 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-secondary hover:bg-secondary/70'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-2 rounded-lg
                    ${activeFeature === index 
                      ? 'bg-white/20' 
                      : 'bg-primary/10 text-primary'}
                  `}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className={`text-sm ${activeFeature === index ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {feature.description}
                    </p>
                  </div>
                  <div className="ml-auto self-center">
                    <ChevronRight className={`w-5 h-5 transition-transform ${activeFeature === index ? 'translate-x-1' : ''}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 shadow-xl relative overflow-hidden h-96 transition-all duration-700 delay-300 ${isInView ? 'opacity-100 transform-none' : 'opacity-0 translate-x-8'}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-2xl animate-pulse"></div>
            </div>
            
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={`card-${i}`}
                  className="w-16 h-24 rounded-md shadow-lg transform rotate-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  style={{ transform: `rotate(${(i - 1) * 15}deg)` }}
                >
                </div>
              ))}
            </div>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                </div>
                
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={`line-${i}`}
                    className="absolute w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
                    style={{ 
                      top: '50%', 
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateX(60px)`,
                      opacity: (i % 3) === activeFeature % 3 ? 0.8 : 0.2,
                      transition: 'opacity 0.5s ease'
                    }}
                  ></div>
                ))}
                
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={`node-${i}`}
                    className="absolute w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500"
                    style={{ 
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateX(100px) translateY(-50%)`,
                      opacity: (i % 3) === activeFeature % 3 ? 1 : 0.4,
                      transition: 'opacity 0.5s ease'
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center w-full max-w-xs">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                <h3 className="font-semibold">{features[activeFeature].title}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
