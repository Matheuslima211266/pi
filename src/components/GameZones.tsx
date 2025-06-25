
import React from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Sword, Zap, Shield } from 'lucide-react';

const GameZones = ({ field, isEnemy, onCardClick, onAttack }) => {
  const renderZone = (cards, zoneName, icon, maxCards = 5) => {
    const slots = Array.from({ length: maxCards }, (_, index) => {
      const card = cards[index];
      return (
        <div 
          key={index} 
          className="w-24 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-800/30"
        >
          {card ? (
            <CardComponent
              card={card}
              onClick={() => {
                if (onCardClick) onCardClick(card);
                if (onAttack && zoneName === 'mostri' && !isEnemy) {
                  onAttack(card);
                }
              }}
              isSmall={true}
              showCost={false}
              canAttack={!isEnemy && zoneName === 'mostri'}
            />
          ) : (
            <div className="text-gray-600 text-center">
              {React.cloneElement(icon, { size: 20 })}
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <Badge variant="outline" className="text-xs">
            {zoneName.charAt(0).toUpperCase() + zoneName.slice(1)}
          </Badge>
          <span className="text-sm text-gray-400">
            {cards.length}/{maxCards}
          </span>
        </div>
        <div className="flex gap-2 justify-center">
          {slots}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Zona Mostri */}
      {renderZone(field.monsters, 'mostri', <Sword className="text-red-400" size={16} />)}
      
      {/* Zona Magie e Trappole */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {renderZone(field.spells, 'magie', <Zap className="text-green-400" size={16} />, 3)}
        </div>
        <div>
          {renderZone(field.traps, 'trappole', <Shield className="text-purple-400" size={16} />, 3)}
        </div>
      </div>
    </div>
  );
};

export default GameZones;
