import { useCallback } from 'react';
import { useFirebaseMultiplayer } from './useFirebaseMultiplayer';

export const useForceSync = (gameState: any) => {
  const firebaseHook = useFirebaseMultiplayer();

  const forceSync = useCallback(async () => {
    if (!gameState.gameData?.gameId || !firebaseHook.currentSession) {
      console.log('❌ [FORCE SYNC] Cannot force sync - missing data');
      return false;
    }

    console.log('🔄 [FORCE SYNC] Forcing manual sync...', {
      gameId: gameState.gameData.gameId,
      playerName: gameState.gameData.playerName,
      isHost: gameState.gameData.isHost
    });

    try {
      const gameStateData = {
        playerId: gameState.gameData.isHost ? 'host' : 'guest',
        playerName: gameState.gameData.playerName,
        playerField: gameState.playerField,
        playerLifePoints: gameState.playerLifePoints,
        playerHandCount: gameState.playerHand.length,
        actionLog: gameState.actionLog,
        chatMessages: gameState.chatMessages,
        currentPhase: gameState.currentPhase,
        isPlayerTurn: gameState.isPlayerTurn,
        timeRemaining: gameState.timeRemaining,
        playerReady: gameState.playerReady,
        bothPlayersReady: gameState.bothPlayersReady,
        lastUpdate: Date.now()
      };

      await firebaseHook.syncGameState(gameStateData);
      
      console.log('✅ [FORCE SYNC] Manual sync completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [FORCE SYNC] Manual sync failed:', error);
      return false;
    }
  }, [gameState, firebaseHook]);

  const forceLoadOpponentState = useCallback(async () => {
    if (!gameState.gameData?.gameId || !firebaseHook.currentSession) {
      console.log('❌ [FORCE SYNC] Cannot force load - missing data');
      return false;
    }

    console.log('🔄 [FORCE SYNC] Forcing opponent state load...');

    try {
      // Forza un aggiornamento del listener
      const isHost = firebaseHook.user?.uid === firebaseHook.currentSession.hostId;
      const opponentId = isHost ? firebaseHook.currentSession.guestId : firebaseHook.currentSession.hostId;
      
      if (!opponentId) {
        console.log('❌ [FORCE SYNC] No opponent ID available');
        return false;
      }

      console.log('✅ [FORCE SYNC] Opponent state load triggered', {
        opponentId,
        isHost
      });
      
      return true;
    } catch (error) {
      console.error('❌ [FORCE SYNC] Opponent state load failed:', error);
      return false;
    }
  }, [gameState, firebaseHook]);

  return {
    forceSync,
    forceLoadOpponentState,
    isConnected: !firebaseHook.error && !!firebaseHook.currentSession,
    hasOpponentState: !!firebaseHook.opponentGameState
  };
}; 