
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
      <div className="game-header">
        {gameData?.gameId && (
          <div className="game-id">
            Game ID: {gameData.gameId}
            {gameData.isHost && <span className="ml-2 text-xs">(Host)</span>}
          </div>
        )}
      </div>
      
      {/* Sidebar con Life Points e Controlli */}
      <div className="sidebar">
        <div className="life-points-section">
          <div className="player-info">
            <div className="player-name">Avversario</div>
            <div className="life-points">{enemyLifePoints}</div>
          </div>
        </div>
        
        <div className="life-points-section">
          <div className="player-info">
            <div className="player-name">Tu</div>
            <div className="life-points">{playerLifePoints}</div>
          </div>
        </div>
        
        <div className="game-info">
          <div><strong>Turno:</strong> {isPlayerTurn ? 'Tuo' : 'Avversario'}</div>
          <div><strong>Fase:</strong> {currentPhase}</div>
          <div><strong>Tempo:</strong> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
        </div>
        
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
