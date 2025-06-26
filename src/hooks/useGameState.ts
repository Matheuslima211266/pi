
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
  const [enemyHandCount, setEnemyHandCount] = useState(5);
  const [enemyRevealedCard, setEnemyRevealedCard] = useState(null);
  const [enemyRevealedHand, setEnemyRevealedHand] = useState(null);
  
  // Inizializzazione più robusta dei field con arrays vuoti garantiti
  const [playerField, setPlayerField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    graveyard: [], // Assicuriamoci che sia sempre un array
    banished: [],
    banishedFaceDown: [],
    extraDeck: [],
    deck: [],
  });
  
  const [enemyField, setEnemyField] = useState({
    monsters: Array(5).fill(null),
    spellsTraps: Array(5).fill(null),
    fieldSpell: [],
    graveyard: [], // Assicuriamoci che sia sempre un array
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

  // Funzione per generare ID unici per le carte
  const generateUniqueCardId = (baseId: any, playerId: string, index: string | number = 0) => {
    return `${playerId}_${baseId}_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  };

  // Funzione helper per aggiungere carte al cimitero (per test)
  const addCardToGraveyard = (card, isPlayer = true) => {
    console.log('[useGameState] Adding card to graveyard:', card.name);
    if (isPlayer) {
      setPlayerField(prev => {
        const newGraveyard = [...(prev.graveyard || []), card];
        console.log('[useGameState] Player graveyard updated:', newGraveyard.map(c => c.name));
        return {
          ...prev,
          graveyard: newGraveyard
        };
      });
    } else {
      setEnemyField(prev => {
        const newGraveyard = [...(prev.graveyard || []), card];
        console.log('[useGameState] Enemy graveyard updated:', newGraveyard.map(c => c.name));
        return {
          ...prev,
          graveyard: newGraveyard
        };
      });
    }
  };

  // Funzione per spostare carte tra zone
  const moveCardBetweenZones = (card, fromZone, toZone, isPlayer = true) => {
    console.log(`[useGameState] Moving card ${card.name} from ${fromZone} to ${toZone}`);
    
    const fieldSetter = isPlayer ? setPlayerField : setEnemyField;
    const handSetter = isPlayer ? setPlayerHand : null;
    
    fieldSetter(prev => {
      const newField = { ...prev };
      
      // Rimuovi dalla zona di origine
      if (fromZone === 'hand' && isPlayer) {
        // Gestione speciale per la mano
        if (handSetter) {
          setPlayerHand(currentHand => currentHand.filter(c => c.id !== card.id));
        }
      } else if (newField[fromZone]) {
        if (Array.isArray(newField[fromZone])) {
          newField[fromZone] = newField[fromZone].filter(c => c && c.id !== card.id);
        } else {
          // Per zone con slot (monsters, spellsTraps)
          newField[fromZone] = newField[fromZone].map(c => c && c.id === card.id ? null : c);
        }
      }
      
      // Aggiungi alla zona di destinazione
      if (toZone === 'hand' && isPlayer) {
        // Gestione speciale per la mano
        if (handSetter) {
          setPlayerHand(currentHand => [...currentHand, card]);
        }
      } else if (newField[toZone]) {
        if (Array.isArray(newField[toZone])) {
          newField[toZone] = [...newField[toZone], card];
        }
        // Per zone con slot, dovremmo gestire il piazzamento in slot specifici
      }
      
      console.log(`[useGameState] Updated ${toZone}:`, newField[toZone]);
      return newField;
    });
  };

  const initializeGame = () => {
    console.log('[useGameState] Initializing game...');
    const allCards = playerDeckData?.cards || sampleCardsData.cards;
    const mainDeckCards = allCards.filter(card => !card.extra_deck);
    const extraDeckCards = allCards.filter(card => card.extra_deck);

    // Genera un deck completo con ID unici per ogni copia
    const fullDeck = [];
    mainDeckCards.forEach((card, cardIndex) => {
      for (let copyIndex = 0; copyIndex < 3; copyIndex++) {
        const uniqueCard = {
          ...card,
          id: generateUniqueCardId(card.id, gameData?.playerName || 'player', `${cardIndex}_copy${copyIndex}`)
        };
        fullDeck.push(uniqueCard);
      }
    });
    
    const uniqueExtraDeckCards = extraDeckCards.map((card, index) => ({
      ...card,
      id: generateUniqueCardId(card.id, gameData?.playerName || 'player', `extra_${index}`)
    }));

    const shuffledMainDeck = shuffleArray([...fullDeck]);
    const shuffledHand = shuffledMainDeck.slice(0, 5);
    const remainingDeck = shuffledMainDeck.slice(5);

    // Crea anche un deck separato per il nemico
    const enemyDeck = [];
    mainDeckCards.forEach((card, cardIndex) => {
      for (let copyIndex = 0; copyIndex < 3; copyIndex++) {
        enemyDeck.push({
          ...card,
          id: generateUniqueCardId(card.id, 'enemy', `${cardIndex}_copy${copyIndex}`)
        });
      }
    });

    // Aggiungi alcune carte di test al cimitero per verificare il funzionamento
    const testGraveyardCards = shuffledHand.slice(0, 2).map(card => ({
      ...card,
      id: generateUniqueCardId(card.id, 'graveyard_test', Date.now())
    }));

    console.log('[useGameState] Test graveyard cards:', testGraveyardCards.map(c => c.name));

    setPlayerDeck(remainingDeck);
    setEnemyDeck(shuffleArray(enemyDeck).slice(0, 35));
    setPlayerHand(shuffledHand);
    
    setPlayerField(prev => ({ 
      ...prev, 
      extraDeck: uniqueExtraDeckCards,
      deck: remainingDeck,
      graveyard: testGraveyardCards, // Aggiungi carte di test
      banished: [],
      banishedFaceDown: []
    }));
    
    setEnemyField(prev => ({ 
      ...prev, 
      extraDeck: uniqueExtraDeckCards,
      deck: shuffleArray([...enemyDeck]).slice(0, 35),
      graveyard: [testGraveyardCards[0]], // Aggiungi una carta di test anche al nemico
      banished: [],
      banishedFaceDown: []
    }));

    console.log('[useGameState] Game initialized successfully with test graveyard cards');
  };

  // Funzione per il mill (spostare carte dal deck al cimitero)
  const millCards = (count = 1, isPlayer = true) => {
    console.log(`[useGameState] Milling ${count} cards for ${isPlayer ? 'player' : 'enemy'}`);
    
    if (isPlayer) {
      setPlayerField(prev => {
        const cardsToMill = prev.deck.slice(0, count);
        const remainingDeck = prev.deck.slice(count);
        const newGraveyard = [...(prev.graveyard || []), ...cardsToMill];
        
        console.log('[useGameState] Cards milled to player graveyard:', cardsToMill.map(c => c.name));
        console.log('[useGameState] New player graveyard size:', newGraveyard.length);
        
        return {
          ...prev,
          deck: remainingDeck,
          graveyard: newGraveyard
        };
      });
      
      setPlayerDeck(prev => prev.slice(count));
    } else {
      setEnemyField(prev => {
        const cardsToMill = prev.deck.slice(0, count);
        const remainingDeck = prev.deck.slice(count);
        const newGraveyard = [...(prev.graveyard || []), ...cardsToMill];
        
        return {
          ...prev,
          deck: remainingDeck,
          graveyard: newGraveyard
        };
      });
      
      setEnemyDeck(prev => prev.slice(count));
    }
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
    generateUniqueCardId,
    addCardToGraveyard,
    moveCardBetweenZones,
    millCards
  };
};
