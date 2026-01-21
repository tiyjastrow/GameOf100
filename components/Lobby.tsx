
import React from 'react';
import { GameState, GameSettings } from '../types.ts';
import { Users, Settings, Wifi, Link as LinkIcon, Check, Trophy, Hash } from 'lucide-react';

interface LobbyProps {
  gameState: GameState;
  isHost: boolean;
  myId: string;
  onCopyLink: () => void;
  onUpdateSettings: (settings: GameSettings) => void;
  copiedLink: boolean;
}

const Lobby: React.FC<LobbyProps> = ({ gameState, isHost, myId, onCopyLink, onUpdateSettings, copiedLink }) => {
  const handleSettingChange = (key: keyof GameSettings, value: number | boolean) => {
    if (!isHost) return;
    onUpdateSettings({
      ...gameState.settings,
      [key]: value
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Players List */}
        <div className="lg:col-span-7 bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Users className="text-emerald-400" />
              THE TABLE ({gameState.players.length}/4)
            </h2>
            {isHost && (
              <button 
                onClick={onCopyLink}
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              >
                {copiedLink ? <Check size={14} /> : <LinkIcon size={14} />}
                {copiedLink ? 'LINK COPIED' : 'INVITE LINK'}
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {gameState.players.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  player.id === myId ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center font-black text-xl shadow-lg">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2 text-lg text-white">
                      {player.name}
                      {player.isHost && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30">HOST</span>}
                      {player.id === myId && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">YOU</span>}
                    </div>
                    <div className="text-[10px] text-white/30 font-mono tracking-widest uppercase">ID: {player.id.substring(0, 12)}...</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Connected</span>
                </div>
              </div>
            ))}
            {Array.from({ length: 4 - gameState.players.length }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/10 italic text-sm group hover:border-white/20 transition-colors">
                Waiting for player to join...
              </div>
            ))}
          </div>
        </div>

        {/* Settings & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-white">
              <Settings className="text-blue-400" />
              GAME SETTINGS
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/40 mb-3">
                  <span className="flex items-center gap-2 text-white/60"><Hash size={14} /> Cards per player</span>
                  <span className="text-blue-400">{gameState.settings.cardsPerHand}</span>
                </label>
                <input 
                  type="range" min="1" max="13" step="1" 
                  value={gameState.settings.cardsPerHand}
                  disabled={!isHost}
                  onChange={(e) => handleSettingChange('cardsPerHand', parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-white/40 mb-3">
                  <span className="flex items-center gap-2 text-white/60"><Trophy size={14} /> Winning Score</span>
                  <span className="text-emerald-400">{gameState.settings.winningScore} pts</span>
                </label>
                <div className="flex gap-2">
                  {[250, 500, 1000].map(score => (
                    <button
                      key={score}
                      onClick={() => handleSettingChange('winningScore', score)}
                      disabled={!isHost}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        gameState.settings.winningScore === score 
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-center gap-4 text-center">
                   <div className="p-4 bg-white/5 rounded-2xl flex-1 border border-white/10">
                      <Wifi className="mx-auto mb-2 text-blue-400" size={20} />
                      <div className="text-[10px] text-white/40 font-black uppercase">P2P Link</div>
                      <div className="text-xs font-bold text-emerald-400">Stable</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl flex-1 border border-white/10">
                      <Users className="mx-auto mb-2 text-emerald-400" size={20} />
                      <div className="text-[10px] text-white/40 font-black uppercase">Max Players</div>
                      <div className="text-xs font-bold text-white">4 People</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-white/10 rounded-3xl p-6 text-center">
            <p className="text-white/60 text-sm mb-2 font-medium">Ready to shuffle the deck?</p>
            {!isHost ? (
              <div className="text-emerald-400 font-black tracking-widest uppercase animate-pulse">Waiting for host...</div>
            ) : (
              <p className="text-xs text-white/30 italic">Configure your rules above, then hit Start Game in the top bar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
