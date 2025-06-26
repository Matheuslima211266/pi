import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Upload, Users, Copy, Check, Link, Play, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MultiplayerSetupProps {
  onGameStart: (gameData: any) => Promise<boolean>;
  onDeckLoad: (deckData: any) => void;
  onPlayerReady?: () => void;
  gameState?: any;
}

const MultiplayerSetup = ({ onGameStart, onDeckLoad, onPlayerReady, gameState }: MultiplayerSetupProps) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [deckLoaded, setDeckLoaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameSessionCreated, setGameSessionCreated] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Always call useEffect hooks in the same order
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameFromUrl = urlParams.get('game');
    if (gameFromUrl) {
      setGameId(gameFromUrl);
    }
  }, []);

  // Move the auto-start logic to a separate useEffect that always runs
  useEffect(() => {
    if (gameState?.gameStarted && !gameState?.bothPlayersReady) {
      const bothReady = gameState?.playerReady && gameState?.opponentReady;
      if (bothReady && !gameState?.bothPlayersReady) {
        gameState?.setBothPlayersReady(true);
      }
    }
  }, [gameState?.playerReady, gameState?.opponentReady, gameState?.bothPlayersReady, gameState?.gameStarted, gameState]);

  const createGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name first');
      return;
    }
    
    if (!deckLoaded) {
      alert('Please upload a deck first');
      return;
    }

    setIsCreatingGame(true);
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(newGameId);
    setIsHost(true);
    
    try {
      // Create the game session in the database
      console.log('Creating game session for:', newGameId);
      const gameData = {
        gameId: newGameId,
        playerName: playerName,
        isHost: true,
        deckLoaded: true
      };
      
      const success = await onGameStart(gameData);
      if (success) {
        setGameSessionCreated(true);
      } else {
        alert('Failed to create game session. Please try again.');
        setGameId('');
        setIsHost(false);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game session. Please try again.');
      setGameId('');
      setIsHost(false);
    } finally {
      setIsCreatingGame(false);
    }
  };

  const joinGame = async () => {
    if (!gameId.trim()) {
      alert('Please enter a Game ID');
      return;
    }
    
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!deckLoaded) {
      alert('Please upload a deck first');
      return;
    }

    console.log('Attempting to join game:', gameId);
    try {
      const success = await onGameStart({ 
        gameId: gameId.trim().toUpperCase(),
        playerName: playerName.trim(), 
        isHost: false,
        deckLoaded: true 
      });
      
      if (!success) {
        alert('Failed to join game. Please check the Game ID and try again.');
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Se il gioco è già iniziato ma non tutti i giocatori sono pronti
  if (gameState?.gameStarted && !gameState?.bothPlayersReady) {
    const bothReady = gameState?.playerReady && gameState?.opponentReady;
    
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
                onClick={handleSignOut}
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
                  {gameState?.gameData?.gameId}
                </Badge>
                <p className="text-xs text-gray-400 mt-1">Game ID</p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">You ({gameState?.gameData?.playerName})</span>
                  <span className={`text-sm ${gameState?.playerReady ? 'text-green-400' : 'text-gray-400'}`}>
                    {gameState?.playerReady ? '✅ Ready' : '⏳ Not Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Opponent</span>
                  <span className={`text-sm ${gameState?.opponentReady ? 'text-green-400' : 'text-gray-400'}`}>
                    {gameState?.opponentReady ? '✅ Ready' : '⏳ Waiting...'}
                  </span>
                </div>
              </div>

              {!gameState?.playerReady && (
                <Button
                  onClick={onPlayerReady}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  I'm Ready!
                </Button>
              )}

              {gameState?.playerReady && !gameState?.opponentReady && (
                <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-400">
                  <p className="text-green-400 font-semibold">You are ready!</p>
                  <p className="text-sm text-gray-300 mt-1">Waiting for your opponent...</p>
                </div>
              )}

              {bothReady && (
                <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-400">
                  <p className="text-blue-400 font-semibold">Both players ready!</p>
                  <p className="text-sm text-gray-300 mt-1">Starting game...</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-slate-800/90 border-gold-400">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <Users className="w-12 h-12 text-gold-400 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">Yu-Gi-Oh! Duel</h1>
            <p className="text-gray-400">Multiplayer Setup</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </Button>
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
                  onClick={joinGame}
                  variant="outline"
                  className="border-gold-400 text-gold-400"
                  disabled={!gameId.trim() || !playerName.trim() || !deckLoaded}
                >
                  Join
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <Badge className="bg-gold-600 text-black text-lg px-4 py-2">
                  {gameId}
                </Badge>
                <p className="text-xs text-gray-400 mt-1">Game ID</p>
              </div>
              
              {isHost && gameSessionCreated && (
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
                    <p className="text-xs text-gray-300 mb-2">Share this link:</p>
                    <div className="bg-slate-600 p-2 rounded text-xs text-white break-all">
                      {window.location.origin}?game={gameId}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-400">
                    <p className="text-green-400 font-semibold">Game created successfully!</p>
                    <p className="text-sm text-gray-300 mt-1">Waiting for opponent to join...</p>
                  </div>
                </div>
              )}

              {!isHost && (
                <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-400">
                  <p className="text-blue-400 font-semibold">Joining game...</p>
                  <p className="text-sm text-gray-300 mt-1">Please wait...</p>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="text-center text-sm text-gray-400">
            {!playerName.trim() && 'Enter your name to continue'}
            {playerName.trim() && !deckLoaded && 'Upload your deck to continue'}
            {playerName.trim() && deckLoaded && !gameId && 'Create or join a game'}
            {playerName.trim() && deckLoaded && gameId && isHost && gameSessionCreated && 'Game created! Share the link with your opponent'}
            {playerName.trim() && deckLoaded && gameId && !isHost && 'Joining game...'}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MultiplayerSetup;
