import { useCardHandlers } from './useCardHandlers';
import { useDeckHandlers } from './useDeckHandlers';
import { useGameFlowHandlers } from './useGameFlowHandlers';
import { useCardMoveHandlers } from './useCardMoveHandlers';
import { useMultiplayerHandlers } from './useMultiplayerHandlers';
import { useGameSetupHandlers } from './useGameSetupHandlers';
import { useBattleHandlers } from './useBattleHandlers';

export const useGameHandlers = (gameState) => {
  const cardHandlers = useCardHandlers(gameState);
  const deckHandlers = useDeckHandlers(gameState);
  const gameFlowHandlers = useGameFlowHandlers(gameState);
  const cardMoveHandlers = useCardMoveHandlers(gameState);
  const multiplayerHandlers = useMultiplayerHandlers(gameState);
  const gameSetupHandlers = useGameSetupHandlers(gameState);
  const battleHandlers = useBattleHandlers(gameState);

  // Handler per la selezione delle carte dalla mano
  const handleHandCardSelect = (card) => {
    console.log('🎯 useGameHandlers - handleHandCardSelect called with:', card?.name);
    gameState.setSelectedCardFromHand(card);
    console.log('🎯 useGameHandlers - selectedCardFromHand updated to:', card?.name);
  };

  // Handler per la creazione di un token
  const handleCreateToken = (token) => {
    // Trova il primo slot libero tra i mostri
    const emptyIndex = (gameState.playerField?.monsters || []).findIndex(c => !c);
    if (emptyIndex === -1) {
      alert('Non c\'è spazio tra i mostri per evocare un token!');
      return;
    }
    const tokenCard = {
      id: 'token-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      name: token.name,
      atk: token.atk,
      def: token.def,
      card_type: 'token',
      position: 'attack',
      faceDown: false
    };
    gameState.setPlayerField(prev => {
      const newField = { ...prev };
      newField.monsters = [...(prev.monsters || [])];
      newField.monsters[emptyIndex] = tokenCard;
      return newField;
    });
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameState.gameData?.playerName || 'Player',
      action: `evoked token ${token.name} (${token.atk}/${token.def})`,
      timestamp: new Date().toLocaleTimeString()
    };
    gameState.setActionLog(prev => [...prev, newAction]);
  };

  // Handler per piazzare una carta sul campo
  const handleCardPlace = (card: any, zoneName: string, slotIndex: number, isFaceDown: boolean = false, position: string = 'attack') => {
    console.log('🔵 [DEBUG] handleCardPlace START', {
      card: card,
      zoneName: zoneName,
      slotIndex: slotIndex,
      isFaceDown: isFaceDown,
      position: position,
      playerFieldBefore: JSON.parse(JSON.stringify(gameState.playerField)),
      playerHandBefore: gameState.playerHand.length
    });

    if (!card) {
      console.error('❌ [DEBUG] handleCardPlace ERROR: card is null/undefined');
      return;
    }

    // Summon limit check (only for monster cards excluding tokens)
    if (zoneName === 'monsters' && card.card_type !== 'token') {
      const { summonsThisTurn = 0, summonLimit = 5, setSummonsThisTurn } = gameState;
      if (summonsThisTurn >= summonLimit) {
        alert(`Limite di evocazioni ( ${summonLimit} ) per questo turno raggiunto!`);
        return;
      }
    }

    console.log('🔵 [DEBUG] handleCardPlace - Card validation', {
      cardId: card.id,
      cardName: card.name,
      cardType: card.card_type,
      hasAtk: 'atk' in card,
      hasDef: 'def' in card,
      cardKeys: Object.keys(card)
    });

    // Rimuovi la carta dalla mano
    const updatedHand = gameState.playerHand.filter(c => c.id !== card.id);
    console.log('🔵 [DEBUG] handleCardPlace - Hand update', {
      handBefore: gameState.playerHand.length,
      handAfter: updatedHand.length,
      cardRemoved: gameState.playerHand.length - updatedHand.length
    });
    gameState.setPlayerHand(updatedHand);

    // Prepara la carta per il campo
    const fieldCard = {
      ...card,
      position: position || 'attack',
      faceDown: isFaceDown,
      zone: zoneName,
      slotIndex: slotIndex
    };

    console.log('🔵 [DEBUG] handleCardPlace - Field card prepared', {
      fieldCard: fieldCard,
      originalCard: card,
      positionSet: fieldCard.position,
      faceDownSet: fieldCard.faceDown
    });

    // Aggiorna il campo del giocatore
    gameState.setPlayerField(prev => {
      console.log('🔵 [DEBUG] handleCardPlace - Updating playerField', {
        prevField: JSON.parse(JSON.stringify(prev)),
        zoneToUpdate: zoneName,
        slotToUpdate: slotIndex,
        newCard: fieldCard
      });

      const newField = { ...prev };
      
      if (zoneName === 'monsters') {
        const newMonsters = [...(newField.monsters || Array(5).fill(null))];
        newMonsters[slotIndex] = fieldCard;
        newField.monsters = newMonsters;

        console.log('🔵 [DEBUG] handleCardPlace - Updating monsters zone', {
          monstersBefore: JSON.parse(JSON.stringify(prev.monsters)),
          slotIndex: slotIndex,
          newCard: fieldCard
        });
        
        console.log('🔵 [DEBUG] handleCardPlace - Monsters after update', {
          monstersAfter: JSON.parse(JSON.stringify(newField.monsters)),
          slotUpdated: slotIndex,
          cardPlaced: newField.monsters[slotIndex]
        });
      } else if (zoneName === 'spellsTraps') {
        const newSpellsTraps = [...(newField.spellsTraps || Array(5).fill(null))];
        newSpellsTraps[slotIndex] = fieldCard;
        newField.spellsTraps = newSpellsTraps;
        
        console.log('🔵 [DEBUG] handleCardPlace - Updating spellsTraps zone', {
          spellsTrapsBefore: JSON.parse(JSON.stringify(prev.spellsTraps)),
          slotIndex: slotIndex,
          newCard: fieldCard
        });
        
        console.log('🔵 [DEBUG] handleCardPlace - SpellsTraps after update', {
          spellsTrapsAfter: JSON.parse(JSON.stringify(newField.spellsTraps)),
          slotUpdated: slotIndex,
          cardPlaced: newField.spellsTraps[slotIndex]
        });
      } else if (zoneName === 'fieldSpell') {
        console.log('🔵 [DEBUG] handleCardPlace - Updating fieldSpell zone', {
          fieldSpellBefore: JSON.parse(JSON.stringify(prev.fieldSpell)),
          newCard: fieldCard
        });
        
        newField.fieldSpell = [fieldCard];
        
        console.log('🔵 [DEBUG] handleCardPlace - FieldSpell after update', {
          fieldSpellAfter: JSON.parse(JSON.stringify(newField.fieldSpell))
        });
      }

      console.log('🔵 [DEBUG] handleCardPlace - Final field state', {
        finalField: JSON.parse(JSON.stringify(newField)),
        zoneUpdated: zoneName,
        slotUpdated: slotIndex
      });

      return newField;
    });

    // Aggiorna action log
    const actionMessage = `placed ${card.name} in ${zoneName} zone (slot ${slotIndex})`;
    console.log('🔵 [DEBUG] handleCardPlace - Adding to action log', {
      actionMessage: actionMessage,
      actionLogBefore: gameState.actionLog.length
    });
    
    gameState.setActionLog(prev => {
      const newLog = [...prev, {
        id: Date.now(),
        player: gameState.gameData?.playerName || 'Player',
        action: actionMessage,
        timestamp: new Date().toLocaleTimeString()
      }];
      console.log('🔵 [DEBUG] handleCardPlace - Action log updated', {
        actionLogAfter: newLog.length,
        lastAction: newLog[newLog.length - 1]
      });
      return newLog;
    });

    console.log('🔵 [DEBUG] handleCardPlace - Card placement completed successfully', {
      cardPlaced: fieldCard,
      zoneName: zoneName,
      slotIndex: slotIndex,
      playerFieldAfter: JSON.parse(JSON.stringify(gameState.playerField)),
      playerHandAfter: gameState.playerHand.length
    });

    // Increment summon counter if appropriate
    if (zoneName === 'monsters' && card.card_type !== 'token') {
      if (gameState.setSummonsThisTurn) {
        gameState.setSummonsThisTurn(prev => prev + 1);
      }
    }

    // Trigger sync per multiplayer - NON PIU' NECESSARIO, useFirebaseSync lo fa in automatico
    if (gameState.gameData?.gameId) {
      console.log('🔵 [DEBUG] handleCardPlace - State updated, sync will be handled by useFirebaseSync', {
        gameId: gameState.gameData.gameId,
        playerName: gameState.gameData.playerName
      });
    }
  };

  return {
    ...cardHandlers,
    ...deckHandlers,
    ...gameFlowHandlers,
    ...cardMoveHandlers,
    ...multiplayerHandlers,
    ...gameSetupHandlers,
    ...battleHandlers,
    handleHandCardSelect,
    handleCreateToken,
    handleCardPlace
  };
};
