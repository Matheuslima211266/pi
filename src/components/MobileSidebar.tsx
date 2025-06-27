
import React, { useState } from 'react';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import TurnTimer from '@/components/TurnTimer';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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
  onTimeChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Toggle button - sempre visibile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-2 z-60 bg-slate-800/90 border border-slate-600 rounded p-1 text-white hover:bg-slate-700/90 transition-colors"
        style={{ fontSize: '12px', padding: '4px' }}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`sidebar transition-transform duration-300 ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
        style={{ 
          width: 'clamp(80px, 20vw, 120px)',
          minWidth: '80px'
        }}
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
