
import { useCardHandlers } from './useCardHandlers';
import { useDeckHandlers } from './useDeckHandlers';
import { useGameFlowHandlers } from './useGameFlowHandlers';
import { useCardMoveHandlers } from './useCardMoveHandlers';
import { useMultiplayerHandlers } from './useMultiplayerHandlers';
import { useGameSetupHandlers } from './useGameSetupHandlers';
import { useBattleHandlers } from './useBattleHandlers';

export const useGameHandlers = (gameState, syncGameState) => {
  const cardHandlers = useCardHandlers(gameState, syncGameState);
  const deckHandlers = useDeckHandlers(gameState, syncGameState);
  const gameFlowHandlers = useGameFlowHandlers(gameState, syncGameState);
  const cardMoveHandlers = useCardMoveHandlers(gameState, syncGameState);
  const multiplayerHandlers = useMultiplayerHandlers(gameState, syncGameState);
  const gameSetupHandlers = useGameSetupHandlers(gameState, syncGameState);
  const battleHandlers = useBattleHandlers(gameState, syncGameState);

  return {
    ...cardHandlers,
    ...deckHandlers,
    ...gameFlowHandlers,
    ...cardMoveHandlers,
    ...multiplayerHandlers,
    ...gameSetupHandlers,
    ...battleHandlers
  };
};
