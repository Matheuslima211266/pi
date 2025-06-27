
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface PhaseControlsProps {
  currentPhase: string;
  isPlayerTurn: boolean;
  onPhaseChange: (phase: string) => void;
  onEndTurn: () => void;
}

const phases = [
  { id: 'draw', name: 'Draw', color: 'bg-green-600' },
  { id: 'standby', name: 'Standby', color: 'bg-yellow-600' },
  { id: 'main1', name: 'Main 1', color: 'bg-blue-600' },
  { id: 'battle', name: 'Battle', color: 'bg-red-600' },
  { id: 'main2', name: 'Main 2', color: 'bg-purple-600' },
  { id: 'end', name: 'End', color: 'bg-gray-600' }
];

const PhaseControls = ({ 
  currentPhase, 
  isPlayerTurn, 
  onPhaseChange, 
  onEndTurn 
}: PhaseControlsProps) => {
  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  
  const nextPhase = () => {
    const nextIndex = (currentPhaseIndex + 1) % phases.length;
    if (nextIndex === 0) {
      onEndTurn();
    } else {
      onPhaseChange(phases[nextIndex].id);
    }
  };

  return (
    <Card className="sidebar-section bg-slate-800/70 border-slate-600 p-3">
      <h3 className="text-white text-sm font-semibold text-center mb-3">Phase</h3>
      
      {/* Phase indicators */}
      <div className="flex flex-col gap-1 mb-3">
        {phases.map((phase) => (
          <Badge
            key={phase.id}
            className={`text-xs py-1 px-2 cursor-pointer transition-all
              ${currentPhase === phase.id 
                ? `${phase.color} text-white animate-pulse` 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            onClick={() => isPlayerTurn && onPhaseChange(phase.id)}
          >
            {phase.name}
          </Badge>
        ))}
      </div>

      {/* Current phase display */}
      <div className="text-center mb-3">
        <div className="text-gold-400 text-sm font-bold">
          {phases[currentPhaseIndex]?.name} Phase
        </div>
        {!isPlayerTurn && (
          <div className="text-xs text-gray-400 mt-1">
            Opponent's Turn
          </div>
        )}
      </div>

      {/* Phase control buttons */}
      {isPlayerTurn && (
        <div className="flex flex-col gap-1">
          <Button
            onClick={nextPhase}
            size="sm"
            className="bg-gold-600 hover:bg-gold-700 text-black text-xs h-7"
          >
            <ChevronRight size={12} />
            Next Phase
          </Button>
          <Button
            onClick={onEndTurn}
            size="sm"
            variant="outline"
            className="border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black text-xs h-7"
          >
            <RotateCcw size={12} />
            End Turn
          </Button>
        </div>
      )}
    </Card>
  );
};

export default PhaseControls;
