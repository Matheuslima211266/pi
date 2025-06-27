
import React from 'react';
import { Card } from '@/components/ui/card';
import GameZones from './GameZones';

const GameBoard = ({ playerField, enemyField, onAttack, onCardPlace, selectedCardFromHand, onCardPreview, onCardMove, onDrawCard, onDeckMill }) => {
  return (
    <div className="h-full overflow-auto">
      <Card className="bg-slate-800/50 border border-slate-600 min-h-full">
        <div className="min-h-full flex flex-col">
          {/* Campo avversario - Compressed */}
          <div className="min-h-[45vh] transform rotate-180 overflow-auto">
            <GameZones 
              playerField={enemyField}
              enemyField={playerField}
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              onDeckMill={onDeckMill}
              onDrawCard={onDrawCard}
            />
          </div>
          
          {/* Linea di separazione - Minimized */}
          <div className="border-t border-slate-600 relative">
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-slate-700 text-white px-2 py-0.5 rounded text-xs font-semibold">
              BATTLE FIELD
            </div>
          </div>
          
          {/* Campo giocatore - Compressed */}
          <div className="min-h-[45vh] overflow-auto">
            <GameZones 
              playerField={playerField}
              enemyField={enemyField}
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              onDeckMill={onDeckMill}
              onDrawCard={onDrawCard}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameBoard;
