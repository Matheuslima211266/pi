
import React from 'react';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import ChatBox from '@/components/ChatBox';
import ActionHistory from '@/components/ActionHistory';
import TurnTimer from '@/components/TurnTimer';

interface GameSidebarProps {
  enemyLifePoints: number;
  playerLifePoints: number;
  currentPhase: string;
  isPlayerTurn: boolean;
  timeRemaining: number;
  chatMessages: Array<{
    id: number;
    player: string;
    message: string;
    timestamp: string;
  }>;
  actionLog: Array<{
    id: number | string;
    player: string;
    action: string;
    timestamp: string;
  }>;
  onLifePointsChange: (amount: number, isEnemy: boolean) => void;
  onPhaseChange: (phase: string) => void;
  onEndTurn: () => void;
  onTimeUp: () => void;
  onTimeChange: (time: number | ((prev: number) => number)) => void;
  onSendMessage: (message: string) => void;
}

const GameSidebar = ({
  enemyLifePoints,
  playerLifePoints,
  currentPhase,
  isPlayerTurn,
  timeRemaining,
  chatMessages,
  actionLog,
  onLifePointsChange,
  onPhaseChange,
  onEndTurn,
  onTimeUp,
  onTimeChange,
  onSendMessage
}: GameSidebarProps) => {
  return (
    <>
      {/* LEFT SIDEBAR - Enemy Life Points + Game Control */}
      <div className="fixed left-0 top-0 h-full w-48 bg-slate-900/95 border-r border-slate-600 z-30 flex flex-col p-2 gap-2">
        {/* Enemy Life Points */}
        <LifePointsControl
          playerName="Avversario"
          lifePoints={enemyLifePoints}
          onLifePointsChange={(amount) => onLifePointsChange(amount, true)}
          color="red"
          isCompact={true}
        />
        
        {/* Game Phases */}
        <div className="bg-slate-800/95 p-2 rounded border border-slate-600">
          <GamePhases
            currentPhase={currentPhase}
            onPhaseChange={onPhaseChange}
            onEndTurn={onEndTurn}
            isPlayerTurn={isPlayerTurn}
          />
        </div>
        
        {/* Timer */}
        <div className="bg-slate-800/95 p-2 rounded border border-slate-600">
          <TurnTimer
            isActive={isPlayerTurn}
            onTimeUp={onTimeUp}
            timeRemaining={timeRemaining}
            onTimeChange={onTimeChange}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR - Player Life Points + Chat + Action History (repositioned closer) */}
      <div className="fixed right-0 top-0 h-full w-48 bg-slate-900/95 border-l border-slate-600 z-30 flex flex-col p-2 gap-2">
        {/* Player Life Points */}
        <LifePointsControl
          playerName="Giocatore"
          lifePoints={playerLifePoints}
          onLifePointsChange={(amount) => onLifePointsChange(amount, false)}
          color="blue"
          isCompact={true}
        />
        
        {/* Chat - Takes more space */}
        <div className="flex-1 bg-slate-800/95 p-2 rounded border border-slate-600 max-h-64">
          <ChatBox
            messages={chatMessages}
            onSendMessage={onSendMessage}
          />
        </div>
        
        {/* Action History - Positioned immediately below chat with minimal gap */}
        <div className="mt-1">
          <ActionHistory actions={actionLog} />
        </div>
      </div>
    </>
  );
};

export default GameSidebar;
