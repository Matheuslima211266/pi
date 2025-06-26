
import { useState } from 'react';
import sampleCardsData from '@/data/sampleCards.json';

export const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [playerDeckData, setPlayerDeckData] = useState(null);
  const [playerLifePoints, setPlayerLifePoints] = useState(8000);
  const [enemyLifePoints, setEnemyLifePoints] = useState(8000);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerDeck, setPlayerDeck] = useState([]);
  const [enemyDeck, setEnemyDeck] = useState([]);
  const [enemyHandCount, setEnemyHandCount] = useState(5); // Conteggio carte nemico
  const [enemyRevealedCard, setEnemyRevealedCard] = useState(null); // Carta rivelata del nemico
  const [enemyRevealedHand, setEnemyRevealedHand] = useState(null); // Mano rivelata del nemico
  const [playerField, setPlayerField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    graveyard: [],
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    deck: [],
  });
  const [enemyField, setEnemyField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    graveyard: [],
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    deck: [],
  });
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

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Funzione per generare ID unici per le carte (corretta)
  const generateUniqueCardId = (baseId, playerId, index = 0) => {
    return `${playerId}_${baseId}_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  const initializeGame = () => {
    console.log('[useGameState] Initializing game...');
    const allCards = playerDeckData?.cards || sampleCardsData.cards;
    const mainDeckCards = allCards.filter(card => !card.extra_deck);
    const extraDeckCards = allCards.filter(card => card.extra_deck);

    // Genera un deck completo con ID unici per ogni copia
    const fullDeck = [];
    mainDeckCards.forEach((card, cardIndex) => {
      // Crea esattamente 3 copie di ogni carta per un deck più completo
      for (let copyIndex = 0; copyIndex < 3; copyIndex++) {
        const uniqueCard = {
          ...card,
          id: generateUniqueCardId(card.id, gameData?.playerName || 'player', `${cardIndex}_copy${copyIndex}`)
        };
        fullDeck.push(uniqueCard);
        console.log(`[useGameState] Added card copy:`, uniqueCard.name, 'with ID:', uniqueCard.id);
      }
    });
    
    const uniqueExtraDeckCards = extraDeckCards.map((card, index) => ({
      ...card,
      id: generateUniqueCardId(card.id, gameData?.playerName || 'player', `extra_${index}`)
    }));

    console.log(`[useGameState] Created deck with ${fullDeck.length} cards total`);
    console.log('[useGameState] Full deck cards:', fullDeck.map(c => `${c.name} (${c.id})`));

    const shuffledMainDeck = shuffleArray([...fullDeck]);
    const shuffledHand = shuffledMainDeck.slice(0, 5);
    const remainingDeck = shuffledMainDeck.slice(5);

    // Crea anche un deck separato per il nemico con le stesse carte ma ID diversi
    const enemyDeck = [];
    mainDeckCards.forEach((card, cardIndex) => {
      for (let copyIndex = 0; copyIndex < 3; copyIndex++) {
        enemyDeck.push({
          ...card,
          id: generateUniqueCardId(card.id, 'enemy', `${cardIndex}_copy${copyIndex}`)
        });
      }
    });

    console.log(`[useGameState] Initial hand:`, shuffledHand.map(c => `${c.name} (${c.id})`));

    setPlayerDeck(remainingDeck);
    setEnemyDeck(shuffleArray(enemyDeck).slice(0, 35));
    setPlayerHand(shuffledHand);
    setPlayerField(prev => ({ 
      ...prev, 
      extraDeck: uniqueExtraDeckCards,
      deck: remainingDeck,
      graveyard: [],
      banished: [],
      banishedFaceDown: []
    }));
    setEnemyField(prev => ({ 
      ...prev, 
      extraDeck: uniqueExtraDeckCards,
      deck: shuffleArray([...enemyDeck]).slice(0, 35),
      graveyard: [],
      banished: [],
      banishedFaceDown: []
    }));

    console.log('[useGameState] Game initialized successfully');
  };

  return {
    // State
    gameStarted, setGameStarted,
    gameData, setGameData,
    playerDeckData, setPlayerDeckData,
    playerLifePoints, setPlayerLifePoints,
    enemyLifePoints, setEnemyLifePoints,
    playerHand, setPlayerHand,
    playerDeck, setPlayerDeck,
    enemyDeck, setEnemyDeck,
    enemyHandCount, setEnemyHandCount,
    enemyRevealedCard, setEnemyRevealedCard,
    enemyRevealedHand, setEnemyRevealedHand,
    playerField, setPlayerField,
    enemyField, setEnemyField,
    previewCard, setPreviewCard,
    selectedCardFromHand, setSelectedCardFromHand,
    currentPhase, setCurrentPhase,
    isPlayerTurn, setIsPlayerTurn,
    timeRemaining, setTimeRemaining,
    actionLog, setActionLog,
    chatMessages, setChatMessages,
    bothPlayersReady, setBothPlayersReady,
    playerReady, setPlayerReady,
    opponentConnected, setOpponentConnected,
    
    // Functions
    shuffleArray,
    initializeGame,
    generateUniqueCardId
  };
};
