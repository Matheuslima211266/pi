
import React from 'react';
import GameBoard from '@/components/GameBoard';
import PlayerHand from '@/components/PlayerHand';
import EnemyHand from '@/components/EnemyHand';
import ActionLog from '@/components/ActionLog';
import DiceAndCoin from '@/components/DiceAndCoin';
import GameSidebar from '@/components/GameSidebar';
import CardPreview from '@/components/CardPreview';

const GameLayout = ({
  gameData,
  gameState,
  handlers
}) => {
  const {
    playerField,
    enemyField,
    playerHand,
    enemyHandCount,
    enemyRevealedCard,
    enemyRevealedHand,
    selectedCardFromHand,
    previewCard,
    actionLog,
    playerLifePoints,
    enemyLifePoints,
    currentPhase,
    isPlayerTurn,
    timeRemaining,
    chatMessages,
    setPreviewCard,
    setTimeRemaining
  } = gameState;

  const {
    handleAttack,
    handleCardPlace,
    handleCardMove,
    handleDrawCard,
    handleCardClick,
    handleLifePointsChange,
    handlePhaseChange,
    handleEndTurn,
    handleTimeUp,
    handleSendMessage,
    handleDiceRoll,
    handleCoinFlip,
    handleShowCard,
    handleShowHand
  } = handlers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto p-4">
        {/* Game ID Display */}
        {gameData?.gameId && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gold-600 text-black px-4 py-2 rounded-lg font-semibold">
              <span>Game ID: {gameData.gameId}</span>
              {gameData.isHost && <span className="text-xs">(Host)</span>}
            </div>
          </div>
        )}
        
        <div className="flex gap-4">
          {/* Main game area - Left side */}
          <div className="flex-1 space-y-4">
            {/* Enemy Hand */}
            <EnemyHand 
              handCount={enemyHandCount}
              revealedCard={enemyRevealedCard}
              revealedHand={enemyRevealedHand}
            />
            
            {/* Game Board */}
            <GameBoard 
              playerField={playerField}
              enemyField={enemyField}
              onAttack={handleAttack}
              onCardPlace={handleCardPlace}
              selectedCardFromHand={selectedCardFromHand}
              onCardPreview={setPreviewCard}
              onCardMove={handleCardMove}
              onDrawCard={handleDrawCard}
            />
            
            {/* Player Hand */}
            <PlayerHand 
              cards={playerHand}
              onPlayCard={gameState.setSelectedCardFromHand}
              isPlayerTurn={true}
              onCardPreview={setPreviewCard}
              onCardMove={handleCardMove}
              onShowCard={handleShowCard}
              onShowHand={handleShowHand}
            />
            
            {/* Bottom Controls */}
            <div className="grid grid-cols-2 gap-4">
              <ActionLog actions={actionLog} />
              <DiceAndCoin 
                onDiceRoll={handleDiceRoll}
                onCoinFlip={handleCoinFlip}
              />
            </div>
          </div>
          
          {/* Right Sidebar - Tools */}
          <GameSidebar
            enemyLifePoints={enemyLifePoints}
            playerLifePoints={playerLifePoints}
            currentPhase={currentPhase}
            isPlayerTurn={isPlayerTurn}
            timeRemaining={timeRemaining}
            chatMessages={chatMessages}
            onLifePointsChange={handleLifePointsChange}
            onPhaseChange={handlePhaseChange}
            onEndTurn={handleEndTurn}
            onTimeUp={handleTimeUp}
            onTimeChange={setTimeRemaining}
            onSendMessage={handleSendMessage}
          />
        </div>
        
        {/* Card Preview Modal */}
        {previewCard && (
          <CardPreview 
            card={previewCard}
            onClose={() => setPreviewCard(null)}
          />
        )}
      </div>
    </div>
  );
};

export default GameLayout;
