export const useGameFlowHandlers = (gameState) => {
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
  };

  const handleEndTurn = () => {
    const currentId = gameState.currentTurnPlayerId;
    const hostId = gameData?.hostId;
    const guestId = gameData?.guestId;
    const nextPlayerId = currentId === hostId ? guestId : hostId;
    
    gameState.setCurrentTurnPlayerId(nextPlayerId);

    if (gameState.setSummonsThisTurn) {
      gameState.setSummonsThisTurn(0);
    }
    setCurrentPhase('draw');
    setTimeRemaining(60);
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: 'ended turn',
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
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
