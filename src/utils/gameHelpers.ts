export const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateUniqueCardId = (baseId: any, playerId: string, index: string | number = 0) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const cryptoRandom = crypto.getRandomValues ? 
    Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') : 
    Math.random().toString(36).substring(2, 15);
  
  return `${playerId}_${baseId}_${index}_${timestamp}_${random}_${cryptoRandom}`;
};

export const isCardInZone = (card: any, zone: any[], zoneName: string): boolean => {
  if (!zone || !Array.isArray(zone)) return false;
  
  if (zoneName === 'monsters' || zoneName === 'spellsTraps') {
    return zone.some(slot => slot && slot.id === card.id);
  }
  
  return zone.some(zoneCard => zoneCard && zoneCard.id === card.id);
};

export const removeCardFromZone = (card: any, zone: any[], zoneName: string): any[] => {
  if (!zone || !Array.isArray(zone)) return zone || [];
  
  if (zoneName === 'monsters' || zoneName === 'spellsTraps') {
    return zone.map(slot => slot && slot.id === card.id ? null : slot);
  }
  
  return zone.filter(zoneCard => zoneCard && zoneCard.id !== card.id);
};

export const addCardToZone = (card: any, zone: any[], zoneName: string, slotIndex?: number): any[] => {
  if (!zone || !Array.isArray(zone)) return [card];
  
  if (zoneName === 'monsters' || zoneName === 'spellsTraps') {
    const newZone = [...zone];
    if (newZone.length === 0) {
      for (let i = 0; i < 5; i++) newZone.push(null);
    }
    if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 5) {
      newZone[slotIndex] = card;
    } else {
      let emptyIndex = newZone.findIndex(slot => slot == null);
      if (emptyIndex === -1) {
        if (newZone.length >= 5) {
          console.warn('No empty monster/spell slot available');
          return newZone;
        }
        newZone.push(card);
      } else if (emptyIndex !== -1) {
        newZone[emptyIndex] = card;
      }
    }
    return newZone;
  }
  
  if (zone.some(zoneCard => zoneCard && zoneCard.id === card.id)) {
    console.warn(`Card ${card.name} (${card.id}) already exists in ${zoneName}`);
    return zone;
  }
  
  return [...zone, card];
};

export const findCardDuplicates = (card: any, playerField: any): string[] => {
  const duplicates: string[] = [];
  
  const zones = [
    { name: 'hand', data: playerField.hand },
    { name: 'monsters', data: playerField.monsters },
    { name: 'spellsTraps', data: playerField.spellsTraps },
    { name: 'fieldSpell', data: playerField.fieldSpell },
    { name: 'deadZone', data: playerField.deadZone },
    { name: 'banished', data: playerField.banished },
    { name: 'banishedFaceDown', data: playerField.banishedFaceDown },
    { name: 'extraDeck', data: playerField.extraDeck },
    { name: 'deck', data: playerField.deck }
  ];
  
  zones.forEach(zone => {
    if (isCardInZone(card, zone.data, zone.name)) {
      duplicates.push(zone.name);
    }
  });
  
  return duplicates;
};
