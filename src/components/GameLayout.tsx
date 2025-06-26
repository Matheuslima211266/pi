
import React from 'react';
import ResponsiveGameBoard from '@/components/ResponsiveGameBoard';
import ActionLog from '@/components/ActionLog';
import DiceAndCoin from '@/components/DiceAndCoin';
import CardPreview from '@/components/CardPreview';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import ChatBox from '@/components/ChatBox';
import TurnTimer from '@/components/TurnTimer';

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
    setSelectedCardFromHand,
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
      
      {/* Sidebar completa con tutti i controlli */}
      <div className="sidebar">
        {/* Enemy Life Points */}
        <div className="sidebar-section">
          <LifePointsControl 
            playerName="Avversario"
            lifePoints={enemyLifePoints}
            onLifePointsChange={(amount) => handleLifePointsChange(amount, true)}
            color="red"
          />
        </div>
        
        {/* Game Phases */}
        <div className="sidebar-section">
          <GamePhases 
            currentPhase={currentPhase}
            onPhaseChange={handlePhaseChange}
            onEndTurn={handleEndTurn}
            isPlayerTurn={isPlayerTurn}
          />
        </div>
        
        {/* Player Life Points */}
        <div className="sidebar-section">
          <LifePointsControl 
            playerName="Giocatore"
            lifePoints={playerLifePoints}
            onLifePointsChange={(amount) => handleLifePointsChange(amount, false)}
            color="blue"
          />
        </div>
        
        {/* Timer */}
        <div className="sidebar-section">
          <TurnTimer 
            isActive={isPlayerTurn}
            onTimeUp={handleTimeUp}
            timeRemaining={timeRemaining}
            onTimeChange={setTimeRemaining}
          />
        </div>
        
        {/* Action Log */}
        <div className="sidebar-section flex-1">
          <ActionLog actions={actionLog} />
        </div>
        
        {/* Dice and Coin */}
        <div className="sidebar-section">
          <DiceAndCoin 
            onDiceRoll={handleDiceRoll}
            onCoinFlip={handleCoinFlip}
          />
        </div>
        
        {/* Chat */}
        <div className="sidebar-section">
          <ChatBox 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
      
      {/* Area principale del campo */}
      <div className="field-area">
        {/* Campo da gioco principale con nuovo layout */}
        <ResponsiveGameBoard 
          playerField={playerField}
          enemyField={enemyField}
          playerHand={playerHand}
          enemyHandCount={enemyHandCount}
          enemyRevealedCard={enemyRevealedCard}
          enemyRevealedHand={enemyRevealedHand}
          onAttack={handleAttack}
          onCardPlace={handleCardPlace}
          selectedCardFromHand={selectedCardFromHand}
          onCardPreview={setPreviewCard}
          onCardMove={handleCardMove}
          onDrawCard={handleDrawCard}
          setSelectedCardFromHand={setSelectedCardFromHand}
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
  );
};

export default GameLayout;
