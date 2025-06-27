
import React, { useState } from 'react';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import TurnTimer from '@/components/TurnTimer';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

interface MobileSidebarProps {
  enemyLifePoints: number;
  playerLifePoints: number;
  currentPhase: string;
  isPlayerTurn: boolean;
  timeRemaining: number;
  onLifePointsChange: (amount: number, isEnemy: boolean) => void;
  onPhaseChange: (phase: string) => void;
  onEndTurn: () => void;
  onTimeUp: () => void;
  onTimeChange: (time: number | ((prev: number) => number)) => void;
  sidebarPosition?: 'bottom' | 'side';
  onSidebarPositionChange?: (position: 'bottom' | 'side') => void;
}

const MobileSidebar = ({
  enemyLifePoints,
  playerLifePoints,
  currentPhase,
  isPlayerTurn,
  timeRemaining,
  onLifePointsChange,
  onPhaseChange,
  onEndTurn,
  onTimeUp,
  onTimeChange,
  sidebarPosition = 'bottom',
  onSidebarPositionChange
}: MobileSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isBottom = sidebarPosition === 'bottom';
  const toggleIcon = isBottom 
    ? (isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />)
    : (isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />);

  const toggleButtonStyle = isBottom 
    ? {
        position: 'fixed' as const,
        bottom: isCollapsed ? '4px' : 'auto',
        top: isCollapsed ? 'auto' : 'calc(75vh - 20px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60
      }
    : {
        position: 'fixed' as const,
        top: '50%',
        left: isCollapsed ? '4px' : 'clamp(80px, 20vw, 120px)',
        transform: 'translateY(-50%)',
        zIndex: 60
      };

  const sidebarStyle = isBottom 
    ? {
        transform: isCollapsed ? 'translateY(100%)' : 'translateY(0)',
        width: '100%',
        height: '25vh',
        minHeight: '120px'
      }
    : {
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        width: 'clamp(80px, 20vw, 120px)',
        minWidth: '80px',
        height: '100vh'
      };

  const sidebarClasses = isBottom
    ? 'fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-600 z-50 transition-transform duration-300'
    : 'fixed left-0 top-0 bg-slate-900/95 border-r border-slate-600 z-50 transition-transform duration-300';

  return (
    <>
      {/* Position Switch Button */}
      {onSidebarPositionChange && (
        <button
          onClick={() => onSidebarPositionChange(isBottom ? 'side' : 'bottom')}
          className="fixed top-4 right-4 z-60 bg-slate-800/90 border border-slate-600 rounded p-2 text-white hover:bg-slate-700/90 transition-colors"
          title={`Switch to ${isBottom ? 'side' : 'bottom'} sidebar`}
        >
          <RotateCcw size={16} />
        </button>
      )}

      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-slate-800/90 border border-slate-600 rounded p-1 text-white hover:bg-slate-700/90 transition-colors"
        style={{ ...toggleButtonStyle, fontSize: '12px', padding: '4px' }}
      >
        {toggleIcon}
      </button>

      {/* Sidebar */}
      <div 
        className={sidebarClasses}
        style={sidebarStyle}
      >
        <div className={`p-2 gap-2 h-full overflow-y-auto ${isBottom ? 'flex flex-row' : 'flex flex-col'}`}>
          {/* Enemy Life Points - Ultra compressed */}
          <div className={`${isBottom ? 'flex-shrink-0 min-w-[120px]' : 'mb-2'}`}>
            <div className="bg-red-900/30 border border-red-600/50 rounded p-1">
              <div className="text-center">
                <div className="text-red-400 text-xs font-bold mb-1">OPP</div>
                <div className="text-white text-sm font-bold">{enemyLifePoints}</div>
                <div className="grid grid-cols-2 gap-0.5 mt-1">
                  <button 
                    onClick={() => onLifePointsChange(enemyLifePoints - 1000, true)}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                  >
                    -1K
                  </button>
                  <button 
                    onClick={() => onLifePointsChange(enemyLifePoints + 1000, true)}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs px-1 py-0.5 rounded"
                  >
                    +1K
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Game Phases - Ultra compressed */}
          <div className={`${isBottom ? 'flex-shrink-0 min-w-[120px]' : 'mb-2'}`}>
            <div className="bg-blue-900/30 border border-blue-600/50 rounded p-1">
              <div className="text-center">
                <div className="text-blue-400 text-xs font-bold mb-1">PHASE</div>
                <div className="text-white text-xs">{currentPhase}</div>
                <button 
                  onClick={onEndTurn}
                  className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-2 py-0.5 rounded mt-1 w-full"
                  disabled={!isPlayerTurn}
                >
                  END
                </button>
              </div>
            </div>
          </div>
          
          {/* Player Life Points - Ultra compressed */}
          <div className={`${isBottom ? 'flex-shrink-0 min-w-[120px]' : 'mb-2'}`}>
            <div className="bg-blue-900/30 border border-blue-600/50 rounded p-1">
              <div className="text-center">
                <div className="text-blue-400 text-xs font-bold mb-1">YOU</div>
                <div className="text-white text-sm font-bold">{playerLifePoints}</div>
                <div className="grid grid-cols-2 gap-0.5 mt-1">
                  <button 
                    onClick={() => onLifePointsChange(playerLifePoints - 1000, false)}
                    className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-1 py-0.5 rounded"
                  >
                    -1K
                  </button>
                  <button 
                    onClick={() => onLifePointsChange(playerLifePoints + 1000, false)}
                    className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-1 py-0.5 rounded"
                  >
                    +1K
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timer - Ultra compressed */}
          <div className={`${isBottom ? 'flex-shrink-0 min-w-[120px]' : 'mb-2'}`}>
            <div className="bg-purple-900/30 border border-purple-600/50 rounded p-1">
              <div className="text-center">
                <div className="text-purple-400 text-xs font-bold mb-1">TIME</div>
                <div className="text-white text-xs">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
