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
  isCompact?: boolean;
  isPlayer?: boolean;
}

const LifePointsControl = ({ 
  playerName, 
  lifePoints, 
  onLifePointsChange, 
  isCompact = false,
  isPlayer = true,
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

  const colorClass = isPlayer ? 'primary' : 'destructive';

  return (
    <Card className={`p-3 bg-card/50 border-${colorClass} ${isCompact ? 'text-sm' : ''}`}>
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Heart className={`text-${colorClass}`} size={isCompact ? 16 : 24} />
          <h3 className={`font-semibold text-foreground ${isCompact ? 'text-sm' : 'text-xl'}`}>{playerName}</h3>
        </div>

        {/* Display Life Points */}
        <div className={`font-bold text-foreground ${isCompact ? 'text-2xl' : 'text-4xl'}`}>
          {lifePoints.toLocaleString()}
        </div>
        
        <Badge variant="outline" className={`px-2 py-1 ${isCompact ? 'text-xs' : 'text-lg'}`}>
          Life Points
        </Badge>

        {/* Quick adjustment buttons */}
        <div className="grid grid-cols-3 gap-1">
          <Button 
            onClick={() => adjustLifePoints(1000)} 
            className={`bg-primary text-primary-foreground ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Plus size={isCompact ? 12 : 16} />
            1000
          </Button>
          <Button 
            onClick={() => adjustLifePoints(500)} 
            className={`bg-primary text-primary-foreground ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Plus size={isCompact ? 12 : 16} />
            500
          </Button>
          <Button 
            onClick={() => adjustLifePoints(100)} 
            className={`bg-primary text-primary-foreground ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Plus size={isCompact ? 12 : 16} />
            100
          </Button>
          
          <Button 
            onClick={() => adjustLifePoints(-1000)} 
            className={`bg-destructive text-destructive-foreground ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Minus size={isCompact ? 12 : 16} />
            1000
          </Button>
          <Button 
            onClick={() => adjustLifePoints(-500)} 
            className={`bg-destructive text-destructive-foreground ${isCompact ? 'text-xs h-6' : ''}`}
            size={isCompact ? "sm" : "default"}
          >
            <Minus size={isCompact ? 12 : 16} />
            500
          </Button>
          <Button 
            onClick={() => adjustLifePoints(-100)} 
            className={`bg-destructive text-destructive-foreground ${isCompact ? 'text-xs h-6' : ''}`}
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
              className="bg-input border-border text-foreground"
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
