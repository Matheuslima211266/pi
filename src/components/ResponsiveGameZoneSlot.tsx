
import React, { useState } from 'react';
import CardComponent from './CardComponent';
import SlotPopupMenu from './SlotPopupMenu';

const ResponsiveGameZoneSlot = ({ 
  card, 
  zoneName, 
  slotIndex, 
  icon, 
  isHighlighted, 
  onSlotClick, 
  onCardPreview, 
  onFieldCardAction, 
  onCardClick, 
  isEffectActivated,
  zoneLabel 
}) => {
  const [popupMenu, setPopupMenu] = useState(null);

  const handleRightClick = (e) => {
    if (card) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = e.currentTarget.getBoundingClientRect();
      setPopupMenu({
        card,
        zoneName,
        slotIndex,
        position: {
          x: e.clientX,
          y: e.clientY
        }
      });
    }
  };

  const handlePopupAction = (action, card, destination) => {
    console.log('Popup action:', action, card, destination);
    
    switch (action) {
      case 'preview':
        onCardPreview && onCardPreview(card);
        break;
      case 'toHand':
        onFieldCardAction && onFieldCardAction(card, 'toHand', 'hand');
        break;
      case 'toGraveyard':
        onFieldCardAction && onFieldCardAction(card, 'toGraveyard', 'graveyard');
        break;
      case 'toBanished':
        onFieldCardAction && onFieldCardAction(card, 'toBanished', 'banished');
        break;
      case 'toBanishedFaceDown':
        onFieldCardAction && onFieldCardAction(card, 'toBanishedFaceDown', 'banishedFaceDown');
        break;
      case 'toDeckTop':
        onFieldCardAction && onFieldCardAction(card, 'toDeckTop', 'deck_top');
        break;
      case 'toDeckBottom':
        onFieldCardAction && onFieldCardAction(card, 'toDeckBottom', 'deck_bottom');
        break;
      case 'toDeckShuffle':
        onFieldCardAction && onFieldCardAction(card, 'toDeckShuffle', 'deck_shuffle');
        break;
      case 'toExtraDeck':
        onFieldCardAction && onFieldCardAction(card, 'toExtraDeck', 'extraDeck');
        break;
      case 'toField':
        onFieldCardAction && onFieldCardAction(card, 'toField', destination);
        break;
      case 'flipCard':
        onFieldCardAction && onFieldCardAction(card, 'flipCard', 'flip');
        break;
      case 'changePosition':
        onFieldCardAction && onFieldCardAction(card, 'changePosition', 'position');
        break;
    }
  };

  const handlePositionChange = (card, newPosition) => {
    console.log('Position change requested:', card.name, 'to', newPosition);
    onFieldCardAction && onFieldCardAction({ ...card, position: newPosition }, 'changePosition', 'position');
  };

  if (!card) {
    return (
      <div 
        className={`w-12 h-16 border border-dashed rounded flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all text-xs
          ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
          hover:border-blue-400 hover:bg-blue-400/10`}
        onClick={(e) => onSlotClick(zoneName, slotIndex, e)}
      >
        <div className="text-gray-600 text-center">
          {typeof icon === 'string' ? icon : '🃏'}
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="relative cursor-pointer" 
        onContextMenu={handleRightClick}
        onClick={() => onCardClick && onCardClick(card)}
      >
        <CardComponent
          card={card}
          onClick={() => onCardClick && onCardClick(card)}
          isSmall={true}
          showCost={false}
          isFaceDown={card.faceDown}
          position={card.position}
          onPositionChange={zoneName === 'monsters' ? handlePositionChange : null}
        />
        {isEffectActivated && isEffectActivated(card) && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
        )}
      </div>

      {popupMenu && (
        <SlotPopupMenu
          card={popupMenu.card}
          zoneName={popupMenu.zoneName}
          onAction={handlePopupAction}
          onClose={() => setPopupMenu(null)}
          position={popupMenu.position}
        />
      )}
    </>
  );
};

export default ResponsiveGameZoneSlot;
