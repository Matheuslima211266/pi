
export const useGameFlowHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    setCurrentPhase,
    setIsPlayerTurn,
    setTimeRemaining,
    setActionLog
  } = gameState;

  const handlePhaseChange = (phase) => {
    setCurrentPhase(phase);
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `changed phase to ${phase}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    setTimeout(() => syncGameState(), 100);
  };

  const handleEndTurn = () => {
    setIsPlayerTurn(!gameState.isPlayerTurn);
    setCurrentPhase('draw');
    setTimeRemaining(60);
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: 'ended turn',
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    setTimeout(() => syncGameState(), 100);
  };

  const handleTimeUp = () => {
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: 'time up! Turn ended automatically',
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    handleEndTurn();
  };

  return {
    handlePhaseChange,
    handleEndTurn,
    handleTimeUp
  };
};
