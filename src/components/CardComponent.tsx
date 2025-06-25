
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Zap, Sparkles, Star } from 'lucide-react';

const CardComponent = ({ 
  card, 
  onClick, 
  isPlayable = true, 
  isSmall = false,
  showCost = true,
  canAttack = false,
  isInHand = false,
  isFaceDown = false
}) => {
  const getAttributeColor = (attribute) => {
    switch (attribute?.toLowerCase()) {
      case 'light': return 'border-yellow-400 bg-yellow-900/20';
      case 'dark': return 'border-purple-400 bg-purple-900/20';
      case 'fire': return 'border-red-400 bg-red-900/20';
      case 'water': return 'border-blue-400 bg-blue-900/20';
      case 'earth': return 'border-green-400 bg-green-900/20';
      case 'wind': return 'border-cyan-400 bg-cyan-900/20';
      default: return 'border-gray-400 bg-gray-900/20';
    }
  };

  const getTypeColor = (cardType) => {
    switch (cardType) {
      case 'monster': return 'border-orange-400 bg-orange-900/20';
      case 'spell': return 'border-green-400 bg-green-900/20';
      case 'trap': return 'border-purple-400 bg-purple-900/20';
      default: return 'border-gray-400 bg-gray-900/20';
    }
  };

  const isMonster = card.card_type === 'monster' || card.atk !== undefined;

  // Se è coperta, mostra il retro della carta
  if (isFaceDown) {
    return (
      <Card 
        className={`
          bg-gradient-to-br from-blue-800 to-purple-800 border-2 border-blue-400
          ${isSmall ? 'w-28 h-40' : 'w-40 h-56'} 
          ${isPlayable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'opacity-50'} 
          transition-all duration-300 relative overflow-hidden
        `}
        onClick={() => isPlayable && onClick && onClick(card)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative p-2 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-lg mb-2">DUEL</div>
            <div className="text-white font-bold text-lg">CARDS</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`
        ${getAttributeColor(card.attribute)} 
        ${isSmall ? 'w-28 h-40' : 'w-40 h-56'} 
        ${isPlayable ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'opacity-50'} 
        ${canAttack ? 'ring-2 ring-red-400 animate-pulse' : ''}
        ${isInHand ? 'hover:-translate-y-2' : ''}
        transition-all duration-300 relative overflow-hidden
      `}
      onClick={() => isPlayable && onClick && onClick(card)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      
      <div className="relative p-2 h-full flex flex-col">
        {/* Header con nome e costo */}
        <div className="flex justify-between items-start mb-1">
          <h4 className={`font-semibold ${isSmall ? 'text-xs' : 'text-sm'} leading-tight flex-1 pr-1`}>
            {card.name}
          </h4>
          {showCost && card.cost && (
            <Badge className="bg-gold-600 text-black text-xs font-bold">
              {card.cost}
            </Badge>
          )}
        </div>

        {/* Tipo di carta */}
        {(card.type || card.card_type) && (
          <div className="mb-1">
            <Badge variant="outline" className={`text-xs ${isSmall ? 'px-1 py-0' : 'px-2 py-1'}`}>
              {card.type || card.card_type}
            </Badge>
          </div>
        )}

        {/* Immagine dalla URL */}
        <div className={`${isSmall ? 'h-12' : 'h-16'} bg-gray-800 rounded mb-1 flex items-center justify-center overflow-hidden`}>
          {card.art_link && card.art_link !== "NO ICON" ? (
            <img 
              src={card.art_link} 
              alt={card.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                const nextSibling = target.nextElementSibling as HTMLElement;
                target.style.display = 'none';
                if (nextSibling) nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`${card.art_link && card.art_link !== "NO ICON" ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600`}>
            {isMonster && <Sparkles className="text-white" size={isSmall ? 16 : 24} />}
            {card.card_type === 'spell' && <Zap className="text-white" size={isSmall ? 16 : 24} />}
            {card.card_type === 'trap' && <Star className="text-white" size={isSmall ? 16 : 24} />}
          </div>
        </div>

        {/* Livello come numero per mostri */}
        {isMonster && card.star && !isSmall && (
          <div className="text-center mb-1">
            <Badge className="bg-yellow-500 text-black text-xs font-bold">
              LV {card.star}
            </Badge>
          </div>
        )}

        {/* Statistiche per mostri */}
        {isMonster && (
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-1">
              <Sword size={isSmall ? 10 : 12} className="text-red-400" />
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-bold`}>
                {card.atk}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={isSmall ? 10 : 12} className="text-blue-400" />
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-bold`}>
                {card.def}
              </span>
            </div>
          </div>
        )}

        {/* Attributo */}
        {!isSmall && card.attribute && (
          <div className="absolute top-1 right-1">
            <Badge className="bg-black/50 text-white text-xs px-1 py-0">
              {card.attribute}
            </Badge>
          </div>
        )}

        {/* Effetto per carte non mostro (solo se non è small) */}
        {!isMonster && !isSmall && (
          <p className="text-xs text-gray-300 mt-1 line-clamp-2">
            {card.effect || card.desc}
          </p>
        )}
      </div>
    </Card>
  );
};

export default CardComponent;
