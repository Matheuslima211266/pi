
import React, { useState, useCallback, useMemo } from 'react';
import ResponsiveGameZones from './ResponsiveGameZones';
import PlayerHand from './PlayerHand';
import ZoneManager from './ZoneManager';
import ZoneActionMenu from './ZoneActionMenu';

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
  setSelectedCardFromHand 
}) => {
  const [expandedZone, setExpandedZone] = useState(null);
  const [zoneActionMenu, setZoneActionMenu] = useState(null);

  const handleZoneClick = useCallback((zoneName, isEnemy = false, event) => {
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
  }, []);

  const handleZoneAction = useCallback((action) => {
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
        console.log(`Shuffle ${zoneName} for ${isEnemy ? 'enemy' : 'player'}`);
        break;
    }
    
    setZoneActionMenu(null);
  }, [zoneActionMenu, onDrawCard, onDeckMill]);

  const getZoneCards = useCallback((zoneName, isEnemy = false) => {
    const field = isEnemy ? enemyField : playerField;
    return field[zoneName] || [];
  }, [playerField, enemyField]);

  const handleCardPlacement = useCallback((card, zoneName, slotIndex, isFaceDown = false, position = null) => {
    console.log('🎴 Placing card:', card.name, 'in', zoneName, 'at slot', slotIndex);
    
    if (onCardPlace) {
      onCardPlace(card, zoneName, slotIndex, isFaceDown, position);
    }
    
    if (setSelectedCardFromHand) {
      setSelectedCardFromHand(null);
    }
  }, [onCardPlace, setSelectedCardFromHand]);

  const playerFieldMemo = useMemo(() => playerField, [playerField]);
  const enemyFieldMemo = useMemo(() => enemyField, [enemyField]);

  return (
    <div className="battlefield-container w-full h-full overflow-hidden">
      <style jsx>{`
        .battlefield-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transform-origin: center center;
          transition: transform 0.2s ease-in-out;
        }
        
        @media (max-width: 1200px) {
          .battlefield-container {
            transform: scale(0.8);
          }
        }
        
        @media (max-width: 800px) {
          .battlefield-container {
            transform: scale(0.6);
          }
        }
        
        .opponent-zone, .player-zone {
          flex-shrink: 0;
          padding: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        
        .center-zone {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          border: 2px solid rgba(148, 163, 184, 0.3);
          margin: 0.5rem 0;
        }
        
        .center-group {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .battle-field-label {
          font-size: 1.2rem;
          font-weight: bold;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          padding: 0.5rem 1rem;
          background: linear-gradient(45deg, #1e40af, #7c3aed);
          border-radius: 0.5rem;
          border: 2px solid #fbbf24;
        }
        
        .card-slot {
          width: 4rem;
          height: 6rem;
          border: 2px dashed rgba(148, 163, 184, 0.5);
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.8);
          transition: all 0.2s ease;
          position: relative;
        }
        
        .card-slot:hover {
          border-color: #fbbf24;
          background: rgba(59, 130, 246, 0.2);
          transform: scale(1.05);
        }
        
        .zone-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 0.25rem;
        }
        
        .zone-count {
          font-size: 0.8rem;
          color: #fbbf24;
          font-weight: bold;
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: rgba(0, 0, 0, 0.8);
          padding: 0.1rem 0.3rem;
          border-radius: 50%;
          min-width: 1.2rem;
          text-align: center;
        }
        
        .field-spell-zone {
          background: linear-gradient(135deg, #059669, #0d9488);
        }
        
        .dead-zone-slot {
          background: linear-gradient(135deg, #dc2626, #991b1b);
        }
        
        .hand-zone {
          flex-shrink: 0;
          padding: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          border-top: 1px solid rgba(148, 163, 184, 0.3);
        }
      `}</style>

      {/* Zona Avversario - Prima riga: Magie/Trappole */}
      <div className="opponent-zone">
        <ResponsiveGameZones 
          field={enemyFieldMemo}
          isEnemy={true}
          onCardClick={onCardPreview}
          onCardPlace={handleCardPlacement}
          selectedCardFromHand={null}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="spellsTraps"
          enemyField={playerFieldMemo}
        />
      </div>
      
      {/* Zona Avversario - Seconda riga: Mostri */}
      <div className="opponent-zone">
        <ResponsiveGameZones 
          field={enemyFieldMemo}
          isEnemy={true}
          onCardClick={onCardPreview}
          onCardPlace={handleCardPlacement}
          selectedCardFromHand={null}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="monsters"
          enemyField={playerFieldMemo}
        />
      </div>
      
      {/* Zona Centrale con Field Spells e Dead Zones */}
      <div className="center-zone">
        {/* Gruppo Avversario: Dead Zone + Field Spell */}
        <div className="center-group" style={{ transform: 'rotate(180deg)' }}>
          <div 
            className="card-slot dead-zone-slot cursor-pointer" 
            onClick={(e) => handleZoneClick('deadZone', true, e)}
          >
            <div className="zone-label">Dead Zone</div>
            <div className="text-2xl">💀</div>
            <div className="zone-count">{(enemyFieldMemo.deadZone || []).length}</div>
          </div>
          <div 
            className="card-slot field-spell-zone cursor-pointer" 
            onClick={(e) => handleZoneClick('fieldSpell', true, e)}
          >
            <div className="zone-label">Field Spell</div>
            <div className="text-2xl">🏔️</div>
            <div className="zone-count">{(enemyFieldMemo.fieldSpell || []).length}</div>
          </div>
        </div>
        
        <div className="battle-field-label">BATTLE FIELD</div>
        
        {/* Gruppo Giocatore: Field Spell + Dead Zone */}
        <div className="center-group">
          <div 
            className="card-slot field-spell-zone cursor-pointer" 
            onClick={(e) => handleZoneClick('fieldSpell', false, e)}
          >
            <div className="zone-label">Field Spell</div>
            <div className="text-2xl">🏔️</div>
            <div className="zone-count">{(playerFieldMemo.fieldSpell || []).length}</div>
          </div>
          <div 
            className="card-slot dead-zone-slot cursor-pointer" 
            onClick={(e) => handleZoneClick('deadZone', false, e)}
          >
            <div className="zone-label">Dead Zone</div>
            <div className="text-2xl">💀</div>
            <div className="zone-count">{(playerFieldMemo.deadZone || []).length}</div>
          </div>
        </div>
      </div>
      
      {/* Zona Giocatore - Prima riga: Mostri */}
      <div className="player-zone">
        <ResponsiveGameZones 
          field={playerFieldMemo}
          isEnemy={false}
          onCardClick={onCardPreview}
          onCardPlace={handleCardPlacement}
          selectedCardFromHand={selectedCardFromHand}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="monsters"
          enemyField={enemyFieldMemo}
        />
      </div>
      
      {/* Zona Giocatore - Seconda riga: Magie/Trappole */}
      <div className="player-zone">
        <ResponsiveGameZones 
          field={playerFieldMemo}
          isEnemy={false}
          onCardClick={onCardPreview}
          onCardPlace={handleCardPlacement}
          selectedCardFromHand={selectedCardFromHand}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          onDrawCard={onDrawCard}
          onDeckMill={onDeckMill}
          zoneType="spellsTraps"
          enemyField={enemyFieldMemo}
        />
      </div>

      {/* Mano Giocatore - SOLO QUESTA */}
      <div className="hand-zone">
        <PlayerHand 
          cards={playerHand}
          onPlayCard={setSelectedCardFromHand}
          isPlayerTurn={true}
          onCardPreview={onCardPreview}
          onCardMove={onCardMove}
          onShowCard={() => {}}
          onShowHand={() => {}}
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
      
      {/* Zone Manager Modals */}
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
      
      {expandedZone === 'enemy_deadZone' && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <ZoneManager
              cards={getZoneCards('deadZone', true)}
              zoneName="deadZone"
              onCardMove={onCardMove}
              onCardPreview={onCardPreview}
              isExpanded={true}
              onToggleExpand={() => setExpandedZone(null)}
            />
          </div>
        </div>
      )}
      
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
      
      {expandedZone === 'enemy_fieldSpell' && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <ZoneManager
              cards={getZoneCards('fieldSpell', true)}
              zoneName="fieldSpell"
              onCardMove={onCardMove}
              onCardPreview={onCardPreview}
              isExpanded={true}
              onToggleExpand={() => setExpandedZone(null)}
            />
          </div>
        </div>
      )}
      
      {/* Indicatore carta selezionata */}
      {selectedCardFromHand && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-900/90 border border-blue-400 rounded px-4 py-2 z-20">
          <p className="text-sm text-gray-300 text-center">
            Click on an empty slot to place <strong>{selectedCardFromHand.name}</strong>
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Monster zones: Attack/Defense position | Spell/Trap zones: Activate/Set
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameBoard;
