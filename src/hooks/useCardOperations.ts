
import { generateUniqueCardId } from '@/utils/gameHelpers';

export const useCardOperations = ({ 
  playerField, 
  setPlayerField, 
  enemyField, 
  setEnemyField, 
  setPlayerHand 
}) => {
  // Helper function to add cards to the Dead Zone
  const addCardToDeadZone = (card: any, isPlayer = true) => {
    console.log('[useCardOperations] Adding card to dead zone:', card.name);
    if (isPlayer) {
      setPlayerField((prev: any) => {
        const newDeadZone = [...(prev.deadZone || []), card];
        console.log('[useCardOperations] Player dead zone updated:', newDeadZone.map((c: any) => c.name));
        return {
          ...prev,
          deadZone: newDeadZone
        };
      });
    } else {
      setEnemyField((prev: any) => {
        const newDeadZone = [...(prev.deadZone || []), card];
        console.log('[useCardOperations] Enemy dead zone updated:', newDeadZone.map((c: any) => c.name));
        return {
          ...prev,
          deadZone: newDeadZone
        };
      });
    }
  };

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

  // Function for milling cards (deck to Dead Zone)
  const millCards = (count = 1, isPlayer = true) => {
    console.log(`[useCardOperations] Milling ${count} cards for ${isPlayer ? 'player' : 'enemy'}`);
    
    if (isPlayer) {
      setPlayerField((prev: any) => {
        const cardsToMill = prev.deck.slice(0, count);
        const remainingDeck = prev.deck.slice(count);
        const newDeadZone = [...(prev.deadZone || []), ...cardsToMill];
        
        console.log('[useCardOperations] Cards milled to player dead zone:', cardsToMill.map((c: any) => c.name));
        console.log('[useCardOperations] New player dead zone size:', newDeadZone.length);
        
        return {
          ...prev,
          deck: remainingDeck,
          deadZone: newDeadZone
        };
      });
    } else {
      setEnemyField((prev: any) => {
        const cardsToMill = prev.deck.slice(0, count);
        const remainingDeck = prev.deck.slice(count);
        const newDeadZone = [...(prev.deadZone || []), ...cardsToMill];
        
        return {
          ...prev,
          deck: remainingDeck,
          deadZone: newDeadZone
        };
      });
    }
  };

  return {
    addCardToDeadZone,
    moveCardBetweenZones,
    millCards
  };
};
