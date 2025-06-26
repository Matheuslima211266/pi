
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
    <div className="w-full space-y-1">
      {/* Enemy Life Points - Ultra compressed */}
      <LifePointsControl 
        playerName="Avversario"
        lifePoints={enemyLifePoints}
        onLifePointsChange={(amount) => onLifePointsChange(amount, true)}
        color="red"
      />
      
      {/* Game Phases - Ultra compressed */}
      <GamePhases 
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        onEndTurn={onEndTurn}
        isPlayerTurn={isPlayerTurn}
      />
      
      {/* Player Life Points - Ultra compressed */}
      <LifePointsControl 
        playerName="Giocatore"
        lifePoints={playerLifePoints}
        onLifePointsChange={(amount) => onLifePointsChange(amount, false)}
        color="blue"
      />
      
      {/* Timer - Ultra compressed */}
      <TurnTimer 
        isActive={isPlayerTurn}
        onTimeUp={onTimeUp}
        timeRemaining={timeRemaining}
        onTimeChange={onTimeChange}
      />
      
      {/* Chat - Ultra compressed */}
      <ChatBox 
        messages={chatMessages}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default GameSidebar;
