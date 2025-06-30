import React from 'react';
import { cn } from '../lib/utils';
import { dbg } from '@/lib/debug';
import {
  CARD_HAND_WIDTH_PX,
  CARD_HAND_HEIGHT_PX,
  CARD_HAND_IMAGE_HEIGHT_PX,
  CARD_SMALL_WIDTH_PX,
  CARD_SMALL_HEIGHT_PX,
  CARD_SMALL_IMAGE_HEIGHT_PX,
  CARD_DEFENSE_ROTATION_DEG,
  CARD_ENEMY_ROTATION_DEG,
  CARD_BORDER_WIDTH_PX,
  CARD_STARS_FONT_SIZE_HAND_PX,
  CARD_STARS_FONT_SIZE_SMALL_PX,
  CARD_STARS_FONT_SIZE_NORMAL_PX
} from '@/config/dimensions';

const CardComponent = ({ 
  card, 
  onClick, 
  isPlayable = true, 
  isSmall = false,
  showCost = true,
  canAttack = false,
  isInHand = false,
  isFaceDown = false,
  position,
  onPositionChange = null,
  onCardPreview = null,
  isEnemy = false,
  isHighlighted = false, 
  isSelected = false,
  isDefensePosition = false,
  showATK = true,
  showDEF = true,
  imageOnly = false,
  className = "",
  onContextMenu,
  onDoubleClick,
  isEffectActivated = false,
  zoneName,
  slotIndex,
  onFieldCardAction,
  enemyField,
  onCardClick,
  zoneLabel
}) => {
  dbg('🃏 [CardComponent] render', {
    card: card,
    cardId: card?.id,
    cardName: card?.name,
    cardType: card?.card_type,
    cardAtk: card?.atk,
    cardDef: card?.def,
    isHighlighted: isHighlighted,
    isSelected: isSelected,
    isEnemy: isEnemy,
    isDefensePosition: isDefensePosition,
    isFaceDown: isFaceDown,
    zoneName: zoneName,
    slotIndex: slotIndex,
    zoneLabel: zoneLabel,
    timestamp: Date.now()
  });

  if (!card) {
    dbg('🃏 [CardComponent] - No card to render');
    return (
      <div 
        className={`w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 lg:w-32 lg:h-44 border-2 border-dashed border-gray-500 bg-gray-800/30 rounded-lg flex items-center justify-center ${isHighlighted ? 'border-yellow-400 bg-yellow-900/30' : ''} ${className}`}
        onClick={onClick}
      >
        <div className="text-gray-400 text-xs text-center">
          {zoneLabel || 'Empty'}
        </div>
      </div>
    );
  }

  // DEBUG: logga la posizione della carta e lo stato
  const isMonster = card.card_type === 'monster' || card.atk !== undefined;
  
  dbg('CardComponent', card?.name, 'position:', card?.position, 'isDefensePosition:', isDefensePosition, {
    isPlayable, isSmall, isInHand, isFaceDown, position, onPositionChange
  });

  // Dimensioni per carte sul campo
  const getCardDimensions = () => {
    if (isInHand) {
      return { 
        width: `${CARD_HAND_WIDTH_PX}px`, 
        height: `${CARD_HAND_HEIGHT_PX}px`, 
        imageHeight: `${CARD_HAND_IMAGE_HEIGHT_PX}px`
      };
    } else if (isSmall) {
      return { 
        width: `${CARD_SMALL_WIDTH_PX}px`, 
        height: `${CARD_SMALL_HEIGHT_PX}px`, 
        imageHeight: `${CARD_SMALL_IMAGE_HEIGHT_PX}px`
      };
    } else {
      // Carte sul campo - dimensioni più grandi
      return { width: '100%', height: '100%', imageHeight: '60%' };
    }
  };

  const { width: cardWidth, height: cardHeight, imageHeight } = getCardDimensions();

  // Simplified thumbnail (image + name) used in modals when imageOnly === true
  if (imageOnly) {
    return (
      <div
        className={cn('w-full aspect-[5/7] overflow-hidden', className)}
        onClick={() => onClick && onClick(card)}
      >
        {card.art_link && card.art_link !== 'NO ICON' ? (
          <img
            src={card.art_link}
            alt={card.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs text-center p-1">
            {card.name}
          </div>
        )}
      </div>
    );
  }

  // Se è coperta, mostra il retro della carta
  if (isFaceDown) {
    const faceDownClassName = `
      ${cardWidth} ${cardHeight}
      bg-gradient-to-br from-blue-800 to-purple-800 border-2 border-blue-400
      ${isPlayable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'opacity-50'} 
      ${isDefensePosition ? 'card-defense-position' : ''}
      transition-all duration-300 relative overflow-hidden rounded-xl
    `;
    
    dbg('Face-down card className:', faceDownClassName, 'isDefensePosition:', isDefensePosition);
    
    return (
      <div 
        className={faceDownClassName}
        onClick={() => {
          if (isPlayable && onClick) {
            onClick(card);
          }
          if (onCardPreview) {
            onCardPreview(card);
          }
        }}
        onMouseEnter={() => {
          if (onCardPreview) {
            onCardPreview(card);
          }
        }}
        style={{
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          transform: isDefensePosition ? `rotate(${CARD_DEFENSE_ROTATION_DEG}deg)` : (isEnemy ? `rotate(${CARD_ENEMY_ROTATION_DEG}deg)` : 'none'),
          transformOrigin: 'center center',
          width: cardWidth,
          height: cardHeight
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-xs mb-1">SIMULATORE</div>
            <div className="text-white font-bold text-xs">CARDS</div>
          </div>
        </div>
      </div>
    );
  }

  const handlePositionClick = (e) => {
    e.stopPropagation();
    dbg('Position click triggered:', { 
      card: card.name, 
      currentPosition: card.position, 
      isDefensePosition, 
      onPositionChange: !!onPositionChange, 
      isMonster,
      cardObject: card
    });
    if (onPositionChange && isMonster) {
      const newPosition = isDefensePosition ? 'attack' : 'defense';
      dbg('Calling onPositionChange with new position:', newPosition, 'current position was:', card.position);
      onPositionChange(card, newPosition);
    } else {
      dbg('Cannot change position:', { onPositionChange: !!onPositionChange, isMonster });
    }
  };

  const normalCardClassName = `
    ${cardWidth} ${cardHeight}
    bg-gradient-to-br from-slate-700 to-slate-800 border-3 border-yellow-500
    ${isPlayable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'opacity-50'} 
    ${isDefensePosition ? 'card-defense-position' : ''}
    transition-all duration-300 relative overflow-hidden rounded-xl
  `;
  
  dbg('Normal card className:', normalCardClassName, 'isDefensePosition:', isDefensePosition);

  return (
    <div
      className={normalCardClassName}
      onClick={() => {
        if (isPlayable && onClick) {
          onClick(card);
        }
        if (onCardPreview) {
          onCardPreview(card);
        }
      }}
      onMouseEnter={(e) => {
        if (isPlayable) {
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(255,215,0,0.4)';
        }
        if (onCardPreview) {
          onCardPreview(card);
        }
      }}
      style={{
        boxShadow: isPlayable ? '0 8px 25px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        background: 'linear-gradient(135deg, #2a3b5c, #1a2a3a)',
        border: `${CARD_BORDER_WIDTH_PX}px solid #ffd700`,
        transform: isDefensePosition ? `rotate(${CARD_DEFENSE_ROTATION_DEG}deg)` : (isEnemy ? `rotate(${CARD_ENEMY_ROTATION_DEG}deg)` : 'none'),
        transformOrigin: 'center center',
        width: cardWidth,
        height: cardHeight
      }}
    >
      {/* Card Image */}
      <div 
        className={`w-full ${imageHeight} bg-gray-800 border-b-2 border-yellow-500 bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: card.art_link && card.art_link !== "NO ICON" ? `url(${card.art_link})` : 'none'
        }}
      >
        {(!card.art_link || card.art_link === "NO ICON") && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className={`text-white ${isInHand ? 'text-lg' : (isSmall ? 'text-xl' : 'text-4xl')}`}>
              {isMonster ? '🐉' : card.card_type === 'spell' ? '⚡' : '🪤'}
            </div>
          </div>
        )}
      </div>

      {/* Level Stars (for monsters) */}
      {isMonster && card.star && (
        <div 
          className="absolute top-2 right-2 bg-black/80 text-yellow-500 px-2 py-1 rounded-xl font-bold border border-yellow-500"
          style={{ 
            fontSize: isInHand 
              ? `${CARD_STARS_FONT_SIZE_HAND_PX}px` 
              : (isSmall ? `${CARD_STARS_FONT_SIZE_SMALL_PX}px` : `${CARD_STARS_FONT_SIZE_NORMAL_PX}px`) 
          }}
        >
          {'★'.repeat(Math.min(card.star, 12))}
        </div>
      )}

      {/* Card Stats Section - Solo per mostri e solo ATK/DEF */}
      {isMonster && (
        <div 
          className="absolute bottom-0 left-0 right-0 flex justify-around items-center"
          style={{
            height: isInHand ? '35%' : (isSmall ? '35%' : '40%'),
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95))'
          }}
        >
          <div className="text-center">
            <div className={`text-yellow-500 font-bold ${isInHand ? 'text-xs' : (isSmall ? 'text-xs' : 'text-sm')} mb-1`}>
              ATK
            </div>
            <div 
              className={`text-red-400 font-bold ${isInHand ? 'text-xs' : (isSmall ? 'text-sm' : 'text-2xl')}`}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            >
              {card.atk}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-yellow-500 font-bold ${isInHand ? 'text-xs' : (isSmall ? 'text-xs' : 'text-sm')} mb-1`}>
              DEF
            </div>
            <div 
              className={`text-blue-400 font-bold ${isInHand ? 'text-xs' : (isSmall ? 'text-sm' : 'text-2xl')}`}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            >
              {card.def}
            </div>
          </div>
        </div>
      )}

      {/* Non-Monster Cards - Mostra solo il tipo */}
      {!isMonster && (
        <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center">
          <div className={`text-yellow-500 font-bold ${isInHand ? 'text-xs' : (isSmall ? 'text-xs' : 'text-sm')}`}>
            {card.card_type?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Position indicator for monsters - Clickable */}
      {isMonster && !isSmall && !isInHand && onPositionChange && (
        <div className="absolute top-2 left-2">
          <div 
            className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors ${
              isDefensePosition ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
            } text-white border border-white/20`}
            onClick={handlePositionClick}
            title="Click to change position"
          >
            {isDefensePosition ? 'DEF' : 'ATK'}
          </div>
        </div>
      )}

      {/* Position indicator for monsters - Non-clickable */}
      {isMonster && !isSmall && !isInHand && !onPositionChange && (
        <div className="absolute top-2 left-2">
          <div className={`text-sm px-2 py-1 rounded ${isDefensePosition ? 'bg-blue-500' : 'bg-red-500'} text-white`}>
            {isDefensePosition ? 'DEF' : 'ATK'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardComponent;