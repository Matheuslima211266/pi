
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sword, Zap, Shield, Home, Skull, Ban, EyeOff, BookOpen, Star, Layers } from 'lucide-react';
import ZoneManager from './ZoneManager';

const GameZones = ({ field, isEnemy, onCardClick, onCardPlace, selectedCardFromHand, onCardMove, onCardPreview }) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [expandedZone, setExpandedZone] = useState(null);
  const [placementMenu, setPlacementMenu] = useState(null);

  const handleSlotClick = (zoneName, slotIndex, event: React.MouseEvent) => {
    if (selectedCardFromHand && !isEnemy) {
      // Menu universale per tutte le destinazioni
      setPlacementMenu({
        zoneName,
        slotIndex,
        x: event.clientX,
        y: event.clientY,
        card: selectedCardFromHand
      });
    }
  };

  const handlePlacementChoice = (choice) => {
    if (!placementMenu || !selectedCardFromHand) return;

    const { zoneName, slotIndex } = placementMenu;
    
    switch (zoneName) {
      case 'monsters':
        if (choice === 'attack') {
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, false, 'attack');
        } else if (choice === 'defense') {
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, false, 'defense');
        } else if (choice === 'facedown') {
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, true, 'defense');
        }
        break;
        
      case 'spellsTraps':
        if (choice === 'activate') {
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, false);
        } else if (choice === 'set') {
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, true);
        }
        break;
        
      case 'fieldSpell':
        onCardPlace && onCardPlace(selectedCardFromHand, zoneName, 0, false);
        break;
        
      case 'pendulumLeft':
      case 'pendulumRight':
        onCardPlace && onCardPlace(selectedCardFromHand, zoneName, 0, false);
        break;
        
      case 'graveyard':
        onCardMove && onCardMove(selectedCardFromHand, 'hand', 'graveyard');
        break;
        
      case 'banished':
        if (choice === 'faceup') {
          onCardMove && onCardMove(selectedCardFromHand, 'hand', 'banished');
        } else if (choice === 'facedown') {
          onCardMove && onCardMove(selectedCardFromHand, 'hand', 'banishedFaceDown');
        }
        break;
        
      case 'extraDeck':
        onCardMove && onCardMove(selectedCardFromHand, 'hand', 'extraDeck');
        break;
        
      case 'deck':
        if (choice === 'top') {
          onCardMove && onCardMove(selectedCardFromHand, 'hand', 'deck_top');
        } else if (choice === 'bottom') {
          onCardMove && onCardMove(selectedCardFromHand, 'hand', 'deck_bottom');
        } else if (choice === 'shuffle') {
          onCardMove && onCardMove(selectedCardFromHand, 'hand', 'deck_shuffle');
        }
        break;
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

  const renderSingleSlotZone = (cards, zoneName, icon, title) => {
    const card = cards && cards.length > 0 ? cards[0] : null;
    const isHighlighted = selectedCardFromHand && !card && !isEnemy;
    
    return (
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          {icon}
          <Badge variant="outline" className="text-xs">
            {title}
          </Badge>
          <span className="text-xs text-gray-400">
            {card ? '1/1' : '0/1'}
          </span>
        </div>
        <div className="flex justify-center">
          <div 
            className={`w-16 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all
              ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
              ${card ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}`}
            onClick={(e) => handleSlotClick(zoneName, 0, e)}
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
        </div>
      </div>
    );
  };

  const getMenuOptions = (zoneName) => {
    switch (zoneName) {
      case 'monsters':
        return [
          { key: 'attack', label: 'Attack Position', icon: '⚔️' },
          { key: 'defense', label: 'Defense Position', icon: '🛡️' },
          { key: 'facedown', label: 'Face-down Defense', icon: '🔒' }
        ];
      case 'spellsTraps':
        return [
          { key: 'activate', label: 'Activate Now', icon: '⚡' },
          { key: 'set', label: 'Set Face-down', icon: '🔒' }
        ];
      case 'graveyard':
        return [
          { key: 'send', label: 'Send to Graveyard', icon: '💀' }
        ];
      case 'banished':
        return [
          { key: 'faceup', label: 'Banish Face-up', icon: '🚫' },
          { key: 'facedown', label: 'Banish Face-down', icon: '👁️' }
        ];
      case 'deck':
        return [
          { key: 'top', label: 'Top of Deck', icon: '🔝' },
          { key: 'bottom', label: 'Bottom of Deck', icon: '🔽' },
          { key: 'shuffle', label: 'Shuffle into Deck', icon: '🔀' }
        ];
      case 'extraDeck':
        return [
          { key: 'add', label: 'Add to Extra Deck', icon: '⭐' }
        ];
      case 'fieldSpell':
        return [
          { key: 'activate', label: 'Activate Field Spell', icon: '🏛️' }
        ];
      case 'pendulumLeft':
      case 'pendulumRight':
        return [
          { key: 'activate', label: 'Activate Pendulum', icon: '🔄' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-3">
      {/* Prima riga: Zone speciali con ZoneManager + Extra Deck */}
      <div className="grid grid-cols-6 gap-2 justify-items-center">
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
        
        {/* Extra Deck */}
        <ZoneManager
          cards={field.extraDeck || []}
          zoneName="extraDeck"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'extraDeck'}
          onToggleExpand={() => handleZoneToggle('extraDeck')}
        />
        
        {/* Field Spell */}
        <div className="w-16">
          {renderSingleSlotZone(field.fieldSpell || [], 'fieldSpell', <Shield className="text-purple-400" size={14} />, 'Field')}
        </div>
      </div>
      
      {/* Pendulum Scales */}
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {renderSingleSlotZone(field.pendulumLeft || [], 'pendulumLeft', <Star className="text-orange-400" size={14} />, 'Pendulum L')}
        {renderSingleSlotZone(field.pendulumRight || [], 'pendulumRight', <Star className="text-orange-400" size={14} />, 'Pendulum R')}
      </div>
      
      {/* Zona Mostri */}
      {renderZone(field.monsters || [], 'monsters', <Sword className="text-red-400" size={14} />, 5)}
      
      {/* Zona Magie/Trappole */}
      {renderZone(field.spellsTraps || [], 'spellsTraps', <Zap className="text-green-400" size={14} />, 5)}

      {/* Menu di piazzamento universale */}
      {placementMenu && (
        <div 
          className="fixed bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-50 min-w-48"
          style={{ left: placementMenu.x, top: placementMenu.y }}
        >
          <div className="text-sm font-semibold mb-2 text-gray-300">
            {placementMenu.card?.name}
          </div>
          <div className="space-y-1">
            {getMenuOptions(placementMenu.zoneName).map((option) => (
              <Button 
                key={option.key}
                size="sm" 
                onClick={() => handlePlacementChoice(option.key)}
                className="w-full text-left justify-start text-xs"
                variant="ghost"
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setPlacementMenu(null)}
            className="w-full mt-3 text-xs"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Istruzioni per il posizionamento */}
      {selectedCardFromHand && !isEnemy && (
        <div className="bg-blue-900/50 border border-blue-400 rounded p-2 mt-4">
          <p className="text-xs text-gray-300 text-center">
            Clicca su qualsiasi zona per posizionare <strong>{selectedCardFromHand.name}</strong>
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Movimento libero - Nessuna restrizione
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
