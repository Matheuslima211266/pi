
import React from 'react';
import GameZoneSlot from './GameZoneSlot';
import GameZoneRenderer from './GameZoneRenderer';

interface GameZonesProps {
  playerField: any;
  enemyField: any;
  onCardPreview: (card: any) => void;
  onCardMove: (card: any, fromZone: string, toZone: string, slotIndex?: number) => void;
  onDeckMill: (millCount: number, isPlayer: boolean) => void;
  onDrawCard: (isPlayer: boolean) => void;
}

const GameZones = ({ 
  playerField, 
  enemyField, 
  onCardPreview, 
  onCardMove, 
  onDeckMill, 
  onDrawCard 
}: GameZonesProps) => {
  return (
    <div className="game-zones">
      {/* Enemy Field */}
      <div className="enemy-field mb-4">
        <h3 className="text-white text-center mb-2">Enemy Field</h3>
        
        {/* Enemy Deck and Special Zones */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <GameZoneRenderer
              zoneName="deck"
              cards={enemyField.deck || []}
              title="Enemy Deck"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              onDeckMill={(count) => onDeckMill(count, false)}
              onDrawCard={() => onDrawCard(false)}
              isPlayer={false}
            />
            <GameZoneRenderer
              zoneName="graveyard"
              cards={enemyField.graveyard || []}
              title="Enemy Graveyard"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
          </div>
          
          <div className="flex gap-2">
            <GameZoneRenderer
              zoneName="banished"
              cards={enemyField.banished || []}
              title="Enemy Banished"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
            <GameZoneRenderer
              zoneName="deadZone"
              cards={enemyField.deadZone || []}
              title="Enemy Dead Zone"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
            <GameZoneRenderer
              zoneName="magia"
              cards={enemyField.magia || []}
              title="Enemy Magia"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
            <GameZoneRenderer
              zoneName="terreno"
              cards={enemyField.terreno || []}
              title="Enemy Terreno"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
          </div>
        </div>

        {/* Enemy Main Field */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {enemyField.spellsTraps?.map((card: any, index: number) => (
            <GameZoneSlot
              key={`enemy-spell-${index}`}
              card={card}
              zoneName="spellsTraps"
              slotIndex={index}
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-1">
          {enemyField.monsters?.map((card: any, index: number) => (
            <GameZoneSlot
              key={`enemy-monster-${index}`}
              card={card}
              zoneName="monsters"
              slotIndex={index}
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
          ))}
        </div>
      </div>

      {/* Player Field */}
      <div className="player-field">
        <h3 className="text-white text-center mb-2">Player Field</h3>
        
        <div className="grid grid-cols-5 gap-1 mb-2">
          {playerField.monsters?.map((card: any, index: number) => (
            <GameZoneSlot
              key={`player-monster-${index}`}
              card={card}
              zoneName="monsters"
              slotIndex={index}
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-1 mb-2">
          {playerField.spellsTraps?.map((card: any, index: number) => (
            <GameZoneSlot
              key={`player-spell-${index}`}
              card={card}
              zoneName="spellsTraps"
              slotIndex={index}
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
          ))}
        </div>

        {/* Player Deck and Special Zones */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <GameZoneRenderer
              zoneName="deck"
              cards={playerField.deck || []}
              title="Player Deck"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              onDeckMill={(count) => onDeckMill(count, true)}
              onDrawCard={() => onDrawCard(true)}
              isPlayer={true}
            />
            <GameZoneRenderer
              zoneName="graveyard"
              cards={playerField.graveyard || []}
              title="Player Graveyard"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
          </div>
          
          <div className="flex gap-2">
            <GameZoneRenderer
              zoneName="banished"
              cards={playerField.banished || []}
              title="Player Banished"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
            <GameZoneRenderer
              zoneName="deadZone"
              cards={playerField.deadZone || []}
              title="Player Dead Zone"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
            <GameZoneRenderer
              zoneName="magia"
              cards={playerField.magia || []}
              title="Player Magia"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
            <GameZoneRenderer
              zoneName="terreno"
              cards={playerField.terreno || []}
              title="Player Terreno"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameZones;
