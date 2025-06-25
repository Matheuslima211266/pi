import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlayerHand from '@/components/PlayerHand';
import GameBoard from '@/components/GameBoard';
import CardPreview from '@/components/CardPreview';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import ChatBox from '@/components/ChatBox';
import ActionLog from '@/components/ActionLog';
import DiceAndCoin from '@/components/DiceAndCoin';
import TurnTimer from '@/components/TurnTimer';
import MultiplayerSetup from '@/components/MultiplayerSetup';
import sampleCardsData from '@/data/sampleCards.json';

const Index = () => {
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

  // Multiplayer sync
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(() => {
        syncGameState();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const syncGameState = () => {
    if (!gameData?.gameId) return;
    
    const gameState = {
      playerField,
      enemyField,
      playerHand: gameData.isHost ? playerHand : [],
      actionLog,
      chatMessages,
      currentPhase,
      isPlayerTurn,
      playerLifePoints,
      enemyLifePoints,
      lastUpdate: Date.now()
    };
    
    localStorage.setItem(`yugiduel_state_${gameData.gameId}`, JSON.stringify(gameState));
  };

  const loadGameState = () => {
    if (!gameData?.gameId) return;
    
    const savedState = localStorage.getItem(`yugiduel_state_${gameData.gameId}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.lastUpdate && Date.now() - state.lastUpdate < 5000) {
        if (!gameData.isHost) {
          setEnemyField(state.playerField);
          setPlayerField(state.enemyField);
        }
        setActionLog(state.actionLog || []);
        setChatMessages(state.chatMessages || []);
        setCurrentPhase(state.currentPhase || 'draw');
        setIsPlayerTurn(state.isPlayerTurn);
        setPlayerLifePoints(gameData.isHost ? state.playerLifePoints : state.enemyLifePoints);
        setEnemyLifePoints(gameData.isHost ? state.enemyLifePoints : state.playerLifePoints);
      }
    }
  };

  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(loadGameState, 1000);
      return () => clearInterval(interval);
    }
  }, [gameData]);

  const handleGameStart = (newGameData) => {
    console.log('Game started with data:', newGameData);
    setGameData(newGameData);
    setGameStarted(true);
    initializeGame();
  };

  const handleDeckLoad = (deckData) => {
    console.log('Deck loaded:', deckData);
    setPlayerDeckData(deckData);
  };

  const initializeGame = () => {
    const allCards = playerDeckData?.cards || sampleCardsData.cards;
    const mainDeckCards = allCards.filter(card => !card.extra_deck);
    const extraDeckCards = allCards.filter(card => card.extra_deck);

    // Shuffle the deck randomly
    const shuffledMainDeck = shuffleArray(mainDeckCards);
    const shuffledHand = shuffleArray(shuffledMainDeck.slice(0, 5));

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

  const handleCardPlace = (card, zoneName, slotIndex, isFaceDown = false, position = null) => {
    console.log(`Placing card ${card.name} in ${zoneName} at index ${slotIndex}`);

    // Remove card from hand
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    setSelectedCardFromHand(null);

    // Place card in the specified zone
    setPlayerField(prev => {
      const newField = { ...prev };

      if (zoneName === 'monsters') {
        newField.monsters = [...prev.monsters];
        newField.monsters[slotIndex] = { ...card, faceDown: isFaceDown, position: position };
      } else if (zoneName === 'spellsTraps') {
        newField.spellsTraps = [...prev.spellsTraps];
        newField.spellsTraps[slotIndex] = { ...card, faceDown: isFaceDown };
      } else if (zoneName === 'fieldSpell') {
        newField.fieldSpell = [{ ...card, faceDown: isFaceDown }];
      }

      return newField;
    });

    addToActionLog(`Placed ${card.name} in ${zoneName}`);
  };

  const handleCardMove = (card, fromZone, toZone, slotIndex = null) => {
    console.log(`Moving card ${card.name} from ${fromZone} to ${toZone}`);
    
    if (toZone === 'flip_in_place') {
      if (fromZone === 'monsters') {
        setPlayerField(prev => {
          const newField = { ...prev };
          newField.monsters = [...prev.monsters];
          newField.monsters[slotIndex] = card;
          return newField;
        });
      } else if (fromZone === 'spellsTraps') {
        setPlayerField(prev => {
          const newField = { ...prev };
          newField.spellsTraps = [...prev.spellsTraps];
          newField.spellsTraps[slotIndex] = card;
          return newField;
        });
      }
      
      addToActionLog(`${card.faceDown ? 'Set' : 'Flip'} ${card.name} ${card.faceDown ? 'face-down' : 'face-up'}`);
      return;
    }

    // Remove from source zone
    if (fromZone === 'hand') {
      setPlayerHand(hand => hand.filter(c => c.id !== card.id));
    } else {
      setPlayerField(prev => {
        const newField = { ...prev };

        if (fromZone === 'monsters') {
          newField.monsters = [...prev.monsters];
          const sourceIndex = prev.monsters.findIndex(m => m && m.id === card.id);
          if (sourceIndex !== -1) newField.monsters[sourceIndex] = null;
        } else if (fromZone === 'spellsTraps') {
          newField.spellsTraps = [...prev.spellsTraps];
          const sourceIndex = prev.spellsTraps.findIndex(s => s && s.id === card.id);
          if (sourceIndex !== -1) newField.spellsTraps[sourceIndex] = null;
        } else if (fromZone === 'fieldSpell') {
          newField.fieldSpell = [];
        } else if (fromZone === 'graveyard') {
          newField.graveyard = prev.graveyard.filter(c => c.id !== card.id);
        } else if (fromZone === 'banished') {
          newField.banished = prev.banished.filter(c => c.id !== card.id);
        } else if (fromZone === 'banishedFaceDown') {
          newField.banishedFaceDown = prev.banishedFaceDown.filter(c => c.id !== card.id);
        } else if (fromZone === 'extraDeck') {
          newField.extraDeck = prev.extraDeck.filter(c => c.id !== card.id);
        } else if (fromZone === 'deck') {
          newField.deck = prev.deck.filter(c => c.id !== card.id);
        }

        return newField;
      });
    }

    // Add to destination zone
    if (toZone === 'hand') {
      setPlayerHand(hand => [...hand, card]);
    } else {
      setPlayerField(prev => {
        const newField = { ...prev };

        if (toZone === 'monsters') {
          newField.monsters = [...prev.monsters];
          if (slotIndex !== null) {
            newField.monsters[slotIndex] = card;
          }
        } else if (toZone === 'spellsTraps') {
          newField.spellsTraps = [...prev.spellsTraps];
          if (slotIndex !== null) {
            newField.spellsTraps[slotIndex] = card;
          }
        } else if (toZone === 'fieldSpell') {
          newField.fieldSpell = [card];
        } else if (toZone === 'graveyard') {
          newField.graveyard = [...prev.graveyard, card];
        } else if (toZone === 'banished') {
          newField.banished = [...prev.banished, card];
        } else if (toZone === 'banishedFaceDown') {
          newField.banishedFaceDown = [...prev.banishedFaceDown, card];
        } else if (toZone === 'extraDeck') {
          newField.extraDeck = [...prev.extraDeck, card];
        } else if (toZone === 'deck_top') {
          newField.deck = [card, ...prev.deck];
        } else if (toZone === 'deck_bottom') {
          newField.deck = [...prev.deck, card];
        } else if (toZone === 'deck_shuffle') {
          newField.deck = shuffleArray([...prev.deck, card]);
        }

        return newField;
      });
    }

    addToActionLog(`Moved ${card.name} from ${fromZone} to ${toZone}`);
  };

  const handleDrawCard = () => {
    if (playerField.deck.length > 0) {
      const drawnCard = playerField.deck[0];
      setPlayerHand(prevHand => [...prevHand, drawnCard]);
      setPlayerField(prev => ({ ...prev, deck: prev.deck.slice(1) }));
      addToActionLog(`Drew ${drawnCard.name}`);
    } else {
      addToActionLog('Deck is empty!');
    }
  };

  const handleCardClick = (card) => {
    setPreviewCard(card);
  };

  const handlePhaseChange = (phase) => {
    setCurrentPhase(phase);
    addToActionLog(`Changed phase to ${phase}`);
  };

  const handleEndTurn = () => {
    setIsPlayerTurn(!isPlayerTurn);
    setCurrentPhase('draw');
    setTimeRemaining(60);
    addToActionLog(`Turn ended - ${!isPlayerTurn ? 'Your' : "Opponent's"} turn`);
  };

  const handleLifePointsChange = (amount, isEnemy) => {
    if (isEnemy) {
      setEnemyLifePoints(amount);
    } else {
      setPlayerLifePoints(amount);
    }
  };

  const addToActionLog = (action) => {
    setActionLog(prev => [...prev, {
      id: Date.now(),
      action: action
    }]);
  };

  const addToChatLog = (message, cardName = null, isFaceDown = false) => {
    const displayName = (isFaceDown && cardName) ? 'Carta coperta' : cardName;
    const fullMessage = displayName ? `${message}: ${displayName}` : message;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      player: 'Sistema',
      message: fullMessage
    }]);
  };

  const handleAttack = (attackingCard, targetCard) => {
    addToActionLog(`${attackingCard.name} attacks ${targetCard ? targetCard.name : 'directly'}`);
  };

  const handleTimeUp = () => {
    addToActionLog('Time up! Turn ended automatically');
    handleEndTurn();
  };

  if (!gameStarted) {
    return (
      <MultiplayerSetup 
        onGameStart={handleGameStart}
        onDeckLoad={handleDeckLoad}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto p-4">
        <div className="flex gap-4">
          {/* Main game area - Left side */}
          <div className="flex-1 space-y-4">
            {/* Game Board */}
            <GameBoard 
              playerField={playerField}
              enemyField={enemyField}
              onAttack={handleAttack}
              onCardPlace={handleCardPlace}
              selectedCardFromHand={selectedCardFromHand}
              onCardPreview={setPreviewCard}
              onCardMove={handleCardMove}
              onDrawCard={handleDrawCard}
            />
            
            {/* Player Hand */}
            <PlayerHand 
              cards={playerHand}
              onPlayCard={setSelectedCardFromHand}
              isPlayerTurn={true}
              onCardPreview={setPreviewCard}
              onCardMove={handleCardMove}
            />
            
            {/* Bottom Controls */}
            <div className="grid grid-cols-2 gap-4">
              <ActionLog actions={actionLog} />
              <DiceAndCoin />
            </div>
          </div>
          
          {/* Right Sidebar - Tools */}
          <div className="w-80 space-y-4">
            {/* Enemy Life Points */}
            <LifePointsControl 
              playerName="Avversario"
              lifePoints={enemyLifePoints}
              onLifePointsChange={setEnemyLifePoints}
              color="red"
            />
            
            {/* Game Phases - Center */}
            <GamePhases 
              currentPhase={currentPhase}
              onPhaseChange={handlePhaseChange}
              onEndTurn={handleEndTurn}
              isPlayerTurn={isPlayerTurn}
            />
            
            {/* Player Life Points */}
            <LifePointsControl 
              playerName="Giocatore"
              lifePoints={playerLifePoints}
              onLifePointsChange={setPlayerLifePoints}
              color="blue"
            />
            
            {/* Timer */}
            <TurnTimer 
              isActive={isPlayerTurn}
              onTimeUp={handleTimeUp}
            />
            
            {/* Chat */}
            <ChatBox 
              messages={chatMessages}
              onSendMessage={(message) => addToChatLog(message)}
            />
          </div>
        </div>
        
        {/* Card Preview Modal */}
        {previewCard && (
          <CardPreview 
            card={previewCard}
            onClose={() => setPreviewCard(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
