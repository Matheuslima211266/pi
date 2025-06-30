import { useState } from 'react';
import { 
  INITIAL_LIFE_POINTS, 
  INITIAL_HAND_SIZE, 
  SUMMON_LIMIT_PER_TURN, 
  TURN_TIMER_SECONDS 
} from '@/config/dimensions';

export const useGameStateCore = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [playerDeckData, setPlayerDeckData] = useState(null);
  const [playerLifePoints, setPlayerLifePoints] = useState(INITIAL_LIFE_POINTS);
  const [enemyLifePoints, setEnemyLifePoints] = useState(INITIAL_LIFE_POINTS);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [enemyDeck, setEnemyDeck] = useState([]);
  const [enemyHandCount, setEnemyHandCount] = useState(INITIAL_HAND_SIZE);
  const [enemyRevealedCard, setEnemyRevealedCard] = useState(null);
  const [enemyRevealedHand, setEnemyRevealedHand] = useState([]);
  const [previewCard, setPreviewCard] = useState(null);
  const [selectedCardFromHand, setSelectedCardFromHand] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('draw');
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TURN_TIMER_SECONDS);
  const [actionLog, setActionLog] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: 'Sistema', message: 'Duello iniziato!', timestamp: new Date().toLocaleTimeString() },
  ]);
  const [bothPlayersReady, setBothPlayersReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);
  // Summon limit per turn (excluding tokens)
  const [summonLimit, setSummonLimit] = useState(SUMMON_LIMIT_PER_TURN);
  const [summonsThisTurn, setSummonsThisTurn] = useState(0);
  const [turnOrder, setTurnOrder] = useState<'undecided' | 'host' | 'guest'>('undecided');
  const [miniGame, setMiniGame] = useState<'coin' | 'rps' | null>(null);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [rpsMove, setRpsMove] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [wantsFirst, setWantsFirst] = useState<boolean | null>(null);
  const [miniGameWinner, setMiniGameWinner] = useState<'host' | 'guest' | null>(null);
  const [coinChoiceHost, setCoinChoiceHost] = useState<'heads' | 'tails' | null>(null);
  const [coinChoiceGuest, setCoinChoiceGuest] = useState<'heads' | 'tails' | null>(null);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [isFirstTurn, setIsFirstTurn] = useState(true);
  const [playerStarts, setPlayerStarts] = useState<boolean | null>(null);

  // Function to ensure field structure is always correct
  const ensureFieldStructure = (field) => {
    if (!field) {
      return {
        monsters: Array(5).fill(null),
        spellsTraps: Array(5).fill(null),
        fieldSpell: [],
        deck: [],
        deadZone: [],
        banished: [],
        banishedFaceDown: [],
        extraDeck: [],
        field: []
      };
    }
    
    return {
      monsters: Array.isArray(field.monsters) ? field.monsters : Array(5).fill(null),
      spellsTraps: Array.isArray(field.spellsTraps) ? field.spellsTraps : Array(5).fill(null),
      fieldSpell: Array.isArray(field.fieldSpell) ? field.fieldSpell : [],
      deck: Array.isArray(field.deck) ? field.deck : [],
      deadZone: Array.isArray(field.deadZone) ? field.deadZone : [],
      banished: Array.isArray(field.banished) ? field.banished : [],
      banishedFaceDown: Array.isArray(field.banishedFaceDown) ? field.banishedFaceDown : [],
      extraDeck: Array.isArray(field.extraDeck) ? field.extraDeck : [],
      field: Array.isArray(field.field) ? field.field : []
    };
  };

  // Field states with guaranteed arrays and proper initialization
  const [playerField, setPlayerField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    deck: [],
    deadZone: [],
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    field: []
  });
  
  const [enemyField, _setEnemyField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    deck: [],
    deadZone: [],
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    field: []
  });

  // Custom setter con controllo e log
  const setEnemyField = (next) => {
    _setEnemyField(prev => {
      let newValue = typeof next === 'function' ? next(prev) : next;
      // Normalizza sempre la struttura
      newValue = ensureFieldStructure(newValue);

      return newValue;
    });
  };

  // Custom setter for playerField with structure validation
  const setPlayerFieldSafe = (next) => {
    setPlayerField(prev => {
      let newValue = typeof next === 'function' ? next(prev) : next;
      // Ensure field structure is correct
      newValue = ensureFieldStructure(newValue);
      console.log('[setPlayerFieldSafe] playerField aggiornato', { prev, newValue });
      return newValue;
    });
  };

  return {
    // Basic game state
    gameStarted, setGameStarted,
    gameData, setGameData,
    playerDeckData, setPlayerDeckData,
    playerLifePoints, setPlayerLifePoints,
    enemyLifePoints, setEnemyLifePoints,
    summonLimit, setSummonLimit,
    summonsThisTurn, setSummonsThisTurn,
    
    // Card states
    playerHand, setPlayerHand,
    playerDeck, setPlayerDeck,
    enemyDeck, setEnemyDeck,
    enemyHandCount, setEnemyHandCount,
    enemyRevealedCard, setEnemyRevealedCard,
    enemyRevealedHand, setEnemyRevealedHand,
    
    // Field states
    playerField, setPlayerField: setPlayerFieldSafe,
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
    currentTurnPlayerId, setCurrentTurnPlayerId,
    turnCount, setTurnCount,
    isFirstTurn, setIsFirstTurn,
    playerStarts, setPlayerStarts,
    
    // Multiplayer states
    bothPlayersReady, setBothPlayersReady,
    playerReady, setPlayerReady,
    opponentConnected, setOpponentConnected,
    
    // Turn order states
    turnOrder, setTurnOrder,
    miniGame, setMiniGame,
    coinResult, setCoinResult,
    rpsMove, setRpsMove,
    wantsFirst, setWantsFirst,
    miniGameWinner, setMiniGameWinner,
    coinChoiceHost, setCoinChoiceHost,
    coinChoiceGuest, setCoinChoiceGuest,
    
    // Utility functions
    ensureFieldStructure,
  };
};
