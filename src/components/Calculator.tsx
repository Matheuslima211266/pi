
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator as CalcIcon, Equal } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  return (
    <Card className="p-4 bg-slate-800/70 border-green-400">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalcIcon className="text-green-400" size={20} />
          <h3 className="text-lg font-semibold">Calcolatrice</h3>
        </div>

        {/* Display */}
        <div className="bg-gray-900 p-3 rounded border">
          <div className="text-right text-2xl font-mono text-green-400">
            {display}
          </div>
        </div>

        {/* Calculator buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={clear} className="bg-red-600 hover:bg-red-700 col-span-2">
            Clear
          </Button>
          <Button onClick={() => inputOperation('÷')} variant="outline">
            ÷
          </Button>
          <Button onClick={() => inputOperation('×')} variant="outline">
            ×
          </Button>

          <Button onClick={() => inputNumber('7')} className="bg-gray-600 hover:bg-gray-700">
            7
          </Button>
          <Button onClick={() => inputNumber('8')} className="bg-gray-600 hover:bg-gray-700">
            8
          </Button>
          <Button onClick={() => inputNumber('9')} className="bg-gray-600 hover:bg-gray-700">
            9
          </Button>
          <Button onClick={() => inputOperation('-')} variant="outline">
            -
          </Button>

          <Button onClick={() => inputNumber('4')} className="bg-gray-600 hover:bg-gray-700">
            4
          </Button>
          <Button onClick={() => inputNumber('5')} className="bg-gray-600 hover:bg-gray-700">
            5
          </Button>
          <Button onClick={() => inputNumber('6')} className="bg-gray-600 hover:bg-gray-700">
            6
          </Button>
          <Button onClick={() => inputOperation('+')} variant="outline">
            +
          </Button>

          <Button onClick={() => inputNumber('1')} className="bg-gray-600 hover:bg-gray-700">
            1
          </Button>
          <Button onClick={() => inputNumber('2')} className="bg-gray-600 hover:bg-gray-700">
            2
          </Button>
          <Button onClick={() => inputNumber('3')} className="bg-gray-600 hover:bg-gray-700">
            3
          </Button>
          <Button onClick={performCalculation} className="bg-green-600 hover:bg-green-700 row-span-2">
            <Equal size={16} />
          </Button>

          <Button onClick={() => inputNumber('0')} className="bg-gray-600 hover:bg-gray-700 col-span-2">
            0
          </Button>
          <Button onClick={() => inputNumber('.')} className="bg-gray-600 hover:bg-gray-700">
            .
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Calculator;
