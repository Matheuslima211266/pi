
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Play, LogOut } from 'lucide-react';

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
  const bothReady = playerReady && opponentReady;

  // Auto-start game when both players are ready
  useEffect(() => {
    if (bothReady && onGameStart) {
      console.log('Both players ready, starting game in 2 seconds...');
      const timer = setTimeout(() => {
        onGameStart();
      }, 2000);
      
      return () => clearTimeout(timer);
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
            <Button
              onClick={onSignOut}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
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
                <span className={`text-sm ${playerReady ? 'text-green-400' : 'text-gray-400'}`}>
                  {playerReady ? '✅ Ready' : '⏳ Not Ready'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Opponent</span>
                <span className={`text-sm ${opponentReady ? 'text-green-400' : 'text-gray-400'}`}>
                  {opponentReady ? '✅ Ready' : '⏳ Waiting...'}
                </span>
              </div>
            </div>

            {!playerReady && (
              <Button
                onClick={onPlayerReady}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                I'm Ready!
              </Button>
            )}

            {playerReady && !opponentReady && (
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-400">
                <p className="text-green-400 font-semibold">You are ready!</p>
                <p className="text-sm text-gray-300 mt-1">Waiting for your opponent...</p>
              </div>
            )}

            {bothReady && (
              <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-400 animate-pulse">
                <p className="text-blue-400 font-semibold text-lg">Both players ready!</p>
                <p className="text-sm text-gray-300 mt-1">Starting game in 2 seconds...</p>
                <div className="mt-3">
                  <div className="w-full bg-blue-800 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full animate-pulse"></div>
                  </div>
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
