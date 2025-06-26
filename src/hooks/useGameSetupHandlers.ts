
export const useGameSetupHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    setGameData,
    setGameStarted,
    setPlayerDeckData,
    setPlayerReady,
    setActionLog,
    setChatMessages,
    initializeGame
  } = gameState;

  const handleGameStart = (newGameData) => {
    console.log('Game started with data:', newGameData);
    setGameData(newGameData);
    setGameStarted(true);
    
    if (newGameData.gameId) {
      const stateKey = `yugiduel_state_${newGameData.gameId}`;
      localStorage.removeItem(stateKey);
    }
    
    initializeGame();
  };

  const handlePlayerReady = () => {
    setPlayerReady(true);
    
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: 'is ready to duel!',
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    
    const readyMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: '✅ Ready to duel!'
    };
    setChatMessages(prev => [...prev, readyMessage]);
    
    setTimeout(() => syncGameState(), 100);
  };

  const handleDeckLoad = (deckData) => {
    console.log('Deck loaded:', deckData);
    console.log('Deck structure check:', {
      hasCards: !!deckData.cards,
      cardCount: deckData.cards?.length || 0,
      hasMainDeck: !!deckData.mainDeck,
      mainDeckCount: deckData.mainDeck?.length || 0,
      hasExtraDeck: !!deckData.extraDeck,
      extraDeckCount: deckData.extraDeck?.length || 0,
      totalCards: deckData.totalCards
    });
    setPlayerDeckData(deckData);
  };

  return {
    handleGameStart,
    handlePlayerReady,
    handleDeckLoad
  };
};
