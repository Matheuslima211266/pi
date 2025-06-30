import React from 'react';
import GamePhases from '@/components/GamePhases';

interface PlayerToolsPanelProps {
  currentPhase: string;
  onPhaseChange: (phase: string) => void;
  onEndTurn: () => void;
  isPlayerTurn: boolean;
  onCreateToken: (token: { name: string; atk: number; def: number }) => void;
}

const PlayerToolsPanel: React.FC<PlayerToolsPanelProps> = ({
  currentPhase,
  onPhaseChange,
  onEndTurn,
  isPlayerTurn,
  onCreateToken
}) => {
  return (
    <div className="bg-slate-800/90 rounded-lg p-1 border-2 border-pink-400 flex flex-col gap-2 w-64 min-w-[180px] max-w-[220px] max-h-[120px] overflow-y-auto">
      <GamePhases
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        onEndTurn={onEndTurn}
        isPlayerTurn={isPlayerTurn}
        direction="vertical"
        onCreateToken={onCreateToken}
      />
    </div>
  );
};

export default PlayerToolsPanel; 