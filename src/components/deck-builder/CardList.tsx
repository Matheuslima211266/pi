
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface CardListProps {
  cards: any[];
  title: string;
  deckCounts: {[cardId: number]: number};
  onAddCard: (card: any) => void;
  onCardHover: (card: any) => void;
  maxCopies?: number;
}

const CardList = ({ 
  cards, 
  title, 
  deckCounts, 
  onAddCard, 
  onCardHover, 
  maxCopies = 3 
}: CardListProps) => {
  return (
    <Card className="p-4 bg-slate-800/50">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {cards.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Nessuna carta disponibile</p>
          </div>
        ) : (
          cards.map(card => (
            <div 
              key={card.id} 
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
                  {deckCounts[card.id] || 0}/{maxCopies}
                </Badge>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCard(card);
                  }}
                  disabled={(deckCounts[card.id] || 0) >= maxCopies}
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 h-auto"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default CardList;
