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
import DeckBuilder from './DeckBuilder';
import sampleCardsData from '@/data/sampleCards.json';

interface MultiplayerSetupProps {
  onGameStart: (gameData: any) => Promise<boolean>;
  onDeckLoad: (deckData: any) => void;
  onPlayerReady?: () => void;
  onBothPlayersReady?: () => void;
  onHostEnterWaiting?: () => void;
  gameState?: any;
}

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
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [availableCards, setAvailableCards] = useState(sampleCardsData.cards);
  const [currentDeck, setCurrentDeck] = useState<any>(null);

  useEffect(() => {
    console.log('[SETUP] MultiplayerSetup component rendered', {
      gameStarted: gameState?.gameStarted,
      currentSession: !!gameState?.currentSession,
      bothPlayersReady: gameState?.bothPlayersReady,
      playerReady: gameState?.playerReady,
      opponentReady: gameState?.opponentReady,
      gameId,
      gameIdFromUrl,
      isHost,
      gameSessionCreated,
      isJoiningGame,
      showDeckBuilder
    });
  });

  // Check URL for game parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameFromUrl = urlParams.get('game');
    if (gameFromUrl) {
      console.log('[SETUP] Game ID detected from URL', { gameFromUrl });
      console.log('Game ID detected from URL:', gameFromUrl);
      setGameIdFromUrl(gameFromUrl);
      setGameId(gameFromUrl);
    }
  }, []);

  const createGame = async () => {
    console.log('[SETUP] Host attempting to create game', { playerName, deckLoaded });
    
    if (!playerName.trim()) {
      console.error('[SETUP] Host missing player name');
      alert('Please enter your name first');
      return;
    }
    
    if (!deckLoaded) {
      console.error('[SETUP] Host missing deck');
      alert('Please create or upload a deck first');
      return;
    }

    setIsCreatingGame(true);
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      console.log('[SETUP] Creating game with ID', { newGameId, playerName });
      console.log('Creating game with ID:', newGameId);
      
      const gameData = {
        gameId: newGameId,
        playerName: playerName.trim(),
        isHost: true,
        deckLoaded: true
      };
      
      const success = await onGameStart(gameData);
      console.log('[SETUP] Game creation result', { success, gameData });
      console.log('Game creation result:', success);
      
      if (success) {
        setGameId(newGameId);
        setIsHost(true);
        setGameSessionCreated(true);
        console.log('[SETUP] Game created successfully', { gameId: newGameId });
        console.log('Game created successfully - showing link');
      } else {
        console.error('[SETUP] Failed to create game session');
        alert('Failed to create game session. Please try again.');
      }
    } catch (error) {
      console.error('[SETUP] Exception creating game', error);
      console.error('Error creating game:', error);
      alert('Failed to create game session. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const joinGame = async () => {
    const targetGameId = gameId.trim().toUpperCase() || gameIdFromUrl;
    
    console.log('[SETUP] Guest attempting to join game', { 
      originalGameId: gameId, 
      targetGameId, 
      playerName, 
      deckLoaded,
      gameIdFromUrl 
    });
    
    if (!targetGameId) {
      console.error('[SETUP] Guest missing game ID');
      alert('Please enter a Game ID');
      return;
    }
    
    if (!playerName.trim()) {
      console.error('[SETUP] Guest missing player name');
      alert('Please enter your name');
      return;
    }
    
    if (!deckLoaded) {
      console.error('[SETUP] Guest missing deck');
      alert('Please create or upload a deck first');
      return;
    }

    setIsJoiningGame(true);
    console.log('[SETUP] Setting isJoiningGame to true, calling onGameStart', { targetGameId });
    console.log('=== ATTEMPTING TO JOIN GAME ===', targetGameId);
    
    try {
      const gameData = { 
        gameId: targetGameId,
        playerName: playerName.trim(), 
        isHost: false,
        deckLoaded: true 
      };
      
      console.log('[SETUP] Calling onGameStart for guest', gameData);
      const success = await onGameStart(gameData);
      
      console.log('[SETUP] onGameStart result for guest', { success, gameData });
      
      if (!success) {
        console.error('[SETUP] Guest join failed - onGameStart returned false');
        alert('Failed to join game. Please check the Game ID and try again.');
        setIsJoiningGame(false);
      } else {
        console.log('[SETUP] Guest successfully joined', { targetGameId });
        console.log('=== SUCCESSFULLY JOINED GAME ===', targetGameId);
        setIsHost(false);
      }
    } catch (error) {
      console.error('[SETUP] Exception during guest join', error);
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
            setCurrentDeck(deckData);
            onDeckLoad(deckData);
            setDeckLoaded(true);
            
            // Se il deck contiene carte, aggiungile alle disponibili
            if (deckData.cards) {
              const newCards = deckData.cards.filter((card: any) => 
                !availableCards.some(existing => existing.id === card.id)
              );
              setAvailableCards([...availableCards, ...newCards]);
            }
          }
        } catch (error) {
          console.error('Error loading deck:', error);
          alert('Invalid deck file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeckBuilderSave = (deckData: any) => {
    setCurrentDeck(deckData);
    onDeckLoad(deckData);
    setDeckLoaded(true);
    setShowDeckBuilder(false);
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
    console.log('[SETUP] Showing waiting screen', {
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

  // Show deck builder
  if (showDeckBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
        <div className="mb-4 text-center">
          <Button
            onClick={() => setShowDeckBuilder(false)}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            ← Torna al Setup
          </Button>
        </div>
        <DeckBuilder
          availableCards={availableCards}
          onDeckSave={handleDeckBuilderSave}
          initialDeck={currentDeck}
        />
      </div>
    );
  }

  // Show setup screen
  console.log('[SETUP] Showing setup screen');
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

          {/* Deck Builder Section */}
          <div className="space-y-2">
            <Button
              onClick={() => setShowDeckBuilder(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              🔧 Costruisci Deck
            </Button>
            {currentDeck && (
              <div className="p-2 bg-purple-900/30 rounded border border-purple-400/50 text-center">
                <span className="text-purple-400 text-sm font-semibold">
                  {currentDeck.name} - {currentDeck.totalCards || (currentDeck.mainDeck?.length + currentDeck.extraDeck?.length) || currentDeck.cards?.length || 0} carte
                </span>
              </div>
            )}
          </div>

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
