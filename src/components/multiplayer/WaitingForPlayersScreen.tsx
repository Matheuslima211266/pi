import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Play, LogOut, RefreshCw, Bug } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WaitingForPlayersScreenProps {
  gameData: any;
  playerReady: boolean;
  opponentReady: boolean;
  onPlayerReady?: () => void;
  onSignOut: () => void;
  onGameStart?: () => void;
}

const WaitingForPlayersScreen = ({ 
  gameData, 
  playerReady, 
  opponentReady, 
  onPlayerReady, 
  onSignOut,
  onGameStart 
}: WaitingForPlayersScreenProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDebugStarting, setIsDebugStarting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const bothReady = playerReady && opponentReady;

  console.log('=== WAITING SCREEN STATE ===', {
    playerReady,
    opponentReady,
    bothReady,
    gameData: gameData?.gameId
  });

  // Debug function to check session status
  const refreshSession = async () => {
    if (!gameData?.gameId) return;
    
    setIsRefreshing(true);
    try {
      console.log('Refreshing session for game:', gameData.gameId);
      
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameData.gameId)
        .single();

      if (error) {
        console.error('Error refreshing session:', error);
      } else {
        console.log('Current session state:', data);
        setDebugInfo(data);
      }
    } catch (err) {
      console.error('Error in refreshSession:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Debug function to start game without opponent
  const startGameDebug = async () => {
    if (!gameData?.gameId || !onGameStart) return;
    
    console.log('🔧 DEBUG: Starting game without opponent');
    
    // Chiedi conferma all'utente
    const confirmed = window.confirm(
      '🔧 Debug Mode\n\n' +
      'This will start the game without an opponent.\n' +
      'You will be able to test the game mechanics solo.\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return;
    
    setIsDebugStarting(true);
    
    try {
      // Bypass database update and start game directly
      console.log('🔧 DEBUG: Bypassing database, starting game directly...');
      
      // Simula un breve delay per mostrare il feedback visivo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔧 DEBUG: Starting game...');
      onGameStart();
    } catch (err) {
      console.error('Error in startGameDebug:', err);
      alert('Debug mode failed. Please try again.');
      setIsDebugStarting(false);
    }
  };

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(refreshSession, 3000);
    refreshSession(); // Initial refresh
    
    return () => clearInterval(interval);
  }, [gameData?.gameId]);

  // Start game immediately when both players are ready
  useEffect(() => {
    if (bothReady && onGameStart) {
      console.log('Both players ready, starting game immediately...');
      onGameStart();
    }
  }, [bothReady, onGameStart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-slate-800/90 border-gold-400">
        <div className="text-center space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Users className="w-12 h-12 text-gold-400 mx-auto mb-2" />
              <h1 className="text-2xl font-bold text-white">Waiting for Players</h1>
              <p className="text-gray-400">Get ready to duel!</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshSession}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={onSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <Badge className="bg-gold-600 text-black text-lg px-4 py-2">
                {gameData?.gameId}
              </Badge>
              <p className="text-xs text-gray-400 mt-1">Game ID</p>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">You ({gameData?.playerName})</span>
                <span className={`text-sm font-semibold ${playerReady ? 'text-green-400' : 'text-yellow-400'}`}>
                  {playerReady ? '✅ Ready' : '⏳ Not Ready'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Opponent</span>
                <span className={`text-sm font-semibold ${opponentReady ? 'text-green-400' : 'text-gray-400'}`}>
                  {opponentReady ? '✅ Ready' : '⏳ Waiting...'}
                </span>
              </div>
            </div>

            {/* Debug info */}
            {debugInfo && (
              <div className="bg-slate-600/50 p-3 rounded text-xs space-y-1">
                <p className="text-yellow-400">Debug Info:</p>
                <p className="text-gray-300">Host: {debugInfo.host_name} ({debugInfo.host_ready ? 'Ready' : 'Not Ready'})</p>
                <p className="text-gray-300">Guest: {debugInfo.guest_name || 'None'} ({debugInfo.guest_ready ? 'Ready' : 'Not Ready'})</p>
                <p className="text-gray-300">Status: {debugInfo.status}</p>
              </div>
            )}

            {/* Ready button */}
            {!playerReady && onPlayerReady && (
              <Button
                onClick={() => {
                  console.log('Ready button clicked');
                  onPlayerReady();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              >
                <Play className="w-4 h-4 mr-2" />
                I'm Ready!
              </Button>
            )}

            {/* Waiting for opponent */}
            {playerReady && !opponentReady && (
              <div className="space-y-3">
                <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-400">
                  <p className="text-green-400 font-semibold">You are ready!</p>
                  <p className="text-sm text-gray-300 mt-1">Waiting for your opponent...</p>
                  <div className="mt-2">
                    <div className="animate-pulse text-yellow-400 text-lg">⏳</div>
                  </div>
                </div>
                
                {/* Debug button to start without opponent */}
                <Button
                  onClick={startGameDebug}
                  variant="outline"
                  disabled={isDebugStarting}
                  className="w-full border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black font-semibold py-2"
                >
                  <Bug className={`w-4 h-4 mr-2 ${isDebugStarting ? 'animate-spin' : ''}`} />
                  {isDebugStarting ? '🔧 Starting Solo Game...' : '🔧 Debug: Start Solo Game'}
                </Button>
              </div>
            )}

            {/* Both ready - starting game */}
            {bothReady && (
              <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-400">
                <p className="text-purple-400 font-semibold text-lg">🎮 Starting Game...</p>
                <p className="text-sm text-gray-300 mt-1">Loading duel arena...</p>
                <div className="mt-2">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WaitingForPlayersScreen;
