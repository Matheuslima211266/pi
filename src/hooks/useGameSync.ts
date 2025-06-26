import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface GameAction {
  id: string;
  game_session_id: string;
  player_id: string;
  player_name: string;
  action_type: string;
  action_data: any;
  timestamp: string;
  processed: boolean;
}

export const useGameSync = (user: User | null, gameSessionId: string | null, gameState: any, setGameState: any) => {
  const [lastProcessedAction, setLastProcessedAction] = useState<string | null>(null);

  console.log('=== GAME SYNC HOOK ===', {
    hasUser: !!user,
    gameSessionId,
    lastProcessedAction
  });

  // Invia un'azione al database
  const sendGameAction = useCallback(async (actionType: string, actionData: any) => {
    if (!user || !gameSessionId) {
      console.log('[GAME_SYNC] Cannot send action - missing user or session', { hasUser: !!user, gameSessionId });
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
          action_data: actionData
        });

      if (error) {
        console.error('[GAME_SYNC] Error sending action', error);
      } else {
        console.log('[GAME_SYNC] Action sent successfully');
      }
    } catch (err) {
      console.error('[GAME_SYNC] Exception sending action', err);
    }
  }, [user, gameSessionId, gameState.gameData?.playerName]);

  // Applica un'azione ricevuta
  const applyReceivedAction = useCallback((action: GameAction) => {
    console.log('[GAME_SYNC] Applying received action', action);
    
    // Non applicare le proprie azioni
    if (action.player_id === user?.id) {
      console.log('[GAME_SYNC] Skipping own action');
      return;
    }

    const { action_type, action_data } = action;

    switch (action_type) {
      case 'CARD_PLACED':
        console.log('[GAME_SYNC] Applying CARD_PLACED', action_data);
        setGameState((prev: any) => ({
          ...prev,
          enemyField: {
            ...prev.enemyField,
            [action_data.zoneName]: prev.enemyField[action_data.zoneName].map((card: any, index: number) =>
              index === action_data.slotIndex ? action_data.card : card
            )
          }
        }));
        break;

      case 'LIFE_POINTS_CHANGED':
        console.log('[GAME_SYNC] Applying LIFE_POINTS_CHANGED', action_data);
        if (action_data.isPlayer) {
          setGameState((prev: any) => ({
            ...prev,
            enemyLifePoints: action_data.newLifePoints
          }));
        }
        break;

      case 'CHAT_MESSAGE':
        console.log('[GAME_SYNC] Applying CHAT_MESSAGE', action_data);
        setGameState((prev: any) => ({
          ...prev,
          chatMessages: [...prev.chatMessages, {
            id: Date.now(),
            player: action_data.playerName,
            message: action_data.message
          }]
        }));
        break;

      case 'PHASE_CHANGED':
        console.log('[GAME_SYNC] Applying PHASE_CHANGED', action_data);
        setGameState((prev: any) => ({
          ...prev,
          currentPhase: action_data.phase,
          isPlayerTurn: !prev.isPlayerTurn
        }));
        break;

      case 'CARD_DRAWN':
        console.log('[GAME_SYNC] Applying CARD_DRAWN', action_data);
        // L'avversario ha pescato una carta - aggiorna il conteggio delle sue carte
        setGameState((prev: any) => ({
          ...prev,
          enemyField: {
            ...prev.enemyField,
            deck: prev.enemyField.deck.slice(1) // Rimuovi una carta dal deck nemico
          }
        }));
        break;

      default:
        console.log('[GAME_SYNC] Unknown action type', action_type);
    }
  }, [user?.id, setGameState]);

  // Sincronizza lo stato completo (versione semplificata)
  const syncCompleteGameState = useCallback(async () => {
    if (!user || !gameSessionId) return;

    try {
      console.log('[GAME_SYNC] Syncing complete game state');
      
      const { error } = await supabase
        .from('game_states')
        .upsert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_field: gameState.playerField,
          player_life_points: gameState.playerLifePoints,
          player_hand_count: gameState.playerHand?.length || 0,
          current_phase: gameState.currentPhase,
          is_player_turn: gameState.isPlayerTurn,
          time_remaining: gameState.timeRemaining,
          player_hand: gameState.playerHand,
          enemy_field: gameState.enemyField,
          enemy_life_points: gameState.enemyLifePoints,
          chat_messages: gameState.chatMessages,
          turn_number: gameState.turnNumber || 1,
          last_update: new Date().toISOString()
        });

      if (error) {
        console.error('[GAME_SYNC] Error syncing game state', error);
      }
    } catch (err) {
      console.error('[GAME_SYNC] Exception syncing game state', err);
    }
  }, [user, gameSessionId, gameState]);

  // Ascolta le azioni in tempo reale
  useEffect(() => {
    if (!gameSessionId || !user) return;

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
          console.log('[GAME_SYNC] Received real-time action', payload.new);
          const action = payload.new as GameAction;
          
          // Evita di processare la stessa azione due volte
          if (action.id !== lastProcessedAction) {
            applyReceivedAction(action);
            setLastProcessedAction(action.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('[GAME_SYNC] Action listener subscription status', status);
      });

    return () => {
      console.log('[GAME_SYNC] Cleaning up action listener');
      supabase.removeChannel(channel);
    };
  }, [gameSessionId, user, applyReceivedAction, lastProcessedAction]);

  return {
    sendGameAction,
    syncCompleteGameState
  };
};
