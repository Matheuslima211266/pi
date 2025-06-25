
import React from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Hand } from 'lucide-react';

const PlayerHand = ({ cards, onPlayCard, currentMana, isPlayerTurn }) => {
  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    
    if (card.type === 'monster') {
      onPlayCard(card, 'monsters');
    } else if (card.type === 'spell') {
      onPlayCard(card, 'spells');
    } else if (card.type === 'trap') {
      onPlayCard(card, 'traps');
    }
  };

  return (
    <Card className="bg-slate-800/70 border-blue-400 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Hand className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold">La Tua Mano</h3>
        <Badge variant="outline" className="ml-auto">
          {cards.length} carte
        </Badge>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.map((card, index) => (
          <div key={card.id} className="flex-shrink-0">
            <CardComponent
              card={card}
              onClick={handleCardClick}
              isPlayable={isPlayerTurn && currentMana >= card.cost}
              isInHand={true}
              showCost={true}
            />
          </div>
        ))}
        
        {cards.length === 0 && (
          <div className="w-full text-center py-8 text-gray-400">
            <p>La tua mano è vuota</p>
          </div>
        )}
      </div>
      
      {!isPlayerTurn && (
        <div className="mt-2 text-center">
          <Badge variant="secondary">
            Non è il tuo turno
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default PlayerHand;
