
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
    
    // Improved validation
    if (!deckData) {
      console.error('No deck data provided');
      alert('Errore: Nessun dato deck fornito');
      return;
    }

    // Validate deck structure
    let isValid = false;
    let mainDeckCount = 0;
    let extraDeckCount = 0;
    
    if (deckData.mainDeck && Array.isArray(deckData.mainDeck)) {
      mainDeckCount = deckData.mainDeck.length;
      isValid = true;
    }
    
    if (deckData.extraDeck && Array.isArray(deckData.extraDeck)) {
      extraDeckCount = deckData.extraDeck.length;
    }
    
    if (deckData.cards && Array.isArray(deckData.cards)) {
      // Fallback: if only cards array is provided, separate main and extra
      const mainCards = deckData.cards.filter(card => !card.extra_deck);
      const extraCards = deckData.cards.filter(card => card.extra_deck);
      
      if (!deckData.mainDeck) {
        deckData.mainDeck = mainCards;
        mainDeckCount = mainCards.length;
      }
      
      if (!deckData.extraDeck) {
        deckData.extraDeck = extraCards;
        extraDeckCount = extraCards.length;
      }
      
      isValid = true;
    }

    if (!isValid || mainDeckCount === 0) {
      console.error('Invalid deck structure:', deckData);
      alert('Errore: Deck non valido. Assicurati che il deck contenga almeno carte nel Main Deck.');
      return;
    }

    // Check deck size limits
    if (mainDeckCount < 40 || mainDeckCount > 60) {
      alert(`Attenzione: Il Main Deck deve avere tra 40 e 60 carte (attualmente: ${mainDeckCount})`);
    }
    
    if (extraDeckCount > 15) {
      alert(`Attenzione: L'Extra Deck può avere massimo 15 carte (attualmente: ${extraDeckCount})`);
    }

    console.log('Deck structure check:', {
      hasCards: !!deckData.cards,
      cardCount: deckData.cards?.length || 0,
      hasMainDeck: !!deckData.mainDeck,
      mainDeckCount,
      hasExtraDeck: !!deckData.extraDeck,
      extraDeckCount,
      totalCards: deckData.totalCards || (mainDeckCount + extraDeckCount),
      deckName: deckData.name || 'Unnamed Deck'
    });

    setPlayerDeckData(deckData);
    alert(`Deck "${deckData.name || 'Unnamed Deck'}" caricato con successo!\nMain Deck: ${mainDeckCount} carte\nExtra Deck: ${extraDeckCount} carte`);
  };

  return {
    handleGameStart,
    handlePlayerReady,
    handleDeckLoad
  };
};
