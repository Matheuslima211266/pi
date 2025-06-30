import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { ArrowUp, Skull, Ban, BookOpen, Star, Eye } from 'lucide-react';
import CardComponent from './CardComponent';
import { EMPTY_SLOT_WIDTH_PX, EMPTY_SLOT_ICON_SIZE_PX } from '@/config/dimensions';

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
        className={`border border-dashed rounded flex items-center justify-center bg-background/30 cursor-pointer transition-all text-xs
          ${isHighlighted ? 'border-primary bg-primary/20 animate-pulse' : 'border-border'}
          hover:border-accent hover:bg-accent/10`}
        style={{ 
          aspectRatio: 'var(--slot-aspect, 6/9)',
          width: `${EMPTY_SLOT_WIDTH_PX}px`
        }}
        onClick={(e) => onSlotClick(zoneName, slotIndex, e)}
      >
        <div className="text-gray-600 text-center">
          {React.cloneElement(icon, { size: EMPTY_SLOT_ICON_SIZE_PX })}
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
            onCardPreview={onCardPreview}
            isSmall={true}
            showCost={false}
            isFaceDown={card.faceDown}
            position={card.position || 'attack'}
            isEnemy={false}
            zoneName={zoneName}
            slotIndex={slotIndex}
            onContextMenu={() => {}}
            onDoubleClick={() => {}}
            onFieldCardAction={onFieldCardAction}
            enemyField={undefined}
            onCardClick={onCardClick}
            zoneLabel=""
          />
          {isEffectActivated(card) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-popover border-border z-50">
        <ContextMenuItem onClick={() => onCardPreview(card)} className="text-popover-foreground hover:bg-accent">
          <Eye className="mr-2 h-4 w-4" />
          View Card
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onFieldCardAction(card, 'toHand', 'hand')} className="text-popover-foreground hover:bg-accent">
          <ArrowUp className="mr-2 h-4 w-4" />
          Return to Hand
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeadZone', 'deadZone')} className="text-popover-foreground hover:bg-accent">
          Send to Dead Zone
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-popover-foreground hover:bg-accent">
            <Ban className="mr-2 h-4 w-4" />
            Banish Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-popover border-border">
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toBanished', 'banished')} className="text-popover-foreground hover:bg-accent">
              Banish Face-up
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toBanishedFaceDown', 'banishedFaceDown')} className="text-popover-foreground hover:bg-accent">
              Banish Face-down
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-popover-foreground hover:bg-accent">
            <BookOpen className="mr-2 h-4 w-4" />
            Return to Deck
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-popover border-border">
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeckTop', 'deck_top')} className="text-popover-foreground hover:bg-accent">
              Top of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeckBottom', 'deck_bottom')} className="text-popover-foreground hover:bg-accent">
              Bottom of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onFieldCardAction(card, 'toDeckShuffle', 'deck_shuffle')} className="text-popover-foreground hover:bg-accent">
              Shuffle into Deck
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => onFieldCardAction(card, 'toExtraDeck', 'extraDeck')} className="text-popover-foreground hover:bg-accent">
          <Star className="mr-2 h-4 w-4" />
          Add to Extra Deck
        </ContextMenuItem>

        {(zoneName === 'spellsTraps' || zoneName === 'monsters') && (
          <ContextMenuItem onClick={() => onFieldCardAction(card, 'flipCard', 'flip')} className="text-popover-foreground hover:bg-accent">
            {card.faceDown ? '🔄 Flip Face-up' : '🔒 Set Face-down'}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default GameZoneSlot;
