
import React from 'react';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import GameLayout from '@/components/GameLayout';
import { useGameState } from '@/hooks/useGameState';
import { useMultiplayerSync } from '@/hooks/useMultiplayerSync';
import { useGameHandlers } from '@/hooks/useGameHandlers';

const Index = () => {
  const gameState = useGameState();
  const { syncGameState } = useMultiplayerSync(gameState);
  const handlers = useGameHandlers(gameState, syncGameState);

  if (!gameState.gameStarted) {
    return (
      <MultiplayerSetup 
        onGameStart={handlers.handleGameStart}
        onDeckLoad={handlers.handleDeckLoad}
      />
    );
  }

  return (
    <GameLayout
      gameData={gameState.gameData}
      gameState={gameState}
      handlers={handlers}
    />
  );
};

export default Index;
