
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

  console.log('=== INDEX STATE DEBUG ===', {
    gameStarted: gameState.gameStarted,
    bothPlayersReady: gameState.bothPlayersReady,
    currentSession: !!multiplayerHook.currentSession,
    playerReady: gameState.playerReady,
    opponentReady: multiplayerHook.opponentReady,
    user: !!user
  });

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
    }
  };

  // Handle game start - create or join session
  const handleGameStart = async (gameData: any) => {
    try {
      console.log('=== STARTING GAME ===', gameData);
      
      let session = null;
      if (gameData.isHost) {
        console.log('Creating game session as host...');
        session = await multiplayerHook.createGameSession(gameData.gameId, gameData.playerName);
      } else {
        console.log('Joining game session as guest...');
        session = await multiplayerHook.joinGameSession(gameData.gameId, gameData.playerName);
      }
      
      if (session) {
        console.log('Session created/joined successfully, updating game state...');
        gameState.setGameData(gameData);
        
        // IMPORTANTE: Per il guest, imposta gameStarted subito per andare nella waiting room
        if (!gameData.isHost) {
          console.log('=== GUEST ENTERING WAITING ROOM IMMEDIATELY ===');
          gameState.setGameStarted(true);
        }
        
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

  // Handle quando l'host è pronto e vuole entrare nella waiting room
  const handleHostEnterWaiting = () => {
    console.log('=== HOST ENTERING WAITING ROOM ===');
    gameState.setGameStarted(true);
  };

  // Handle player ready
  const handlePlayerReady = async () => {
    console.log('=== PLAYER READY CLICKED ===');
    
    try {
      // Set player ready in local state
      gameState.setPlayerReady(true);
      
      // Update ready status in database
      await multiplayerHook.setPlayerReady(true);
      
      console.log('Player marked as ready successfully');
    } catch (error) {
      console.error('Error setting player ready:', error);
    }
  };

  // Handle when both players are ready - start the actual game
  const handleBothPlayersReady = () => {
    console.log('=== BOTH PLAYERS READY - STARTING ACTUAL GAME ===');
    
    // Set both players ready and initialize the game
    gameState.setBothPlayersReady(true);
    
    // Initialize the game
    if (gameState.initializeGame) {
      console.log('Initializing game...');
      gameState.initializeGame();
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

  // Show actual game when both players are ready
  if (gameState.gameStarted && gameState.bothPlayersReady) {
    console.log('=== RENDERING GAME LAYOUT ===');
    return (
      <GameLayout
        gameData={gameState.gameData}
        gameState={gameState}
        handlers={enhancedHandlers}
      />
    );
  }

  // Show multiplayer setup
  console.log('=== RENDERING MULTIPLAYER SETUP ===');
  return (
    <MultiplayerSetup 
      onGameStart={handleGameStart}
      onDeckLoad={handlers.handleDeckLoad}
      onPlayerReady={handlePlayerReady}
      onBothPlayersReady={handleBothPlayersReady}
      onHostEnterWaiting={handleHostEnterWaiting}
      gameState={{
        ...gameState,
        opponentReady: multiplayerHook.opponentReady,
        currentSession: multiplayerHook.currentSession
      }}
    />
  );
};

export default Index;
