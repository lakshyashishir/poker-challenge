
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardComponent from '@/components/Card';
import { X } from 'lucide-react';

const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks: ('2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A')[] = 
  ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface CardPreviewProps {
  onClose: () => void;
}

const CardPreview = ({ onClose }: CardPreviewProps) => {
  const [showFaceDown, setShowFaceDown] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-poker-dark border-gray-700">
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Card Preview</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X />
            </Button>
          </div>
          
          <div className="flex justify-center mb-4">
            <Button 
              variant={!showFaceDown ? "default" : "outline"} 
              onClick={() => setShowFaceDown(false)}
              className="mr-2"
            >
              Face Up
            </Button>
            <Button 
              variant={showFaceDown ? "default" : "outline"} 
              onClick={() => setShowFaceDown(true)}
            >
              Face Down
            </Button>
          </div>
          
          {!showFaceDown ? (
            <>
              <h3 className="text-lg font-semibold mb-3">Full Deck</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
                {suits.map(suit => 
                  ranks.map(rank => (
                    <div key={`${rank}-${suit}`} className="flex justify-center">
                      <CardComponent
                        card={{ suit, rank }}
                        className="w-14 h-20"
                      />
                    </div>
                  ))
                )}
              </div>
              
              <h3 className="text-lg font-semibold mt-4 mb-3">High Cards</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {suits.map(suit => (
                  <CardComponent
                    key={`A-${suit}`}
                    card={{ suit, rank: 'A' }}
                    className="w-16 h-24"
                  />
                ))}
              </div>
              
              <h3 className="text-lg font-semibold mt-4 mb-3">Royal Flush</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {['10', 'J', 'Q', 'K', 'A'].map(rank => (
                  <CardComponent
                    key={`${rank}-hearts`}
                    card={{ suit: 'hearts', rank: rank as any }}
                    className="w-16 h-24"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 my-8">
              <CardComponent
                card={{ suit: 'hearts', rank: 'A' }}
                hidden={true}
                className="w-20 h-28"
              />
              <CardComponent
                card={{ suit: 'hearts', rank: 'A' }}
                hidden={true}
                className="w-20 h-28"
              />
              <CardComponent
                card={{ suit: 'hearts', rank: 'A' }}
                hidden={true}
                className="w-20 h-28"
              />
            </div>
          )}
          
          <Button onClick={onClose} className="mt-6 mx-auto">
            Close Preview
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CardPreview;
