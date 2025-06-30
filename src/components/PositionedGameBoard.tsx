import React from 'react';
import { Card } from '@/components/ui/card';
import PositionedGameZones from './PositionedGameZones';
import { useScreenCalculations } from './PositionCalculator';

const PositionedGameBoard = ({ playerField, enemyField, onAttack, onCardPlace, selectedCardFromHand, onCardPreview, onCardMove, onDrawCard }) => {
  const calculations = useScreenCalculations();
  
  return (
    <div className="relative w-full h-full bg-background" style={{ aspectRatio: '16/9' }}>
      {/* Campo avversario */}
      <div 
        className="absolute"
        style={{
          left: `${(calculations.fieldZones.enemyMonsters.x / 1920) * 100}%`,
          top: `${(calculations.fieldZones.enemyMonsters.y / 1080) * 100}%`,
          width: `${(calculations.fieldZones.enemyMonsters.width / 1920) * 100}%`,
          height: `${((calculations.fieldZones.enemySpells.y + calculations.fieldZones.enemySpells.height - calculations.fieldZones.enemyMonsters.y) / 1080) * 100}%`,
          transform: 'rotate(180deg)'
        }}
      >
        <PositionedGameZones 
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
      
      {/* Linea di separazione centrale */}
      <div 
        className="absolute border-t-2 border-border"
        style={{
          left: '10%',
          top: '50%',
          width: '80%',
          transform: 'translateY(-50%)'
        }}
      >
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-background text-foreground px-3 py-1 rounded text-sm font-semibold">
          BATTLE FIELD
        </div>
      </div>
      
      {/* Campo magico centrale */}
      <div 
        className="absolute"
        style={{
          left: `${(calculations.fieldZones.fieldSpells.x / 1920) * 100}%`,
          top: `${(calculations.fieldZones.fieldSpells.y / 1080) * 100}%`,
          width: `${(calculations.fieldZones.fieldSpells.width / 1920) * 100}%`,
          height: `${(calculations.fieldZones.fieldSpells.height / 1080) * 100}%`
        }}
      >
        {/* Renderizza campo magico qui */}
      </div>
      
      {/* Campo giocatore */}
      <div 
        className="absolute"
        style={{
          left: `${(calculations.fieldZones.playerSpells.x / 1920) * 100}%`,
          top: `${(calculations.fieldZones.playerSpells.y / 1080) * 100}%`,
          width: `${(calculations.fieldZones.playerSpells.width / 1920) * 100}%`,
          height: `${((calculations.fieldZones.playerMonsters.y + calculations.fieldZones.playerMonsters.height - calculations.fieldZones.playerSpells.y) / 1080) * 100}%`
        }}
      >
        <PositionedGameZones 
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
      
      {/* Zone laterali - Lato sinistro */}
      <div 
        className="absolute"
        style={{
          left: `${(calculations.sideZones.leftSide.deck.x / 1920) * 100}%`,
          top: `${(calculations.sideZones.leftSide.extraDeck.y / 1080) * 100}%`,
          width: `${(calculations.cardWidth / 1920) * 100}%`,
          height: `${((calculations.sideZones.leftSide.deck.y - calculations.sideZones.leftSide.extraDeck.y + calculations.cardHeight) / 1080) * 100}%`
        }}
      >
        {/* Zone manager sinistre */}
      </div>
      
      {/* Zone laterali - Lato destro */}
      <div 
        className="absolute"
        style={{
          left: `${(calculations.sideZones.rightSide.enemyBanishedFD.x / 1920) * 100}%`,
          top: `${(calculations.sideZones.rightSide.enemyBanishedFD.y / 1080) * 100}%`,
          width: `${(calculations.cardWidth / 1920) * 100}%`,
          height: `${((calculations.sideZones.rightSide.playerBanishedFD.y - calculations.sideZones.rightSide.enemyBanishedFD.y + calculations.cardHeight) / 1080) * 100}%`
        }}
      >
        {/* Zone manager destre */}
      </div>
      
      {/* Indicatore carta selezionata */}
      {selectedCardFromHand && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary/90 border border-primary rounded px-4 py-2 z-20">
          <p className="text-sm text-primary-foreground text-center">
            Click anywhere to place <strong>{selectedCardFromHand.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default PositionedGameBoard;
