
import { useGameStateCore } from './useGameStateCore';
import { useCardOperations } from './useCardOperations';
import { useGameInitialization } from './useGameInitialization';
import { shuffleArray, generateUniqueCardId } from '@/utils/gameHelpers';

export const useGameState = () => {
  const coreState = useGameStateCore();
  
  const cardOperations = useCardOperations({
    playerField: coreState.playerField,
    setPlayerField: coreState.setPlayerField,
    enemyField: coreState.enemyField,
    setEnemyField: coreState.setEnemyField,
    setPlayerHand: coreState.setPlayerHand
  });

  const gameInitialization = useGameInitialization({
    gameData: coreState.gameData,
    playerDeckData: coreState.playerDeckData,
    setPlayerDeck: coreState.setPlayerDeck,
    setEnemyDeck: coreState.setEnemyDeck,
    setPlayerHand: coreState.setPlayerHand,
    setEnemyHandCount: coreState.setEnemyHandCount,
    setPlayerField: coreState.setPlayerField,
    setEnemyField: coreState.setEnemyField
  });

  return {
    // All core state
    ...coreState,
    
    // Card operations
    ...cardOperations,
    
    // Game initialization
    ...gameInitialization,
    
    // Utility functions
    shuffleArray,
    generateUniqueCardId
  };
};
