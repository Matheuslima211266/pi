
import React, { useState } from 'react';
import { Star, BookOpen, Skull, Ban } from 'lucide-react';
import ResponsiveGameZoneSlot from './ResponsiveGameZoneSlot';
import PlacementMenu from './PlacementMenu';
import ZoneManager from './ZoneManager';
import { useGameZoneActions } from './GameZoneActions';

const ResponsiveGameZones = ({ 
  field, 
  isEnemy, 
  onCardClick, 
  onCardPlace, 
  selectedCardFromHand, 
  onCardMove, 
  onCardPreview, 
  onDrawCard,
  zoneType 
}) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [placementMenu, setPlacementMenu] = useState(null);
  const [expandedZone, setExpandedZone] = useState(null);
  const [isZoneStable, setIsZoneStable] = useState(true);

  const {
    handleSlotClick,
    handlePlacementChoice,
    handleFieldCardAction,
    handleCardClick,
    isEffectActivated
  } = useGameZoneActions({
    field,
    onCardPlace,
    onCardMove,
    onCardPreview,
    onCardClick,
    selectedCardFromHand,
    setPlacementMenu,
    activatedEffects,
    setActivatedEffects
  });

  const handlePlacementChoiceWrapper = (choice) => {
    handlePlacementChoice(choice, placementMenu);
  };

  const handleZoneToggle = (zoneName) => {
    setIsZoneStable(false);
    setTimeout(() => {
      setExpandedZone(expandedZone === zoneName ? null : zoneName);
      setIsZoneStable(true);
    }, 50);
  };

  const renderZoneSlots = () => {
    const slots = [];
    
    if (zoneType === 'spellsTraps') {
      // Prima riga: Extra Deck/Deck, Spell/Trap slots, Banished Face-down
      if (isEnemy) {
        // Extra Deck per avversario (nascosto)
        slots.push(
          <div key="extra-deck" className="card-slot extra-deck-slot" onClick={() => handleZoneToggle('extraDeck')}>
            <div className="zone-label">Extra Deck</div>
            <div className="text-xl">⭐</div>
          </div>
        );
      } else {
        // Extra Deck per giocatore
        slots.push(
          <div key="extra-deck" className="card-slot extra-deck-slot" onClick={() => handleZoneToggle('extraDeck')}>
            <div className="zone-label">Extra Deck</div>
            <div className="text-xl">⭐</div>
          </div>
        );
      }

      // Zona Spell/Trap (5 slot)
      const spellTrapCards = field.spellsTraps || [];
      for (let i = 0; i < 5; i++) {
        const card = spellTrapCards[i];
        const isHighlighted = selectedCardFromHand && !card && !isEnemy;
        
        slots.push(
          <div key={`spell-trap-${i}`} className="spell-trap-zone">
            <ResponsiveGameZoneSlot
              card={card}
              zoneName="spellsTraps"
              slotIndex={i}
              icon="⚡"
              isHighlighted={isHighlighted}
              onSlotClick={handleSlotClick}
              onCardPreview={onCardPreview}
              onFieldCardAction={handleFieldCardAction}
              onCardClick={handleCardClick}
              isEffectActivated={isEffectActivated}
              zoneLabel="S/T"
            />
          </div>
        );
      }

      // Banished Face-down
      slots.push(
        <div key="banished-facedown" className="card-slot banished-facedown-slot" onClick={() => handleZoneToggle('banishedFaceDown')}>
          <div className="zone-label">Banish FD</div>
          <div className="text-xl">🔒</div>
        </div>
      );
    } else if (zoneType === 'monsters') {
      // Seconda riga: Deck, Monster slots, Banished
      if (!isEnemy) {
        // Deck per giocatore
        slots.push(
          <div key="deck" className="card-slot main-deck-slot" onClick={() => handleZoneToggle('deck')}>
            <div className="zone-label">Deck</div>
            <div className="text-xl">🃏</div>
          </div>
        );
      } else {
        // Deck per avversario
        slots.push(
          <div key="deck" className="card-slot main-deck-slot" onClick={() => handleZoneToggle('deck')}>
            <div className="zone-label">Deck</div>
            <div className="text-xl">🃏</div>
          </div>
        );
      }

      // Zona Monster (5 slot)
      const monsterCards = field.monsters || [];
      for (let i = 0; i < 5; i++) {
        const card = monsterCards[i];
        const isHighlighted = selectedCardFromHand && !card && !isEnemy;
        const isDefensePosition = card && card.position === 'defense';
        
        slots.push(
          <div key={`monster-${i}`} className="monster-zone">
            <ResponsiveGameZoneSlot
              card={card}
              zoneName="monsters"
              slotIndex={i}
              icon="🐉"
              isHighlighted={isHighlighted}
              onSlotClick={handleSlotClick}
              onCardPreview={onCardPreview}
              onFieldCardAction={handleFieldCardAction}
              onCardClick={handleCardClick}
              isEffectActivated={isEffectActivated}
              zoneLabel="Monster"
              className={isDefensePosition ? 'card-defense-position' : ''}
            />
          </div>
        );
      }

      // Banished
      slots.push(
        <div key="banished" className="card-slot banished-slot" onClick={() => handleZoneToggle('banished')}>
          <div className="zone-label">Banished</div>
          <div className="text-xl">🚫</div>
        </div>
      );
    }

    return slots;
  };

  return (
    <>
      {renderZoneSlots()}

      {/* Menu di piazzamento */}
      <PlacementMenu
        placementMenu={placementMenu}
        onPlacementChoice={handlePlacementChoiceWrapper}
        onClose={() => setPlacementMenu(null)}
      />

      {/* Zone Manager espanse - Solo se stabile */}
      {expandedZone && isZoneStable && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => handleZoneToggle(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            {expandedZone === 'deck' && (
              <ZoneManager
                cards={field.deck || []}
                zoneName="deck"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => handleZoneToggle(null)}
                onDrawCard={onDrawCard}
              />
            )}
            
            {expandedZone === 'extraDeck' && (
              <ZoneManager
                cards={field.extraDeck || []}
                zoneName="extraDeck"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => handleZoneToggle(null)}
                isHidden={isEnemy}
              />
            )}
            
            {expandedZone === 'banished' && (
              <ZoneManager
                cards={field.banished || []}
                zoneName="banished"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => handleZoneToggle(null)}
              />
            )}
            
            {expandedZone === 'banishedFaceDown' && (
              <ZoneManager
                cards={field.banishedFaceDown || []}
                zoneName="banishedFaceDown"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => handleZoneToggle(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveGameZones;
