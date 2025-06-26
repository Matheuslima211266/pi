
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
  position = 'attack'
}) => {
  const isMonster = card.card_type === 'monster' || card.atk !== undefined;
  const isDefensePosition = position === 'defense' || card.position === 'defense';

  // Se è coperta, mostra il retro della carta
  if (isFaceDown) {
    return (
      <div 
        className={`
          ${isSmall ? 'w-28 h-40' : 'w-50 h-72'} 
          bg-gradient-to-br from-blue-800 to-purple-800 border-3 border-blue-400
          ${isPlayable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'opacity-50'} 
          ${isDefensePosition ? 'transform rotate-90' : ''}
          transition-all duration-300 relative overflow-hidden rounded-xl
        `}
        onClick={() => isPlayable && onClick && onClick(card)}
        style={{
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-lg mb-2">DUEL</div>
            <div className="text-white font-bold text-lg">CARDS</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        ${isSmall ? 'w-28 h-40' : 'w-50 h-72'} 
        bg-gradient-to-br from-slate-700 to-slate-800 border-3 border-yellow-500
        ${isPlayable ? 'cursor-pointer hover:-translate-y-1 hover:scale-105' : 'opacity-50'} 
        ${canAttack ? 'ring-2 ring-red-400 animate-pulse' : ''}
        ${isInHand ? 'hover:-translate-y-2' : ''}
        ${isDefensePosition ? 'transform rotate-90' : ''}
        transition-all duration-300 relative overflow-hidden rounded-xl
      `}
      onClick={() => isPlayable && onClick && onClick(card)}
      style={{
        boxShadow: isPlayable ? '0 8px 25px rgba(0,0,0,0.5)' : '0 4px 15px rgba(0,0,0,0.3)',
        background: 'linear-gradient(135deg, #2a3b5c, #1a2a3a)'
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
        className={`w-full ${isSmall ? 'h-20' : 'h-44'} bg-gray-800 border-b-2 border-yellow-500 bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: card.art_link && card.art_link !== "NO ICON" ? `url(${card.art_link})` : 'none'
        }}
      >
        {(!card.art_link || card.art_link === "NO ICON") && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className={`text-white ${isSmall ? 'text-2xl' : 'text-4xl'}`}>
              {isMonster ? '🐉' : card.card_type === 'spell' ? '⚡' : '🪤'}
            </div>
          </div>
        )}
      </div>

      {/* Level Stars (for monsters) */}
      {isMonster && card.star && (
        <div 
          className="absolute top-2 right-2 bg-black/80 text-yellow-500 px-2 py-1 rounded-xl font-bold border border-yellow-500"
          style={{ fontSize: isSmall ? '10px' : '14px' }}
        >
          {'★'.repeat(Math.min(card.star, 12))}
        </div>
      )}

      {/* Card Stats Section */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex flex-col justify-center items-center gap-2"
        style={{
          height: isSmall ? '40%' : '40%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95))'
        }}
      >
        {/* Monster Stats */}
        {isMonster && (
          <div className="flex justify-around w-full px-3">
            <div className="text-center">
              <div className={`text-yellow-500 font-bold ${isSmall ? 'text-xs' : 'text-sm'} mb-1`}>
                ATK
              </div>
              <div 
                className={`text-red-400 font-bold ${isSmall ? 'text-lg' : 'text-2xl'}`}
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
              >
                {card.atk}
              </div>
            </div>
            <div className="text-center">
              <div className={`text-yellow-500 font-bold ${isSmall ? 'text-xs' : 'text-sm'} mb-1`}>
                DEF
              </div>
              <div 
                className={`text-blue-400 font-bold ${isSmall ? 'text-lg' : 'text-2xl'}`}
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
            <div className={`text-yellow-500 font-bold ${isSmall ? 'text-xs' : 'text-sm'} mb-1`}>
              {card.card_type?.toUpperCase()}
            </div>
            {!isSmall && card.effect && (
              <div className="text-gray-300 text-xs line-clamp-2">
                {card.effect.substring(0, 60)}...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Name */}
      <div 
        className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-yellow-500 font-bold text-center max-w-full px-2 ${isSmall ? 'text-xs' : 'text-sm'}`}
        style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: isSmall ? '100px' : '180px'
        }}
      >
        {card.name}
      </div>

      {/* Position indicator for monsters */}
      {isMonster && !isSmall && (
        <div className="absolute top-2 left-2">
          <div className={`text-xs px-1 py-0 rounded ${isDefensePosition ? 'bg-blue-500' : 'bg-red-500'} text-white`}>
            {isDefensePosition ? 'DEF' : 'ATK'}
          </div>
        </div>
      )}

      {/* Cost badge (if needed) */}
      {showCost && card.cost && (
        <div className="absolute top-2 left-2 bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded">
          {card.cost}
        </div>
      )}
    </div>
  );
};

export default CardComponent;
