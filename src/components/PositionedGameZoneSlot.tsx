import React from 'react';
import { Sword, Shield, Zap } from 'lucide-react';
import CardComponent from './CardComponent';

interface PositionedGameZoneSlotProps {
  card: any;
  zoneName: string;
  slotIndex: number;
  icon: React.ReactElement;
  isHighlighted: boolean;
  onSlotClick: (zoneName: string, slotIndex: number, card: any) => void;
  onCardPreview: (card: any) => void;
  onFieldCardAction: (action: string, card: any, zoneName: string, slotIndex: number) => void;
  onCardClick: (card: any) => void;
  isEffectActivated: (cardId: string) => boolean;
  cardStyle: {
    width: string;
    height: string;
    minWidth: string;
    minHeight: string;
  };
}

const PositionedGameZoneSlot: React.FC<PositionedGameZoneSlotProps> = ({
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
  cardStyle
}) => {
  const handleSlotClick = () => {
    onSlotClick(zoneName, slotIndex, card);
  };

  const handleCardClick = () => {
    if (card) {
      onCardClick(card);
    }
  };

  // Determina la posizione della carta basandosi sulla zona
  const getCardPosition = () => {
    if (zoneName.toLowerCase().includes('monster')) {
      // Per le zone mostri, la posizione dipende dalla carta stessa
      return card?.position || 'attack';
    }
    // Per altre zone (S/T, ecc.) non ha senso la posizione
    return 'attack';
  };

  const handlePositionChange = (card: any) => {
    if (card && onFieldCardAction) {
      onFieldCardAction('changePosition', card, zoneName, slotIndex);
    }
  };

  if (card) {
    return (
      <div
        className="relative"
        style={{
          width: cardStyle.width,
          height: cardStyle.height,
          minWidth: cardStyle.minWidth,
          minHeight: cardStyle.minHeight
        }}
      >
        <CardComponent
          card={card}
          onClick={handleCardClick}
          isSmall={false}
          showCost={true}
          isFaceDown={card.isFaceDown}
          position={getCardPosition()}
          isDefensePosition={getCardPosition() === 'defense'}
          onPositionChange={handlePositionChange}
          canAttack={card.canAttack}
          isPlayable={card.isPlayable}
          onContextMenu={() => {}}
          onDoubleClick={() => {}}
          zoneName={zoneName}
          slotIndex={slotIndex}
          onFieldCardAction={onFieldCardAction}
          onCardPreview={onCardPreview}
          zoneLabel={zoneName}
          enemyField={false}
          onCardClick={onCardClick}
        />
        
        {/* Indicatore effetto attivato */}
        {isEffectActivated(card.id) && (
          <div className="absolute -top-1 -right-1">
            <Zap size={16} className="text-yellow-400 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  // Slot vuoto
  return (
    <div
      className={`
        border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
        flex items-center justify-center
        ${isHighlighted 
          ? 'border-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
          : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
        }
      `}
      style={{
        width: cardStyle.width,
        height: cardStyle.height,
        minWidth: cardStyle.minWidth,
        minHeight: cardStyle.minHeight
      }}
      onClick={handleSlotClick}
    >
      {React.cloneElement(icon, { 
        size: 20, 
        className: `${isHighlighted ? 'text-blue-400' : 'text-gray-500'}` 
      })}
    </div>
  );
};

export default PositionedGameZoneSlot;
