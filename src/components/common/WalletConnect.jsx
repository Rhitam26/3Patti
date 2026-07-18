import React from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../context/Web3Context';

const WalletConnect = () => {
  const { connectWallet, isConnecting, error } = useWeb3();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 50%, #1a0533 100%)' }}>
      
      {/* Background effects */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px',
              background: i % 2 === 0 ? '#9d00ff' : '#f5c518', opacity: Math.random() * 0.5 + 0.1,
              left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
            }} />
        ))}

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #9d00ff 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f5c518 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center px-8 py-12 max-w-lg w-full mx-4">
        
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-8xl mb-6">🃏</motion.div>

        <h1 className="font-game font-black text-6xl mb-3">
          <span className="neon-text-gold">Teen</span>
          <br />
          <span className="text-white">Patti</span>
        </h1>
        
        <p className="font-game text-lg neon-text-purple tracking-widest mb-2">BLOCKCHAIN EDITION</p>
        <p className="text-gray-400 font-display mb-10 max-w-sm mx-auto leading-relaxed">
          Connect your MetaMask wallet to play decentralized Teen Patti on Polygon Network
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: '⛓️', label: 'On-Chain' },
            { icon: '🔒', label: 'Secure' },
            { icon: '💎', label: 'Fair Play' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-purple-500/20 bg-purple-900/10">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-gray-400 font-semibold">{label}</span>
            </div>
          ))}
        </div>

        {/* Connect Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-5 rounded-2xl font-game font-bold text-xl btn-gold shadow-2xl mb-4 relative overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(245,197,24,0.4)' }}>
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
            style={{ backgroundSize: '200% 100%' }} />
          {isConnecting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <span>🦊</span> Connect MetaMask
            </span>
          )}
        </motion.button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </motion.div>
        )}

        <p className="text-gray-600 text-xs mt-6">
          Polygon Mumbai Testnet • No real funds required
        </p>
      </motion.div>
    </div>
  );
};

export default WalletConnect;