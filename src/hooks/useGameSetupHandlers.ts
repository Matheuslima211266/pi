
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
      
      // Sincronizza le carte personalizzate per il multiplayer
      syncCustomCardsForMultiplayer(newGameData);
    }
    
    initializeGame();
  };

  const syncCustomCardsForMultiplayer = (gameData) => {
    // Se sei l'host, condividi le tue carte personalizzate
    if (gameData.isHost) {
      const customCards = localStorage.getItem('yugiduel_custom_cards');
      if (customCards) {
        // Salva le carte personalizzate con un key specifico per la partita
        localStorage.setItem(`yugiduel_shared_cards_${gameData.gameId}`, customCards);
      }
    } else {
      // Se sei il guest, prova a caricare le carte condivise dall'host
      const sharedCards = localStorage.getItem(`yugiduel_shared_cards_${gameData.gameId}`);
      if (sharedCards) {
        // Unisci le carte condivise con quelle personali del guest
        const existingCards = localStorage.getItem('yugiduel_custom_cards');
        let combinedCards = [];
        
        try {
          const shared = JSON.parse(sharedCards);
          const existing = existingCards ? JSON.parse(existingCards) : [];
          
          // Evita duplicati basandosi sull'ID
          const existingIds = new Set(existing.map(c => c.id));
          const uniqueShared = shared.filter(card => !existingIds.has(card.id));
          
          combinedCards = [...existing, ...uniqueShared];
          localStorage.setItem('yugiduel_custom_cards', JSON.stringify(combinedCards));
        } catch (error) {
          console.error('Error syncing shared cards:', error);
        }
      }
    }
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

    // Check deck size limits with more detailed feedback
    const errors = [];
    if (mainDeckCount < 40) {
      errors.push(`Main Deck troppo piccolo: ${mainDeckCount}/40 minimo`);
    }
    if (mainDeckCount > 60) {
      errors.push(`Main Deck troppo grande: ${mainDeckCount}/60 massimo`);
    }
    if (extraDeckCount > 15) {
      errors.push(`Extra Deck troppo grande: ${extraDeckCount}/15 massimo`);
    }

    // Check for card limits (max 3 copies per card)
    const cardCounts = new Map();
    [...deckData.mainDeck, ...deckData.extraDeck].forEach(card => {
      const count = cardCounts.get(card.id) || 0;
      cardCounts.set(card.id, count + 1);
    });

    for (const [cardId, count] of cardCounts) {
      if (count > 3) {
        const card = [...deckData.mainDeck, ...deckData.extraDeck].find(c => c.id === cardId);
        errors.push(`Troppe copie di "${card?.name || cardId}": ${count}/3 massimo`);
      }
    }

    if (errors.length > 0) {
      alert('Attenzioni/Errori nel deck:\n' + errors.join('\n') + '\n\nIl deck è stato comunque caricato.');
    }

    console.log('Deck structure check:', {
      hasCards: !!deckData.cards,
      cardCount: deckData.cards?.length || 0,
      hasMainDeck: !!deckData.mainDeck,
      mainDeckCount,
      hasExtraDeck: !!deckData.extraDeck,
      extraDeckCount,
      totalCards: deckData.totalCards || (mainDeckCount + extraDeckCount),
      deckName: deckData.name || 'Unnamed Deck',
      cardLimitChecks: Array.from(cardCounts.entries()).filter(([_, count]) => count > 3)
    });

    setPlayerDeckData(deckData);
    alert(`Deck "${deckData.name || 'Unnamed Deck'}" caricato con successo!\nMain Deck: ${mainDeckCount} carte\nExtra Deck: ${extraDeckCount} carte`);
    
    // Se siamo in multiplayer, notifica il cambio deck
    if (gameData?.gameId) {
      const deckChangeMessage = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        message: `📋 Deck "${deckData.name || 'Unnamed Deck'}" caricato (${mainDeckCount + extraDeckCount} carte)`
      };
      setChatMessages(prev => [...prev, deckChangeMessage]);
      setTimeout(() => syncGameState(), 100);
    }
  };

  return {
    handleGameStart,
    handlePlayerReady,
    handleDeckLoad
  };
};
