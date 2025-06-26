
import React from 'react';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import ChatBox from '@/components/ChatBox';
import TurnTimer from '@/components/TurnTimer';

const GameSidebar = ({
  enemyLifePoints,
  playerLifePoints,
  currentPhase,
  isPlayerTurn,
  timeRemaining,
  chatMessages,
  onLifePointsChange,
  onPhaseChange,
  onEndTurn,
  onTimeUp,
  onTimeChange,
  onSendMessage
}) => {
  return (
    <div className="w-full space-y-1 bg-slate-900/95 p-2 rounded-lg border border-slate-700">
      {/* Enemy Life Points - Ultra compressed */}
      <div className="bg-slate-800/95 p-1 rounded border border-slate-600">
        <LifePointsControl 
          playerName="Avversario"
          lifePoints={enemyLifePoints}
          onLifePointsChange={(amount) => onLifePointsChange(amount, true)}
          color="red"
        />
      </div>
      
      {/* Game Phases - Ultra compressed */}
      <div className="bg-slate-800/95 p-1 rounded border border-slate-600">
        <GamePhases 
          currentPhase={currentPhase}
          onPhaseChange={onPhaseChange}
          onEndTurn={onEndTurn}
          isPlayerTurn={isPlayerTurn}
        />
      </div>
      
      {/* Player Life Points - Ultra compressed */}
      <div className="bg-slate-800/95 p-1 rounded border border-slate-600">
        <LifePointsControl 
          playerName="Giocatore"
          lifePoints={playerLifePoints}
          onLifePointsChange={(amount) => onLifePointsChange(amount, false)}
          color="blue"
        />
      </div>
      
      {/* Timer - Ultra compressed */}
      <div className="bg-slate-800/95 p-1 rounded border border-slate-600">
        <TurnTimer 
          isActive={isPlayerTurn}
          onTimeUp={onTimeUp}
          timeRemaining={timeRemaining}
          onTimeChange={onTimeChange}
        />
      </div>
      
      {/* Chat - Ultra compressed */}
      <div className="bg-slate-800/95 p-1 rounded border border-slate-600">
        <ChatBox 
          messages={chatMessages}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};

export default GameSidebar;
