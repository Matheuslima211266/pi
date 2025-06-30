// Thin wrapper that re-exports the functionality of the new modular hooks.
import { useSession } from './useSession';
import { useGameStateSync } from './useGameStateSync';
import { useChat } from './useChat';
import { useActions } from './useActions';

export const useFirebaseMultiplayer = () => {
  // Session & auth
  const sessionHook = useSession();

  // Game-state sync (needs session info)
  const gameSync = useGameStateSync(sessionHook.currentSession, sessionHook.user);

  // Chat & actions
  const chatHook = useChat(sessionHook.currentSession, sessionHook.user);
  const actionsHook = useActions(sessionHook.currentSession, sessionHook.user);

  // Espone la stessa API originale (più compatta)
  return {
    // stato base
    user: sessionHook.user,
    currentSession: sessionHook.currentSession,
    opponentReady: sessionHook.opponentReady,
    error: sessionHook.error,

    // game state
    myGameState: gameSync.myGameState,
    opponentGameState: gameSync.opponentGameState,

    // funzioni principali
    createGameSession: sessionHook.createGameSession,
    joinGameSession: sessionHook.joinGameSession,
    setPlayerReady: sessionHook.setPlayerReady,
    sendChatMessage: chatHook.sendChatMessage,
    logGameAction: actionsHook.logGameAction,
    syncGameState: gameSync.syncGameState,
    resetSession: sessionHook.resetSession,
    clearError: sessionHook.clearError,
    testConnection: gameSync.testConnection,

    // dati extra, se servono altrove
    chatMessages: chatHook.messages,
    actions: actionsHook.actions
  } as const;
}; 