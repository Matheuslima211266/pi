
import React, { useState } from 'react';
import { Sword, Zap, Shield, BookOpen, Skull, Ban, Star } from 'lucide-react';
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
  onDrawCard 
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

  // Renderizza le 7 slot per ogni zona
  const renderZoneSlots = (cards, zoneName, maxSlots = 5) => {
    const slots = [];
    
    // Extra Deck (slot 0)
    if (zoneName === 'player' && !isEnemy) {
      slots.push(
        <div key="extra-deck" className="card-slot extra-deck-slot">
          <div className="text-purple-400 text-xs text-center">
            <Star size={16} />
            <div>EXTRA</div>
          </div>
        </div>
      );
    } else if (isEnemy) {
      slots.push(<div key="empty-0" className="card-slot opacity-50"></div>);
    }

    // Deck (slot 1)
    if (zoneName === 'player' && !isEnemy) {
      slots.push(
        <div key="deck" className="card-slot main-deck-slot">
          <div className="text-green-400 text-xs text-center">
            <BookOpen size={16} />
            <div>DECK</div>
          </div>
        </div>
      );
    } else if (isEnemy) {
      slots.push(<div key="empty-1" className="card-slot opacity-50"></div>);
    }

    // Zona Monster (slot 2-6)
    const monsterZone = zoneName === 'monsters' ? cards : (field.monsters || []);
    for (let i = 0; i < maxSlots; i++) {
      const card = monsterZone[i];
      const isHighlighted = selectedCardFromHand && !card && !isEnemy;
      
      slots.push(
        <ResponsiveGameZoneSlot
          key={`monster-${i}`}
          card={card}
          zoneName="monsters"
          slotIndex={i}
          icon={<Sword className="text-red-400" size={16} />}
          isHighlighted={isHighlighted}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
          className="monster-zone"
        />
      );
    }

    return slots;
  };

  const renderSpellTrapZone = (cards, maxSlots = 5) => {
    const slots = [];
    
    // Graveyard (slot 0)
    slots.push(
      <div key="graveyard" className="card-slot graveyard-slot">
        <div className="text-orange-400 text-xs text-center">
          <Skull size={16} />
          <div>GY</div>
        </div>
      </div>
    );

    // Banished (slot 1)  
    slots.push(
      <div key="banished" className="card-slot banished-slot">
        <div className="text-pink-400 text-xs text-center">
          <Ban size={16} />
          <div>BAN</div>
        </div>
      </div>
    );

    // Zona Spell/Trap (slot 2-6)
    const spellTrapCards = field.spellsTraps || [];
    for (let i = 0; i < maxSlots; i++) {
      const card = spellTrapCards[i];
      const isHighlighted = selectedCardFromHand && !card && !isEnemy;
      
      slots.push(
        <ResponsiveGameZoneSlot
          key={`spell-trap-${i}`}
          card={card}
          zoneName="spellsTraps"
          slotIndex={i}
          icon={<Zap className="text-green-400" size={16} />}
          isHighlighted={isHighlighted}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
          className="spell-trap-zone"
        />
      );
    }

    return slots;
  };

  return (
    <>
      {/* Prima riga - Zona Mostri */}
      <div className="contents">
        {renderZoneSlots(field.monsters, 'monsters', 5)}
      </div>
      
      {/* Seconda riga - Zona Magie/Trappole */}
      <div className="contents">
        {renderSpellTrapZone(field.spellsTraps, 5)}
      </div>

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
