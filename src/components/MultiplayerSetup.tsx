
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import PlayerSetupForm from './multiplayer/PlayerSetupForm';
import GameCreationSection from './multiplayer/GameCreationSection';
import GameStatusDisplay from './multiplayer/GameStatusDisplay';
import WaitingForPlayersScreen from './multiplayer/WaitingForPlayersScreen';
import StatusMessage from './multiplayer/StatusMessage';

interface MultiplayerSetupProps {
  onGameStart: (gameData: any) => Promise<boolean>;
  onDeckLoad: (deckData: any) => void;
  onPlayerReady?: () => void;
  onBothPlayersReady?: () => void;
  gameState?: any;
}

const MultiplayerSetup = ({ 
  onGameStart, 
  onDeckLoad, 
  onPlayerReady, 
  onBothPlayersReady,
  gameState 
}: MultiplayerSetupProps) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [deckLoaded, setDeckLoaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameSessionCreated, setGameSessionCreated] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Check URL for game parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameFromUrl = urlParams.get('game');
    if (gameFromUrl) {
      setGameId(gameFromUrl);
      setIsHost(false);
      console.log('Game ID from URL:', gameFromUrl);
    }
  }, []);

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
    
    try {
      console.log('Creating game with ID:', newGameId);
      
      const gameData = {
        gameId: newGameId,
        playerName: playerName.trim(),
        isHost: true,
        deckLoaded: true
      };
      
      const success = await onGameStart(gameData);
      console.log('Game creation result:', success);
      
      if (success) {
        setGameId(newGameId);
        setIsHost(true);
        setGameSessionCreated(true);
        console.log('Game created successfully');
      } else {
        alert('Failed to create game session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game session. Please try again.');
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
      } else {
        console.log('Successfully joined game');
        setIsHost(false);
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

  // Show waiting screen when game has started but not both players ready
  if (gameState?.gameStarted && gameState?.currentSession && !gameState?.bothPlayersReady) {
    console.log('Showing waiting screen with state:', {
      gameStarted: gameState.gameStarted,
      currentSession: !!gameState.currentSession,
      bothPlayersReady: gameState.bothPlayersReady,
      playerReady: gameState.playerReady,
      opponentReady: gameState.opponentReady
    });
    
    return (
      <WaitingForPlayersScreen
        gameData={gameState.gameData}
        playerReady={gameState.playerReady || false}
        opponentReady={gameState.opponentReady || false}
        onPlayerReady={onPlayerReady}
        onSignOut={handleSignOut}
        onGameStart={onBothPlayersReady}
      />
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
          <PlayerSetupForm
            playerName={playerName}
            setPlayerName={setPlayerName}
            deckLoaded={deckLoaded}
            onDeckUpload={handleDeckUpload}
          />

          <GameCreationSection
            gameId={gameId}
            setGameId={setGameId}
            playerName={playerName}
            deckLoaded={deckLoaded}
            isCreatingGame={isCreatingGame}
            onCreateGame={createGame}
            onJoinGame={joinGame}
          />

          <GameStatusDisplay
            gameId={gameId}
            isHost={isHost}
            gameSessionCreated={gameSessionCreated}
            linkCopied={linkCopied}
            onCopyGameLink={copyGameLink}
          />

          <StatusMessage
            playerName={playerName}
            deckLoaded={deckLoaded}
            gameId={gameId}
            isHost={isHost}
            gameSessionCreated={gameSessionCreated}
          />
        </div>
      </Card>
    </div>
  );
};

export default MultiplayerSetup;
