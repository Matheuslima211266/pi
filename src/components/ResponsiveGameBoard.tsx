
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
    <div className="w-full h-full flex flex-col">
      {/* Zona Avversario */}
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
        />
      </div>
      
      {/* Zona Centrale - Field Spells */}
      <div className="center-zone">
        <div className="field-spell-slot card-slot">
          {/* Campo magico centrale */}
          <div className="text-purple-400 text-xs">FIELD</div>
        </div>
      </div>
      
      {/* Zona Giocatore */}
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
