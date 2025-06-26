
import React, { useState } from 'react';
import { Sword, Zap, Shield } from 'lucide-react';
import ZoneManager from './ZoneManager';
import GameZoneRenderer, { SingleSlotZoneRenderer } from './GameZoneRenderer';
import PlacementMenu from './PlacementMenu';
import { useGameZoneActions } from './GameZoneActions';

const GameZones = ({ field, isEnemy, onCardClick, onCardPlace, selectedCardFromHand, onCardMove, onCardPreview, onDrawCard }) => {
  const [activatedEffects, setActivatedEffects] = useState(new Set());
  const [expandedZone, setExpandedZone] = useState(null);
  const [placementMenu, setPlacementMenu] = useState(null);

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

  const handleZoneToggle = (zoneName) => {
    setExpandedZone(expandedZone === zoneName ? null : zoneName);
  };

  const handlePlacementChoiceWrapper = (choice) => {
    handlePlacementChoice(choice, placementMenu);
  };

  return (
    <div className="h-full flex">
      {/* Left side - Zone managers - Ultra compact sidebar */}
      <div className="w-10 flex flex-col justify-center">
        {/* Deck - Top */}
        {!isEnemy && (
          <ZoneManager
            cards={field.deck || []}
            zoneName="deck"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={expandedZone === 'deck'}
            onToggleExpand={() => handleZoneToggle('deck')}
            onDrawCard={onDrawCard}
            isCompact={true}
          />
        )}
        
        <ZoneManager
          cards={field.graveyard || []}
          zoneName="graveyard"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'graveyard'}
          onToggleExpand={() => handleZoneToggle('graveyard')}
          isCompact={true}
        />
        
        <ZoneManager
          cards={field.banished || []}
          zoneName="banished"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banished'}
          onToggleExpand={() => handleZoneToggle('banished')}
          isCompact={true}
        />
        
        <ZoneManager
          cards={field.extraDeck || []}
          zoneName="extraDeck"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'extraDeck'}
          onToggleExpand={() => handleZoneToggle('extraDeck')}
          isHidden={isEnemy}
          isCompact={true}
        />
      </div>
      
      {/* Center - Main play field - Compact and centered */}
      <div className="flex flex-col items-center justify-center">
        {/* Field Spell - Compact */}
        <SingleSlotZoneRenderer
          cards={field.fieldSpell || []}
          zoneName="fieldSpell"
          icon={<Shield className="text-purple-400" size={10} />}
          title="Field"
          selectedCardFromHand={selectedCardFromHand}
          isEnemy={isEnemy}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
        />
        
        {/* Monster Zone - Centered */}
        <GameZoneRenderer
          cards={field.monsters || []}
          zoneName="monsters"
          icon={<Sword className="text-red-400" size={12} />}
          maxCards={5}
          selectedCardFromHand={selectedCardFromHand}
          isEnemy={isEnemy}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
        />
        
        {/* Spell/Trap Zone - Centered */}
        <GameZoneRenderer
          cards={field.spellsTraps || []}
          zoneName="spellsTraps"
          icon={<Zap className="text-green-400" size={12} />}
          maxCards={5}
          selectedCardFromHand={selectedCardFromHand}
          isEnemy={isEnemy}
          onSlotClick={handleSlotClick}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardAction}
          onCardClick={handleCardClick}
          isEffectActivated={isEffectActivated}
        />
        
        {/* Banished Face Down - Compact */}
        <ZoneManager
          cards={field.banishedFaceDown || []}
          zoneName="banishedFaceDown"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banishedFaceDown'}
          onToggleExpand={() => handleZoneToggle('banishedFaceDown')}
          isCompact={true}
        />
      </div>
      
      {/* Right side - Zone managers - Ultra compact sidebar */}
      <div className="w-10 flex flex-col justify-center">
        <ZoneManager
          cards={field.banishedFaceDown || []}
          zoneName="banishedFaceDown"
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={expandedZone === 'banishedFaceDown'}
          onToggleExpand={() => handleZoneToggle('banishedFaceDown')}
          isCompact={true}
        />
      </div>

      {/* Placement menu */}
      <PlacementMenu
        placementMenu={placementMenu}
        onPlacementChoice={handlePlacementChoiceWrapper}
        onClose={() => setPlacementMenu(null)}
      />

      {/* Selected card indicator */}
      {selectedCardFromHand && !isEnemy && (
        <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-900/80 border border-blue-400 rounded px-2 py-1 z-10">
          <p className="text-xs text-gray-300 text-center">
            Click anywhere to place <strong>{selectedCardFromHand.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default GameZones;
