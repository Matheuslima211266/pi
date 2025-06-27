
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus } from 'lucide-react';

interface DeckViewProps {
  title: string;
  deckCards: {[cardId: number]: number};
  availableCards: any[];
  onRemoveCard: (cardId: number) => void;
  onCardHover: (card: any) => void;
}

const DeckView = ({ 
  title, 
  deckCards, 
  availableCards, 
  onRemoveCard, 
  onCardHover 
}: DeckViewProps) => {
  const totalCards = Object.values(deckCards).reduce((sum: number, count: number) => sum + count, 0);

  return (
    <Card className="p-4 bg-slate-800/50">
      <h3 className="text-lg font-semibold text-white mb-3">
        {title} ({totalCards})
      </h3>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {Object.keys(deckCards).length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Nessuna carta nel deck</p>
          </div>
        ) : (
          Object.entries(deckCards).map(([cardId, count]) => {
            const card = availableCards.find(c => c.id === parseInt(cardId));
            if (!card) return null;
            
            return (
              <div 
                key={cardId}
                className="flex items-center justify-between p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700/70 transition-colors"
                onMouseEnter={() => onCardHover(card)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{card.name}</div>
                  <div className="text-gray-400 text-sm">{card.type}</div>
                  {card.attribute && (
                    <div className="text-gray-500 text-xs">{card.attribute}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {count}x
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCard(card.id);
                    }}
                    className="px-2 py-1 h-auto"
                  >
                    <Minus size={14} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default DeckView;
