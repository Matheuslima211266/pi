import { useState, useEffect, useCallback } from 'react';
import { ref, push, onValue, off, query, limitToLast } from 'firebase/database';
import { User } from 'firebase/auth';
import { database } from '../integrations/firebase/config';
import { GameSession } from './multiplayerTypes';

export interface GameAction {
  id: number;
  action: string;
  playerName: string;
  timestamp: number;
}

export const useActions = (currentSession: GameSession | null, user: User | null) => {
  const [actions, setActions] = useState<GameAction[]>([]);

  /* ------------- LISTEN ACTIONS --------------- */
  useEffect(() => {
    if (!currentSession || !user) return;
    const actRef = query(ref(database, `actions/${currentSession.gameId}`), limitToLast(200));
    const unsub = onValue(actRef, (snap) => {
      const data = snap.val() || {};
      setActions(Object.values(data) as GameAction[]);
    });
    return () => off(actRef);
  }, [currentSession, user]);

  /* ------------- LOG ACTION --------------- */
  const logGameAction = useCallback(async (action: string, playerName: string) => {
    if (!currentSession || !user) return;
    const actRef = ref(database, `actions/${currentSession.gameId}`);
    const newAction: GameAction = { id: Date.now(), action, playerName, timestamp: Date.now() };
    try {
      await push(actRef, newAction);
    } catch (err) {
      console.error('logGameAction error', err);
    }
  }, [currentSession, user]);

  return { actions, logGameAction } as const;
}; 