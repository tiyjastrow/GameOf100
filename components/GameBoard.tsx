
import React, { useRef, useEffect, useState } from 'react';
import { GameState, Card as CardType, Suit } from '../types.ts';
import Card from './Card.tsx';
import { User, Video, ShieldAlert, Coins, Sparkles, Trash2, Trophy, Zap } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  myId: string;
  isHost: boolean;
  onPlayCard: (cardId: string) => void;
  onBid: (amount: number) => void;
  onPass: () => void;
  onTakeCat: () => void;
  onChooseTrump: (suit: Suit) => void;
  onDiscard: (cardIds: string[]) => void;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
}

const VideoFeed: React.FC<{ stream: MediaStream | null; name: string; isLocal?: boolean; isActive?: boolean; hasPassed?: boolean }> = ({ stream, name, isLocal, isActive, hasPassed }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className={`relative w-24 h-24 rounded-2xl overflow-hidden bg-black/40 border shadow-lg group transition-all duration-500 ${isActive ? 'border-yellow-400 ring-4 ring-yellow-400/20 scale-110' : 'border-white/10'}`}>
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
          <User size={32} />
        </div>
      )}
      {hasPassed && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-red-400 uppercase tracking-tighter">
          PASSED
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[8px] text-center font-bold text-white/80 uppercase truncate">
        {name}
      </div>
    </div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({ gameState, myId, onPlayCard, onBid, onPass, onTakeCat, onChooseTrump, onDiscard, localStream, remoteStreams }) => {
  const [selectedForDiscard, setSelectedForDiscard] = useState<string[]>([]);
  
  const me = gameState.players.find(p => p.id === myId);
  const meIndex = gameState.players.findIndex(p => p.id === myId);
  
  const playersInOrder = [
    gameState.players[(meIndex + 1) % 4],
    gameState.players[(meIndex + 2) % 4],
    gameState.players[(meIndex + 3) % 4]
  ];
  
  const leftPlayer = playersInOrder[0];
  const topPlayer = playersInOrder[1];
  const rightPlayer = playersInOrder[2];

  const myTurn = gameState.currentTurn === myId;
  const isBidPhase = gameState.phase === 'bidding';
  const isCatExchange = gameState.phase === 'cat_exchange';
  const isDiscardPhase = gameState.phase === 'discarding';
  const isChoosingTrump = gameState.phase === 'choosing_trump';

  const handleCardClick = (cardId: string) => {
    if (isDiscardPhase && myTurn) {
      setSelectedForDiscard(prev => 
        prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
      );
    } else if (gameState.phase === 'playing' && myTurn) {
      onPlayCard(cardId);
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center overflow-hidden p-8">
      {gameState.phase === 'round_end' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-white text-center">
           <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce" />
           <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">Round Complete</h2>
           <p className="text-white/50 font-bold uppercase tracking-widest max-w-md">The round has ended. Shuffling and dealing the next hand automatically...</p>
        </div>
      )}

      {topPlayer && (
        <div className="absolute top-12 flex flex-col items-center gap-4">
           <VideoFeed stream={remoteStreams[topPlayer.id] || null} name={topPlayer.name} isActive={gameState.currentTurn === topPlayer.id} hasPassed={gameState.passedPlayers.includes(topPlayer.id)} />
           <div className="flex -space-x-12 opacity-80 scale-75">
            {topPlayer.hand.map((_, i) => <Card key={i} faceDown className="rotate-180" />)}
          </div>
        </div>
      )}

      {leftPlayer && (
        <div className="absolute left-16 flex flex-row items-center gap-6">
          <div className="flex flex-col -space-y-24 opacity-80 scale-75 rotate-90">
            {leftPlayer.hand.map((_, i) => <Card key={i} faceDown />)}
          </div>
          <VideoFeed stream={remoteStreams[leftPlayer.id] || null} name={leftPlayer.name} isActive={gameState.currentTurn === leftPlayer.id} hasPassed={gameState.passedPlayers.includes(leftPlayer.id)} />
        </div>
      )}

      {rightPlayer && (
        <div className="absolute right-16 flex flex-row-reverse items-center gap-6">
           <div className="flex flex-col -space-y-24 opacity-80 scale-75 -rotate-90">
            {rightPlayer.hand.map((_, i) => <Card key={i} faceDown />)}
          </div>
          <VideoFeed stream={remoteStreams[rightPlayer.id] || null} name={rightPlayer.name} isActive={gameState.currentTurn === rightPlayer.id} hasPassed={gameState.passedPlayers.includes(rightPlayer.id)} />
        </div>
      )}

      <div className="w-[500px] h-[500px] rounded-full border-4 border-white/5 bg-black/10 flex items-center justify-center relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
        {gameState.sharedCards.length === 4 && (
          <div className="absolute -top-10 z-[110] bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl animate-bounce flex items-center gap-2">
            <Zap size={16} /> Trick Awarded!
          </div>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
           {(isBidPhase || isDiscardPhase) && (
             <div className="flex -space-x-16 rotate-12 group transition-all duration-700 hover:rotate-6">
               {gameState.cat.length > 0 ? (
                 gameState.cat.map((_, i) => <Card key={i} faceDown className="shadow-2xl scale-95 border-emerald-900" />)
               ) : (
                 <div className="text-white/10 font-black uppercase tracking-widest text-2xl italic border-2 border-dashed border-white/5 p-16 rounded-full">Cat Claimed</div>
               )}
               <div className="absolute inset-x-0 -bottom-10 text-center text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] opacity-50">The Cat</div>
             </div>
           )}

           {isCatExchange && (
             <div className="flex flex-col items-center gap-8">
                <div className="flex -space-x-12">
                   {gameState.cat.map((_, i) => <Card key={i} faceDown className="shadow-2xl scale-110" />)}
                </div>
                {myTurn && (
                  <button onClick={onTakeCat} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-12 py-5 rounded-[2rem] shadow-2xl animate-bounce tracking-widest uppercase text-sm transition-all active:scale-95">Take the Cat</button>
                )}
             </div>
           )}

           {gameState.phase === 'playing' && (
             <div className="relative w-full h-full flex items-center justify-center">
               {gameState.sharedCards.length === 0 ? (
                 <div className="text-white/5 font-black uppercase text-5xl tracking-tighter -rotate-12 select-none">Nexus Play</div>
               ) : (
                 gameState.sharedCards.map((card, idx) => {
                   return (
                     <Card 
                        key={card.id} card={card} 
                        trumpSuit={gameState.trumpSuit}
                        className="absolute shadow-2xl transition-all duration-500"
                        style={{ 
                          left: '50%', 
                          top: '50%', 
                          transform: `translate(-50%, -50%) rotate(${idx * 15 - 20}deg) scale(1.15)`, 
                          zIndex: idx + 10 
                        }}
                     />
                   );
                 })
               )}
             </div>
           )}
        </div>
      </div>

      {isBidPhase && myTurn && !gameState.passedPlayers.includes(myId) && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-12 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
            <Coins className="mx-auto mb-6 text-yellow-400" size={48} />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Your Turn to Bid</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-10">Bidding starts at 62 • Next Bid: {Math.max(62, gameState.currentBid + 1)}</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={onPass} className="bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-xs border border-white/10">Pass</button>
              <button onClick={() => onBid(Math.max(62, gameState.currentBid + 1))} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl shadow-xl shadow-yellow-500/20 transition-all uppercase tracking-widest text-xs">Bid {Math.max(62, gameState.currentBid + 1)}</button>
            </div>
          </div>
        </div>
      )}

      {isDiscardPhase && myTurn && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
           <div className="bg-zinc-900 border border-white/10 p-12 rounded-[3rem] shadow-2xl w-full max-w-xl text-center">
              <Trash2 className="mx-auto mb-6 text-red-400" size={48} />
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Discard 5 Cards</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-10 italic">Select exactly 5 cards from your hand below to discard</p>
              
              <div className="flex justify-center flex-wrap gap-2 mb-10 h-32 items-center">
                 {selectedForDiscard.length === 0 ? (
                   <div className="text-white/10 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-white/5 p-8 rounded-2xl w-full">Nothing Selected</div>
                 ) : (
                   selectedForDiscard.map(id => {
                     const card = me?.hand.find(c => c.id === id);
                     return <div key={id} className="w-16 h-24 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/20 font-black text-xs uppercase">{card?.rank}{card?.suit !== 'none' ? card?.suit.charAt(0) : ''}</div>;
                   })
                 )}
              </div>

              <button 
                onClick={() => { onDiscard(selectedForDiscard); setSelectedForDiscard([]); }}
                disabled={selectedForDiscard.length !== 5}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-20 text-white font-black py-5 rounded-[2rem] shadow-xl transition-all uppercase tracking-widest text-sm shadow-red-900/20"
              >
                Confirm Discard ({selectedForDiscard.length}/5)
              </button>
           </div>
        </div>
      )}

      {isChoosingTrump && myTurn && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-12 rounded-[3rem] shadow-2xl w-full max-w-md text-center">
            <Sparkles className="mx-auto mb-6 text-emerald-400" size={48} />
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Choose Trump</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map((suit) => (
                <button key={suit} onClick={() => onChooseTrump(suit)} className="bg-white/5 hover:bg-emerald-500/10 border border-white/10 text-white font-black py-8 rounded-[2rem] transition-all flex flex-col items-center justify-center gap-3 group">
                  <span className={`text-5xl transition-transform group-hover:scale-125 ${suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-zinc-300'}`}>{suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '♠'}</span>
                  <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100">{suit}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-24 pb-8 flex flex-col items-center z-40">
        <div className="mb-6 flex items-center gap-10">
          <VideoFeed stream={localStream} name={me?.name || 'You'} isLocal isActive={myTurn} hasPassed={gameState.passedPlayers.includes(myId)} />
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
               <span className="text-emerald-400 text-[10px] font-black tracking-widest uppercase bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">Your Hand</span>
               {myTurn && (
                  <div className="bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase animate-pulse shadow-lg shadow-yellow-500/20">
                    {gameState.phase === 'playing' ? 'Your Turn' : 'Action Required'}
                  </div>
               )}
            </div>
            <span className="text-white text-4xl font-black tracking-tighter mt-1">{me?.hand.length || 0} <span className="text-white/20 font-light">Cards Left</span></span>
          </div>
        </div>
        
        <div className="flex -space-x-8 px-16 overflow-x-auto max-w-full pb-8 hide-scrollbar scroll-smooth">
          {me?.hand.map((card) => {
            const isSelected = selectedForDiscard.includes(card.id);
            return (
              <Card 
                key={card.id} 
                card={card} 
                trumpSuit={gameState.trumpSuit}
                playable={(myTurn && gameState.phase === 'playing') || isDiscardPhase} 
                className={isSelected ? 'ring-4 ring-red-500 -translate-y-12' : ''}
                onClick={() => handleCardClick(card.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
