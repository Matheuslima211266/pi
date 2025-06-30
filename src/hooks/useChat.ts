import { useState, useEffect, useCallback } from 'react';
import { ref, push, onValue, off, query, limitToLast } from 'firebase/database';
import { User } from 'firebase/auth';
import { database } from '../integrations/firebase/config';
import { GameSession } from './multiplayerTypes';

export interface ChatMessage {
  id: number;
  message: string;
  playerName: string;
  timestamp: number;
}

export const useChat = (currentSession: GameSession | null, user: User | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /* ------------- LISTEN CHAT --------------- */
  useEffect(() => {
    if (!currentSession || !user) return;
    const chatRef = query(ref(database, `chat/${currentSession.gameId}`), limitToLast(100));
    const unsub = onValue(chatRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.values(data) as ChatMessage[];
      setMessages(list);
    });
    return () => off(chatRef);
  }, [currentSession, user]);

  /* ------------- SEND CHAT --------------- */
  const sendChatMessage = useCallback(async (message: string, playerName: string) => {
    if (!currentSession || !user) return;
    const chatRef = ref(database, `chat/${currentSession.gameId}`);
    const newMsg: ChatMessage = { id: Date.now(), message, playerName, timestamp: Date.now() };
    try {
      await push(chatRef, newMsg);
    } catch (err) {
      console.error('sendChatMessage error', err);
    }
  }, [currentSession, user]);

  return { messages, sendChatMessage } as const;
}; 