
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

  const getZoneData = () => {
    switch (expandedZone) {
      case 'deck':
        return {
          cards: field.deck || [],
          zoneName: 'deck',
          displayName: 'Deck',
          onDrawCard: onDrawCard,
          isHidden: isEnemy, // Il deck dell'avversario dovrebbe essere nascosto
          allowActions: !isEnemy
        };
      case 'extraDeck':
        return {
          cards: field.extraDeck || [],
          zoneName: 'extraDeck',
          displayName: 'Extra Deck',
          onDrawCard: null,
          isHidden: false, // L'extra deck può essere visto
          allowActions: !isEnemy
        };
      case 'graveyard':
        return {
          cards: field.graveyard || [],
          zoneName: 'graveyard',
          displayName: 'Graveyard',
          onDrawCard: null,
          isHidden: false,
          allowActions: !isEnemy
        };
      case 'banished':
        return {
          cards: field.banished || [],
          zoneName: 'banished',
          displayName: 'Banished',
          onDrawCard: null,
          isHidden: false,
          allowActions: !isEnemy
        };
      case 'banishedFaceDown':
        return {
          cards: field.banishedFaceDown || [],
          zoneName: 'banishedFaceDown',
          displayName: 'Banished Face-Down',
          onDrawCard: null,
          isHidden: true, // Sempre nascosto
          allowActions: !isEnemy
        };
      case 'fieldSpell':
        return {
          cards: field.fieldSpell || [],
          zoneName: 'fieldSpell',
          displayName: 'Field Spell',
          onDrawCard: null,
          isHidden: false,
          allowActions: !isEnemy
        };
      default:
        return {
          cards: [],
          zoneName: expandedZone,
          displayName: expandedZone,
          onDrawCard: null,
          isHidden: false,
          allowActions: false
        };
    }
  };

  const zoneData = getZoneData();

  const handleCardClick = (card, index) => {
    if (onCardPreview) {
      onCardPreview(card);
    }
  };

  const handleCardAction = (action, card, index) => {
    if (!zoneData.allowActions) return;
    
    switch (action) {
      case 'move':
        if (onCardMove) {
          onCardMove(card, zoneData.zoneName, index);
        }
        break;
      case 'draw':
        if (zoneData.onDrawCard && zoneData.zoneName === 'deck') {
          zoneData.onDrawCard();
        }
        break;
      default:
        console.log(`Action ${action} on card in ${zoneData.zoneName}`);
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-4xl max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {zoneData.displayName} ({zoneData.cards.length} carte)
          </h3>
          <button 
            onClick={() => setExpandedZone(null)}
            className="text-white hover:text-red-400 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Contenuto */}
        <div className="overflow-y-auto max-h-[60vh]">
          {zoneData.cards.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Nessuna carta in questa zona
            </div>
          ) : zoneData.isHidden ? (
            <div className="grid grid-cols-6 gap-2">
              {zoneData.cards.map((_, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] bg-blue-800 border border-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700"
                  onClick={() => handleCardClick(null, index)}
                >
                  <span className="text-white text-xs">🃏</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {zoneData.cards.map((card, index) => (
                <div
                  key={index}
                  className="aspect-[2/3] bg-gray-700 border border-gray-500 rounded-lg p-2 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => handleCardClick(card, index)}
                >
                  {card ? (
                    <div className="h-full flex flex-col">
                      <div className="text-xs text-white font-bold truncate mb-1">
                        {card.name || 'Carta Sconosciuta'}
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        {card.image ? (
                          <img 
                            src={card.image} 
                            alt={card.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-2xl">
                            {card.type === 'Monster' ? '🐉' : 
                             card.type === 'Spell' ? '⚡' : 
                             card.type === 'Trap' ? '🪤' : '🃏'}
                          </div>
                        )}
                      </div>
                      {card.attack !== undefined && card.defense !== undefined && (
                        <div className="text-xs text-gray-300 mt-1">
                          ATK/{card.attack} DEF/{card.defense}
                        </div>
                      )}
                      {zoneData.allowActions && (
                        <div className="flex justify-between mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardAction('move', card, index);
                            }}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500"
                          >
                            Sposta
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Vuoto
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {zoneData.allowActions && zoneData.cards.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="flex gap-2">
              {zoneData.zoneName === 'deck' && (
                <>
                  <button
                    onClick={() => {
                      if (zoneData.onDrawCard) zoneData.onDrawCard();
                      setExpandedZone(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                  >
                    Pesca Carta
                  </button>
                  <button
                    onClick={() => console.log('Shuffle deck')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-500"
                  >
                    Mescola
                  </button>
                </>
              )}
              <button
                onClick={() => console.log(`View all ${zoneData.zoneName}`)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Visualizza Tutto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneExpansionModal;
