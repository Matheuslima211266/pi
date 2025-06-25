
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sword, Zap, Shield, Home, Skull, Ban, EyeOff, BookOpen } from 'lucide-react';
import ZoneManager from './ZoneManager';

const GameZones = ({ field, isEnemy, onCardClick, onCardPlace, selectedCardFromHand, onCardMove, onCardPreview }) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [expandedZone, setExpandedZone] = useState(null);
  const [placementMenu, setPlacementMenu] = useState(null);

  const handleSlotClick = (zoneName, slotIndex, event: React.MouseEvent) => {
    if (selectedCardFromHand && !isEnemy) {
      if (zoneName === 'monsters') {
        // Mostra menu per posizione mostri
        setPlacementMenu({
          zoneName,
          slotIndex,
          type: 'monster',
          x: event.clientX,
          y: event.clientY
        });
      } else if (zoneName === 'spellsTraps') {
        // Mostra menu per spell/trap
        setPlacementMenu({
          zoneName,
          slotIndex,
          type: 'spellTrap',
          x: event.clientX,
          y: event.clientY
        });
      } else if (zoneName === 'fieldSpell') {
        // Field spell si piazza direttamente (ce ne può essere solo una)
        onCardPlace && onCardPlace(selectedCardFromHand, zoneName, 0, false);
      }
    }
  };

  const handlePlacementChoice = (choice) => {
    if (!placementMenu || !selectedCardFromHand) return;

    const { zoneName, slotIndex } = placementMenu;
    
    if (placementMenu.type === 'monster') {
      const faceDown = choice === 'facedown';
      const position = choice === 'defense' ? 'defense' : 'attack';
      onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, faceDown, position);
    } else if (placementMenu.type === 'spellTrap') {
      const faceDown = choice === 'set';
      onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, faceDown);
    }
    
    setPlacementMenu(null);
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
          onClick={(e) => handleSlotClick(zoneName, index, e)}
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

  const renderFieldSpellZone = () => {
    const fieldSpell = field.fieldSpell && field.fieldSpell.length > 0 ? field.fieldSpell[0] : null;
    const isHighlighted = selectedCardFromHand && !fieldSpell && !isEnemy;
    
    return (
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          <Shield className="text-purple-400" size={14} />
          <Badge variant="outline" className="text-xs">
            Field Spell
          </Badge>
          <span className="text-xs text-gray-400">
            {fieldSpell ? '1/1' : '0/1'}
          </span>
        </div>
        <div className="flex justify-center">
          <div 
            className={`w-16 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all
              ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
              ${fieldSpell ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}`}
            onClick={(e) => handleSlotClick('fieldSpell', 0, e)}
          >
            {fieldSpell ? (
              <div className="relative">
                <CardComponent
                  card={fieldSpell}
                  onClick={() => handleCardClick(fieldSpell)}
                  isSmall={true}
                  showCost={false}
                  isFaceDown={fieldSpell.faceDown}
                />
                {isEffectActivated(fieldSpell) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                )}
              </div>
            ) : (
              <div className="text-gray-600 text-center">
                <Shield size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Prima riga: Zone speciali con ZoneManager + Deck */}
      <div className="grid grid-cols-5 gap-2 justify-items-center">
        {!isEnemy && (
          <ZoneManager
            cards={field.deck || []}
            zoneName="deck"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={expandedZone === 'deck'}
            onToggleExpand={() => handleZoneToggle('deck')}
          />
        )}
        
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
        
        {/* Field Spell come zona singola normale */}
        <div className="w-16">
          {renderFieldSpellZone()}
        </div>
      </div>
      
      {/* Zona Mostri */}
      {renderZone(field.monsters || [], 'monsters', <Sword className="text-red-400" size={14} />, 5)}
      
      {/* Zona Magie/Trappole */}
      {renderZone(field.spellsTraps || [], 'spellsTraps', <Zap className="text-green-400" size={14} />, 5)}

      {/* Menu di piazzamento */}
      {placementMenu && (
        <div 
          className="fixed bg-gray-800 border border-gray-600 rounded-lg p-2 shadow-lg z-50"
          style={{ left: placementMenu.x, top: placementMenu.y }}
        >
          {placementMenu.type === 'monster' ? (
            <div className="space-y-1">
              <Button 
                size="sm" 
                onClick={() => handlePlacementChoice('attack')}
                className="w-full text-left justify-start"
              >
                Attack Position
              </Button>
              <Button 
                size="sm" 
                onClick={() => handlePlacementChoice('defense')}
                className="w-full text-left justify-start"
              >
                Defense Position
              </Button>
              <Button 
                size="sm" 
                onClick={() => handlePlacementChoice('facedown')}
                className="w-full text-left justify-start"
              >
                Face-down Defense
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <Button 
                size="sm" 
                onClick={() => handlePlacementChoice('activate')}
                className="w-full text-left justify-start"
              >
                Activate Now
              </Button>
              <Button 
                size="sm" 
                onClick={() => handlePlacementChoice('set')}
                className="w-full text-left justify-start"
              >
                Set Face-down
              </Button>
            </div>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setPlacementMenu(null)}
            className="w-full mt-2"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Istruzioni per il posizionamento */}
      {selectedCardFromHand && !isEnemy && (
        <div className="bg-blue-900/50 border border-blue-400 rounded p-2 mt-4">
          <p className="text-xs text-gray-300 text-center">
            Clicca su una zona evidenziata per posizionare la carta e scegliere la posizione
          </p>
        </div>
      )}

      {/* Overlay per chiudere il menu */}
      {placementMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setPlacementMenu(null)}
        />
      )}
    </div>
  );
};

export default GameZones;
