import { useEffect, useRef, useState } from 'react';
import { useFirebaseMultiplayer } from './useFirebaseMultiplayer';

// Funzione deepEqual migliorata per oggetti complessi
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  
  return a === b;
}

export const useFirebaseSync = (gameState: any, firebaseHook: ReturnType<typeof useFirebaseMultiplayer>) => {
  const {
    gameData,
    playerField,
    playerLifePoints,
    playerHand,
    actionLog,
    chatMessages,
    currentPhase,
    isPlayerTurn,
    timeRemaining,
    playerReady,
    bothPlayersReady,
    turnOrder,
    setTurnOrder,
    setIsPlayerTurn,
    setBothPlayersReady,
    currentTurnPlayerId,
    turnCount,
    isFirstTurn,
    playerStarts
  } = gameState;

  const lastSentState = useRef<any>(null);

  // Sync game state to Firebase whenever a relevant piece of local state changes.
  useEffect(() => {
    if (!gameData?.gameId || !firebaseHook.currentSession) {
      return;
    }

    const gameStateData = {
      playerName: gameData.playerName || `Player ${gameData.isHost ? 'Host' : 'Guest'}`,
      playerField,
      playerLifePoints,
      playerHandCount: playerHand.length,
      actionLog,
      chatMessages,
      currentPhase,
      isPlayerTurn,
      timeRemaining,
      playerReady,
      bothPlayersReady,
      turnOrder,
      lastUpdate: Date.now(),
      currentTurnPlayerId,
      turnCount,
      isFirstTurn,
      playerStarts
    };
    
    if (lastSentState.current && deepEqual(gameStateData, lastSentState.current)) {
      return; // No change, no sync
    }
    
    console.log('🔄 [FIREBASE] State changed, syncing to Firebase...');
    lastSentState.current = JSON.parse(JSON.stringify(gameStateData));
    
    try {
      firebaseHook.syncGameState(gameStateData);
      console.log('✅ [FIREBASE] Game state synced successfully');
    } catch (error)
      {
      console.error('❌ [FIREBASE] syncGameState ERROR:', error);
    }
  }, [
    // List all state dependencies that should trigger a sync
    gameData, playerField, playerLifePoints, playerHand, actionLog, chatMessages,
    currentPhase, isPlayerTurn, timeRemaining, playerReady, bothPlayersReady, turnOrder, currentTurnPlayerId,
    turnCount, isFirstTurn, playerStarts,
    firebaseHook.currentSession
  ]);

  // Effect to check if opponent is ready and set turn order
  useEffect(() => {
    const opponentIsReady = Boolean(firebaseHook.opponentGameState?.playerReady);
    
    if (playerReady && opponentIsReady && !bothPlayersReady) {
      console.log('🎉 [FIREBASE] Both players ready!');
      setBothPlayersReady(true);
      
      if (gameData.isHost) {
        console.log('👑 [FIREBASE] Host is setting turn order to "host"');
        setTurnOrder('host');
        setIsPlayerTurn(true);
      }
    }
  }, [playerReady, firebaseHook.opponentGameState?.playerReady, bothPlayersReady, gameData?.isHost, setBothPlayersReady, setTurnOrder, setIsPlayerTurn]);


  return {
    ...firebaseHook,
    // syncGameState is now internal to this hook, driven by useEffect.
    // We don't need to expose it anymore unless something external needs to force a sync.
  };
}; 