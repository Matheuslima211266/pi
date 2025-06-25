
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

  const handleCardSelection = (card) => {
    setSelectedCardFromHand(card);
  };

  const handlePhaseChange = (newPhase: string) => {
    setGameState(prev => ({
      ...prev,
      phase: newPhase
    }));

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

    toast({
      title: `Turno ${newTurn}`,
      description: `È il turno di ${newPlayer === 'player' ? 'Giocatore' : 'Avversario'}`,
    });
  };

  const placeCard = (card, zoneName, slotIndex, faceDown = false) => {
    // Rimossa la restrizione del turno - ora puoi sempre posizionare carte
    
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
        const newZone = [...prev[zoneName]];
        newZone[slotIndex] = cardWithPosition;
        newField[zoneName] = newZone;
      } else {
        newField[zoneName] = [...prev[zoneName], cardWithPosition];
      }
      
      return newField;
    });

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
    
    toast({
      title: "Campo Azzerato!",
      description: "Tutte le carte sono state rimosse dal campo di battaglia.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto p-4">
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

        {/* Controlli principali */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Life Points Controls */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <LifePointsControl
              playerName="Giocatore"
              lifePoints={gameState.playerHP}
              onLifePointsChange={(newValue) => setGameState(prev => ({ ...prev, playerHP: newValue }))}
              color="blue"
            />
            <LifePointsControl
              playerName="Avversario"
              lifePoints={gameState.enemyHP}
              onLifePointsChange={(newValue) => setGameState(prev => ({ ...prev, enemyHP: newValue }))}
              color="red"
            />
          </div>

          {/* Game Phases */}
          <GamePhases
            currentPhase={gameState.phase}
            onPhaseChange={handlePhaseChange}
            onEndTurn={endTurn}
            isPlayerTurn={gameState.currentPlayer === 'player'}
          />

          {/* Tools */}
          <div className="space-y-4">
            <DiceAndCoin />
          </div>
        </div>

        {/* Calculator - posizionato a parte */}
        <div className="mb-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
          <Calculator />
        </div>

        {/* Campo di battaglia */}
        <GameBoard 
          playerField={playerField}
          enemyField={enemyField}
          onAttack={attackWithMonster}
          onCardPlace={placeCard}
          selectedCardFromHand={selectedCardFromHand}
        />

        {/* Mano del giocatore */}
        <PlayerHand 
          cards={playerHand}
          onPlayCard={handleCardSelection}
          currentMana={999} // Mana illimitato per azioni libere
          isPlayerTurn={true} // Sempre true per azioni libere
        />
      </div>
    </div>
  );
};

export default Index;
