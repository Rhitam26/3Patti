import React from 'react';
import { motion } from 'framer-motion';

const Chip = ({ color, size = 'sm' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
    className={`rounded-full border-4 ${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'}`}
    style={{ background: color, borderColor: 'rgba(255,255,255,0.3)' }} />
);

const PotDisplay = ({ pot, lastBet, phase, roundNumber }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center gap-3">
    
    {/* Chips visual */}
    <div className="flex gap-1 justify-center">
      <Chip color="#1565c0" />
      <Chip color="#4caf50" />
      <Chip color="#f44336" />
      <Chip color="#9c27b0" />
    </div>

    <div className="px-6 py-4 rounded-2xl border text-center"
      style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(245,197,24,0.4)', backdropFilter: 'blur(10px)' }}>
      <div className="text-xs text-gray-400 mb-1">Total Pot</div>
      <div className="font-game font-bold text-2xl neon-text-gold">{pot?.toFixed(4)} MATIC</div>
      <div className="border-t border-yellow-500/20 mt-2 pt-2 space-y-1">
        <div className="text-xs text-gray-400">
          Last Bet: <span className="text-white font-semibold">{lastBet?.toFixed(4)}</span>
        </div>
        <div className="text-xs text-gray-400">
          Phase: <span className="text-purple-300 font-semibold capitalize">{phase}</span>
        </div>
        <div className="text-xs text-gray-400">
          Round: <span className="text-blue-300 font-semibold">{roundNumber}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default PotDisplay;