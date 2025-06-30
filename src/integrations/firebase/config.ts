import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Configurazione Firebase reale
const firebaseConfig = {
  apiKey: "AIzaSyAm1GdP_WinorINbc81TDNNUH3H5x3CkBo",
  authDomain: "game-card-facbf.firebaseapp.com",
  databaseURL: "https://game-card-facbf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "game-card-facbf",
  storageBucket: "game-card-facbf.firebasestorage.app",
  messagingSenderId: "929347178727",
  appId: "1:929347178727:web:cc50487af0999193355242",
  measurementId: "G-NW1HR49J4B"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza i servizi
export const database = getDatabase(app);
export const auth = getAuth(app);

console.log('🔥 [FIREBASE] Connected to real Firebase project:', firebaseConfig.projectId);

export default app; 