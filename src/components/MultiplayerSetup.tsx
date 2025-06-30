import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onJoinGame: (gameData: any) => Promise<any>;
}

const MultiplayerSetup = ({ 
  onGameStart, 
  onDeckLoad, 
  onPlayerReady, 
  onBothPlayersReady,
  onHostEnterWaiting,
  gameState,
  onJoinGame
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
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [startingLP, setStartingLP] = useState(100);
  const [summonLimit, setSummonLimit] = useState(5);

  // Memoizza lo stato per evitare render loops
  const currentState = useMemo(() => ({
    gameStarted: gameState?.gameStarted || false,
    currentSession: !!gameState?.currentSession,
    bothPlayersReady: gameState?.bothPlayersReady || false,
    playerReady: gameState?.playerReady || false,
    opponentReady: gameState?.opponentReady || false
  }), [gameState?.gameStarted, gameState?.currentSession, gameState?.bothPlayersReady, gameState?.playerReady, gameState?.opponentReady]);

  console.log('[SETUP] MultiplayerSetup component rendered', {
    gameStarted: currentState.gameStarted,
    currentSession: currentState.currentSession,
    bothPlayersReady: currentState.bothPlayersReady,
    showDeckBuilder,
    deckLoaded,
    gameIdFromUrl
  });

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

  // Monitor session state changes and redirect guest to waiting room
  useEffect(() => {
    if (currentState.currentSession && !isHost && !currentState.gameStarted) {
      console.log('[SETUP] Guest detected with active session, redirecting to waiting room');
      // Il guest dovrebbe essere automaticamente reindirizzato tramite il gameState
      // che viene aggiornato in handleGameStart
    }
  }, [currentState.currentSession, isHost, currentState.gameStarted]);

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
    console.log('[SETUP] Host attempting to create game', { playerName, deckLoaded });

    setIsCreatingGame(true);
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      console.log('[SETUP] Creating game with ID', { gameId: newGameId });
      
      const gameData = {
        gameId: newGameId,
        playerName: playerName.trim(),
        isHost: true,
        deckLoaded: true,
        startingLP,
        summonLimit
      };
      
      const success = await onGameStart(gameData);
      
      if (success) {
        setGameId(newGameId);
        setIsHost(true);
        setGameSessionCreated(true);
        console.log('[SETUP] Game created successfully');
        console.log('Game created successfully - showing link');
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
  }, [playerName, deckLoaded, isCreatingGame, onGameStart, startingLP, summonLimit]);

  const joinGame = useCallback(async () => {
    const targetGameId = gameId.trim().toUpperCase() || gameIdFromUrl;
    setJoinError(null);
    setJoinSuccess(false);
    if (!targetGameId) {
      setJoinError('Please enter a Game ID');
      return;
    }
    if (!playerName.trim()) {
      setJoinError('Please enter your name');
      return;
    }
    if (!deckLoaded) {
      setJoinError('Please create or upload a deck first');
      return;
    }
    if (isJoiningGame) return; // Prevent double calls
    setIsJoiningGame(true);
    console.log('[SETUP] Attempting to join game as guest:', targetGameId);
    try {
      const gameData = { 
        gameId: targetGameId,
        playerName,
        deckLoaded,
        isHost: false, // Forza guest!
        startingLP,
        summonLimit
      };
      const session = await onJoinGame(gameData);
      if (session && session.id) {
        setJoinSuccess(true);
        setGameSessionCreated(true);
        setIsHost(false);
        setGameId(targetGameId);
        setTimeout(() => setJoinSuccess(false), 2000);
        console.log('[SETUP] Join successful! Sei guest nella partita', targetGameId);
        
        // Il guest dovrebbe essere automaticamente reindirizzato alla waiting room
        // tramite il gameState che viene aggiornato in handleGameStart
      } else {
        setJoinError('Join fallito: partita non trovata o già piena.');
      }
    } catch (err) {
      console.error('[SETUP] Error during join:', err);
      setJoinError('Errore durante il join: ' + (err?.message || err));
    } finally {
      setIsJoiningGame(false);
    }
  }, [gameId, gameIdFromUrl, playerName, deckLoaded, isJoiningGame, onJoinGame, startingLP, summonLimit]);

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

  const handleEnterWaitingRoom = useCallback(() => {
    console.log('[SETUP] Player entering waiting room', { isHost });
    if (onHostEnterWaiting) {
      onHostEnterWaiting();
    }
  }, [onHostEnterWaiting, isHost]);

  // Show waiting screen when session active and not both ready
  if (currentState.currentSession && !currentState.bothPlayersReady) {
    return (
      <WaitingForPlayersScreen
        gameData={gameState.gameData}
        playerReady={currentState.playerReady || false}
        opponentReady={currentState.opponentReady || false}
        onPlayerReady={onPlayerReady}
        onSignOut={handleEnterWaitingRoom}
        onGameStart={onBothPlayersReady}
        isHost={isHost}
        onCopyGameLink={copyGameLink}
        linkCopied={linkCopied}
        wantsFirst={gameState?.wantsFirst ?? null}
        onSelectPreference={(val)=>{
          if(gameState?.setWantsFirst){
             gameState.setWantsFirst(val);
             // sync will happen automatically shortly
          }
        }}
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
          isHost={isHost}
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
            <h1 className="text-2xl font-bold text-white">SIMULATORE SUPREMO</h1>
            <p className="text-gray-400">Multiplayer Setup</p>
          </div>
          <Button
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
            startingLP={startingLP}
            setStartingLP={setStartingLP}
            summonLimit={summonLimit}
            setSummonLimit={setSummonLimit}
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
          {!gameSessionCreated && (
            <GameCreationSection
              gameId={gameId}
              setGameId={setGameId}
              playerName={playerName}
              deckLoaded={deckLoaded}
              isCreatingGame={isCreatingGame}
              onCreateGame={createGame}
              onJoinGame={joinGame}
              isJoiningGame={isJoiningGame}
              currentSession={currentState.currentSession}
            />
          )}

          {/* Mostra il GameStatusDisplay quando il gioco è stato creato ma non è ancora iniziato */}
          {gameId && gameSessionCreated && !currentState.gameStarted && (
            <GameStatusDisplay
              gameId={gameId}
              isHost={isHost}
              gameSessionCreated={gameSessionCreated}
              linkCopied={linkCopied}
              onCopyGameLink={copyGameLink}
              onEnterWaitingRoom={handleEnterWaitingRoom}
              hostName={gameState?.gameData?.hostName || playerName}
              guestName={gameState?.gameData?.guestName || 'Guest'}
              hostReady={currentState.playerReady || false}
              guestReady={currentState.opponentReady || false}
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
          {joinSuccess && (
            <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-400 mt-2">
              <p className="text-green-400 font-semibold flex items-center justify-center gap-2">✅ Sei entrato nella partita!</p>
            </div>
          )}
          {joinError && (
            <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-400 mt-2 flex flex-col items-center">
              <span className="text-red-400 font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {joinError}
              </span>
              <Button onClick={joinGame} className="mt-2 bg-red-600 hover:bg-red-700 text-white">Riprova</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MultiplayerSetup;
