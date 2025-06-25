import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GameBoard from '@/components/GameBoard';
import PlayerHand from '@/components/PlayerHand';
import LifePointsControl from '@/components/LifePointsControl';
import GamePhases from '@/components/GamePhases';
import DiceAndCoin from '@/components/DiceAndCoin';
import Calculator from '@/components/Calculator';
import ChatBox from '@/components/ChatBox';
import ActionLog from '@/components/ActionLog';
import DeckBuilder from '@/components/DeckBuilder';
import TurnTimer from '@/components/TurnTimer';
import CardPreview from '@/components/CardPreview';
import sampleCardsData from '@/data/sampleCards.json';

const Index = () => {
  const [gameState, setGameState] = useState({
    playerHP: 8000,
    enemyHP: 8000,
    turn: 1,
    currentPlayer: 'player',
    phase: 'draw',
  });

  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [selectedCardFromHand, setSelectedCardFromHand] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);
  
  // Properly initialize all field zones as arrays
  const [playerField, setPlayerField] = useState({
    monsters: [],
    spellsTraps: [],
    graveyard: [],
    banished: [],
    banishedFaceDown: [],
    fieldSpell: []
  });
  const [enemyField, setEnemyField] = useState({
    monsters: [],
    spellsTraps: [],
    graveyard: [],
    banished: [],
    banishedFaceDown: [],
    fieldSpell: []
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const allCards = sampleCardsData.cards;
    
    // Crea un mazzo completo con tutte le carte dal JSON (ogni carta una volta)
    const playerDeck = [...allCards].map((card, index) => ({
      ...card,
      id: `player_${card.id}_${index}`
    }));
    
    const enemyDeck = [...allCards].map((card, index) => ({
      ...card,
      id: `enemy_${card.id}_${index}`
    }));
    
    // Mescola i mazzi
    const shuffledPlayerDeck = playerDeck.sort(() => Math.random() - 0.5);
    const shuffledEnemyDeck = enemyDeck.sort(() => Math.random() - 0.5);
    
    // Distribuisce le mani iniziali (5 carte)
    const playerStartingHand = shuffledPlayerDeck.slice(0, 5);
    const enemyStartingHand = shuffledEnemyDeck.slice(0, 5);
    
    setPlayerHand(playerStartingHand);
    setEnemyHand(enemyStartingHand);
    
    toast({
      title: "Duello Iniziato!",
      description: `Mazzo caricato con ${allCards.length} carte diverse. Che il migliore vinca!`,
    });
  };

  const [actionLog, setActionLog] = useState([]);

  const logAction = (player, action) => {
    const newAction = {
      id: Date.now(),
      player,
      action,
      timestamp: new Date().toLocaleTimeString()
    };
    setActionLog(prev => [...prev, newAction]);
  };

  const handleCardSelection = (card) => {
    setSelectedCardFromHand(card);
  };

  const handleCardPreview = (card) => {
    setPreviewCard(card);
  };

  const handlePhaseChange = (newPhase: string) => {
    setGameState(prev => ({
      ...prev,
      phase: newPhase
    }));

    logAction('Giocatore', `Cambia fase a ${newPhase}`);
    toast({
      title: `Fase ${newPhase}`,
      description: `Ora sei nella fase ${newPhase}`,
    });
  };

  const endTurn = () => {
    const newPlayer = gameState.currentPlayer === 'player' ? 'enemy' : 'player';
    const newTurn = newPlayer === 'player' ? gameState.turn + 1 : gameState.turn;
    
    setSelectedCardFromHand(null);
    
    setGameState(prev => ({
      ...prev,
      currentPlayer: newPlayer,
      turn: newTurn,
      phase: 'draw'
    }));

    logAction(gameState.currentPlayer === 'player' ? 'Giocatore' : 'Avversario', 'Fine turno');
    toast({
      title: `Turno ${newTurn}`,
      description: `È il turno di ${newPlayer === 'player' ? 'Giocatore' : 'Avversario'}`,
    });
  };

  const placeCard = (card, zoneName, slotIndex, faceDown = false) => {
    // Rimuovi la carta dalla mano
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    // Reset carta selezionata
    setSelectedCardFromHand(null);
    
    // Aggiungi la carta al campo nella posizione specificata
    setPlayerField(prev => {
      const newField = { ...prev };
      const cardWithPosition = { 
        ...card, 
        position: 'attack', 
        faceDown: faceDown 
      };
      
      if (zoneName === 'monsters' || zoneName === 'spellsTraps') {
        const newZone = [...(prev[zoneName] || [])];
        newZone[slotIndex] = cardWithPosition;
        newField[zoneName] = newZone;
      } else {
        // Ensure the zone exists and is an array before spreading
        const currentZone = prev[zoneName] || [];
        newField[zoneName] = [...currentZone, cardWithPosition];
      }
      
      return newField;
    });
    
    logAction('Giocatore', `Posiziona ${card.name} ${faceDown ? 'coperta' : 'scoperta'} in zona ${zoneName}`);

    toast({
      title: "Carta Posizionata!",
      description: `${card.name} è stata posizionata ${faceDown ? 'coperta' : 'scoperta'} in zona ${zoneName}!`,
    });
  };

  const attackWithMonster = (attackingCard, targetCard = null) => {
    if (!targetCard) {
      // Attacco diretto
      const damage = attackingCard.atk;
      setGameState(prev => ({
        ...prev,
        enemyHP: Math.max(0, prev.enemyHP - damage)
      }));
      
      toast({
        title: "Attacco Diretto!",
        description: `${attackingCard.name} infligge ${damage} danni!`,
      });
    } else {
      // Battaglia tra mostri
      const attackerPower = attackingCard.atk;
      const defenderPower = targetCard.def;
      
      if (attackerPower > defenderPower) {
        // Rimuovi il mostro difensore e mandalo al cimitero
        setEnemyField(prev => ({
          ...prev,
          monsters: prev.monsters.filter(m => m.id !== targetCard.id),
          graveyard: [...prev.graveyard, targetCard]
        }));
        
        const damage = attackerPower - defenderPower;
        setGameState(prev => ({
          ...prev,
          enemyHP: Math.max(0, prev.enemyHP - damage)
        }));
        
        toast({
          title: "Mostro Distrutto!",
          description: `${targetCard.name} è stato distrutto! ${damage} danni inflitti.`,
        });
      } else if (attackerPower < defenderPower) {
        // Rimuovi il mostro attaccante e mandalo al cimitero
        setPlayerField(prev => ({
          ...prev,
          monsters: prev.monsters.filter(m => m.id !== attackingCard.id),
          graveyard: [...prev.graveyard, attackingCard]
        }));
        
        const damage = defenderPower - attackerPower;
        setGameState(prev => ({
          ...prev,
          playerHP: Math.max(0, prev.playerHP - damage)
        }));
        
        toast({
          title: "Attacco Fallito!",
          description: `${attackingCard.name} è stato distrutto! Subisci ${damage} danni.`,
          variant: "destructive"
        });
      } else {
        // Pareggio - entrambi i mostri vengono distrutti e vanno al cimitero
        setPlayerField(prev => ({
          ...prev,
          monsters: prev.monsters.filter(m => m.id !== attackingCard.id),
          graveyard: [...prev.graveyard, attackingCard]
        }));
        setEnemyField(prev => ({
          ...prev,
          monsters: prev.monsters.filter(m => m.id !== targetCard.id),
          graveyard: [...prev.graveyard, targetCard]
        }));
        
        toast({
          title: "Battaglia Pari!",
          description: "Entrambi i mostri sono stati distrutti!",
        });
      }
    }
    
    if (!targetCard) {
      logAction('Giocatore', `${attackingCard.name} attacca direttamente per ${attackingCard.atk} danni`);
    } else {
      logAction('Giocatore', `${attackingCard.name} attacca ${targetCard.name}`);
    }
  };

  const resetField = () => {
    setPlayerField({
      monsters: [],
      spellsTraps: [],
      graveyard: [],
      banished: [],
      banishedFaceDown: [],
      fieldSpell: []
    });
    setEnemyField({
      monsters: [],
      spellsTraps: [],
      graveyard: [],
      banished: [],
      banishedFaceDown: [],
      fieldSpell: []
    });
    setSelectedCardFromHand(null);
    setPreviewCard(null);
    
    logAction('Sistema', 'Campo azzerato');
    
    toast({
      title: "Campo Azzerato!",
      description: "Tutte le carte sono state rimosse dal campo di battaglia.",
    });
  };

  const handleDeckLoad = (deckData) => {
    if (deckData.cards) {
      const playerDeck = deckData.cards.map((card, index) => ({
        ...card,
        id: `player_${card.id}_${index}`
      }));
      
      const shuffledDeck = playerDeck.sort(() => Math.random() - 0.5);
      const startingHand = shuffledDeck.slice(0, 5);
      
      setPlayerHand(startingHand);
      logAction('Sistema', `Deck "${deckData.name}" caricato con ${deckData.cards.length} carte`);
      
      toast({
        title: "Deck Caricato!",
        description: `Deck "${deckData.name}" caricato con successo!`,
      });
    }
  };

  const handleCardMovement = (card, fromZone, toDestination) => {
    // Remove card from source zone
    if (fromZone === 'graveyard') {
      setPlayerField(prev => ({
        ...prev,
        graveyard: prev.graveyard.filter(c => c.id !== card.id)
      }));
    } else if (fromZone === 'banished') {
      setPlayerField(prev => ({
        ...prev,
        banished: prev.banished.filter(c => c.id !== card.id)
      }));
    } else if (fromZone === 'banishedFaceDown') {
      setPlayerField(prev => ({
        ...prev,
        banishedFaceDown: prev.banishedFaceDown.filter(c => c.id !== card.id)
      }));
    }

    // Add card to destination
    if (toDestination === 'hand') {
      setPlayerHand(prev => [...prev, card]);
    } else if (toDestination === 'monsters') {
      setPlayerField(prev => ({
        ...prev,
        monsters: [...prev.monsters, { ...card, position: 'attack', faceDown: false }]
      }));
    } else if (toDestination === 'spellsTraps') {
      setPlayerField(prev => ({
        ...prev,
        spellsTraps: [...prev.spellsTraps, { ...card, faceDown: false }]
      }));
    } else if (toDestination === 'graveyard') {
      setPlayerField(prev => ({
        ...prev,
        graveyard: [...prev.graveyard, card]
      }));
    } else if (toDestination === 'banished') {
      setPlayerField(prev => ({
        ...prev,
        banished: [...prev.banished, card]
      }));
    } else if (toDestination === 'banishedFaceDown') {
      setPlayerField(prev => ({
        ...prev,
        banishedFaceDown: [...prev.banishedFaceDown, { ...card, faceDown: true }]
      }));
    }

    logAction('Giocatore', `Moved ${card.name} from ${fromZone} to ${toDestination}`);
    
    toast({
      title: "Card Moved!",
      description: `${card.name} moved from ${fromZone} to ${toDestination}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto p-4">
        {/* Card Preview */}
        <CardPreview 
          card={previewCard} 
          onClose={() => setPreviewCard(null)} 
        />

        {/* Header del gioco */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-cinzel text-gold-400 mb-2">
              Duel Cards Simulator
            </h1>
            <Badge variant="secondary" className="text-lg">
              Turno {gameState.turn} - {gameState.currentPlayer === 'player' ? 'Il tuo turno' : 'Turno avversario'}
            </Badge>
          </div>
          
          <Button 
            onClick={resetField}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3"
          >
            <RotateCcw size={16} />
            Reset Campo
          </Button>
        </div>

        {/* Layout principale riorganizzato */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Colonna sinistra - Life Points Giocatore */}
          <div className="lg:col-span-3">
            <LifePointsControl
              playerName="Giocatore"
              lifePoints={gameState.playerHP}
              onLifePointsChange={(newValue) => {
                setGameState(prev => ({ ...prev, playerHP: newValue }));
                logAction('Giocatore', `Life Points: ${newValue}`);
              }}
              color="blue"
            />
          </div>

          {/* Colonna centrale - Fasi di gioco, Dadi e Moneta, Timer */}
          <div className="lg:col-span-6 space-y-4">
            <GamePhases
              currentPhase={gameState.phase}
              onPhaseChange={handlePhaseChange}
              onEndTurn={endTurn}
              isPlayerTurn={true}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <DiceAndCoin />
              <TurnTimer 
                isActive={gameState.currentPlayer === 'player'}
                onTimeUp={() => {
                  logAction('Sistema', 'Tempo scaduto');
                  endTurn();
                }}
              />
            </div>
          </div>

          {/* Colonna destra - Life Points Avversario */}
          <div className="lg:col-span-3">
            <LifePointsControl
              playerName="Avversario"
              lifePoints={gameState.enemyHP}
              onLifePointsChange={(newValue) => {
                setGameState(prev => ({ ...prev, enemyHP: newValue }));
                logAction('Avversario', `Life Points: ${newValue}`);
              }}
              color="red"
            />
          </div>
        </div>

        {/* Strumenti e informazioni */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Calculator />
          <ChatBox />
          <ActionLog actions={actionLog} />
          <DeckBuilder onDeckLoad={handleDeckLoad} />
        </div>

        {/* Campo di battaglia */}
        <GameBoard 
          playerField={playerField}
          enemyField={enemyField}
          onAttack={attackWithMonster}
          onCardPlace={placeCard}
          selectedCardFromHand={selectedCardFromHand}
          onCardPreview={handleCardPreview}
          onCardMove={handleCardMovement}
        />

        {/* Mano del giocatore */}
        <PlayerHand 
          cards={playerHand}
          onPlayCard={handleCardSelection}
          currentMana={999}
          isPlayerTurn={true}
          onCardPreview={handleCardPreview}
        />
      </div>
    </div>
  );
};

export default Index;
