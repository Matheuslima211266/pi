
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface GameAction {
  id: string;
  game_session_id: string;
  player_id: string;
  player_name: string;
  action_type: string;
  action_data: any;
  timestamp: string;
  processed: boolean;
}

export const useGameSync = (user: User | null, gameSessionId: string | null, gameState: any) => {
  const [lastProcessedAction, setLastProcessedAction] = useState<string | null>(null);

  console.log('=== GAME SYNC HOOK ===', {
    hasUser: !!user,
    gameSessionId,
    lastProcessedAction
  });

  // Invia un'azione al database
  const sendGameAction = useCallback(async (actionType: string, actionData: any) => {
    if (!user || !gameSessionId) {
      console.log('[GAME_SYNC] Cannot send action - missing user or session', { hasUser: !!user, gameSessionId });
      return;
    }

    try {
      console.log('[GAME_SYNC] Sending action', { actionType, actionData, gameSessionId, playerId: user.id });
      
      const { data, error } = await supabase
        .from('game_actions_realtime')
        .insert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_name: gameState.gameData?.playerName || 'Player',
          action_type: actionType,
          action_data: actionData
        })
        .select()
        .single();

      if (error) {
        console.error('[GAME_SYNC] Error sending action', error);
      } else {
        console.log('[GAME_SYNC] Action sent successfully', data);
      }
    } catch (err) {
      console.error('[GAME_SYNC] Exception sending action', err);
    }
  }, [user, gameSessionId, gameState.gameData?.playerName]);

  // Applica un'azione ricevuta
  const applyReceivedAction = useCallback((action: GameAction) => {
    console.log('[GAME_SYNC] Applying received action', action);
    
    // Non applicare le proprie azioni
    if (action.player_id === user?.id) {
      console.log('[GAME_SYNC] Skipping own action');
      return;
    }

    const { action_type, action_data } = action;

    // Aggiungi l'azione all'action log
    const actionText = getActionText(action_type, action_data);
    gameState.setActionLog((prev: any) => [...prev, {
      id: Date.now(),
      player: action.player_name,
      action: actionText,
      timestamp: new Date(action.timestamp).toLocaleTimeString()
    }]);

    switch (action_type) {
      case 'CARD_PLACED':
        console.log('[GAME_SYNC] Applying CARD_PLACED to enemy field', action_data);
        gameState.setEnemyField((prev: any) => {
          const newField = { ...prev };
          
          if (action_data.zoneName === 'monsters') {
            newField.monsters = [...prev.monsters];
            newField.monsters[action_data.slotIndex] = {
              ...action_data.card,
              position: action_data.position || 'attack',
              isFaceDown: action_data.isFaceDown || false
            };
          } else if (action_data.zoneName === 'spellsTraps') {
            newField.spellsTraps = [...prev.spellsTraps];
            newField.spellsTraps[action_data.slotIndex] = {
              ...action_data.card,
              isFaceDown: action_data.isFaceDown || false
            };
          } else if (action_data.zoneName === 'fieldSpell') {
            newField.fieldSpell = [action_data.card];
          }
          
          console.log('[GAME_SYNC] Enemy field updated:', newField);
          return newField;
        });
        
        // Aggiorna il conteggio delle carte in mano dell'avversario
        gameState.setEnemyHandCount((prev: number) => Math.max(0, prev - 1));
        break;

      case 'LIFE_POINTS_CHANGED':
        console.log('[GAME_SYNC] Applying LIFE_POINTS_CHANGED', action_data);
        gameState.setEnemyLifePoints(action_data.newLifePoints);
        break;

      case 'CHAT_MESSAGE':
        console.log('[GAME_SYNC] Applying CHAT_MESSAGE', action_data);
        gameState.setChatMessages((prev: any) => [...prev, {
          id: Date.now(),
          player: action_data.playerName,
          message: action_data.message
        }]);
        break;

      case 'PHASE_CHANGED':
        console.log('[GAME_SYNC] Applying PHASE_CHANGED', action_data);
        gameState.setCurrentPhase(action_data.phase);
        break;

      case 'TURN_ENDED':
        console.log('[GAME_SYNC] Applying TURN_ENDED - switching to our turn', action_data);
        gameState.setIsPlayerTurn(true);
        gameState.setCurrentPhase('draw');
        break;

      case 'CARD_DRAWN':
        console.log('[GAME_SYNC] Applying CARD_DRAWN', action_data);
        gameState.setEnemyHandCount((prev: number) => prev + 1);
        break;

      case 'CARD_MOVED':
        console.log('[GAME_SYNC] Applying CARD_MOVED', action_data);
        gameState.setEnemyField((prev: any) => {
          const newField = { ...prev };
          const { card, fromZone, toZone, slotIndex } = action_data;
          
          // Remove from source zone
          if (fromZone === 'monsters') {
            newField.monsters = [...prev.monsters];
            const sourceIndex = prev.monsters.findIndex((m: any) => m && m.id === card.id);
            if (sourceIndex !== -1) newField.monsters[sourceIndex] = null;
          } else if (fromZone === 'spellsTraps') {
            newField.spellsTraps = [...prev.spellsTraps];
            const sourceIndex = prev.spellsTraps.findIndex((s: any) => s && s.id === card.id);
            if (sourceIndex !== -1) newField.spellsTraps[sourceIndex] = null;
          }
          
          // Add to destination zone
          if (toZone === 'graveyard') {
            newField.graveyard = [...prev.graveyard, card];
          } else if (toZone === 'banished') {
            newField.banished = [...prev.banished, card];
          } else if (toZone === 'monsters' && slotIndex !== undefined) {
            newField.monsters = [...(newField.monsters || prev.monsters)];
            newField.monsters[slotIndex] = card;
          } else if (toZone === 'spellsTraps' && slotIndex !== undefined) {
            newField.spellsTraps = [...(newField.spellsTraps || prev.spellsTraps)];
            newField.spellsTraps[slotIndex] = card;
          }
          
          return newField;
        });
        break;

      case 'HAND_UPDATED':
        console.log('[GAME_SYNC] Applying HAND_UPDATED', action_data);
        gameState.setEnemyHandCount(action_data.handCount);
        break;

      case 'SHOW_CARD':
        console.log('[GAME_SYNC] Applying SHOW_CARD', action_data);
        gameState.setEnemyRevealedCard(action_data.card);
        setTimeout(() => {
          gameState.setEnemyRevealedCard(null);
        }, 5000);
        break;

      case 'SHOW_HAND':
        console.log('[GAME_SYNC] Applying SHOW_HAND', action_data);
        gameState.setEnemyRevealedHand(action_data.hand);
        setTimeout(() => {
          gameState.setEnemyRevealedHand(null);
        }, 5000);
        break;

      default:
        console.log('[GAME_SYNC] Unknown action type', action_type);
    }
  }, [user?.id, gameState]);

  // Funzione helper per generare il testo dell'azione
  const getActionText = (actionType: string, actionData: any) => {
    switch (actionType) {
      case 'CARD_PLACED':
        return `ha giocato ${actionData.card.name} in ${actionData.zoneName}`;
      case 'LIFE_POINTS_CHANGED':
        return `ha cambiato i suoi punti vita a ${actionData.newLifePoints}`;
      case 'CARD_DRAWN':
        return `ha pescato una carta`;
      case 'PHASE_CHANGED':
        return `ha cambiato fase a ${actionData.phase}`;
      case 'TURN_ENDED':
        return `ha finito il suo turno`;
      case 'CARD_MOVED':
        return `ha spostato ${actionData.card.name} da ${actionData.fromZone} a ${actionData.toZone}`;
      case 'SHOW_CARD':
        return `ha mostrato ${actionData.card.name}`;
      case 'SHOW_HAND':
        return `ha mostrato la sua mano`;
      default:
        return `ha eseguito un'azione: ${actionType}`;
    }
  };

  // Sincronizza lo stato completo
  const syncCompleteGameState = useCallback(async () => {
    if (!user || !gameSessionId) return;

    try {
      console.log('[GAME_SYNC] Syncing complete game state');
      
      const { error } = await supabase
        .from('game_states')
        .upsert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_field: gameState.playerField,
          player_life_points: gameState.playerLifePoints,
          player_hand_count: gameState.playerHand?.length || 0,
          current_phase: gameState.currentPhase,
          is_player_turn: gameState.isPlayerTurn,
          time_remaining: gameState.timeRemaining,
          player_hand: gameState.playerHand,
          enemy_field: gameState.enemyField,
          enemy_life_points: gameState.enemyLifePoints,
          chat_messages: gameState.chatMessages,
          turn_number: gameState.turnNumber || 1,
          last_update: new Date().toISOString()
        });

      if (error) {
        console.error('[GAME_SYNC] Error syncing game state', error);
      }
    } catch (err) {
      console.error('[GAME_SYNC] Exception syncing game state', err);
    }
  }, [user, gameSessionId, gameState]);

  // Ascolta le azioni in tempo reale con miglior gestione degli errori
  useEffect(() => {
    if (!gameSessionId || !user) return;

    console.log('[GAME_SYNC] Setting up real-time action listener', gameSessionId);

    const channel = supabase
      .channel(`game_actions_${gameSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_actions_realtime',
          filter: `game_session_id=eq.${gameSessionId}`
        },
        (payload) => {
          console.log('[GAME_SYNC] Received real-time action', payload.new);
          const action = payload.new as GameAction;
          
          // Evita di processare la stessa azione più volte
          if (action.id !== lastProcessedAction && action.player_id !== user.id) {
            console.log('[GAME_SYNC] Processing new action from opponent', action.id);
            applyReceivedAction(action);
            setLastProcessedAction(action.id);
          } else {
            console.log('[GAME_SYNC] Skipping action - either already processed or own action', {
              actionId: action.id,
              lastProcessed: lastProcessedAction,
              isOwnAction: action.player_id === user.id
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[GAME_SYNC] Action listener subscription status', status);
        if (status === 'SUBSCRIPTION_ERROR') {
          console.error('[GAME_SYNC] Subscription error, attempting to reconnect...');
          setTimeout(() => {
            channel.unsubscribe();
            // Riconnessione automatica
          }, 5000);
        }
      });

    return () => {
      console.log('[GAME_SYNC] Cleaning up action listener');
      supabase.removeChannel(channel);
    };
  }, [gameSessionId, user, applyReceivedAction, lastProcessedAction]);

  return {
    sendGameAction,
    syncCompleteGameState
  };
};
