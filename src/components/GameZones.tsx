
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sword, Zap, Shield, Home, Skull, Ban, EyeOff, RotateCcw } from 'lucide-react';

const GameZones = ({ field, isEnemy, onCardClick, onCardPlace }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const handleSlotClick = (zoneName, slotIndex) => {
    if (selectedCard && selectedZone === zoneName) {
      // Mostra opzioni per posizionare la carta
      const faceDown = window.confirm("Vuoi posizionare la carta coperta? (OK = Coperta, Annulla = Scoperta)");
      onCardPlace && onCardPlace(selectedCard, zoneName, slotIndex, faceDown);
      setSelectedCard(null);
      setSelectedZone(null);
    } else {
      setSelectedZone(zoneName);
    }
  };

  const renderZone = (cards, zoneName, icon, maxCards = 5, className = "") => {
    const slots = Array.from({ length: maxCards }, (_, index) => {
      const card = cards[index];
      const isSelected = selectedZone === zoneName && !card;
      
      return (
        <div 
          key={index} 
          className={`w-16 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all
            ${isSelected ? 'border-yellow-400 bg-yellow-400/20' : 'border-gray-600'}
            ${card ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}
            ${className}`}
          onClick={() => !isEnemy && handleSlotClick(zoneName, index)}
        >
          {card ? (
            <CardComponent
              card={card}
              onClick={() => {
                if (onCardClick) onCardClick(card);
              }}
              isSmall={true}
              showCost={false}
              canAttack={!isEnemy && zoneName === 'monsters'}
              isFaceDown={card.faceDown}
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
          {selectedZone === zoneName && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-5 px-2"
              onClick={() => setSelectedZone(null)}
            >
              Annulla
            </Button>
          )}
        </div>
        <div className="flex gap-1 justify-center">
          {slots}
        </div>
      </div>
    );
  };

  const renderSingleZone = (cards, zoneName, icon, className = "") => {
    const card = cards.length > 0 ? cards[cards.length - 1] : null;
    const isSelected = selectedZone === zoneName && !card;
    
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
        <div 
          className={`w-16 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all
            ${isSelected ? 'border-yellow-400 bg-yellow-400/20' : 'border-gray-600'}
            ${card ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}
            ${className}`}
          onClick={() => !isEnemy && handleSlotClick(zoneName, 0)}
        >
          {card ? (
            <CardComponent
              card={card}
              onClick={() => onCardClick && onCardClick(card)}
              isSmall={true}
              showCost={false}
              isFaceDown={card.faceDown}
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
      {renderZone(field.monsters || [], 'monsters', <Sword className="text-red-400" size={14} />, 5)}
      
      {/* Zona Magie/Trappole Combinata */}
      {renderZone(field.spellsTraps || [], 'spellsTraps', <Zap className="text-green-400" size={14} />, 5)}

      {/* Controlli per carte selezionate */}
      {selectedCard && (
        <div className="bg-blue-900/50 border border-blue-400 rounded p-2 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">Carta selezionata: {selectedCard.name}</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedCard(null)}
            >
              Deseleziona
            </Button>
          </div>
          <p className="text-xs text-gray-300">
            Clicca su una zona per posizionare la carta
          </p>
        </div>
      )}
    </div>
  );
};

export default GameZones;
