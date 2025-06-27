
import React, { useState } from 'react';
import { Swords, RotateCcw } from 'lucide-react';
import ResponsiveGameBoard from './ResponsiveGameBoard';
import PlayerHand from './PlayerHand';
import EnemyHand from './EnemyHand';
import MobileSidebar from './MobileSidebar';

interface GameLayoutProps {
  gameData: any;
  gameState: any;
  handlers: any;
}

const GameLayout = ({ gameData, gameState, handlers }: GameLayoutProps) => {
  const [sidebarPosition, setSidebarPosition] = useState<'center' | 'side'>('center');
  
  console.log('[GAMELAYOUT] Rendering with state:', {
    playerField: gameState.playerField,
    enemyField: gameState.enemyField,
    playerHand: gameState.playerHand?.length,
    enemyHandCount: gameState.enemyHandCount
  });

  const toggleSidebarPosition = () => {
    setSidebarPosition(prev => prev === 'center' ? 'side' : 'center');
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden relative">
      {/* Toggle button for sidebar position */}
      <button
        onClick={toggleSidebarPosition}
        className="absolute top-4 right-4 z-50 bg-blue-600/80 hover:bg-blue-700/80 text-white p-2 rounded-lg backdrop-blur-sm"
      >
        <RotateCcw size={20} />
      </button>

      {/* Game content */}
      <div className="h-full w-full flex flex-col">
        {/* Enemy hand at top */}
        <div className="h-20 flex items-center justify-center bg-black/20 border-b border-blue-500/30">
          <EnemyHand 
            handCount={gameState.enemyHandCount} 
            revealedCard={gameState.enemyRevealedCard}
            revealedHand={gameState.enemyRevealedHand}
          />
        </div>

        {/* Main game area */}
        <div className="flex-1 relative">
          {/* Game board container */}
          <div className={`h-full ${sidebarPosition === 'side' ? 'pr-80' : ''} transition-all duration-300`}>
            <ResponsiveGameBoard
              playerField={gameState.playerField}
              enemyField={gameState.enemyField}
              playerHand={gameState.playerHand}
              enemyHandCount={gameState.enemyHandCount}
              enemyRevealedCard={gameState.enemyRevealedCard}
              enemyRevealedHand={gameState.enemyRevealedHand}
              onAttack={handlers.handleAttack}
              onCardPlace={handlers.handleCardPlace}
              onCardMove={handlers.handleCardMove}
              onCardPreview={handlers.handleCardPreview}
              onDrawCard={handlers.handleDrawCard}
              selectedCardFromHand={gameState.selectedCardFromHand}
              setSelectedCardFromHand={gameState.setSelectedCardFromHand}
            />
          </div>

          {/* Central sidebar (between fields) - only show when position is center */}
          {sidebarPosition === 'center' && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-72 max-w-[90vw]">
                <MobileSidebar 
                  gameState={gameState} 
                  handlers={handlers} 
                  position="center"
                />
              </div>
            </div>
          )}

          {/* Side sidebar - only show when position is side */}
          {sidebarPosition === 'side' && (
            <div className="absolute top-0 right-0 h-full w-80 z-30">
              <MobileSidebar 
                gameState={gameState} 
                handlers={handlers} 
                position="side"
              />
            </div>
          )}
        </div>

        {/* Player hand at bottom */}
        <div className="h-32 bg-black/20 border-t border-blue-500/30 p-2">
          <PlayerHand
            cards={gameState.playerHand}
            onPlayCard={handlers.handleCardPlace}
            isPlayerTurn={gameState.isPlayerTurn}
            onCardPreview={handlers.handleCardPreview}
            onCardMove={handlers.handleCardMove}
            onShowCard={handlers.handleShowCard}
            onShowHand={handlers.handleShowHand}
          />
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
