
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
      <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
        <ContextMenuItem onClick={() => onCardPreview(card)} className="text-white hover:bg-gray-700">
          <Eye className="mr-2 h-4 w-4" />
          View Card
        </ContextMenuItem>

        {/* Position options for monsters */}
        {zoneName === 'monsters' && (
          <>
            <ContextMenuItem 
              onClick={() => handleFieldCardAction('changePosition', { ...card, position: 'attack' })} 
              className="text-white hover:bg-gray-700"
              disabled={card.position === 'attack'}
            >
              <Sword className="mr-2 h-4 w-4" />
              Set Attack Position
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleFieldCardAction('changePosition', { ...card, position: 'defense' })} 
              className="text-white hover:bg-gray-700"
              disabled={card.position === 'defense'}
            >
              <Shield className="mr-2 h-4 w-4" />
              Set Defense Position
            </ContextMenuItem>
          </>
        )}

        {/* Attack menu for monsters */}
        {zoneName === 'monsters' && !card.faceDown && (
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
              <Sword className="mr-2 h-4 w-4" />
              Attack
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="bg-gray-800 border-gray-600">
              <ContextMenuItem onClick={onDirectAttack} className="text-white hover:bg-gray-700">
                Direct Attack
              </ContextMenuItem>
              {enemyMonsters.map((enemyMonster, index) => (
                <ContextMenuItem 
                  key={`enemy-${index}`}
                  onClick={() => onAttackMonster(enemyMonster)} 
                  className="text-white hover:bg-gray-700"
                >
                  Attack {enemyMonster.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* Edit ATK for monsters */}
        {zoneName === 'monsters' && (
          <ContextMenuItem onClick={onEditATK} className="text-white hover:bg-gray-700">
            <Edit className="mr-2 h-4 w-4" />
            Edit ATK
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={() => handleFieldCardAction('toHand')} className="text-white hover:bg-gray-700">
          <ArrowUp className="mr-2 h-4 w-4" />
          Return to Hand
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => handleFieldCardAction('destroy')} className="text-white hover:bg-gray-700">
          <Skull className="mr-2 h-4 w-4" />
          Send to Dead Zone
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-white hover:bg-gray-700">
            <Ban className="mr-2 h-4 w-4" />
            Banish Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-gray-800 border-gray-600">
            <ContextMenuItem onClick={() => handleFieldCardAction('banish')} className="text-white hover:bg-gray-700">
              Banish Face-up
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFieldCardAction('banishFaceDown')} className="text-white hover:bg-gray-700">
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
            <ContextMenuItem onClick={() => handleFieldCardAction('toDeckTop')} className="text-white hover:bg-gray-700">
              Top of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFieldCardAction('toDeckBottom')} className="text-white hover:bg-gray-700">
              Bottom of Deck
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleFieldCardAction('toDeckShuffle')} className="text-white hover:bg-gray-700">
              Shuffle into Deck
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => handleFieldCardAction('toExtraDeck')} className="text-white hover:bg-gray-700">
          <Star className="mr-2 h-4 w-4" />
          Add to Extra Deck
        </ContextMenuItem>

        {(zoneName === 'spellsTraps' || zoneName === 'monsters') && (
          <ContextMenuItem onClick={() => handleFieldCardAction('flipCard')} className="text-white hover:bg-gray-700">
            {card.faceDown ? '🔄 Flip Face-up' : '🔒 Set Face-down'}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FieldCardContextMenu;
