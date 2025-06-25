
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
    playerReady,
    bothPlayersReady,
    setEnemyField,
    setEnemyLifePoints,
    setPlayerLifePoints,
    setActionLog,
    setChatMessages,
    setCurrentPhase,
    setIsPlayerTurn,
    setTimeRemaining,
    setBothPlayersReady
  } = gameState;

  const syncLockRef = useRef(false);
  const lastSyncTimeRef = useRef(Date.now());

  const syncGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    syncLockRef.current = true;
    
    try {
      const playerId = gameData.isHost ? 'host' : 'guest';
      const gameStateData = {
        playerField,
        playerLifePoints,
        playerHandCount: playerHand.length,
        actionLog,
        chatMessages,
        currentPhase,
        isPlayerTurn,
        timeRemaining,
        playerReady,
        lastUpdate: Date.now(),
        playerId,
        playerName: gameData.playerName
      };
      
      console.log('Syncing game state:', gameStateData);
      
      const stateKey = `yugiduel_state_${gameData.gameId}`;
      const allStates = JSON.parse(localStorage.getItem(stateKey) || '{}');
      
      allStates[playerId] = gameStateData;
      localStorage.setItem(stateKey, JSON.stringify(allStates));
      
      // Controlla se entrambi i giocatori sono pronti
      const opponentId = gameData.isHost ? 'guest' : 'host';
      const opponentState = allStates[opponentId];
      
      if (opponentState && opponentState.playerReady && playerReady) {
        setBothPlayersReady(true);
      }
      
      lastSyncTimeRef.current = Date.now();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      syncLockRef.current = false;
    }
  };

  const loadGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    try {
      const stateKey = `yugiduel_state_${gameData.gameId}`;
      const allStates = JSON.parse(localStorage.getItem(stateKey) || '{}');
      
      const opponentId = gameData.isHost ? 'guest' : 'host';
      const opponentState = allStates[opponentId];
      
      if (opponentState && 
          opponentState.lastUpdate && 
          opponentState.lastUpdate > lastSyncTimeRef.current + 100) {
        
        console.log('Loading opponent state:', opponentState);
        
        // Sincronizza campo avversario
        if (opponentState.playerField) {
          setEnemyField(opponentState.playerField);
        }
        
        // Sincronizza life points
        if (typeof opponentState.playerLifePoints === 'number') {
          setEnemyLifePoints(opponentState.playerLifePoints);
        }
        
        // Sincronizza action log (merge senza duplicati)
        if (opponentState.actionLog && Array.isArray(opponentState.actionLog)) {
          setActionLog(prev => {
            const merged = [...prev];
            opponentState.actionLog.forEach(action => {
              if (!merged.find(a => a.id === action.id)) {
                merged.push(action);
              }
            });
            return merged.sort((a, b) => a.id - b.id);
          });
        }
        
        // Sincronizza chat messages (merge senza duplicati)
        if (opponentState.chatMessages && Array.isArray(opponentState.chatMessages)) {
          setChatMessages(prev => {
            const merged = [...prev];
            opponentState.chatMessages.forEach(msg => {
              if (!merged.find(m => m.id === msg.id)) {
                merged.push(msg);
              }
            });
            return merged.sort((a, b) => a.id - b.id);
          });
        }
        
        // Sincronizza fase e turno
        if (opponentState.currentPhase) {
          setCurrentPhase(opponentState.currentPhase);
        }
        if (typeof opponentState.isPlayerTurn === 'boolean') {
          setIsPlayerTurn(opponentState.isPlayerTurn);
        }
        if (typeof opponentState.timeRemaining === 'number') {
          setTimeRemaining(opponentState.timeRemaining);
        }
        
        // Controlla se entrambi i giocatori sono pronti
        if (opponentState.playerReady && playerReady) {
          setBothPlayersReady(true);
        }
        
        lastSyncTimeRef.current = opponentState.lastUpdate;
      }
    } catch (error) {
      console.error('Load state error:', error);
    }
  };

  // Sync effect - più frequente
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(() => {
        syncGameState();
      }, 300);
      return () => clearInterval(interval);
    }
  }, [gameData, playerField, enemyField, playerHand, playerLifePoints, enemyLifePoints, currentPhase, isPlayerTurn, actionLog, chatMessages, timeRemaining, playerReady]);

  // Load effect - più frequente
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(loadGameState, 200);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  return { syncGameState };
};
