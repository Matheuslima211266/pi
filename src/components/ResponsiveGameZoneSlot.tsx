
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
  zoneLabel,
  className = ""
}) => {
  if (!card) {
    return (
      <div 
        className={`card-slot ${className} ${isHighlighted ? 'highlighted' : ''}`}
        onClick={(e) => onSlotClick(zoneName, slotIndex, e)}
      >
        <div className="zone-label">{zoneLabel}</div>
        <div className="text-xl opacity-60">
          {icon}
        </div>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={`card-slot ${className} relative`}>
          <div className="zone-label">{zoneLabel}</div>
          <CardComponent
            card={card}
            onClick={() => onCardClick(card)}
            isSmall={true}
            showCost={true}
            isFaceDown={card.faceDown}
          />
          {isEffectActivated(card) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/40"></div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
        <ContextMenuItem onClick={() => onCardPreview(card)} className="text-white hover:bg-gray-700">
          <Eye className="mr-2 h-4 w-4" />
          View Card
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onFieldCardAction(card, 'toHand', 'hand')} className="text-white hover:bg-gray-700">
          <ArrowUp className="mr-2 h-4 w-4" />
          Return to Hand
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onFieldCardAction(card, 'toGraveyard', 'graveyard')} className="text-white hover:bg-gray-700">
          <Skull className="mr-2 h-4 w-4" />
          Send to Graveyard
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
            <Ban className="mr-2 h-4 w-4" />
            Banish Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-gray-800 border-gray-600">
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toBanished', 'banished')} className="text-white hover:bg-gray-700">
              Banish Face-up
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toBanishedFaceDown', 'banishedFaceDown')} className="text-white hover:bg-gray-700">
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
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeckTop', 'deck_top')} className="text-white hover:bg-gray-700">
              Top of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeckBottom', 'deck_bottom')} className="text-white hover:bg-gray-700">
              Bottom of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeckShuffle', 'deck_shuffle')} className="text-white hover:bg-gray-700">
              Shuffle into Deck
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => onFieldCardAction(card, 'toExtraDeck', 'extraDeck')} className="text-white hover:bg-gray-700">
          <Star className="mr-2 h-4 w-4" />
          Add to Extra Deck
        </ContextMenuItem>

        {(zoneName === 'spellsTraps' || zoneName === 'monsters') && (
          <ContextMenuItem onClick={() => onFieldCardAction(card, 'flipCard', 'flip')} className="text-white hover:bg-gray-700">
            {card.faceDown ? '🔄 Flip Face-up' : '🔒 Set Face-down'}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ResponsiveGameZoneSlot;
