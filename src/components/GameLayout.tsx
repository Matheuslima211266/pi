
import React, { useState } from 'react';
import ResponsiveGameBoard from '@/components/ResponsiveGameBoard';
import GameSidebar from '@/components/GameSidebar';
import CardPreview from '@/components/CardPreview';

interface GameLayoutProps {
  gameData: any;
  gameState: any;
  handlers: any;
}

const GameLayout = ({ gameData, gameState, handlers }: GameLayoutProps) => {
  const [sidebarPosition, setSidebarPosition] = useState<'bottom' | 'side'>('side');

  console.log('🎮 GameLayout render:', {
    playerHandSize: gameState.playerHand?.length || 0,
    playerDeckSize: gameState.playerField?.deck?.length || 0,
    enemyDeckSize: gameState.enemyField?.deck?.length || 0,
    actionLogSize: gameState.actionLog?.length || 0
  });

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Game Board - ora include anche la mano del giocatore */}
      <div className="pl-48 pr-48 h-full flex flex-col">
        <div className="flex-1">
          <ResponsiveGameBoard
            playerField={gameState.playerField}
            enemyField={gameState.enemyField}
            playerHand={gameState.playerHand}
            enemyHandCount={gameState.enemyHandCount}
            enemyRevealedCard={gameState.enemyRevealedCard}
            enemyRevealedHand={gameState.enemyRevealedHand}
            onAttack={handlers.handleAttack}
            onCardPlace={handlers.handleCardPlace}
            selectedCardFromHand={gameState.selectedCardFromHand}
            onCardPreview={handlers.handleCardPreview}
            onCardMove={handlers.handleCardMove}
            onDrawCard={() => handlers.handleDrawCard(true)}
            onDeckMill={(count) => handlers.handleDeckMill(count, true)}
            setSelectedCardFromHand={handlers.handleHandCardSelect}
          />
        </div>
      </div>

      {/* Sidebars */}
      <GameSidebar
        enemyLifePoints={gameState.enemyLifePoints}
        playerLifePoints={gameState.playerLifePoints}
        currentPhase={gameState.currentPhase}
        isPlayerTurn={gameState.isPlayerTurn}
        timeRemaining={gameState.timeRemaining}
        chatMessages={gameState.chatMessages}
        actionLog={gameState.actionLog}
        onLifePointsChange={(amount, isEnemy) => {
          if (isEnemy) {
            handlers.handleLifePointsChange(gameState.enemyLifePoints + amount, false);
          } else {
            handlers.handleLifePointsChange(gameState.playerLifePoints + amount, true);
          }
        }}
        onPhaseChange={handlers.handlePhaseChange}
        onEndTurn={handlers.handleEndTurn}
        onTimeUp={handlers.handleTimeUp}
        onTimeChange={handlers.handleTimeChange}
        onSendMessage={handlers.handleSendMessage}
      />

      {/* Card Preview */}
      {gameState.previewCard && (
        <CardPreview
          card={gameState.previewCard}
          onClose={() => handlers.handleCardPreview(null)}
        />
      )}
    </div>
  );
};

export default GameLayout;
