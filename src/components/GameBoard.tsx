
import React from 'react';
import { Card } from '@/components/ui/card';
import GameZones from './GameZones';

const GameBoard = ({ playerField, enemyField, onAttack, onCardPlace, selectedCardFromHand, onCardPreview, onCardMove, onDrawCard }) => {
  return (
    <div className="h-full">
      <Card className="bg-slate-800/50 border border-slate-600 p-4 h-full">
        <div className="h-full flex flex-col">
          {/* Campo avversario */}
          <div className="flex-1 transform rotate-180">
            <GameZones 
              field={enemyField}
              isEnemy={true}
              onCardClick={onCardPreview}
              onCardPlace={onCardPlace}
              selectedCardFromHand={null}
              onCardMove={onCardMove}
              onCardPreview={onCardPreview}
              onDrawCard={onDrawCard}
            />
          </div>
          
          {/* Linea di separazione */}
          <div className="border-t border-slate-600 my-2 relative">
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-slate-700 text-white px-3 py-1 rounded text-xs font-semibold">
              BATTLE FIELD
            </div>
          </div>
          
          {/* Campo giocatore */}
          <div className="flex-1">
            <GameZones 
              field={playerField}
              isEnemy={false}
              onCardClick={onCardPreview}
              onCardPlace={onCardPlace}
              selectedCardFromHand={selectedCardFromHand}
              onCardMove={onCardMove}
              onCardPreview={onCardPreview}
              onDrawCard={onDrawCard}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameBoard;
