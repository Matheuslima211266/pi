import { 
  isCardInZone, 
  removeCardFromZone, 
  addCardToZone, 
  findCardDuplicates 
} from '@/utils/gameHelpers';
import { dbg } from '@/lib/debug';

export const useCardMoveHandlers = (gameState) => {
  const {
    gameData,
    playerField,
    enemyField,
    setPlayerField,
    setEnemyField,
    setPlayerHand,
    setEnemyHandCount,
    setPlayerLifePoints,
    setEnemyLifePoints,
    setActionLog,
    shuffleArray,
    setPlayerDeck,
    setEnemyDeck
  } = gameState;

  const handleCardMove = (card, fromZone, toZone, slotIndex = null, isPlayer = true) => {
    if (!card) {
      console.warn('handleCardMove: No card provided');
      return;
    }

    // Se fromZone === toZone, è solo un aggiornamento di stato (es. cambio posizione)
    if (fromZone === toZone) {
      const fieldSetter = isPlayer ? setPlayerField : setEnemyField;

      if (fromZone === 'monsters') {
        fieldSetter(prev => {
          const newField = { ...prev };
          const updated = [...(prev.monsters || [])];
          if (slotIndex !== null && updated[slotIndex]) {
            updated[slotIndex] = { ...card };
          }
          newField.monsters = updated;
          return newField;
        });
      } else if (fromZone === 'spellsTraps') {
        fieldSetter(prev => {
          const newField = { ...prev };
          const updated = [...(prev.spellsTraps || [])];
          if (slotIndex !== null && updated[slotIndex]) {
            updated[slotIndex] = { ...card };
          }
          newField.spellsTraps = updated;
          return newField;
        });
      }

      // Log dell'azione
      const action = `${isPlayer ? 'Player' : 'Enemy'} updated ${card.name} in ${fromZone}`;
      setActionLog(prev => [...prev, { id: Date.now(), action, timestamp: Date.now() }]);
      return;
    }

    // Verifica se la carta è già nella zona di destinazione
    // Normalizza il nome della zona di destinazione in modo che corrisponda alle chiavi del field
    const normalizeZoneName = (zone) => {
      switch (zone) {
        case 'deck_top':
        case 'deck_bottom':
        case 'deck_shuffle':
          return 'deck';
        default:
          return zone;
      }
    };

    const targetField = isPlayer ? playerField : enemyField;
    const normalizedToZone = normalizeZoneName(toZone);
    const destinationArray = Array.isArray(targetField?.[normalizedToZone]) ? targetField[normalizedToZone] : [];

    // Rimuoviamo il blocco che impediva di avere copie multiple della stessa carta
    // In un mazzo reale possono esistere più istanze con lo stesso id; consentiamo quindi duplicati
    // mantenendo il controllo solo per il caso in cui sia esattamente lo stesso oggetto
    if (destinationArray.some(zoneCard => zoneCard === card)) {
      console.warn(`Exact same card instance is already in ${toZone}`);
      return;
    }

    // Rimuovi la carta dalla zona di origine in modo sicuro
    if (fromZone === 'hand' && isPlayer) {
      setPlayerHand(prev => removeCardFromZone(card, prev, 'hand'));
    } else if (fromZone === 'hand' && !isPlayer) {
      setEnemyHandCount(prev => Math.max(0, prev - 1));
    } else if (fromZone === 'deck' && isPlayer) {
      // Rimuovi dal mazzo del player (playerDeck), l'aggiornamento di playerField.deck verrà gestito
      // nella fase di aggiunta alla nuova zona per evitare conflitti di batching.
      setPlayerDeck(prev => removeCardFromZone(card, prev, 'deck'));
    } else if (fromZone === 'deck' && !isPlayer) {
      // Rimuovi dal mazzo avversario
      setEnemyDeck(prev => removeCardFromZone(card, prev, 'deck'));
    } else if (fromZone === 'deadZone') {
      const field = isPlayer ? playerField : enemyField;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setField(prev => ({
        ...prev,
        deadZone: removeCardFromZone(card, prev.deadZone || [], 'deadZone')
      }));
    } else if (fromZone === 'banished') {
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setField(prev => ({
        ...prev,
        banished: removeCardFromZone(card, prev.banished || [], 'banished')
      }));
    } else if (fromZone === 'banishedFaceDown') {
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setField(prev => ({
        ...prev,
        banishedFaceDown: removeCardFromZone(card, prev.banishedFaceDown || [], 'banishedFaceDown')
      }));
    } else if (fromZone === 'extraDeck') {
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setField(prev => ({
        ...prev,
        extraDeck: removeCardFromZone(card, prev.extraDeck || [], 'extraDeck')
      }));
    } else {
      // Rimuovi dal campo
      const field = isPlayer ? playerField : enemyField;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      
      if (fromZone === 'monsters') {
        setField(prev => ({
          ...prev,
          monsters: removeCardFromZone(card, prev.monsters || [], 'monsters')
        }));
      } else if (fromZone === 'spellsTraps' || fromZone === 'fieldSpell') {
        setField(prev => ({
          ...prev,
          spellsTraps: removeCardFromZone(card, prev.spellsTraps || [], 'spellsTraps'),
          fieldSpell: fromZone === 'fieldSpell' ? [] : prev.fieldSpell
        }));
      }
    }

    // Aggiungi la carta alla zona di destinazione
    if (toZone === 'hand' && isPlayer) {
      setPlayerHand(prev => addCardToZone(card, prev, 'hand'));
    } else if (toZone === 'hand' && !isPlayer) {
      setEnemyHandCount(prev => prev + 1);
    } else if (toZone === 'deck') {
      // Rimetti nel deck (in cima di default)
      const setDeck = isPlayer ? setPlayerDeck : setEnemyDeck;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setDeck(prev => addCardToZone(card, prev, 'deck'));
      setField(prev => ({
        ...prev,
        deck: addCardToZone(card, prev.deck || [], 'deck')
      }));
    } else if (toZone === 'deck_top') {
      const setDeck = isPlayer ? setPlayerDeck : setEnemyDeck;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setDeck(prev => [card, ...prev]);
      setField(prev => ({
        ...prev,
        deck: [card, ...(prev.deck || [])]
      }));
    } else if (toZone === 'deck_bottom') {
      const setDeck = isPlayer ? setPlayerDeck : setEnemyDeck;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setDeck(prev => [...prev, card]);
      setField(prev => ({
        ...prev,
        deck: [...(prev.deck || []), card]
      }));
    } else if (toZone === 'deck_shuffle') {
      const setDeck = isPlayer ? setPlayerDeck : setEnemyDeck;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setDeck(prev => shuffleArray([...prev, card]));
      setField(prev => ({
        ...prev,
        deck: shuffleArray([...(prev.deck || []), card])
      }));
    } else if (toZone === 'deadZone') {
      // Aggiungi al cimitero
      const field = isPlayer ? playerField : enemyField;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      
      setField(prev => ({
        ...prev,
        deadZone: addCardToZone(card, prev.deadZone || [], 'deadZone')
      }));
    } else if (toZone === 'banished') {
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setField(prev => ({
        ...prev,
        banished: addCardToZone(card, prev.banished || [], 'banished')
      }));
    } else if (toZone === 'banishedFaceDown') {
      const setField = isPlayer ? setPlayerField : setEnemyField;
      // Ensure the card is marked face-down when moved here
      const faceDownCard = { ...card, faceDown: true };
      setField(prev => ({
        ...prev,
        banishedFaceDown: addCardToZone(faceDownCard, prev.banishedFaceDown || [], 'banishedFaceDown')
      }));
    } else if (toZone === 'extraDeck') {
      const setField = isPlayer ? setPlayerField : setEnemyField;
      setField(prev => ({
        ...prev,
        extraDeck: addCardToZone(card, prev.extraDeck || [], 'extraDeck')
      }));
    } else {
      // Aggiungi al campo
      const field = isPlayer ? playerField : enemyField;
      const setField = isPlayer ? setPlayerField : setEnemyField;
      
      if (toZone === 'monsters') {
        const targetSlotIndex = (typeof slotIndex === 'number' && slotIndex >= 0) ? slotIndex : undefined;
        const movedCard = {
          ...card,
          zone: 'monsters',
          slotIndex: targetSlotIndex ?? null,
          position: card.position || 'attack',
          faceDown: card.faceDown ?? false
        };
        setField(prev => {
          const next = {
            ...prev,
            monsters: addCardToZone(movedCard, prev.monsters || [], 'monsters', targetSlotIndex),
            deck: removeCardFromZone(movedCard, prev.deck || [], 'deck')
          };
          dbg('[add-to-monsters]', {
            before: prev.monsters?.map(c => c?.id || null),
            after : next.monsters?.map(c => c?.id || null),
            added: movedCard.id,
            slotIndex: targetSlotIndex ?? null,
          });
          return next;
        });
      } else if (toZone === 'spellsTraps') {
        const targetSlotIndex = (typeof slotIndex === 'number' && slotIndex >= 0) ? slotIndex : undefined;
        const movedCard = {
          ...card,
          zone: 'spellsTraps',
          slotIndex: targetSlotIndex ?? null,
          faceDown: card.faceDown ?? false
        };
        setField(prev => {
          const next = {
            ...prev,
            spellsTraps: addCardToZone(movedCard, prev.spellsTraps || [], 'spellsTraps', targetSlotIndex),
            deck: removeCardFromZone(movedCard, prev.deck || [], 'deck')
          };
          dbg('[add-to-spellsTraps]', {
            before: prev.spellsTraps?.map(c => c?.id || null),
            after : next.spellsTraps?.map(c => c?.id || null),
            added: movedCard.id,
            slotIndex: targetSlotIndex ?? null,
          });
          return next;
        });
      } else if (toZone === 'fieldSpell') {
        // La zona terreno funziona come magia singola, sostituisce l'esistente
        const movedCard = {
          ...card,
          zone: 'fieldSpell',
          slotIndex: 0,
          faceDown: false
        };
        setField(prev => ({
          ...prev,
          fieldSpell: [movedCard]
        }));
      }
    }

    // Log dell'azione
    const action = `${isPlayer ? 'Player' : 'Enemy'} moved ${card.name} from ${fromZone} to ${toZone}`;
    setActionLog(prev => [...prev, { id: Date.now(), action, timestamp: Date.now() }]);
  };

  return {
    handleCardMove
  };
};
