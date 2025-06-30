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
    if (selectedCardFromHand && event) {
      event.preventDefault();
      event.stopPropagation();
      
      // Usa le coordinate del click per posizionare il menu
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const menuData = {
        zoneName,
        slotIndex,
        x: x,
        y: y,
        card: selectedCardFromHand,
        event: event
      };

      setPlacementMenu(menuData);
    }
  };

  const handlePlacementChoice = (choice, placementMenu) => {
    console.log('🎯 [DEBUG] handlePlacementChoice called', {
      choice: choice,
      placementMenu: placementMenu,
      selectedCardFromHand: selectedCardFromHand,
      hasPlacementMenu: !!placementMenu,
      hasSelectedCard: !!selectedCardFromHand,
      timestamp: Date.now()
    });
    
    if (!placementMenu || !selectedCardFromHand) {
      console.log('❌ [DEBUG] handlePlacementChoice - Missing data', {
        hasPlacementMenu: !!placementMenu,
        hasSelectedCard: !!selectedCardFromHand
      });
      return;
    }

    const { zoneName, slotIndex } = placementMenu;
    
    console.log('🎯 [DEBUG] handlePlacementChoice - Processing placement', {
      zoneName: zoneName,
      slotIndex: slotIndex,
      choice: choice,
      card: selectedCardFromHand,
      cardName: selectedCardFromHand.name,
      cardId: selectedCardFromHand.id
    });
    
    switch (zoneName) {
      case 'monsters':
        console.log('🎯 [DEBUG] handlePlacementChoice - Placing monster', {
          choice: choice,
          card: selectedCardFromHand.name
        });
        if (choice === 'attack') {
          console.log('🎯 [DEBUG] handlePlacementChoice - Calling onCardPlace for attack position');
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, false, 'attack');
        } else if (choice === 'defense') {
          console.log('🎯 [DEBUG] handlePlacementChoice - Calling onCardPlace for defense position');
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, false, 'defense');
        } else if (choice === 'facedown') {
          console.log('🎯 [DEBUG] handlePlacementChoice - Calling onCardPlace for facedown');
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, true, 'defense');
        }
        break;
        
      case 'spellsTraps':
        console.log('🎯 [DEBUG] handlePlacementChoice - Placing spell/trap', {
          choice: choice,
          card: selectedCardFromHand.name
        });
        if (choice === 'activate') {
          console.log('🎯 [DEBUG] handlePlacementChoice - Calling onCardPlace for activate');
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, false);
        } else if (choice === 'set') {
          console.log('🎯 [DEBUG] handlePlacementChoice - Calling onCardPlace for set');
          onCardPlace && onCardPlace(selectedCardFromHand, zoneName, slotIndex, true);
        }
        break;
        
      case 'fieldSpell':
        console.log('🎯 [DEBUG] handlePlacementChoice - Placing field spell');
        onCardPlace && onCardPlace(selectedCardFromHand, zoneName, 0, false);
        break;
        
      case 'deadZone':
        console.log('🎯 [DEBUG] handlePlacementChoice - Moving to dead zone');
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
    
    console.log('🎯 [DEBUG] handlePlacementChoice - Closing placement menu');
    setPlacementMenu(null);
  };

  const handleFieldCardAction = (action, card, zoneName, slotIndex) => {
    console.log(`Field card action: ${action} on ${card.name || 'card'} in ${zoneName} at slot ${slotIndex}`);

    switch (action) {
      case 'destroy':
        onCardMove && onCardMove(card, zoneName, 'deadZone');
        break;
      case 'banish':
        onCardMove && onCardMove(card, zoneName, 'banished');
        break;
      case 'banishFaceDown':
        onCardMove && onCardMove(card, zoneName, 'banishedFaceDown');
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
        console.log('Toggling position for card:', card.name, 'current:', card.position);
        const toggledPosition = card.position === 'attack' ? 'defense' : 'attack';
        onCardMove && onCardMove({ ...card, position: toggledPosition }, zoneName, zoneName, slotIndex);
        break;
      case 'flipCard':
        const flippedCard = { ...card, faceDown: !card.faceDown };
        onCardMove && onCardMove(flippedCard, zoneName, 'flip_in_place', slotIndex);
        break;
      case 'updateATK':
        // Aggiorna l'ATK mantenendo la carta nella stessa zona
        console.log('Updating ATK for card:', card.name, 'to:', card.atk);
        // Passiamo lo stesso zoneName sia come origine che destinazione così
        // useCardMoveHandlers capirà che deve semplicemente aggiornare la carta in situ
        onCardMove && onCardMove(card, zoneName, zoneName, slotIndex);
        break;
      case 'dealDamage':
        console.log('Dealing damage:', card.damage, 'to enemy:', card.isToEnemy);
        // This should trigger a damage event to the parent component
        if (onCardMove) {
          onCardMove(card, 'damage', 'lifePoints', null);
        }
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
    handleFieldCardAction,
    handleCardClick,
    isEffectActivated
  };
};
