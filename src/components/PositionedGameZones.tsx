
import React, { useState } from 'react';
import { Sword, Zap, Shield } from 'lucide-react';
import PositionedGameZoneRenderer, { PositionedSingleSlotZoneRenderer } from './PositionedGameZoneRenderer';
import PlacementMenu from './PlacementMenu';
import { useGameZoneActions } from './GameZoneActions';
import { useScreenCalculations } from './PositionCalculator';

const PositionedGameZones = ({ field, isEnemy, onCardClick, onCardPlace, selectedCardFromHand, onCardMove, onCardPreview, onDrawCard }) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [placementMenu, setPlacementMenu] = useState(null);
  const calculations = useScreenCalculations();

  const {
    handleSlotClick,
    handlePlacementChoice,
    handleFieldCardAction,
    handleCardClick,
    isEffectActivated
  } = useGameZoneActions({
    field,
    onCardPlace,
    onCardMove,
    onCardPreview,
    onCardClick,
    selectedCardFromHand,
    setPlacementMenu,
    activatedEffects,
    setActivatedEffects
  });

  const handlePlacementChoiceWrapper = (choice) => {
    handlePlacementChoice(choice, placementMenu);
  };

  // Dimensioni delle carte calcolate dinamicamente
  const cardStyle = {
    width: `${(calculations.cardWidth / 1920) * 100}vw`,
    height: `${(calculations.cardHeight / 1080) * 100}vh`,
    minWidth: '60px',
    minHeight: '84px'
  };

  return (
    <div className="relative w-full h-full">
      {/* Campo Magico */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2" style={{ marginTop: isEnemy ? '10%' : '5%' }}>
        <PositionedSingleSlotZoneRenderer
          cards={field.fieldSpell || []}
          zoneName="fieldSpell"
          icon={<Shield className="text-purple-400" size={16} />}
          title="Field"
          selectedCardFromHand={selectedCardFromHand}
          isEnemy={isEnemy}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
          cardStyle={cardStyle}
        />
      </div>
      
      {/* Zona Mostri */}
      <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: isEnemy ? '25%' : '30%' }}>
        <PositionedGameZoneRenderer
          cards={field.monsters || []}
          zoneName="monsters"
          icon={<Sword className="text-red-400" size={18} />}
          maxCards={5}
          selectedCardFromHand={selectedCardFromHand}
          isEnemy={isEnemy}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
          cardStyle={cardStyle}
        />
      </div>
      
      {/* Zona Magie/Trappole */}
      <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: isEnemy ? '60%' : '65%' }}>
        <PositionedGameZoneRenderer
          cards={field.spellsTraps || []}
          zoneName="spellsTraps"
          icon={<Zap className="text-green-400" size={18} />}
          maxCards={5}
          selectedCardFromHand={selectedCardFromHand}
          isEnemy={isEnemy}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
          cardStyle={cardStyle}
        />
      </div>

      {/* Menu di piazzamento */}
      <PlacementMenu
        placementMenu={placementMenu}
        onPlacementChoice={handlePlacementChoiceWrapper}
        onClose={() => setPlacementMenu(null)}
      />
    </div>
  );
};

export default PositionedGameZones;
