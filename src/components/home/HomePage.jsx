import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';
import { useGame } from '../../context/GameContext';
import CreateTableModal from '../modals/CreateTableModal';
import JoinTableModal from '../modals/JoinTableModal';
import { BLIND_AMOUNTS } from '../../constants/gameConstants';

const LIVE_TABLES = [
  { id: 'TBL001', players: 4, maxPlayers: 6, pot: '0.5 MATIC', blind: '0.01 MATIC', type: 'Public' },
  { id: 'TBL002', players: 2, maxPlayers: 4, pot: '2.1 MATIC', blind: '0.1 MATIC', type: 'Public' },
  { id: 'TBL003', players: 6, maxPlayers: 6, pot: '8.5 MATIC', blind: '1 MATIC', type: 'High Roller' },
  { id: 'TBL004', players: 3, maxPlayers: 6, pot: '0.15 MATIC', blind: '0.001 MATIC', type: 'Public' },
];

const GameModeCard = ({ icon, title, subtitle, color, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative cursor-pointer rounded-2xl p-6 border overflow-hidden group"
    style={{ background: 'rgba(255,255,255,0.03)', borderColor: `${color}40` }}>
    
    {/* Glow effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)` }} />
    
    {/* Corner accent */}
    <div className="absolute top-0 right-0 w-20 h-20 opacity-20"
      style={{ background: `radial-gradient(circle at top right, ${color} 0%, transparent 70%)` }} />

    <div className="relative z-10">
      <div className="text-5xl mb-4 filter drop-shadow-lg">{icon}</div>
      <h3 className="font-game font-bold text-xl mb-2" style={{ color }}>{title}</h3>
      <p className="text-gray-400 text-sm font-display">{subtitle}</p>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
  </motion.div>
);

const LiveTableRow = ({ table, onJoin }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all group"
    style={{ background: 'rgba(255,255,255,0.02)' }}>
    <div className="flex items-center gap-4">
      <div className="text-lg font-mono text-purple-300 font-bold">#{table.id}</div>
      <div>
        <div className="text-sm font-semibold text-white">{table.type}</div>
        <div className="text-xs text-gray-400">Blind: {table.blind}</div>
      </div>
    </div>
    <div className="text-center">
      <div className="text-xs text-gray-400">Players</div>
      <div className="text-sm font-bold text-yellow-400">{table.players}/{table.maxPlayers}</div>
    </div>
    <div className="text-center">
      <div className="text-xs text-gray-400">Pot</div>
      <div className="text-sm font-bold text-green-400">{table.pot}</div>
    </div>
    <button onClick={() => onJoin(table)}
      className="btn-purple px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
      Join
    </button>
  </motion.div>
);

const HomePage = ({ onNavigate }) => {
  const { account } = useWeb3();
  const { startPracticeGame, startRandomGame, createTable, setBootAmount, bootAmount } = useGame();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [floatingCards] = useState(['🂱', '🂻', '🂽', '🃁', '🃍']);

  const handleStartPractice = () => {
    startPracticeGame(account);
    onNavigate('game');
  };

  const handleStartRandom = () => {
    startRandomGame(account);
    onNavigate('game');
  };

  const handleCreateTable = (config) => {
    const result = createTable(account, config);
    setShowCreateModal(false);
    onNavigate('game');
    return result;
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 50%, #1a0533 100%)' }}>
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              background: i % 2 === 0 ? '#9d00ff' : '#f5c518',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
            }} />
        ))}
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12">
        
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-7xl mb-4">🃏</motion.div>
        
        <h1 className="font-game font-black text-5xl md:text-7xl mb-3">
          <span className="neon-text-gold">Teen</span>
          <span className="text-white"> Patti</span>
        </h1>
        <p className="font-game text-xl neon-text-purple tracking-widest mb-2">BLOCKCHAIN EDITION</p>
        <p className="text-gray-400 font-display max-w-md mx-auto">
          Play on the blockchain. Every hand is fair. Every win is yours.
        </p>

        {/* Wallet badge */}
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-green-500/30 bg-green-900/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-sm font-semibold">
            Wallet Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
        </div>
      </motion.div>

      {/* Boot Amount Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-10">
        <div className="text-center mb-4">
          <span className="text-gray-400 text-sm font-display">Select Boot Amount</span>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          {BLIND_AMOUNTS.map(({ label, value }) => (
            <button key={value} onClick={() => setBootAmount(parseFloat(value))}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                bootAmount === parseFloat(value)
                  ? 'btn-gold'
                  : 'border border-purple-500/30 text-gray-300 hover:border-purple-500/60'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Game Mode Cards */}
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center font-game font-bold text-2xl text-gray-300 mb-6">
          Choose Your Game
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <GameModeCard
            icon="🎲"
            title="Random Table"
            subtitle="Join a random table and play with strangers on-chain"
            color="#9d00ff"
            onClick={handleStartRandom}
            delay={0.1}
          />
          <GameModeCard
            icon="🆓"
            title="Practice"
            subtitle="Play for free against AI bots. No wallet needed"
            color="#00d4ff"
            onClick={handleStartPractice}
            delay={0.2}
          />
          <GameModeCard
            icon="➕"
            title="Create Table"
            subtitle="Create a private table and invite your friends"
            color="#f5c518"
            onClick={() => setShowCreateModal(true)}
            delay={0.3}
          />
          <GameModeCard
            icon="🔗"
            title="Join Table"
            subtitle="Enter an invite code to join a private game"
            color="#ff2d78"
            onClick={() => setShowJoinModal(true)}
            delay={0.4}
          />
        </div>

        {/* Live Tables */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-purple-500/20 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20">
            <h3 className="font-game font-bold text-lg text-white">🔴 Live Tables</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-gray-400">{LIVE_TABLES.length} active tables</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {LIVE_TABLES.map(table => (
              <LiveTableRow key={table.id} table={table} onJoin={() => handleStartRandom()} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTableModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTable}
          />
        )}
        {showJoinModal && (
          <JoinTableModal
            onClose={() => setShowJoinModal(false)}
            onJoin={() => { setShowJoinModal(false); handleStartRandom(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;