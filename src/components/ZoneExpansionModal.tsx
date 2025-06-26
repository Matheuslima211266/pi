
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

  return (
    <div className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-black/50" onClick={() => setExpandedZone(null)} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        {expandedZone === 'deck' && (
          <ZoneManager
            cards={field.deck || []}
            zoneName="deck"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={true}
            onToggleExpand={() => setExpandedZone(null)}
            onDrawCard={onDrawCard}
          />
        )}
        
        {expandedZone === 'extraDeck' && (
          <ZoneManager
            cards={field.extraDeck || []}
            zoneName="extraDeck"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={true}
            onToggleExpand={() => setExpandedZone(null)}
            isHidden={isEnemy}
          />
        )}
        
        {expandedZone === 'banished' && (
          <ZoneManager
            cards={field.banished || []}
            zoneName="banished"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={true}
            onToggleExpand={() => setExpandedZone(null)}
          />
        )}
        
        {expandedZone === 'banishedFaceDown' && (
          <ZoneManager
            cards={field.banishedFaceDown || []}
            zoneName="banishedFaceDown"
            onCardMove={onCardMove}
            onCardPreview={onCardPreview}
            isExpanded={true}
            onToggleExpand={() => setExpandedZone(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ZoneExpansionModal;
