
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DiceAndCoin = ({ onDiceRoll, onCoinFlip }) => {
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setDiceResult(null);
    
    // Animazione di rolling
    let counter = 0;
    const rollInterval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1);
      counter++;
      
      if (counter > 10) {
        clearInterval(rollInterval);
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalResult);
        setIsRolling(false);
        
        // Send result to chat
        if (onDiceRoll) {
          onDiceRoll(finalResult);
        }
      }
    }, 100);
  };

  const flipCoin = () => {
    setIsFlipping(true);
    setCoinResult(null);
    
    // Animazione di flip
    let counter = 0;
    const flipInterval = setInterval(() => {
      setCoinResult(Math.random() > 0.5 ? 'Testa' : 'Croce');
      counter++;
      
      if (counter > 8) {
        clearInterval(flipInterval);
        const finalResult = Math.random() > 0.5 ? 'Testa' : 'Croce';
        setCoinResult(finalResult);
        setIsFlipping(false);
        
        // Send result to chat
        if (onCoinFlip) {
          onCoinFlip(finalResult);
        }
      }
    }, 150);
  };

  return (
    <Card className="p-4 bg-slate-800/70 border-purple-400">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">Strumenti di Gioco</h3>
        
        {/* Dice section */}
        <div className="text-center space-y-2">
          <Button
            onClick={rollDice}
            disabled={isRolling}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
          >
            {isRolling ? 'Rolling...' : 'Lancia Dado (D6)'}
          </Button>
          
          {diceResult && (
            <div className="flex items-center justify-center gap-2">
              <div className="text-3xl font-bold text-purple-400">
                ⚄
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Risultato: {diceResult}
              </Badge>
            </div>
          )}
        </div>

        {/* Coin section */}
        <div className="text-center space-y-2">
          <Button
            onClick={flipCoin}
            disabled={isFlipping}
            className="bg-yellow-600 hover:bg-yellow-700 text-black w-full"
          >
            {isFlipping ? 'Flipping...' : 'Lancia Moneta'}
          </Button>
          
          {coinResult && (
            <div className="flex items-center justify-center gap-2">
              <div className="text-3xl font-bold text-yellow-400">
                {coinResult === 'Testa' ? '👑' : '⭕'}
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Risultato: {coinResult}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DiceAndCoin;
