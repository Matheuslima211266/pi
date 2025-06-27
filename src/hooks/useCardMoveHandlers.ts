
export const useCardMoveHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    playerField,
    enemyField,
    setPlayerField,
    setEnemyField,
    setPlayerHand,
    setEnemyHandCount,
    setPlayerLifePoints,
    setEnemyLifePoints,
    setActionLog,
    shuffleArray
  } = gameState;

  const handleCardMove = (card, fromZone, toZone, slotIndex = null, isPlayer = true) => {
    console.log(`🔄 Moving card ${card.name || 'card'} from ${fromZone} to ${toZone} for ${isPlayer ? 'player' : 'enemy'}`, { card, fromZone, toZone, slotIndex, isPlayer });
    
    // Choose the correct field and setters based on isPlayer
    const currentField = isPlayer ? playerField : enemyField;
    const setField = isPlayer ? setPlayerField : setEnemyField;
    const setHand = isPlayer ? setPlayerHand : null;
    
    // Handle damage dealing
    if (fromZone === 'damage' && toZone === 'lifePoints') {
      const { damage, isToEnemy } = card;
      if (isToEnemy) {
        setEnemyLifePoints(prev => Math.max(0, prev - damage));
      } else {
        setPlayerLifePoints(prev => Math.max(0, prev - damage));
      }
      
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: `dealt ${damage} damage to ${isToEnemy ? 'opponent' : 'self'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      setTimeout(() => syncGameState(), 100);
      return;
    }
    
    // Handle flip in place
    if (toZone === 'flip_in_place') {
      if (fromZone === 'monsters') {
        setField(prev => {
          const newField = { ...prev };
          newField.monsters = [...prev.monsters];
          newField.monsters[slotIndex] = card;
          console.log('Updated field after flip in place:', newField);
          return newField;
        });
      } else if (fromZone === 'spellsTraps') {
        setField(prev => {
          const newField = { ...prev };
          newField.spellsTraps = [...prev.spellsTraps];
          newField.spellsTraps[slotIndex] = card;
          console.log('Updated field after flip in place:', newField);
          return newField;
        });
      }
      
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: `${card.faceDown ? 'set' : 'flipped'} ${card.name} ${card.faceDown ? 'face-down' : 'face-up'}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      setTimeout(() => syncGameState(), 100);
      return;
    }

    // Handle ATK update
    if (toZone === 'updateATK') {
      if (fromZone === 'monsters') {
        setField(prev => {
          const newField = { ...prev };
          newField.monsters = [...prev.monsters];
          newField.monsters[slotIndex] = card;
          console.log('Updated monster ATK:', card);
          return newField;
        });
        
        const newAction = {
          id: Date.now() + Math.random(),
          player: gameData?.playerName || 'Player',
          action: `changed ${card.name} ATK to ${card.atk}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setActionLog(prev => [...prev, newAction]);
        setTimeout(() => syncGameState(), 100);
        return;
      }
    }

    // Remove from source zone
    if (fromZone === 'hand') {
      if (isPlayer && setHand) {
        setHand(hand => hand.filter(c => c.id !== card.id));
      } else if (!isPlayer) {
        setEnemyHandCount(prev => Math.max(0, prev - 1));
      }
    } else if (fromZone === 'deck') {
      setField(prev => ({
        ...prev,
        deck: prev.deck.filter(c => c.id !== card.id)
      }));
    } else {
      setField(prev => {
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
        } else if (fromZone === 'deadZone') {
          newField.deadZone = prev.deadZone.filter(c => c.id !== card.id);
        } else if (fromZone === 'banished') {
          newField.banished = prev.banished.filter(c => c.id !== card.id);
        } else if (fromZone === 'banishedFaceDown') {
          newField.banishedFaceDown = prev.banishedFaceDown.filter(c => c.id !== card.id);
        } else if (fromZone === 'extraDeck') {
          newField.extraDeck = prev.extraDeck.filter(c => c.id !== card.id);
        } else if (fromZone === 'magia') {
          newField.magia = prev.magia.filter(c => c.id !== card.id);
        } else if (fromZone === 'terreno') {
          newField.terreno = prev.terreno.filter(c => c.id !== card.id);
        }

        return newField;
      });
    }

    // Add to destination zone
    if (toZone === 'hand') {
      if (isPlayer && setHand) {
        setHand(hand => [...hand, card]);
      } else if (!isPlayer) {
        setEnemyHandCount(prev => prev + 1);
      }
    } else {
      setField(prev => {
        const newField = { ...prev };

        if (toZone === 'monsters') {
          newField.monsters = [...prev.monsters];
          if (slotIndex !== null && slotIndex >= 0) {
            newField.monsters[slotIndex] = card;
          } else {
            const emptyIndex = newField.monsters.findIndex(slot => slot === null);
            if (emptyIndex !== -1) {
              newField.monsters[emptyIndex] = card;
            }
          }
        } else if (toZone === 'spellsTraps') {
          newField.spellsTraps = [...prev.spellsTraps];
          if (slotIndex !== null && slotIndex >= 0) {
            newField.spellsTraps[slotIndex] = card;
          } else {
            const emptyIndex = newField.spellsTraps.findIndex(slot => slot === null);
            if (emptyIndex !== -1) {
              newField.spellsTraps[emptyIndex] = card;
            }
          }
        } else if (toZone === 'fieldSpell') {
          newField.fieldSpell = [card];
        } else if (toZone === 'graveyard') {
          newField.graveyard = [...(prev.graveyard || []), card];
        } else if (toZone === 'deadZone') {
          newField.deadZone = [...(prev.deadZone || []), card];
        } else if (toZone === 'banished') {
          newField.banished = [...(prev.banished || []), card];
        } else if (toZone === 'banishedFaceDown') {
          newField.banishedFaceDown = [...(prev.banishedFaceDown || []), card];
        } else if (toZone === 'extraDeck') {
          newField.extraDeck = [...(prev.extraDeck || []), card];
        } else if (toZone === 'magia') {
          newField.magia = [...(prev.magia || []), card];
        } else if (toZone === 'terreno') {
          newField.terreno = [...(prev.terreno || []), card];
        } else if (toZone === 'deck_top') {
          newField.deck = [card, ...(prev.deck || [])];
        } else if (toZone === 'deck_bottom') {
          newField.deck = [...(prev.deck || []), card];
        } else if (toZone === 'deck_shuffle') {
          newField.deck = shuffleArray([...(prev.deck || []), card]);
        }

        console.log(`Updated field after moving ${card.name} from ${fromZone} to ${toZone}:`, newField);
        return newField;
      });
    }

    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `moved ${card.name} from ${fromZone} to ${toZone}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    
    setTimeout(() => syncGameState(), 100);
  };

  return {
    handleCardMove
  };
};
