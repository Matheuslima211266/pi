
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
    let allCards = [];
    
    if (playerDeckData) {
      // Check if deck has the new structure (mainDeck + extraDeck)
      if (playerDeckData.mainDeck && playerDeckData.extraDeck) {
        console.log('[useGameInitialization] Using mainDeck + extraDeck structure');
        allCards = [...playerDeckData.mainDeck, ...playerDeckData.extraDeck];
      } 
      // Check if deck has cards array
      else if (playerDeckData.cards) {
        console.log('[useGameInitialization] Using cards array structure');
        allCards = playerDeckData.cards;
      }
      // Fallback to direct array
      else if (Array.isArray(playerDeckData)) {
        console.log('[useGameInitialization] Using direct array structure');
        allCards = playerDeckData;
      }
    }
    
    // Fallback to sample data if no deck is loaded
    if (!allCards || allCards.length === 0) {
      console.log('[useGameInitialization] Using sample cards as fallback');
      allCards = sampleCardsData.cards;
    }

    const mainDeckCards = allCards.filter((card: any) => !card.extra_deck);
    const extraDeckCards = allCards.filter((card: any) => card.extra_deck);

    console.log('[useGameInitialization] Deck analysis:', {
      totalCards: allCards.length,
      mainDeckCards: mainDeckCards.length,
      extraDeckCards: extraDeckCards.length,
      playerDeckStructure: playerDeckData ? Object.keys(playerDeckData) : 'none'
    });

    // Create player main deck with all cards from loaded deck
    const playerMainDeck = mainDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, gameData?.playerName || 'player', index)
    }));
    
    const uniqueExtraDeckCards = extraDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, gameData?.playerName || 'player', `extra_${index}`)
    }));

    const shuffledMainDeck = shuffleArray([...playerMainDeck]);
    const shuffledHand = shuffledMainDeck.slice(0, 5);
    const remainingDeck = shuffledMainDeck.slice(5);

    // Create enemy deck with same cards as player (for testing)
    const enemyMainDeck = mainDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, 'enemy', index)
    }));
    const shuffledEnemyDeck = shuffleArray([...enemyMainDeck]);
    const enemyStartingHand = shuffledEnemyDeck.slice(0, 5);
    const enemyRemainingDeck = shuffledEnemyDeck.slice(5);

    // Fix: Set enemy hand count to actual hand size
    const actualEnemyHandCount = enemyStartingHand.length;

    // Add some test cards to Dead Zone for verification
    const testDeadZoneCards = shuffledHand.slice(0, 2).map((card: any) => ({
      ...card,
      id: generateUniqueCardId(card.id, 'deadzone_test', Date.now())
    }));

    console.log('[useGameInitialization] Final initialization:', {
      playerDeckSize: remainingDeck.length,
      enemyDeckSize: enemyRemainingDeck.length,
      playerHandSize: shuffledHand.length,
      enemyHandSize: actualEnemyHandCount,
      playerExtraDeckSize: uniqueExtraDeckCards.length
    });

    setPlayerDeck(remainingDeck);
    setEnemyDeck(enemyRemainingDeck);
    setPlayerHand(shuffledHand);
    setEnemyHandCount(actualEnemyHandCount); // Fixed: use actual count
    
    setPlayerField((prev: any) => ({ 
      ...prev, 
      extraDeck: uniqueExtraDeckCards,
      deck: remainingDeck,
      deadZone: testDeadZoneCards,
      banished: [],
      banishedFaceDown: []
    }));
    
    setEnemyField((prev: any) => ({ 
      ...prev, 
      extraDeck: uniqueExtraDeckCards,
      deck: enemyRemainingDeck,
      deadZone: [testDeadZoneCards[0]],
      banished: [],
      banishedFaceDown: []
    }));

    console.log('[useGameInitialization] Game initialized successfully');
  };

  return {
    initializeGame
  };
};
