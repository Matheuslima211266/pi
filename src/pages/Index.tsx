import React, { useState, useEffect, useRef } from 'react';
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
  const syncLockRef = useRef(false);
  const lastSyncTimeRef = useRef(Date.now());

  // Multiplayer sync with improved conflict resolution
  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(() => {
        syncGameState();
      }, 1000); // Sync every second for better real-time experience
      return () => clearInterval(interval);
    }
  }, [gameData, playerField, enemyField, playerHand, playerLifePoints, enemyLifePoints, currentPhase, isPlayerTurn, actionLog, chatMessages]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const syncGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    syncLockRef.current = true;
    
    try {
      const gameState = {
        // Player's own state
        playerField,
        playerLifePoints,
        playerHandCount: playerHand.length, // Only send hand count, not actual cards
        
        // Shared game state
        actionLog,
        chatMessages,
        currentPhase,
        isPlayerTurn,
        
        // Metadata
        lastUpdate: Date.now(),
        playerId: gameData.isHost ? 'host' : 'guest',
        playerName: gameData.playerName
      };
      
      const stateKey = `yugiduel_state_${gameData.gameId}`;
      localStorage.setItem(stateKey, JSON.stringify(gameState));
      lastSyncTimeRef.current = Date.now();
      
      console.log('Synced game state:', gameState);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      syncLockRef.current = false;
    }
  };

  const loadGameState = () => {
    if (!gameData?.gameId || syncLockRef.current) return;
    
    const stateKey = `yugiduel_state_${gameData.gameId}`;
    const savedState = localStorage.getItem(stateKey);
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        
        // Only load if it's newer than our last sync and from the other player
        if (state.lastUpdate && 
            state.lastUpdate > lastSyncTimeRef.current + 500 && // Add small delay to prevent conflicts
            state.playerId !== (gameData.isHost ? 'host' : 'guest')) {
          
          console.log('Loading opponent state:', state);
          
          // Update opponent's field (their playerField becomes our enemyField)
          setEnemyField(state.playerField);
          setEnemyLifePoints(state.playerLifePoints);
          
          // Update shared game state
          if (state.actionLog && Array.isArray(state.actionLog)) {
            setActionLog(state.actionLog);
          }
          
          if (state.chatMessages && Array.isArray(state.chatMessages)) {
            setChatMessages(state.chatMessages);
          }
          
          setCurrentPhase(state.currentPhase || 'draw');
          setIsPlayerTurn(state.isPlayerTurn);
          
          lastSyncTimeRef.current = state.lastUpdate;
        }
      } catch (error) {
        console.error('Load state error:', error);
      }
    }
  };

  useEffect(() => {
    if (gameData?.gameId) {
      const interval = setInterval(loadGameState, 800); // Load slightly more frequently
      return () => clearInterval(interval);
    }
  }, [gameData]);

  const handleGameStart = (newGameData) => {
    console.log('Game started with data:', newGameData);
    setGameData(newGameData);
    setGameStarted(true);
    
    // Clear any existing sync data
    if (newGameData.gameId) {
      const stateKey = `yugiduel_state_${newGameData.gameId}`;
      localStorage.removeItem(stateKey);
    }
    
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

    // Shuffle the deck randomly with better randomization
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

    addToActionLog(`${gameData.playerName} placed ${card.name} in ${zoneName}`);
    
    // Force sync after placement
    setTimeout(() => syncGameState(), 100);
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
      
      addToActionLog(`${gameData.playerName} ${card.faceDown ? 'set' : 'flipped'} ${card.name} ${card.faceDown ? 'face-down' : 'face-up'}`);
      setTimeout(() => syncGameState(), 100);
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

    addToActionLog(`${gameData.playerName} moved ${card.name} from ${fromZone} to ${toZone}`);
    
    // Force sync after movement
    setTimeout(() => syncGameState(), 100);
  };

  const handleDrawCard = () => {
    if (playerField.deck.length > 0) {
      const drawnCard = playerField.deck[0];
      setPlayerHand(prevHand => [...prevHand, drawnCard]);
      setPlayerField(prev => ({ ...prev, deck: prev.deck.slice(1) }));
      addToActionLog(`${gameData.playerName} drew a card`);
    } else {
      addToActionLog(`${gameData.playerName}'s deck is empty!`);
    }
  };

  const handleCardClick = (card) => {
    setPreviewCard(card);
  };

  const handlePhaseChange = (phase) => {
    setCurrentPhase(phase);
    addToActionLog(`${gameData.playerName} changed phase to ${phase}`);
  };

  const handleEndTurn = () => {
    setIsPlayerTurn(!isPlayerTurn);
    setCurrentPhase('draw');
    setTimeRemaining(60);
    addToActionLog(`${gameData.playerName} ended turn`);
  };

  const handleLifePointsChange = (amount, isEnemy) => {
    if (isEnemy) {
      setEnemyLifePoints(amount);
    } else {
      setPlayerLifePoints(amount);
      addToActionLog(`${gameData.playerName} changed life points to ${amount}`);
    }
  };

  const addToActionLog = (action) => {
    const newAction = {
      id: Date.now(),
      player: gameData?.playerName || 'Player',
      action: action,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const addToChatLog = (message, cardName = null, isFaceDown = false) => {
    const displayName = (isFaceDown && cardName) ? 'Carta coperta' : cardName;
    const fullMessage = displayName ? `${message}: ${displayName}` : message;
    const newMessage = {
      id: Date.now(),
      player: gameData?.playerName || 'Player',
      message: fullMessage
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = (message) => {
    const newMessage = {
      id: Date.now(),
      player: gameData?.playerName || 'Player',
      message: message
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleAttack = (attackingCard, targetCard) => {
    addToActionLog(`${gameData.playerName}: ${attackingCard.name} attacks ${targetCard ? targetCard.name : 'directly'}`);
  };

  const handleTimeUp = () => {
    addToActionLog(`${gameData.playerName}'s time up! Turn ended automatically`);
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
        {/* Game ID Display */}
        {gameData?.gameId && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 bg-gold-600 text-black px-4 py-2 rounded-lg font-semibold">
              <span>Game ID: {gameData.gameId}</span>
              {gameData.isHost && <span className="text-xs">(Host)</span>}
            </div>
          </div>
        )}
        
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
              onLifePointsChange={(amount) => handleLifePointsChange(amount, true)}
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
              onLifePointsChange={(amount) => handleLifePointsChange(amount, false)}
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
              onSendMessage={handleSendMessage}
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
