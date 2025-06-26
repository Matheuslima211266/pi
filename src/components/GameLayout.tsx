import React from 'react';
import PositionedGameBoard from '@/components/PositionedGameBoard';
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
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
          <div className="inline-flex items-center gap-2 bg-gold-600 text-black px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
            <span>Game ID: {gameData.gameId}</span>
            {gameData.isHost && <span className="text-xs">(Host)</span>}
          </div>
        </div>
      )}
      
      {/* Layout principale ottimizzato per 16:9 */}
      <div className="h-full grid grid-cols-12 grid-rows-12">
        {/* Enemy Hand - Riga superiore */}
        <div className="col-span-9 row-span-1 flex items-center">
          <EnemyHand 
            handCount={enemyHandCount}
            revealedCard={enemyRevealedCard}
            revealedHand={enemyRevealedHand}
          />
        </div>
        
        {/* Game Board - Area principale centrale */}
        <div className="col-span-9 row-span-10">
          <PositionedGameBoard 
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
        
        {/* Player Hand - Riga inferiore */}
        <div className="col-span-9 row-span-1 flex items-center">
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
        
        {/* Sidebar - Colonna destra completa */}
        <div className="col-span-3 row-span-12 flex flex-col">
          {/* Game Controls */}
          <div className="flex-shrink-0 p-2">
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
          
          {/* Action Log and Dice/Coin */}
          <div className="flex-1 grid grid-rows-2 p-2 gap-2">
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
