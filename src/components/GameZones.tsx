
import React from 'react';
import GameZoneSlot from './GameZoneSlot';
import GameZoneBox from './GameZoneBox';
import { Sword, Shield } from 'lucide-react';

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
  // Placeholder functions for missing handlers
  const handleSlotClick = (zoneName: string, slotIndex: number, e: React.MouseEvent) => {
    console.log('Slot clicked:', zoneName, slotIndex);
  };

  const handleFieldCardAction = (card: any, action: string, targetZone: string) => {
    onCardMove(card, card.zone || 'field', targetZone);
  };

  const handleCardClick = (card: any) => {
    onCardPreview(card);
  };

  const isEffectActivated = (card: any) => {
    return false; // Placeholder
  };

  return (
    <div className="game-zones p-2">
      {/* Enemy Field */}
      <div className="enemy-field mb-4">
        <h3 className="text-white text-center mb-2">Enemy Field</h3>
        
        {/* Enemy Deck and Special Zones */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <GameZoneBox
              zoneName="deck"
              cards={enemyField.deck || []}
              title="Enemy Deck"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              onDeckMill={(count) => onDeckMill(count, false)}
              onDrawCard={() => onDrawCard(false)}
              isPlayer={false}
            />
            <GameZoneBox
              zoneName="graveyard"
              cards={enemyField.graveyard || []}
              title="Enemy Graveyard"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
          </div>
          
          <div className="flex gap-2">
            <GameZoneBox
              zoneName="banished"
              cards={enemyField.banished || []}
              title="Enemy Banished"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
            <GameZoneBox
              zoneName="deadZone"
              cards={enemyField.deadZone || []}
              title="Enemy Dead Zone"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
            <GameZoneBox
              zoneName="magia"
              cards={enemyField.magia || []}
              title="Enemy Magia"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={false}
            />
            <GameZoneBox
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
          {Array.from({ length: 5 }, (_, index) => {
            const card = enemyField.spellsTraps?.[index];
            return (
              <GameZoneSlot
                key={`enemy-spell-${index}`}
                card={card}
                zoneName="spellsTraps"
                slotIndex={index}
                icon={<Shield size={16} />}
                isHighlighted={false}
                onSlotClick={handleSlotClick}
                onCardPreview={onCardPreview}
                onFieldCardAction={handleFieldCardAction}
                onCardClick={handleCardClick}
                isEffectActivated={isEffectActivated}
              />
            );
          })}
        </div>
        
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 5 }, (_, index) => {
            const card = enemyField.monsters?.[index];
            return (
              <GameZoneSlot
                key={`enemy-monster-${index}`}
                card={card}
                zoneName="monsters"
                slotIndex={index}
                icon={<Sword size={16} />}
                isHighlighted={false}
                onSlotClick={handleSlotClick}
                onCardPreview={onCardPreview}
                onFieldCardAction={handleFieldCardAction}
                onCardClick={handleCardClick}
                isEffectActivated={isEffectActivated}
              />
            );
          })}
        </div>
      </div>

      {/* Player Field */}
      <div className="player-field">
        <h3 className="text-white text-center mb-2">Player Field</h3>
        
        <div className="grid grid-cols-5 gap-1 mb-2">
          {Array.from({ length: 5 }, (_, index) => {
            const card = playerField.monsters?.[index];
            return (
              <GameZoneSlot
                key={`player-monster-${index}`}
                card={card}
                zoneName="monsters"
                slotIndex={index}
                icon={<Sword size={16} />}
                isHighlighted={false}
                onSlotClick={handleSlotClick}
                onCardPreview={onCardPreview}
                onFieldCardAction={handleFieldCardAction}
                onCardClick={handleCardClick}
                isEffectActivated={isEffectActivated}
              />
            );
          })}
        </div>
        
        <div className="grid grid-cols-5 gap-1 mb-2">
          {Array.from({ length: 5 }, (_, index) => {
            const card = playerField.spellsTraps?.[index];
            return (
              <GameZoneSlot
                key={`player-spell-${index}`}
                card={card}
                zoneName="spellsTraps"
                slotIndex={index}
                icon={<Shield size={16} />}
                isHighlighted={false}
                onSlotClick={handleSlotClick}
                onCardPreview={onCardPreview}
                onFieldCardAction={handleFieldCardAction}
                onCardClick={handleCardClick}
                isEffectActivated={isEffectActivated}
              />
            );
          })}
        </div>

        {/* Player Deck and Special Zones */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <GameZoneBox
              zoneName="deck"
              cards={playerField.deck || []}
              title="Player Deck"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              onDeckMill={(count) => onDeckMill(count, true)}
              onDrawCard={() => onDrawCard(true)}
              isPlayer={true}
            />
            <GameZoneBox
              zoneName="graveyard"
              cards={playerField.graveyard || []}
              title="Player Graveyard"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
          </div>
          
          <div className="flex gap-2">
            <GameZoneBox
              zoneName="banished"
              cards={playerField.banished || []}
              title="Player Banished"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
            <GameZoneBox
              zoneName="deadZone"
              cards={playerField.deadZone || []}
              title="Player Dead Zone"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
            <GameZoneBox
              zoneName="magia"
              cards={playerField.magia || []}
              title="Player Magia"
              onCardPreview={onCardPreview}
              onCardMove={onCardMove}
              isPlayer={true}
            />
            <GameZoneBox
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
