
import React from 'react';
import ResponsiveGameZoneSlot from './ResponsiveGameZoneSlot';

const ZoneSlotRenderer = ({ 
  field,
  isEnemy,
  selectedCardFromHand,
  zoneType,
  handleSlotClick,
  onCardPreview,
  handleFieldCardAction,
  handleCardClick,
  isEffectActivated,
  handleZoneClick
}) => {
  const renderZoneSlots = () => {
    const slots = [];
    
    if (zoneType === 'spellsTraps') {
      // Prima riga: Extra Deck/Deck, Spell/Trap slots, Banished Face-down
      // Extra Deck
      slots.push(
        <div 
          key="extra-deck" 
          className="card-slot extra-deck-slot cursor-pointer"
          onClick={(e) => handleZoneClick('extraDeck', e)}
        >
          <div className="zone-label">Extra Deck</div>
          <div className="text-xl">⭐</div>
          <div className="zone-count">{(field.extraDeck || []).length}</div>
        </div>
      );

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
        <div 
          key="banished-facedown" 
          className="card-slot banished-facedown-slot cursor-pointer"
          onClick={(e) => handleZoneClick('banishedFaceDown', e)}
        >
          <div className="zone-label">Banish FD</div>
          <div className="text-xl">🔒</div>
          <div className="zone-count">{(field.banishedFaceDown || []).length}</div>
        </div>
      );
    } else if (zoneType === 'monsters') {
      // Seconda riga: Deck, Monster slots, Banished
      // Deck
      slots.push(
        <div 
          key="deck" 
          className="card-slot main-deck-slot cursor-pointer"
          onClick={(e) => handleZoneClick('deck', e)}
        >
          <div className="zone-label">Deck</div>
          <div className="text-xl">🃏</div>
          <div className="zone-count">{(field.deck || []).length}</div>
        </div>
      );

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
        <div 
          key="banished" 
          className="card-slot banished-slot cursor-pointer"
          onClick={(e) => handleZoneClick('banished', e)}
        >
          <div className="zone-label">Banished</div>
          <div className="text-xl">🚫</div>
          <div className="zone-count">{(field.banished || []).length}</div>
        </div>
      );
    } else if (zoneType === 'graveyard') {
      // Zona centrale per il graveyard
      slots.push(
        <div 
          key="graveyard" 
          className="card-slot graveyard-slot cursor-pointer"
          onClick={(e) => handleZoneClick('graveyard', e)}
        >
          <div className="zone-label">Graveyard</div>
          <div className="text-xl">💀</div>
          <div className="zone-count">{(field.graveyard || []).length}</div>
        </div>
      );
    } else if (zoneType === 'fieldSpell') {
      // Field Spell zone
      const fieldCard = (field.fieldSpell || [])[0];
      const isHighlighted = selectedCardFromHand && !fieldCard && !isEnemy;
      
      slots.push(
        <div key="field-spell" className="field-spell-zone">
          <ResponsiveGameZoneSlot
            card={fieldCard}
            zoneName="fieldSpell"
            slotIndex={0}
            icon="🏛️"
            isHighlighted={isHighlighted}
            onSlotClick={handleSlotClick}
            onCardPreview={onCardPreview}
            onFieldCardAction={handleFieldCardAction}
            onCardClick={handleCardClick}
            isEffectActivated={isEffectActivated}
            zoneLabel="Field Spell"
          />
        </div>
      );
    }

    return slots;
  };

  return <>{renderZoneSlots()}</>;
};

export default ZoneSlotRenderer;
