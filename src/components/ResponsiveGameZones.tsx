import React, { useState } from 'react';
import PlacementMenu from './PlacementMenu';
import ZoneActionMenu from './ZoneActionMenu';
import ZoneSlotRenderer from './ZoneSlotRenderer';
import ZoneExpansionModal from './ZoneExpansionModal';
import { useZoneClickHandler } from './ZoneClickHandler';
import { useGameZoneActions } from './GameZoneActions';
import { usePlacementMenu } from '../contexts/PlacementMenuContext';

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
  zoneType,
  enemyField,
  onDealDamage,
  onSlotClick = null
}) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const { openPlacementMenu, closePlacementMenu } = usePlacementMenu();

  const {
    handleSlotClick: localHandleSlotClick,
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
    setPlacementMenu: (menuData) => {
      if (!menuData) {
        closePlacementMenu();
      } else {
        openPlacementMenu(menuData.zoneName, menuData.slotIndex, menuData.event, menuData.card);
      }
    },
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

  // Use the global onSlotClick if provided, otherwise use local
  const handleSlotClick = onSlotClick || localHandleSlotClick;

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
        handleZoneClick={handleZoneClick}
        enemyField={enemyField}
        onDealDamage={onDealDamage}
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
