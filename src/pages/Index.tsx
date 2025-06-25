import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Zap, Heart, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GameBoard from '@/components/GameBoard';
import CardComponent from '@/components/CardComponent';
import PlayerHand from '@/components/PlayerHand';
import GameZones from '@/components/GameZones';
import sampleCardsData from '@/data/sampleCards.json';

const Index = () => {
  const [gameState, setGameState] = useState({
    playerHP: 8000,
    enemyHP: 8000,
    playerMana: 5,
    enemyMana: 5,
    maxMana: 10,
    turn: 1,
    currentPlayer: 'player',
    phase: 'main', // draw, main, battle, end
  });

  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerField, setPlayerField] = useState({
    monsters: [],
    spells: [],
    traps: [],
    graveyard: [],
    banished: [],
    banishedFaceDown: [],
    fieldSpell: []
  });
  const [enemyField, setEnemyField] = useState({
    monsters: [],
    spells: [],
    traps: [],
    graveyard: [],
    banished: [],
    banishedFaceDown: [],
    fieldSpell: []
  });

  const { toast } = useToast();

  useEffect(() => {
    // Inizializza il gioco
    initializeGame();
  }, []);

  const initializeGame = () => {
    const cards = sampleCardsData.cards;
    
    // Mescola le carte e distribuisce le mani iniziali
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const playerStartingHand = shuffledCards.slice(0, 5);
    const enemyStartingHand = shuffledCards.slice(5, 10);
    
    setPlayerHand(playerStartingHand);
    setEnemyHand(enemyStartingHand);
    
    toast({
      title: "Duello Iniziato!",
      description: "Che il migliore vinca! Buona fortuna, duellante.",
    });
  };

  const endTurn = () => {
    const newPlayer = gameState.currentPlayer === 'player' ? 'enemy' : 'player';
    const newTurn = newPlayer === 'player' ? gameState.turn + 1 : gameState.turn;
    
    setGameState(prev => ({
      ...prev,
      currentPlayer: newPlayer,
      turn: newTurn,
      phase: 'draw',
      playerMana: Math.min(prev.maxMana, prev.playerMana + (newPlayer === 'player' ? 1 : 0)),
      enemyMana: Math.min(prev.maxMana, prev.enemyMana + (newPlayer === 'enemy' ? 1 : 0))
    }));

    toast({
      title: `Turno ${newTurn}`,
      description: `È il turno di ${newPlayer === 'player' ? 'Giocatore' : 'Avversario'}`,
    });
  };

  const playCard = (card, zone) => {
    if (gameState.currentPlayer !== 'player') return;
    
    const cardCost = card.cost || card.star || 1;
    if (gameState.playerMana < cardCost) {
      toast({
        title: "Mana insufficiente!",
        description: `Serve ${cardCost} mana per giocare questa carta.`,
        variant: "destructive"
      });
      return;
    }

    // Determina la zona corretta basata sul tipo di carta
    let targetZone = zone;
    if (card.card_type === 'monster' || card.atk !== undefined) {
      targetZone = 'monsters';
    } else if (card.card_type === 'spell' || card.type === 'Magia') {
      targetZone = 'spells';
    } else if (card.card_type === 'trap' || card.type === 'Trappola') {
      targetZone = 'traps';
    }

    // Rimuovi la carta dalla mano
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    // Aggiungi la carta al campo
    setPlayerField(prev => ({
      ...prev,
      [targetZone]: [...prev[targetZone], { ...card, position: 'attack' }]
    }));

    // Consuma mana
    setGameState(prev => ({
      ...prev,
      playerMana: prev.playerMana - cardCost
    }));

    toast({
      title: "Carta Giocata!",
      description: `${card.name} è stata evocata sul campo di battaglia!`,
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
            onClick={endTurn}
            className="bg-gold-600 hover:bg-gold-700 text-black font-semibold px-6 py-3"
            disabled={gameState.currentPlayer !== 'player'}
          >
            Termina Turno
          </Button>
        </div>

        {/* Statistiche giocatori */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Giocatore */}
          <Card className="bg-blue-900/50 border-blue-400 p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="text-blue-400" size={24} />
              <h3 className="text-xl font-semibold">Giocatore</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="text-red-400" size={16} />
                <span>Punti Vita: {gameState.playerHP}/8000</span>
              </div>
              <Progress value={(gameState.playerHP / 8000) * 100} className="h-2" />
              
              <div className="flex items-center gap-2">
                <Zap className="text-blue-400" size={16} />
                <span>Mana: {gameState.playerMana}/{gameState.maxMana}</span>
              </div>
              <Progress value={(gameState.playerMana / gameState.maxMana) * 100} className="h-2" />
            </div>
          </Card>

          {/* Avversario */}
          <Card className="bg-red-900/50 border-red-400 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Bot className="text-red-400" size={24} />
              <h3 className="text-xl font-semibold">Avversario</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="text-red-400" size={16} />
                <span>Punti Vita: {gameState.enemyHP}/8000</span>
              </div>
              <Progress value={(gameState.enemyHP / 8000) * 100} className="h-2" />
              
              <div className="flex items-center gap-2">
                <Zap className="text-purple-400" size={16} />
                <span>Mana: {gameState.enemyMana}/{gameState.maxMana}</span>
              </div>
              <Progress value={(gameState.enemyMana / gameState.maxMana) * 100} className="h-2" />
            </div>
          </Card>
        </div>

        {/* Campo di battaglia */}
        <GameBoard 
          playerField={playerField}
          enemyField={enemyField}
          onAttack={attackWithMonster}
        />

        {/* Mano del giocatore */}
        <PlayerHand 
          cards={playerHand}
          onPlayCard={playCard}
          currentMana={gameState.playerMana}
          isPlayerTurn={gameState.currentPlayer === 'player'}
        />
      </div>
    </div>
  );
};

export default Index;
