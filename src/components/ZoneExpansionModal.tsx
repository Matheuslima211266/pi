
import React from 'react';
import ZoneManager from './ZoneManager';

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
          onDrawCard: onDrawCard,
          isHidden: false
        };
      case 'extraDeck':
        return {
          cards: field.extraDeck || [],
          zoneName: 'extraDeck',
          onDrawCard: null,
          isHidden: isEnemy
        };
      case 'graveyard':
        return {
          cards: field.graveyard || [],
          zoneName: 'graveyard',
          onDrawCard: null,
          isHidden: false
        };
      case 'banished':
        return {
          cards: field.banished || [],
          zoneName: 'banished',
          onDrawCard: null,
          isHidden: false
        };
      case 'banishedFaceDown':
        return {
          cards: field.banishedFaceDown || [],
          zoneName: 'banishedFaceDown',
          onDrawCard: null,
          isHidden: false
        };
      case 'fieldSpell':
        return {
          cards: field.fieldSpell || [],
          zoneName: 'fieldSpell',
          onDrawCard: null,
          isHidden: false
        };
      default:
        return {
          cards: [],
          zoneName: expandedZone,
          onDrawCard: null,
          isHidden: false
        };
    }
  };

  const zoneData = getZoneData();

  return (
    <div className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <ZoneManager
          cards={zoneData.cards}
          zoneName={zoneData.zoneName}
          onCardMove={onCardMove}
          onCardPreview={onCardPreview}
          isExpanded={true}
          onToggleExpand={() => setExpandedZone(null)}
          onDrawCard={zoneData.onDrawCard}
          isHidden={zoneData.isHidden}
        />
      </div>
    </div>
  );
};

export default ZoneExpansionModal;
