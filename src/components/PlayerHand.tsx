
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Hand } from 'lucide-react';

const PlayerHand = ({ cards, onPlayCard, currentMana, isPlayerTurn }) => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
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
              isPlayable={isPlayerTurn && currentMana >= (card.cost || card.star || 1)}
              isInHand={true}
              showCost={true}
            />
            {selectedCard?.id === card.id && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
          </div>
        ))}
        
        {cards.length === 0 && (
          <div className="w-full text-center py-8 text-gray-400">
            <p>La tua mano è vuota</p>
          </div>
        )}
      </div>
      
      {selectedCard && (
        <div className="mt-4 p-3 bg-blue-900/50 border border-blue-400 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm">Carta selezionata: <strong>{selectedCard.name}</strong></span>
            <span className="text-xs text-gray-300">Clicca su una zona del campo per posizionarla</span>
          </div>
        </div>
      )}
      
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
