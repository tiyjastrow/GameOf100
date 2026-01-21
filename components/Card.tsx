
import React from 'react';
import { Card as CardType, Suit } from '../types.ts';
import { SuitIcon } from '../constants.tsx';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  playable?: boolean;
  style?: React.CSSProperties;
  trumpSuit?: Suit | null;
}

const Card: React.FC<CardProps> = ({ card, faceDown, onClick, className, playable, style, trumpSuit }) => {
  const baseClasses = `
    relative w-24 h-36 rounded-xl transition-all duration-300 
    ${playable ? 'hover:-translate-y-4 cursor-pointer hover:shadow-2xl' : ''}
    ${className}
  `;

  if (faceDown || !card) {
    return (
      <div 
        style={style}
        className={`${baseClasses} bg-white border-2 border-white flex items-center justify-center p-1.5`}
      >
        <div className="w-full h-full rounded-lg bg-emerald-800 border border-white/20 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-4 h-4 bg-emerald-500 rotate-45"></div>
          </div>
          <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-4 gap-1 p-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-full h-2 bg-white rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isJoker = card.rank === 'Joker';
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  
  // Special check for promoted trumps
  const isPromotedTrump = trumpSuit && 
    card.suit !== trumpSuit && 
    card.suit !== 'none' && 
    ['K', 'J', '9', '5'].includes(card.rank) && 
    ((trumpSuit === 'hearts' && card.suit === 'diamonds') || 
     (trumpSuit === 'diamonds' && card.suit === 'hearts') ||
     (trumpSuit === 'clubs' && card.suit === 'spades') ||
     (trumpSuit === 'spades' && card.suit === 'clubs'));

  const isRealTrump = card.suit === trumpSuit || isJoker || isPromotedTrump;

  return (
    <div 
      onClick={onClick}
      style={style}
      className={`${baseClasses} bg-white border border-gray-200 flex flex-col p-2 select-none card-shadow ${isRealTrump && trumpSuit ? 'ring-2 ring-yellow-400/50' : ''}`}
    >
      <div className="flex justify-between items-start leading-none">
        <div className={`flex flex-col items-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          <span className={`font-bold tracking-tighter ${isJoker ? 'text-sm' : 'text-xl'}`}>
            {isJoker ? 'JK' : card.rank}
          </span>
          {!isJoker && <SuitIcon suit={card.suit} className="text-sm mt-0.5" />}
        </div>
        {isRealTrump && trumpSuit && (
           <div className="bg-yellow-400 text-[6px] font-black px-1 rounded-sm text-black uppercase tracking-tighter">TRUMP</div>
        )}
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        {isJoker ? (
          <div className="text-4xl font-black text-zinc-900 rotate-12">★</div>
        ) : (
          <SuitIcon suit={card.suit} className="text-5xl" />
        )}
      </div>

      <div className="flex justify-between items-end rotate-180 leading-none">
        <div className={`flex flex-col items-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          <span className={`font-bold tracking-tighter ${isJoker ? 'text-sm' : 'text-xl'}`}>
            {isJoker ? 'JK' : card.rank}
          </span>
          {!isJoker && <SuitIcon suit={card.suit} className="text-sm mt-0.5" />}
        </div>
      </div>
    </div>
  );
};

export default Card;
