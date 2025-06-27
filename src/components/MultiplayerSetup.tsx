import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Memoizza lo stato per evitare render loops
  const currentState = useMemo(() => ({
    gameStarted: gameState?.gameStarted,
    currentSession: !!gameState?.currentSession,
    bothPlayersReady: gameState?.bothPlayersReady,
    playerReady: gameState?.playerReady,
    opponentReady: gameState?.opponentReady
  }), [gameState?.gameStarted, gameState?.currentSession, gameState?.bothPlayersReady, gameState?.playerReady, gameState?.opponentReady]);

  // Check URL for game parameter - solo una volta al mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameFromUrl = urlParams.get('game');
    if (gameFromUrl && !gameIdFromUrl) {
      console.log('[SETUP] Game ID detected from URL:', gameFromUrl);
      setGameIdFromUrl(gameFromUrl);
      setGameId(gameFromUrl);
    }
  }, []); // Solo al mount

  const createGame = useCallback(async () => {
    if (!playerName.trim()) {
      alert('Please enter your name first');
      return;
    }
    
    if (!deckLoaded) {
      alert('Please create or upload a deck first');
      return;
    }

    if (isCreatingGame) return; // Prevent double calls

    setIsCreatingGame(true);
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      console.log('[SETUP] Creating game with ID:', newGameId);
      
      const gameData = {
        gameId: newGameId,
        playerName: playerName.trim(),
        isHost: true,
        deckLoaded: true
      };
      
      const success = await onGameStart(gameData);
      
      if (success) {
        setGameId(newGameId);
        setIsHost(true);
        setGameSessionCreated(true);
        console.log('[SETUP] Game created successfully');
      } else {
        console.error('[SETUP] Failed to create game session');
        alert('Failed to create game session. Please try again.');
      }
    } catch (error) {
      console.error('[SETUP] Exception creating game:', error);
      alert('Failed to create game session. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  }, [playerName, deckLoaded, isCreatingGame, onGameStart]);

  const joinGame = useCallback(async () => {
    const targetGameId = gameId.trim().toUpperCase() || gameIdFromUrl;
    
    if (!targetGameId) {
      alert('Please enter a Game ID');
      return;
    }
    
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!deckLoaded) {
      alert('Please create or upload a deck first');
      return;
    }

    if (isJoiningGame) return; // Prevent double calls

    setIsJoiningGame(true);
    console.log('[SETUP] Attempting to join game:', targetGameId);
    
    try {
      const gameData = { 
        gameId: targetGameId,
        playerName: playerName.trim(), 
        isHost: false,
        deckLoaded: true 
      };
      
      const success = await onGameStart(gameData);
      
      if (!success) {
        alert('Failed to join game. Please check the Game ID and try again.');
        setIsJoiningGame(false);
      } else {
        console.log('[SETUP] Successfully joined game:', targetGameId);
        setIsHost(false);
      }
    } catch (error) {
      console.error('[SETUP] Exception during guest join:', error);
      alert('Failed to join game. Please try again.');
      setIsJoiningGame(false);
    }
  }, [gameId, gameIdFromUrl, playerName, deckLoaded, isJoiningGame, onGameStart]);

  const copyGameLink = useCallback(() => {
    const gameLink = `${window.location.origin}?game=${gameId}`;
    navigator.clipboard.writeText(gameLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  }, [gameId]);

  const handleDeckUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
            if (newCards.length > 0) {
              setAvailableCards(prev => [...prev, ...newCards]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading deck:', error);
        alert('Invalid deck file format');
      }
    };
    reader.readAsText(file);
  }, [onDeckLoad, availableCards]);

  const handleDeckBuilderSave = useCallback((deckData: any) => {
    setCurrentDeck(deckData);
    onDeckLoad(deckData);
    setDeckLoaded(true);
    setShowDeckBuilder(false);
  }, [onDeckLoad]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }, []);

  const handleEnterWaitingRoom = useCallback(() => {
    console.log('[SETUP] Host entering waiting room');
    if (onHostEnterWaiting) {
      onHostEnterWaiting();
    }
  }, [onHostEnterWaiting]);

  // Show waiting screen quando il gioco è iniziato e c'è una sessione attiva
  if (currentState.gameStarted && currentState.currentSession && !currentState.bothPlayersReady) {
    return (
      <WaitingForPlayersScreen
        gameData={gameState.gameData}
        playerReady={currentState.playerReady || false}
        opponentReady={currentState.opponentReady || false}
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
          {gameIdFromUrl && !currentState.gameStarted && (
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
          {!currentState.gameStarted && (
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
          {gameId && isHost && gameSessionCreated && !currentState.gameStarted && (
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
