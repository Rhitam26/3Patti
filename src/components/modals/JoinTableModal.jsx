import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JoinTableModal = ({ onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (code.length < 6) { setError('Please enter a valid invite code'); return; }
    onJoin(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-sm rounded-2xl p-6 border border-pink-500/30"
        style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a0533 100%)' }}>
        
        <h2 className="font-game font-bold text-2xl neon-text-pink mb-6">Join Table</h2>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Enter Invite Code</label>
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder="XXXXXX"
            maxLength={8}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white font-mono text-center text-2xl tracking-widest focus:outline-none focus:border-pink-500 transition-all"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-800 transition-all font-bold">
            Cancel
          </button>
          <button onClick={handleJoin} className="flex-1 py-3 rounded-xl font-bold"
            style={{ background: 'linear-gradient(135deg, #ff2d78 0%, #cc0044 100%)' }}>
            Join Game
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JoinTableModal;