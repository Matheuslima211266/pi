import React from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Hand, Eye } from 'lucide-react';

const EnemyHand = ({ handCount, revealedCard, revealedHand }) => {
  // Crea un array di carte coperte per rappresentare la mano del nemico
  const backCards = Array(handCount).fill(null).map((_, index) => ({
    id: `back-${index}`,
    name: 'Hidden Card',
    isFaceDown: true
  }));

  return (
    <Card className="bg-slate-800/70 border-red-400 p-1">
      <div className="flex items-center gap-1 mb-1">
        <Hand className="text-red-400" size={14} />
        <h3 className="text-sm font-semibold">Mano Avversario</h3>
        <Badge variant="outline" className="ml-auto text-xs py-0 px-1">
          {handCount} carte
        </Badge>
      </div>
      
      {/* Centered enemy hand */}
      <div className="flex justify-center">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {backCards.map((card, index) => (
            <div key={card.id} className="flex-shrink-0">
              <CardComponent
                card={card}
                onClick={() => {}}
                isPlayable={false}
                isInHand={true}
                showCost={false}
                isFaceDown={true}
                isSmall={true}
              />
            </div>
          ))}
          
          {handCount === 0 && (
            <div className="w-full text-center py-4 text-gray-400">
              <p className="text-sm">L'avversario non ha carte in mano</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Carta rivelata */}
      {revealedCard && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-400 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="text-red-400" size={16} />
            <span className="text-sm font-semibold">L'avversario ha mostrato:</span>
          </div>
          <div className="flex justify-center">
            <CardComponent
              card={revealedCard}
              onClick={() => {}}
              isPlayable={false}
              isSmall={false}
              showCost={true}
            />
          </div>
        </div>
      )}
      
      {/* Mano rivelata */}
      {revealedHand && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-400 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="text-red-400" size={16} />
            <span className="text-sm font-semibold">L'avversario ha mostrato la sua mano:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {revealedHand.map((card, index) => (
              <div key={`revealed-${card.id}-${index}`} className="flex-shrink-0">
                <CardComponent
                  card={card}
                  onClick={() => {}}
                  isPlayable={false}
                  isSmall={true}
                  showCost={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnemyHand;
