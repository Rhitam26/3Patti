import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { GameProvider } from './context/GameContext';
import WalletConnect from './components/common/WalletConnect';
import Navbar from './components/common/Navbar';
import HomePage from './components/home/HomePage';
import GameTable from './components/game/GameTable';
import './styles/globals.css';

const AppContent = () => {
  const { account } = useWeb3();
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => setCurrentPage(page);

  if (!account) return <WalletConnect />;

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      {currentPage !== 'game' && (
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <motion.div key="home"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>
            <HomePage onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentPage === 'game' && (
          <motion.div key="game"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>
            <GameTable onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentPage === 'leaderboard' && (
          <motion.div key="leaderboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen pt-20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="font-game font-bold text-3xl neon-text-gold mb-2">Leaderboard</h2>
              <p className="text-gray-400">Coming soon with on-chain stats</p>
            </div>
          </motion.div>
        )}
        {currentPage === 'profile' && (
          <motion.div key="profile"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen pt-20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="font-game font-bold text-3xl neon-text-purple mb-2">Profile</h2>
              <p className="text-gray-400">On-chain stats coming soon</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </Web3Provider>
  );
}

export default App;