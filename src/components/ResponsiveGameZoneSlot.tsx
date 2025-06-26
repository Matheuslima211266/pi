
import React, { useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from '@/components/ui/context-menu';
import { ArrowUp, Skull, Ban, BookOpen, Star, Eye, Sword, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  enemyField
}) => {
  const [showAttackMenu, setShowAttackMenu] = useState(false);
  const [showEditATK, setShowEditATK] = useState(false);
  const [newATK, setNewATK] = useState(card?.atk || 0);

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

  const handleDirectAttack = () => {
    if (!card) return;
    
    const attackingATK = card.atk || 0;
    const damage = attackingATK;
    const battleResult = `${card.name} attacca direttamente! Danni: ${damage}`;

    const shouldDealDamage = confirm(`${battleResult}\n\nVuoi applicare ${damage} danni ai life points avversari?`);
    
    if (shouldDealDamage && damage > 0) {
      console.log(`Dealing ${damage} damage to opponent`);
      // Here you should call a function to reduce opponent's life points
      // onDealDamage?.(damage);
    }

    setShowAttackMenu(false);
  };

  const handleAttackMonster = (targetCard) => {
    if (!card || !targetCard) return;
    
    const attackingATK = card.atk || 0;
    let damage = 0;
    let battleResult = '';

    const targetDEF = targetCard.position === 'defense' ? (targetCard.def || 0) : (targetCard.atk || 0);
    const isTargetDefense = targetCard.position === 'defense';
    
    if (isTargetDefense) {
      // Attacco contro mostro in difesa
      if (attackingATK > targetDEF) {
        damage = attackingATK - targetDEF;
        battleResult = `${card.name} distrugge ${targetCard.name} in difesa! Danni: ${damage}`;
      } else if (attackingATK < targetDEF) {
        damage = targetDEF - attackingATK;
        battleResult = `${targetCard.name} resiste! ${card.name} subisce ${damage} danni`;
      } else {
        battleResult = `Battaglia pari! Nessun danno`;
      }
    } else {
      // Attacco contro mostro in attacco
      if (attackingATK > targetCard.atk) {
        damage = attackingATK - (targetCard.atk || 0);
        battleResult = `${card.name} distrugge ${targetCard.name}! Danni: ${damage}`;
      } else if (attackingATK < (targetCard.atk || 0)) {
        damage = (targetCard.atk || 0) - attackingATK;
        battleResult = `${targetCard.name} vince! ${card.name} viene distrutto. Danni: ${damage}`;
      } else {
        battleResult = `Battaglia pari! Entrambi i mostri vengono distrutti`;
      }
    }

    const shouldDealDamage = confirm(`${battleResult}\n\nVuoi applicare ${damage} danni ai life points ${damage > 0 ? 'avversari' : 'tuoi'}?`);
    
    if (shouldDealDamage && damage > 0) {
      console.log(`Dealing ${damage} damage`);
      // Here you should call a function to reduce life points
      // onDealDamage?.(damage, damage > 0 ? isTargetDefense : false);
    }

    setShowAttackMenu(false);
  };

  const handleEditATK = () => {
    if (newATK !== card.atk) {
      const updatedCard = { ...card, atk: newATK };
      handleFieldCardAction('updateATK', updatedCard, zoneName, slotIndex);
    }
    setShowEditATK(false);
  };

  const getEnemyMonsters = () => {
    if (!enemyField?.monsters) return [];
    return enemyField.monsters.filter(monster => monster !== null);
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
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/40"></div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48 bg-gray-800 border-gray-600 z-50">
            <ContextMenuItem onClick={() => onCardPreview?.(card)} className="text-white hover:bg-gray-700">
              <Eye className="mr-2 h-4 w-4" />
              View Card
            </ContextMenuItem>

            {/* Fixed position options for monsters */}
            {zoneName === 'monsters' && (
              <>
                <ContextMenuItem 
                  onClick={() => handleFieldCardAction('changePosition', { ...card, position: 'defense' }, zoneName, slotIndex)} 
                  className="text-white hover:bg-gray-700"
                  disabled={card.position === 'defense'}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Set Defense Position
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={() => handleFieldCardAction('changePosition', { ...card, position: 'attack' }, zoneName, slotIndex)} 
                  className="text-white hover:bg-gray-700"
                  disabled={card.position === 'attack'}
                >
                  <Sword className="mr-2 h-4 w-4" />
                  Set Attack Position
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
                  <ContextMenuItem onClick={handleDirectAttack} className="text-white hover:bg-gray-700">
                    Direct Attack
                  </ContextMenuItem>
                  {getEnemyMonsters().map((enemyMonster, index) => (
                    <ContextMenuItem 
                      key={`enemy-${index}`}
                      onClick={() => handleAttackMonster(enemyMonster)} 
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
              <ContextMenuItem onClick={() => setShowEditATK(true)} className="text-white hover:bg-gray-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit ATK
              </ContextMenuItem>
            )}
            
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

      {/* Modal per modificare ATK */}
      {showEditATK && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowEditATK(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-800 p-4 rounded-lg border border-gray-600 min-w-64">
            <h3 className="text-white font-bold mb-3">Edit ATK - {card.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-300 text-sm">Current ATK: {card.atk}</label>
                <Input
                  type="number"
                  value={newATK}
                  onChange={(e) => setNewATK(parseInt(e.target.value) || 0)}
                  className="bg-gray-700 text-white border-gray-600"
                  placeholder="New ATK value"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditATK} className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
                <Button onClick={() => setShowEditATK(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResponsiveGameZoneSlot;
