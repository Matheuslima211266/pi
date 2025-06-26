
import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { ArrowUp, Skull, Ban, BookOpen, Star, Eye } from 'lucide-react';
import CardComponent from './CardComponent';

const GameZoneSlot = ({ 
  card, 
  zoneName, 
  slotIndex, 
  icon, 
  isHighlighted, 
  onSlotClick, 
  onCardPreview, 
  onFieldCardAction, 
  onCardClick, 
  isEffectActivated 
}) => {
  if (!card) {
    return (
      <div 
        className={`w-12 h-16 border border-dashed rounded flex items-center justify-center bg-gray-800/30 cursor-pointer transition-all text-xs
          ${isHighlighted ? 'border-yellow-400 bg-yellow-400/20 animate-pulse' : 'border-gray-600'}
          hover:border-blue-400 hover:bg-blue-400/10`}
        onClick={(e) => onSlotClick(zoneName, slotIndex, e)}
      >
        <div className="text-gray-600 text-center">
          {React.cloneElement(icon, { size: 12 })}
        </div>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative">
          <CardComponent
            card={card}
            onClick={() => onCardClick(card)}
            isSmall={true}
            showCost={false}
            isFaceDown={card.faceDown}
          />
          {isEffectActivated(card) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
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

export default GameZoneSlot;
