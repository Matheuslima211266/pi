
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
      event?.preventDefault();
      event?.stopPropagation();
      
      setPlacementMenu({
        zoneName,
        slotIndex,
        x: event?.clientX || 0,
        y: event?.clientY || 0,
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
        
      case 'deadZone':
        onCardMove && onCardMove(selectedCardFromHand, 'hand', 'deadZone');
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

  const handleFieldCardAction = (action, card, zoneName, slotIndex) => {
    console.log(`Field card action: ${action} on ${card.name} in ${zoneName} at slot ${slotIndex}`);

    switch (action) {
      case 'destroy':
        onCardMove && onCardMove(card, zoneName, 'deadZone');
        break;
      case 'banish':
        onCardMove && onCardMove(card, zoneName, 'banished');
        break;
      case 'toHand':
        onCardMove && onCardMove(card, zoneName, 'hand');
        break;
      case 'toDeadZone':
        onCardMove && onCardMove(card, zoneName, 'deadZone');
        break;
      case 'toBanished':
        onCardMove && onCardMove(card, zoneName, 'banished');
        break;
      case 'toBanishedFaceDown':
        onCardMove && onCardMove(card, zoneName, 'banishedFaceDown');
        break;
      case 'toDeckTop':
        onCardMove && onCardMove(card, zoneName, 'deck_top');
        break;
      case 'toDeckBottom':
        onCardMove && onCardMove(card, zoneName, 'deck_bottom');
        break;
      case 'toDeckShuffle':
        onCardMove && onCardMove(card, zoneName, 'deck_shuffle');
        break;
      case 'toExtraDeck':
        onCardMove && onCardMove(card, zoneName, 'extraDeck');
        break;
      case 'changePosition':
        const newPosition = card.position === 'attack' ? 'defense' : 'attack';
        const updatedCard = { ...card, position: newPosition };
        console.log('Changing position from', card.position, 'to', newPosition);
        onCardMove && onCardMove(updatedCard, zoneName, 'flip_in_place', slotIndex);
        break;
      case 'flipCard':
        const flippedCard = { ...card, faceDown: !card.faceDown };
        onCardMove && onCardMove(flippedCard, zoneName, 'flip_in_place', slotIndex);
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
