
import React, { useState } from 'react';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import TurnTimer from '@/components/TurnTimer';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

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
  sidebarPosition = 'bottom' // 'bottom' o 'side'
}) => {
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
        top: '4px',
        left: '2px',
        zIndex: 60
      };

  const sidebarStyle = isBottom 
    ? {
        transform: isCollapsed ? 'translateY(100%)' : 'translateY(0)',
        width: '100%'
      }
    : {
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        width: 'clamp(80px, 20vw, 120px)',
        minWidth: '80px'
      };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-slate-800/90 border border-slate-600 rounded p-1 text-white hover:bg-slate-700/90 transition-colors"
        style={{ ...toggleButtonStyle, fontSize: '12px', padding: '4px' }}
      >
        {toggleIcon}
      </button>

      {/* Sidebar */}
      <div 
        className={`sidebar transition-transform duration-300`}
        style={sidebarStyle}
      >
        {/* Enemy Life Points - Ultra compressed */}
        <div className="sidebar-section">
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
        <div className="sidebar-section">
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
        <div className="sidebar-section">
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
        <div className="sidebar-section">
          <div className="bg-purple-900/30 border border-purple-600/50 rounded p-1">
            <div className="text-center">
              <div className="text-purple-400 text-xs font-bold mb-1">TIME</div>
              <div className="text-white text-xs">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
