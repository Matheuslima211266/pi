import React from 'react';
import CardComponent from './CardComponent';

const EnemyHand = ({ handCount, revealedCard, revealedHand }) => {
  // Crea un array di carte coperte per rappresentare la mano del nemico
  const backCards = Array(handCount).fill(null).map((_, index) => ({
    id: `back-${index}`,
    name: 'Hidden Card',
    isFaceDown: true,
    position: 'attack',
  }));

  return (
    <div className="flex flex-row items-end gap-2 px-2 py-1 overflow-x-auto min-h-[90px] max-w-full justify-end">
      {backCards.map((card, index) => (
        <div
          key={card.id}
          className="flex flex-col items-center justify-end min-w-[56px] max-w-[72px] min-h-[80px] max-h-[100px] p-1 rounded-lg bg-slate-700/50 border border-slate-600"
          style={{ fontSize: '0.7rem' }}
        >
          <div className="w-10 h-14 bg-slate-500 rounded mb-1 flex items-center justify-center text-xs text-white">
            <span className="opacity-60">?</span>
          </div>
        </div>
      ))}
      {handCount === 0 && (
        <div className="w-full text-center py-4 text-gray-400">
          <p className="text-sm">L'avversario non ha carte in mano</p>
        </div>
      )}
      {/* Carte rivelate (se presenti) */}
      {revealedCard && (
        <div className="ml-2">
          <CardComponent
            card={revealedCard}
            onClick={() => {}}
            isPlayable={false}
            isSmall={false}
            showCost={true}
            position={revealedCard.position || 'attack'}
          />
        </div>
      )}
      {revealedHand && (
        <div className="flex gap-2 ml-2">
          {revealedHand.map((card, index) => (
            <div key={`revealed-${card.id}-${index}`} className="flex-shrink-0">
              <CardComponent
                card={card}
                onClick={() => {}}
                isPlayable={false}
                isSmall={true}
                showCost={true}
                position={card.position || 'attack'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnemyHand;
