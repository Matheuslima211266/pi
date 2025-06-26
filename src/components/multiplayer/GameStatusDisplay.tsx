
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Link, Copy, AlertCircle, Share2 } from 'lucide-react';

interface GameStatusDisplayProps {
  gameId: string;
  isHost: boolean;
  gameSessionCreated: boolean;
  linkCopied: boolean;
  onCopyGameLink: () => void;
}

const GameStatusDisplay = ({ 
  gameId, 
  isHost, 
  gameSessionCreated, 
  linkCopied, 
  onCopyGameLink 
}: GameStatusDisplayProps) => {
  
  console.log('GameStatusDisplay render:', { gameId, isHost, gameSessionCreated, linkCopied });
  
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
      
      {/* Sempre mostra il link se è host */}
      {isHost && (
        <div className="space-y-3">
          <div className="bg-slate-600/80 p-3 rounded-lg">
            <p className="text-xs text-gray-300 mb-2 text-center font-semibold">
              🔗 CONDIVIDI QUESTO LINK:
            </p>
            <div className="bg-slate-800 p-3 rounded-lg text-xs text-white break-all font-mono border border-gold-400/30">
              {gameLink}
            </div>
          </div>
          
          <Button
            onClick={onCopyGameLink}
            className="w-full bg-gold-600 hover:bg-gold-700 text-black font-semibold"
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
          
          <div className="text-center p-3 bg-green-900/40 rounded-lg border border-green-400/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-semibold">Partita Creata!</p>
            </div>
            <p className="text-sm text-gray-300">Condividi il link con il tuo avversario</p>
            
            <div className="mt-3 flex items-center justify-center gap-2 bg-yellow-900/30 p-2 rounded border border-yellow-400/50">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-xs text-yellow-300">
                ⚠️ NON premere "Ready" finché l'avversario non si unisce!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show joining status for guests */}
      {!isHost && (
        <div className="text-center p-4 bg-blue-900/40 rounded-lg border border-blue-400/50">
          <p className="text-blue-400 font-semibold">🎮 Entrando nella partita...</p>
          <p className="text-sm text-gray-300 mt-1">Game ID: {gameId}</p>
        </div>
      )}
    </div>
  );
};

export default GameStatusDisplay;
