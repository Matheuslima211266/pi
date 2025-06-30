import React, { useState } from 'react';
import { useFirebaseMultiplayer } from '../hooks/useFirebaseMultiplayer';
import { useForceSync } from '../hooks/useForceSync';

interface MultiplayerDebugPanelProps {
  gameState: any;
  firebaseHook: ReturnType<typeof useFirebaseMultiplayer>;
  isVisible?: boolean;
}

const MultiplayerDebugPanel: React.FC<MultiplayerDebugPanelProps> = ({ 
  gameState,
  firebaseHook,
  isVisible = false 
}) => {
  const forceSync = useForceSync(gameState);

  // Local state per mostrare/nascondere il pannello
  const [isOpen, setIsOpen] = useState(false);

  if (!isVisible) return null;

  // Pulsante flottante quando il pannello è chiuso
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-black/70 hover:bg-black/90 text-green-400 border border-green-500 rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg"
        title="Apri Debug Firebase"
      >
        🔥
      </button>
    );
  }

  const handleTestConnection = async () => {
    console.log('🧪 [DEBUG] Testing Firebase connection...');
    const result = await firebaseHook.testConnection();
    if (result) {
      console.log('✅ [DEBUG] Connection test successful');
    } else {
      console.log('❌ [DEBUG] Connection test failed');
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg max-w-md z-50 text-xs">
      {/* Pulsante chiudi */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md"
        title="Chiudi Debug"
      >
        ×
      </button>
      <h3 className="font-bold mb-2 text-green-400">🔥 Firebase Debug</h3>
      
      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Connection:</span>
          <span className={`ml-2 ${firebaseHook.error ? 'text-red-400' : 'text-green-400'}`}>
            {firebaseHook.error ? '❌ Error' : '✅ Connected'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">User:</span>
          <span className="ml-2 text-blue-400">
            {firebaseHook.user?.uid ? firebaseHook.user.uid.substring(0, 8) + '...' : '❌ Not authenticated'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Session:</span>
          <span className="ml-2 text-yellow-400">
            {firebaseHook.currentSession?.gameId || '❌ No session'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Opponent Ready:</span>
          <span className={`ml-2 ${firebaseHook.opponentReady ? 'text-green-400' : 'text-red-400'}`}>
            {firebaseHook.opponentReady ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">My Game State:</span>
          <span className="ml-2 text-blue-400">
            {firebaseHook.myGameState ? '✅ Available' : '❌ Not available'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Opponent Game State:</span>
          <span className="ml-2 text-blue-400">
            {firebaseHook.opponentGameState ? '✅ Available' : '❌ Not available'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Game Data:</span>
          <span className="ml-2 text-purple-400">
            {gameState?.gameData?.isHost ? '✅ Host' : gameState?.gameData?.gameId ? '✅ Guest' : '❌ No data'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Player Ready:</span>
          <span className={`ml-2 ${gameState?.playerReady ? 'text-green-400' : 'text-red-400'}`}>
            {gameState?.playerReady ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Both Ready:</span>
          <span className={`ml-2 ${gameState?.bothPlayersReady ? 'text-green-400' : 'text-red-400'}`}>
            {gameState?.bothPlayersReady ? '✅ Yes' : '❌ No'}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={handleTestConnection}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
        >
          🧪 Test Connection
        </button>
        
        <button
          onClick={forceSync.forceSync}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
        >
          🔄 Force Sync
        </button>
        
        <button
          onClick={firebaseHook.resetSession}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
        >
          🔄 Reset Session
        </button>
      </div>

      {firebaseHook.error && (
        <div className="mt-2 p-2 bg-red-900/50 border border-red-400 rounded text-xs">
          <span className="text-red-400 font-semibold">Error:</span>
          <span className="text-red-300 ml-1">{firebaseHook.error}</span>
        </div>
      )}
    </div>
  );
};

export default MultiplayerDebugPanel; 