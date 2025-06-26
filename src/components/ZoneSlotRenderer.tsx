
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
          className="relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-40 border-2 border-purple-500 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2"
          onClick={(e) => handleZoneClick('extraDeck', e)}
        >
          <div className="text-purple-400 text-xs font-bold mb-1">Extra Deck</div>
          <div className="text-2xl">⭐</div>
          <div className="text-xs text-purple-300 font-bold mt-1">{(field.extraDeck || []).length}</div>
        </div>
      );

      // Zona Spell/Trap (5 slot)
      const spellTrapCards = field.spellsTraps || [];
      for (let i = 0; i < 5; i++) {
        const card = spellTrapCards[i];
        const isHighlighted = selectedCardFromHand && !card && !isEnemy;
        
        slots.push(
          <ResponsiveGameZoneSlot
            key={`spell-trap-${i}`}
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
        );
      }

      // Banished Face-down
      slots.push(
        <div 
          key="banished-facedown" 
          className="relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-40 border-2 border-red-500 bg-red-900/30 rounded-lg cursor-pointer hover:bg-red-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2"
          onClick={(e) => handleZoneClick('banishedFaceDown', e)}
        >
          <div className="text-red-400 text-xs font-bold mb-1">Banish FD</div>
          <div className="text-2xl">🔒</div>
          <div className="text-xs text-red-300 font-bold mt-1">{(field.banishedFaceDown || []).length}</div>
        </div>
      );
    } else if (zoneType === 'monsters') {
      // Seconda riga: Deck, Monster slots, Banished
      // Deck
      slots.push(
        <div 
          key="deck" 
          className="relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-40 border-2 border-green-500 bg-green-900/30 rounded-lg cursor-pointer hover:bg-green-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2"
          onClick={(e) => handleZoneClick('deck', e)}
        >
          <div className="text-green-400 text-xs font-bold mb-1">Deck</div>
          <div className="text-2xl">🃏</div>
          <div className="text-xs text-green-300 font-bold mt-1">{(field.deck || []).length}</div>
        </div>
      );

      // Zona Monster (5 slot)
      const monsterCards = field.monsters || [];
      for (let i = 0; i < 5; i++) {
        const card = monsterCards[i];
        const isHighlighted = selectedCardFromHand && !card && !isEnemy;
        
        slots.push(
          <ResponsiveGameZoneSlot
            key={`monster-${i}`}
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
        );
      }

      // Banished
      slots.push(
        <div 
          key="banished" 
          className="relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-40 border-2 border-purple-500 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2"
          onClick={(e) => handleZoneClick('banished', e)}
        >
          <div className="text-purple-400 text-xs font-bold mb-1">Banished</div>
          <div className="text-2xl">🚫</div>
          <div className="text-xs text-purple-300 font-bold mt-1">{(field.banished || []).length}</div>
        </div>
      );
    } else if (zoneType === 'deadZone') {
      // Dead Zone (sostituzione del cimitero) - Stile simile a Banished
      const deadZoneCards = field.deadZone || field.graveyard || []; // Fallback per compatibilità
      slots.push(
        <div 
          key="dead-zone" 
          className="relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 lg:w-28 lg:h-40 border-2 border-gray-500 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all duration-200 flex flex-col items-center justify-center p-2"
          onClick={(e) => handleZoneClick('deadZone', e)}
        >
          <div className="text-gray-400 text-xs font-bold mb-1">Dead Zone</div>
          <div className="text-2xl">💀</div>
          <div className="text-xs text-gray-300 font-bold mt-1">{deadZoneCards.length}</div>
        </div>
      );
    } else if (zoneType === 'fieldSpell') {
      // Field Spell zone
      const fieldCard = (field.fieldSpell || [])[0];
      const isHighlighted = selectedCardFromHand && !fieldCard && !isEnemy;
      
      slots.push(
        <ResponsiveGameZoneSlot
          key="field-spell"
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
      );
    }

    return slots;
  };

  return <>{renderZoneSlots()}</>;
};

export default ZoneSlotRenderer;
