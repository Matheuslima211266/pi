
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import AuthComponent from '@/components/AuthComponent';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import GameLayout from '@/components/GameLayout';
import { useGameState } from '@/hooks/useGameState';
import { useSupabaseMultiplayer } from '@/hooks/useSupabaseMultiplayer';
import { useGameHandlers } from '@/hooks/useGameHandlers';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const gameState = useGameState();
  const multiplayerHook = useSupabaseMultiplayer(user!, gameState);
  const handlers = useGameHandlers(gameState, multiplayerHook.syncGameState);

  // Monitor when both players are ready
  useEffect(() => {
    if (multiplayerHook.currentSession && gameState.gameStarted && user) {
      const isHost = multiplayerHook.currentSession.host_id === user.id;
      const playerReady = isHost ? multiplayerHook.currentSession.host_ready : multiplayerHook.currentSession.guest_ready;
      const opponentReady = isHost ? multiplayerHook.currentSession.guest_ready : multiplayerHook.currentSession.host_ready;
      
      console.log('Checking ready status:', { playerReady, opponentReady, bothReady: gameState.bothPlayersReady });
      
      if (playerReady && opponentReady && !gameState.bothPlayersReady) {
        console.log('Both players ready, starting game!');
        gameState.setBothPlayersReady(true);
      }
    }
  }, [multiplayerHook.currentSession, gameState.gameStarted, user?.id, gameState.bothPlayersReady, gameState]);

  // Enhanced handlers that also log to database
  const enhancedHandlers = {
    ...handlers,
    handleSendMessage: (message: string) => {
      multiplayerHook.sendChatMessage(message, gameState.gameData?.playerName || 'Player');
      handlers.handleSendMessage(message);
    },
    handleCardPlace: (card: any, zoneName: string, slotIndex: number, isFaceDown?: boolean, position?: string) => {
      handlers.handleCardPlace(card, zoneName, slotIndex, isFaceDown, position);
      multiplayerHook.logGameAction(`placed ${card.name} in ${zoneName}`, gameState.gameData?.playerName || 'Player');
    },
    handleEndTurn: () => {
      handlers.handleEndTurn();
      multiplayerHook.logGameAction('ended turn', gameState.gameData?.playerName || 'Player');
    },
    handlePlayerReady: async () => {
      console.log('Player ready button clicked');
      
      // Set player ready in local state
      handlers.handlePlayerReady();
      
      // Update ready status in database
      await multiplayerHook.setPlayerReady(true);
      
      // Sync game state after a short delay
      setTimeout(() => multiplayerHook.syncGameState(), 100);
    }
  };

  // Enhanced game start handler
  const handleGameStart = async (gameData: any) => {
    let session = null;
    
    try {
      console.log('Starting game with data:', gameData);
      
      if (gameData.isHost) {
        console.log('Creating game session as host...');
        session = await multiplayerHook.createGameSession(gameData.gameId, gameData.playerName);
      } else {
        console.log('Joining game session as guest...');
        session = await multiplayerHook.joinGameSession(gameData.gameId, gameData.playerName);
      }
      
      if (session) {
        console.log('Game session successful, starting game...', session);
        handlers.handleGameStart(gameData);
        return true;
      } else {
        console.error('Failed to create/join game session');
        return false;
      }
    } catch (error) {
      console.error('Error in handleGameStart:', error);
      return false;
    }
  };

  // Show error if there's a multiplayer error
  if (multiplayerHook.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-400 rounded-lg p-6 text-center">
          <h2 className="text-red-400 font-bold text-xl mb-2">Connection Error</h2>
          <p className="text-white mb-4">{multiplayerHook.error}</p>
          <button 
            onClick={() => {
              multiplayerHook.clearError();
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent onAuth={setUser} />;
  }

  // Calculate if both players are ready
  const bothPlayersReady = multiplayerHook.currentSession ? 
    multiplayerHook.currentSession.host_ready && multiplayerHook.currentSession.guest_ready :
    false;

  console.log('Current state:', {
    gameStarted: gameState.gameStarted,
    bothPlayersReady,
    currentSession: multiplayerHook.currentSession?.id,
    opponentConnected: gameState.opponentConnected
  });

  // Show multiplayer setup if:
  // 1. Game not started yet, OR
  // 2. Game started but not both players ready
  if (!gameState.gameStarted || (gameState.gameStarted && !bothPlayersReady)) {
    return (
      <MultiplayerSetup 
        onGameStart={handleGameStart}
        onDeckLoad={handlers.handleDeckLoad}
        onPlayerReady={enhancedHandlers.handlePlayerReady}
        gameState={{
          ...gameState,
          opponentReady: multiplayerHook.opponentReady,
          bothPlayersReady: bothPlayersReady,
          currentSession: multiplayerHook.currentSession
        }}
      />
    );
  }

  // Both players ready, show game
  return (
    <GameLayout
      gameData={gameState.gameData}
      gameState={gameState}
      handlers={enhancedHandlers}
    />
  );
};

export default Index;
