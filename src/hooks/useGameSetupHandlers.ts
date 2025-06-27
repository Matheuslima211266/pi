
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
    // Ogni giocatore mantiene il proprio database di carte
    // L'host e il guest possono avere carte diverse e deck indipendenti
    
    if (gameData.isHost) {
      console.log('[MULTIPLAYER] Host: mantengo il mio database di carte');
      // L'host usa le sue carte personalizzate
      const hostCards = localStorage.getItem('yugiduel_custom_cards');
      if (hostCards) {
        // Opzionalmente, l'host può condividere alcune carte
        const sharedKey = `yugiduel_shared_cards_${gameData.gameId}`;
        localStorage.setItem(sharedKey, hostCards);
        console.log('[MULTIPLAYER] Host: carte condivise salvate');
      }
    } else {
      console.log('[MULTIPLAYER] Guest: mantengo il mio database di carte');
      // Il guest mantiene le sue carte personalizzate
      // Ma può anche accedere alle carte condivise dall'host se disponibili
      const sharedCards = localStorage.getItem(`yugiduel_shared_cards_${gameData.gameId}`);
      if (sharedCards) {
        try {
          const shared = JSON.parse(sharedCards);
          const existingCards = localStorage.getItem('yugiduel_custom_cards');
          let guestCards = existingCards ? JSON.parse(existingCards) : [];
          
          // Aggiungi le carte condivise al database del guest (senza sovrascrivere)
          const existingIds = new Set(guestCards.map(c => c.id));
          const uniqueShared = shared.filter(card => !existingIds.has(card.id));
          
          if (uniqueShared.length > 0) {
            guestCards = [...guestCards, ...uniqueShared];
            localStorage.setItem('yugiduel_custom_cards', JSON.stringify(guestCards));
            console.log(`[MULTIPLAYER] Guest: ${uniqueShared.length} carte condivise aggiunte al database`);
          }
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

    // Assicurati che tutte le carte del deck siano nel database personale
    const allDeckCards = [...deckData.mainDeck, ...deckData.extraDeck];
    const uniqueDeckCards = allDeckCards.reduce((acc, card) => {
      if (!acc.find(c => c.id === card.id)) {
        acc.push(card);
      }
      return acc;
    }, []);

    // Salva le carte mancanti nel database personale
    const savedCards = localStorage.getItem('yugiduel_custom_cards');
    const customCards = savedCards ? JSON.parse(savedCards) : [];
    const existingIds = new Set(customCards.map(c => c.id));
    const newCards = uniqueDeckCards.filter(card => !existingIds.has(card.id));

    if (newCards.length > 0) {
      const updatedCustomCards = [...customCards, ...newCards];
      localStorage.setItem('yugiduel_custom_cards', JSON.stringify(updatedCustomCards));
      console.log(`${newCards.length} nuove carte aggiunte al database personale`);
    }

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
