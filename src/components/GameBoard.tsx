
import React from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import GameZones from './GameZones';

const GameBoard = ({ playerField, enemyField, onAttack }) => {
  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-gold-400 p-6">
        <div className="space-y-8">
          {/* Campo avversario */}
          <div className="transform rotate-180">
            <GameZones 
              field={enemyField}
              isEnemy={true}
              onCardClick={(card) => console.log('Enemy card clicked:', card)}
            />
          </div>
          
          {/* Linea di separazione */}
          <div className="border-t-2 border-gold-400 mx-4 relative">
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-gold-400 text-black px-4 py-1 rounded-full font-semibold">
              CAMPO DI BATTAGLIA
            </div>
          </div>
          
          {/* Campo giocatore */}
          <GameZones 
            field={playerField}
            isEnemy={false}
            onCardClick={(card) => console.log('Player card clicked:', card)}
            onAttack={onAttack}
          />
        </div>
      </Card>
    </div>
  );
};

export default GameBoard;
