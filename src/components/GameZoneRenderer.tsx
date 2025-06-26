
import React from 'react';
import { Badge } from '@/components/ui/badge';
import GameZoneSlot from './GameZoneSlot';

const GameZoneRenderer = ({ 
  cards, 
  zoneName, 
  icon, 
  maxCards = 5, 
  selectedCardFromHand, 
  isEnemy, 
  onSlotClick, 
  onCardPreview, 
  onFieldCardAction, 
  onCardClick, 
  isEffectActivated,
  className = "" 
}) => {
  const slots = Array.from({ length: maxCards }, (_, index) => {
    const card = cards[index];
    const isHighlighted = selectedCardFromHand && !card && !isEnemy;
    
    return (
      <GameZoneSlot
        key={index}
        card={card}
        zoneName={zoneName}
        slotIndex={index}
        icon={icon}
        isHighlighted={isHighlighted}
        onSlotClick={onSlotClick}
        onCardPreview={onCardPreview}
        onFieldCardAction={onFieldCardAction}
        onCardClick={onCardClick}
        isEffectActivated={isEffectActivated}
      />
    );
  });

  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {React.cloneElement(icon, { size: 12 })}
        <Badge variant="outline" className="text-xs py-0 px-1 h-4">
          {zoneName}
        </Badge>
        <span className="text-xs text-gray-400">
          {cards.filter(c => c !== null).length}/{maxCards}
        </span>
      </div>
      <div className="flex gap-0.5 justify-center">
        {slots}
      </div>
    </div>
  );
};

export const SingleSlotZoneRenderer = ({ 
  cards, 
  zoneName, 
  icon, 
  title, 
  selectedCardFromHand, 
  isEnemy, 
  onSlotClick, 
  onCardPreview, 
  onFieldCardAction, 
  onCardClick, 
  isEffectActivated 
}) => {
  const card = cards && cards.length > 0 ? cards[0] : null;
  const isHighlighted = selectedCardFromHand && !card && !isEnemy;
  
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {React.cloneElement(icon, { size: 12 })}
        <Badge variant="outline" className="text-xs py-0 px-1 h-4">
          {title}
        </Badge>
        <span className="text-xs text-gray-400">
          {card ? '1/1' : '0/1'}
        </span>
      </div>
      <div className="flex justify-center">
        <GameZoneSlot
          card={card}
          zoneName={zoneName}
          slotIndex={0}
          icon={icon}
          isHighlighted={isHighlighted}
          onSlotClick={onSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={onFieldCardAction}
          onCardClick={onCardClick}
          isEffectActivated={isEffectActivated}
        />
      </div>
    </div>
  );
};

export default GameZoneRenderer;
