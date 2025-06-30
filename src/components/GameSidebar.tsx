import React from 'react';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import ChatBox from '@/components/ChatBox';
import ActionHistory from '@/components/ActionHistory';
import TurnTimer from '@/components/TurnTimer';

interface GameSidebarProps {
  type: 'left' | 'right';
  enemyLifePoints?: number;
  playerLifePoints?: number;
  currentPhase?: string;
  isPlayerTurn?: boolean;
  timeRemaining?: number;
  chatMessages?: Array<{
    id: number;
    player: string;
    message: string;
    timestamp: string;
  }>;
  actionLog?: Array<{
    id: number | string;
    player: string;
    action: string;
    timestamp: string;
  }>;
  onLifePointsChange?: (amount: number) => void;
  onPhaseChange?: (phase: string) => void;
  onEndTurn?: () => void;
  onTimeUp?: () => void;
  onTimeChange?: (time: number | ((prev: number) => number)) => void;
  onSendMessage?: (message: string) => void;
}

const GameSidebar = ({
  type,
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
  if (type === 'left') {
    return (
      <div className="h-full w-48 bg-background/95 border-r border-border z-30 flex flex-col p-1 gap-2 mr-0.5">
        {/* Enemy Life Points */}
        <LifePointsControl
          playerName="Opponent"
          lifePoints={enemyLifePoints ?? 0}
          onLifePointsChange={onLifePointsChange ?? (() => {})}
          isPlayer={false}
          isCompact={true}
        />
        {/* Game Phases */}
        <div className="bg-card/95 p-2 rounded border border-border">
          <GamePhases
            currentPhase={currentPhase ?? ''}
            onPhaseChange={onPhaseChange ?? (() => {})}
            onEndTurn={onEndTurn ?? (() => {})}
            isPlayerTurn={isPlayerTurn ?? false}
            direction="vertical"
          />
        </div>
      </div>
    );
  }
  if (type === 'right') {
    return (
      <div className="h-full w-48 bg-background/95 border-l border-border z-30 flex flex-col p-2 gap-2 ml-0.5">
        {/* Player Life Points */}
        <LifePointsControl
          playerName="Player"
          lifePoints={playerLifePoints ?? 0}
          onLifePointsChange={onLifePointsChange ?? (() => {})}
          isPlayer={true}
          isCompact={true}
        />
        {/* Chat + Action History */}
        <div className="flex-1 bg-card/95 p-2 rounded border border-border flex flex-col gap-2">
          <ChatBox
            messages={chatMessages ?? []}
            onSendMessage={onSendMessage ?? (() => {})}
          />
          <ActionHistory actions={actionLog ?? []} />
        </div>
      </div>
    );
  }
  return null;
};

export default GameSidebar;
