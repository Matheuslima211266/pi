import React from 'react';
import DiceAndCoin from '@/components/DiceAndCoin';
import { ThemeSwitcher } from './ThemeSwitcher';

interface ToolsPanelProps {
  onDiceRoll: (result: number) => void;
  onCoinFlip: (result: string) => void;
  onSendMessage: (message: string) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ onDiceRoll, onCoinFlip, onSendMessage }) => {
  return (
    <div className="bg-card/90 rounded-lg p-2 border border-border flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-center text-foreground">Tools</h3>
      <DiceAndCoin onDiceRoll={onDiceRoll} onCoinFlip={onCoinFlip} onSendMessage={onSendMessage} />
      <ThemeSwitcher />
    </div>
  );
};

export default ToolsPanel; 