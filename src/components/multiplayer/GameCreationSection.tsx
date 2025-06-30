import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Gamepad2, Users, Loader2 } from 'lucide-react';

interface GameCreationSectionProps {
  gameId: string;
  setGameId: (gameId: string) => void;
  playerName: string;
  deckLoaded: boolean;
  isCreatingGame: boolean;
  onCreateGame: () => void;
  onJoinGame: () => void;
  isJoiningGame?: boolean;
  currentSession: boolean;
}

const GameCreationSection = ({ 
  gameId, 
  setGameId, 
  playerName, 
  deckLoaded, 
  isCreatingGame, 
  onCreateGame, 
  onJoinGame,
  isJoiningGame = false,
  currentSession
}: GameCreationSectionProps) => {
  const canCreateGame = playerName.trim() && deckLoaded && !isCreatingGame && !currentSession;
  const canJoinGame = gameId.trim() && playerName.trim() && deckLoaded && !isJoiningGame;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex justify-center">
          <Button
            onClick={onCreateGame}
            disabled={!canCreateGame}
            className="w-full bg-gold-600 hover:bg-gold-700 text-black font-semibold disabled:opacity-50"
            size="lg"
          >
            {isCreatingGame ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4 mr-2" />
                Create New Game
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-gray-400 text-sm">OR</div>

        <div className="space-y-3">
          <Input
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value.toUpperCase())}
            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 text-center font-mono text-lg"
            disabled={isJoiningGame}
          />
          
          <Button
            onClick={onJoinGame}
            disabled={!canJoinGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            size="lg"
          >
            {isJoiningGame ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Join Game
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCreationSection;
