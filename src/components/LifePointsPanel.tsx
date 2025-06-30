import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LP_ADJUSTMENT_VALUES } from '@/config/dimensions';

interface LifePointsPanelProps {
  playerLifePoints: number;
  enemyLifePoints: number;
  onLifePointsChange: (amount: number, isEnemy: boolean) => void;
}

const LifePointsPanel = ({ 
  playerLifePoints, 
  enemyLifePoints, 
  onLifePointsChange 
}: LifePointsPanelProps) => {
  const adjustLP = (amount: number) => {
    onLifePointsChange(playerLifePoints + amount, false);
  };

  return (
    <Card className="life-points-panel bg-slate-800/70 border-slate-600 p-5">
      {/* Opponent LP */}
      <div className="opponent-lp mb-6">
        <div className="lp-label text-red-400 text-sm mb-2">Opponent</div>
        <div className="lp-value text-white text-3xl font-bold">{enemyLifePoints}</div>
      </div>
      
      {/* Divider */}
      <div className="lp-divider h-0.5 bg-gradient-to-r from-transparent via-slate-600 to-transparent my-6"></div>
      
      {/* Player LP with controls */}
      <div className="player-lp">
        <div className="lp-label text-blue-400 text-sm mb-2">You</div>
        <div className="lp-value text-white text-3xl font-bold mb-4">{playerLifePoints}</div>
        <div className="lp-controls space-y-1">
          {LP_ADJUSTMENT_VALUES.slice(0, 4).map((value, index) => (
            index % 2 === 0 && (
              <div key={index} className="lp-row flex gap-1">
                <Button 
                  onClick={() => adjustLP(LP_ADJUSTMENT_VALUES[index])} 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs py-1 h-8 border-red-600 text-red-400 hover:bg-red-600/20"
                >
                  {LP_ADJUSTMENT_VALUES[index]}
                </Button>
                <Button 
                  onClick={() => adjustLP(LP_ADJUSTMENT_VALUES[index + 1])} 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs py-1 h-8 border-red-600 text-red-400 hover:bg-red-600/20"
                >
                  {LP_ADJUSTMENT_VALUES[index + 1]}
                </Button>
              </div>
            )
          ))}
          {LP_ADJUSTMENT_VALUES.slice(4).map((value, index) => (
            index % 2 === 0 && (
              <div key={index} className="lp-row flex gap-1">
                <Button 
                  onClick={() => adjustLP(LP_ADJUSTMENT_VALUES[index + 4])} 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs py-1 h-8 border-green-600 text-green-400 hover:bg-green-600/20"
                >
                  +{LP_ADJUSTMENT_VALUES[index + 4]}
                </Button>
                <Button 
                  onClick={() => adjustLP(LP_ADJUSTMENT_VALUES[index + 5])} 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs py-1 h-8 border-green-600 text-green-400 hover:bg-green-600/20"
                >
                  +{LP_ADJUSTMENT_VALUES[index + 5]}
                </Button>
              </div>
            )
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LifePointsPanel;
