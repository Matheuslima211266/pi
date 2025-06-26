
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseMultiplayer = (user: User, gameState: any) => {
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [opponentReady, setOpponentReady] = useState(false);
  const { toast } = useToast();

  // Sync game state to database
  const syncGameState = useCallback(async () => {
    if (!gameSessionId || !user) return;

    try {
      const { error } = await supabase
        .from('game_states')
        .upsert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_field: gameState.playerField,
          player_life_points: gameState.playerLifePoints,
          player_hand_count: gameState.playerHand.length,
          current_phase: gameState.currentPhase,
          is_player_turn: gameState.isPlayerTurn,
          time_remaining: gameState.timeRemaining,
          player_ready: gameState.playerReady,
          last_update: new Date().toISOString()
        });

      if (error) {
        console.error('Error syncing game state:', error);
      }
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  }, [gameSessionId, user, gameState]);

  // Create game session
  const createGameSession = useCallback(async (gameId: string, playerName: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          game_id: gameId,
          host_id: user.id,
          host_name: playerName,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      setGameSessionId(data.id);
      return data;
    } catch (error: any) {
      console.error('Error creating game session:', error);
      toast({
        title: "Error",
        description: "Failed to create game session",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Join game session
  const joinGameSession = useCallback(async (gameId: string, playerName: string) => {
    if (!user) return null;

    try {
      // First, find the game session
      const { data: session, error: findError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (findError) throw findError;

      // Update with guest info
      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          guest_id: user.id,
          guest_name: playerName,
          status: 'ready'
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      setGameSessionId(data.id);
      return data;
    } catch (error: any) {
      console.error('Error joining game session:', error);
      toast({
        title: "Error",
        description: "Failed to join game session",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Send chat message
  const sendChatMessage = useCallback(async (message: string, playerName: string) => {
    if (!gameSessionId || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_name: playerName,
          message: message
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  }, [gameSessionId, user]);

  // Log game action
  const logGameAction = useCallback(async (action: string, playerName: string) => {
    if (!gameSessionId || !user) return;

    try {
      const { error } = await supabase
        .from('game_actions')
        .insert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_name: playerName,
          action: action
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging game action:', error);
    }
  }, [gameSessionId, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameSessionId) return;

    // Subscribe to game states
    const gameStateChannel = supabase
      .channel('game_states')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        (payload) => {
          console.log('Game state update:', payload);
          // Handle opponent state updates here
          if (payload.new && typeof payload.new === 'object' && 'player_id' in payload.new && payload.new.player_id !== user.id) {
            // Update opponent's game state
            if ('player_ready' in payload.new && payload.new.player_ready) {
              setOpponentReady(true);
            }
            // Sync other game state properties
            if ('player_field' in payload.new && payload.new.player_field) {
              gameState.setEnemyField(payload.new.player_field);
            }
            if ('player_life_points' in payload.new && typeof payload.new.player_life_points === 'number') {
              gameState.setEnemyLifePoints(payload.new.player_life_points);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to chat messages
    const chatChannel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        (payload) => {
          console.log('New chat message:', payload);
          if (payload.new && typeof payload.new === 'object' && 'player_id' in payload.new && payload.new.player_id !== user.id) {
            // Add message to chat
            if ('id' in payload.new && 'player_name' in payload.new && 'message' in payload.new) {
              gameState.setChatMessages((prev: any[]) => [...prev, {
                id: payload.new.id,
                player: payload.new.player_name,
                message: payload.new.message
              }]);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to game actions
    const actionsChannel = supabase
      .channel('game_actions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_actions',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        (payload) => {
          console.log('New game action:', payload);
          if (payload.new && typeof payload.new === 'object' && 'player_id' in payload.new && payload.new.player_id !== user.id) {
            // Add action to log
            if ('id' in payload.new && 'player_name' in payload.new && 'action' in payload.new && 'timestamp' in payload.new) {
              gameState.setActionLog((prev: any[]) => [...prev, {
                id: payload.new.id,
                player: payload.new.player_name,
                action: payload.new.action,
                timestamp: new Date(payload.new.timestamp as string).toLocaleTimeString()
              }]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(actionsChannel);
    };
  }, [gameSessionId, user, gameState]);

  return {
    createGameSession,
    joinGameSession,
    syncGameState,
    sendChatMessage,
    logGameAction,
    opponentReady,
    gameSessionId
  };
};
