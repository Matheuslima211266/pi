import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const TurnTimer = ({ isActive = false, onTimeUp, timeRemaining, onTimeChange }) => {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        onTimeChange(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp && onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onTimeUp, onTimeChange]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    onTimeChange(180);
    setIsRunning(false);
  };

  return (
    <Card className="p-4 bg-card/70 border-primary">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Timer</h3>
        </div>
        
        <div className="text-3xl font-bold text-foreground">
          {formatTime(timeRemaining)}
        </div>
        
        <Badge 
          variant="outline" 
          className={`${timeRemaining < 30 ? 'border-destructive text-destructive' : 'border-primary text-primary'}`}
        >
          {isRunning ? 'Running' : 'Paused'}
        </Badge>
        
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            size="sm"
            className="bg-primary text-primary-foreground"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TurnTimer;
