
import React from 'react';
import { Suit, Rank } from './types.ts';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SuitIcon = ({ suit, className }: { suit: Suit, className?: string }) => {
  switch (suit) {
    case 'hearts': return <span className={`text-red-500 ${className}`}>♥</span>;
    case 'diamonds': return <span className={`text-red-500 ${className}`}>♦</span>;
    case 'clubs': return <span className={`text-zinc-900 ${className}`}>♣</span>;
    case 'spades': return <span className={`text-zinc-900 ${className}`}>♠</span>;
    default: return null;
  }
};
