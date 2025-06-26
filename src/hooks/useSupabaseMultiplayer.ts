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

  console.log('=== SUPABASE MULTIPLAYER HOOK ===', {
    hasUser: !!user,
    userId: user?.id,
    currentSession: !!currentSession,
    sessionId: currentSession?.id,
    gameId: currentSession?.game_id,
    hostId: currentSession?.host_id,
    guestId: currentSession?.guest_id,
    opponentReady,
    error
  });

  // Helper function to cast database row to GameSession
  const castToGameSession = (data: any): GameSession => {
    return {
      ...data,
      status: data.status as GameSession['status']
    };
  };

  // Create game session (for host)
  const createGameSession = useCallback(async (gameId: string, playerName: string) => {
    if (!user) {
      console.error('No user for createGameSession');
      return null;
    }

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
  }, [user]);

  // Join game session (for guest) - COMPLETELY REWRITTEN VERSION
  const joinGameSession = useCallback(async (gameId: string, playerName: string) => {
    if (!user) {
      console.error('No user for joinGameSession');
      setError('User not authenticated');
      return null;
    }

    try {
      console.log('=== GUEST ATTEMPTING TO JOIN (v2) ===', { 
        gameId: gameId.toUpperCase(), 
        playerName, 
        userId: user.id 
      });
      
      // Step 1: Search for the game session - more flexible approach
      console.log('Step 1: Searching for game session...');
      
      const { data: sessions, error: searchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId.toUpperCase())
        .in('status', ['waiting', 'active']);

      console.log('Search result:', { sessions, searchError });

      if (searchError) {
        console.error('Search error:', searchError);
        setError('Failed to search for game session');
        return null;
      }

      if (!sessions || sessions.length === 0) {
        console.error('No sessions found for game ID:', gameId);
        setError('Game ID not found. Please check the ID and try again.');
        return null;
      }

      const existingSession = sessions[0];
      console.log('Step 2: Found session:', existingSession);

      // Step 2: Validation checks
      if (existingSession.host_id === user.id) {
        console.error('Cannot join your own game');
        setError('Cannot join your own game');
        return null;
      }

      if (existingSession.guest_id && existingSession.guest_id !== user.id) {
        console.error('Game is already full');
        setError('Game is already full');
        return null;
      }

      // Step 3: If already joined, just return the session
      if (existingSession.guest_id === user.id) {
        console.log('Already joined this session');
        const gameSession = castToGameSession(existingSession);
        setCurrentSession(gameSession);
        setError(null);
        return gameSession;
      }

      // Step 4: Join the game
      console.log('Step 3: Joining game by updating session...');
      const updateData = {
        guest_id: user.id,
        guest_name: playerName,
        status: 'active' as const,
        updated_at: new Date().toISOString()
      };
      
      console.log('Update data:', updateData);
      
      const { data: updatedSession, error: updateError } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', existingSession.id)
        .select()
        .single();

      console.log('Update result:', { updatedSession, updateError });

      if (updateError) {
        console.error('Update error:', updateError);
        setError(`Failed to join game session: ${updateError.message}`);
        return null;
      }

      if (!updatedSession) {
        console.error('No updated session returned');
        setError('Failed to join game session - no response');
        return null;
      }

      console.log('=== GUEST SUCCESSFULLY JOINED (v2) ===', updatedSession);
      const gameSession = castToGameSession(updatedSession);
      setCurrentSession(gameSession);
      setError(null);
      
      // Show success toast
      toast({
        title: "Successfully joined game!",
        description: `Joined game ${gameId}`,
      });
      
      return gameSession;
    } catch (err) {
      console.error('Error in joinGameSession (v2):', err);
      setError(`Failed to join game session: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [user, toast]);

  // Update player ready status
  const setPlayerReady = useCallback(async (isReady: boolean) => {
    if (!currentSession || !user) {
      console.log('Cannot set player ready - no session or user');
      return;
    }

    const isHost = currentSession.host_id === user.id;
    const updateField = isHost ? 'host_ready' : 'guest_ready';

    try {
      console.log('=== SETTING PLAYER READY ===', { 
        isReady, 
        isHost, 
        updateField, 
        sessionId: currentSession.id,
        userId: user.id 
      });
      
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ [updateField]: isReady })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ready status:', error);
        setError('Failed to update ready status');
      } else {
        console.log('=== PLAYER READY STATUS UPDATED ===', data);
        const updatedSession = castToGameSession(data);
        setCurrentSession(updatedSession);
        
        // Update opponent ready status
        const newOpponentReady = isHost ? updatedSession.guest_ready : updatedSession.host_ready;
        setOpponentReady(newOpponentReady);
        
        console.log('Updated opponent ready status:', newOpponentReady);
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
      if (error) console.error('Error logging game action:', error);
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
      if (error) console.error('Error sending chat message:', error);
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
      if (error) console.error('Error syncing game state:', error);
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  }, [currentSession, user, gameState]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentSession || !user) return;

    console.log('=== SETTING UP REAL-TIME SUBSCRIPTIONS ===', currentSession.id);

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
          console.log('=== REAL-TIME SESSION UPDATE ===', payload.new);
          const updatedSession = castToGameSession(payload.new);
          setCurrentSession(updatedSession);
          
          // Update opponent ready status
          const isHost = updatedSession.host_id === user.id;
          const opponentReadyStatus = isHost ? updatedSession.guest_ready : updatedSession.host_ready;
          setOpponentReady(opponentReadyStatus);
          
          console.log('=== REAL-TIME READY STATES ===', {
            playerIsHost: isHost,
            hostReady: updatedSession.host_ready,
            guestReady: updatedSession.guest_ready,
            opponentReady: opponentReadyStatus,
            hasGuest: !!updatedSession.guest_id,
            guestName: updatedSession.guest_name
          });

          // Show toast when opponent joins or gets ready
          if (isHost && updatedSession.guest_id && updatedSession.guest_name && !currentSession.guest_id) {
            toast({
              title: "Opponent connected!",
              description: `${updatedSession.guest_name} joined the game`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(gameSessionChannel);
    };
  }, [currentSession, user, toast]);

  // Load initial data when session is set
  useEffect(() => {
    if (!currentSession || !user) return;

    const loadInitialData = async () => {
      try {
        console.log('=== LOADING INITIAL DATA ===', currentSession.id);
        
        // Set initial opponent ready status
        const isHost = currentSession.host_id === user.id;
        const initialOpponentReady = isHost ? currentSession.guest_ready : currentSession.host_ready;
        setOpponentReady(initialOpponentReady);

        console.log('=== INITIAL READY STATES ===', {
          playerIsHost: isHost,
          hostReady: currentSession.host_ready,
          guestReady: currentSession.guest_ready,
          initialOpponentReady,
          hasGuest: !!currentSession.guest_id,
          guestName: currentSession.guest_name
        });
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();
  }, [currentSession, user]);

  // Periodically check for updates if real-time fails
  useEffect(() => {
    if (!currentSession || !user) return;

    const checkForUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', currentSession.id)
          .single();

        if (error) {
          console.error('Error checking for updates:', error);
          return;
        }

        if (data) {
          const updatedSession = castToGameSession(data);
          
          // Only update if something actually changed
          if (JSON.stringify(updatedSession) !== JSON.stringify(currentSession)) {
            console.log('=== MANUAL UPDATE DETECTED ===', updatedSession);
            setCurrentSession(updatedSession);
            
            const isHost = updatedSession.host_id === user.id;
            const opponentReadyStatus = isHost ? updatedSession.guest_ready : updatedSession.host_ready;
            setOpponentReady(opponentReadyStatus);
          }
        }
      } catch (err) {
        console.error('Error in manual update check:', err);
      }
    };

    // Check every 2 seconds as fallback
    const interval = setInterval(checkForUpdates, 2000);

    return () => clearInterval(interval);
  }, [currentSession, user]);

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
