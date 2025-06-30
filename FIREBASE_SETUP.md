# Firebase Setup Guide

Questo documento ti guiderà attraverso la configurazione di Firebase per sostituire Supabase nel tuo gioco multiplayer.

## 1. Crea un progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca "Crea un progetto"
3. Inserisci un nome per il progetto (es. "yugiduel-multiplayer")
4. Segui i passaggi per creare il progetto

## 2. Abilita i servizi necessari

### Realtime Database
1. Nel menu laterale, clicca "Realtime Database"
2. Clicca "Crea database"
3. Scegli "Avvia in modalità test" (per ora)
4. Scegli una regione (es. "us-central1")

### Authentication
1. Nel menu laterale, clicca "Authentication"
2. Clicca "Inizia"
3. Nella scheda "Sign-in method", abilita "Anonimo"

## 3. Configura le regole del database

Nella sezione Realtime Database, vai su "Regole" e sostituisci con:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true
      }
    },
    "gameStates": {
      "$sessionId": {
        "$playerId": {
          ".read": true,
          ".write": "auth != null"
        }
      }
    }
  }
}
```

## 4. Ottieni la configurazione

1. Nella pagina principale del progetto, clicca l'icona ⚙️ (Impostazioni)
2. Clicca "Impostazioni progetto"
3. Scorri fino a "Le tue app" e clicca l'icona web (</>)
4. Registra l'app con un nome (es. "yugiduel-web")
5. Copia la configurazione che appare

## 5. Aggiorna il file di configurazione

Sostituisci il contenuto di `src/integrations/firebase/config.ts` con la tua configurazione:

```typescript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "la-tua-api-key",
  authDomain: "il-tuo-progetto.firebaseapp.com",
  databaseURL: "https://il-tuo-progetto-default-rtdb.firebaseio.com",
  projectId: "il-tuo-project-id",
  storageBucket: "il-tuo-progetto.appspot.com",
  messagingSenderId: "123456789",
  appId: "il-tuo-app-id"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;
```

## 6. Sostituisci Supabase con Firebase

Nel file `src/pages/Index.tsx`, sostituisci:

```typescript
// Vecchio import
import { useSupabaseMultiplayer } from '../hooks/useSupabaseMultiplayer';

// Nuovo import
import { useFirebaseSync } from '../hooks/useFirebaseSync';

// Sostituisci l'uso del hook
const multiplayerHook = useFirebaseSync(gameState);
```

## 7. Testa la configurazione

1. Avvia l'applicazione: `npm run dev`
2. Apri due finestre del browser
3. Crea una sessione di gioco in una finestra
4. Unisciti alla sessione nell'altra finestra
5. Verifica che i log mostrino messaggi Firebase invece di Supabase

## Vantaggi di Firebase

✅ **Sincronizzazione in tempo reale** - Nessun polling necessario
✅ **Autenticazione semplice** - Login anonimo automatico
✅ **Scalabilità** - Gestisce automaticamente il carico
✅ **Offline support** - Funziona anche senza connessione
✅ **Regole di sicurezza** - Controllo accesso granulare
✅ **Hosting integrato** - Deploy facile

## Struttura del database

```
yugiduel-multiplayer/
├── sessions/
│   └── {gameId}/
│       ├── hostId: "user123"
│       ├── guestId: "user456"
│       ├── hostName: "Player1"
│       ├── guestName: "Player2"
│       ├── hostReady: true
│       ├── guestReady: true
│       └── status: "active"
└── gameStates/
    └── {gameId}/
        ├── {hostId}/
        │   ├── playerField: {...}
        │   ├── playerLifePoints: 8000
        │   └── lastUpdate: 1234567890
        └── {guestId}/
            ├── playerField: {...}
            ├── playerLifePoints: 8000
            └── lastUpdate: 1234567890
```

## Risoluzione problemi

### Errore "Permission denied"
- Verifica che le regole del database permettano lettura/scrittura
- Assicurati che l'autenticazione anonima sia abilitata

### Errore "Database not found"
- Verifica che l'URL del database sia corretto
- Assicurati che il Realtime Database sia stato creato

### Sincronizzazione non funziona
- Controlla i log della console per errori Firebase
- Verifica che entrambi i giocatori siano autenticati

## Prossimi passi

1. Testa la sincronizzazione base
2. Implementa la gestione degli errori
3. Aggiungi regole di sicurezza più restrittive
4. Configura l'hosting Firebase per il deploy 