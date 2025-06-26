
export const useBattleLogic = (onFieldCardAction: any) => {
  const handleDirectAttack = (card: any, zoneName: string, slotIndex: number) => {
    if (!card) return;
    
    const attackingATK = card.atk || 0;
    const damage = attackingATK;
    const battleResult = `${card.name} attacca direttamente! Danni: ${damage}`;

    const shouldDealDamage = confirm(`${battleResult}\n\nVuoi applicare ${damage} danni ai life points avversari?`);
    
    if (shouldDealDamage && damage > 0) {
      console.log(`Dealing ${damage} damage to opponent`);
      if (onFieldCardAction) {
        onFieldCardAction('dealDamage', { damage, isToEnemy: true }, zoneName, slotIndex);
      }
    }
  };

  const handleAttackMonster = (card: any, targetCard: any, zoneName: string, slotIndex: number) => {
    if (!card || !targetCard) return;
    
    const attackingATK = card.atk || 0;
    let damage = 0;
    let battleResult = '';
    let damageToOpponent = 0;

    const targetDEF = targetCard.position === 'defense' ? (targetCard.def || 0) : (targetCard.atk || 0);
    const isTargetDefense = targetCard.position === 'defense';
    
    if (isTargetDefense) {
      if (attackingATK > targetDEF) {
        damageToOpponent = attackingATK - targetDEF;
        battleResult = `${card.name} distrugge ${targetCard.name} in difesa! Danni all'avversario: ${damageToOpponent}`;
      } else if (attackingATK < targetDEF) {
        damage = targetDEF - attackingATK;
        battleResult = `${targetCard.name} resiste! Tu subisci ${damage} danni`;
      } else {
        battleResult = `Battaglia pari! Nessun danno`;
      }
    } else {
      if (attackingATK > (targetCard.atk || 0)) {
        damageToOpponent = attackingATK - (targetCard.atk || 0);
        battleResult = `${card.name} distrugge ${targetCard.name}! Danni all'avversario: ${damageToOpponent}`;
      } else if (attackingATK < (targetCard.atk || 0)) {
        damage = (targetCard.atk || 0) - attackingATK;
        battleResult = `${targetCard.name} vince! ${card.name} viene distrutto. Tu subisci ${damage} danni`;
      } else {
        battleResult = `Battaglia pari! Entrambi i mostri vengono distrutti`;
      }
    }

    const totalDamage = damageToOpponent || damage;
    const isToEnemy = damageToOpponent > 0;
    
    if (totalDamage > 0) {
      const shouldDealDamage = confirm(`${battleResult}\n\nVuoi applicare ${totalDamage} danni ai life points ${isToEnemy ? 'avversari' : 'tuoi'}?`);
      
      if (shouldDealDamage && onFieldCardAction) {
        onFieldCardAction('dealDamage', { damage: totalDamage, isToEnemy }, zoneName, slotIndex);
      }
    }
  };

  const getEnemyMonsters = (enemyField: any) => {
    if (!enemyField?.monsters) return [];
    return enemyField.monsters.filter((monster: any) => monster !== null);
  };

  return {
    handleDirectAttack,
    handleAttackMonster,
    getEnemyMonsters
  };
};
