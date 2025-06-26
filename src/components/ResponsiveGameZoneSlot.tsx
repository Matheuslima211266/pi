
import React from 'react';
import CardComponent from './CardComponent';

const ResponsiveGameZoneSlot = ({ 
  card, 
  zoneName, 
  slotIndex, 
  icon, 
  isHighlighted, 
  onSlotClick, 
  onCardPreview, 
  onFieldCardAction, 
  onCardClick, 
  isEffectActivated,
  zoneLabel 
}) => {
  const handleClick = () => {
    if (card) {
      onCardPreview?.(card);
    } else if (onSlotClick && isHighlighted) {
      // Only allow slot clicks when highlighted (card selected from hand)
      onSlotClick(zoneName, slotIndex);
    }
  };

  const handleCardAction = (action) => {
    if (card && onFieldCardAction) {
      onFieldCardAction(action, card, zoneName, slotIndex);
    }
  };

  return (
    <div 
      className={`
        relative w-24 h-32 md:w-32 md:h-44 lg:w-36 lg:h-48
        border-2 rounded-lg cursor-pointer transition-all duration-200
        ${card ? 'border-yellow-500 bg-slate-700' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'}
        ${isHighlighted ? 'border-blue-400 bg-blue-900/50 animate-pulse' : ''}
        ${isEffectActivated ? 'ring-2 ring-purple-400 animate-pulse' : ''}
      `}
      onClick={handleClick}
    >
      {card ? (
        <div className="relative w-full h-full">
          <CardComponent 
            card={card}
            onClick={() => onCardPreview?.(card)}
            isPlayable={true}
            isSmall={true}
            showCost={false}
            isInHand={false}
            isFaceDown={card.faceDown}
            position={card.position || 'attack'}
            onPositionChange={(card, newPosition) => {
              if (onFieldCardAction) {
                onFieldCardAction('changePosition', { ...card, position: newPosition }, zoneName, slotIndex);
              }
            }}
          />
          
          {/* Menu popup per azioni rapide */}
          <div className="absolute top-0 right-0 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-black/80 rounded p-1 space-y-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('destroy');
                }}
                className="text-red-400 text-xs hover:text-red-300 block"
                title="Destroy"
              >
                💥
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('banish');
                }}
                className="text-purple-400 text-xs hover:text-purple-300 block"
                title="Banish"
              >
                🚫
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('toHand');
                }}
                className="text-green-400 text-xs hover:text-green-300 block"
                title="To Hand"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-slate-400 text-xl mb-2">
            {typeof icon === 'string' ? icon : '⭐'}
          </div>
          {zoneLabel && (
            <div className="text-xs text-slate-400 font-medium text-center px-1">
              {zoneLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameZoneSlot;
