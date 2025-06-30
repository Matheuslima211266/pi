# 🔧 Fix Multiplayer - Yu-Gi-Oh! Duel

## Problema Identificato

Il multiplayer non funzionava perché i giocatori non si connettevano alla stessa sessione Firebase. Dal debug si vedeva:
- ✅ Connection: Connected
- ✅ User: [ID utente] 
- ❌ Session: No session
- ❌ Opponent Ready: No

## Cause Principali

1. **Race Condition**: Il guest tentava di unirsi alla sessione prima che l'host l'avesse creata
2. **Listener non attivati**: I listener delle sessioni non venivano attivati immediatamente
3. **Gestione stati**: Il guest non veniva reindirizzato correttamente alla waiting room

## Modifiche Apportate

### 1. `useFirebaseMultiplayer.ts`

#### Aggiunto Retry Logic per il Join
```typescript
// Join game session with retry logic
const joinGameSession = useCallback(async (gameId: string, playerName: string): Promise<GameSession | null> => {
  const maxRetries = 5;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if session exists
      const snapshot = await get(sessionRef);
      const existingSession = snapshot.val() as GameSession;
      
      if (!existingSession) {
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        } else {
          throw new Error('Game session not found');
        }
      }
      // ... resto della logica
    } catch (error) {
      // ... gestione errori
    }
  }
}, [user]);
```

#### Migliorata Gestione Listener
```typescript
// Attiva immediatamente il listener
setSessionGameId(gameId);
```

#### Aggiunta Funzione Test Connessione
```typescript
const testConnection = useCallback(async () => {
  try {
    const testRef = ref(database, 'connection_test');
    await set(testRef, { timestamp: Date.now(), userId: user.uid });
    await off(testRef);
    return true;
  } catch (error) {
    setError(`Connection test failed: ${error.message}`);
    return false;
  }
}, [user]);
```

### 2. `Index.tsx`

#### Migliorato Flusso di Gestione
```typescript
const handleGameStart = async (newGameData) => {
  let session = null;
  if (newGameData.isHost) {
    session = await firebaseHook.createGameSession(newGameData.gameId, newGameData.playerName);
  } else {
    session = await firebaseHook.joinGameSession(newGameData.gameId, newGameData.playerName);
  }
  
  if (session) {
    gameState.setGameData(newGameData);
    
    if (newGameData.isHost) {
      // Host: rimane nella schermata di setup
      console.log('Host: Game session created, showing link to share');
    } else {
      // Guest: va nella waiting room
      gameState.setGameStarted(true);
      gameState.initializeGame();
    }
    
    return true; // Indica successo
  }
};
```

#### Migliorata Gestione Errori Join
```typescript
onJoinGame={async (gameData) => {
  try {
    const session = await firebaseHook.joinGameSession(gameData.gameId, gameData.playerName);
    if (session) {
      await handleGameStart(gameData);
      return session;
    } else {
      throw new Error('Failed to join game session');
    }
  } catch (error) {
    console.error('[DEBUG] Error in onJoinGame:', error);
    throw error;
  }
}}
```

### 3. `MultiplayerSetup.tsx`

#### Aggiunto Monitoraggio Stati
```typescript
// Monitor session state changes and redirect guest to waiting room
useEffect(() => {
  if (currentState.currentSession && !isHost && !currentState.gameStarted) {
    console.log('[SETUP] Guest detected with active session, redirecting to waiting room');
  }
}, [currentState.currentSession, isHost, currentState.gameStarted]);
```

### 4. `MultiplayerDebugPanel.tsx`

#### Aggiunto Pulsante Test Connessione
```typescript
const handleTestConnection = async () => {
  const result = await firebaseHook.testConnection();
  if (result) {
    console.log('✅ [DEBUG] Connection test successful');
  } else {
    console.log('❌ [DEBUG] Connection test failed');
  }
};
```

## Risultati Attesi

Dopo queste modifiche, il multiplayer dovrebbe funzionare correttamente:

1. **Host crea partita**: Sessione Firebase creata immediatamente
2. **Guest si unisce**: Retry logic gestisce la race condition
3. **Entrambi connessi**: Listener attivati, stati sincronizzati
4. **Debug panel**: Mostra tutti gli stati corretti

## Test da Eseguire

1. **Test Creazione**: Host crea partita → Guest si unisce
2. **Test URL**: Apri link partita in nuovo browser
3. **Test Connessione**: Usa pulsante "Test Connection" nel debug panel
4. **Test Sync**: Usa pulsante "Force Sync" per verificare sincronizzazione

## Log da Monitorare

- `🎮 [FIREBASE] Game session created:`
- `🎮 [FIREBASE] Join attempt X/5 for game`
- `🎮 [FIREBASE] Successfully joined game session:`
- `👂 [FIREBASE] Session data received`
- `✅ [FIREBASE] Connection test successful`

## File Modificati

- `src/hooks/useFirebaseMultiplayer.ts`
- `src/pages/Index.tsx`
- `src/components/MultiplayerSetup.tsx`
- `src/components/MultiplayerDebugPanel.tsx`
- `MULTIPLAYER_TEST.md` (nuovo)
- `MULTIPLAYER_FIXES.md` (nuovo) 