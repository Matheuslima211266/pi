
import { generateUniqueCardId } from '@/utils/gameHelpers';

export const useCardOperations = ({ 
  playerField, 
  setPlayerField, 
  enemyField, 
  setEnemyField, 
  setPlayerHand 
}) => {
  // Function to move cards between zones
  const moveCardBetweenZones = (card: any, fromZone: string, toZone: string, isPlayer = true) => {
    console.log(`[useCardOperations] Moving card ${card.name} from ${fromZone} to ${toZone}`);
    
    const fieldSetter = isPlayer ? setPlayerField : setEnemyField;
    const handSetter = isPlayer ? setPlayerHand : null;
    
    fieldSetter((prev: any) => {
      const newField = { ...prev };
      
      // Remove from source zone
      if (fromZone === 'hand' && isPlayer) {
        // Special handling for hand
        if (handSetter) {
          setPlayerHand((currentHand: any) => currentHand.filter((c: any) => c.id !== card.id));
        }
      } else if (newField[fromZone]) {
        if (Array.isArray(newField[fromZone])) {
          newField[fromZone] = newField[fromZone].filter((c: any) => c && c.id !== card.id);
        } else {
          // For zones with slots (monsters, spellsTraps)
          newField[fromZone] = newField[fromZone].map((c: any) => c && c.id === card.id ? null : c);
        }
      }
      
      // Add to destination zone
      if (toZone === 'hand' && isPlayer) {
        // Special handling for hand
        if (handSetter) {
          setPlayerHand((currentHand: any) => [...currentHand, card]);
        }
      } else if (newField[toZone]) {
        if (Array.isArray(newField[toZone])) {
          newField[toZone] = [...newField[toZone], card];
        }
        // For zones with slots, specific slot placement would need to be handled separately
      }
      
      console.log(`[useCardOperations] Updated ${toZone}:`, newField[toZone]);
      return newField;
    });
  };

  // Function for milling cards (deck to banished)
  const millCards = (count = 1, isPlayer = true) => {
    console.log(`[useCardOperations] Milling ${count} cards for ${isPlayer ? 'player' : 'enemy'}`);
    
    if (isPlayer) {
      setPlayerField((prev: any) => {
        const cardsToMill = prev.deck.slice(0, count);
        const remainingDeck = prev.deck.slice(count);
        const newBanished = [...(prev.banished || []), ...cardsToMill];
        
        console.log('[useCardOperations] Cards milled to player banished:', cardsToMill.map((c: any) => c.name));
        console.log('[useCardOperations] New player banished size:', newBanished.length);
        
        return {
          ...prev,
          deck: remainingDeck,
          banished: newBanished
        };
      });
    } else {
      setEnemyField((prev: any) => {
        const cardsToMill = prev.deck.slice(0, count);
        const remainingDeck = prev.deck.slice(count);
        const newBanished = [...(prev.banished || []), ...cardsToMill];
        
        return {
          ...prev,
          deck: remainingDeck,
          banished: newBanished
        };
      });
    }
  };

  return {
    moveCardBetweenZones,
    millCards
  };
};
