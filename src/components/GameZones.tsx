
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sword, Zap, Shield, Home, Skull, Ban, EyeOff } from 'lucide-react';
import ZoneManager from './ZoneManager';

const GameZones = ({ field, isEnemy, onCardClick, onCardPlace, selectedCardFromHand, onCardMove, onCardPreview }) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [expandedZone, setExpandedZone] = useState(null);

  const handleSlotClick = (zoneName, slotIndex) => {
    if (selectedCardFromHand && !isEnemy) {
      const faceDown = window.confirm("Vuoi posizionare la carta coperta? (OK = Coperta, Annulla = Scoperta)");
      onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, faceDown);
    }
  };

  const handleCardClick = (card) => {
    if (!isEnemy && card) {
      const effectKey = `${card.id}-${card.name}`;
      const newActivatedEffects = new Set(activatedEffects);
      
      if (activatedEffects.has(effectKey)) {
        newActivatedEffects.delete(effectKey);
      } else {
        newActivatedEffects.add(effectKey);
      }
      
      setActivatedEffects(newActivatedEffects);
      
      if (onCardClick) {
        onCardClick(card);
      }
    }
  };

  const isEffectActivated = (card) => {
    if (!card) return false;
    const effectKey = `${card.id}-${card.name}`;
    return activatedEffects.has(effectKey);
  };

  const handleZoneToggle = (zoneName) => {
    setExpandedZone(expandedZone === zoneName ? null : zoneName);
  };

  const renderZone = (cards, zoneName, icon, maxCards = 5, className = "") => {
    const slots = Array.from({ length: maxCards }, (_, index) => {
      const card = cards[index];
      const isHighlighted = selectedCardFromHand && !card && !isEnemy;
      
      return (
        <div 
          key={index} 
          className={`w-16 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all
            ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
            ${card ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}
            ${className}`}
          onClick={() => handleSlotClick(zoneName, index)}
        >
          {card ? (
            <div className="relative">
              <CardComponent
                card={card}
                onClick={() => handleCardClick(card)}
                isSmall={true}
                showCost={false}
                isFaceDown={card.faceDown}
              />
              {isEffectActivated(card) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
              )}
            </div>
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

  return (
    <div className="space-y-3">
      {/* Prima riga: Zone speciali con ZoneManager */}
      <div className="grid grid-cols-4 gap-2 justify-items-center">
        <ZoneManager
          cards={field.graveyard || []}
          zoneName="graveyard"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'graveyard'}
          onToggleExpand={() => handleZoneToggle('graveyard')}
        />
        
        <ZoneManager
          cards={field.banished || []}
          zoneName="banished"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banished'}
          onToggleExpand={() => handleZoneToggle('banished')}
        />
        
        <ZoneManager
          cards={field.banishedFaceDown || []}
          zoneName="banishedFaceDown"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banishedFaceDown'}
          onToggleExpand={() => handleZoneToggle('banishedFaceDown')}
        />
        
        <ZoneManager
          cards={field.fieldSpell || []}
          zoneName="fieldSpell"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'fieldSpell'}
          onToggleExpand={() => handleZoneToggle('fieldSpell')}
        />
      </div>
      
      {/* Zona Mostri */}
      {renderZone(field.monsters || [], 'monsters', <Sword className="text-red-400" size={14} />, 5)}
      
      {/* Zona Magie/Trappole Combinata */}
      {renderZone(field.spellsTraps || [], 'spellsTraps', <Zap className="text-green-400" size={14} />, 5)}

      {/* Istruzioni per il posizionamento */}
      {selectedCardFromHand && !isEnemy && (
        <div className="bg-blue-900/50 border border-blue-400 rounded p-2 mt-4">
          <p className="text-xs text-gray-300 text-center">
            Le zone evidenziate sono disponibili per posizionare la carta selezionata
          </p>
        </div>
      )}
    </div>
  );
};

export default GameZones;
