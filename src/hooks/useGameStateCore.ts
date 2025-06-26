
import { useState } from 'react';

export const useGameStateCore = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [playerDeckData, setPlayerDeckData] = useState(null);
  const [playerLifePoints, setPlayerLifePoints] = useState(8000);
  const [enemyLifePoints, setEnemyLifePoints] = useState(8000);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [enemyDeck, setEnemyDeck] = useState([]);
  const [enemyHandCount, setEnemyHandCount] = useState(5);
  const [enemyRevealedCard, setEnemyRevealedCard] = useState(null);
  const [enemyRevealedHand, setEnemyRevealedHand] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);
  const [selectedCardFromHand, setSelectedCardFromHand] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('draw');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [actionLog, setActionLog] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: 'Sistema', message: 'Duello iniziato!' },
  ]);
  const [bothPlayersReady, setBothPlayersReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  // Field states with guaranteed arrays - removed deadZone completely
  const [playerField, setPlayerField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    deck: [],
  });
  
  const [enemyField, setEnemyField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    deck: [],
  });

  return {
    // Basic game state
    gameStarted, setGameStarted,
    gameData, setGameData,
    playerDeckData, setPlayerDeckData,  
    playerLifePoints, setPlayerLifePoints,
    enemyLifePoints, setEnemyLifePoints,
    
    // Card states
    playerHand, setPlayerHand,
    playerDeck, setPlayerDeck,
    enemyDeck, setEnemyDeck,
    enemyHandCount, setEnemyHandCount,
    enemyRevealedCard, setEnemyRevealedCard,
    enemyRevealedHand, setEnemyRevealedHand,
    
    // Field states
    playerField, setPlayerField,
    enemyField, setEnemyField,
    
    // UI states
    previewCard, setPreviewCard,
    selectedCardFromHand, setSelectedCardFromHand,
    
    // Game flow states
    currentPhase, setCurrentPhase,
    isPlayerTurn, setIsPlayerTurn,
    timeRemaining, setTimeRemaining,
    actionLog, setActionLog,
    chatMessages, setChatMessages,
    
    // Multiplayer states
    bothPlayersReady, setBothPlayersReady,
    playerReady, setPlayerReady,
    opponentConnected, setOpponentConnected,
  };
};
