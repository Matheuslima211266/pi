import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import CardComponent from './CardComponent';
import { 
  MODAL_CARD_COLS, 
  MODAL_CARD_SIZE_PX, 
  MODAL_CARD_GAP_PX, 
  MODAL_IMAGE_ONLY, 
  MODAL_CARD_SCALE, 
  MODAL_EXPANDED_WIDTH_PERC, 
  MODAL_EXPANDED_HEIGHT_PERC, 
  SIDEBAR_WIDTH_PX, 
  MODAL_POSITION, 
  FIELD_SIDEBAR_GAP_PX,
  MODAL_HEADER_FOOTER_HEIGHT_PX,
  MAX_MONSTER_SLOTS,
  MAX_SPELL_TRAP_SLOTS
} from '@/config/dimensions';

const ZoneExpansionModal = ({ 
  expandedZone, 
  field, 
  isEnemy, 
  onCardMove, 
  onCardPreview, 
  onDrawCard, 
  setExpandedZone 
}) => {
  const [selectedCards, setSelectedCards] = useState(new Set());

  if (!expandedZone) return null;

  console.log('=== ZONE EXPANSION MODAL DEBUG ===');
  console.log('expandedZone:', expandedZone);
  console.log('field:', field);
  console.log('field.deadZone:', field?.deadZone);
  console.log('field.deadZone length:', field?.deadZone?.length);
  console.log('field keys:', field ? Object.keys(field) : 'no field');

  const getZoneData = () => {
    // Assicuriamoci che ogni zona abbia sempre un array valido
    const safeGetZoneCards = (zoneName) => {
      const zoneCards = field?.[zoneName];
      if (!zoneCards) {
        console.warn(`Zone ${zoneName} is undefined or null, returning empty array`);
        return [];
      }
      if (!Array.isArray(zoneCards)) {
        console.warn(`Zone ${zoneName} is not an array:`, typeof zoneCards, zoneCards);
        return [];
      }
      // Filtra eventuali valori null/undefined
      return zoneCards.filter(card => card != null);
    };

    const zoneConfigs = {
      deck: {
        cards: safeGetZoneCards('deck'),
        zoneName: 'deck',
        displayName: 'Deck',
        onDrawCard: onDrawCard,
        isHidden: isEnemy,
        allowActions: !isEnemy
      },
      extraDeck: {
        cards: safeGetZoneCards('extraDeck'),
        zoneName: 'extraDeck',
        displayName: 'Extra Deck',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      },
      deadZone: {
        cards: safeGetZoneCards('deadZone'),
        zoneName: 'deadZone',
        displayName: 'Dead Zone',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      },
      banished: {
        cards: safeGetZoneCards('banished'),
        zoneName: 'banished',
        displayName: 'Banished',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      },
      banishedFaceDown: {
        cards: safeGetZoneCards('banishedFaceDown'),
        zoneName: 'banishedFaceDown',
        displayName: 'Banished Face Down',
        onDrawCard: null,
        isHidden: true,
        allowActions: !isEnemy
      },
      fieldSpell: {
        cards: safeGetZoneCards('fieldSpell'),
        zoneName: 'fieldSpell',
        displayName: 'Field Spell',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      },
      field: {
        cards: safeGetZoneCards('field'),
        zoneName: 'field',
        displayName: 'Field',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      }
    };

    const result = zoneConfigs[expandedZone] || {
      cards: [],
      zoneName: expandedZone,
      displayName: expandedZone,
      onDrawCard: null,
      isHidden: false,
      allowActions: false
    };

    console.log('getZoneData result for', expandedZone, ':', {
      ...result,
      cardsCount: result.cards.length,
      firstCard: result.cards[0]?.name || 'none'
    });
    
    return result;
  };

  const zoneData = getZoneData();

  // Funzione per controllare se il campo è pieno
  const isFieldFull = () => {
    if (!field) return true;
    
    const monsters = field.monsters || [];
    const spellsTraps = field.spellsTraps || [];
    
    // Conta quanti slot sono occupati
    const occupiedMonsterSlots = monsters.filter(card => card !== null).length;
    const occupiedSpellTrapSlots = spellsTraps.filter(card => card !== null).length;
    
    // Il campo è pieno se entrambe le zone sono piene (5 slot ciascuna)
    return occupiedMonsterSlots >= MAX_MONSTER_SLOTS && occupiedSpellTrapSlots >= MAX_SPELL_TRAP_SLOTS;
  };

  // Funzione per controllare se ci sono slot disponibili per il tipo di carta
  const hasAvailableSlots = (cardType) => {
    if (!field) return false;
    
    const monsters = field.monsters || [];
    const spellsTraps = field.spellsTraps || [];
    
    if (cardType === 'monster') {
      const occupiedMonsterSlots = monsters.filter(card => card !== null).length;
      return occupiedMonsterSlots < MAX_MONSTER_SLOTS;
    } else {
      const occupiedSpellTrapSlots = spellsTraps.filter(card => card !== null).length;
      return occupiedSpellTrapSlots < MAX_SPELL_TRAP_SLOTS;
    }
  };

  // Funzione per verificare se le carte selezionate possono essere mandate in campo
  const canMoveSelectedCardsToField = () => {
    if (selectedCards.size === 0) return false;
    
    const zoneData = getZoneData();
    const selectedCardsList = Array.from(selectedCards).map(index => zoneData.cards[index]).filter(Boolean);
    
    // Conta quanti mostri e quante magie/trappole ci sono tra le carte selezionate
    const monsterCards = selectedCardsList.filter(card => card.card_type === 'monster');
    const spellTrapCards = selectedCardsList.filter(card => card.card_type !== 'monster');
    
    // Verifica se ci sono abbastanza slot disponibili
    const canPlaceMonsters = hasAvailableSlots('monster') || monsterCards.length === 0;
    const canPlaceSpellTraps = hasAvailableSlots('spell') || spellTrapCards.length === 0;
    
    return canPlaceMonsters && canPlaceSpellTraps;
  };

  const handleCardClick = (card, index) => {
    if (card) {
      onCardPreview(card);
    }
  };

  const handleCardSelection = (card, index, event) => {
    if (!card) return;
    
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      setSelectedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    } else {
      // Single selection
      setSelectedCards(new Set([index]));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedCards.size === 0) return;
    
    const zoneData = getZoneData();
    selectedCards.forEach(index => {
      const card = zoneData.cards[index];
      if (card) {
        handleCardAction(action, card, index);
      }
    });
    
    setSelectedCards(new Set());
  };

  const handleCardAction = (action, card, index) => {
    console.log('Card action in expansion modal:', action, card?.name || 'null card', index);
    if (!zoneData.allowActions || !card) {
      console.log('Action blocked - allowActions:', zoneData.allowActions, 'card exists:', !!card);
      return;
    }
    
    switch (action) {
      case 'toHand':
        console.log('Moving card to hand:', card.name);
        if (onCardMove) {
          onCardMove(card, zoneData.zoneName, 'hand');
        }
        break;
      case 'toField':
        const targetZone = card.card_type === 'monster' ? 'monsters' : 'spellsTraps';
        console.log('Moving card to field:', card.name, 'target zone:', targetZone);
        if (onCardMove) {
          onCardMove(card, zoneData.zoneName, targetZone);
        }
        break;
      case 'toDeck':
        console.log('Moving card to deck:', card.name);
        if (onCardMove) {
          onCardMove(card, zoneData.zoneName, 'deck');
        }
        break;
      case 'toDeadZone':
        console.log('Moving card to dead zone:', card.name);
        if (onCardMove) {
          onCardMove(card, zoneData.zoneName, 'deadZone');
        }
        break;
      case 'toBanished':
        console.log('Banishing card:', card.name);
        if (onCardMove) {
          onCardMove(card, zoneData.zoneName, 'banished');
        }
        break;
      case 'draw':
        if (zoneData.onDrawCard && zoneData.zoneName === 'deck') {
          zoneData.onDrawCard();
        }
        break;
      default:
        console.log(`Unknown action ${action} on card in ${zoneData.zoneName}`);
    }
  };

  const renderCard = (card, index) => {
    const isSelected = selectedCards.has(index);
    
    return (
      <div
        key={card.id || `card-${index}`}
        className={`aspect-[2/3] bg-card border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 group relative ${
          isSelected 
            ? 'border-accent bg-accent/30 shadow-lg shadow-accent/50 scale-105' 
            : 'border-border hover:border-primary hover:bg-card/80'
        }`}
        onClick={(event) => handleCardSelection(card, index, event)}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 z-10 animate-bounce">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-accent-foreground text-xs font-bold">✓</span>
            </div>
          </div>
        )}
        
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center mb-2">
            <CardComponent
              card={card}
              onClick={() => handleCardClick(card, index)}
              isSmall={true}
              imageOnly={MODAL_IMAGE_ONLY}
              isFaceDown={false}
              position={card.position || 'attack'}
              isEnemy={false}
              onContextMenu={undefined}
              onDoubleClick={undefined}
              zoneName={zoneData.zoneName}
              slotIndex={index}
              onFieldCardAction={undefined}
              enemyField={undefined}
              onCardClick={undefined}
              zoneLabel={undefined}
            />
          </div>
          
          {MODAL_IMAGE_ONLY ? null : (
          <div className="text-xs text-foreground mb-1 text-center font-semibold truncate">
            {card.name}
          </div>
          )}
          
          {(!MODAL_IMAGE_ONLY && card.card_type === 'monster' && card.atk !== undefined && card.def !== undefined) && (
            <div className="text-xs text-muted-foreground mb-2 text-center">
              ATK/{card.atk} DEF/{card.def}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[60]" 
        onClick={() => setExpandedZone(null)} 
      />
      
      {/* Modal */}
      <div
        className={`fixed top-1/2 transform -translate-y-1/2 z-[70] bg-card border border-border rounded-lg shadow-2xl overflow-hidden ${MODAL_POSITION === 'center' ? 'left-1/2 -translate-x-1/2' : MODAL_POSITION === 'left' ? 'left-6' : ''}`}
        style={{ right: MODAL_POSITION === 'right' ? `${SIDEBAR_WIDTH_PX + FIELD_SIDEBAR_GAP_PX}px` : undefined, width: `${MODAL_EXPANDED_WIDTH_PERC}vw`, height: `${MODAL_EXPANDED_HEIGHT_PERC}vh`, maxWidth: `calc(100vw - ${SIDEBAR_WIDTH_PX + FIELD_SIDEBAR_GAP_PX}px)` }}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-card/80">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {zoneData.displayName}
            </h3>
            <div className="text-sm text-muted-foreground">
              {zoneData.cards.length} total cards
              {zoneData.isHidden && <span className="ml-2 text-primary">(Hidden)</span>}
            </div>
          </div>
          
          {/* Pulsanti di azione nella barra superiore */}
          {zoneData.allowActions && zoneData.cards.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              {selectedCards.size === 0 ? (
                <div className="text-muted-foreground text-sm">
                  💡 Select a card for actions
                </div>
              ) : isFieldFull() ? (
                <div className="text-accent text-sm">
                  ⚠️ Field is full - clear slots before moving cards
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleBulkAction('toHand')}
                    className="bg-accent text-accent-foreground px-3 py-1 rounded text-sm transition-colors"
                    title="Add to hand"
                  >
                    📋 Hand
                  </button>
                  
                  <button
                    onClick={() => handleBulkAction('toField')}
                    disabled={!canMoveSelectedCardsToField()}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      canMoveSelectedCardsToField() 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                    title={
                      canMoveSelectedCardsToField() 
                        ? 'Move to field' 
                        : 'Field is full or no cards selected'
                    }
                  >
                    ⚔️ Field
                  </button>
                  
                  <button
                    onClick={() => handleBulkAction('toDeadZone')}
                    className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm transition-colors"
                    title="Send to Graveyard"
                  >
                    💀 Graveyard
                  </button>
                  
                  <button
                    onClick={() => handleBulkAction('toBanished')}
                    className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm transition-colors"
                    title="Banish"
                  >
                    🚫 Banish
                  </button>
                  
                  {zoneData.zoneName !== 'deck' && (
                    <button
                      onClick={() => handleBulkAction('toDeck')}
                      className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm transition-colors"
                      title="Return to deck"
                    >
                      📚 Deck
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          
          <button 
            onClick={() => setExpandedZone(null)}
            className="text-foreground hover:text-destructive text-2xl font-bold p-2 hover:bg-card/80 rounded transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Debug info per sviluppo */}
        {process.env.NODE_ENV === 'development' && expandedZone === 'deadZone' && (
          <div className="p-2 bg-background text-xs text-primary border-b border-border">
            <details>
              <summary className="cursor-pointer hover:text-accent">🐛 Debug Info (click to expand)</summary>
              <div className="mt-2 space-y-1">
                <div>Field exists: {field ? '✅ YES' : '❌ NO'}</div>
                <div>Dead Zone exists: {field?.deadZone ? '✅ YES' : '❌ NO'}</div>
                <div>Dead Zone type: {typeof field?.deadZone}</div>
                <div>Dead Zone length: {field?.deadZone?.length || 'undefined'}</div>
                <div>Cards after filter: {zoneData.cards.length}</div>
                <div>First card: {zoneData.cards[0]?.name || 'none'}</div>
              </div>
            </details>
          </div>
        )}

        {/* Contenuto principale */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: `calc(${MODAL_EXPANDED_HEIGHT_PERC}vh - ${MODAL_HEADER_FOOTER_HEIGHT_PX}px)` }}>
          {zoneData.cards.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="text-4xl mb-4">📭</div>
              <div className="text-lg">No cards in this zone</div>
              <div className="text-sm mt-2">
                {expandedZone === 'deadZone' ? 
                  'Destroyed cards will appear here' : 
                  `The ${zoneData.displayName} zone is empty`
                }
              </div>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:`repeat(${MODAL_CARD_COLS}, minmax(${MODAL_CARD_SIZE_PX * MODAL_CARD_SCALE}px,1fr))`,gap:`${MODAL_CARD_GAP_PX}px`}}>
              {zoneData.isHidden ? (
                // Carte coperte
                zoneData.cards.map((_, index) => (
                  <div
                    key={`hidden-${index}`}
                    className="aspect-[2/3] bg-primary border-2 border-primary/80 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={(event) => handleCardSelection(null, index, event)}
                  >
                    <span className="text-primary-foreground text-2xl">🃏</span>
                  </div>
                ))
              ) : (
                // Carte visibili
                zoneData.cards.map((card, index) => renderCard(card, index))
              )}
            </div>
          )}
        </div>

        {/* Footer con azioni globali */}
        {zoneData.allowActions && zoneData.cards.length > 0 && (
          <div className="p-4 border-t border-border bg-card/80">
            {/* Multi-selection action panel now mostrata nella header per evitare overflow */}
            {/* Zone-specific actions */}
            <div className="flex flex-wrap gap-2">
              {zoneData.zoneName === 'deck' && (
                <>
                  <button
                    onClick={() => {
                      if (zoneData.onDrawCard) zoneData.onDrawCard();
                      setExpandedZone(null);
                    }}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80 transition-colors"
                  >
                    Draw Card
                  </button>
                  <button
                    onClick={() => {
                      if (onCardMove) {
                        const topCard = zoneData.cards[0];
                        if (topCard) {
                          onCardMove(topCard, 'deck', 'hand');
                        }
                      }
                      setExpandedZone(null);
                    }}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80 transition-colors"
                  >
                    Add Top Card to Hand
                  </button>
                </>
              )}
              
              {zoneData.zoneName === 'deadZone' && (
                <button
                  onClick={() => {
                    console.log('Shuffle dead zone into deck');
                    // Implementa la logica per rimescolare la dead zone nel deck
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors"
                >
                  🔄 Shuffle into Deck
                </button>
              )}
              
              {/* Selection instructions */}
              {selectedCards.size === 0 && (
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="text-blue-400">💡 Suggerimento:</span>
                  <span>Usa <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl</kbd> + Click per selezionare più carte e eseguire azioni multiple</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneExpansionModal;
