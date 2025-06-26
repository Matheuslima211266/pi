
export const useCardHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    setPlayerHand,
    setSelectedCardFromHand,
    setPlayerField,
    setActionLog,
    setPreviewCard
  } = gameState;

  const handleCardPlace = (card, zoneName, slotIndex, isFaceDown = false, position = null) => {
    console.log(`Placing card ${card.name} in ${zoneName} at index ${slotIndex}`);

    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setSelectedCardFromHand(null);

    setPlayerField(prev => {
      const newField = { ...prev };

      if (zoneName === 'monsters') {
        newField.monsters = [...prev.monsters];
        newField.monsters[slotIndex] = { ...card, faceDown: isFaceDown, position: position };
      } else if (zoneName === 'spellsTraps') {
        newField.spellsTraps = [...prev.spellsTraps];
        newField.spellsTraps[slotIndex] = { ...card, faceDown: isFaceDown };
      } else if (zoneName === 'fieldSpell') {
        newField.fieldSpell = [{ ...card, faceDown: isFaceDown }];
      }

      console.log('Updated field after card placement:', newField);
      return newField;
    });

    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `placed ${card.name} in ${zoneName}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    
    setTimeout(() => syncGameState(), 100);
  };

  const handleCardClick = (card) => {
    setPreviewCard(card);
  };

  return {
    handleCardPlace,
    handleCardClick
  };
};
