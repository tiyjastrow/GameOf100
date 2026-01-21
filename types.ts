
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'none';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'Joker';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  isHost: boolean;
  isReady: boolean;
  avatar?: string;
  hasPassed?: boolean;
}

export interface GameSettings {
  cardsPerHand: number;
  pointsPerCard: number;
  winningScore: number;
  allowVideo: boolean;
}

export interface GameState {
  deck: Card[];
  players: Player[];
  sharedCards: Card[];
  cat: Card[];
  currentTurn: string; // Player ID
  phase: 'lobby' | 'bidding' | 'cat_exchange' | 'discarding' | 'choosing_trump' | 'playing' | 'round_end';
  scores: Record<string, number>;
  teamScores: { team1: number; team2: number };
  settings: GameSettings;
  currentBid: number;
  highestBidderId: string | null;
  passedPlayers: string[];
  trumpSuit: Suit | null;
  trickHistory: Card[][];
}

export type GameMessage = 
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'PLAYER_JOIN_REQUEST'; name: string; peerId: string }
  | { type: 'PLAYER_JOIN_RESPONSE'; approved: boolean; initialState?: GameState }
  | { type: 'BID'; playerId: string; amount: number }
  | { type: 'PASS'; playerId: string }
  | { type: 'TAKE_CAT'; playerId: string }
  | { type: 'DISCARD'; playerId: string; cardIds: string[] }
  | { type: 'CHOOSE_TRUMP'; suit: Suit }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string }
  | { type: 'UPDATE_SETTINGS'; settings: GameSettings };

export enum ConnectionStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}
