import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

export const useGameSync = (user: any, gameSessionId: string | null, gameState: any) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastProcessedActionRef = useRef<string | null>(null);

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
          action_data: actionData,
          created_at: new Date().toISOString()
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
    if (!user || !gameSessionId) return;

    try {
      const gameData = {
        playerField: gameState.playerField,
        enemyField: gameState.enemyField,
        playerHand: gameState.playerHand,
        playerLifePoints: gameState.playerLifePoints,
        enemyLifePoints: gameState.enemyLifePoints,
        currentPhase: gameState.currentPhase,
        isPlayerTurn: gameState.isPlayerTurn,
        actionLog: gameState.actionLog
      };

      const { error } = await supabase
        .from('game_states')
        .upsert({
          game_session_id: gameSessionId,
          player_id: user.id,
          game_data: gameData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[GAME_SYNC] Error syncing game state', error);
      }
    } catch (error) {
      console.error('[GAME_SYNC] Error syncing game state', error);
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
    
    switch (action_type) {
      case 'CARD_PLACED':
        if (gameState.setEnemyField) {
          gameState.setEnemyField((prev: any) => {
            const newField = { ...prev };
            
            // Preserve private data
            const privateData = {
              deck: prev.deck,
              extraDeck: prev.extraDeck,
              deadZone: prev.deadZone,
              banished: prev.banished,
              banishedFaceDown: prev.banishedFaceDown
            };
            
            // Update only public zones
            if (newField[action_data.zoneName]) {
              newField[action_data.zoneName] = [...newField[action_data.zoneName]];
              newField[action_data.zoneName][action_data.slotIndex] = {
                ...action_data.card,
                position: action_data.position || 'attack',
                isFaceDown: action_data.isFaceDown || false
              };
            }
            
            // Merge private data back
            return { ...newField, ...privateData };
          });
        }
        break;

      case 'HAND_UPDATED':
        if (gameState.setEnemyHandCount) {
          gameState.setEnemyHandCount(action_data.handCount);
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

      case 'CARD_DRAWN':
        if (gameState.addActionLog) {
          gameState.addActionLog(`${action_data.playerName} drew a card`);
        }
        break;

      case 'CARD_MOVED':
        // Handle card movement between zones with private data preservation
        if (gameState.setEnemyField) {
          gameState.setEnemyField((prev: any) => {
            const newField = { ...prev };
            
            // Preserve private data
            const privateData = {
              deck: prev.deck,
              extraDeck: prev.extraDeck,
              deadZone: prev.deadZone,
              banished: prev.banished,
              banishedFaceDown: prev.banishedFaceDown
            };
            
            // Handle public zone moves only
            if (action_data.toZone === 'monsters' || action_data.toZone === 'spellsTraps' || action_data.toZone === 'fieldSpell') {
              // Update public zones
              if (newField[action_data.toZone]) {
                newField[action_data.toZone] = [...newField[action_data.toZone]];
                if (action_data.slotIndex !== undefined) {
                  newField[action_data.toZone][action_data.slotIndex] = action_data.card;
                } else {
                  newField[action_data.toZone].push(action_data.card);
                }
              }
            }
            
            return { ...newField, ...privateData };
          });
        }
        break;

      case 'SHOW_CARD':
        if (gameState.setEnemyRevealedCard) {
          gameState.setEnemyRevealedCard(action_data.card);
          setTimeout(() => {
            gameState.setEnemyRevealedCard(null);
          }, 5000);
        }
        break;

      case 'SHOW_HAND':
        if (gameState.setEnemyRevealedHand) {
          gameState.setEnemyRevealedHand(action_data.hand);
          setTimeout(() => {
            gameState.setEnemyRevealedHand([]);
          }, 10000);
        }
        break;

      case 'CHAT_MESSAGE':
        if (gameState.addChatMessage) {
          gameState.addChatMessage({
            id: Date.now(),
            player: action_data.playerName,
            message: action_data.message,
            timestamp: new Date().toLocaleTimeString()
          });
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
  }, [user, gameState]);

  useEffect(() => {
    if (!user || !gameSessionId) {
      console.log('[GAME_SYNC] Not setting up listener - missing user or session');
      return;
    }

    console.log('[GAME_SYNC] Setting up real-time action listener', gameSessionId);

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
        } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('[GAME_SYNC] Failed to subscribe to game actions:', status);
        }
      });

    channelRef.current = channel;

    return cleanupChannel;
  }, [user, gameSessionId, processGameAction]);

  console.log('[GAME_SYNC] Hook status', {
    hasUser: !!user,
    gameSessionId,
    lastProcessedAction: lastProcessedActionRef.current
  });

  return {
    sendGameAction,
    syncCompleteGameState
  };
};
