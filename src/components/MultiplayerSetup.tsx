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
  onHostEnterWaiting?: () => void;
  gameState?: any;
}

// Funzione per salvare log nel database
const saveDebugLog = async (level: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data ? JSON.stringify(data) : null
  };
  
  console.log(`[${timestamp}] SETUP_${level.toUpperCase()}: ${message}`, data || '');
  
  try {
    await supabase
      .from('debug_logs')
      .insert(logEntry);
  } catch (err) {
    console.error('Failed to save debug log:', err);
  }
};

const MultiplayerSetup = ({ 
  onGameStart, 
  onDeckLoad, 
  onPlayerReady, 
  onBothPlayersReady,
  onHostEnterWaiting,
  gameState 
}: MultiplayerSetupProps) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [deckLoaded, setDeckLoaded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [gameSessionCreated, setGameSessionCreated] = useState(false);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [gameIdFromUrl, setGameIdFromUrl] = useState('');

  useEffect(() => {
    saveDebugLog('INFO', 'MultiplayerSetup component rendered', {
      gameStarted: gameState?.gameStarted,
      currentSession: !!gameState?.currentSession,
      bothPlayersReady: gameState?.bothPlayersReady,
      playerReady: gameState?.playerReady,
      opponentReady: gameState?.opponentReady,
      gameId,
      gameIdFromUrl,
      isHost,
      gameSessionCreated,
      isJoiningGame
    });
  });

  // Check URL for game parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameFromUrl = urlParams.get('game');
    if (gameFromUrl) {
      saveDebugLog('INFO', 'Game ID detected from URL', { gameFromUrl });
      console.log('Game ID detected from URL:', gameFromUrl);
      setGameIdFromUrl(gameFromUrl);
      setGameId(gameFromUrl);
    }
  }, []);

  const createGame = async () => {
    await saveDebugLog('INFO', 'Host attempting to create game', { playerName, deckLoaded });
    
    if (!playerName.trim()) {
      await saveDebugLog('ERROR', 'Host missing player name');
      alert('Please enter your name first');
      return;
    }
    
    if (!deckLoaded) {
      await saveDebugLog('ERROR', 'Host missing deck');
      alert('Please upload a deck first');
      return;
    }

    setIsCreatingGame(true);
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      await saveDebugLog('INFO', 'Creating game with ID', { newGameId, playerName });
      console.log('Creating game with ID:', newGameId);
      
      const gameData = {
        gameId: newGameId,
        playerName: playerName.trim(),
        isHost: true,
        deckLoaded: true
      };
      
      const success = await onGameStart(gameData);
      await saveDebugLog('INFO', 'Game creation result', { success, gameData });
      console.log('Game creation result:', success);
      
      if (success) {
        setGameId(newGameId);
        setIsHost(true);
        setGameSessionCreated(true);
        await saveDebugLog('SUCCESS', 'Game created successfully', { gameId: newGameId });
        console.log('Game created successfully - showing link');
      } else {
        await saveDebugLog('ERROR', 'Failed to create game session');
        alert('Failed to create game session. Please try again.');
      }
    } catch (error) {
      await saveDebugLog('ERROR', 'Exception creating game', error);
      console.error('Error creating game:', error);
      alert('Failed to create game session. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const joinGame = async () => {
    const targetGameId = gameId.trim().toUpperCase() || gameIdFromUrl;
    
    await saveDebugLog('INFO', 'Guest attempting to join game', { 
      originalGameId: gameId, 
      targetGameId, 
      playerName, 
      deckLoaded,
      gameIdFromUrl 
    });
    
    if (!targetGameId) {
      await saveDebugLog('ERROR', 'Guest missing game ID');
      alert('Please enter a Game ID');
      return;
    }
    
    if (!playerName.trim()) {
      await saveDebugLog('ERROR', 'Guest missing player name');
      alert('Please enter your name');
      return;
    }
    
    if (!deckLoaded) {
      await saveDebugLog('ERROR', 'Guest missing deck');
      alert('Please upload a deck first');
      return;
    }

    setIsJoiningGame(true);
    await saveDebugLog('INFO', 'Setting isJoiningGame to true, calling onGameStart', { targetGameId });
    console.log('=== ATTEMPTING TO JOIN GAME ===', targetGameId);
    
    try {
      const gameData = { 
        gameId: targetGameId,
        playerName: playerName.trim(), 
        isHost: false,
        deckLoaded: true 
      };
      
      await saveDebugLog('INFO', 'Calling onGameStart for guest', gameData);
      const success = await onGameStart(gameData);
      
      await saveDebugLog('INFO', 'onGameStart result for guest', { success, gameData });
      
      if (!success) {
        await saveDebugLog('ERROR', 'Guest join failed - onGameStart returned false');
        alert('Failed to join game. Please check the Game ID and try again.');
        setIsJoiningGame(false);
      } else {
        await saveDebugLog('SUCCESS', 'Guest successfully joined', { targetGameId });
        console.log('=== SUCCESSFULLY JOINED GAME ===', targetGameId);
        setIsHost(false);
        // Non togliamo setIsJoiningGame(false) qui perché saremo reindirizzati alla waiting room
      }
    } catch (error) {
      await saveDebugLog('ERROR', 'Exception during guest join', error);
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
      setIsJoiningGame(false);
    }
  };

  const copyGameLink = () => {
    const gameLink = `${window.location.origin}?game=${gameId}`;
    navigator.clipboard.writeText(gameLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
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

  const handleEnterWaitingRoom = () => {
    console.log('=== HOST ENTERING WAITING ROOM ===');
    if (onHostEnterWaiting) {
      onHostEnterWaiting();
    }
  };

  // Show waiting screen quando il gioco è iniziato e c'è una sessione attiva
  if (gameState?.gameStarted && gameState?.currentSession && !gameState?.bothPlayersReady) {
    saveDebugLog('INFO', 'Showing waiting screen', {
      gameStarted: gameState.gameStarted,
      hasCurrentSession: !!gameState.currentSession,
      bothPlayersReady: gameState.bothPlayersReady
    });
    console.log('=== SHOWING WAITING SCREEN ===');
    
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

  // Show setup screen
  saveDebugLog('INFO', 'Showing setup screen');
  console.log('=== SHOWING SETUP SCREEN ===');
  
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

          {/* Messaggio speciale se c'è un gameId dall'URL */}
          {gameIdFromUrl && !gameState?.gameStarted && (
            <div className="p-4 bg-blue-900/40 rounded-lg border border-blue-400/50">
              <p className="text-blue-400 font-semibold text-center mb-2">
                🎮 Invitato a partecipare!
              </p>
              <p className="text-sm text-gray-300 text-center mb-3">
                Game ID: <span className="font-mono text-white">{gameIdFromUrl}</span>
              </p>
              <p className="text-xs text-yellow-300 text-center">
                ⚠️ Completa il setup sopra e poi clicca "Join Game"
              </p>
            </div>
          )}

          {/* Sezione di creazione/join del gioco */}
          {!gameState?.gameStarted && (
            <GameCreationSection
              gameId={gameId}
              setGameId={setGameId}
              playerName={playerName}
              deckLoaded={deckLoaded}
              isCreatingGame={isCreatingGame}
              onCreateGame={createGame}
              onJoinGame={joinGame}
              isJoiningGame={isJoiningGame}
            />
          )}

          {/* Mostra il GameStatusDisplay quando il gioco è stato creato ma non è ancora iniziato */}
          {gameId && isHost && gameSessionCreated && !gameState?.gameStarted && (
            <GameStatusDisplay
              gameId={gameId}
              isHost={isHost}
              gameSessionCreated={gameSessionCreated}
              linkCopied={linkCopied}
              onCopyGameLink={copyGameLink}
              onEnterWaitingRoom={handleEnterWaitingRoom}
            />
          )}

          <StatusMessage
            playerName={playerName}
            deckLoaded={deckLoaded}
            gameId={gameId}
            isHost={isHost}
            gameSessionCreated={gameSessionCreated}
          />

          {/* Loading state per join */}
          {isJoiningGame && (
            <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-400">
              <p className="text-blue-400 font-semibold">Joining game...</p>
              <p className="text-sm text-gray-300 mt-1">Please wait...</p>
              <div className="mt-2">
                <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MultiplayerSetup;
