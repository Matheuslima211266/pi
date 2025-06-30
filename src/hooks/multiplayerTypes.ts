export interface GameSession {
  id: string;
  gameId: string;
  hostId: string;
  guestId?: string;
  hostName: string;
  guestName?: string;
  hostReady: boolean;
  guestReady: boolean;
  createdAt: number;
  status: 'waiting' | 'active' | 'finished';
}

export interface GameZone {
  id: string;
  cards: any[]; 
  count?: number;
}

export interface GameState {
  playerField: Record<string, any>;
  playerLifePoints: number;
  currentPhase: string;
  turnCount: number;
  isFirstTurn: boolean;
  playerStarts: boolean;
  playerName: string;
  lastUpdate: number;
  currentTurnPlayerId?: string;
  playerHandCount: number;
  actionLog: any[];
  chatMessages: any[];
  isPlayerTurn: boolean;
  timeRemaining: number;
  playerReady: boolean;
  bothPlayersReady: boolean;
  turnOrder: 'host' | 'guest';
}

export type Player = 'player1' | 'player2'; 