import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isActive?: boolean;
  onTimeUp?: () => void;
  timeRemaining: number;
  onTimeChange: (time: number | ((prev: number) => number)) => void;
}

const TimerControls = ({ 
  isActive = false, 
  onTimeUp, 
  timeRemaining, 
  onTimeChange 
}: TimerControlsProps) => {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    onTimeChange(180);
    setIsRunning(false);
  };

  return (
    <Card className="sidebar-section bg-card/70 border-border p-3">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="text-primary" size={16} />
          <h3 className="text-foreground text-sm font-semibold">Timer</h3>
        </div>
        
        <div className="text-2xl font-bold text-foreground mb-2">
          {formatTime(timeRemaining)}
        </div>
        
        <div className={`text-xs mb-3 ${timeRemaining < 30 ? 'text-destructive' : 'text-primary'}`}>
          {isRunning ? 'Running' : 'Paused'}
        </div>
        
        <div className="flex gap-1">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            size="sm"
            className="flex-1 bg-primary text-primary-foreground text-xs h-7"
          >
            {isRunning ? <Pause size={12} /> : <Play size={12} />}
          </Button>
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs h-7"
          >
            <RotateCcw size={12} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TimerControls;
