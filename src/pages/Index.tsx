
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import AuthComponent from '@/components/AuthComponent';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import GameLayout from '@/components/GameLayout';
import { useGameState } from '@/hooks/useGameState';
import { useSupabaseMultiplayer } from '@/hooks/useSupabaseMultiplayer';
import { useGameHandlers } from '@/hooks/useGameHandlers';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const gameState = useGameState();
  const multiplayerHook = useSupabaseMultiplayer(user!, gameState);
  const handlers = useGameHandlers(gameState, multiplayerHook.syncGameState);

  // Enhanced handlers that also log to database
  const enhancedHandlers = {
    ...handlers,
    handleSendMessage: (message: string) => {
      multiplayerHook.sendChatMessage(message, gameState.gameData?.playerName || 'Player');
      handlers.handleSendMessage(message);
    },
    handleCardPlace: (card: any, zoneName: string, slotIndex: number, isFaceDown?: boolean, position?: string) => {
      handlers.handleCardPlace(card, zoneName, slotIndex, isFaceDown, position);
      multiplayerHook.logGameAction(`placed ${card.name} in ${zoneName}`, gameState.gameData?.playerName || 'Player');
    },
    handleEndTurn: () => {
      handlers.handleEndTurn();
      multiplayerHook.logGameAction('ended turn', gameState.gameData?.playerName || 'Player');
    },
    handlePlayerReady: () => {
      handlers.handlePlayerReady();
      setTimeout(() => multiplayerHook.syncGameState(), 100);
    }
  };

  // Enhanced game start handler
  const handleGameStart = async (gameData: any) => {
    let session = null;
    
    if (gameData.isHost) {
      session = await multiplayerHook.createGameSession(gameData.gameId, gameData.playerName);
    } else {
      session = await multiplayerHook.joinGameSession(gameData.gameId, gameData.playerName);
    }
    
    if (session) {
      handlers.handleGameStart(gameData);
    }
  };

  if (!user) {
    return <AuthComponent onAuth={setUser} />;
  }

  // Se il gioco non è ancora iniziato o non tutti i giocatori sono pronti
  if (!gameState.gameStarted || !gameState.bothPlayersReady) {
    return (
      <MultiplayerSetup 
        onGameStart={handleGameStart}
        onDeckLoad={handlers.handleDeckLoad}
        onPlayerReady={enhancedHandlers.handlePlayerReady}
        gameState={{
          ...gameState,
          opponentReady: multiplayerHook.opponentReady
        }}
      />
    );
  }

  return (
    <GameLayout
      gameData={gameState.gameData}
      gameState={gameState}
      handlers={enhancedHandlers}
    />
  );
};

export default Index;
