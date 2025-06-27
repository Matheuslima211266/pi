
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, ArrowDown, Eye, RotateCcw, Dice1, Coins } from 'lucide-react';

interface GameControlsPanelProps {
  onDrawCard: () => void;
  onDiceRoll: (result: number) => void;
  onCoinFlip: (result: string) => void;
}

const GameControlsPanel = ({ 
  onDrawCard, 
  onDiceRoll, 
  onCoinFlip 
}: GameControlsPanelProps) => {
  const rollDice = () => {
    const result = Math.floor(Math.random() * 6) + 1;
    onDiceRoll(result);
  };

  const flipCoin = () => {
    const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
    onCoinFlip(result);
  };

  return (
    <Card className="sidebar-section bg-slate-800/70 border-slate-600 p-3">
      <h3 className="text-white text-sm font-semibold text-center mb-3">Game Controls</h3>
      
      <div className="space-y-1">
        <Button
          onClick={onDrawCard}
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700 text-xs h-7"
        >
          <ArrowDown size={12} className="mr-1" />
          Draw Card
        </Button>
        
        <Button
          onClick={rollDice}
          size="sm"
          variant="outline"
          className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black text-xs h-7"
        >
          <Dice1 size={12} className="mr-1" />
          Roll Dice
        </Button>
        
        <Button
          onClick={flipCoin}
          size="sm"
          variant="outline"
          className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-xs h-7"
        >
          <Coins size={12} className="mr-1" />
          Flip Coin
        </Button>
      </div>
    </Card>
  );
};

export default GameControlsPanel;
