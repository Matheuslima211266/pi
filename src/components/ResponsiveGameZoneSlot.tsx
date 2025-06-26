
import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { ArrowUp, Skull, Ban, BookOpen, Star, Eye } from 'lucide-react';
import CardComponent from './CardComponent';

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
  const handleClick = (e) => {
    e.stopPropagation();
    if (card) {
      onCardPreview?.(card);
    } else if (onSlotClick && isHighlighted) {
      onSlotClick(zoneName, slotIndex, e);
    }
  };

  const handleFieldCardAction = (action, card, zoneName, slotIndex) => {
    console.log('Field card action:', action, card?.name, zoneName, slotIndex);
    if (onFieldCardAction) {
      onFieldCardAction(action, card, zoneName, slotIndex);
    }
  };

  return (
    <div 
      className={`
        relative w-full h-full min-w-[80px] min-h-[120px]
        border-2 rounded-lg cursor-pointer transition-all duration-200
        ${card ? 'border-yellow-500 bg-slate-700' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'}
        ${isHighlighted ? 'border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-400/50' : ''}
        ${isEffectActivated ? 'ring-2 ring-purple-400' : ''}
      `}
      onClick={handleClick}
    >
      {card ? (
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="relative w-full h-full">
              <div className="w-full h-full">
                <CardComponent 
                  card={card}
                  onClick={() => onCardPreview?.(card)}
                  isPlayable={true}
                  isSmall={false}
                  showCost={false}
                  isInHand={false}
                  isFaceDown={card.faceDown}
                  position={card.position || 'attack'}
                  onPositionChange={(card, newPosition) => {
                    if (onFieldCardAction) {
                      onFieldCardAction('changePosition', { ...card, position: newPosition }, zoneName, slotIndex);
                    }
                  }}
                />
              </div>
              
              {isEffectActivated && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/40"></div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
            <ContextMenuItem onClick={() => onCardPreview?.(card)} className="text-white hover:bg-gray-700">
              <Eye className="mr-2 h-4 w-4" />
              View Card
            </ContextMenuItem>
            
            <ContextMenuItem onClick={() => handleFieldCardAction('toHand', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
              <ArrowUp className="mr-2 h-4 w-4" />
              Return to Hand
            </ContextMenuItem>
            
            <ContextMenuItem onClick={() => handleFieldCardAction('destroy', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
              <Skull className="mr-2 h-4 w-4" />
              Send to Dead Zone
            </ContextMenuItem>

            <ContextMenuSub>
              <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
                <Ban className="mr-2 h-4 w-4" />
                Banish Card
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="bg-gray-800 border-gray-600">
                <ContextMenuItem onClick={() => handleFieldCardAction('banish', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
                  Banish Face-up
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleFieldCardAction('banishFaceDown', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
                  Banish Face-down
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuSub>
              <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
                <BookOpen className="mr-2 h-4 w-4" />
                Return to Deck
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="bg-gray-800 border-gray-600">
                <ContextMenuItem onClick={() => handleFieldCardAction('toDeckTop', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
                  Top of Deck
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleFieldCardAction('toDeckBottom', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
                  Bottom of Deck
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleFieldCardAction('toDeckShuffle', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
                  Shuffle into Deck
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem onClick={() => handleFieldCardAction('toExtraDeck', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
              <Star className="mr-2 h-4 w-4" />
              Add to Extra Deck
            </ContextMenuItem>

            {(zoneName === 'spellsTraps' || zoneName === 'monsters') && (
              <ContextMenuItem onClick={() => handleFieldCardAction('flipCard', card, zoneName, slotIndex)} className="text-white hover:bg-gray-700">
                {card.faceDown ? '🔄 Flip Face-up' : '🔒 Set Face-down'}
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="text-slate-400 text-2xl mb-2">
            {typeof icon === 'string' ? icon : '⭐'}
          </div>
          {zoneLabel && (
            <div className="text-xs text-slate-400 font-medium text-center px-1">
              {zoneLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveGameZoneSlot;
