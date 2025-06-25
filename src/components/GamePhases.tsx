
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, RotateCcw } from 'lucide-react';

interface GamePhasesProps {
  currentPhase: string;
  onPhaseChange: (phase: string) => void;
  onEndTurn: () => void;
  isPlayerTurn: boolean;
}

const phases = [
  { id: 'draw', name: 'Draw', color: 'bg-green-600' },
  { id: 'standby', name: 'Standby', color: 'bg-yellow-600' },
  { id: 'main1', name: 'Main 1', color: 'bg-blue-600' },
  { id: 'battle', name: 'Battle', color: 'bg-red-600' },
  { id: 'main2', name: 'Main 2', color: 'bg-purple-600' },
  { id: 'end', name: 'End', color: 'bg-gray-600' }
];

const GamePhases = ({ currentPhase, onPhaseChange, onEndTurn, isPlayerTurn }: GamePhasesProps) => {
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
    <Card className="p-4 bg-slate-800/70 border-gold-400">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Fasi di Gioco</h3>
        
        {/* Phase indicators */}
        <div className="flex justify-center gap-1 overflow-x-auto">
          {phases.map((phase, index) => (
            <Badge
              key={phase.id}
              className={`px-2 py-1 text-xs transition-all cursor-pointer
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
        <div className="text-center">
          <div className="text-2xl font-bold text-gold-400">
            {phases[currentPhaseIndex]?.name} Phase
          </div>
          {!isPlayerTurn && (
            <div className="text-sm text-gray-400 mt-1">
              Turno dell'avversario
            </div>
          )}
        </div>

        {/* Phase control buttons */}
        {isPlayerTurn && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={nextPhase}
              className="bg-gold-600 hover:bg-gold-700 text-black"
            >
              <ChevronRight size={16} />
              Prossima Fase
            </Button>
            <Button
              onClick={onEndTurn}
              variant="outline"
              className="border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-black"
            >
              <RotateCcw size={16} />
              Fine Turno
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GamePhases;
