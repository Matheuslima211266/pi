
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, Minus } from 'lucide-react';

interface LifePointsControlProps {
  playerName: string;
  lifePoints: number;
  onLifePointsChange: (amount: number) => void;
  color?: 'red' | 'blue';
  isCompact?: boolean;
}

const LifePointsControl = ({ 
  playerName, 
  lifePoints, 
  onLifePointsChange, 
  color = "blue",
  isCompact = false 
}: LifePointsControlProps) => {
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

  const colorClasses = {
    red: {
      card: "bg-red-900/50 border-red-400",
      icon: "text-red-400",
      button: "bg-red-600 hover:bg-red-700"
    },
    blue: {
      card: "bg-blue-900/50 border-blue-400", 
      icon: "text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`p-3 ${classes.card} ${isCompact ? 'text-sm' : ''}`}>
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Heart className={classes.icon} size={isCompact ? 16 : 24} />
          <h3 className={`font-semibold ${isCompact ? 'text-sm' : 'text-xl'}`}>{playerName}</h3>
        </div>

        {/* Display Life Points */}
        <div className={`font-bold text-white ${isCompact ? 'text-2xl' : 'text-4xl'}`}>
          {lifePoints.toLocaleString()}
        </div>
        
        <Badge variant="outline" className={`px-2 py-1 ${isCompact ? 'text-xs' : 'text-lg'}`}>
          Life Points
        </Badge>

        {/* Quick adjustment buttons */}
        <div className="grid grid-cols-3 gap-1">
          <Button 
            onClick={() => adjustLifePoints(1000)} 
            className={`${classes.button} text-white ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Plus size={isCompact ? 12 : 16} />
            1000
          </Button>
          <Button 
            onClick={() => adjustLifePoints(500)} 
            className={`${classes.button} text-white ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Plus size={isCompact ? 12 : 16} />
            500
          </Button>
          <Button 
            onClick={() => adjustLifePoints(100)} 
            className={`${classes.button} text-white ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Plus size={isCompact ? 12 : 16} />
            100
          </Button>
          
          <Button 
            onClick={() => adjustLifePoints(-1000)} 
            className={`bg-red-600 hover:bg-red-700 text-white ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Minus size={isCompact ? 12 : 16} />
            1000
          </Button>
          <Button 
            onClick={() => adjustLifePoints(-500)} 
            className={`bg-red-600 hover:bg-red-700 text-white ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Minus size={isCompact ? 12 : 16} />
            500
          </Button>
          <Button 
            onClick={() => adjustLifePoints(-100)} 
            className={`bg-red-600 hover:bg-red-700 text-white ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Minus size={isCompact ? 12 : 16} />
            100
          </Button>
        </div>

        {/* Manual input - only show if not compact */}
        {!isCompact && (
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
        )}
      </div>
    </Card>
  );
};

export default LifePointsControl;
