import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DiceAndCoin = ({ onDiceRoll, onCoinFlip, onSendMessage }) => {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [rpsChoice, setRpsChoice] = useState<string | null>(null);
  const [rpsOpp, setRpsOpp] = useState<string | null>(null);
  const [rpsResult, setRpsResult] = useState<string | null>(null);

  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' } as const;

  const rollDice = () => {
    setIsRolling(true);
    setDiceResult(null);
    
    setTimeout(() => {
      const finalResult = Math.floor(Math.random() * 6) + 1;
      setDiceResult(finalResult);
      setIsRolling(false);
      if (onDiceRoll) onDiceRoll(finalResult);
    }, 500);
  };

  const flipCoin = () => {
    setIsFlipping(true);
    setCoinResult(null);
    
    setTimeout(() => {
      const finalResult = Math.random() > 0.5 ? 'Testa' : 'Croce';
      setCoinResult(finalResult);
      setIsFlipping(false);
      if (onCoinFlip) onCoinFlip(finalResult);
    }, 500);
  };

  const playRps = (move: 'rock'|'paper'|'scissors') => {
    const opp = (['rock','paper','scissors'] as const)[Math.floor(Math.random()*3)];
    setRpsChoice(move);
    setRpsOpp(opp);
    let result: string;
    if (move === opp) result = 'Tie';
    else if (beats[move] === opp) result = 'Win';
    else result = 'Loss';
    setRpsResult(result);
    if (onSendMessage) {
      onSendMessage(`RPS: You chose ${move}, opponent (random) had ${opp} -> ${result}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={rollDice} disabled={isRolling} size="sm">
          {isRolling ? '...' : 'Roll D6'}
        </Button>
        <Button onClick={flipCoin} disabled={isFlipping} size="sm">
          {isFlipping ? '...' : 'Flip Coin'}
        </Button>
      </div>
      {(diceResult || coinResult) && (
        <div className="flex justify-around text-center">
          {diceResult && <Badge variant="secondary">Dice: {diceResult}</Badge>}
          {coinResult && <Badge variant="secondary">Coin: {coinResult}</Badge>}
        </div>
      )}
      <div className="space-y-1 text-center">
        <div className="grid grid-cols-3 gap-1">
          <Button size="icon" variant="outline" onClick={()=>playRps('rock')}>✊</Button>
          <Button size="icon" variant="outline" onClick={()=>playRps('paper')}>🖐️</Button>
          <Button size="icon" variant="outline" onClick={()=>playRps('scissors')}>✌️</Button>
        </div>
        {rpsResult && <Badge variant="secondary" className="mt-1">{rpsResult} (You: {rpsChoice} vs Opp: {rpsOpp})</Badge>}
      </div>
    </div>
  );
};

export default DiceAndCoin;
