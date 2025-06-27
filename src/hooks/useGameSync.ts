
import { useSupabaseMultiplayer } from './useSupabaseMultiplayer';

export const useGameSync = (user, sessionId, gameState) => {
  const { supabase } = useSupabaseMultiplayer(user, gameState);
  
  const syncCompleteGameState = async () => {
    if (!sessionId || !user) {
      console.log('[GAME_SYNC] Cannot sync - missing session or user');
      return;
    }

    try {
      console.log('[GAME_SYNC] Syncing complete game state for session:', sessionId);
      
      const gameStateData = {
        game_session_id: sessionId,
        player_id: user.id,
        player_hand_count: gameState.playerHand?.length || 0,
        player_life_points: gameState.playerLifePoints || 8000,
        player_field: JSON.stringify(gameState.playerField || {}),
        current_phase: gameState.currentPhase || 'draw',
        is_player_turn: gameState.isPlayerTurn || false,
        updated_at: new Date().toISOString()
      };

      console.log('[GAME_SYNC] Attempting to upsert game state:', gameStateData);

      const { error } = await supabase
        .from('game_states')
        .upsert(gameStateData, { 
          onConflict: 'game_session_id,player_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('[GAME_SYNC] Error syncing game state', error);
        // Don't throw error, just log it to avoid blocking gameplay
      } else {
        console.log('[GAME_SYNC] Game state synced successfully');
      }
    } catch (error) {
      console.error('[GAME_SYNC] Exception syncing game state:', error);
      // Don't throw error, just log it to avoid blocking gameplay
    }
  };

  const sendGameAction = async (actionType, actionData) => {
    if (!sessionId || !user) {
      console.log('[GAME_SYNC] Cannot send action - missing session or user');
      return;
    }

    try {
      const { error } = await supabase
        .from('game_actions')
        .insert({
          game_session_id: sessionId,
          player_id: user.id,
          action_type: actionType,
          action_data: JSON.stringify(actionData),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('[GAME_SYNC] Error sending game action:', error);
      }
    } catch (error) {
      console.error('[GAME_SYNC] Exception sending game action:', error);
    }
  };

  return {
    syncCompleteGameState,
    sendGameAction
  };
};
