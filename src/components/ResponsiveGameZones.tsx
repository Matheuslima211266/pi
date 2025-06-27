
import React, { useState, useCallback, useMemo } from 'react';
import { Sword, Shield, Zap, Eye, Settings, RefreshCw, Trash2, RotateCw } from 'lucide-react';
import ResponsiveGameZoneSlot from './ResponsiveGameZoneSlot';
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
  zoneType = "all",
  enemyField
}) => {
  const [placementMenu, setPlacementMenu] = useState(null);
  const [activatedEffects, setActivatedEffects] = useState(new Set());

  console.log('ResponsiveGameZones field data:', field);
  console.log('ResponsiveGameZones deadZone:', field?.deadZone || []);
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

  // Enhanced slot click handler for card placement
  const handleSlotClickWithPlacement = useCallback((zoneName, slotIndex, event) => {
    console.log('🎯 Slot clicked:', zoneName, slotIndex, 'Selected card:', selectedCardFromHand?.name);
    
    if (selectedCardFromHand && !isEnemy) {
      event.preventDefault();
      event.stopPropagation();
      
      // Check if slot is empty
      const currentCard = field[zoneName]?.[slotIndex];
      if (currentCard) {
        console.log('❌ Slot occupied by:', currentCard.name);
        return;
      }
      
      // Handle different card types and zones
      if (zoneName === 'monsters') {
        // Show placement menu for monsters (Attack/Defense/Face-down)
        const rect = event.currentTarget.getBoundingClientRect();
        setPlacementMenu({
          zoneName,
          slotIndex,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          card: selectedCardFromHand,
          options: [
            { key: 'attack', label: 'Attack Position', icon: <Sword size={16} /> },
            { key: 'defense', label: 'Defense Position', icon: <Shield size={16} /> },
            { key: 'facedown', label: 'Face-down Defense', icon: <Eye size={16} /> }
          ]
        });
      } else if (zoneName === 'spellsTraps') {
        // Show placement menu for spells/traps (Activate/Set)
        const rect = event.currentTarget.getBoundingClientRect();
        setPlacementMenu({
          zoneName,
          slotIndex,
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
          card: selectedCardFromHand,
          options: [
            { key: 'activate', label: 'Activate', icon: <Zap size={16} /> },
            { key: 'set', label: 'Set Face-down', icon: <Eye size={16} /> }
          ]
        });
      } else {
        // Direct placement for other zones
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, false);
      }
    } else {
      // Normal slot click behavior
      handleSlotClick(zoneName, slotIndex, event);
    }
  }, [selectedCardFromHand, isEnemy, field, onCardPlace, handleSlotClick]);

  // Enhanced placement choice handler
  const handlePlacementChoiceEnhanced = useCallback((choice) => {
    if (!placementMenu || !selectedCardFromHand) return;

    const { zoneName, slotIndex } = placementMenu;
    
    console.log('🎴 Placing card:', selectedCardFromHand.name, 'in', zoneName, 'with choice:', choice);
    
    switch (choice) {
      case 'attack':
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, false, 'attack');
        break;
      case 'defense':
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, false, 'defense');
        break;
      case 'facedown':
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, true, 'defense');
        break;
      case 'activate':
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, false);
        break;
      case 'set':
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, true);
        break;
      default:
        onCardPlace(selectedCardFromHand, zoneName, slotIndex, false);
    }
    
    setPlacementMenu(null);
  }, [placementMenu, selectedCardFromHand, onCardPlace]);

  // Memoize zone renders to prevent unnecessary re-renders
  const renderZone = useCallback((zoneName, cards, maxSlots = 5) => {
    const slots = Array.from({ length: maxSlots }, (_, index) => {
      const card = cards[index];
      const isHighlighted = selectedCardFromHand && !card && !isEnemy;
      
      return (
        <ResponsiveGameZoneSlot
          key={`${zoneName}-${index}`}
          card={card}
          zoneName={zoneName}
          slotIndex={index}
          icon={zoneName === 'monsters' ? <Sword size={16} /> : <Zap size={16} />}
          isHighlighted={isHighlighted}
          onSlotClick={handleSlotClickWithPlacement}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
          zoneLabel={zoneName}
          enemyField={enemyField}
        />
      );
    });

    return (
      <div className="flex gap-2 justify-center">
        {slots}
      </div>
    );
  }, [selectedCardFromHand, isEnemy, handleSlotClickWithPlacement, onCardPreview, handleFieldCardAction, handleCardClick, isEffectActivated, enemyField]);

  // Memoize field data
  const memoizedField = useMemo(() => field, [field]);

  // Render based on zone type
  if (zoneType === "monsters") {
    return (
      <div className="w-full">
        <div className="text-center mb-2">
          <span className="text-sm font-bold text-yellow-500">
            {isEnemy ? 'Enemy' : 'Player'} Monster Zone
          </span>
        </div>
        {renderZone('monsters', memoizedField?.monsters || [], 5)}
        
        {/* Placement Menu */}
        {placementMenu && (
          <div 
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl"
            style={{
              left: placementMenu.x - 100,
              top: placementMenu.y - 50,
            }}
          >
            <div className="text-xs text-gray-300 mb-2 text-center">
              Place {placementMenu.card?.name}
            </div>
            <div className="flex flex-col gap-1">
              {placementMenu.options?.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handlePlacementChoiceEnhanced(option.key)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPlacementMenu(null)}
              className="w-full mt-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  if (zoneType === "spellsTraps") {
    return (
      <div className="w-full">
        <div className="text-center mb-2">
          <span className="text-sm font-bold text-blue-500">
            {isEnemy ? 'Enemy' : 'Player'} Spell/Trap Zone
          </span>
        </div>
        {renderZone('spellsTraps', memoizedField?.spellsTraps || [], 5)}
        
        {/* Placement Menu */}
        {placementMenu && (
          <div 
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl"
            style={{
              left: placementMenu.x - 100,
              top: placementMenu.y - 50,
            }}
          >
            <div className="text-xs text-gray-300 mb-2 text-center">
              Place {placementMenu.card?.name}
            </div>
            <div className="flex flex-col gap-1">
              {placementMenu.options?.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handlePlacementChoiceEnhanced(option.key)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPlacementMenu(null)}
              className="w-full mt-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default: render all zones
  return (
    <div className="w-full space-y-4">
      {/* Monster Zone */}
      <div>
        <div className="text-center mb-2">
          <span className="text-sm font-bold text-yellow-500">
            {isEnemy ? 'Enemy' : 'Player'} Monster Zone
          </span>
        </div>
        {renderZone('monsters', memoizedField?.monsters || [], 5)}
      </div>
      
      {/* Spell/Trap Zone */}
      <div>
        <div className="text-center mb-2">
          <span className="text-sm font-bold text-blue-500">
            {isEnemy ? 'Enemy' : 'Player'} Spell/Trap Zone
          </span>
        </div>
        {renderZone('spellsTraps', memoizedField?.spellsTraps || [], 5)}
      </div>
      
      {/* Placement Menu */}
      {placementMenu && (
        <div 
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg p-2 shadow-xl"
          style={{
            left: placementMenu.x - 100,
            top: placementMenu.y - 50,
          }}
        >
          <div className="text-xs text-gray-300 mb-2 text-center">
            Place {placementMenu.card?.name}
          </div>
          <div className="flex flex-col gap-1">
            {placementMenu.options?.map((option) => (
              <button
                key={option.key}
                onClick={() => handlePlacementChoiceEnhanced(option.key)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPlacementMenu(null)}
            className="w-full mt-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameZones;
