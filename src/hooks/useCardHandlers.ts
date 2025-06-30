import { removeCardFromZone, addCardToZone } from '@/utils/gameHelpers';

export const useCardHandlers = (gameState) => {
  const {
    gameData,
    setPlayerHand,
    setSelectedCardFromHand,
    setPlayerField,
    setActionLog,
    setPreviewCard
  } = gameState;

  const handleCardPlace = (card, zoneName, slotIndex, isFaceDown = false, position = null) => {
    // Rimuovi la carta dalla mano in modo sicuro
    setPlayerHand(prev => {
      const newHand = removeCardFromZone(card, prev, 'hand');
      return newHand;
    });
    
    setSelectedCardFromHand(null);

    // Prepara la carta per il campo
    const fieldCard = {
      ...card,
      position: position || 'attack',
      faceDown: isFaceDown,
      zone: zoneName,
      slotIndex: slotIndex
    };

    setPlayerField(prev => {
      const newField = { ...prev };

      if (zoneName === 'monsters') {
        newField.monsters = addCardToZone(fieldCard, prev.monsters, 'monsters', slotIndex);
      } else if (zoneName === 'spellsTraps') {
        newField.spellsTraps = addCardToZone(fieldCard, prev.spellsTraps, 'spellsTraps', slotIndex);
      } else if (zoneName === 'fieldSpell') {
        newField.fieldSpell = addCardToZone(fieldCard, prev.fieldSpell, 'fieldSpell');
      }

      return newField;
    });

    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `placed ${card.name} in ${zoneName}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const handleCardPreview = (card) => {
    if (card && gameState.previewCard && card.id === gameState.previewCard.id) {
      setPreviewCard(null);
    } else {
      setPreviewCard(card);
    }
  };

  return {
    handleCardPlace,
    handleCardPreview
  };
};
