
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Game ID Display */}
      {gameData?.gameId && (
        <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 z-10">
          <div className="inline-flex items-center gap-1 bg-gold-600 text-black px-1.5 py-0.5 rounded text-xs font-semibold">
            <span>Game ID: {gameData.gameId}</span>
            {gameData.isHost && <span className="text-xs">(Host)</span>}
          </div>
        </div>
      )}
      
      {/* Main Layout Grid - No gaps */}
      <div className="h-full grid grid-cols-12">
        {/* Left Side - Main Game Area */}
        <div className="col-span-9 flex flex-col h-full">
          {/* Enemy Hand - Ultra compact */}
          <div className="h-8">
            <EnemyHand 
              handCount={enemyHandCount}
              revealedCard={enemyRevealedCard}
              revealedHand={enemyRevealedHand}
            />
          </div>
          
          {/* Game Board - Maximum space */}
          <div className="flex-1">
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
          </div>
          
          {/* Player Hand - Ultra compact */}
          <div className="h-12">
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
        
        {/* Right Side - Sidebar and Controls - No spacing */}
        <div className="col-span-3 flex flex-col h-full">
          {/* Game Controls */}
          <div className="flex-shrink-0">
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
          
          {/* Action Log and Dice/Coin - No spacing */}
          <div className="flex-1 grid grid-rows-2">
            <ActionLog actions={actionLog} />
            <DiceAndCoin 
              onDiceRoll={handleDiceRoll}
              onCoinFlip={handleCoinFlip}
            />
          </div>
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
