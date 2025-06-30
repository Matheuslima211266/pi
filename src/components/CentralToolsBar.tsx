import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LifePointsControl from './LifePointsControl';
import GamePhases from './GamePhases';
import { useGameState } from '@/hooks/useGameState';
import { Swords, Users } from 'lucide-react';
import { generateUniqueCardId } from '@/utils/gameHelpers';

interface CentralToolsBarProps {
  enemyLifePoints: number;
  playerLifePoints: number;
  onLifePointsChange: (amount: number, isEnemy: boolean) => void;
  currentPhase: string;
  onPhaseChange: (phase: string) => void;
  onEndTurn: () => void;
  isPlayerTurn: boolean;
  onCreateToken: (token: { name: string; atk: number; def: number }) => void;
  className?: string;
  currentTurnPlayerId?: string;
  myPlayerId?: string;
}

const TokenCreator = ({ onCreate }: { onCreate: (token: { name: string; atk: number; def: number }) => void }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [atk, setAtk] = useState('');
  const [def, setDef] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const atkVal = parseInt(atk, 10) || 0;
    const defVal = parseInt(def, 10) || 0;
    onCreate({ name: name || 'Token', atk: atkVal, def: defVal });
    setName(''); setAtk(''); setDef(''); setOpen(false);
  };

  const handleQuickToken = (atk: number, def: number) => {
    onCreate({ name: `Token ${atk}/${def}`, atk, def });
    setOpen(false);
  };

  return (
    <div className="relative inline-block ml-2">
      <Button size="sm" className="bg-primary text-primary-foreground text-xs px-2 py-1" onClick={() => setOpen(o => !o)}>Token</Button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-popover p-2 rounded shadow border border-border flex flex-col gap-1 min-w-[160px]">
          <div className="flex gap-1 mb-1">
            <Button size="sm" type="button" className="bg-secondary text-secondary-foreground text-xs px-2 py-1 flex-1" onClick={() => handleQuickToken(0, 0)}>0/0</Button>
            <Button size="sm" type="button" className="bg-secondary text-secondary-foreground text-xs px-2 py-1 flex-1" onClick={() => handleQuickToken(1300, 0)}>1300/0</Button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <input type="text" className="rounded px-1 py-0.5 text-xs bg-input text-foreground border border-border" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input type="number" className="rounded px-1 py-0.5 text-xs bg-input text-foreground border border-border" placeholder="ATK" value={atk} onChange={e => setAtk(e.target.value)} />
            <input type="number" className="rounded px-1 py-0.5 text-xs bg-input text-foreground border border-border" placeholder="DEF" value={def} onChange={e => setDef(e.target.value)} />
            <div className="flex gap-1 mt-1">
              <Button size="sm" type="submit" className="bg-accent text-accent-foreground text-xs px-2 py-1 flex-1">Create</Button>
              <Button size="sm" type="button" className="bg-destructive text-destructive-foreground text-xs px-2 py-1 flex-1" onClick={() => setOpen(false)}>X</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const CentralToolsBar: React.FC<CentralToolsBarProps> = ({
  enemyLifePoints,
  playerLifePoints,
  onLifePointsChange,
  currentPhase,
  onPhaseChange,
  onEndTurn,
  isPlayerTurn,
  onCreateToken,
  className,
  currentTurnPlayerId,
  myPlayerId
}) => {
  const [editing, setEditing] = React.useState<'enemy' | 'player' | null>(null);
  const [lpInput, setLpInput] = React.useState('');

  const handleClickValue = (type: 'enemy' | 'player', value: number) => {
    setEditing(type);
    setLpInput(value.toString());
  };

  const applyLpChange = (type:'enemy'|'player')=>{
    if(lpInput==='') {setEditing(null);return;}
    const val=parseInt(lpInput,10);
    if(!isNaN(val)){
      onLifePointsChange(val,type==='enemy');
    }
    setEditing(null);
  };

  return (
    <div className={`w-full flex flex-row items-center justify-between bg-background/90 rounded-md border border-border px-3 py-1 my-1 h-9 gap-3 shadow-md text-xs ${className}`}>
      {/* LP Avversario */}
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm font-semibold text-destructive">Opponent</span>
        {editing === 'enemy' ? (
          <input 
            className="w-20 text-center bg-input text-foreground border border-primary rounded-md text-lg font-bold" 
            value={lpInput} 
            autoFocus 
            onChange={e => setLpInput(e.target.value)} 
            onBlur={() => applyLpChange('enemy')} 
            onKeyDown={e => { if (e.key === 'Enter') applyLpChange('enemy'); }} 
          />
        ) : (
          <div 
            className="life-points cursor-pointer bg-popover rounded-md px-3 py-0.5 border border-transparent hover:border-border transition-colors"
            onClick={() => handleClickValue('enemy', enemyLifePoints)}
          >
            <span className="text-lg font-bold text-destructive tracking-wider">{enemyLifePoints}</span>
          </div>
        )}
      </div>
      {/* Fasi di gioco + Token + Indicatore di turno */}
      <div className="flex flex-row items-center flex-1 justify-center gap-4">
        {currentTurnPlayerId && myPlayerId && (
          <div className={`text-xs font-bold px-2 py-0.5 rounded ${currentTurnPlayerId === myPlayerId ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'}`}>
            {currentTurnPlayerId === myPlayerId ? 'Your Turn' : "Opponent's Turn"}
          </div>
        )}
        <div className="flex flex-row items-center justify-center">
          <GamePhases
            currentPhase={currentPhase}
            onPhaseChange={onPhaseChange}
            onEndTurn={onEndTurn}
            isPlayerTurn={isPlayerTurn}
            direction="horizontal"
            compact
            onCreateToken={onCreateToken}
          />
          <TokenCreator onCreate={onCreateToken} />
        </div>
      </div>
      {/* LP Player */}
      <div className="flex flex-row items-center gap-2">
        {editing === 'player' ? (
           <input 
            className="w-20 text-center bg-input text-foreground border border-primary rounded-md text-lg font-bold" 
            value={lpInput} 
            autoFocus 
            onChange={e => setLpInput(e.target.value)} 
            onBlur={() => applyLpChange('player')} 
            onKeyDown={e => { if (e.key === 'Enter') applyLpChange('player'); }} 
          />
        ) : (
          <div 
            className="life-points cursor-pointer bg-popover rounded-md px-3 py-0.5 border border-transparent hover:border-border transition-colors"
            onClick={() => handleClickValue('player', playerLifePoints)}
          >
            <span className="text-lg font-bold text-primary tracking-wider">{playerLifePoints}</span>
          </div>
        )}
        <span className="text-sm font-semibold text-primary">You</span>
      </div>
    </div>
  );
};

export default CentralToolsBar;