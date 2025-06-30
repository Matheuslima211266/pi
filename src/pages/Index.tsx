import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import AuthComponent from '@/components/AuthComponent';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import GameLayout from '@/components/GameLayout';
import MultiplayerDebugPanel from '@/components/MultiplayerDebugPanel';
import { useGameState } from '@/hooks/useGameState';
import { useFirebaseMultiplayer } from '../hooks/useFirebaseMultiplayer';
import { useFirebaseSync } from '../hooks/useFirebaseSync';
import { useGameHandlers } from '@/hooks/useGameHandlers';
import { PlacementMenuProvider } from '../contexts/PlacementMenuContext';
import DebugCaptureButton from '../components/DebugCaptureButton';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const gameState = useGameState();
  const firebaseHook = useFirebaseMultiplayer();
  const firebaseSync = useFirebaseSync(gameState, firebaseHook);
  const handlers = useGameHandlers(gameState);

  useEffect(() => {
    if (gameState.bothPlayersReady && !gameState.currentTurnPlayerId) {
      const { turnOrder, hostId, guestId } = gameState.gameData;
      const firstPlayerId = turnOrder === 'host' ? hostId : guestId;
      if (firstPlayerId) {
        gameState.setCurrentTurnPlayerId(firstPlayerId);
      }
    }
  }, [gameState.bothPlayersReady, gameState.gameData, gameState.currentTurnPlayerId, gameState.setCurrentTurnPlayerId]);

  useEffect(() => {
    if (user && gameState.currentTurnPlayerId) {
      gameState.setIsPlayerTurn(user.uid === gameState.currentTurnPlayerId);
    }
  }, [user, gameState.currentTurnPlayerId, gameState.setIsPlayerTurn]);

  // Effect to enrich gameData with session details (host/guest IDs)
  useEffect(() => {
    const session = firebaseHook.currentSession;
    if (session && session.hostId && session.guestId && !gameState.gameData?.hostId) {
      gameState.setGameData(prev => ({
        ...prev,
        hostId: session.hostId,
        guestId: session.guestId
      }));
    }
  }, [firebaseHook.currentSession, gameState.gameData, gameState.setGameData]);

  // Effect to sync opponent's state to local game state
  useEffect(() => {
    const opponentState = firebaseHook.opponentGameState;
    if (opponentState) {
      console.log('Opponent state received:', opponentState);
      gameState.setEnemyField(opponentState.playerField);
      gameState.setEnemyLifePoints(opponentState.playerLifePoints);
      gameState.setEnemyHandCount(opponentState.playerHandCount);

      // Sync turn state from opponent
      if (opponentState.currentTurnPlayerId && opponentState.currentTurnPlayerId !== gameState.currentTurnPlayerId) {
        gameState.setCurrentTurnPlayerId(opponentState.currentTurnPlayerId);
      }
    }
  }, [firebaseHook.opponentGameState, gameState.setEnemyField, gameState.setEnemyLifePoints, gameState.setEnemyHandCount, gameState.setCurrentTurnPlayerId, gameState.currentTurnPlayerId]);

  // Enhanced handlers that use Firebase sync
  const enhancedHandlers = {
    ...handlers,
    handleSendMessage: (message: string) => {
      handlers.handleSendMessage(message);
      firebaseHook.sendChatMessage(message, gameState.gameData?.playerName || 'Player');
    },
    handleCardPlace: (card: any, zoneName: string, slotIndex: number, isFaceDown?: boolean, position?: string) => {
      handlers.handleCardPlace(card, zoneName, slotIndex, isFaceDown, position);
      firebaseHook.logGameAction(`placed ${card.name} in ${zoneName}`, gameState.gameData?.playerName || 'Player');
    },
    handleLifePointsChange: (newLifePoints: number, isPlayer: boolean = true) => {
      handlers.handleLifePointsChange(newLifePoints, isPlayer);
    },
    handlePhaseChange: (newPhase: string) => {
      handlers.handlePhaseChange(newPhase);
    },
    handleDrawCard: () => {
      handlers.handleDrawCard();
      firebaseHook.logGameAction('drew a card', gameState.gameData?.playerName || 'Player');
    },
    handleDeckMill: (millCount: number = 1) => {
      handlers.handleDeckMill(millCount);
      firebaseHook.logGameAction(`milled ${millCount} cards`, gameState.gameData?.playerName || 'Player');
    },
    handleEndTurn: () => {
      handlers.handleEndTurn();
      firebaseHook.logGameAction('ended turn', gameState.gameData?.playerName || 'Player');
    },
    handleCardMove: (card: any, fromZone: string, toZone: string, slotIndex?: number) => {
      handlers.handleCardMove(card, fromZone, toZone, slotIndex, true);
      firebaseHook.logGameAction(`moved ${card.name} from ${fromZone} to ${toZone}`, gameState.gameData?.playerName || 'Player');
    },
    handleShowCard: (card: any) => {
      firebaseHook.logGameAction(`showed ${card.name}`, gameState.gameData?.playerName || 'Player');
    },
    handleShowHand: () => {
      firebaseHook.logGameAction('showed hand', gameState.gameData?.playerName || 'Player');
    },
    handleCardPreview: (card: any) => {
      handlers.handleCardPreview(card);
    },
    handleCreateToken: (tokenData: any) => {
      handlers.handleCreateToken(tokenData);
      firebaseHook.logGameAction(`created token ${tokenData.name}`, gameState.gameData?.playerName || 'Player');
    },
    handleDiceRoll: (result: number) => {
      handlers.handleDiceRoll(result);
    },
    handleCoinFlip: (result: string) => {
      handlers.handleCoinFlip(result);
    },
  };

  const handleGameStart = async (newGameData) => {
    console.log('[DEBUG] handleGameStart called', newGameData);
    // Crea o unisciti alla sessione Firebase
    let session = null;
    if (newGameData.isHost) {
      session = await firebaseHook.createGameSession(newGameData.gameId, newGameData.playerName);
      console.log('[DEBUG] createGameSession result:', session);
    } else {
      session = await firebaseHook.joinGameSession(newGameData.gameId, newGameData.playerName);
      console.log('[DEBUG] joinGameSession result:', session);
    }
    
    if (session) {
      // Imposta sempre i dati del gioco
      gameState.setGameData(newGameData);
      console.log('[DEBUG] setGameData called', newGameData);
      
      // Apply custom settings
      if (typeof newGameData.startingLP === 'number') {
        gameState.setPlayerLifePoints(newGameData.startingLP);
        gameState.setEnemyLifePoints(newGameData.startingLP);
      }
      if (typeof newGameData.summonLimit === 'number' && gameState.setSummonLimit) {
        gameState.setSummonLimit(newGameData.summonLimit);
      }
      
      if (newGameData.isHost) {
        // Host: rimane nella schermata di setup, attenderà la waiting room
        console.log('Host: Game session created, waiting for players');
      } else {
        // Guest: rimane nella schermata di setup, attenderà la waiting room
        console.log('Guest: Joined game, waiting in lobby');
      }
      
      if (newGameData.gameId) {
        // Sincronizza le carte personalizzate per il multiplayer
        if (newGameData.isHost) {
          const hostCards = localStorage.getItem('simsupremo_custom_cards');
          if (hostCards) {
            const sharedKey = `simsupremo_shared_cards_${newGameData.gameId}`;
            localStorage.setItem(sharedKey, hostCards);
          }
        } else {
          const sharedCards = localStorage.getItem(`simsupremo_shared_cards_${newGameData.gameId}`);
          if (sharedCards) {
            try {
              const shared = JSON.parse(sharedCards);
              const existingCards = localStorage.getItem('simsupremo_custom_cards');
              let guestCards = existingCards ? JSON.parse(existingCards) : [];
              const existingIds = new Set(guestCards.map(c => c.id));
              const uniqueShared = shared.filter(card => !existingIds.has(card.id));
              if (uniqueShared.length > 0) {
                guestCards = [...guestCards, ...uniqueShared];
                localStorage.setItem('simsupremo_custom_cards', JSON.stringify(guestCards));
              }
            } catch (error) {
              console.error('Error syncing shared cards:', error);
            }
          }
        }
      }
      
      return true; // Indica successo
    } else {
      console.error('[DEBUG] Failed to create/join game session', newGameData);
      throw new Error('Failed to create/join game session');
    }
  };

  const handlePlayerReady = async () => {
    try {
      gameState.setPlayerReady(true);
      await firebaseHook.setPlayerReady(true);
    } catch (error) {
      console.error('Error setting player ready:', error);
    }
  };

  const handleBothPlayersReady = () => {
    gameState.setBothPlayersReady(true);
    // Avvia il gioco per entrambi
    gameState.setGameStarted(true);
    
    if (gameState.initializeGame) {
      gameState.initializeGame();
    }
  };

  const handleHostEnterWaiting = () => {
    console.log('Host entering waiting room');
    // host waits in lobby; game will start when both ready
  };

  if (firebaseHook.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-destructive/30 border border-destructive rounded-lg p-6 text-center">
          <h2 className="text-destructive font-bold text-xl mb-2">Connection Error</h2>
          <p className="text-destructive-foreground mb-4">{firebaseHook.error}</p>
          <button 
            onClick={() => {
              firebaseHook.clearError();
              window.location.reload();
            }}
            className="bg-destructive hover:bg-destructive/80 text-destructive-foreground px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PlacementMenuProvider>
      <div className="min-h-screen bg-background">
        {/* Debug Panel - visibile solo in modalità sviluppo */}
        <MultiplayerDebugPanel 
          gameState={gameState}
          firebaseHook={firebaseHook}
          isVisible={process.env.NODE_ENV === 'development' && !!gameState.gameData?.gameId}
        />
        
        {!user ? (
          <AuthComponent onAuth={setUser} />
        ) : !gameState.gameStarted ? (
          <MultiplayerSetup
            onGameStart={async (gameData) => {
              try {
                await handleGameStart(gameData);
                return true;
              } catch (error) {
                console.error('Error in onGameStart:', error);
                return false;
              }
            }}
            onJoinGame={async (gameData) => {
              try {
                console.log('[DEBUG] onJoinGame called with:', gameData);
                const session = await firebaseHook.joinGameSession(gameData.gameId, gameData.playerName);
                if (session) {
                  console.log('[DEBUG] Join successful, calling handleGameStart');
                  await handleGameStart(gameData);
                  return session;
                } else {
                  throw new Error('Failed to join game session');
                }
              } catch (error) {
                console.error('[DEBUG] Error in onJoinGame:', error);
                throw error;
              }
            }}
            onDeckLoad={handlers.handleDeckLoad}
            onPlayerReady={handlePlayerReady}
            onBothPlayersReady={handleBothPlayersReady}
            onHostEnterWaiting={handleHostEnterWaiting}
            gameState={{
              ...gameState,
              opponentReady: firebaseHook.opponentReady,
              currentSession: firebaseHook.currentSession
            }}
          />
        ) : (
          <GameLayout
            gameData={gameState.gameData}
            gameState={gameState}
            handlers={enhancedHandlers}
            firebaseHook={firebaseHook}
          />
        )}
        <DebugCaptureButton />
      </div>
    </PlacementMenuProvider>
  );
};

export default Index;
