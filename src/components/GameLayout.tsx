
import React from 'react';
import ResponsiveGameBoard from '@/components/ResponsiveGameBoard';
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
    <div className="game-container">
      {/* Game ID Display */}
      {gameData?.gameId && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
          <div className="inline-flex items-center gap-2 bg-gold-600 text-black px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
            <span>Game ID: {gameData.gameId}</span>
            {gameData.isHost && <span className="text-xs">(Host)</span>}
          </div>
        </div>
      )}
      
      {/* Sidebar con Life Points e Controlli */}
      <div className="sidebar">
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
        
        {/* Action Log e Dice/Coin nella sidebar */}
        <div className="flex-1 flex flex-col gap-4 mt-4">
          <ActionLog actions={actionLog} />
          <DiceAndCoin 
            onDiceRoll={handleDiceRoll}
            onCoinFlip={handleCoinFlip}
          />
        </div>
      </div>
      
      {/* Area principale del campo */}
      <div className="field-area">
        {/* Enemy Hand - Parte superiore */}
        <div className="h-20 flex items-center justify-center mb-2">
          <EnemyHand 
            handCount={enemyHandCount}
            revealedCard={enemyRevealedCard}
            revealedHand={enemyRevealedHand}
          />
        </div>
        
        {/* Campo da gioco principale */}
        <div className="battlefield-container">
          <ResponsiveGameBoard 
            playerField={playerField}
            enemyField={enemyField}
            onAttack={handleAttack}
            onCardPlace={handleCardPlace}
            selectedCardFromHand={selectedCardFromHand}
            onCardPreview={setPreviewCard}
            onCardMove={handleCardMove}
            onDrawCard={handleDrawCard}
          />
        </div>
        
        {/* Player Hand - Parte inferiore */}
        <div className="h-24 flex items-center justify-center mt-2">
          <PlayerHand 
            cards={playerHand}
            onPlayCard={gameState.setSelectedCardFromHand}
            isPlayerTurn={true}
            onCardPreview={setPreviewCard}
            onCardMove={handleCardMove}
            onShowCard={handleShowCard}
            onShowHand={handleShowHand}
          />
        </div>
      </div>
      
      {/* Card Preview Modal */}
      {previewCard && (
        <CardPreview 
          card={previewCard}
          onClose={() => setPreviewCard(null)}
        />
      )}
    </div>
  );
};

export default GameLayout;
