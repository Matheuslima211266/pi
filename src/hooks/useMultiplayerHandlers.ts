
export const useMultiplayerHandlers = (gameState, syncGameState) => {
  const {
    gameData,
    setPlayerLifePoints,
    setEnemyLifePoints,
    setChatMessages,
    setActionLog
  } = gameState;

  const handleLifePointsChange = (amount, isEnemy) => {
    if (isEnemy) {
      // Don't allow direct enemy life points changes
      return;
    } else {
      setPlayerLifePoints(amount);
      const newAction = {
        id: Date.now() + Math.random(),
        player: gameData?.playerName || 'Player',
        action: `changed life points to ${amount}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setActionLog(prev => [...prev, newAction]);
      setTimeout(() => syncGameState(), 100);
    }
  };

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: message
    };
    setChatMessages(prev => [...prev, newMessage]);
    setTimeout(() => syncGameState(), 100);
  };

  const handleDiceRoll = (result) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: `🎲 Rolled dice: ${result}`
    };
    setChatMessages(prev => [...prev, newMessage]);
    setTimeout(() => syncGameState(), 100);
  };

  const handleCoinFlip = (result) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: `🪙 Flipped coin: ${result}`
    };
    setChatMessages(prev => [...prev, newMessage]);
    setTimeout(() => syncGameState(), 100);
  };

  const handleDealDamage = (damage, isToEnemy = true) => {
    if (isToEnemy) {
      setEnemyLifePoints(prev => Math.max(0, prev - damage));
    } else {
      setPlayerLifePoints(prev => Math.max(0, prev - damage));
    }
    
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `dealt ${damage} damage to ${isToEnemy ? 'opponent' : 'self'}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
    setTimeout(() => syncGameState(), 100);
  };

  return {
    handleLifePointsChange,
    handleSendMessage,
    handleDiceRoll,
    handleCoinFlip,
    handleDealDamage
  };
};
