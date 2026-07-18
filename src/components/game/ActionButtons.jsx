import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PLAYER_ACTIONS } from '../../constants/gameConstants';

const ActionButtons = ({ onAction, lastBet, pot, isSeen, canSee, onSee }) => {
  const [raiseAmount, setRaiseAmount] = useState(lastBet * 2);
  const [showRaise, setShowRaise] = useState(false);

  const callAmount = isSeen ? lastBet : lastBet / 2;

  const buttons = [
    {
      action: PLAYER_ACTIONS.FOLD,
      label: '✖ Fold',
      color: '#f44336',
      bg: 'linear-gradient(135deg, #c62828 0%, #f44336 100%)',
    },
    {
      action: PLAYER_ACTIONS.CALL,
      label: `📞 ${isSeen ? 'Call' : 'Blind Call'} (${callAmount.toFixed(4)})`,
      color: '#4caf50',
      bg: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
    },
    {
      action: 'raise_toggle',
      label: '⬆ Raise',
      color: '#ff9800',
      bg: 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)',
    },
    {
      action: PLAYER_ACTIONS.ALL_IN,
      label: '💥 All In',
      color: '#e91e63',
      bg: 'linear-gradient(135deg, #880e4f 0%, #e91e63 100%)',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* See/Blind toggle */}
      {canSee && !isSeen && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onSee}
          className="px-6 py-2 rounded-full text-sm font-bold text-white border border-blue-500/50 hover:bg-blue-900/30 transition-all"
          style={{ background: 'rgba(33, 150, 243, 0.2)' }}>
          👁 See Cards
        </motion.button>
      )}

      {/* Raise slider */}
      {showRaise && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-500/30 bg-orange-900/20">
          <span className="text-xs text-gray-400">Raise:</span>
          <input type="range"
            min={lastBet * 2} max={pot * 2} step={0.001}
            value={raiseAmount}
            onChange={e => setRaiseAmount(parseFloat(e.target.value))}
            className="w-32 accent-orange-500" />
          <span className="text-orange-400 font-bold text-sm w-24">{raiseAmount.toFixed(4)} M</span>
          <button onClick={() => { onAction(PLAYER_ACTIONS.RAISE, raiseAmount); setShowRaise(false); }}
            className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600">
            Confirm
          </button>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        {buttons.map(({ action, label, bg }) => (
          <motion.button
            key={action}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (action === 'raise_toggle') { setShowRaise(!showRaise); return; }
              onAction(action);
            }}
            className="px-4 py-3 rounded-xl font-bold text-white text-sm shadow-lg"
            style={{ background: bg, boxShadow: `0 4px 15px rgba(0,0,0,0.3)` }}>
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;