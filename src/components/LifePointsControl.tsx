
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, Minus } from 'lucide-react';

interface LifePointsControlProps {
  playerName: string;
  lifePoints: number;
  onLifePointsChange: (newValue: number) => void;
  color?: string;
}

const LifePointsControl = ({ playerName, lifePoints, onLifePointsChange, color = "blue" }: LifePointsControlProps) => {
  const [manualInput, setManualInput] = useState('');

  const adjustLifePoints = (amount: number) => {
    const newValue = Math.max(0, lifePoints + amount);
    onLifePointsChange(newValue);
  };

  const handleManualChange = () => {
    const value = parseInt(manualInput);
    if (!isNaN(value) && value >= 0) {
      onLifePointsChange(value);
      setManualInput('');
    }
  };

  const buttonClass = color === "blue" ? 
    "bg-blue-600 hover:bg-blue-700" : 
    "bg-red-600 hover:bg-red-700";

  return (
    <Card className={`p-4 bg-${color}-900/50 border-${color}-400`}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className={`text-${color}-400`} size={24} />
          <h3 className="text-xl font-semibold">{playerName}</h3>
        </div>

        {/* Display Life Points */}
        <div className="text-4xl font-bold text-white">
          {lifePoints.toLocaleString()}
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">
          Life Points
        </Badge>

        {/* Quick adjustment buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={() => adjustLifePoints(1000)} 
            className={`${buttonClass} text-white`}
            size="sm"
          >
            <Plus size={16} />
            1000
          </Button>
          <Button 
            onClick={() => adjustLifePoints(500)} 
            className={`${buttonClass} text-white`}
            size="sm"
          >
            <Plus size={16} />
            500
          </Button>
          <Button 
            onClick={() => adjustLifePoints(100)} 
            className={`${buttonClass} text-white`}
            size="sm"
          >
            <Plus size={16} />
            100
          </Button>
          
          <Button 
            onClick={() => adjustLifePoints(-1000)} 
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <Minus size={16} />
            1000
          </Button>
          <Button 
            onClick={() => adjustLifePoints(-500)} 
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <Minus size={16} />
            500
          </Button>
          <Button 
            onClick={() => adjustLifePoints(-100)} 
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <Minus size={16} />
            100
          </Button>
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Set LP"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
            min="0"
          />
          <Button onClick={handleManualChange} variant="outline">
            Set
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LifePointsControl;
