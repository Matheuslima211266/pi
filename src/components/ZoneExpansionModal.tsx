
import React from 'react';

const ZoneExpansionModal = ({ 
  expandedZone, 
  field, 
  isEnemy, 
  onCardMove, 
  onCardPreview, 
  onDrawCard, 
  setExpandedZone 
}) => {
  if (!expandedZone) return null;

  console.log('=== ZONE EXPANSION MODAL DEBUG ===');
  console.log('expandedZone:', expandedZone);
  console.log('field:', field);
  console.log('field.graveyard:', field?.graveyard);
  console.log('field.graveyard length:', field?.graveyard?.length);
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
      graveyard: {
        cards: safeGetZoneCards('graveyard'),
        zoneName: 'graveyard',
        displayName: 'Cimitero',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      },
      banished: {
        cards: safeGetZoneCards('banished'),
        zoneName: 'banished',
        displayName: 'Bandito',
        onDrawCard: null,
        isHidden: false,
        allowActions: !isEnemy
      },
      banishedFaceDown: {
        cards: safeGetZoneCards('banishedFaceDown'),
        zoneName: 'banishedFaceDown',
        displayName: 'Bandito Coperto',
        onDrawCard: null,
        isHidden: true,
        allowActions: !isEnemy
      },
      fieldSpell: {
        cards: safeGetZoneCards('fieldSpell'),
        zoneName: 'fieldSpell',
        displayName: 'Magia Campo',
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

  const handleCardClick = (card, index) => {
    console.log('Card clicked in expansion modal:', card?.name || 'null card', 'at index:', index);
    if (onCardPreview && card) {
      onCardPreview(card);
    }
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
    if (!card) {
      return (
        <div 
          key={`empty-${index}`}
          className="aspect-[2/3] bg-gray-600 border border-gray-400 rounded-lg flex items-center justify-center"
        >
          <span className="text-gray-400 text-xs">Vuoto</span>
        </div>
      );
    }

    return (
      <div
        key={card.id || `card-${index}`}
        className="aspect-[2/3] bg-gray-700 border border-gray-500 rounded-lg p-2 cursor-pointer hover:bg-gray-600 transition-colors group"
        onClick={() => handleCardClick(card, index)}
      >
        <div className="h-full flex flex-col">
          {/* Nome carta */}
          <div className="text-xs text-white font-bold truncate mb-1" title={card.name}>
            {card.name || 'Carta Sconosciuta'}
          </div>
          
          {/* Immagine o icona */}
          <div className="flex-1 flex items-center justify-center mb-2">
            {card.image ? (
              <img 
                src={card.image} 
                alt={card.name}
                className="max-w-full max-h-full object-contain rounded"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <div className="text-2xl">
                {card.card_type === 'monster' ? '🐉' : 
                 card.card_type === 'spell' ? '⚡' : 
                 card.card_type === 'trap' ? '🪤' : '🃏'}
              </div>
            )}
          </div>
          
          {/* Stats per mostri */}
          {card.card_type === 'monster' && card.atk !== undefined && card.def !== undefined && (
            <div className="text-xs text-gray-300 mb-2 text-center">
              ATK/{card.atk} DEF/{card.def}
            </div>
          )}
          
          {/* Pulsanti azione */}
          {zoneData.allowActions && (
            <div className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardAction('toHand', card, index);
                }}
                className="w-full text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500 transition-colors"
                title="Aggiungi alla mano"
              >
                📋 Mano
              </button>
              
              {zoneData.zoneName === 'graveyard' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardAction('toField', card, index);
                    }}
                    className="w-full text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-500 transition-colors"
                    title="Evoca sul campo"
                  >
                    ⚔️ Campo
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardAction('toBanished', card, index);
                    }}
                    className="w-full text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500 transition-colors"
                    title="Bandisci"
                  >
                    🚫 Bandisci
                  </button>
                </>
              )}
              
              {zoneData.zoneName !== 'deck' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardAction('toDeck', card, index);
                  }}
                  className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors"
                  title="Rimetti nel deck"
                >
                  📚 Deck
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => setExpandedZone(null)} 
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-w-6xl max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-600 bg-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">
              {zoneData.displayName}
            </h3>
            <div className="text-sm text-gray-300">
              {zoneData.cards.length} carte totali
              {zoneData.isHidden && <span className="ml-2 text-yellow-400">(Coperte)</span>}
            </div>
          </div>
          <button 
            onClick={() => setExpandedZone(null)}
            className="text-white hover:text-red-400 text-2xl font-bold p-2 hover:bg-gray-600 rounded transition-colors"
            title="Chiudi"
          >
            ×
          </button>
        </div>

        {/* Debug info per sviluppo */}
        {process.env.NODE_ENV === 'development' && expandedZone === 'graveyard' && (
          <div className="p-2 bg-gray-900 text-xs text-yellow-300 border-b border-gray-600">
            <details>
              <summary className="cursor-pointer hover:text-yellow-200">🐛 Debug Info (click to expand)</summary>
              <div className="mt-2 space-y-1">
                <div>Field exists: {field ? '✅ YES' : '❌ NO'}</div>
                <div>Graveyard exists: {field?.graveyard ? '✅ YES' : '❌ NO'}</div>
                <div>Graveyard type: {typeof field?.graveyard}</div>
                <div>Graveyard length: {field?.graveyard?.length || 'undefined'}</div>
                <div>Cards after filter: {zoneData.cards.length}</div>
                <div>First card: {zoneData.cards[0]?.name || 'none'}</div>
              </div>
            </details>
          </div>
        )}

        {/* Contenuto principale */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
          {zoneData.cards.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-4xl mb-4">📭</div>
              <div className="text-lg">Nessuna carta in questa zona</div>
              <div className="text-sm mt-2">
                {expandedZone === 'graveyard' ? 
                  'Le carte distrutte appariranno qui' : 
                  `La zona ${zoneData.displayName} è vuota`
                }
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {zoneData.isHidden ? (
                // Carte coperte
                zoneData.cards.map((_, index) => (
                  <div
                    key={`hidden-${index}`}
                    className="aspect-[2/3] bg-blue-800 border-2 border-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleCardClick(null, index)}
                  >
                    <span className="text-white text-2xl">🃏</span>
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
          <div className="p-4 border-t border-gray-600 bg-gray-700">
            <div className="flex flex-wrap gap-2">
              {zoneData.zoneName === 'deck' && (
                <>
                  <button
                    onClick={() => {
                      if (zoneData.onDrawCard) zoneData.onDrawCard();
                      setExpandedZone(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition-colors"
                  >
                    🎯 Pesca Carta
                  </button>
                  <button
                    onClick={() => {
                      console.log('Shuffle deck');
                      // Implementa la logica di mescolamento
                    }}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-500 transition-colors"
                  >
                    🔄 Mescola
                  </button>
                </>
              )}
              
              {zoneData.zoneName === 'graveyard' && (
                <button
                  onClick={() => {
                    console.log('Shuffle graveyard into deck');
                    // Implementa la logica per rimescolare il cimitero nel deck
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors"
                >
                  🔄 Rimescola nel Deck
                </button>
              )}
              
              <button
                onClick={() => console.log(`Bulk action on ${zoneData.zoneName}`)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                📋 Azioni Multiple
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneExpansionModal;
