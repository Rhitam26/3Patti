import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useGame } from '../../context/GameContext';

const Navbar = ({ onNavigate, currentPage }) => {
  const { account, balance, shortAddress, disconnectWallet } = useWeb3();
  const { isGameActive, resetGame } = useGame();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleHome = () => {
    if (isGameActive) {
      if (window.confirm('Leave current game?')) {
        resetGame();
        onNavigate('home');
      }
    } else {
      onNavigate('home');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{ background: 'linear-gradient(90deg, rgba(10,14,26,0.95) 0%, rgba(13,27,62,0.95) 50%, rgba(26,5,51,0.95) 100%)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(157,0,255,0.3)' }}>
      
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
        <div className="text-3xl">🃏</div>
        <div>
          <div className="font-game font-black text-xl neon-text-gold">Teen Patti</div>
          <div className="font-game text-xs neon-text-purple tracking-widest">BLOCKCHAIN</div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-6">
        {['home', 'leaderboard', 'profile'].map(page => (
          <button key={page} onClick={() => onNavigate(page)}
            className={`capitalize font-display font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
              currentPage === page 
                ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}>
            {page === 'home' ? '🏠 Home' : page === 'leaderboard' ? '🏆 Leaderboard' : '👤 Profile'}
          </button>
        ))}
      </div>

      {/* Wallet Info */}
      {account && (
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl border border-purple-500/30 bg-purple-900/30 hover:bg-purple-900/50 transition-all">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div className="text-right">
              <div className="text-xs text-gray-400">Balance</div>
              <div className="text-sm font-bold text-yellow-400">{balance} MATIC</div>
            </div>
            <div className="text-xs font-mono text-purple-300 bg-purple-900/50 px-2 py-1 rounded">
              {shortAddress}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-purple-500/30 overflow-hidden"
              style={{ background: 'rgba(10,14,26,0.98)', backdropFilter: 'blur(20px)' }}>
              <div className="p-3 border-b border-purple-500/20">
                <div className="text-xs text-gray-400">Connected Address</div>
                <div className="text-xs font-mono text-purple-300 mt-1 break-all">{account}</div>
              </div>
              <button onClick={() => { disconnectWallet(); setShowDropdown(false); }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/20 transition-colors text-sm font-semibold">
                🔌 Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;