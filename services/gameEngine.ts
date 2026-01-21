
import { Card, Suit, Rank, GameState, Player, GameSettings } from '../types.ts';
import { SUITS, RANKS } from '../constants.tsx';

export const DEFAULT_SETTINGS: GameSettings = {
  cardsPerHand: 12,
  pointsPerCard: 10,
  winningScore: 500,
  allowVideo: true
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}-${suit}-${Math.random().toString(36).substr(2, 9)}`,
        suit,
        rank
      });
    });
  });
  deck.push({
    id: `Joker-none-${Math.random().toString(36).substr(2, 9)}`,
    suit: 'none',
    rank: 'Joker'
  });
  return shuffle(deck);
};

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getOppositeSuit = (suit: Suit): Suit => {
  if (suit === 'hearts') return 'diamonds';
  if (suit === 'diamonds') return 'hearts';
  if (suit === 'clubs') return 'spades';
  if (suit === 'spades') return 'clubs';
  return 'none';
};

export const isEffectiveTrump = (card: Card, trumpSuit: Suit | null): boolean => {
  if (!trumpSuit) return false;
  if (card.rank === 'Joker') return true;
  if (card.suit === trumpSuit) return true;
  
  const oppSuit = getOppositeSuit(trumpSuit);
  const promotedRanks = ['K', 'J', '9', '5'];
  if (card.suit === oppSuit && promotedRanks.includes(card.rank)) return true;
  
  return false;
};

export const getCardPoints = (card: Card, trumpSuit: Suit | null): number => {
  if (!trumpSuit) return 0;
  const oppSuit = getOppositeSuit(trumpSuit);

  if (card.rank === 'Joker') return 17;
  
  if (card.suit === trumpSuit) {
    if (card.rank === 'K') return 25;
    if (card.rank === '9') return 9;
    if (card.rank === '5') return 5;
    if (['A', 'J', '10', '2'].includes(card.rank)) return 1;
  }
  
  if (card.suit === oppSuit) {
    if (card.rank === 'K') return 25;
    if (card.rank === '9') return 9;
    if (card.rank === '5') return 5;
    if (card.rank === 'J') return 1;
  }
  
  return 0;
};

export const getCardPower = (card: Card, trumpSuit: Suit, ledSuit: Suit): number => {
  const isTrump = isEffectiveTrump(card, trumpSuit);
  
  if (isTrump) {
    // Ace is highest (22), Joker is lowest (1)
    const rankValues: Record<string, number> = {
      'A': 22, 'K': 20, 'Q': 18, 'J': 16, '10': 14, '9': 12, 
      '8': 10, '7': 9, '6': 8, '5': 7, '4': 6, '3': 5, '2': 4, 'Joker': 1
    };
    
    let power = 2000 + (rankValues[card.rank] * 10);
    // Real trump suit beats opposite suit of same rank
    if (card.suit === trumpSuit) power += 5;
    return power;
  }

  if (card.suit === ledSuit) {
    const rankValues: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return rankValues[card.rank] || 0;
  }

  return 0;
};

export const evaluateTrick = (sharedCards: Card[], playersOrder: string[], trumpSuit: Suit): string => {
  if (sharedCards.length === 0) return playersOrder[0];
  const ledCard = sharedCards[0];
  const ledIsTrump = isEffectiveTrump(ledCard, trumpSuit);
  const effectiveLedSuit = ledIsTrump ? trumpSuit : ledCard.suit;
  
  let bestPower = -1;
  let winnerId = playersOrder[0];

  sharedCards.forEach((card, idx) => {
    const power = getCardPower(card, trumpSuit, effectiveLedSuit);
    if (power > bestPower) {
      bestPower = power;
      winnerId = playersOrder[idx];
    }
  });

  return winnerId;
};

export const dealCards = (state: GameState): GameState => {
  const newDeck = shuffle(createDeck()); 
  const newPlayers = state.players.map(player => {
    const hand = newDeck.splice(0, 12);
    return { ...player, hand, hasPassed: false };
  });
  const cat = newDeck.splice(0, 5);

  return {
    ...state,
    deck: newDeck,
    players: newPlayers,
    cat,
    phase: 'bidding',
    sharedCards: [],
    currentBid: 61,
    highestBidderId: null,
    passedPlayers: [],
    trumpSuit: null,
    trickHistory: [],
    currentTurn: state.players[0].id
  };
};

export const createInitialState = (host: Player): GameState => ({
  deck: [],
  players: [host],
  sharedCards: [],
  cat: [],
  currentTurn: host.id,
  phase: 'lobby',
  scores: { [host.id]: 0 },
  teamScores: { team1: 0, team2: 0 },
  settings: DEFAULT_SETTINGS,
  currentBid: 61,
  highestBidderId: null,
  passedPlayers: [],
  trumpSuit: null,
  trickHistory: []
});
