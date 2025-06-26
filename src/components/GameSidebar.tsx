
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
    <div className="w-full space-y-2">
      {/* Enemy Life Points - Compressed */}
      <LifePointsControl 
        playerName="Avversario"
        lifePoints={enemyLifePoints}
        onLifePointsChange={(amount) => onLifePointsChange(amount, true)}
        color="red"
      />
      
      {/* Game Phases - Center - Compressed */}
      <GamePhases 
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        onEndTurn={onEndTurn}
        isPlayerTurn={isPlayerTurn}
      />
      
      {/* Player Life Points - Compressed */}
      <LifePointsControl 
        playerName="Giocatore"
        lifePoints={playerLifePoints}
        onLifePointsChange={(amount) => onLifePointsChange(amount, false)}
        color="blue"
      />
      
      {/* Timer - Compressed */}
      <TurnTimer 
        isActive={isPlayerTurn}
        onTimeUp={onTimeUp}
        timeRemaining={timeRemaining}
        onTimeChange={onTimeChange}
      />
      
      {/* Chat - Compressed */}
      <ChatBox 
        messages={chatMessages}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default GameSidebar;
