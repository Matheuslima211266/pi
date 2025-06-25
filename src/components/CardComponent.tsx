
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
  isInHand = false
}) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'ultra-rare': return 'bg-purple-600 text-white';
      case 'rare': return 'bg-blue-600 text-white';
      case 'common': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'monster': return 'border-orange-400 bg-orange-900/20';
      case 'spell': return 'border-green-400 bg-green-900/20';
      case 'trap': return 'border-purple-400 bg-purple-900/20';
      default: return 'border-gray-400 bg-gray-900/20';
    }
  };

  const getAttributeIcon = (attribute) => {
    switch (attribute) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'earth': return '🌍';
      case 'wind': return '💨';
      case 'light': return '☀️';
      case 'dark': return '🌙';
      default: return '⭐';
    }
  };

  return (
    <Card 
      className={`
        ${getTypeColor(card.type)} 
        ${isSmall ? 'w-20 h-28' : 'w-40 h-56'} 
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
          <h4 className={`font-semibold ${isSmall ? 'text-xs' : 'text-sm'} leading-tight`}>
            {card.name}
          </h4>
          {showCost && (
            <Badge className="bg-gold-600 text-black text-xs font-bold">
              {card.cost}
            </Badge>
          )}
        </div>

        {/* Immagine placeholder */}
        <div className={`${isSmall ? 'h-8' : 'h-20'} bg-gradient-to-br from-blue-500 to-purple-600 rounded mb-1 flex items-center justify-center`}>
          {card.type === 'monster' && <Sparkles className="text-white" size={isSmall ? 16 : 24} />}
          {card.type === 'spell' && <Zap className="text-white" size={isSmall ? 16 : 24} />}
          {card.type === 'trap' && <Star className="text-white" size={isSmall ? 16 : 24} />}
        </div>

        {/* Attributo per mostri */}
        {card.type === 'monster' && card.attribute && !isSmall && (
          <div className="text-center mb-1">
            <span className="text-lg">{getAttributeIcon(card.attribute)}</span>
          </div>
        )}

        {/* Statistiche per mostri */}
        {card.type === 'monster' && (
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-1">
              <Sword size={isSmall ? 10 : 12} className="text-red-400" />
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-bold`}>
                {card.attack}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Shield size={isSmall ? 10 : 12} className="text-blue-400" />
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-bold`}>
                {card.defense}
              </span>
            </div>
          </div>
        )}

        {/* Rarità */}
        {!isSmall && (
          <div className="absolute top-1 right-1">
            <Badge className={`${getRarityColor(card.rarity)} text-xs px-1 py-0`}>
              {card.rarity === 'ultra-rare' ? 'UR' : 
               card.rarity === 'rare' ? 'R' : 'C'}
            </Badge>
          </div>
        )}

        {/* Descrizione per carte non mostro (solo se non è small) */}
        {card.type !== 'monster' && !isSmall && (
          <p className="text-xs text-gray-300 mt-1 line-clamp-3">
            {card.description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default CardComponent;
