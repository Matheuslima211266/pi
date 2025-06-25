
import React from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Sword, Zap, Shield, Home, Skull, Ban, EyeOff } from 'lucide-react';

const GameZones = ({ field, isEnemy, onCardClick, onAttack }) => {
  const renderZone = (cards, zoneName, icon, maxCards = 5, className = "") => {
    const slots = Array.from({ length: maxCards }, (_, index) => {
      const card = cards[index];
      return (
        <div 
          key={index} 
          className={`w-16 h-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-800/30 ${className}`}
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
              {React.cloneElement(icon, { size: 16 })}
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          {icon}
          <Badge variant="outline" className="text-xs">
            {zoneName}
          </Badge>
          <span className="text-xs text-gray-400">
            {cards.length}/{maxCards}
          </span>
        </div>
        <div className="flex gap-1 justify-center">
          {slots}
        </div>
      </div>
    );
  };

  const renderSingleZone = (cards, zoneName, icon, className = "") => {
    const card = cards.length > 0 ? cards[cards.length - 1] : null;
    
    return (
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          {icon}
          <Badge variant="outline" className="text-xs">
            {zoneName}
          </Badge>
          <span className="text-xs text-gray-400">
            {cards.length}
          </span>
        </div>
        <div className={`w-16 h-20 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-800/30 ${className}`}>
          {card ? (
            <CardComponent
              card={card}
              onClick={() => onCardClick && onCardClick(card)}
              isSmall={true}
              showCost={false}
            />
          ) : (
            <div className="text-gray-600 text-center">
              {React.cloneElement(icon, { size: 16 })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Prima riga: Zone speciali */}
      <div className="grid grid-cols-4 gap-2 justify-items-center">
        {renderSingleZone(field.graveyard || [], 'Cimitero', <Skull className="text-gray-400" size={14} />)}
        {renderSingleZone(field.banished || [], 'Banish', <Ban className="text-red-400" size={14} />)}
        {renderSingleZone(field.banishedFaceDown || [], 'Banish FD', <EyeOff className="text-purple-400" size={14} />)}
        {renderSingleZone(field.fieldSpell || [], 'Terreno', <Home className="text-green-400" size={14} />)}
      </div>
      
      {/* Zona Mostri */}
      {renderZone(field.monsters || [], 'Mostri', <Sword className="text-red-400" size={14} />, 5)}
      
      {/* Zona Magie e Trappole */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {renderZone(field.spells || [], 'Magie', <Zap className="text-green-400" size={14} />, 5)}
        </div>
        <div>
          {renderZone(field.traps || [], 'Trappole', <Shield className="text-purple-400" size={14} />, 5)}
        </div>
      </div>
    </div>
  );
};

export default GameZones;
