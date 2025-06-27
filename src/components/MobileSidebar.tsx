
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Activity, 
  Clock, 
  Heart, 
  Zap, 
  Users,
  Dice6,
  Calculator as CalcIcon,
  Eye,
  EyeOff,
  RotateCcw,
  Move
} from 'lucide-react';
import ChatBox from './ChatBox';
import ActionLog from './ActionLog';
import TurnTimer from './TurnTimer';
import LifePointsControl from './LifePointsControl';
import GamePhases from './GamePhases';
import DiceAndCoin from './DiceAndCoin';
import Calculator from './Calculator';

interface MobileSidebarProps {
  gameState: any;
  handlers: any;
  position?: 'center' | 'side';
}

const MobileSidebar = ({ gameState, handlers, position = 'center' }: MobileSidebarProps) => {
  const [activeTab, setActiveTab] = useState('game');

  const handlePositionChange = (card: any, newPosition: 'attack' | 'defense') => {
    console.log('[MOBILE_SIDEBAR] Position change requested:', { card, newPosition });
    
    // Trova la carta nel campo del giocatore
    const monsterSlotIndex = gameState.playerField.monsters.findIndex((monster: any) => 
      monster && monster.id === card.id
    );
    
    if (monsterSlotIndex !== -1) {
      // Aggiorna la posizione della carta localmente
      const updatedField = { ...gameState.playerField };
      updatedField.monsters = [...updatedField.monsters];
      updatedField.monsters[monsterSlotIndex] = {
        ...updatedField.monsters[monsterSlotIndex],
        position: newPosition
      };
      
      gameState.setPlayerField(updatedField);
      
      // Invia l'azione di cambio posizione tramite multiplayer
      handlers.handlePositionChange?.(card, newPosition);
    }
  };

  const baseClasses = position === 'center' 
    ? 'bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-lg shadow-2xl' 
    : 'bg-slate-900/98 backdrop-blur-md h-full border-l border-blue-500/30 shadow-2xl';

  return (
    <div className={baseClasses}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="p-3 border-b border-blue-500/20">
          <TabsList className="grid grid-cols-4 gap-1 bg-slate-800/50 p-1">
            <TabsTrigger 
              value="game" 
              className="text-xs px-2 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Zap size={14} className="mr-1" />
              Game
            </TabsTrigger>
            <TabsTrigger 
              value="field" 
              className="text-xs px-2 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Eye size={14} className="mr-1" />
              Field
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="text-xs px-2 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <MessageSquare size={14} className="mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="text-xs px-2 py-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <CalcIcon size={14} className="mr-1" />
              Tools
            </TabsTrigger>
          </TabsList>
        </div>

        <div className={`flex-1 overflow-hidden ${position === 'center' ? 'max-h-96' : ''}`}>
          <TabsContent value="game" className="h-full m-0 p-3 space-y-3">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Life Points */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="text-red-400" size={16} />
                        <span className="text-sm font-medium text-white">Life Points</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <LifePointsControl
                        playerName="You"
                        lifePoints={gameState.playerLifePoints}
                        onLifePointsChange={handlers.handleLifePointsChange}
                        color="blue"
                      />
                      <LifePointsControl
                        playerName="Enemy"
                        lifePoints={gameState.enemyLifePoints}
                        onLifePointsChange={(value) => handlers.handleLifePointsChange(value, false)}
                        color="red"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Game Phases */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-blue-400" size={16} />
                      <span className="text-sm font-medium text-white">Turn & Phase</span>
                    </div>
                    <GamePhases
                      currentPhase={gameState.currentPhase}
                      isPlayerTurn={gameState.isPlayerTurn}
                      onPhaseChange={handlers.handlePhaseChange}
                      onEndTurn={handlers.handleEndTurn}
                    />
                  </CardContent>
                </Card>

                {/* Turn Timer */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <TurnTimer 
                      timeRemaining={gameState.timeRemaining}
                      isActive={gameState.isPlayerTurn}
                      onTimeUp={() => handlers.handleEndTurn?.()}
                      onTimeChange={() => {}}
                    />
                  </CardContent>
                </Card>

                {/* Action Log */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="text-green-400" size={16} />
                      <span className="text-sm font-medium text-white">Action Log</span>
                    </div>
                    <div className="max-h-32">
                      <ActionLog actions={gameState.actionLog} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="field" className="h-full m-0 p-3">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Player Field Summary */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Your Field</h3>
                    <div className="space-y-2">
                      {gameState.playerField.monsters.map((monster: any, index: number) => 
                        monster && (
                          <div key={`monster-${index}`} className="flex items-center justify-between text-xs bg-slate-700/50 p-2 rounded">
                            <span className="text-blue-300 truncate flex-1">{monster.name}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <Badge variant={monster.position === 'attack' ? 'destructive' : 'secondary'} className="text-xs px-1 py-0">
                                {monster.position === 'attack' ? 'ATK' : 'DEF'}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => handlePositionChange(monster, 'attack')}
                                  disabled={monster.position === 'attack'}
                                >
                                  <Zap size={12} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => handlePositionChange(monster, 'defense')}
                                  disabled={monster.position === 'defense'}
                                >
                                  <Move size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                      {gameState.playerField.spellsTraps.map((spell: any, index: number) => 
                        spell && (
                          <div key={`spell-${index}`} className="flex items-center justify-between text-xs bg-slate-700/50 p-2 rounded">
                            <span className="text-purple-300 truncate">{spell.name}</span>
                            <Badge variant="outline" className="text-xs">S/T</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Enemy Field Summary */}
                <Card className="bg-slate-800/50 border-red-500/20">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Opponent Field</h3>
                    <div className="space-y-2">
                      {gameState.enemyField.monsters.map((monster: any, index: number) => 
                        monster && (
                          <div key={`enemy-monster-${index}`} className="flex items-center justify-between text-xs bg-slate-700/50 p-2 rounded">
                            <span className="text-red-300 truncate flex-1">{monster.name}</span>
                            <Badge variant={monster.position === 'attack' ? 'destructive' : 'secondary'} className="text-xs px-1 py-0">
                              {monster.position === 'attack' ? 'ATK' : 'DEF'}
                            </Badge>
                          </div>
                        )
                      )}
                      {gameState.enemyField.spellsTraps.map((spell: any, index: number) => 
                        spell && (
                          <div key={`enemy-spell-${index}`} className="flex items-center justify-between text-xs bg-slate-700/50 p-2 rounded">
                            <span className="text-red-300 truncate">{spell.name}</span>
                            <Badge variant="outline" className="text-xs">S/T</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="h-full m-0 p-3">
            <Card className="bg-slate-800/50 border-blue-500/20 h-full">
              <CardContent className="p-3 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="text-blue-400" size={16} />
                  <span className="text-sm font-medium text-white">Chat</span>
                </div>
                <div className={position === 'center' ? 'h-64' : 'h-full'}>
                  <ChatBox
                    messages={gameState.chatMessages}
                    onSendMessage={handlers.handleSendMessage}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="h-full m-0 p-3">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {/* Dice and Coin */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Dice6 className="text-yellow-400" size={16} />
                      <span className="text-sm font-medium text-white">Dice & Coin</span>
                    </div>
                    <DiceAndCoin 
                      onDiceRoll={() => {}}
                      onCoinFlip={() => {}}
                    />
                  </CardContent>
                </Card>

                {/* Calculator */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CalcIcon className="text-green-400" size={16} />
                      <span className="text-sm font-medium text-white">Calculator</span>
                    </div>
                    <div className="max-h-64">
                      <Calculator />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-slate-800/50 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-purple-400" size={16} />
                      <span className="text-sm font-medium text-white">Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handlers.handleShowCard?.()}
                      >
                        <Eye size={12} className="mr-1" />
                        Show Card
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handlers.handleShowHand?.()}
                      >
                        <EyeOff size={12} className="mr-1" />
                        Show Hand
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileSidebar;
