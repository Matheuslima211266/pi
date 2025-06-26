
export const useGameZoneActions = ({ 
  field, 
  onCardPlace, 
  onCardMove, 
  onCardPreview, 
  onCardClick,
  selectedCardFromHand,
  setPlacementMenu,
  activatedEffects,
  setActivatedEffects 
}) => {
  const handleSlotClick = (zoneName, slotIndex, event) => {
    console.log('Slot clicked:', zoneName, slotIndex, 'selectedCard:', selectedCardFromHand);
    
    if (selectedCardFromHand) {
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

  const handlePlacementChoice = (choice, placementMenu) => {
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

  return {
    handleSlotClick,
    handlePlacementChoice,
    handleFieldCardAction,
    handleCardClick,
    isEffectActivated
  };
};
