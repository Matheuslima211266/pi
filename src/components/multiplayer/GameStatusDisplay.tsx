
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Link, Copy } from 'lucide-react';

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
  // DEBUG: Aggiungi console.log per vedere i valori
  console.log('GameStatusDisplay props:', { gameId, isHost, gameSessionCreated, linkCopied });
  
  if (!gameId) {
    console.log('No gameId, returning null');
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <Badge className="bg-gold-600 text-black text-lg px-4 py-2">
          {gameId}
        </Badge>
        <p className="text-xs text-gray-400 mt-1">Game ID</p>
      </div>
      
      {/* Mostra il link per l'host quando il gioco è creato */}
      {isHost && gameSessionCreated && (
        <div className="space-y-2">
          <Button
            onClick={onCopyGameLink}
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

      {/* Mostra status per i guest */}
      {!isHost && gameId && (
        <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-400">
          <p className="text-blue-400 font-semibold">Joining game...</p>
          <p className="text-sm text-gray-300 mt-1">Please wait...</p>
        </div>
      )}
    </div>
  );
};

export default GameStatusDisplay;
