
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface PlayerSetupFormProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  deckLoaded: boolean;
  onDeckUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PlayerSetupForm = ({ playerName, setPlayerName, deckLoaded, onDeckUpload }: PlayerSetupFormProps) => {
  return (
    <div className="space-y-4">
      {/* Player Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Player Name
        </label>
        <Input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      {/* Deck Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Deck Upload
        </label>
        <Button
          onClick={() => document.getElementById('deck-upload')?.click()}
          className={`w-full ${deckLoaded ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          <Upload className="w-4 h-4 mr-2" />
          {deckLoaded ? 'Deck Loaded ✓' : 'Upload Deck JSON'}
        </Button>
        <input
          id="deck-upload"
          type="file"
          accept=".json"
          onChange={onDeckUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PlayerSetupForm;
