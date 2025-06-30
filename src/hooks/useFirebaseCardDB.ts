import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, runTransaction, get, update } from 'firebase/database';
import { database } from '@/integrations/firebase/config';
import { useFirebaseMultiplayer } from './useFirebaseMultiplayer';

export interface CardData {
  id: string;
  name: string;
  type: string;
  atk?: number;
  def?: number;
  description?: string;
  art_link?: string;
  // ... altri campi necessari
}

export interface DeckData {
  id: string;          // slot id (es. deck1, deck2)
  name: string;        // nome visibile
  cards: string[];     // lista di cardId
  updatedBy: string;   // userId dell'ultimo che ha salvato
  updatedAt: number;   // timestamp
}

export const useFirebaseCardDB = () => {
  const [allCards, setAllCards] = useState<Record<string, CardData>>({});
  const [allDecks, setAllDecks] = useState<Record<string, DeckData>>({});
  const firebaseHook = useFirebaseMultiplayer();

  // ---- LISTEN CARDS ----
  useEffect(() => {
    const cardsRef = ref(database, 'cards');
    const unsub = onValue(cardsRef, snap => {
      const data = snap.val() || {};
      setAllCards(data);
    });
    return () => unsub();
  }, []);

  // ---- LISTEN DECKS ----
  useEffect(() => {
    const decksRef = ref(database, 'decks');
    const unsub = onValue(decksRef, snap => {
      const data = snap.val() || {};
      setAllDecks(data);
    });
    return () => unsub();
  }, []);

  // ---- ADD / UPDATE CARD ----
  const saveCard = useCallback(async (card: CardData, isHost: boolean): Promise<boolean> => {
    if (!firebaseHook.user) return false;

    const cardRef = ref(database, `cards/${card.id}`);
    return runTransaction(cardRef, (current) => {
      if (current && !isHost) {
        // Esiste già e non sei host -> rifiuta
        return current;
      }
      return card;
    }).then(res => {
      return res.committed;
    });
  }, [firebaseHook.user]);

  // ---- SAVE DECK IN SLOT ----
  const saveDeck = useCallback(async (slotId: string, deck: DeckData, isHost: boolean): Promise<boolean> => {
    if (!firebaseHook.user) return false;
    const deckRef = ref(database, `decks/${slotId}`);
    return runTransaction(deckRef, (current) => {
      if (current && !isHost) {
        return current; // non host non può sovrascrivere
      }
      return {
        ...deck,
        updatedBy: firebaseHook.user!.uid,
        updatedAt: Date.now()
      } as DeckData;
    }).then(res => res.committed);
  }, [firebaseHook.user]);

  // ---- HELPERS ----
  const getCardById = useCallback((id: string): CardData | undefined => {
    return allCards[id];
  }, [allCards]);

  const getDeckBySlot = useCallback((slotId: string): DeckData | undefined => {
    return allDecks[slotId];
  }, [allDecks]);

  return {
    allCards,
    allDecks,
    saveCard,
    saveDeck,
    getCardById,
    getDeckBySlot
  };
}; 