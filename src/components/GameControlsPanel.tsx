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
    <Card className="sidebar-section bg-card/70 border-border p-3">
      <h3 className="text-foreground text-sm font-semibold text-center mb-3">Game Controls</h3>
      
      <div className="space-y-1">
        <Button
          onClick={onDrawCard}
          size="sm"
          className="w-full bg-primary text-primary-foreground text-xs h-7"
        >
          <ArrowDown size={12} className="mr-1" />
          Draw Card
        </Button>
        
        <Button
          onClick={rollDice}
          size="sm"
          variant="outline"
          className="w-full border-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground text-xs h-7"
        >
          <Dice1 size={12} className="mr-1" />
          Roll Dice
        </Button>
        
        <Button
          onClick={flipCoin}
          size="sm"
          variant="outline"
          className="w-full border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground text-xs h-7"
        >
          <Coins size={12} className="mr-1" />
          Flip Coin
        </Button>
      </div>
    </Card>
  );
};

export default GameControlsPanel;
