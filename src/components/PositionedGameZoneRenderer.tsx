import React from 'react';
import { Badge } from '@/components/ui/badge';
import PositionedGameZoneSlot from './PositionedGameZoneSlot';

const PositionedGameZoneRenderer = ({ 
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
  cardStyle
}) => {
  const standardCardStyle = {
    width: '100px',
    height: '140px',
    minWidth: '100px',
    minHeight: '140px',
    ...cardStyle
  };

  const slots = Array.from({ length: maxCards }, (_, index) => {
    const card = cards[index];
    const isHighlighted = selectedCardFromHand && !card && !isEnemy;
    
    return (
      <div 
        key={index}
        className="flex items-center justify-center"
        style={{
          width: standardCardStyle.width,
          height: standardCardStyle.height,
          minWidth: standardCardStyle.minWidth,
          minHeight: standardCardStyle.minHeight
        }}
      >
        <PositionedGameZoneSlot
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
          cardStyle={standardCardStyle}
        />
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        {React.cloneElement(icon, { size: 18 })}
        <Badge variant="outline" className="text-sm py-1 px-2">
          {zoneName}
        </Badge>
        <span className="text-sm text-gray-400 font-medium">
          {cards.filter(c => c !== null).length}/{maxCards}
        </span>
      </div>
      <div className="flex gap-2 items-center justify-center">
        {slots}
      </div>
    </div>
  );
};

export const PositionedSingleSlotZoneRenderer = ({ 
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
  isEffectActivated,
  cardStyle
}) => {
  const card = cards && cards.length > 0 ? cards[0] : null;
  const isHighlighted = selectedCardFromHand && !card && !isEnemy;
  
  const standardCardStyle = {
    width: '100px',
    height: '140px',
    minWidth: '100px',
    minHeight: '140px',
    ...cardStyle
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        {React.cloneElement(icon, { size: 18 })}
        <Badge variant="outline" className="text-sm py-1 px-2">
          {title}
        </Badge>
        <span className="text-sm text-gray-400 font-medium">
          {card ? '1/1' : '0/1'}
        </span>
      </div>
      <div 
        className="flex items-center justify-center"
        style={{
          width: standardCardStyle.width,
          height: standardCardStyle.height,
          minWidth: standardCardStyle.minWidth,
          minHeight: standardCardStyle.minHeight
        }}
      >
        <PositionedGameZoneSlot
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
          cardStyle={standardCardStyle}
        />
      </div>
    </div>
  );
};

export default PositionedGameZoneRenderer;
