import { useEffect, useState, useCallback } from 'react';
import { ref, set, onValue, off, runTransaction } from 'firebase/database';
import { User } from 'firebase/auth';
import { database } from '../integrations/firebase/config';
import { GameState, GameSession } from './multiplayerTypes';

export const useGameStateSync = (currentSession: GameSession | null, user: User | null) => {
  const [myGameState, setMyGameState] = useState<GameState | null>(null);
  const [opponentGameState, setOpponentGameState] = useState<GameState | null>(null);

  /* ------------------ WRITE MY STATE ------------------- */
  const syncGameState = useCallback(async (state: GameState) => {
    if (!currentSession || !user) return;
    const gsRef = ref(database, `gameStates/${currentSession.gameId}/${user.uid}`);
    const data = { ...state, lastUpdate: Date.now(), playerName: state.playerName || 'Unknown Player' };
    try {
      await runTransaction(gsRef, (currentData) => {
        if (currentData === null) {
          return data;
        }
        const mergedData = { ...currentData, ...data };
        return mergedData;
      });
      setMyGameState(state);
    } catch (err) {
      console.error('syncGameState error', err);
    }
  }, [currentSession, user]);

  /* ------------------- LISTEN MY STATE (DISABILITATO PER EVITARE LOOP)  ---------------- */
  /*
  useEffect(() => {
    if (!currentSession || !user) return;
    const gsRef = ref(database, `gameStates/${currentSession.gameId}/${user.uid}`);
    const unsub = onValue(gsRef, (snap) => {
      const val = snap.val() as GameState;
      if (val) setMyGameState(val);
    });
    return () => off(gsRef);
  }, [currentSession, user]);
  */

  /* -------------- LISTEN OPPONENT STATE ---------------- */
  useEffect(() => {
    if (!currentSession || !user) return;
    const oppId = user.uid === currentSession.hostId ? currentSession.guestId : currentSession.hostId;
    if (!oppId) return;
    const oppRef = ref(database, `gameStates/${currentSession.gameId}/${oppId}`);
    const unsub = onValue(oppRef, (snap) => {
      const val = snap.val() as GameState;
      setOpponentGameState(val || null);
    });
    return () => off(oppRef);
  }, [currentSession, user]);

  /* -------------  CONNECTION TEST  -------------------- */
  const testConnection = useCallback(async () => {
    if (!user) return false;
    try {
      const tRef = ref(database, 'connection_test');
      await set(tRef, { ts: Date.now(), uid: user.uid });
      off(tRef);
      return true;
    } catch {
      return false;
    }
  }, [user]);

  useEffect(() => {
    const id = setInterval(() => { testConnection(); }, 30000);
    return () => clearInterval(id);
  }, [testConnection]);

  return {
    myGameState,
    opponentGameState,
    syncGameState,
    testConnection
  } as const;
}; 