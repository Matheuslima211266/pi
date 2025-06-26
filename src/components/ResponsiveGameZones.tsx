
import React, { useState } from 'react';
import { Star, BookOpen, Skull, Ban } from 'lucide-react';
import ResponsiveGameZoneSlot from './ResponsiveGameZoneSlot';
import PlacementMenu from './PlacementMenu';
import ZoneManager from './ZoneManager';
import ZoneActionMenu from './ZoneActionMenu';
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
  const [zoneActionMenu, setZoneActionMenu] = useState(null);

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

  const handleZoneClick = (zoneName, event) => {
    if (isEnemy) return;
    
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setZoneActionMenu({
      zoneName,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  };

  const handleZoneAction = (action) => {
    const { zoneName } = zoneActionMenu;
    
    switch (action) {
      case 'draw':
        onDrawCard && onDrawCard();
        break;
      case 'mill':
        // Mill 1 carta dal deck al cimitero
        if (field.deck && field.deck.length > 0) {
          const cardToMill = field.deck[0];
          onCardMove && onCardMove(cardToMill, 'deck', 'graveyard');
        }
        break;
      case 'mill3':
        // Mill 3 carte dal deck al cimitero
        if (field.deck && field.deck.length > 0) {
          const cardsToMill = field.deck.slice(0, 3);
          cardsToMill.forEach(card => {
            onCardMove && onCardMove(card, 'deck', 'graveyard');
          });
        }
        break;
      case 'shuffle':
        console.log(`Shuffle ${zoneName}`);
        break;
      case 'view':
        setExpandedZone(zoneName);
        break;
    }
    
    setZoneActionMenu(null);
  };

  const renderZoneSlots = () => {
    const slots = [];
    
    if (zoneType === 'spellsTraps') {
      // Prima riga: Extra Deck/Deck, Spell/Trap slots, Banished Face-down
      if (isEnemy) {
        // Extra Deck per avversario (nascosto)
        slots.push(
          <div 
            key="extra-deck" 
            className="card-slot extra-deck-slot cursor-pointer"
            onClick={(e) => handleZoneClick('extraDeck', e)}
          >
            <div className="zone-label">Extra Deck</div>
            <div className="text-xl">⭐</div>
          </div>
        );
      } else {
        // Extra Deck per giocatore
        slots.push(
          <div 
            key="extra-deck" 
            className="card-slot extra-deck-slot cursor-pointer"
            onClick={(e) => handleZoneClick('extraDeck', e)}
          >
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
        <div 
          key="banished-facedown" 
          className="card-slot banished-facedown-slot cursor-pointer"
          onClick={(e) => handleZoneClick('banishedFaceDown', e)}
        >
          <div className="zone-label">Banish FD</div>
          <div className="text-xl">🔒</div>
        </div>
      );
    } else if (zoneType === 'monsters') {
      // Seconda riga: Deck, Monster slots, Banished
      if (!isEnemy) {
        // Deck per giocatore
        slots.push(
          <div 
            key="deck" 
            className="card-slot main-deck-slot cursor-pointer"
            onClick={(e) => handleZoneClick('deck', e)}
          >
            <div className="zone-label">Deck</div>
            <div className="text-xl">🃏</div>
          </div>
        );
      } else {
        // Deck per avversario
        slots.push(
          <div 
            key="deck" 
            className="card-slot main-deck-slot cursor-pointer"
            onClick={(e) => handleZoneClick('deck', e)}
          >
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
        <div 
          key="banished" 
          className="card-slot banished-slot cursor-pointer"
          onClick={(e) => handleZoneClick('banished', e)}
        >
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

      {/* Zone Action Menu */}
      {zoneActionMenu && (
        <ZoneActionMenu
          zoneName={zoneActionMenu.zoneName}
          onAction={handleZoneAction}
          onClose={() => setZoneActionMenu(null)}
          position={zoneActionMenu.position}
        />
      )}

      {/* Zone Manager espanse - FIXED: Ora passano onCardMove correttamente */}
      {expandedZone && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            {expandedZone === 'deck' && (
              <ZoneManager
                cards={field.deck || []}
                zoneName="deck"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => setExpandedZone(null)}
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
                onToggleExpand={() => setExpandedZone(null)}
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
                onToggleExpand={() => setExpandedZone(null)}
              />
            )}
            
            {expandedZone === 'banishedFaceDown' && (
              <ZoneManager
                cards={field.banishedFaceDown || []}
                zoneName="banishedFaceDown"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => setExpandedZone(null)}
              />
            )}

            {expandedZone === 'graveyard' && (
              <ZoneManager
                cards={field.graveyard || []}
                zoneName="graveyard"
                onCardMove={onCardMove}
                onCardPreview={onCardPreview}
                isExpanded={true}
                onToggleExpand={() => setExpandedZone(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveGameZones;
