
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Upload, Users, Copy, Check, Link } from 'lucide-react';

interface MultiplayerSetupProps {
  onGameStart: (gameData: any) => void;
  onDeckLoad: (deckData: any) => void;
}

const MultiplayerSetup = ({ onGameStart, onDeckLoad }: MultiplayerSetupProps) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [deckLoaded, setDeckLoaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const createGame = () => {
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(newGameId);
    setIsHost(true);
    
    // Store game data in localStorage for sharing
    const gameData = {
      gameId: newGameId,
      host: playerName,
      created: Date.now()
    };
    localStorage.setItem(`yugiduel_${newGameId}`, JSON.stringify(gameData));
  };

  const joinGame = () => {
    if (gameId) {
      const storedGame = localStorage.getItem(`yugiduel_${gameId}`);
      if (storedGame) {
        const gameData = JSON.parse(storedGame);
        onGameStart({ ...gameData, player: playerName, joined: true });
      } else {
        alert('Game not found! Make sure the game ID is correct.');
      }
    }
  };

  const copyGameLink = () => {
    const gameLink = `${window.location.origin}?game=${gameId}`;
    navigator.clipboard.writeText(gameLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDeckUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const deckData = JSON.parse(result);
            onDeckLoad(deckData);
            setDeckLoaded(true);
          }
        } catch (error) {
          console.error('Error loading deck:', error);
          alert('Invalid deck file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const startGame = () => {
    if (playerName && deckLoaded) {
      onGameStart({
        gameId,
        playerName,
        isHost,
        deckLoaded: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-slate-800/90 border-gold-400">
        <div className="text-center mb-6">
          <Users className="w-12 h-12 text-gold-400 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">Yu-Gi-Oh! Duel</h1>
          <p className="text-gray-400">Multiplayer Setup</p>
        </div>

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
              onChange={handleDeckUpload}
              className="hidden"
            />
          </div>

          {/* Game Creation/Joining */}
          {!gameId ? (
            <div className="space-y-2">
              <Button
                onClick={createGame}
                className="w-full bg-gold-600 hover:bg-gold-700 text-black"
                disabled={!playerName}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Create Game
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
                  onClick={joinGame}
                  variant="outline"
                  className="border-gold-400 text-gold-400"
                  disabled={!gameId || !playerName}
                >
                  Join
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <Badge className="bg-gold-600 text-black text-lg px-4 py-2">
                  Game ID: {gameId}
                </Badge>
              </div>
              
              {isHost && (
                <div className="space-y-2">
                  <Button
                    onClick={copyGameLink}
                    variant="outline"
                    className="w-full border-gold-400 text-gold-400"
                  >
                    {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                    {linkCopied ? 'Link Copied!' : 'Copy Game Link'}
                  </Button>
                  
                  <div className="bg-slate-700 p-3 rounded text-center">
                    <p className="text-xs text-gray-300 mb-2">Share this with your friend:</p>
                    <div className="bg-slate-600 p-2 rounded text-xs text-white break-all">
                      {window.location.origin}?game={gameId}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!playerName || !deckLoaded}
              >
                Start Duel
              </Button>
            </div>
          )}

          {/* Status */}
          <div className="text-center text-sm text-gray-400">
            {!playerName && 'Enter your name to continue'}
            {playerName && !deckLoaded && 'Upload your deck to continue'}
            {playerName && deckLoaded && !gameId && 'Create or join a game'}
            {playerName && deckLoaded && gameId && 'Ready to duel!'}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MultiplayerSetup;
