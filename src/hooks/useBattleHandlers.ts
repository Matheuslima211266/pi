
export const useBattleHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    setActionLog
  } = gameState;

  const handleAttack = (attackingCard, targetCard) => {
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `${attackingCard.name} attacks ${targetCard ? targetCard.name : 'directly'}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    setTimeout(() => syncGameState(), 100);
  };

  return {
    handleAttack
  };
};
