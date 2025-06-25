
export const useGameHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    setGameData,
    setGameStarted,
    setPlayerDeckData,
    playerField,
    setPlayerField,
    setPlayerHand,
    setSelectedCardFromHand,
    setPreviewCard,
    setCurrentPhase,
    setIsPlayerTurn,
    setTimeRemaining,
    setActionLog,
    setChatMessages,
    setPlayerLifePoints,
    setEnemyLifePoints,
    shuffleArray,
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

  const handleDeckLoad = (deckData) => {
    console.log('Deck loaded:', deckData);
    setPlayerDeckData(deckData);
  };

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

      return newField;
    });

    const newAction = {
      id: Date.now(),
      player: gameData.playerName,
      action: `placed ${card.name} in ${zoneName}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    
    setTimeout(() => syncGameState(), 100);
  };

  const handleCardMove = (card, fromZone, toZone, slotIndex = null) => {
    console.log(`Moving card ${card.name} from ${fromZone} to ${toZone}`);
    
    if (toZone === 'flip_in_place') {
      if (fromZone === 'monsters') {
        setPlayerField(prev => {
          const newField = { ...prev };
          newField.monsters = [...prev.monsters];
          newField.monsters[slotIndex] = card;
          return newField;
        });
      } else if (fromZone === 'spellsTraps') {
        setPlayerField(prev => {
          const newField = { ...prev };
          newField.spellsTraps = [...prev.spellsTraps];
          newField.spellsTraps[slotIndex] = card;
          return newField;
        });
      }
      
      const newAction = {
        id: Date.now(),
        player: gameData.playerName,
        action: `${card.faceDown ? 'set' : 'flipped'} ${card.name} ${card.faceDown ? 'face-down' : 'face-up'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      setTimeout(() => syncGameState(), 100);
      return;
    }

    // Remove from source zone
    if (fromZone === 'hand') {
      setPlayerHand(hand => hand.filter(c => c.id !== card.id));
    } else {
      setPlayerField(prev => {
        const newField = { ...prev };

        if (fromZone === 'monsters') {
          newField.monsters = [...prev.monsters];
          const sourceIndex = prev.monsters.findIndex(m => m && m.id === card.id);
          if (sourceIndex !== -1) newField.monsters[sourceIndex] = null;
        } else if (fromZone === 'spellsTraps') {
          newField.spellsTraps = [...prev.spellsTraps];
          const sourceIndex = prev.spellsTraps.findIndex(s => s && s.id === card.id);
          if (sourceIndex !== -1) newField.spellsTraps[sourceIndex] = null;
        } else if (fromZone === 'fieldSpell') {
          newField.fieldSpell = [];
        } else if (fromZone === 'graveyard') {
          newField.graveyard = prev.graveyard.filter(c => c.id !== card.id);
        } else if (fromZone === 'banished') {
          newField.banished = prev.banished.filter(c => c.id !== card.id);
        } else if (fromZone === 'banishedFaceDown') {
          newField.banishedFaceDown = prev.banishedFaceDown.filter(c => c.id !== card.id);
        } else if (fromZone === 'extraDeck') {
          newField.extraDeck = prev.extraDeck.filter(c => c.id !== card.id);
        } else if (fromZone === 'deck') {
          newField.deck = prev.deck.filter(c => c.id !== card.id);
        }

        return newField;
      });
    }

    // Add to destination zone
    if (toZone === 'hand') {
      setPlayerHand(hand => [...hand, card]);
    } else {
      setPlayerField(prev => {
        const newField = { ...prev };

        if (toZone === 'monsters') {
          newField.monsters = [...prev.monsters];
          if (slotIndex !== null) {
            newField.monsters[slotIndex] = card;
          }
        } else if (toZone === 'spellsTraps') {
          newField.spellsTraps = [...prev.spellsTraps];
          if (slotIndex !== null) {
            newField.spellsTraps[slotIndex] = card;
          }
        } else if (toZone === 'fieldSpell') {
          newField.fieldSpell = [card];
        } else if (toZone === 'graveyard') {
          newField.graveyard = [...prev.graveyard, card];
        } else if (toZone === 'banished') {
          newField.banished = [...prev.banished, card];
        } else if (toZone === 'banishedFaceDown') {
          newField.banishedFaceDown = [...prev.banishedFaceDown, card];
        } else if (toZone === 'extraDeck') {
          newField.extraDeck = [...prev.extraDeck, card];
        } else if (toZone === 'deck_top') {
          newField.deck = [card, ...prev.deck];
        } else if (toZone === 'deck_bottom') {
          newField.deck = [...prev.deck, card];
        } else if (toZone === 'deck_shuffle') {
          newField.deck = shuffleArray([...prev.deck, card]);
        }

        return newField;
      });
    }

    const newAction = {
      id: Date.now(),
      player: gameData.playerName,
      action: `moved ${card.name} from ${fromZone} to ${toZone}`,
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
        id: Date.now(),
        player: gameData.playerName,
        action: 'drew a card',
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
    } else {
      const newAction = {
        id: Date.now(),
        player: gameData.playerName,
        action: 'deck is empty!',
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
    }
  };

  const handleCardClick = (card) => {
    setPreviewCard(card);
  };

  const handlePhaseChange = (phase) => {
    setCurrentPhase(phase);
    const newAction = {
      id: Date.now(),
      player: gameData.playerName,
      action: `changed phase to ${phase}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const handleEndTurn = () => {
    setIsPlayerTurn(!gameState.isPlayerTurn);
    setCurrentPhase('draw');
    setTimeRemaining(60);
    const newAction = {
      id: Date.now(),
      player: gameData.playerName,
      action: 'ended turn',
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const handleLifePointsChange = (amount, isEnemy) => {
    if (isEnemy) {
      setEnemyLifePoints(amount);
    } else {
      setPlayerLifePoints(amount);
      const newAction = {
        id: Date.now(),
        player: gameData.playerName,
        action: `changed life points to ${amount}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
    }
  };

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      player: gameData?.playerName || 'Player',
      message: message
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleDiceRoll = (result) => {
    const newMessage = {
      id: Date.now(),
      player: gameData?.playerName || 'Player',
      message: `🎲 Rolled dice: ${result}`
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCoinFlip = (result) => {
    const newMessage = {
      id: Date.now(),
      player: gameData?.playerName || 'Player',
      message: `🪙 Flipped coin: ${result}`
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleAttack = (attackingCard, targetCard) => {
    const newAction = {
      id: Date.now(),
      player: gameData.playerName,
      action: `${attackingCard.name} attacks ${targetCard ? targetCard.name : 'directly'}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const handleTimeUp = () => {
    const newAction = {
      id: Date.now(),
      player: gameData.playerName,
      action: 'time up! Turn ended automatically',
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    handleEndTurn();
  };

  return {
    handleGameStart,
    handleDeckLoad,
    handleCardPlace,
    handleCardMove,
    handleDrawCard,
    handleCardClick,
    handlePhaseChange,
    handleEndTurn,
    handleLifePointsChange,
    handleSendMessage,
    handleDiceRoll,
    handleCoinFlip,
    handleAttack,
    handleTimeUp
  };
};
