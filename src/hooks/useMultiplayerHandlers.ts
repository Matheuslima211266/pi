export const useMultiplayerHandlers = (gameState) => {
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
    }
  };

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: message
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleDiceRoll = (result) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: `🎲 Rolled dice: ${result}`
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCoinFlip = (result) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      message: `🪙 Flipped coin: ${result}`
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleDealDamage = (damage, isToEnemy = true) => {
    if (isToEnemy) {
      setEnemyLifePoints(prev => {
        const val = Math.max(0, prev - damage);
        return val;
      });
    } else {
      setPlayerLifePoints(prev => {
        const val = Math.max(0, prev - damage);
        return val;
      });
    }
    
    const newAction = {
      id: Date.now() + Math.random(),
      player: gameData?.playerName || 'Player',
      action: `dealt ${damage} damage to ${isToEnemy ? 'opponent' : 'self'}`,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  return {
    handleLifePointsChange,
    handleSendMessage,
    handleDiceRoll,
    handleCoinFlip,
    handleDealDamage
  };
};
