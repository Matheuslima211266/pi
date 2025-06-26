
import React from 'react';

const CardComponent = ({ 
  card, 
  onClick, 
  isPlayable = true, 
  isSmall = false,
  showCost = true,
  canAttack = false,
  isInHand = false,
  isFaceDown = false,
  position = 'attack',
  onPositionChange = null
}) => {
  const isMonster = card.card_type === 'monster' || card.atk !== undefined;
  const isDefensePosition = position === 'defense' || card.position === 'defense';

  // Dimensioni più grandi per carte sul campo
  const getCardDimensions = () => {
    if (isInHand) {
      return { width: 'w-20', height: 'h-28', imageHeight: 'h-16' };
    } else if (isSmall) {
      return { width: 'w-24', height: 'h-36', imageHeight: 'h-20' };
    } else {
      // Carte sul campo - dimensioni più grandi
      return { width: 'w-full', height: 'h-full', imageHeight: 'h-[60%]' };
    }
  };

  const { width: cardWidth, height: cardHeight, imageHeight } = getCardDimensions();

  // Se è coperta, mostra il retro della carta
  if (isFaceDown) {
    return (
      <div 
        className={`
          ${cardWidth} ${cardHeight}
          bg-gradient-to-br from-blue-800 to-purple-800 border-2 border-blue-400
          ${isPlayable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'opacity-50'} 
          ${isDefensePosition ? 'transform rotate-90' : ''}
          transition-all duration-300 relative overflow-hidden rounded-xl
        `}
        onClick={() => isPlayable && onClick && onClick(card)}
        style={{
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-xs mb-1">DUEL</div>
            <div className="text-white font-bold text-xs">CARDS</div>
          </div>
        </div>
      </div>
    );
  }

  const handlePositionClick = (e) => {
    e.stopPropagation();
    if (onPositionChange && isMonster) {
      const newPosition = isDefensePosition ? 'attack' : 'defense';
      onPositionChange(card, newPosition);
    }
  };

  return (
    <div 
      className={`
        ${cardWidth} ${cardHeight}
        bg-gradient-to-br from-slate-700 to-slate-800 border-3 border-yellow-500
        ${isPlayable ? 'cursor-pointer hover:-translate-y-1 hover:scale-105' : 'opacity-50'} 
        ${canAttack ? 'ring-2 ring-red-400' : ''}
        ${isInHand ? 'hover:-translate-y-2' : ''}
        ${isDefensePosition ? 'transform rotate-90' : ''}
        transition-all duration-300 relative overflow-hidden rounded-xl
      `}
      onClick={() => isPlayable && onClick && onClick(card)}
      style={{
        boxShadow: isPlayable ? '0 8px 25px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        background: 'linear-gradient(135deg, #2a3b5c, #1a2a3a)',
        border: '3px solid #ffd700'
      }}
      onMouseEnter={(e) => {
        if (isPlayable) {
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(255,215,0,0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (isPlayable) {
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)';
        }
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
          style={{ fontSize: isInHand ? '8px' : (isSmall ? '10px' : '14px') }}
        >
          {'★'.repeat(Math.min(card.star, 12))}
        </div>
      )}

      {/* Card Stats Section */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex flex-col justify-center items-center"
        style={{
          height: isInHand ? '45%' : (isSmall ? '45%' : '40%'),
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95))'
        }}
      >
        {/* Monster Stats */}
        {isMonster && (
          <div className={`flex justify-around w-full ${isInHand ? 'px-1' : 'px-4'}`}>
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

        {/* Non-Monster Cards Info */}
        {!isMonster && (
          <div className="text-center px-2">
            <div className={`text-yellow-500 font-bold ${isInHand ? 'text-xs' : (isSmall ? 'text-xs' : 'text-sm')}`}>
              {card.card_type?.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Card Name */}
      <div 
        className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-yellow-500 font-bold text-center max-w-full px-2 ${isInHand ? 'text-xs' : (isSmall ? 'text-xs' : 'text-sm')}`}
        style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: isInHand ? '70px' : (isSmall ? '80px' : '90%')
        }}
      >
        {card.name}
      </div>

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

      {/* Cost badge (if needed) */}
      {showCost && card.cost && !isInHand && (
        <div className="absolute top-2 left-2 bg-yellow-600 text-black text-sm font-bold px-2 py-1 rounded">
          {card.cost}
        </div>
      )}
    </div>
  );
};

export default CardComponent;
