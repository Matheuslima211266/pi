
import { useEffect, useRef } from 'react';

export const useMultiplayerSync = (gameState) => {
  const {
    gameData,
    playerField,
    enemyField,
    playerHand,
    playerLifePoints,
    enemyLifePoints,
    currentPhase,
    isPlayerTurn,
    actionLog,
    chatMessages,
    timeRemaining,
    setEnemyField,
    setEnemyLifePoints,
    setActionLog,
    setChatMessages,
    setCurrentPhase,
    setIsPlayerTurn,
    setTimeRemaining
  } = gameState;

  const syncLockRef = useRef(false);
  const lastSyncTimeRef = useRef(Date.now());

  const syncGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    syncLockRef.current = true;
    
    try {
      const gameStateData = {
        playerField,
        playerLifePoints,
        playerHandCount: playerHand.length,
        actionLog,
        chatMessages,
        currentPhase,
        isPlayerTurn,
        timeRemaining,
        lastUpdate: Date.now(),
        playerId: gameData.isHost ? 'host' : 'guest',
        playerName: gameData.playerName
      };
      
      const stateKey = `yugiduel_state_${gameData.gameId}`;
      const allStates = JSON.parse(localStorage.getItem(stateKey) || '{}');
      
      allStates[gameStateData.playerId] = gameStateData;
      localStorage.setItem(stateKey, JSON.stringify(allStates));
      
      lastSyncTimeRef.current = Date.now();
      
      console.log('Synced game state:', gameStateData);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      syncLockRef.current = false;
    }
  };

  const loadGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    const stateKey = `yugiduel_state_${gameData.gameId}`;
    const allStates = JSON.parse(localStorage.getItem(stateKey) || '{}');
    
    const opponentId = gameData.isHost ? 'guest' : 'host';
    const opponentState = allStates[opponentId];
    
    if (opponentState && 
        opponentState.lastUpdate && 
        opponentState.lastUpdate > lastSyncTimeRef.current + 200) {
      
      console.log('Loading opponent state:', opponentState);
      
      setEnemyField(opponentState.playerField);
      setEnemyLifePoints(opponentState.playerLifePoints);
      
      if (opponentState.actionLog && Array.isArray(opponentState.actionLog)) {
        setActionLog(opponentState.actionLog);
      }
      
      if (opponentState.chatMessages && Array.isArray(opponentState.chatMessages)) {
        setChatMessages(opponentState.chatMessages);
      }
      
      setCurrentPhase(opponentState.currentPhase || 'draw');
      setIsPlayerTurn(opponentState.isPlayerTurn);
      setTimeRemaining(opponentState.timeRemaining || 60);
      
      lastSyncTimeRef.current = opponentState.lastUpdate;
    }
  };

  // Sync effect
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(() => {
        syncGameState();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [gameData, playerField, enemyField, playerHand, playerLifePoints, enemyLifePoints, currentPhase, isPlayerTurn, actionLog, chatMessages, timeRemaining]);

  // Load effect
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(loadGameState, 400);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  return { syncGameState };
};
