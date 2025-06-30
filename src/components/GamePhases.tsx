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
  direction?: 'horizontal' | 'vertical';
  onCreateToken?: (token: { name: string; atk: number; def: number }) => void;
  compact?: boolean;
}

const phases = [
  { id: 'draw', name: 'Draw', color: 'bg-primary' },
  { id: 'standby', name: 'Standby', color: 'bg-secondary' },
  { id: 'main1', name: 'Main 1', color: 'bg-accent' },
  { id: 'battle', name: 'Battle', color: 'bg-destructive' },
  { id: 'main2', name: 'Main 2', color: 'bg-purple-600' },
  { id: 'end', name: 'End', color: 'bg-muted' }
];

const GamePhases = ({ currentPhase, onPhaseChange, onEndTurn, isPlayerTurn, direction = 'horizontal', onCreateToken, compact=false }: GamePhasesProps) => {
  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);
  
  const nextPhase = () => {
    const nextIndex = (currentPhaseIndex + 1) % phases.length;
    if (nextIndex === 0) {
      onEndTurn();
    } else {
      onPhaseChange(phases[nextIndex].id);
    }
  };

  const Wrapper: React.FC<{children:any}> = ({children})=> compact?
    <div className="p-1">{children}</div>:
    <Card className="p-2 bg-card/70 border-border">{children}</Card>;

  return (
    <Wrapper>
      <div className="space-y-1">
        <div className={`flex justify-center gap-1 ${direction === 'vertical' ? 'flex-col items-center overflow-y-auto' : 'flex-row overflow-x-auto'}`}>
          {phases.map((phase) => {
            const isActive = currentPhase === phase.id;
            const clickable = isPlayerTurn;
            return (
              <Badge
                key={phase.id}
                className={`transition-all ${compact ? 'px-1 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'} ${clickable ? 'cursor-pointer' : 'cursor-default pointer-events-none'}
                  ${isActive ? `${phase.color} text-primary-foreground` : 'bg-muted text-muted-foreground hover:bg-muted/80'}
                `}
                onClick={() => {
                  if (!clickable) return;
                  if (phase.id === 'end') {
                    onEndTurn();
                  } else {
                    onPhaseChange(phase.id);
                  }
                }}
              >
                {phase.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
};

// TokenCreator: piccolo form inline per creare token personalizzati
const TokenCreator = ({ onCreate }: { onCreate: (token: { name: string; atk: number; def: number }) => void }) => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [atk, setAtk] = React.useState('');
  const [def, setDef] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const atkVal = parseInt(atk, 10) || 0;
    const defVal = parseInt(def, 10) || 0;
    onCreate({ name: name || 'Token', atk: atkVal, def: defVal });
    setName(''); setAtk(''); setDef(''); setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Button size="sm" className="bg-primary text-primary-foreground text-xs px-2 py-1" onClick={() => setOpen(o => !o)}>+</Button>
      {open && (
        <form onSubmit={handleSubmit} className="absolute z-50 top-full left-0 mt-1 bg-popover p-2 rounded shadow border border-border flex flex-col gap-1 min-w-[140px]">
          <input type="text" className="rounded px-1 py-0.5 text-xs bg-input text-foreground border-border" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input type="number" className="rounded px-1 py-0.5 text-xs bg-input text-foreground border-border" placeholder="ATK" value={atk} onChange={e => setAtk(e.target.value)} />
          <input type="number" className="rounded px-1 py-0.5 text-xs bg-input text-foreground border-border" placeholder="DEF" value={def} onChange={e => setDef(e.target.value)} />
          <div className="flex gap-1 mt-1">
            <Button size="sm" type="submit" className="bg-accent text-accent-foreground text-xs px-2 py-1">Create</Button>
            <Button size="sm" type="button" className="bg-destructive text-destructive-foreground text-xs px-2 py-1" onClick={() => setOpen(false)}>X</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GamePhases;
