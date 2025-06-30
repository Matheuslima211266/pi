export const useDeckHandlers = (gameState) => {
  const {
    gameData,
    playerField,
    enemyField,
    setPlayerField,
    setEnemyField,
    setPlayerHand,
    setEnemyHandCount,
    setActionLog,
    shuffleArray
  } = gameState;

  const handleDeckMill = (millCount = 1, isPlayer = true) => {
    console.log(`🎲 Mill ${millCount} cards for ${isPlayer ? 'player' : 'enemy'}`);
    
    const currentField = isPlayer ? playerField : enemyField;
    const setField = isPlayer ? setPlayerField : setEnemyField;
    
    if ((currentField.deck || []).length === 0) {
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: `${isPlayer ? 'player' : 'enemy'} deck is empty - cannot mill cards`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      return;
    }

    const deckCards = currentField.deck || [];
    const cardsToMill = deckCards.slice(0, Math.min(millCount, deckCards.length));
    
    setField(prev => ({
      ...prev,
      deck: prev.deck.slice(millCount),
      deadZone: [...(prev.deadZone || []), ...cardsToMill]
    }));

    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `${isPlayer ? 'player' : 'enemy'} milled ${cardsToMill.length} card${cardsToMill.length > 1 ? 's' : ''} from deck to dead zone`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const handleDrawCard = (isPlayer = true) => {
    console.log(`🎴 Draw card for ${isPlayer ? 'player' : 'enemy'}`);
    
    const currentField = isPlayer ? playerField : enemyField;
    const setField = isPlayer ? setPlayerField : setEnemyField;
    
    if (currentField.deck.length > 0) {
      const drawnCard = currentField.deck[0];
      
      if (isPlayer) {
        setPlayerHand(prevHand => [...prevHand, drawnCard]);
      } else {
        // For enemy, just update the hand count
        setEnemyHandCount(prev => prev + 1);
      }
      
      setField(prev => ({ ...prev, deck: prev.deck.slice(1) }));
      
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: `${isPlayer ? 'player' : 'enemy'} drew a card`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
    } else {
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: `${isPlayer ? 'player' : 'enemy'} deck is empty!`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
    }
  };

  return {
    handleDeckMill,
    handleDrawCard
  };
};
