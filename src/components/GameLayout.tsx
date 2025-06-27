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
import GameSidebar from '@/components/GameSidebar';
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

  // Debug logging
  console.log('🎮 GameLayout render:', {
    isMobile,
    isSmallMobile,
    sidebarPosition,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0
  });

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
        </div>
        
        {/* Mobile Sidebar with position switching */}
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
          onSidebarPositionChange={setSidebarPosition}
        />
        
        {/* Main game area */}
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

  // Mobile layout (tablets/large phones)
  if (isMobile) {
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
        
        {/* Mobile Sidebar with position switching */}
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
          onSidebarPositionChange={setSidebarPosition}
        />
        
        {/* Main game area */}
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

  // Desktop layout - Use GameSidebar (dual sidebar layout)
  return (
    <div className="desktop-game-container">
      {/* Game ID Display */}
      <div className="game-header-desktop">
        {gameData?.gameId && (
          <div className="game-id-desktop">
            Game ID: {gameData.gameId}
            {gameData.isHost && <span className="ml-2 text-xs">(Host)</span>}
          </div>
        )}
      </div>

      {/* Desktop Dual Sidebars */}
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
      
      {/* MAIN GAME AREA - With margins for sidebars */}
      <div className="main-game-area-desktop">
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
