import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { ArrowUp, Skull, Ban, BookOpen, Star, Eye, Sword, Shield, Edit } from 'lucide-react';

interface FieldCardContextMenuProps {
  children: React.ReactNode;
  card: any;
  zoneName: string;
  slotIndex: number;
  onCardPreview: (card: any) => void;
  onFieldCardAction: (action: string, card: any, zoneName: string, slotIndex: number) => void;
  onDirectAttack: () => void;
  onAttackMonster: (targetCard: any) => void;
  onEditATK: () => void;
  enemyMonsters: any[];
}

const FieldCardContextMenu: React.FC<FieldCardContextMenuProps> = ({
  children,
  card,
  zoneName,
  slotIndex,
  onCardPreview,
  onFieldCardAction,
  onDirectAttack,
  onAttackMonster,
  onEditATK,
  enemyMonsters
}) => {
  const handleFieldCardAction = (action: string, targetZone?: string) => {
    onFieldCardAction(action, card, zoneName, slotIndex);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-popover border-border z-50">
        <ContextMenuItem onClick={() => onCardPreview(card)} className="text-popover-foreground hover:bg-accent">
          <Eye className="mr-2 h-4 w-4" />
          View Card
        </ContextMenuItem>

        {/* Position options for monsters */}
        {zoneName === 'monsters' && (
          <>
            <ContextMenuItem 
              onClick={() => handleFieldCardAction('changePosition')} 
              className="text-popover-foreground hover:bg-accent"
            >
              {card.position === 'attack' ? (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Set Defense Position
                </>
              ) : (
                <>
                  <Sword className="mr-2 h-4 w-4" />
                  Set Attack Position
                </>
              )}
            </ContextMenuItem>
          </>
        )}

        {/* Attack menu for monsters */}
        {zoneName === 'monsters' && !card.faceDown && (
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-popover-foreground hover:bg-accent">
              <Sword className="mr-2 h-4 w-4" />
              Attack
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-popover border-border">
              <ContextMenuItem onClick={onDirectAttack} className="text-popover-foreground hover:bg-accent">
                Direct Attack
              </ContextMenuItem>
              {enemyMonsters.map((enemyMonster, index) => (
                <ContextMenuItem 
                  key={`enemy-${index}`}
                  onClick={() => onAttackMonster(enemyMonster)} 
                  className="text-popover-foreground hover:bg-accent"
                >
                  Attack {enemyMonster.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* Edit ATK for monsters */}
        {zoneName === 'monsters' && (
          <ContextMenuItem onClick={onEditATK} className="text-popover-foreground hover:bg-accent">
            <Edit className="mr-2 h-4 w-4" />
            Edit ATK
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={() => handleFieldCardAction('toHand')} className="text-popover-foreground hover:bg-accent">
          <ArrowUp className="mr-2 h-4 w-4" />
          Return to Hand
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => handleFieldCardAction('destroy')} className="text-popover-foreground hover:bg-accent">
          <Skull className="mr-2 h-4 w-4" />
          Send to Dead Zone
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-popover-foreground hover:bg-accent">
            <Ban className="mr-2 h-4 w-4" />
            Banish Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-popover border-border">
            <ContextMenuItem onClick={() => handleFieldCardAction('banish')} className="text-popover-foreground hover:bg-accent">
              Banish Face-up
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFieldCardAction('banishFaceDown')} className="text-popover-foreground hover:bg-accent">
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
            <ContextMenuItem onClick={() => handleFieldCardAction('toDeckTop')} className="text-popover-foreground hover:bg-accent">
              Top of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFieldCardAction('toDeckBottom')} className="text-popover-foreground hover:bg-accent">
              Bottom of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFieldCardAction('toDeckShuffle')} className="text-popover-foreground hover:bg-accent">
              Shuffle into Deck
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => handleFieldCardAction('toExtraDeck')} className="text-popover-foreground hover:bg-accent">
          <Star className="mr-2 h-4 w-4" />
          Add to Extra Deck
        </ContextMenuItem>

        {(zoneName === 'spellsTraps' || zoneName === 'monsters') && (
          <ContextMenuItem onClick={() => handleFieldCardAction('flipCard')} className="text-popover-foreground hover:bg-accent">
            {card.faceDown ? '🔄 Flip Face-up' : '🔒 Set Face-down'}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FieldCardContextMenu;
