
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

export const useGameSync = (user: any, gameSessionId: string | null, gameState: any) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastProcessedActionRef = useRef<string | null>(null);
  const isSetupRef = useRef(false);

  const sendGameAction = useCallback(async (actionType: string, actionData: any) => {
    if (!user || !gameSessionId) {
      console.log('[GAME_SYNC] Cannot send action - missing user or session');
      return;
    }

    const actionId = crypto.randomUUID();
    
    try {
      console.log('[GAME_SYNC] Sending action', {
        actionType,
        actionData,
        gameSessionId,
        playerId: user.id
      });

      const { error } = await supabase
        .from('game_actions_realtime')
        .insert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_name: gameState.gameData?.playerName || 'Player',
          action_type: actionType,
          action_data: {
            ...actionData,
            isPlayer: true // Always true for the sender
          }
        });

      if (error) {
        console.error('[GAME_SYNC] Error sending action', error);
        throw error;
      }

      lastProcessedActionRef.current = actionId;
      
    } catch (error) {
      console.error('[GAME_SYNC] Error sending action', error);
    }
  }, [user, gameSessionId]);

  const syncCompleteGameState = useCallback(async () => {
    if (!user || !gameSessionId || !gameState.playerField) return;

    try {
      // Preparazione dei dati per la sincronizzazione
      const gameData = {
        playerLifePoints: gameState.playerLifePoints || 8000,
        currentPhase: gameState.currentPhase || 'draw',
        isPlayerTurn: gameState.isPlayerTurn || true,
        playerHandCount: gameState.playerHand?.length || 0,
        lastAction: new Date().toISOString()
      };

      const { error } = await supabase
        .from('game_states')
        .upsert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_field: JSON.stringify(gameState.playerField),
          player_life_points: gameData.playerLifePoints,
          player_hand_count: gameData.playerHandCount,
          current_phase: gameData.currentPhase,
          is_player_turn: gameData.isPlayerTurn,
          last_update: new Date().toISOString()
        }, {
          onConflict: 'game_session_id,player_id'
        });

      if (error) {
        console.error('[GAME_SYNC] Error syncing game state', error);
      } else {
        console.log('[GAME_SYNC] Game state synced successfully');
      }
    } catch (error) {
      console.error('[GAME_SYNC] Exception in syncCompleteGameState', error);
    }
  }, [user, gameSessionId, gameState]);

  const processGameAction = useCallback((action: any) => {
    if (action.player_id === user?.id) {
      return;
    }

    if (lastProcessedActionRef.current === action.id) {
      return;
    }

    console.log('[GAME_SYNC] Processing action from opponent', action);
    
    const { action_type, action_data } = action;
    
    try {
      switch (action_type) {
        case 'CARD_PLACED':
          if (gameState.setEnemyField) {
            gameState.setEnemyField((prev: any) => {
              const newField = { ...prev };
              
              // Preserve private data (deck, extraDeck, deadZone, banished, banishedFaceDown)
              const privateData = {
                deck: prev.deck || [],
                extraDeck: prev.extraDeck || [],
                deadZone: prev.deadZone || [],
                banished: prev.banished || [],
                banishedFaceDown: prev.banishedFaceDown || [],
                magia: prev.magia || [],
                terreno: prev.terreno || []
              };
              
              // Update only public zones
              if (newField[action_data.zoneName]) {
                newField[action_data.zoneName] = [...newField[action_data.zoneName]];
                if (action_data.slotIndex !== undefined && action_data.slotIndex >= 0) {
                  newField[action_data.zoneName][action_data.slotIndex] = {
                    ...action_data.card,
                    position: action_data.position || 'attack',
                    isFaceDown: action_data.isFaceDown || false
                  };
                }
              }
              
              // Merge private data back
              return { ...newField, ...privateData };
            });
          }
          break;

        case 'CARD_MOVED':
          // Handle card movement with proper player/enemy separation
          if (gameState.handleCardMove) {
            // The action comes from opponent, so isPlayer = false for us
            gameState.handleCardMove(
              action_data.card, 
              action_data.fromZone, 
              action_data.toZone, 
              action_data.slotIndex, 
              false // isPlayer = false because it's the opponent's action
            );
          }
          break;

        case 'CARD_DRAWN':
          if (gameState.setEnemyHandCount) {
            gameState.setEnemyHandCount((prev: number) => prev + 1);
          }
          break;

        case 'DECK_MILLED':
          if (gameState.setEnemyHandCount) {
            const millCount = action_data.millCount || 1;
            gameState.setEnemyHandCount((prev: number) => Math.max(0, prev - millCount));
          }
          break;

        case 'HAND_UPDATED':
          if (gameState.setEnemyHandCount) {
            gameState.setEnemyHandCount(action_data.handCount || 0);
          }
          break;

        case 'LIFE_POINTS_CHANGED':
          if (gameState.setEnemyLifePoints) {
            gameState.setEnemyLifePoints(action_data.newLifePoints);
          }
          break;

        case 'PHASE_CHANGED':
          if (gameState.setCurrentPhase) {
            gameState.setCurrentPhase(action_data.phase);
          }
          break;

        case 'TURN_ENDED':
          if (gameState.setIsPlayerTurn) {
            gameState.setIsPlayerTurn(true);
          }
          if (gameState.setCurrentPhase) {
            gameState.setCurrentPhase('draw');
          }
          break;

        case 'CHAT_MESSAGE':
          if (gameState.setChatMessages) {
            gameState.setChatMessages((prev: any[]) => [...prev, {
              id: Date.now() + Math.random(),
              player: action_data.playerName,
              message: action_data.message,
              timestamp: new Date().toLocaleTimeString()
            }]);
          }
          break;
      }

      lastProcessedActionRef.current = action.id;
      
      // Debug logging
      console.log('🔄 Multiplayer sync completed:', {
        actionType: action_type,
        playerDeckSize: gameState.playerField?.deck?.length || 0,
        enemyDeckSize: gameState.enemyField?.deck?.length || 0,
        areDecksIndependent: gameState.playerField?.deck?.[0]?.id !== gameState.enemyField?.deck?.[0]?.id
      });
    } catch (error) {
      console.error('[GAME_SYNC] Error processing action:', error);
    }
  }, [user, gameState]);

  useEffect(() => {
    if (!user || !gameSessionId || isSetupRef.current) {
      console.log('[GAME_SYNC] Not setting up listener - missing requirements or already setup');
      return;
    }

    console.log('[GAME_SYNC] Setting up real-time action listener', gameSessionId);
    isSetupRef.current = true;

    const cleanupChannel = () => {
      if (channelRef.current) {
        console.log('[GAME_SYNC] Cleaning up action listener');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };

    cleanupChannel();

    const channel = supabase
      .channel(`game_actions_${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_actions_realtime',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        (payload) => {
          console.log('[GAME_SYNC] Received real-time action', payload);
          processGameAction(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('[GAME_SYNC] Action listener subscription status', status);
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('[GAME_SYNC] Successfully subscribed to game actions');
        } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT || status === REALTIME_SUBSCRIBE_STATES.CLOSED || status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error('[GAME_SYNC] Failed to subscribe to game actions:', status);
          // Reset setup flag to allow retry
          isSetupRef.current = false;
        }
      });

    channelRef.current = channel;

    return () => {
      cleanupChannel();
      isSetupRef.current = false;
    };
  }, [user, gameSessionId, processGameAction]);

  console.log('[GAME_SYNC] Hook status', {
    hasUser: !!user,
    gameSessionId,
    lastProcessedAction: lastProcessedActionRef.current,
    channelSetup: isSetupRef.current
  });

  return {
    sendGameAction,
    syncCompleteGameState
  };
};
