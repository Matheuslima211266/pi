
export const useDeckHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    playerField,
    setPlayerField,
    setPlayerHand,
    setActionLog,
    shuffleArray
  } = gameState;

  const handleDeckMill = (millCount = 1) => {
    if ((playerField.deck || []).length === 0) {
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: 'deck is empty - cannot mill cards',
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      return;
    }

    const deckCards = playerField.deck || [];
    const cardsToMill = deckCards.slice(0, Math.min(millCount, deckCards.length));
    
    setPlayerField(prev => ({
      ...prev,
      deck: prev.deck.slice(millCount),
      graveyard: [...(prev.graveyard || []), ...cardsToMill]
    }));

    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `milled ${cardsToMill.length} card${cardsToMill.length > 1 ? 's' : ''} from deck to graveyard`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    
    setTimeout(() => syncGameState(), 100);
  };

  const handleDrawCard = () => {
    if (playerField.deck.length > 0) {
      const drawnCard = playerField.deck[0];
      setPlayerHand(prevHand => [...prevHand, drawnCard]);
      setPlayerField(prev => ({ ...prev, deck: prev.deck.slice(1) }));
      
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: 'drew a card',
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      setTimeout(() => syncGameState(), 100);
    } else {
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: 'deck is empty!',
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      setTimeout(() => syncGameState(), 100);
    }
  };

  return {
    handleDeckMill,
    handleDrawCard
  };
};
