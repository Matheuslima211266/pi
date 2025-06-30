import React from 'react';
import CardComponent from './CardComponent';
import FieldCardContextMenu from './FieldCardContextMenu';
import ATKEditModal from './ATKEditModal';
import { useATKEditor } from '../hooks/useATKEditor';
import { useBattleLogic } from '../hooks/useBattleLogic';

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
  enemyField,
  isEnemy = false,
  onDealDamage
}) => {
  const {
    showEditATK,
    newATK,
    setNewATK,
    openATKEditor,
    handleEditATK,
    closeATKEditor
  } = useATKEditor(card, onFieldCardAction, zoneName, slotIndex);

  const {
    handleDirectAttack,
    handleAttackMonster,
    getEnemyMonsters
  } = useBattleLogic(onFieldCardAction, (damage:number, isToEnemy:boolean)=>{
    if (onDealDamage) {
      onDealDamage(damage, isToEnemy);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (card) {
      onCardPreview?.(card);
    } else if (onSlotClick && isHighlighted) {
      onSlotClick(zoneName, slotIndex, e);
    }
  };

  const handleFieldCardActionWrapper = (action, card, zoneName, slotIndex) => {
    if (onFieldCardAction) {
      onFieldCardAction(action, card, zoneName, slotIndex);
    }
  };

  const enemyMonsters = getEnemyMonsters(enemyField);

  return (
    <div 
      className={`
        relative w-full aspect-[5/8] min-w-[80px]
        border-2 rounded-lg cursor-pointer transition-all duration-200
        ${card ? 'border-yellow-500 bg-slate-700' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'}
        ${isHighlighted ? 'border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-400/50' : ''}
        ${isEffectActivated ? 'ring-2 ring-purple-400' : ''}
      `}
      onClick={handleClick}
      onMouseDown={(e) => {
      }}
      onMouseUp={(e) => {
      }}
    >
      {card ? (
        <FieldCardContextMenu
          card={card}
          zoneName={zoneName}
          slotIndex={slotIndex}
          onCardPreview={onCardPreview}
          onFieldCardAction={handleFieldCardActionWrapper}
          onDirectAttack={() => handleDirectAttack(card, zoneName, slotIndex)}
          onAttackMonster={(targetCard) => handleAttackMonster(card, targetCard, zoneName, slotIndex)}
          onEditATK={openATKEditor}
          enemyMonsters={enemyMonsters}
        >
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
                isDefensePosition={card.position === 'defense'}
                onPositionChange={(card) => {
                  if (onFieldCardAction) {
                    onFieldCardAction('changePosition', card, zoneName, slotIndex);
                  }
                }}
                isEnemy={isEnemy}
                onContextMenu={null}
                onDoubleClick={null}
                zoneName={zoneName}
                slotIndex={slotIndex}
                onFieldCardAction={onFieldCardAction}
                enemyField={enemyField}
                onCardClick={onCardClick}
                zoneLabel={zoneLabel}
              />
            </div>
            
            {isEffectActivated && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/40"></div>
            )}
          </div>
        </FieldCardContextMenu>
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

      <ATKEditModal
        isOpen={showEditATK}
        card={card}
        newATK={newATK}
        setNewATK={setNewATK}
        onSave={handleEditATK}
        onClose={closeATKEditor}
      />
    </div>
  );
};

export default ResponsiveGameZoneSlot;
