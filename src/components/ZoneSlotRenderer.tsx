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
  handleZoneClick,
  enemyField,
  onDealDamage
}) => {
  const renderZoneSlots = () => {
    const slots = [];
    
    if (zoneType === 'spellsTraps') {
      if (!isEnemy) {
        // Player: [Extra Deck][S/T][S/T][S/T][S/T][S/T][Dead Zone][Banished]
        slots.push(
          <div key="extra-deck" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-purple-500 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('extraDeck', e)}>
            <div className="text-purple-400 text-xs font-bold mb-1">Extra Deck</div>
            <div className="text-2xl">⭐</div>
            <div className="text-xs text-purple-300 font-bold mt-1">{(Array.isArray(field.extraDeck) ? field.extraDeck : []).length}</div>
          </div>
        );
        const spellTrapCards = Array.isArray(field.spellsTraps) ? field.spellsTraps : [];
        for (let i = 0; i < 5; i++) {
          const card = spellTrapCards[i];
          const isHighlighted = selectedCardFromHand && !card;
          
          slots.push(
            <ResponsiveGameZoneSlot
              key={`spell-trap-${i}`}
              card={card}
              zoneName="spellsTraps"
              slotIndex={i}
              icon="🛡️"
              isHighlighted={isHighlighted}
              onSlotClick={handleSlotClick}
              onCardPreview={onCardPreview}
              onFieldCardAction={handleFieldCardAction}
              onCardClick={handleCardClick}
              isEffectActivated={isEffectActivated}
              zoneLabel="Spell/Trap"
              enemyField={enemyField}
              isEnemy={isEnemy}
              onDealDamage={onDealDamage}
            />
          );
        }
        slots.push(
          <div key="dead-zone" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-gray-500 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('deadZone', e)}>
            <div className="text-gray-400 text-xs font-bold mb-1">Dead Zone</div>
            <div className="text-2xl">💀</div>
            <div className="text-xs text-gray-300 font-bold mt-1">{(Array.isArray(field.deadZone) ? field.deadZone : []).length}</div>
          </div>
        );
        slots.push(
          <div key="banished" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-purple-500 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('banished', e)}>
            <div className="text-purple-400 text-xs font-bold mb-1">Banished</div>
            <div className="text-2xl">🚫</div>
            <div className="text-xs text-purple-300 font-bold mt-1">{(Array.isArray(field.banished) ? field.banished : []).length}</div>
          </div>
        );
      } else {
        // Enemy: [Banished][Dead Zone][S/T][S/T][S/T][S/T][S/T][Extra Deck]
        slots.push(
          <div key="banished" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-purple-500 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('banished', e)}>
            <div className="text-purple-400 text-xs font-bold mb-1">Banished</div>
            <div className="text-2xl">🚫</div>
            <div className="text-xs text-purple-300 font-bold mt-1">{(Array.isArray(field.banished) ? field.banished : []).length}</div>
          </div>
        );
        slots.push(
          <div key="dead-zone" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-gray-500 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('deadZone', e)}>
            <div className="text-gray-400 text-xs font-bold mb-1">Dead Zone</div>
            <div className="text-2xl">💀</div>
            <div className="text-xs text-gray-300 font-bold mt-1">{(Array.isArray(field.deadZone) ? field.deadZone : []).length}</div>
          </div>
        );
        const spellTrapCards = Array.isArray(field.spellsTraps) ? field.spellsTraps : [];
        for (let i = 0; i < 5; i++) {
          const card = spellTrapCards[i];
          const isHighlighted = selectedCardFromHand && !card;
          
          slots.push(
            <ResponsiveGameZoneSlot
              key={`spell-trap-${i}`}
              card={card}
              zoneName="spellsTraps"
              slotIndex={i}
              icon="🛡️"
              isHighlighted={isHighlighted}
              onSlotClick={handleSlotClick}
              onCardPreview={onCardPreview}
              onFieldCardAction={handleFieldCardAction}
              onCardClick={handleCardClick}
              isEffectActivated={isEffectActivated}
              zoneLabel="Spell/Trap"
              enemyField={enemyField}
              isEnemy={isEnemy}
              onDealDamage={onDealDamage}
            />
          );
        }
        slots.push(
          <div key="extra-deck" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-purple-500 bg-purple-900/30 rounded-lg cursor-pointer hover:bg-purple-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('extraDeck', e)}>
            <div className="text-purple-400 text-xs font-bold mb-1">Extra Deck</div>
            <div className="text-2xl">⭐</div>
            <div className="text-xs text-purple-300 font-bold mt-1">{(Array.isArray(field.extraDeck) ? field.extraDeck : []).length}</div>
          </div>
        );
      }
    } else if (zoneType === 'monsters') {
      if (!isEnemy) {
        // Player: [Deck][Monster][Monster][Monster][Monster][Monster][Field][Banished FD]
        slots.push(
          <div key="deck" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-green-500 bg-green-900/30 rounded-lg cursor-pointer hover:bg-green-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('deck', e)}>
            <div className="text-green-400 text-xs font-bold mb-1">Deck</div>
            <div className="text-2xl">🃏</div>
            <div className="text-xs text-green-300 font-bold mt-1">{(Array.isArray(field.deck) ? field.deck : []).length}</div>
          </div>
        );
        const monsterCards = Array.isArray(field.monsters) ? field.monsters : [];
        for (let i = 0; i < 5; i++) {
          const card = monsterCards[i];
          const isHighlighted = selectedCardFromHand && !card;
          
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
              enemyField={enemyField}
              isEnemy={isEnemy}
              onDealDamage={onDealDamage}
            />
          );
        }
        // Field Spell slot (single card behaves like Spell/Trap)
        const playerFieldCard = (field.fieldSpell || [])[0];
        const isFieldHighlighted = selectedCardFromHand && !playerFieldCard;
        slots.push(
          <ResponsiveGameZoneSlot
            key="field-spell-player"
            card={playerFieldCard}
            zoneName="fieldSpell"
            slotIndex={0}
            icon="🏛️"
            isHighlighted={isFieldHighlighted}
            onSlotClick={handleSlotClick}
            onCardPreview={onCardPreview}
            onFieldCardAction={handleFieldCardAction}
            onCardClick={handleCardClick}
            isEffectActivated={isEffectActivated}
            zoneLabel="Field Spell"
            enemyField={enemyField}
            isEnemy={isEnemy}
            onDealDamage={onDealDamage}
          />
        );
        slots.push(
          <div key="banished-facedown" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-red-500 bg-red-900/30 rounded-lg cursor-pointer hover:bg-red-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('banishedFaceDown', e)}>
            <div className="text-red-400 text-xs font-bold mb-1">Banish FD</div>
            <div className="text-2xl">🔒</div>
            <div className="text-xs text-red-300 font-bold mt-1">{(Array.isArray(field.banishedFaceDown) ? field.banishedFaceDown : []).length}</div>
          </div>
        );
      } else {
        // Enemy: [Banished FD][Field][Monster][Monster][Monster][Monster][Monster][Deck]
        slots.push(
          <div key="banished-facedown" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-red-500 bg-red-900/30 rounded-lg cursor-pointer hover:bg-red-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('banishedFaceDown', e)}>
            <div className="text-red-400 text-xs font-bold mb-1">Banish FD</div>
            <div className="text-2xl">🔒</div>
            <div className="text-xs text-red-300 font-bold mt-1">{(Array.isArray(field.banishedFaceDown) ? field.banishedFaceDown : []).length}</div>
          </div>
        );
        // Field Spell slot (single card behaves like Spell/Trap)
        const enemyFieldCard = (field.fieldSpell || [])[0];
        const isEnemyFieldHighlighted = false; // enemy cannot highlight
        slots.push(
          <ResponsiveGameZoneSlot
            key="field-spell-enemy"
            card={enemyFieldCard}
            zoneName="fieldSpell"
            slotIndex={0}
            icon="🏛️"
            isHighlighted={isEnemyFieldHighlighted}
            onSlotClick={handleSlotClick}
            onCardPreview={onCardPreview}
            onFieldCardAction={handleFieldCardAction}
            onCardClick={handleCardClick}
            isEffectActivated={isEffectActivated}
            zoneLabel="Field Spell"
            enemyField={enemyField}
            isEnemy={isEnemy}
            onDealDamage={onDealDamage}
          />
        );
        const monsterCards = Array.isArray(field.monsters) ? field.monsters : [];
        for (let i = 0; i < 5; i++) {
          const card = monsterCards[i];
          const isHighlighted = selectedCardFromHand && !card;
          
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
              enemyField={enemyField}
              isEnemy={isEnemy}
              onDealDamage={onDealDamage}
            />
          );
        }
        slots.push(
          <div key="deck" className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-green-500 bg-green-900/30 rounded-lg cursor-pointer hover:bg-green-800/50 transition-all duration-200 flex flex-col items-center justify-center p-2" onClick={(e) => handleZoneClick('deck', e)}>
            <div className="text-green-400 text-xs font-bold mb-1">Deck</div>
            <div className="text-2xl">🃏</div>
            <div className="text-xs text-green-300 font-bold mt-1">{(Array.isArray(field.deck) ? field.deck : []).length}</div>
          </div>
        );
      }
    } else if (zoneType === 'deadZone') {
      // Dead Zone
      const deadZoneCards = field.deadZone || [];
      slots.push(
        <div 
          key="dead-zone" 
          className="relative w-full aspect-[5/7] min-w-[80px] border-2 border-gray-500 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-all duration-200 flex flex-col items-center justify-center p-2"
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
      const isHighlighted = !isEnemy && selectedCardFromHand && !fieldCard;
      
      slots.push(
        <div key="field-spell" className="w-full aspect-[5/7] min-w-[80px]">
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
            enemyField={enemyField}
            onDealDamage={onDealDamage}
          />
        </div>
      );
    }

    return slots;
  };

  return (
    <>
      {renderZoneSlots()}
    </>
  );
};

export default ZoneSlotRenderer;