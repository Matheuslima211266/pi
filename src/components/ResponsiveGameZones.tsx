
import React, { useState } from 'react';
import { Star, BookOpen, Skull, Ban } from 'lucide-react';
import ResponsiveGameZoneSlot from './ResponsiveGameZoneSlot';
import PlacementMenu from './PlacementMenu';
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

  const renderZoneSlots = () => {
    const slots = [];
    
    if (zoneType === 'spellsTraps') {
      // Prima riga: Extra Deck/Deck, Spell/Trap slots, Graveyard/Banished
      if (isEnemy) {
        // Extra Deck per avversario (nascosto)
        slots.push(
          <div key="extra-deck" className="card-slot extra-deck-slot">
            <div className="zone-label">Extra Deck</div>
            <div className="text-xl">⭐</div>
          </div>
        );
      } else {
        // Extra Deck per giocatore
        slots.push(
          <div key="extra-deck" className="card-slot extra-deck-slot">
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

      // Graveyard
      slots.push(
        <div key="graveyard" className="card-slot graveyard-slot">
          <div className="zone-label">Graveyard</div>
          <div className="text-xl">💀</div>
        </div>
      );
    } else if (zoneType === 'monsters') {
      // Seconda riga: Deck, Monster slots, Banished
      if (!isEnemy) {
        // Deck per giocatore
        slots.push(
          <div key="deck" className="card-slot main-deck-slot">
            <div className="zone-label">Deck</div>
            <div className="text-xl">🃏</div>
          </div>
        );
      } else {
        // Deck per avversario
        slots.push(
          <div key="deck" className="card-slot main-deck-slot">
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
            />
          </div>
        );
      }

      // Banished
      slots.push(
        <div key="banished" className="card-slot banished-slot">
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
    </>
  );
};

export default ResponsiveGameZones;
