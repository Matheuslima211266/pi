
import React, { useState } from 'react';
import ResponsiveGameZones from './ResponsiveGameZones';
import EnemyHand from './EnemyHand';
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

  console.log('ResponsiveGameBoard playerField:', playerField);
  console.log('ResponsiveGameBoard enemyField:', enemyField);

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
        console.log(`Shuffle ${zoneName} for ${isEnemy ? 'enemy' : 'player'}`);
        break;
    }
    
    setZoneActionMenu(null);
  };

  const getZoneCards = (zoneName, isEnemy = false) => {
    const field = isEnemy ? enemyField : playerField;
    const cards = field[zoneName] || [];
    console.log(`Getting cards for ${zoneName} (enemy: ${isEnemy}):`, cards);
    return cards;
  };

  return (
    <div className="battlefield-container">
      {/* Mano Avversario (Ruotata 180°) */}
      <div className="hand-zone opponent-hand">
        <EnemyHand 
          handCount={enemyHandCount}
          revealedCard={enemyRevealedCard}
          revealedHand={enemyRevealedHand}
        />
      </div>

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
          onDeckMill={onDeckMill}
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
          onDeckMill={onDeckMill}
          zoneType="monsters"
        />
      </div>
      
      {/* Zona Centrale con Field Spells e Dead Zones */}
      <div className="center-zone">
        {/* Gruppo Avversario: Dead Zone + Field Spell */}
        <div className="center-group" style={{ transform: 'rotate(180deg)' }}>
          <div 
            className="card-slot dead-zone-slot dead-zone-slot-center cursor-pointer" 
            onClick={(e) => handleZoneClick('deadZone', true, e)}
          >
            <div className="zone-label">Dead Zone</div>
            <div className="text-2xl">💀</div>
            <div className="zone-count">{(enemyField.deadZone || []).length}</div>
          </div>
          <div 
            className="card-slot field-spell-zone field-spell-slot cursor-pointer" 
            onClick={(e) => handleZoneClick('fieldSpell', true, e)}
          >
            <div className="zone-label">Field Spell</div>
            <div className="text-2xl">🏔️</div>
            <div className="zone-count">{(enemyField.fieldSpell || []).length}</div>
          </div>
        </div>
        
        <div className="battle-field-label">BATTLE FIELD</div>
        
        {/* Gruppo Giocatore: Field Spell + Dead Zone */}
        <div className="center-group">
          <div 
            className="card-slot field-spell-zone field-spell-slot cursor-pointer" 
            onClick={(e) => handleZoneClick('fieldSpell', false, e)}
          >
            <div className="zone-label">Field Spell</div>
            <div className="text-2xl">🏔️</div>
            <div className="zone-count">{(playerField.fieldSpell || []).length}</div>
          </div>
          <div 
            className="card-slot dead-zone-slot dead-zone-slot-center cursor-pointer" 
            onClick={(e) => handleZoneClick('deadZone', false, e)}
          >
            <div className="zone-label">Dead Zone</div>
            <div className="text-2xl">💀</div>
            <div className="zone-count">{(playerField.deadZone || []).length}</div>
          </div>
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
          onDeckMill={onDeckMill}
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
          onDeckMill={onDeckMill}
          zoneType="spellsTraps"
        />
      </div>

      {/* Mano Giocatore */}
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
      
      {/* Zone Manager Modals - Dead Zone only */}
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
      
      {/* Field Spell Zones */}
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
            Click anywhere to place <strong>{selectedCardFromHand.name}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameBoard;
