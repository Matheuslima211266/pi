import React, { useState } from 'react';
import ResponsiveGameBoard from '@/components/ResponsiveGameBoard';
import ActionLog from '@/components/ActionLog';
import DiceAndCoin from '@/components/DiceAndCoin';
import CardPreview from '@/components/CardPreview';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import ChatBox from '@/components/ChatBox';
import TurnTimer from '@/components/TurnTimer';
import MobileSidebar from '@/components/MobileSidebar';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { RotateCcw } from 'lucide-react';

const GameLayout = ({
  gameData,
  gameState,
  handlers
}) => {
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const [sidebarPosition, setSidebarPosition] = useState('bottom'); // 'bottom' or 'side'

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
    handleDeckMill,
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

  if (isSmallMobile) {
    return (
      <div className={`game-container ${sidebarPosition === 'side' ? 'sidebar-side' : ''}`}>
        {/* Game ID Display */}
        <div className="game-header">
          {gameData?.gameId && (
            <div className="game-id">
              Game ID: {gameData.gameId}
              {gameData.isHost && <span className="ml-2 text-xs">(Host)</span>}
            </div>
          )}
          
          {/* Sidebar Position Toggle */}
          <button
            onClick={() => setSidebarPosition(prev => prev === 'bottom' ? 'side' : 'bottom')}
            className="fixed top-4 right-4 z-60 bg-slate-800/90 border border-slate-600 rounded p-2 text-white hover:bg-slate-700/90 transition-colors"
            title={`Switch to ${sidebarPosition === 'bottom' ? 'side' : 'bottom'} sidebar`}
          >
            <RotateCcw size={16} />
          </button>
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar
          enemyLifePoints={enemyLifePoints}
          playerLifePoints={playerLifePoints}
          currentPhase={currentPhase}
          isPlayerTurn={isPlayerTurn}
          timeRemaining={timeRemaining}
          onLifePointsChange={handleLifePointsChange}
          onPhaseChange={handlePhaseChange}
          onEndTurn={handleEndTurn}
          onTimeUp={handleTimeUp}
          onTimeChange={setTimeRemaining}
          sidebarPosition={sidebarPosition}
        />
        
        {/* Area principale del campo */}
        <div className="field-area">
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
            onDeckMill={handleDeckMill}
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
  }

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
          onDeckMill={handleDeckMill}
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
