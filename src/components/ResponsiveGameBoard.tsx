
import React from 'react';
import ResponsiveGameZones from './ResponsiveGameZones';

const ResponsiveGameBoard = ({ 
  playerField, 
  enemyField, 
  onAttack, 
  onCardPlace, 
  selectedCardFromHand, 
  onCardPreview, 
  onCardMove, 
  onDrawCard 
}) => {
  return (
    <div className="battlefield-container">
      {/* Zona Avversario - Prima riga: Magie/Trappole */}
      <div className="opponent-zone">
        <ResponsiveGameZones 
          field={enemyField}
          isEnemy={true}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={null}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          zoneType="spellsTraps"
        />
      </div>
      
      {/* Zona Avversario - Seconda riga: Mostri */}
      <div className="opponent-zone">
        <ResponsiveGameZones 
          field={enemyField}
          isEnemy={true}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={null}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          zoneType="monsters"
        />
      </div>
      
      {/* Zona Centrale - Field Spells */}
      <div className="center-zone">
        <div className="card-slot field-spell-zone field-spell-slot">
          <div className="zone-label">Field Spell</div>
          <div className="text-2xl">🏔️</div>
        </div>
        
        <div className="battle-field-label">BATTLE FIELD</div>
        
        <div className="card-slot field-spell-zone field-spell-slot">
          <div className="zone-label">Field Spell</div>
          <div className="text-2xl">🏔️</div>
        </div>
      </div>
      
      {/* Zona Giocatore - Prima riga: Mostri */}
      <div className="player-zone">
        <ResponsiveGameZones 
          field={playerField}
          isEnemy={false}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={selectedCardFromHand}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          zoneType="monsters"
        />
      </div>
      
      {/* Zona Giocatore - Seconda riga: Magie/Trappole */}
      <div className="player-zone">
        <ResponsiveGameZones 
          field={playerField}
          isEnemy={false}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={selectedCardFromHand}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          zoneType="spellsTraps"
        />
      </div>
      
      {/* Indicatore carta selezionata */}
      {selectedCardFromHand && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-900/90 border border-blue-400 rounded px-4 py-2 z-20">
          <p className="text-sm text-gray-300 text-center">
            Click anywhere to place <strong>{selectedCardFromHand.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameBoard;
