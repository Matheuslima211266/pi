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
      console.log('[GAME_SYNC] Sending action', { actionType, actionData });
      
      const { error } = await supabase
        .from('game_actions_realtime')
        .insert({
          game_session_id: gameSessionId,
          player_id: user.id,
          player_name: gameState.gameData?.playerName || 'Player',
          action_type: actionType,
          action_data: actionData
        });

      if (error) {
        console.error('[GAME_SYNC] Error sending action', error);
      } else {
        console.log('[GAME_SYNC] Action sent successfully');
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

    switch (action_type) {
      case 'CARD_PLACED':
        console.log('[GAME_SYNC] Applying CARD_PLACED', action_data);
        gameState.setEnemyField((prev: any) => {
          const newField = { ...prev };
          
          if (action_data.zoneName === 'monsters') {
            newField.monsters = [...prev.monsters];
            newField.monsters[action_data.slotIndex] = action_data.card;
          } else if (action_data.zoneName === 'spellsTraps') {
            newField.spellsTraps = [...prev.spellsTraps];
            newField.spellsTraps[action_data.slotIndex] = action_data.card;
          } else if (action_data.zoneName === 'fieldSpell') {
            newField.fieldSpell = [action_data.card];
          }
          
          console.log('[GAME_SYNC] Enemy field updated:', newField);
          return newField;
        });
        break;

      case 'LIFE_POINTS_CHANGED':
        console.log('[GAME_SYNC] Applying LIFE_POINTS_CHANGED', action_data);
        // L'avversario ha cambiato i suoi punti vita
        // Se isPlayer è true nell'action_data, significa che l'avversario ha cambiato i suoi punti
        // Per noi, i punti dell'avversario sono enemyLifePoints
        gameState.setEnemyLifePoints(action_data.newLifePoints);
        console.log('[GAME_SYNC] Enemy life points updated to:', action_data.newLifePoints);
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
        gameState.setIsPlayerTurn(!gameState.isPlayerTurn);
        break;

      case 'CARD_DRAWN':
        console.log('[GAME_SYNC] Applying CARD_DRAWN', action_data);
        // L'avversario ha pescato una carta - aggiorna il conteggio delle sue carte
        gameState.setEnemyField((prev: any) => ({
          ...prev,
          deck: prev.deck.slice(1) // Rimuovi una carta dal deck nemico
        }));
        break;

      case 'CARD_MOVED':
        console.log('[GAME_SYNC] Applying CARD_MOVED', action_data);
        // Gestisce il movimento delle carte dell'avversario
        gameState.setEnemyField((prev: any) => {
          const newField = { ...prev };
          const { card, fromZone, toZone, slotIndex } = action_data;
          
          // Rimuovi dalla zona di origine
          if (fromZone === 'monsters') {
            newField.monsters = [...prev.monsters];
            const sourceIndex = prev.monsters.findIndex((m: any) => m && m.id === card.id);
            if (sourceIndex !== -1) newField.monsters[sourceIndex] = null;
          } else if (fromZone === 'spellsTraps') {
            newField.spellsTraps = [...prev.spellsTraps];
            const sourceIndex = prev.spellsTraps.findIndex((s: any) => s && s.id === card.id);
            if (sourceIndex !== -1) newField.spellsTraps[sourceIndex] = null;
          }
          
          // Aggiungi alla zona di destinazione
          if (toZone === 'graveyard') {
            newField.graveyard = [...prev.graveyard, card];
          } else if (toZone === 'banished') {
            newField.banished = [...prev.banished, card];
          }
          
          return newField;
        });
        break;

      default:
        console.log('[GAME_SYNC] Unknown action type', action_type);
    }
  }, [user?.id, gameState]);

  // Sincronizza lo stato completo (versione semplificata)
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

  // Ascolta le azioni in tempo reale
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
          
          // Evita di processare la stessa azione due volte
          if (action.id !== lastProcessedAction) {
            applyReceivedAction(action);
            setLastProcessedAction(action.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('[GAME_SYNC] Action listener subscription status', status);
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
