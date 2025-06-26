
import sampleCardsData from '@/data/sampleCards.json';
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
  const initializeGame = () => {
    console.log('[useGameInitialization] Initializing game...');
    console.log('[useGameInitialization] Player deck data:', playerDeckData);
    
    // Use player deck data if available, otherwise use sample data
    let playerCards = [];
    
    if (playerDeckData) {
      // Check if deck has the new structure (mainDeck + extraDeck)
      if (playerDeckData.mainDeck && playerDeckData.extraDeck) {
        console.log('[useGameInitialization] Using mainDeck + extraDeck structure');
        playerCards = [...playerDeckData.mainDeck, ...playerDeckData.extraDeck];
      } 
      // Check if deck has cards array
      else if (playerDeckData.cards) {
        console.log('[useGameInitialization] Using cards array structure');
        playerCards = playerDeckData.cards;
      }
      // Fallback to direct array
      else if (Array.isArray(playerDeckData)) {
        console.log('[useGameInitialization] Using direct array structure');
        playerCards = playerDeckData;
      }
    }
    
    // Fallback to sample data if no deck is loaded
    if (!playerCards || playerCards.length === 0) {
      console.log('[useGameInitialization] Using sample cards as fallback');
      playerCards = sampleCardsData.cards;
    }

    // Separate main deck and extra deck cards for player
    const playerMainDeckCards = playerCards.filter((card: any) => !card.extra_deck);
    const playerExtraDeckCards = playerCards.filter((card: any) => card.extra_deck);

    console.log('[useGameInitialization] Player deck analysis:', {
      totalPlayerCards: playerCards.length,
      playerMainDeckCards: playerMainDeckCards.length,
      playerExtraDeckCards: playerExtraDeckCards.length,
      playerDeckStructure: playerDeckData ? Object.keys(playerDeckData) : 'none'
    });

    // Create player main deck with unique IDs
    const playerMainDeck = playerMainDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, gameData?.playerName || 'player', index)
    }));
    
    const playerExtraDeck = playerExtraDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, gameData?.playerName || 'player', `extra_${index}`)
    }));

    // Create enemy deck using sample data (not player's deck)
    const enemyCards = sampleCardsData.cards;
    const enemyMainDeckCards = enemyCards.filter((card: any) => !card.extra_deck);
    const enemyExtraDeckCards = enemyCards.filter((card: any) => card.extra_deck);

    const enemyMainDeck = enemyMainDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, 'enemy', index)
    }));

    const enemyExtraDeck = enemyExtraDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, 'enemy', `extra_${index}`)
    }));

    // Shuffle and deal cards
    const shuffledPlayerDeck = shuffleArray([...playerMainDeck]);
    const playerStartingHand = shuffledPlayerDeck.slice(0, 5);
    const playerRemainingDeck = shuffledPlayerDeck.slice(5);

    const shuffledEnemyDeck = shuffleArray([...enemyMainDeck]);
    const enemyStartingHand = shuffledEnemyDeck.slice(0, 5);
    const enemyRemainingDeck = shuffledEnemyDeck.slice(5);

    // Set correct enemy hand count
    const actualEnemyHandCount = enemyStartingHand.length;

    console.log('[useGameInitialization] Final initialization:', {
      playerDeckSize: playerRemainingDeck.length,
      enemyDeckSize: enemyRemainingDeck.length,
      playerHandSize: playerStartingHand.length,
      enemyHandSize: actualEnemyHandCount,
      playerExtraDeckSize: playerExtraDeck.length,
      enemyExtraDeckSize: enemyExtraDeck.length
    });

    // Set all the state
    setPlayerDeck(playerRemainingDeck);
    setEnemyDeck(enemyRemainingDeck);
    setPlayerHand(playerStartingHand);
    setEnemyHandCount(actualEnemyHandCount);
    
    setPlayerField((prev: any) => ({ 
      ...prev, 
      extraDeck: playerExtraDeck,
      deck: playerRemainingDeck,
      deadZone: [],
      banished: [],
      banishedFaceDown: []
    }));
    
    setEnemyField((prev: any) => ({ 
      ...prev, 
      extraDeck: enemyExtraDeck,
      deck: enemyRemainingDeck,
      deadZone: [],
      banished: [],
      banishedFaceDown: []
    }));

    console.log('[useGameInitialization] Game initialized successfully');
  };

  return {
    initializeGame
  };
};
