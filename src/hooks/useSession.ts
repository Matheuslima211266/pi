import { useEffect, useState, useCallback } from 'react';
import { ref, set, onValue, off, update, get, onDisconnect } from 'firebase/database';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { database, auth } from '../integrations/firebase/config';
import { GameSession } from './multiplayerTypes';

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [sessionGameId, setSessionGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opponentReady, setOpponentReady] = useState(false);

  /* ------------------------  AUTH ------------------------ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        signInAnonymously(auth).catch((err) => {
          console.error('[FIREBASE] auth error', err);
          setError('Authentication failed');
        });
      }
    });
    return () => unsubscribe();
  }, []);

  /* ------------------  CREATE / JOIN SESSION  ------------- */
  const createGameSession = useCallback(async (gameId: string, playerName: string): Promise<GameSession | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }
    const sessionData: GameSession = {
      id: gameId,
      gameId,
      hostId: user.uid,
      hostName: playerName,
      hostReady: false,
      guestReady: false,
      createdAt: Date.now(),
      status: 'waiting'
    };
    try {
      await set(ref(database, `sessions/${gameId}`), sessionData);
      setSessionGameId(gameId);
      return sessionData;
    } catch (err: any) {
      console.error('[FIREBASE] create session error', err);
      setError('Failed to create game session');
      return null;
    }
  }, [user]);

  const joinGameSession = useCallback(async (gameId: string, playerName: string): Promise<GameSession | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    const sessionRef = ref(database, `sessions/${gameId}`);
    try {
      const snap = await get(sessionRef);
      const existing = snap.val() as GameSession;
      if (!existing) throw new Error('Game session not found');
      if (existing.guestId && existing.guestId !== user.uid && existing.guestReady) {
        throw new Error('Game session is full');
      }
      await update(sessionRef, {
        guestId: user.uid,
        guestName: playerName,
        guestReady: false
      });
      setSessionGameId(gameId);
      const updatedSnap = await get(sessionRef);
      return updatedSnap.val() as GameSession;
    } catch (err: any) {
      console.error('[FIREBASE] join session error', err);
      setError(err.message || 'Failed to join game session');
      return null;
    }
  }, [user]);

  /* ---------------------  PLAYER READY  ------------------- */
  const setPlayerReady = useCallback(async (ready: boolean) => {
    if (!currentSession || !user) return;
    const isHost = user.uid === currentSession.hostId;
    const updates = isHost ? { hostReady: ready } : { guestReady: ready };
    try {
      await update(ref(database, `sessions/${currentSession.gameId}`), updates);
    } catch (err) {
      console.error('setPlayerReady error', err);
    }
  }, [currentSession, user]);

  /* -----------------  SESSION LISTENER  ------------------- */
  useEffect(() => {
    if (!user || !sessionGameId) return;
    const sessRef = ref(database, `sessions/${sessionGameId}`);
    onValue(sessRef, (snap) => {
      const sess = snap.val() as GameSession;
      setCurrentSession(sess);
      if (sess) {
        const isHost = user.uid === sess.hostId;
        setOpponentReady(isHost ? sess.guestReady : sess.hostReady);
      }
    }, (err) => setError(err.message));
    return () => off(sessRef);
  }, [user, sessionGameId]);

  /* -------------  CLEANUP ON DISCONNECT  ------------------ */
  useEffect(() => {
    if (!currentSession || !user) return;
    const gameId = currentSession.gameId;
    const uid = user.uid;
    const playerGSRef = ref(database, `gameStates/${gameId}/${uid}`);
    onDisconnect(playerGSRef).remove();
    const sessRef = ref(database, `sessions/${gameId}`);
    const discUpdate = uid === currentSession.hostId ? { hostReady: false } : { guestReady: false, guestId: null, guestName: null };
    onDisconnect(sessRef).update(discUpdate);
  }, [currentSession, user]);

  /* --------------------- UTIL ----------------------------- */
  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setSessionGameId(null);
    setOpponentReady(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    currentSession,
    opponentReady,
    error,
    createGameSession,
    joinGameSession,
    setPlayerReady,
    resetSession,
    clearError
  } as const;
}; 