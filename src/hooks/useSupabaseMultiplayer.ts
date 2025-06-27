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
    console.log('[MULTIPLAYER] HOST: Starting createGameSession', { gameId, playerName, userId: user?.id });
    
    if (!user) {
      console.error('[MULTIPLAYER] HOST: No user for createGameSession');
      console.error('No user for createGameSession');
      return null;
    }

    try {
      console.log('[MULTIPLAYER] HOST: Inserting new game session', { gameId, playerName, userId: user.id });
      
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
        console.error('[MULTIPLAYER] HOST: Error creating game session', error);
        console.error('Error creating game session:', error);
        setError('Failed to create game session');
        return null;
      }

      console.log('[MULTIPLAYER] HOST: Game session created successfully', data);
      console.log('Game session created successfully:', data);
      const gameSession = castToGameSession(data);
      setCurrentSession(gameSession);
      setError(null);
      return gameSession;
    } catch (err) {
      console.error('[MULTIPLAYER] HOST: Exception in createGameSession', err);
      console.error('Error in createGameSession:', err);
      setError('Failed to create game session');
      return null;
    }
  }, [user]);

  // Join game session (for guest) - SUPER DETAILED VERSION
  const joinGameSession = useCallback(async (gameId: string, playerName: string) => {
    console.log('[MULTIPLAYER] GUEST: ========== STARTING JOIN PROCESS ==========', { gameId, playerName, userId: user?.id });
    
    if (!user) {
      console.error('[MULTIPLAYER] GUEST: No user authenticated');
      console.error('No user for joinGameSession');
      setError('User not authenticated');
      return null;
    }

    try {
      const upperGameId = gameId.toUpperCase();
      console.log('[MULTIPLAYER] GUEST: Step 1 - Preparing to search for game', { 
        originalGameId: gameId,
        upperGameId,
        playerName, 
        userId: user.id 
      });
      
      // Step 1: Search for the game session
      console.log('[MULTIPLAYER] GUEST: Step 2 - Executing database search query');
      
      const { data: sessions, error: searchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', upperGameId);

      console.log('[MULTIPLAYER] GUEST: Step 3 - Search query completed', { 
        foundSessions: sessions?.length || 0,
        sessions: sessions,
        searchError: searchError 
      });

      if (searchError) {
        console.error('[MULTIPLAYER] GUEST: Database search error', searchError);
        console.error('Search error:', searchError);
        setError('Failed to search for game session');
        return null;
      }

      if (!sessions || sessions.length === 0) {
        console.error('[MULTIPLAYER] GUEST: No sessions found', { gameId: upperGameId });
        console.error('No sessions found for game ID:', upperGameId);
        setError('Game ID not found. Please check the ID and try again.');
        return null;
      }

      // Check for multiple sessions with same game_id
      if (sessions.length > 1) {
        console.warn('[MULTIPLAYER] GUEST: Multiple sessions found with same game_id', { 
          gameId: upperGameId, 
          sessionsCount: sessions.length,
          sessions: sessions 
        });
      }

      const existingSession = sessions[0];
      console.log('[MULTIPLAYER] GUEST: Step 4 - Found target session', existingSession);

      // Step 2: Validation checks
      console.log('[MULTIPLAYER] GUEST: Step 5 - Starting validation checks');
      
      if (existingSession.host_id === user.id) {
        console.error('[MULTIPLAYER] GUEST: User is trying to join their own game', { userId: user.id, hostId: existingSession.host_id });
        console.error('Cannot join your own game');
        setError('Cannot join your own game');
        return null;
      }

      if (existingSession.guest_id && existingSession.guest_id !== user.id) {
        console.error('[MULTIPLAYER] GUEST: Game already has a different guest', { 
          existingGuestId: existingSession.guest_id, 
          currentUserId: user.id 
        });
        console.error('Game is already full');
        setError('Game is already full');
        return null;
      }

      // Step 3: Check if already joined
      if (existingSession.guest_id === user.id) {
        console.log('[MULTIPLAYER] GUEST: User already joined this session', existingSession);
        console.log('Already joined this session');
        const gameSession = castToGameSession(existingSession);
        setCurrentSession(gameSession);
        setError(null);
        return gameSession;
      }

      // Step 4: Join the game
      console.log('[MULTIPLAYER] GUEST: Step 6 - Attempting to join game by updating session');
      
      const updateData = {
        guest_id: user.id,
        guest_name: playerName,
        status: 'active' as const,
        updated_at: new Date().toISOString()
      };
      
      console.log('[MULTIPLAYER] GUEST: Step 7 - Update data prepared', updateData);
      
      const { data: updatedSession, error: updateError } = await supabase
        .from('game_sessions')
        .update(updateData)
        .eq('id', existingSession.id)
        .select()
        .single();

      console.log('[MULTIPLAYER] GUEST: Step 8 - Update query completed', { 
        updatedSession, 
        updateError,
        sessionId: existingSession.id 
      });

      if (updateError) {
        console.error('[MULTIPLAYER] GUEST: Update failed', updateError);
        console.error('Update error:', updateError);
        setError(`Failed to join game session: ${updateError.message}`);
        return null;
      }

      if (!updatedSession) {
        console.error('[MULTIPLAYER] GUEST: No updated session returned from database');
        console.error('No updated session returned');
        setError('Failed to join game session - no response');
        return null;
      }

      console.log('[MULTIPLAYER] GUEST: ========== SUCCESSFULLY JOINED GAME ==========', updatedSession);
      console.log('=== GUEST SUCCESSFULLY JOINED ===', updatedSession);
      
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
      console.error('[MULTIPLAYER] GUEST: Exception during join process', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      console.error('Error in joinGameSession:', err);
      setError(`Failed to join game session: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [user, toast]);

  // Update player ready status
  const setPlayerReady = useCallback(async (isReady: boolean) => {
    console.log('[MULTIPLAYER] Setting player ready status', { isReady, currentSession: !!currentSession, userId: user?.id });
    
    if (!currentSession || !user) {
      console.error('[MULTIPLAYER] Cannot set player ready - missing session or user', { hasSession: !!currentSession, hasUser: !!user });
      console.log('Cannot set player ready - no session or user');
      return;
    }

    const isHost = currentSession.host_id === user.id;
    const updateField = isHost ? 'host_ready' : 'guest_ready';

    try {
      console.log('[MULTIPLAYER] Updating ready status in database', { 
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
        console.error('[MULTIPLAYER] Failed to update ready status', error);
        console.error('Error updating ready status:', error);
        setError('Failed to update ready status');
      } else {
        console.log('[MULTIPLAYER] Ready status updated successfully', data);
        console.log('=== PLAYER READY STATUS UPDATED ===', data);
        const updatedSession = castToGameSession(data);
        setCurrentSession(updatedSession);
        
        // Update opponent ready status
        const newOpponentReady = isHost ? updatedSession.guest_ready : updatedSession.host_ready;
        setOpponentReady(newOpponentReady);
        
        console.log('[MULTIPLAYER] Updated opponent ready status', { newOpponentReady });
        console.log('Updated opponent ready status:', newOpponentReady);
      }
    } catch (err) {
      console.error('[MULTIPLAYER] Exception in setPlayerReady', err);
      console.error('Error in setPlayerReady:', err);
      setError('Failed to update ready status');
    }
  }, [currentSession, user]);

  // Log game action - now enhanced for real-time sync
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
        console.error('[MULTIPLAYER] Failed to log game action', { error, action, playerName });
        console.error('Error logging game action:', error);
      }
    } catch (err) {
      console.error('[MULTIPLAYER] Exception in logGameAction', err);
      console.error('Error in logGameAction:', err);
    }
  }, [currentSession, user]);

  // Send chat message - enhanced for real-time sync
  const sendChatMessage = useCallback(async (message: string, playerName: string) => {
    if (!currentSession || !user) return;
    try {
      // Send to old chat system
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          game_session_id: currentSession.id,
          player_id: user.id,
          player_name: playerName,
          message: message
        });
      if (error) {
        console.error('[MULTIPLAYER] Failed to send chat message', { error, message, playerName });
        console.error('Error sending chat message:', error);
      }
    } catch (err) {
      console.error('[MULTIPLAYER] Exception in sendChatMessage', err);
      console.error('Error in sendChatMessage:', err);
    }
  }, [currentSession, user]);

  // Sync game state to database - Fixed version
  const syncGameState = useCallback(async () => {
    if (!currentSession || !user) return;
    
    try {
      // Only sync basic game state data, not complex objects
      const gameStateData = {
        player_life_points: gameState.playerLifePoints || 8000,
        player_hand_count: gameState.playerHand?.length || 0,
        current_phase: gameState.currentPhase || 'draw',
        is_player_turn: gameState.isPlayerTurn || false,
        time_remaining: gameState.timeRemaining || 60,
        player_ready: gameState.playerReady || false,
        last_update: new Date().toISOString()
      };

      console.log('[MULTIPLAYER] Syncing game state:', gameStateData);

      const { error } = await supabase
        .from('game_states')
        .insert({
          game_session_id: currentSession.id,
          player_id: user.id,
          player_field: JSON.stringify(gameState.playerField || {}),
          ...gameStateData
        });

      if (error) {
        console.error('[MULTIPLAYER] Failed to sync game state', error);
        console.error('Error syncing game state:', error);
      } else {
        console.log('[MULTIPLAYER] Game state synced successfully');
      }
    } catch (error) {
      console.error('[MULTIPLAYER] Exception in syncGameState', error);
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
