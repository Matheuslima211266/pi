
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2 } from 'lucide-react';

interface GameCreationSectionProps {
  gameId: string;
  setGameId: (id: string) => void;
  playerName: string;
  deckLoaded: boolean;
  isCreatingGame: boolean;
  onCreateGame: () => void;
  onJoinGame: () => void;
}

const GameCreationSection = ({ 
  gameId, 
  setGameId, 
  playerName, 
  deckLoaded, 
  isCreatingGame, 
  onCreateGame, 
  onJoinGame 
}: GameCreationSectionProps) => {
  if (gameId) return null;

  return (
    <div className="space-y-2">
      <Button
        onClick={onCreateGame}
        className="w-full bg-gold-600 hover:bg-gold-700 text-black"
        disabled={!playerName.trim() || !deckLoaded || isCreatingGame}
      >
        <Share2 className="w-4 h-4 mr-2" />
        {isCreatingGame ? 'Creating...' : 'Create Game'}
      </Button>
      
      <div className="text-center text-gray-400">or</div>
      
      <div className="flex gap-2">
        <Input
          value={gameId}
          onChange={(e) => setGameId(e.target.value.toUpperCase())}
          placeholder="Game ID"
          className="bg-slate-700 border-slate-600 text-white"
        />
        <Button
          onClick={onJoinGame}
          variant="outline"
          className="border-gold-400 text-gold-400"
          disabled={!gameId.trim() || !playerName.trim() || !deckLoaded}
        >
          Join
        </Button>
      </div>
    </div>
  );
};

export default GameCreationSection;
