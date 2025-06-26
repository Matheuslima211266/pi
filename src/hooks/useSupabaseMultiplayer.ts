
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface GameSession {
  id: string;
  game_id: string;
  host_id: string;
  guest_id?: string;
  host_name: string;
  guest_name?: string;
  host_ready: boolean;
  guest_ready: boolean;
  status: 'waiting' | 'ready' | 'playing' | 'finished' | 'active';
  created_at: string;
  updated_at: string;
}

export const useSupabaseMultiplayer = (user: User, gameState: any) => {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [opponentReady, setOpponentReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to cast database row to GameSession
  const castToGameSession = (data: any): GameSession => {
    return {
      ...data,
      status: data.status as GameSession['status']
    };
  };

  // Create game session (for host)
  const createGameSession = useCallback(async (gameId: string, playerName: string) => {
    if (!user) return null;

    try {
      console.log('Creating game session:', { gameId, playerName, userId: user.id });
      
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          game_id: gameId,
          host_id: user.id,
          host_name: playerName,
          host_ready: false,
          guest_ready: false,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating game session:', error);
        setError('Failed to create game session');
        toast({
          title: "Error",
          description: "Failed to create game session",
          variant: "destructive",
        });
        return null;
      }

      console.log('Game session created successfully:', data);
      const gameSession = castToGameSession(data);
      setCurrentSession(gameSession);
      setError(null);
      return gameSession;
    } catch (err) {
      console.error('Error in createGameSession:', err);
      setError('Failed to create game session');
      return null;
    }
  }, [user, toast]);

  // Join game session (for guest)
  const joinGameSession = useCallback(async (gameId: string, playerName: string) => {
    if (!user) return null;

    try {
      console.log('Searching for game session:', gameId);
      
      // First, find the game session
      const { data: existingSession, error: fetchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .eq('status', 'waiting')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching game session:', fetchError);
        setError('Failed to find game session');
        return null;
      }

      if (!existingSession) {
        setError('Game not found or already started');
        toast({
          title: "Error",
          description: "Game not found or already started",
          variant: "destructive",
        });
        return null;
      }

      if (existingSession.guest_id) {
        setError('Game is already full');
        toast({
          title: "Error", 
          description: "Game is already full",
          variant: "destructive",
        });
        return null;
      }

      console.log('Found game session, joining:', existingSession);

      // Join the game
      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          guest_id: user.id,
          guest_name: playerName,
          status: 'active'
        })
        .eq('id', existingSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error joining game session:', error);
        setError('Failed to join game session');
        return null;
      }

      console.log('Successfully joined game session:', data);
      const gameSession = castToGameSession(data);
      setCurrentSession(gameSession);
      setError(null);
      
      // Notify that opponent connected
      if (gameState.setOpponentConnected) {
        gameState.setOpponentConnected(true);
      }
      
      return gameSession;
    } catch (err) {
      console.error('Error in joinGameSession:', err);
      setError('Failed to join game session');
      return null;
    }
  }, [user, toast, gameState]);

  // Update player ready status
  const setPlayerReady = useCallback(async (isReady: boolean) => {
    if (!currentSession || !user) return;

    const isHost = currentSession.host_id === user.id;
    const updateField = isHost ? 'host_ready' : 'guest_ready';

    try {
      console.log('Setting player ready:', { isReady, isHost, updateField });
      
      const { error } = await supabase
        .from('game_sessions')
        .update({ [updateField]: isReady })
        .eq('id', currentSession.id);

      if (error) {
        console.error('Error updating ready status:', error);
        setError('Failed to update ready status');
      } else {
        console.log('Player ready status updated successfully');
      }
    } catch (err) {
      console.error('Error in setPlayerReady:', err);
      setError('Failed to update ready status');
    }
  }, [currentSession, user]);

  // Log game action
  const logGameAction = useCallback(async (action: string, playerName: string) => {
    if (!currentSession || !user) return;

    try {
      const { error } = await supabase
        .from('game_actions')
        .insert({
          game_session_id: currentSession.id,
          player_id: user.id,
          player_name: playerName,
          action: action
        });

      if (error) {
        console.error('Error logging game action:', error);
      }
    } catch (err) {
      console.error('Error in logGameAction:', err);
    }
  }, [currentSession, user]);

  // Send chat message
  const sendChatMessage = useCallback(async (message: string, playerName: string) => {
    if (!currentSession || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          game_session_id: currentSession.id,
          player_id: user.id,
          player_name: playerName,
          message: message
        });

      if (error) {
        console.error('Error sending chat message:', error);
      }
    } catch (err) {
      console.error('Error in sendChatMessage:', err);
    }
  }, [currentSession, user]);

  // Sync game state to database
  const syncGameState = useCallback(async () => {
    if (!currentSession || !user) return;

    try {
      const { error } = await supabase
        .from('game_states')
        .upsert({
          game_session_id: currentSession.id,
          player_id: user.id,
          player_field: gameState.playerField,
          player_life_points: gameState.playerLifePoints,
          player_hand_count: gameState.playerHand?.length || 0,
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
  }, [currentSession, user, gameState]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentSession || !user) return;

    console.log('Setting up real-time subscriptions for session:', currentSession.id);

    // Subscribe to game session changes
    const gameSessionChannel = supabase
      .channel(`game_session_${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('Game session updated:', payload.new);
          const updatedSession = castToGameSession(payload.new);
          setCurrentSession(updatedSession);
          
          // Update opponent ready status and connection status
          const isHost = updatedSession.host_id === user.id;
          const opponentReadyStatus = isHost ? updatedSession.guest_ready : updatedSession.host_ready;
          setOpponentReady(opponentReadyStatus);
          
          // If a guest joined (guest_id was added), notify that opponent connected
          if (updatedSession.guest_id && gameState.setOpponentConnected) {
            gameState.setOpponentConnected(true);
          }
        }
      )
      .subscribe();

    // Subscribe to game states for opponent updates
    const gameStateChannel = supabase
      .channel(`game_states_${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `game_session_id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('Game state update:', payload);
          // Handle opponent state updates
          if (payload.new && typeof payload.new === 'object' && 'player_id' in payload.new && payload.new.player_id !== user.id) {
            // Update opponent's game state
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
      .channel(`chat_${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_session_id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('New chat message:', payload);
          if (payload.new && typeof payload.new === 'object' && 'player_id' in payload.new && payload.new.player_id !== user.id) {
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
      .channel(`actions_${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_actions',
          filter: `game_session_id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('New game action:', payload);
          if (payload.new && typeof payload.new === 'object' && 'player_id' in payload.new && payload.new.player_id !== user.id) {
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

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(gameSessionChannel);
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(actionsChannel);
    };
  }, [currentSession, user, gameState]);

  // Load initial data when session is set
  useEffect(() => {
    if (!currentSession || !user) return;

    const loadInitialData = async () => {
      try {
        console.log('Loading initial data for session:', currentSession.id);
        
        // Set initial opponent ready status
        const isHost = currentSession.host_id === user.id;
        const initialOpponentReady = isHost ? currentSession.guest_ready : currentSession.host_ready;
        setOpponentReady(initialOpponentReady);

        // Load game actions
        const { data: actions } = await supabase
          .from('game_actions')
          .select('*')
          .eq('game_session_id', currentSession.id)
          .order('timestamp', { ascending: true });

        if (actions) {
          const formattedActions = actions.map(action => ({
            id: action.id,
            player: action.player_name,
            action: action.action,
            timestamp: new Date(action.timestamp).toLocaleTimeString()
          }));
          gameState.setActionLog(formattedActions);
        }

        // Load chat messages
        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('game_session_id', currentSession.id)
          .order('timestamp', { ascending: true });

        if (messages) {
          const formattedMessages = messages.map(msg => ({
            id: msg.id,
            player: msg.player_name,
            message: msg.message
          }));
          gameState.setChatMessages([
            { id: 1, player: 'Sistema', message: 'Duello iniziato!' },
            ...formattedMessages
          ]);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, [currentSession, user, gameState]);

  return {
    currentSession,
    opponentReady,
    error,
    createGameSession,
    joinGameSession,
    setPlayerReady,
    logGameAction,
    sendChatMessage,
    syncGameState,
    clearError: () => setError(null)
  };
};
