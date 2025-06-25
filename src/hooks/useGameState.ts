
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

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = () => {
    const allCards = playerDeckData?.cards || sampleCardsData.cards;
    const mainDeckCards = allCards.filter(card => !card.extra_deck);
    const extraDeckCards = allCards.filter(card => card.extra_deck);

    const shuffledMainDeck = shuffleArray([...mainDeckCards]);
    const shuffledHand = shuffleArray([...shuffledMainDeck.slice(0, 5)]);

    setPlayerDeck(shuffledMainDeck.slice(0, 20));
    setEnemyDeck(shuffledMainDeck.slice(20, 40));
    setPlayerHand(shuffledHand);
    setPlayerField(prev => ({ 
      ...prev, 
      extraDeck: extraDeckCards,
      deck: shuffledMainDeck.slice(5, 20)
    }));
    setEnemyField(prev => ({ 
      ...prev, 
      extraDeck: extraDeckCards,
      deck: shuffledMainDeck.slice(20, 40)
    }));
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
    playerField, setPlayerField,
    enemyField, setEnemyField,
    previewCard, setPreviewCard,
    selectedCardFromHand, setSelectedCardFromHand,
    currentPhase, setCurrentPhase,
    isPlayerTurn, setIsPlayerTurn,
    timeRemaining, setTimeRemaining,
    actionLog, setActionLog,
    chatMessages, setChatMessages,
    
    // Functions
    shuffleArray,
    initializeGame
  };
};
