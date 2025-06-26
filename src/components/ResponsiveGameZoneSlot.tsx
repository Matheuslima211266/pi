
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
  const handleClick = (e) => {
    e.stopPropagation();
    if (card) {
      onCardPreview?.(card);
    } else if (onSlotClick && isHighlighted) {
      onSlotClick(zoneName, slotIndex, e);
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
        relative w-full h-full min-w-[80px] min-h-[120px]
        border-2 rounded-lg cursor-pointer transition-all duration-200
        ${card ? 'border-yellow-500 bg-slate-700' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'}
        ${isHighlighted ? 'border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-400/50' : ''}
        ${isEffectActivated ? 'ring-2 ring-purple-400' : ''}
      `}
      onClick={handleClick}
    >
      {card ? (
        <div className="relative w-full h-full">
          <div className="w-full h-full">
            <CardComponent 
              card={card}
              onClick={() => onCardPreview?.(card)}
              isPlayable={true}
              isSmall={false}
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
          </div>
          
          {/* Menu popup per azioni rapide */}
          <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity z-10">
            <div className="bg-black/90 rounded p-1 space-y-1 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('destroy');
                }}
                className="text-red-400 text-xs hover:text-red-300 block w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/50"
                title="Destroy"
              >
                💥
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('banish');
                }}
                className="text-purple-400 text-xs hover:text-purple-300 block w-6 h-6 flex items-center justify-center rounded hover:bg-purple-900/50"
                title="Banish"
              >
                🚫
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('toHand');
                }}
                className="text-green-400 text-xs hover:text-green-300 block w-6 h-6 flex items-center justify-center rounded hover:bg-green-900/50"
                title="To Hand"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-slate-400 text-2xl mb-2">
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
