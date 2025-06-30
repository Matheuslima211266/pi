import React, { useState } from 'react';
import { dbg } from '@/lib/debug';
import ResponsiveGameZones from './ResponsiveGameZones';
import EnemyHand from './EnemyHand';
import PlayerHand from './PlayerHand';
import ZoneManager from './ZoneManager';
import ZoneActionMenu from './ZoneActionMenu';
import CentralToolsBar from './CentralToolsBar';

const ResponsiveGameBoard = ({ 
  playerField, 
  enemyField, 
  playerHand,
  enemyHandCount,
  enemyRevealedCard,
  enemyRevealedHand,
  onAttack, 
  onCardPlace, 
  selectedCardFromHand, 
  onCardPreview, 
  onCardMove,
  onDeckMill,
  onDrawCard,
  setSelectedCardFromHand,
  enemyLifePoints,
  playerLifePoints,
  onLifePointsChange,
  currentPhase,
  onPhaseChange,
  onEndTurn,
  isPlayerTurn,
  onCreateToken,
  onDealDamage,
  currentTurnPlayerId,
  myPlayerId
}) => {
  const [expandedZone, setExpandedZone] = useState(null);
  const [zoneActionMenu, setZoneActionMenu] = useState(null);

  dbg('🎮 [RGameBoard] render', {
    playerField: JSON.parse(JSON.stringify(playerField)),
    enemyField: JSON.parse(JSON.stringify(enemyField)),
    playerHandSize: playerHand?.length || 0,
    selectedCardFromHand: selectedCardFromHand,
    playerMonsters: Array.isArray(playerField?.monsters) ? playerField.monsters.filter(c => c !== null).length : 0,
    playerSpellsTraps: Array.isArray(playerField?.spellsTraps) ? playerField.spellsTraps.filter(c => c !== null).length : 0,
    enemyMonsters: Array.isArray(enemyField?.monsters) ? enemyField.monsters.filter(c => c !== null).length : 0,
    enemySpellsTraps: Array.isArray(enemyField?.spellsTraps) ? enemyField.spellsTraps.filter(c => c !== null).length : 0,
    timestamp: Date.now()
  });

  // Debug per ogni carta nel campo player
  if (Array.isArray(playerField?.monsters)) {
    playerField.monsters.forEach((card, index) => {
      if (card) {
        dbg(`🎮 [RGameBoard] Player monster slot ${index}:`, {
          card: card,
          cardId: card.id,
          cardName: card.name,
          position: card.position,
          faceDown: card.faceDown,
          zone: card.zone,
          slotIndex: card.slotIndex
        });
      }
    });
  }

  // Debug per ogni carta nel campo enemy
  if (Array.isArray(enemyField?.monsters)) {
    enemyField.monsters.forEach((card, index) => {
      if (card) {
        dbg(`🎮 [RGameBoard] Enemy monster slot ${index}:`, {
          card: card,
          cardId: card.id,
          cardName: card.name,
          position: card.position,
          faceDown: card.faceDown,
          zone: card.zone,
          slotIndex: card.slotIndex
        });
      }
    });
  }

  const handleZoneClick = (zoneName, isEnemy = false, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setZoneActionMenu({
      zoneName,
      isEnemy,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  };

  const handleZoneAction = (action) => {
    const { zoneName, isEnemy } = zoneActionMenu;
    
    switch (action) {
      case 'view':
        const zoneKey = isEnemy ? `enemy_${zoneName}` : zoneName;
        setExpandedZone(zoneKey);
        break;
      case 'draw':
        if (!isEnemy) onDrawCard && onDrawCard();
        break;
      case 'mill':
        if (!isEnemy) onDeckMill && onDeckMill(1);
        break;
      case 'mill3':
        if (!isEnemy) onDeckMill && onDeckMill(3);
        break;
      case 'shuffle':
        dbg(`Shuffle ${zoneName} for ${isEnemy ? 'enemy' : 'player'}`);
        break;
    }
    
    setZoneActionMenu(null);
  };

  const getZoneCards = (zoneName, isEnemy = false) => {
    const field = isEnemy ? enemyField : playerField;
    const cards = Array.isArray(field?.[zoneName]) ? field[zoneName] : [];
    dbg(`Getting cards for ${zoneName} (enemy: ${isEnemy}):`, cards);
    return cards;
  };

  const handleCardSelect = (card) => {
    setSelectedCardFromHand(card);
  };

  return (
    <div className="battlefield-container flex flex-col w-full max-w-none" style={{ gap: 'var(--field-zone-gap)' }}>
      {/* Mano Avversario (Ruotata 180°) */}
      <div className="hand-zone opponent-hand">
        <EnemyHand 
          handCount={enemyHandCount}
          revealedCard={enemyRevealedCard}
          revealedHand={enemyRevealedHand}
        />
      </div>

      {/* Zona Avversario - Prima riga: Magie/Trappole */}
      <div className="opponent-zone gap-x-[1px]">
        <ResponsiveGameZones 
          field={enemyField}
          isEnemy={true}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={null}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="spellsTraps"
          enemyField={playerField}
          onDealDamage={onDealDamage}
        />
      </div>
      
      {/* Zona Avversario - Seconda riga: Mostri */}
      <div className="opponent-zone gap-x-[1px]">
        <ResponsiveGameZones 
          field={enemyField}
          isEnemy={true}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={null}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="monsters"
          enemyField={playerField}
          onDealDamage={onDealDamage}
        />
      </div>
      
      {/* Barra centrale tools */}
      <CentralToolsBar
        enemyLifePoints={enemyLifePoints}
        playerLifePoints={playerLifePoints}
        onLifePointsChange={onLifePointsChange}
        currentPhase={currentPhase}
        onPhaseChange={onPhaseChange}
        onEndTurn={onEndTurn}
        isPlayerTurn={isPlayerTurn}
        onCreateToken={onCreateToken}
        currentTurnPlayerId={currentTurnPlayerId}
        myPlayerId={myPlayerId}
      />
      
      {/* Spazio minimo tra campo avversario e player */}
      <div className="h-px" />
      
      {/* Zona Giocatore - Prima riga: Mostri */}
      <div className="player-zone gap-x-[1px]">
        <ResponsiveGameZones 
          field={playerField}
          isEnemy={false}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={selectedCardFromHand}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="monsters"
          enemyField={enemyField}
          onDealDamage={onDealDamage}
        />
      </div>
      
      {/* Zona Giocatore - Seconda riga: Magie/Trappole */}
      <div className="player-zone gap-x-[1px]">
        <ResponsiveGameZones 
          field={playerField}
          isEnemy={false}
          onCardClick={onCardPreview}
          onCardPlace={onCardPlace}
          selectedCardFromHand={selectedCardFromHand}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="spellsTraps"
          enemyField={enemyField}
          onDealDamage={onDealDamage}
        />
      </div>

      {/* Zone Action Menu */}
      {zoneActionMenu && (
        <ZoneActionMenu
          zoneName={zoneActionMenu.zoneName}
          onAction={handleZoneAction}
          onClose={() => setZoneActionMenu(null)}
          position={zoneActionMenu.position}
        />
      )}
      
      {/* Zone Manager Modals - Dead Zone and Field */}
      {expandedZone === 'deadZone' && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <ZoneManager
              cards={getZoneCards('deadZone', false)}
              zoneName="deadZone"
              onCardMove={onCardMove}
              onCardPreview={onCardPreview}
              isExpanded={true}
              onToggleExpand={() => setExpandedZone(null)}
            />
          </div>
        </div>
      )}
      
      {/* Field Spell Zone */}
      {expandedZone === 'fieldSpell' && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <ZoneManager
              cards={getZoneCards('fieldSpell', false)}
              zoneName="fieldSpell"
              onCardMove={onCardMove}
              onCardPreview={onCardPreview}
              isExpanded={true}
              onToggleExpand={() => setExpandedZone(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameBoard;
