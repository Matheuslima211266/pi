
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
    setBothPlayersReady,
    setPlayerReady
  } = gameState;

  const syncLockRef = useRef(false);
  const lastSyncTimeRef = useRef(Date.now());
  const opponentReadyRef = useRef(false);

  const syncGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    console.log('Syncing game state, playerReady:', playerReady, 'bothPlayersReady:', bothPlayersReady);
    
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
        bothPlayersReady,
        lastUpdate: Date.now(),
        playerId,
        playerName: gameData.playerName
      };
      
      const stateKey = `yugiduel_state_${gameData.gameId}`;
      const allStates = JSON.parse(localStorage.getItem(stateKey) || '{}');
      
      allStates[playerId] = gameStateData;
      localStorage.setItem(stateKey, JSON.stringify(allStates));
      
      console.log('State saved:', allStates);
      
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
      
      console.log('Loading states - My ID:', gameData.isHost ? 'host' : 'guest', 'All states:', allStates);
      
      if (opponentState && 
          opponentState.lastUpdate && 
          opponentState.lastUpdate > lastSyncTimeRef.current + 50) {
        
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
        
        // Sincronizza fase e turno solo se il gioco è iniziato
        if (bothPlayersReady && opponentState.bothPlayersReady) {
          if (opponentState.currentPhase) {
            setCurrentPhase(opponentState.currentPhase);
          }
          if (typeof opponentState.isPlayerTurn === 'boolean') {
            setIsPlayerTurn(opponentState.isPlayerTurn);
          }
          if (typeof opponentState.timeRemaining === 'number') {
            setTimeRemaining(opponentState.timeRemaining);
          }
        }
        
        // IMPORTANTE: Controlla se l'avversario è pronto
        const opponentIsReady = Boolean(opponentState.playerReady);
        opponentReadyRef.current = opponentIsReady;
        
        console.log('Opponent ready:', opponentIsReady, 'My ready:', playerReady);
        
        // Se entrambi sono pronti, avvia il gioco
        if (opponentIsReady && playerReady && !bothPlayersReady) {
          console.log('Both players ready! Starting game...');
          setBothPlayersReady(true);
        }
        
        lastSyncTimeRef.current = opponentState.lastUpdate;
      }
    } catch (error) {
      console.error('Load state error:', error);
    }
  };

  // Sync effect - sincronizza ogni 200ms
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(() => {
        syncGameState();
      }, 200);
      return () => clearInterval(interval);
    }
  }, [gameData, playerField, enemyField, playerHand, playerLifePoints, enemyLifePoints, currentPhase, isPlayerTurn, actionLog, chatMessages, timeRemaining, playerReady, bothPlayersReady]);

  // Load effect - carica ogni 150ms per essere più reattivo
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(loadGameState, 150);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  // Effect per controllare se entrambi i giocatori sono pronti
  useEffect(() => {
    if (playerReady && opponentReadyRef.current && !bothPlayersReady) {
      console.log('Setting both players ready!');
      setBothPlayersReady(true);
    }
  }, [playerReady, bothPlayersReady]);

  return { syncGameState };
};
