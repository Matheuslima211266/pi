
import React, { useState } from 'react';
import PlacementMenu from './PlacementMenu';
import ZoneActionMenu from './ZoneActionMenu';
import ZoneSlotRenderer from './ZoneSlotRenderer';
import ZoneExpansionModal from './ZoneExpansionModal';
import { useZoneClickHandler } from './ZoneClickHandler';
import { useGameZoneActions } from './GameZoneActions';

const ResponsiveGameZones = ({ 
  field, 
  isEnemy, 
  onCardClick, 
  onCardPlace, 
  selectedCardFromHand, 
  onCardMove, 
  onCardPreview, 
  onDrawCard,
  onDeckMill,
  zoneType 
}) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [placementMenu, setPlacementMenu] = useState(null);

  console.log('ResponsiveGameZones field data:', field);
  console.log('ResponsiveGameZones deadZone:', field?.deadZone);
  console.log('ResponsiveGameZones selectedCardFromHand:', selectedCardFromHand);

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

  const {
    zoneActionMenu,
    setZoneActionMenu,
    expandedZone,
    setExpandedZone,
    handleZoneClick,
    handleZoneAction
  } = useZoneClickHandler({
    isEnemy,
    onDrawCard,
    onDeckMill
  });

  const handlePlacementChoiceWrapper = (choice) => {
    console.log('PlacementChoiceWrapper called:', choice, placementMenu);
    handlePlacementChoice(choice, placementMenu);
  };

  // Enhanced zone click handler to support deadZone
  const enhancedHandleZoneClick = (zoneName, e) => {
    handleZoneClick(zoneName, e);
  };

  return (
    <>
      <ZoneSlotRenderer
        field={field}
        isEnemy={isEnemy}
        selectedCardFromHand={selectedCardFromHand}
        zoneType={zoneType}
        handleSlotClick={handleSlotClick}
        onCardPreview={onCardPreview}
        handleFieldCardAction={handleFieldCardAction}
        handleCardClick={handleCardClick}
        isEffectActivated={isEffectActivated}
        handleZoneClick={enhancedHandleZoneClick}
      />

      {/* Menu di piazzamento */}
      <PlacementMenu
        placementMenu={placementMenu}
        onPlacementChoice={handlePlacementChoiceWrapper}
        onClose={() => {
          console.log('Closing placement menu');
          setPlacementMenu(null);
        }}
      />

      {/* Zone Action Menu */}
      {zoneActionMenu && (
        <ZoneActionMenu
          zoneName={zoneActionMenu.zoneName}
          onAction={handleZoneAction}
          onClose={() => setZoneActionMenu(null)}
          position={zoneActionMenu.position}
        />
      )}

      {/* Zone Manager espanse */}
      <ZoneExpansionModal
        expandedZone={expandedZone}
        field={field}
        isEnemy={isEnemy}
        onCardMove={onCardMove}
        onCardPreview={onCardPreview}
        onDrawCard={onDrawCard}
        setExpandedZone={setExpandedZone}
      />
    </>
  );
};

export default ResponsiveGameZones;
