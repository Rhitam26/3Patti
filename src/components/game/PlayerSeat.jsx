import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardHand from './CardHand';

const PlayerSeat = ({ player, playerState, isCurrentTurn, isCurrentPlayer, position }) => {
  if (!player) return null;

  const isFolded = playerState?.isFolded;
  const lastAction = playerState?.lastAction;
  const cards = playerState?.cards || [];

  const actionColors = {
    'CALL': '#4caf50', 'FOLD': '#f44336', 'RAISE': '#ff9800',
    'ALL IN': '#e91e63', 'SEEN': '#2196f3', 'BLIND CALL': '#9c27b0',
  };

  return (
    <motion.div
      className={`absolute flex flex-col items-center gap-1 player-seat ${isCurrentTurn ? 'active-turn' : ''}`}
      style={{ ...position }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: isFolded ? 0.4 : 1, scale: 1 }}
      transition={{ duration: 0.5 }}>
      
      {/* Cards */}
      {cards.length > 0 && (
        <div className="mb-1">
          <CardHand
            cards={cards}
            faceDown={!isCurrentPlayer}
            isSeen={playerState?.isSeen}
            isCurrentPlayer={isCurrentPlayer}
          />
        </div>
      )}

      {/* Action Badge */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            key={lastAction}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="px-3 py-1 rounded-full text-xs font-black text-white mb-1"
            style={{ background: actionColors[lastAction] || '#666' }}>
            {lastAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar */}
      <div className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl overflow-hidden transition-all duration-300 ${
        isCurrentTurn ? 'border-yellow-400 shadow-lg' : isFolded ? 'border-red-700' : 'border-purple-500'
      }`}
        style={{
          background: isFolded ? '#1a0000' : 'linear-gradient(135deg, #1a0533 0%, #0d1b3e 100%)',
          boxShadow: isCurrentTurn ? '0 0 20px #f5c518, 0 0 40px #f5c518' : 'none',
        }}>
        {player.avatar || '👤'}
        {isCurrentTurn && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-400"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }} />
        )}
      </div>

      {/* Name & Balance */}
      <div className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
        isCurrentPlayer ? 'bg-purple-700' : 'bg-gray-800'
      } border ${isCurrentPlayer ? 'border-purple-400' : 'border-gray-600'}`}>
        <div className="text-white truncate max-w-20">
          {isCurrentPlayer ? 'You' : player.name}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <span className="text-blue-300">💎</span>
        <span className="text-white font-semibold">{playerState?.totalBet?.toFixed(3) || '0'}</span>
      </div>

      {isFolded && (
        <div className="text-red-500 text-xs font-bold mt-1">FOLDED</div>
      )}
    </motion.div>
  );
};

export default PlayerSeat;