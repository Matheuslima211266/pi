
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
    
    // Use player deck data if available, otherwise use sample data
    const allCards = playerDeckData?.cards || sampleCardsData.cards;
    const mainDeckCards = allCards.filter((card: any) => !card.extra_deck);
    const extraDeckCards = allCards.filter((card: any) => card.extra_deck);

    console.log('[useGameInitialization] Total cards loaded:', allCards.length);
    console.log('[useGameInitialization] Main deck cards:', mainDeckCards.length);
    console.log('[useGameInitialization] Extra deck cards:', extraDeckCards.length);

    // Create player main deck with all cards from JSON
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

    // Create enemy deck with same cards as player
    const enemyMainDeck = mainDeckCards.map((card: any, index: number) => ({
      ...card,
      id: generateUniqueCardId(card.id, 'enemy', index)
    }));
    const shuffledEnemyDeck = shuffleArray([...enemyMainDeck]);
    const enemyStartingHand = shuffledEnemyDeck.slice(0, 5);
    const enemyRemainingDeck = shuffledEnemyDeck.slice(5);

    // Add some test cards to Dead Zone for verification
    const testDeadZoneCards = shuffledHand.slice(0, 2).map((card: any) => ({
      ...card,
      id: generateUniqueCardId(card.id, 'deadzone_test', Date.now())
    }));

    console.log('[useGameInitialization] Final deck sizes:');
    console.log('[useGameInitialization] Player deck:', remainingDeck.length);
    console.log('[useGameInitialization] Enemy deck:', enemyRemainingDeck.length);
    console.log('[useGameInitialization] Player hand:', shuffledHand.length);
    console.log('[useGameInitialization] Enemy hand count:', enemyStartingHand.length);

    setPlayerDeck(remainingDeck);
    setEnemyDeck(enemyRemainingDeck);
    setPlayerHand(shuffledHand);
    setEnemyHandCount(enemyStartingHand.length);
    
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
