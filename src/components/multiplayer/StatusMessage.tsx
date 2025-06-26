
import React from 'react';

interface StatusMessageProps {
  playerName: string;
  deckLoaded: boolean;
  gameId: string;
  isHost: boolean;
  gameSessionCreated: boolean;
}

const StatusMessage = ({ playerName, deckLoaded, gameId, isHost, gameSessionCreated }: StatusMessageProps) => {
  const getStatusMessage = () => {
    if (!playerName.trim()) return 'Enter your name to continue';
    if (playerName.trim() && !deckLoaded) return 'Upload your deck to continue';
    if (playerName.trim() && deckLoaded && !gameId) return 'Create or join a game';
    if (playerName.trim() && deckLoaded && gameId && isHost && gameSessionCreated) return 'Game created! Share the link with your opponent';
    if (playerName.trim() && deckLoaded && gameId && !isHost) return 'Joining game...';
    return '';
  };

  return (
    <div className="text-center text-sm text-gray-400">
      {getStatusMessage()}
    </div>
  );
};

export default StatusMessage;
