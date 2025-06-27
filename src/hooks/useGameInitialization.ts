import { useState, useCallback } from 'react';
import { shuffleArray, generateUniqueCardId } from '@/utils/gameHelpers';

export const useGameInitialization = ({
  gameData,
  playerDeckData,
  setPlayerDeck,
  setEnemyDeck,
  setPlayerHand,
  setEnemyHandCount,
  setPlayerField,
  setEnemyField
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeGame = useCallback(() => {
    if (!playerDeckData || isInitialized) {
      console.log('Game initialization skipped:', { playerDeckData: !!playerDeckData, isInitialized });
      return;
    }

    console.log('🎮 Initializing game with deck data:', playerDeckData);

    try {
      // Validazione e preparazione deck data
      let deckCards = [];
      
      if (playerDeckData.mainDeck && Array.isArray(playerDeckData.mainDeck)) {
        deckCards = [...playerDeckData.mainDeck];
      } else if (playerDeckData.cards && Array.isArray(playerDeckData.cards)) {
        deckCards = [...playerDeckData.cards];
      } else {
        console.error('❌ Invalid deck structure:', playerDeckData);
        alert('Errore: Struttura deck non valida. Assicurati di caricare un deck valido.');
        return;
      }

      if (deckCards.length === 0) {
        console.error('❌ Empty deck:', playerDeckData);
        alert('Errore: Deck vuoto. Carica un deck con carte valide.');
        return;
      }

      // Create deck with unique IDs for each player
      const playerPrefix = gameData?.isHost ? 'host' : 'guest';
      const enemyPrefix = gameData?.isHost ? 'guest' : 'host';
      
      const createDeckWithUniqueIds = (deckData, prefix) => {
        return deckData.map((card, index) => ({
          ...card,
          id: generateUniqueCardId(prefix, index, card.name || `card_${index}`)
        }));
      };

      const playerDeckWithIds = createDeckWithUniqueIds(deckCards, playerPrefix);
      const enemyDeckWithIds = createDeckWithUniqueIds(deckCards, enemyPrefix);

      // Shuffle both decks independently
      const shuffledPlayerDeck = shuffleArray([...playerDeckWithIds]);
      const shuffledEnemyDeck = shuffleArray([...enemyDeckWithIds]);

      console.log('🎲 Decks created:', {
        playerDeck: shuffledPlayerDeck.length,
        enemyDeck: shuffledEnemyDeck.length,
        playerFirstCard: shuffledPlayerDeck[0]?.id,
        enemyFirstCard: shuffledEnemyDeck[0]?.id
      });

      // Set up initial hands (draw 5 cards each)
      const initialPlayerHand = shuffledPlayerDeck.slice(0, 5);
      const remainingPlayerDeck = shuffledPlayerDeck.slice(5);
      const remainingEnemyDeck = shuffledEnemyDeck.slice(5); // Enemy draws 5 too but we don't see them

      setPlayerHand(initialPlayerHand);
      setEnemyHandCount(5);
      setPlayerDeck(remainingPlayerDeck);
      setEnemyDeck(remainingEnemyDeck);

      // Initialize player field with new zones
      setPlayerField({
        monsters: Array(5).fill(null),
        spellsTraps: Array(5).fill(null),
        fieldSpell: [],
        deck: remainingPlayerDeck,
        graveyard: [],
        deadZone: [], // New zone
        banished: [],
        banishedFaceDown: [],
        extraDeck: playerDeckData.extraDeck || [],
        magia: [], // New zone
        terreno: [] // New zone
      });

      // Initialize enemy field with new zones (keeping decks separate)
      setEnemyField({
        monsters: Array(5).fill(null),
        spellsTraps: Array(5).fill(null),
        fieldSpell: [],
        deck: remainingEnemyDeck, // Independent enemy deck
        graveyard: [],
        deadZone: [], // New zone
        banished: [],
        banishedFaceDown: [],
        extraDeck: playerDeckData.extraDeck || [],
        magia: [], // New zone
        terreno: [] // New zone
      });

      setIsInitialized(true);
      console.log('✅ Game initialization completed');

    } catch (error) {
      console.error('❌ Error initializing game:', error);
      alert('Errore durante l\'inizializzazione del gioco. Riprova.');
    }
  }, [playerDeckData, gameData, isInitialized, setPlayerDeck, setEnemyDeck, setPlayerHand, setEnemyHandCount, setPlayerField, setEnemyField]);

  return {
    initializeGame,
    isInitialized
  };
};
