import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useGameSync = (user: User | null, gameSessionId: string | null, gameState: any) => {
  const [lastProcessedAction, setLastProcessedAction] = useState<string | null>(null);
  const [channelSetup, setChannelSetup] = useState(false);
  const actionChannelRef = useRef<any>(null);
  const processingRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('[GAME_SYNC] Hook status', {
    hasUser: !!user,
    gameSessionId,
    lastProcessedAction,
    channelSetup
  });

  // Send game action to other players
  const sendGameAction = useCallback(async (actionType: string, actionData: any) => {
    if (!user || !gameSessionId) {
      console.log('[GAME_SYNC] Cannot send action - missing user or session');
      return;
    }

    try {
      console.log('[GAME_SYNC] Sending action', { actionType, actionData });
      
      const { error } = await supabase
        .from('game_actions_realtime')
        .insert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_name: gameState.gameData?.playerName || 'Player',
          action_type: actionType,
          action_data: actionData,
          processed: false
        });

      if (error) {
        console.error('[GAME_SYNC] Error sending action:', error);
      }
    } catch (error) {
      console.error('[GAME_SYNC] Exception sending action:', error);
    }
  }, [user, gameSessionId, gameState.gameData?.playerName]);

  // Process received action
  const processAction = useCallback((action: any) => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    
    try {
      console.log('[GAME_SYNC] Processing action from opponent', action);
      
      const { action_type, action_data } = action;
      
      switch (action_type) {
        case 'CARD_DRAWN':
          if (action_data.isPlayer) {
            // Opponent drew a card
            gameState.setEnemyHandCount(prev => prev + 1);
          }
          break;
          
        case 'HAND_UPDATED':
          if (action_data.isPlayer) {
            // Update opponent's hand count
            gameState.setEnemyHandCount(action_data.handCount);
          }
          break;
          
        case 'CARD_PLACED':
          // Update opponent's field
          gameState.setEnemyField(prev => {
            const newField = { ...prev };
            const { card, zoneName, slotIndex, isFaceDown, position } = action_data;
            
            if (zoneName === 'monsters') {
              newField.monsters = [...prev.monsters];
              newField.monsters[slotIndex] = { ...card, faceDown: isFaceDown, position };
            } else if (zoneName === 'spellsTraps') {
              newField.spellsTraps = [...prev.spellsTraps];
              newField.spellsTraps[slotIndex] = { ...card, faceDown: isFaceDown };
            }
            
            return newField;
          });
          break;
          
        case 'LIFE_POINTS_CHANGED':
          if (action_data.isPlayer) {
            // Update opponent's life points
            gameState.setEnemyLifePoints(action_data.newLifePoints);
          }
          break;
          
        case 'PHASE_CHANGED':
          gameState.setCurrentPhase(action_data.phase);
          break;
          
        case 'TURN_ENDED':
          gameState.setIsPlayerTurn(prev => !prev);
          gameState.setCurrentPhase('draw');
          break;
          
        case 'CARD_MOVED':
          // Handle card movement on opponent's field
          const { card, fromZone, toZone, slotIndex } = action_data;
          gameState.setEnemyField(prev => {
            const newField = { ...prev };
            
            // Remove from source
            if (fromZone === 'monsters' && prev.monsters) {
              newField.monsters = prev.monsters.map(c => c?.id === card.id ? null : c);
            } else if (fromZone === 'spellsTraps' && prev.spellsTraps) {
              newField.spellsTraps = prev.spellsTraps.map(c => c?.id === card.id ? null : c);
            }
            
            // Add to destination
            if (toZone === 'deadZone') {
              newField.deadZone = [...(prev.deadZone || []), card];
            } else if (toZone === 'graveyard') {
              newField.graveyard = [...(prev.graveyard || []), card];
            }
            
            return newField;
          });
          break;
          
        case 'CHAT_MESSAGE':
          // Add to chat
          const newMessage = {
            id: Date.now() + Math.random(),
            player: action_data.playerName,
            message: action_data.message,
            timestamp: new Date().toLocaleTimeString()
          };
          gameState.setChatMessages(prev => [...prev, newMessage]);
          break;
          
        case 'SHOW_CARD':
          gameState.setEnemyRevealedCard(action_data.card);
          setTimeout(() => gameState.setEnemyRevealedCard(null), 3000);
          break;
          
        case 'SHOW_HAND':
          gameState.setEnemyRevealedHand(action_data.hand);
          setTimeout(() => gameState.setEnemyRevealedHand([]), 5000);
          break;
      }
      
      // Add to action log
      const newAction = {
        id: Date.now() + Math.random(),
        player: action_data.playerName || 'Opponent',
        action: `${action_type.toLowerCase().replace('_', ' ')}`,
        timestamp: new Date().toLocaleTimeString()
      };
      gameState.setActionLog(prev => [...prev, newAction]);
      
      console.log('🔄 Multiplayer sync completed:', { action_type, processed: true });
    } catch (error) {
      console.error('[GAME_SYNC] Error processing action:', error);
    } finally {
      processingRef.current = false;
    }
  }, [gameState]);

  // Set up real-time action listener
  useEffect(() => {
    if (!user || !gameSessionId || channelSetup) {
      console.log('[GAME_SYNC] Not setting up listener - missing requirements or already setup');
      return;
    }

    console.log('[GAME_SYNC] Setting up real-time action listener', gameSessionId);

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
          
          // Only process actions from other players
          if (payload.new.player_id !== user.id) {
            processAction(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('[GAME_SYNC] Action listener subscription status', status);
        if (status === 'SUBSCRIBED') {
          console.log('[GAME_SYNC] Successfully subscribed to game actions');
          setChannelSetup(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('[GAME_SYNC] Failed to subscribe to game actions:', status);
          setChannelSetup(false);
        }
      });

    actionChannelRef.current = channel;

    return () => {
      console.log('[GAME_SYNC] Cleaning up action listener');
      if (actionChannelRef.current) {
        supabase.removeChannel(actionChannelRef.current);
        actionChannelRef.current = null;
      }
      setChannelSetup(false);
    };
  }, [user, gameSessionId, channelSetup, processAction]);

  // Sync complete game state (called less frequently)
  const syncCompleteGameState = useCallback(async () => {
    if (!user || !gameSessionId) return;

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync operation
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const gameStateData = {
          player_life_points: gameState.playerLifePoints || 8000,
          player_hand_count: gameState.playerHand?.length || 0,
          current_phase: gameState.currentPhase || 'draw',
          is_player_turn: gameState.isPlayerTurn || false,
          time_remaining: gameState.timeRemaining || 60,
          player_ready: gameState.playerReady || false,
          last_update: new Date().toISOString()
        };

        console.log('[GAME_SYNC] Syncing complete game state:', gameStateData);

        // Use upsert to avoid conflicts
        const { error } = await supabase
          .from('game_states')
          .upsert({
            game_session_id: gameSessionId,
            player_id: user.id,
            player_field: JSON.stringify(gameState.playerField || {}),
            ...gameStateData
          });

        if (error) {
          console.error('[GAME_SYNC] Error syncing complete game state:', error);
        } else {
          console.log('[GAME_SYNC] Complete game state synced successfully');
        }
      } catch (error) {
        console.error('[GAME_SYNC] Exception syncing complete game state:', error);
      }
    }, 1000);
  }, [user, gameSessionId, gameState]);

  return {
    sendGameAction,
    syncCompleteGameState,
    lastProcessedAction,
    channelSetup
  };
};
