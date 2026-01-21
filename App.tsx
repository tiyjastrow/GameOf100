
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, Player, GameMessage, ConnectionStatus, Card as CardType, Suit, GameSettings 
} from './types.ts';
import { 
  createInitialState, dealCards, getCardPoints, evaluateTrick 
} from './services/gameEngine.ts';
import { 
  Video, VideoOff, Wifi, ShieldCheck, Trophy, AlertTriangle, 
  Users, Settings, Link as LinkIcon, Check, Hash, Coins, Trash2, Sparkles, User, Zap, Mic, MicOff
} from 'lucide-react';
import { SuitIcon } from './constants.tsx';

declare const Peer: any;

/** 
 * COMPONENT: CARD
 */
const Card: React.FC<{
  card?: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  playable?: boolean;
  style?: React.CSSProperties;
  trumpSuit?: Suit | null;
}> = ({ card, faceDown, onClick, className, playable, style, trumpSuit }) => {
  const baseClasses = `relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl transition-all duration-300 ${playable ? 'hover:-translate-y-4 cursor-pointer hover:shadow-2xl' : ''} ${className}`;

  if (faceDown || !card) {
    return (
      <div style={style} className={`${baseClasses} bg-white border-2 border-white flex items-center justify-center p-1 shadow-lg`}>
        <div className="w-full h-full rounded-lg bg-emerald-900 border border-white/10 flex flex-col items-center justify-center overflow-hidden relative">
          <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center">
            <div className="w-4 h-4 bg-emerald-500/50 rotate-45"></div>
          </div>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
        </div>
      </div>
    );
  }

  const isJoker = card.rank === 'Joker';
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const isRealTrump = card.suit === trumpSuit || isJoker;

  return (
    <div onClick={onClick} style={style} className={`${baseClasses} bg-white border border-gray-200 flex flex-col p-2 select-none shadow-xl ${isRealTrump && trumpSuit ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex justify-between items-start leading-none">
        <div className={`flex flex-col items-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          <span className={`font-black ${isJoker ? 'text-[10px]' : 'text-lg'}`}>{isJoker ? 'JK' : card.rank}</span>
          {!isJoker && <SuitIcon suit={card.suit} className="text-xs" />}
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center">
        {isJoker ? <div className="text-3xl">★</div> : <SuitIcon suit={card.suit} className="text-4xl" />}
      </div>
      <div className="flex justify-between items-end rotate-180 leading-none">
        <div className={`flex flex-col items-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          <span className={`font-black ${isJoker ? 'text-[10px]' : 'text-lg'}`}>{isJoker ? 'JK' : card.rank}</span>
          {!isJoker && <SuitIcon suit={card.suit} className="text-xs" />}
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENT: VIDEO FEED (FACE)
 */
const VideoFeed: React.FC<{ stream: MediaStream | null; name: string; isLocal?: boolean; isActive?: boolean; hasPassed?: boolean }> = ({ stream, name, isLocal, isActive, hasPassed }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { 
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    } 
  }, [stream]);

  return (
    <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-zinc-900/80 border-2 shadow-2xl transition-all duration-500 ${isActive ? 'border-yellow-400 ring-8 ring-yellow-400/20 scale-110 z-50' : 'border-white/10'}`}>
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/5">
          <User size={40} />
        </div>
      )}
      {hasPassed && <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-[10px] font-black text-red-500 uppercase tracking-tighter">PASSED</div>}
      <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md p-1.5 text-[9px] text-center font-black text-white uppercase truncate border-t border-white/10">
        {name}
      </div>
      {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>}
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
const App: React.FC = () => {
  const [peer, setPeer] = useState<any>(null);
  const [myId, setMyId] = useState<string>('');
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{name: string, peerId: string}[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState<string>('');
  const [selectedForDiscard, setSelectedForDiscard] = useState<string[]>([]);

  // 1. Initialize Camera and Microphone
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.warn("Media access denied. Continuing without video.", err);
      }
    }
    initMedia();
  }, []);

  // 2. PeerJS Setup
  useEffect(() => {
    const p = new Peer();
    p.on('open', (id: string) => { 
      setPeer(p); 
      setMyId(id); 
      setStatus(ConnectionStatus.CONNECTED); 
    });
    
    p.on('call', (call: any) => {
      if (localStream) {
        call.answer(localStream);
        call.on('stream', (rs: MediaStream) => {
          setRemoteStreams(prev => ({ ...prev, [call.peer]: rs }));
        });
      }
    });

    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) setTargetRoomId(room);

    return () => p.destroy();
  }, [localStream]);

  const broadcastState = (state: GameState) => {
    connections.forEach(conn => conn.send({ type: 'STATE_UPDATE', state } as GameMessage));
  };

  const handleMessage = useCallback((msg: GameMessage, conn: any) => {
    if (!gameState && msg.type !== 'PLAYER_JOIN_RESPONSE') {
       if (msg.type === 'PLAYER_JOIN_REQUEST' && isHost) {
          setPendingRequests(prev => [...prev, { name: msg.name, peerId: msg.peerId }]);
       }
       return;
    }

    switch (msg.type) {
      case 'STATE_UPDATE': setGameState(msg.state); break;
      case 'PLAYER_JOIN_RESPONSE':
        if (msg.approved && msg.initialState) {
          setGameState(msg.initialState);
          setStatus(ConnectionStatus.CONNECTED);
        }
        break;
      case 'PLAY_CARD': if (isHost) handlePlayCard(msg.playerId, msg.cardId); break;
      case 'BID': if (isHost) processBid(msg.playerId, msg.amount); break;
      case 'PASS': if (isHost) processPass(msg.playerId); break;
      case 'TAKE_CAT': if (isHost) processTakeCat(msg.playerId); break;
      case 'CHOOSE_TRUMP': if (isHost) processChooseTrump(msg.suit); break;
      case 'DISCARD': if (isHost) processDiscard(msg.playerId, msg.cardIds); break;
    }
  }, [isHost, gameState, connections]);

  // Host Core Game Logic
  const processBid = (pid: string, amt: number) => {
    if (!gameState) return;
    const nextState = { ...gameState, currentBid: amt, highestBidderId: pid };
    nextState.currentTurn = getNextActivePlayer(gameState.currentTurn, nextState);
    setGameState(nextState); broadcastState(nextState);
  };

  const processPass = (pid: string) => {
    if (!gameState) return;
    const passed = [...gameState.passedPlayers, pid];
    const nextState = { ...gameState, passedPlayers: passed };
    if (passed.length === 3 && gameState.highestBidderId) {
      nextState.phase = 'cat_exchange' as const;
      nextState.currentTurn = gameState.highestBidderId;
    } else if (passed.length === 4) {
      const reset = dealCards(gameState); setGameState(reset); broadcastState(reset); return;
    } else {
      nextState.currentTurn = getNextActivePlayer(gameState.currentTurn, nextState);
    }
    setGameState(nextState); broadcastState(nextState);
  };

  const processTakeCat = (pid: string) => {
    if (!gameState) return;
    const nextP = gameState.players.map(p => p.id === pid ? { ...p, hand: [...p.hand, ...gameState.cat] } : p);
    const nextS: GameState = { ...gameState, players: nextP, cat: [], phase: 'discarding' as const, currentTurn: pid };
    setGameState(nextS); broadcastState(nextS);
  };

  const processDiscard = (pid: string, ids: string[]) => {
    if (!gameState) return;
    const nextP = gameState.players.map(p => p.id === pid ? { ...p, hand: p.hand.filter(c => !ids.includes(c.id)) } : p);
    const nextS: GameState = { ...gameState, players: nextP, phase: 'choosing_trump' as const };
    setGameState(nextS); broadcastState(nextS);
  };

  const processChooseTrump = (suit: Suit) => {
    if (!gameState) return;
    const nextS: GameState = { ...gameState, trumpSuit: suit, phase: 'playing' as const, currentTurn: gameState.highestBidderId || gameState.players[0].id };
    setGameState(nextS); broadcastState(nextS);
  };

  const handlePlayCard = (pid: string, cid: string) => {
    if (!gameState) return;
    const player = gameState.players.find(p => p.id === pid);
    if (!player || gameState.currentTurn !== pid) return;
    const card = player.hand.find(c => c.id === cid);
    if (!card) return;

    const nextP = gameState.players.map(p => p.id === pid ? { ...p, hand: p.hand.filter(c => c.id !== cid) } : p);
    const nextShared = [...gameState.sharedCards, card];
    let nextS: GameState = { ...gameState, players: nextP, sharedCards: nextShared };

    if (nextShared.length === 4) {
      const winnerId = evaluateTrick(nextShared, gameState.players.map(p => p.id), gameState.trumpSuit || 'none');
      const points = nextShared.reduce((a, c) => a + getCardPoints(c, gameState.trumpSuit), 0);
      const isTeam1 = (gameState.players.findIndex(p => p.id === winnerId) % 2 === 0);
      const scores = { ...gameState.teamScores };
      if (isTeam1) scores.team1 += points; else scores.team2 += points;
      
      setGameState(nextS); broadcastState(nextS);
      setTimeout(() => {
        setGameState(prev => {
          if (!prev) return null;
          const up: GameState = { ...prev, sharedCards: [], currentTurn: winnerId, teamScores: scores };
          if (nextP.every(p => p.hand.length === 0)) {
            setTimeout(() => { setGameState(c => c ? dealCards(c) : null); }, 3000);
          }
          broadcastState(up); return up;
        });
      }, 1500);
    } else {
      nextS.currentTurn = getNextActivePlayer(pid, nextS);
      setGameState(nextS); broadcastState(nextS);
    }
  };

  const getNextActivePlayer = (curr: string, state: GameState) => {
    const idx = state.players.findIndex(p => p.id === curr);
    return state.players[(idx + 1) % state.players.length].id;
  };

  const approvePlayer = (peerId: string) => {
    if (!gameState) return;
    const req = pendingRequests.find(r => r.peerId === peerId);
    if (!req) return;
    const newP: Player = { id: peerId, name: req.name, hand: [], score: 0, isHost: false, isReady: false };
    const nextS = { ...gameState, players: [...gameState.players, newP] };
    setGameState(nextS); 
    setPendingRequests(prev => prev.filter(r => r.peerId !== peerId));
    
    const conn = connections.find(c => c.peer === peerId);
    if (conn) {
      conn.send({ type: 'PLAYER_JOIN_RESPONSE', approved: true, initialState: nextS });
      // Initiate Video Call to new player
      if (localStream) peer.call(peerId, localStream);
    }
    broadcastState(nextS);
  };

  useEffect(() => {
    if (!peer || !isHost) return;
    peer.on('connection', (conn: any) => {
      conn.on('data', (d: GameMessage) => handleMessage(d, conn));
      setConnections(p => [...p, conn]);
    });
  }, [peer, isHost, handleMessage]);

  const createRoom = () => {
    setIsHost(true);
    const host: Player = { id: myId, name: playerName || 'Player 1', hand: [], score: 0, isHost: true, isReady: true };
    setGameState(createInitialState(host));
  };

  const joinRoom = () => {
    const conn = peer.connect(targetRoomId);
    conn.on('open', () => {
      conn.send({ type: 'PLAYER_JOIN_REQUEST', name: playerName, peerId: myId });
      setConnections([conn]);
    });
    conn.on('data', (d: GameMessage) => handleMessage(d, conn));
  };

  // Rendering Helper: Determine layout
  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#064e3b] felt-texture flex items-center justify-center p-6">
        <div className="bg-black/40 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl w-full max-w-md text-center">
          <div className="w-24 h-24 bg-emerald-500 rounded-3xl mx-auto mb-10 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] rotate-12 transition-transform hover:rotate-0 cursor-default">
            <span className="text-white text-5xl font-black italic">N</span>
          </div>
          <h1 className="text-4xl font-black mb-2 text-white uppercase tracking-tighter">Nexus Cards</h1>
          <p className="text-emerald-400 mb-12 text-xs font-bold tracking-[0.3em] uppercase opacity-60 italic">Multiplayer Card Engine</p>
          <input 
            type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white mb-6 focus:ring-4 ring-emerald-500/50 outline-none transition-all placeholder:text-white/20 font-bold"
          />
          {targetRoomId ? (
            <button onClick={joinRoom} className="group relative w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs overflow-hidden">
               <span className="relative z-10">Join Table</span>
               <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          ) : (
            <button onClick={createRoom} className="group relative w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs overflow-hidden">
               <span className="relative z-10">Start New Table</span>
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          )}
        </div>
      </div>
    );
  }

  const meIndex = gameState.players.findIndex(p => p.id === myId);
  const me = gameState.players[meIndex];
  const others = [
    gameState.players[(meIndex + 1) % gameState.players.length],
    gameState.players[(meIndex + 2) % gameState.players.length],
    gameState.players[(meIndex + 3) % gameState.players.length],
  ].filter(p => p && p.id !== myId);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#064e3b] felt-texture relative select-none">
      {/* SCOREBOARD (Top Bar) */}
      <div className="h-24 bg-black/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-10 z-[100]">
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-white font-black italic text-2xl tracking-tighter">NEXUS</span>
              <span className="text-[8px] text-emerald-400 font-black tracking-widest uppercase opacity-50">Card Console v1.0</span>
           </div>
           <div className="h-10 w-[1px] bg-white/10 mx-2"></div>
           <div className="flex gap-10">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                   <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Team One</span>
                 </div>
                 <div className="text-2xl font-black text-white">{gameState.teamScores.team1}</div>
              </div>
              <div className="flex flex-col">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                   <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Team Two</span>
                 </div>
                 <div className="text-2xl font-black text-white">{gameState.teamScores.team2}</div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-16 absolute left-1/2 -translate-x-1/2">
           <div className="flex flex-col items-center">
              <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mb-1">Active Bid</span>
              <div className="text-3xl font-black text-yellow-400 tabular-nums">
                {gameState.currentBid > 61 ? gameState.currentBid : '--'}
              </div>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mb-1">Trump</span>
              <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {gameState.trumpSuit ? <SuitIcon suit={gameState.trumpSuit} /> : <span className="text-white/10">?</span>}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {isHost && gameState.phase === 'lobby' && (
             <button 
                onClick={() => { const s = dealCards(gameState); setGameState(s); broadcastState(s); }}
                disabled={gameState.players.length < 2}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-20 flex