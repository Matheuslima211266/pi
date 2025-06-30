import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Copy, AlertCircle, Share2, Users, Crown, User } from 'lucide-react';

interface GameStatusDisplayProps {
  gameId: string;
  isHost: boolean;
  gameSessionCreated: boolean;
  linkCopied: boolean;
  onCopyGameLink: () => void;
  onEnterWaitingRoom?: () => void;
  hostName: string;
  guestName: string;
  hostReady: boolean;
  guestReady: boolean;
}

const GameStatusDisplay = ({ 
  gameId, 
  isHost, 
  gameSessionCreated, 
  linkCopied, 
  onCopyGameLink,
  onEnterWaitingRoom,
  hostName,
  guestName,
  hostReady,
  guestReady
}: GameStatusDisplayProps) => {
  
  console.log('GameStatusDisplay render:', { gameId, isHost, gameSessionCreated, linkCopied, hostName, guestName, hostReady, guestReady });
  
  if (!gameId) {
    return null;
  }

  const gameLink = `${window.location.origin}?game=${gameId}`;

  return (
    <div className="space-y-4 bg-slate-700/50 p-4 rounded-lg border border-gold-400/30">
      <div className="text-center">
        <Badge className="bg-gold-600 text-black text-lg px-4 py-2 mb-2">
          {gameId}
        </Badge>
        <p className="text-xs text-gray-400">Game ID</p>
      </div>

      {/* Waiting room status for both host and guest */}
      <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 mb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-yellow-300">{hostName || 'Host'}</span>
            <Badge className={hostReady ? 'bg-green-600' : 'bg-gray-500'}>
              {hostReady ? 'Ready' : 'Waiting...'}
            </Badge>
            {isHost && <span className="ml-2 text-xs text-green-400">(Sei l'host 👑)</span>}
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-blue-200">{guestName || 'Guest'}</span>
            <Badge className={guestReady ? 'bg-green-600' : 'bg-gray-500'}>
              {guestReady ? 'Ready' : 'Waiting...'}
            </Badge>
            {!isHost && <span className="ml-2 text-xs text-blue-400">(Sei il guest 👤)</span>}
          </div>
        </div>
      </div>

      {/* Messaggio di attesa */}
      {(!hostReady || !guestReady) && (
        <div className="text-center p-2 bg-yellow-900/30 rounded border border-yellow-400/50 mb-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 inline-block mr-1" />
          <span className="text-xs text-yellow-300">
            {isHost
              ? (!guestReady ? 'Aspetta che il guest entri e sia pronto!' : 'Premi "Ready" quando sei pronto!')
              : (!hostReady ? 'Aspetta che l\'host sia pronto!' : 'Premi "Ready" quando sei pronto!')}
          </span>
        </div>
      )}

      {/* Link e pulsante solo per host */}
      {isHost && (
        <div className="space-y-3">
          <div className="bg-slate-600/80 p-3 rounded-lg">
            <p className="text-xs text-gray-300 mb-2 text-center font-semibold">
              🔗 CONDIVIDI QUESTO LINK:
            </p>
            <div className="bg-slate-800 p-3 rounded-lg text-xs text-white break-all font-mono border border-gold-400/30 mb-3">
              {gameLink}
            </div>
            <Button
              onClick={onCopyGameLink}
              className="w-full bg-gold-600 hover:bg-gold-700 text-black font-semibold mb-3"
              size="lg"
            >
              {linkCopied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  ✅ Link Copiato!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  📋 Copia Link del Gioco
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Pulsante per entrare nella waiting room (per entrambi host e guest) */}
      {onEnterWaitingRoom && (
        <div className="space-y-3">
          <Button
            onClick={onEnterWaitingRoom}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            size="lg"
          >
            🎮 Entra nella Waiting Room
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameStatusDisplay;
