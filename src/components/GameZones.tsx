import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { Sword, Zap, Shield, Home, Skull, Ban, EyeOff, BookOpen, Star, Layers, ArrowUp, Shuffle, Eye } from 'lucide-react';
import ZoneManager from './ZoneManager';

const GameZones = ({ field, isEnemy, onCardClick, onCardPlace, selectedCardFromHand, onCardMove, onCardPreview, onDrawCard }) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [expandedZone, setExpandedZone] = useState(null);
  const [placementMenu, setPlacementMenu] = useState(null);

  const handleSlotClick = (zoneName, slotIndex, event) => {
    console.log('Slot clicked:', zoneName, slotIndex, 'selectedCard:', selectedCardFromHand);
    
    if (selectedCardFromHand && !isEnemy) {
      event.preventDefault();
      event.stopPropagation();
      
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
    console.log('Placement choice:', choice, placementMenu);
    
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
        
      case 'banishedFaceDown':
        onCardMove && onCardMove(selectedCardFromHand, 'hand', 'banishedFaceDown');
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

  const handleFieldCardAction = (card, action, destination) => {
    let sourceZone = '';
    let slotIndex = -1;
    
    if (field.monsters?.some((m, i) => m && m.id === card.id)) {
      sourceZone = 'monsters';
      slotIndex = field.monsters.findIndex(m => m && m.id === card.id);
    } else if (field.spellsTraps?.some((s, i) => s && s.id === card.id)) {
      sourceZone = 'spellsTraps';
      slotIndex = field.spellsTraps.findIndex(s => s && s.id === card.id);
    } else if (field.fieldSpell?.some((f, i) => f && f.id === card.id)) {
      sourceZone = 'fieldSpell';
      slotIndex = 0;
    }

    console.log(`Moving ${card.name} from ${sourceZone} to ${destination}`);

    switch (action) {
      case 'toHand':
        onCardMove && onCardMove(card, sourceZone, 'hand');
        break;
      case 'toGraveyard':
        onCardMove && onCardMove(card, sourceZone, 'graveyard');
        break;
      case 'toBanished':
        onCardMove && onCardMove(card, sourceZone, 'banished');
        break;
      case 'toBanishedFaceDown':
        onCardMove && onCardMove(card, sourceZone, 'banishedFaceDown');
        break;
      case 'toDeckTop':
        onCardMove && onCardMove(card, sourceZone, 'deck_top');
        break;
      case 'toDeckBottom':
        onCardMove && onCardMove(card, sourceZone, 'deck_bottom');
        break;
      case 'toDeckShuffle':
        onCardMove && onCardMove(card, sourceZone, 'deck_shuffle');
        break;
      case 'toExtraDeck':
        onCardMove && onCardMove(card, sourceZone, 'extraDeck');
        break;
      case 'flipCard':
        const updatedCard = { ...card, faceDown: !card.faceDown };
        onCardMove && onCardMove(updatedCard, sourceZone, 'flip_in_place', slotIndex);
        break;
    }
  };

  const handleCardClick = (card) => {
    if (card) {
      const effectKey = `${card.id}-${card.name}`;
      const newActivatedEffects = new Set(activatedEffects);
      
      if (activatedEffects.has(effectKey)) {
        newActivatedEffects.delete(effectKey);
      } else {
        newActivatedEffects.add(effectKey);
      }
      
      setActivatedEffects(newActivatedEffects);
      
      if (onCardPreview) {
        onCardPreview(card);
      }
      
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

  const renderFieldCardWithContextMenu = (card, zoneName, slotIndex) => {
    if (!card) return null;

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="relative">
            <CardComponent
              card={card}
              onClick={() => handleCardClick(card)}
              isSmall={true}
              showCost={false}
              isFaceDown={card.faceDown}
            />
            {isEffectActivated(card) && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
          <ContextMenuItem onClick={() => onCardPreview(card)} className="text-white hover:bg-gray-700">
            <Eye className="mr-2 h-4 w-4" />
            View Card
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toHand', 'hand')} className="text-white hover:bg-gray-700">
            <ArrowUp className="mr-2 h-4 w-4" />
            Return to Hand
          </ContextMenuItem>
          
          <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toGraveyard', 'graveyard')} className="text-white hover:bg-gray-700">
            <Skull className="mr-2 h-4 w-4" />
            Send to Graveyard
          </ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
              <Ban className="mr-2 h-4 w-4" />
              Banish Card
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-gray-800 border-gray-600">
              <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toBanished', 'banished')} className="text-white hover:bg-gray-700">
                Banish Face-up
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toBanishedFaceDown', 'banishedFaceDown')} className="text-white hover:bg-gray-700">
                Banish Face-down
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
              <BookOpen className="mr-2 h-4 w-4" />
              Return to Deck
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-gray-800 border-gray-600">
              <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toDeckTop', 'deck_top')} className="text-white hover:bg-gray-700">
                Top of Deck
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toDeckBottom', 'deck_bottom')} className="text-white hover:bg-gray-700">
                Bottom of Deck
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toDeckShuffle', 'deck_shuffle')} className="text-white hover:bg-gray-700">
                Shuffle into Deck
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem onClick={() => handleFieldCardAction(card, 'toExtraDeck', 'extraDeck')} className="text-white hover:bg-gray-700">
            <Star className="mr-2 h-4 w-4" />
            Add to Extra Deck
          </ContextMenuItem>

          {(zoneName === 'spellsTraps' || zoneName === 'monsters') && (
            <ContextMenuItem onClick={() => handleFieldCardAction(card, 'flipCard', 'flip')} className="text-white hover:bg-gray-700">
              {card.faceDown ? '🔄 Flip Face-up' : '🔒 Set Face-down'}
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderZone = (cards, zoneName, icon, maxCards = 5, className = "") => {
    const slots = Array.from({ length: maxCards }, (_, index) => {
      const card = cards[index];
      const isHighlighted = selectedCardFromHand && !card && !isEnemy;
      
      return (
        <div 
          key={index} 
          className={`w-12 h-16 border border-dashed rounded flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all text-xs
            ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
            ${card ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}
            ${className}`}
          onClick={(e) => handleSlotClick(zoneName, index, e)}
        >
          {card ? (
            renderFieldCardWithContextMenu(card, zoneName, index)
          ) : (
            <div className="text-gray-600 text-center">
              {React.cloneElement(icon, { size: 12 })}
            </div>
          )}
        </div>
      );
    });

    return (
      <div>
        <div className="flex items-center gap-1 mb-0.5">
          {React.cloneElement(icon, { size: 12 })}
          <Badge variant="outline" className="text-xs py-0 px-1 h-4">
            {zoneName}
          </Badge>
          <span className="text-xs text-gray-400">
            {cards.filter(c => c !== null).length}/{maxCards}
          </span>
        </div>
        <div className="flex gap-0.5 justify-center">
          {slots}
        </div>
      </div>
    );
  };

  const renderSingleSlotZone = (cards, zoneName, icon, title) => {
    const card = cards && cards.length > 0 ? cards[0] : null;
    const isHighlighted = selectedCardFromHand && !card && !isEnemy;
    
    return (
      <div>
        <div className="flex items-center gap-1 mb-0.5">
          {React.cloneElement(icon, { size: 12 })}
          <Badge variant="outline" className="text-xs py-0 px-1 h-4">
            {title}
          </Badge>
          <span className="text-xs text-gray-400">
            {card ? '1/1' : '0/1'}
          </span>
        </div>
        <div className="flex justify-center">
          <div 
            className={`w-12 h-16 border border-dashed rounded flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all
              ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
              ${card ? '' : 'hover:border-blue-400 hover:bg-blue-400/10'}`}
            onClick={(e) => handleSlotClick(zoneName, 0, e)}
          >
            {card ? (
              renderFieldCardWithContextMenu(card, zoneName, 0)
            ) : (
              <div className="text-gray-600 text-center">
                {React.cloneElement(icon, { size: 12 })}
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
      case 'banishedFaceDown':
        return [
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
      default:
        return [];
    }
  };

  return (
    <div className="h-full flex">
      {/* Left side - Zone managers - Ultra compact sidebar */}
      <div className="w-12 flex flex-col justify-center">
        {/* Deck - Top */}
        {!isEnemy && (
          <ZoneManager
            cards={field.deck || []}
            zoneName="deck"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={expandedZone === 'deck'}
            onToggleExpand={() => handleZoneToggle('deck')}
            onDrawCard={onDrawCard}
            isCompact={true}
          />
        )}
        
        <ZoneManager
          cards={field.graveyard || []}
          zoneName="graveyard"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'graveyard'}
          onToggleExpand={() => handleZoneToggle('graveyard')}
          isCompact={true}
        />
        
        <ZoneManager
          cards={field.banished || []}
          zoneName="banished"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banished'}
          onToggleExpand={() => handleZoneToggle('banished')}
          isCompact={true}
        />
        
        <ZoneManager
          cards={field.extraDeck || []}
          zoneName="extraDeck"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'extraDeck'}
          onToggleExpand={() => handleZoneToggle('extraDeck')}
          isHidden={isEnemy}
          isCompact={true}
        />
      </div>
      
      {/* Center - Main play field - Centered and compact */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-1">
        {/* Field Spell - Compact top */}
        <div className="self-start">
          {renderSingleSlotZone(field.fieldSpell || [], 'fieldSpell', <Shield className="text-purple-400" size={10} />, 'Field')}
        </div>
        
        {/* Monster Zone - Centered */}
        <div className="flex items-center justify-center">
          {renderZone(field.monsters || [], 'monsters', <Sword className="text-red-400" size={12} />, 5)}
        </div>
        
        {/* Spell/Trap Zone - Centered, no gap */}
        <div className="flex items-center justify-center">
          {renderZone(field.spellsTraps || [], 'spellsTraps', <Zap className="text-green-400" size={12} />, 5)}
        </div>
        
        {/* Banished Face Down - Compact bottom */}
        <div className="self-start">
          <ZoneManager
            cards={field.banishedFaceDown || []}
            zoneName="banishedFaceDown"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={expandedZone === 'banishedFaceDown'}
            onToggleExpand={() => handleZoneToggle('banishedFaceDown')}
            isCompact={true}
          />
        </div>
      </div>
      
      {/* Right side - Zone managers - Ultra compact sidebar */}
      <div className="w-12 flex flex-col justify-center">
        <ZoneManager
          cards={field.banishedFaceDown || []}
          zoneName="banishedFaceDown"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banishedFaceDown'}
          onToggleExpand={() => handleZoneToggle('banishedFaceDown')}
          isCompact={true}
        />
      </div>

      {/* Placement menu and overlays - keep existing code */}
      {placementMenu && (
        <div 
          className="fixed bg-gray-800 border border-gray-600 rounded-lg p-1 shadow-lg z-50 min-w-32"
          style={{ left: placementMenu.x, top: placementMenu.y }}
        >
          <div className="text-xs font-semibold mb-1 text-gray-300">
            {placementMenu.card?.name}
          </div>
          <div className="space-y-0.5">
            {getMenuOptions(placementMenu.zoneName).map((option) => (
              <Button 
                key={option.key}
                size="sm" 
                onClick={() => handlePlacementChoice(option.key)}
                className="w-full text-left justify-start text-xs h-5"
                variant="ghost"
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setPlacementMenu(null)}
            className="w-full mt-1 text-xs h-5"
          >
            Cancel
          </Button>
        </div>
      )}

      {selectedCardFromHand && !isEnemy && (
        <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-900/80 border border-blue-400 rounded p-1 z-10">
          <p className="text-xs text-gray-300 text-center">
            Click anywhere to place <strong>{selectedCardFromHand.name}</strong>
          </p>
        </div>
      )}

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
