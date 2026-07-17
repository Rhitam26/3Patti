import React from 'react';
import { motion } from 'framer-motion';
import { evaluateHand } from '../../utils/cardUtils';
import { HAND_RANKINGS } from '../../constants/gameConstants';
import { getCardColor } from '../../utils/cardUtils';

const ResultModal = ({ winner, pot, players, playerStates, onPlayAgain, onHome }) => {
  const winnerState = playerStates[winner.id];
  const handEval = winnerState?.cards ? evaluateHand(winnerState.cards) : null;
  const handInfo = handEval ? HAND_RANKINGS[handEval.type] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
      
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-full max-w-md rounded-2xl p-8 text-center border border-yellow-500/50 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a0533 100%)' }}>
        
        {/* Confetti effect */}
        {[...Array(20)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: ['#f5c518', '#9d00ff', '#ff2d78', '#00d4ff'][i % 4], left: `${Math.random() * 100}%`, top: '-10%' }}
            animate={{ y: '120%', rotate: 720, opacity: [1, 0] }}
            transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5, repeat: Infinity }} />
        ))}

        <div className="relative z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-7xl mb-4">🏆</motion.div>
          
          <h2 className="font-game font-black text-3xl neon-text-gold mb-2">
            {winner.isHuman ? 'You Won!' : `${winner.name} Wins!`}
          </h2>

          <div className="text-4xl font-game font-bold text-green-400 mb-4">
            +{pot?.toFixed(4)} MATIC
          </div>

          {handInfo && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
              style={{ borderColor: handInfo.color + '50', background: handInfo.color + '20' }}>
              <span className="font-bold text-sm" style={{ color: handInfo.color }}>
                ✨ {handInfo.name}
              </span>
            </div>
          )}

          {/* Winner's cards */}
          {winnerState?.cards && (
            <div className="flex justify-center gap-2 mb-6">
              {winnerState.cards.map((card, i) => (
                <div key={i} className="playing-card w-14 h-20 flex flex-col justify-between p-1">
                  <div className="text-sm font-black" style={{ color: getCardColor(card.suit) }}>{card.rank}</div>
                  <div className="text-center text-xl" style={{ color: getCardColor(card.suit) }}>{card.suit}</div>
                  <div className="text-sm font-black self-end rotate-180" style={{ color: getCardColor(card.suit) }}>{card.rank}</div>
                </div>
              ))}
            </div>
          )}

          {/* All players summary */}
          <div className="space-y-2 mb-6">
            {players.map(p => {
              const ps = playerStates[p.id];
              const hand = ps?.cards ? evaluateHand(ps.cards) : null;
              return (
                <div key={p.id} className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                  p.id === winner.id ? 'border border-yellow-500/50 bg-yellow-900/20' : 'bg-white/5'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{p.avatar}</span>
                    <span className="text-sm font-semibold">{p.isHuman ? 'You' : p.name}</span>
                    {p.id === winner.id && <span className="text-yellow-400 text-xs">👑</span>}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{ps?.isFolded ? 'Folded' : hand ? HAND_RANKINGS[hand.type]?.name : '-'}</div>
                    <div className="text-xs text-red-400">-{ps?.totalBet?.toFixed(3)} MATIC</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={onHome} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold transition-all">
              🏠 Main Menu
            </button>
            <button onClick={onPlayAgain} className="flex-1 py-3 rounded-xl btn-gold font-bold">
              🔄 Play Again
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultModal;