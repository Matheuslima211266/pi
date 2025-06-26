import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import AuthComponent from '@/components/AuthComponent';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import GameLayout from '@/components/GameLayout';
import { useGameState } from '@/hooks/useGameState';
import { useSupabaseMultiplayer } from '@/hooks/useSupabaseMultiplayer';
import { useGameHandlers } from '@/hooks/useGameHandlers';
import { useGameSync } from '@/hooks/useGameSync';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const gameState = useGameState();
  const multiplayerHook = useSupabaseMultiplayer(user!, gameState);
  const gameSync = useGameSync(user, multiplayerHook.currentSession?.id || null, gameState);
  const handlers = useGameHandlers(gameState, multiplayerHook.syncGameState);

  useEffect(() => {
    console.log('[INDEX] Component rendered', {
      gameStarted: gameState.gameStarted,
      bothPlayersReady: gameState.bothPlayersReady,
      currentSession: !!multiplayerHook.currentSession,
      playerReady: gameState.playerReady,
      opponentReady: multiplayerHook.opponentReady,
      user: !!user
    });
  });

  // Enhanced handlers that also sync to database
  const enhancedHandlers = {
    ...handlers,
    handleSendMessage: (message: string) => {
      handlers.handleSendMessage(message);
      gameSync.sendGameAction('CHAT_MESSAGE', {
        message,
        playerName: gameState.gameData?.playerName || 'Player'
      });
      multiplayerHook.sendChatMessage(message, gameState.gameData?.playerName || 'Player');
    },
    handleCardPlace: (card: any, zoneName: string, slotIndex: number, isFaceDown?: boolean, position?: string) => {
      handlers.handleCardPlace(card, zoneName, slotIndex, isFaceDown, position);
      gameSync.sendGameAction('CARD_PLACED', {
        card,
        zoneName,
        slotIndex,
        isFaceDown,
        position
      });
      gameSync.sendGameAction('HAND_UPDATED', {
        handCount: gameState.playerHand.length - 1
      });
      multiplayerHook.logGameAction(`placed ${card.name} in ${zoneName}`, gameState.gameData?.playerName || 'Player');
    },
    handleLifePointsChange: (newLifePoints: number, isPlayer: boolean = true) => {
      handlers.handleLifePointsChange(newLifePoints, isPlayer);
      gameSync.sendGameAction('LIFE_POINTS_CHANGED', {
        newLifePoints,
        isPlayer: true
      });
    },
    handlePhaseChange: (newPhase: string) => {
      handlers.handlePhaseChange(newPhase);
      gameSync.sendGameAction('PHASE_CHANGED', {
        phase: newPhase
      });
    },
    handleDrawCard: () => {
      handlers.handleDrawCard();
      gameSync.sendGameAction('CARD_DRAWN', {
        playerName: gameState.gameData?.playerName || 'Player'
      });
      gameSync.sendGameAction('HAND_UPDATED', {
        handCount: gameState.playerHand.length + 1
      });
    },
    handleEndTurn: () => {
      // Prima cambia il turno localmente
      handlers.handleEndTurn();
      
      // Poi invia l'evento di fine turno
      gameSync.sendGameAction('TURN_ENDED', {
        playerName: gameState.gameData?.playerName || 'Player'
      });
      
      multiplayerHook.logGameAction('ended turn', gameState.gameData?.playerName || 'Player');
    },
    handleCardMove: (card: any, fromZone: string, toZone: string, slotIndex?: number) => {
      handlers.handleCardMove(card, fromZone, toZone, slotIndex);
      gameSync.sendGameAction('CARD_MOVED', {
        card,
        fromZone,
        toZone,
        slotIndex
      });
      if (fromZone === 'hand') {
        gameSync.sendGameAction('HAND_UPDATED', {
          handCount: gameState.playerHand.length - 1
        });
      }
    },
    handleShowCard: (card: any) => {
      gameSync.sendGameAction('SHOW_CARD', {
        card,
        playerName: gameState.gameData?.playerName || 'Player'
      });
    },
    handleShowHand: () => {
      gameSync.sendGameAction('SHOW_HAND', {
        hand: gameState.playerHand,
        playerName: gameState.gameData?.playerName || 'Player'
      });
    }
  };

  const handleGameStart = async (gameData: any) => {
    try {
      console.log('[INDEX] Starting game process', gameData);
      console.log('=== STARTING GAME ===', gameData);
      
      let session = null;
      if (gameData.isHost) {
        console.log('[INDEX] Creating game session as host');
        console.log('Creating game session as host...');
        session = await multiplayerHook.createGameSession(gameData.gameId, gameData.playerName);
      } else {
        console.log('[INDEX] Joining game session as guest');
        console.log('Joining game session as guest...');
        session = await multiplayerHook.joinGameSession(gameData.gameId, gameData.playerName);
      }
      
      console.log('[INDEX] Session creation/join result', { success: !!session, session });
      
      if (session) {
        console.log('Session created/joined successfully, updating game state...');
        gameState.setGameData(gameData);
        
        if (!gameData.isHost) {
          console.log('[INDEX] Guest entering waiting room immediately');
          console.log('=== GUEST ENTERING WAITING ROOM IMMEDIATELY ===');
          gameState.setGameStarted(true);
        }
        
        return true;
      } else {
        console.error('[INDEX] Failed to create/join game session');
        console.error('Failed to create/join game session');
        return false;
      }
    } catch (error) {
      console.error('[INDEX] Exception in handleGameStart', error);
      console.error('Error in handleGameStart:', error);
      return false;
    }
  };

  const handleHostEnterWaiting = () => {
    console.log('[INDEX] Host entering waiting room');
    console.log('=== HOST ENTERING WAITING ROOM ===');
    gameState.setGameStarted(true);
  };

  const handlePlayerReady = async () => {
    console.log('[INDEX] Player ready clicked');
    console.log('=== PLAYER READY CLICKED ===');
    
    try {
      gameState.setPlayerReady(true);
      await multiplayerHook.setPlayerReady(true);
      console.log('[INDEX] Player marked as ready successfully');
      console.log('Player marked as ready successfully');
    } catch (error) {
      console.error('[INDEX] Error setting player ready', error);
      console.error('Error setting player ready:', error);
    }
  };

  const handleBothPlayersReady = () => {
    console.log('[INDEX] Both players ready - starting actual game');
    console.log('=== BOTH PLAYERS READY - STARTING ACTUAL GAME ===');
    
    gameState.setBothPlayersReady(true);
    
    if (gameState.initializeGame) {
      console.log('Initializing game...');
      gameState.initializeGame();
    }
    
    setTimeout(() => {
      gameSync.syncCompleteGameState();
    }, 1000);
  };

  if (multiplayerHook.error) {
    console.error('[INDEX] Multiplayer error detected', { error: multiplayerHook.error });
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

  if (gameState.gameStarted && gameState.bothPlayersReady) {
    console.log('[INDEX] Rendering game layout');
    console.log('=== RENDERING GAME LAYOUT ===');
    return (
      <GameLayout
        gameData={gameState.gameData}
        gameState={gameState}
        handlers={enhancedHandlers}
      />
    );
  }

  console.log('[INDEX] Rendering multiplayer setup');
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
