import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BLIND_AMOUNTS } from '../../constants/gameConstants';

const CreateTableModal = ({ onClose, onCreate }) => {
  const [config, setConfig] = useState({
    bootAmount: 0.01,
    maxPlayers: 6,
    isPrivate: true,
    balance: '10.0',
  });
  const [created, setCreated] = useState(null);

  const handleCreate = () => {
    const result = onCreate(config);
    setCreated(result);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-2xl p-6 border border-yellow-500/30"
        style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a0533 100%)' }}>
        
        <h2 className="font-game font-bold text-2xl neon-text-gold mb-6">Create Table</h2>

        {!created ? (
          <>
            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Boot Amount</label>
                <div className="grid grid-cols-2 gap-2">
                  {BLIND_AMOUNTS.map(({ label, value }) => (
                    <button key={value}
                      onClick={() => setConfig(c => ({ ...c, bootAmount: parseFloat(value) }))}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        config.bootAmount === parseFloat(value)
                          ? 'btn-gold' : 'border border-purple-500/30 text-gray-300 hover:border-purple-500'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Max Players: {config.maxPlayers}</label>
                <input type="range" min="2" max="6" value={config.maxPlayers}
                  onChange={e => setConfig(c => ({ ...c, maxPlayers: parseInt(e.target.value) }))}
                  className="w-full accent-purple-500" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>2</span><span>6</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-purple-900/10">
                <div>
                  <div className="text-white font-semibold">Private Table</div>
                  <div className="text-xs text-gray-400">Only invite code holders can join</div>
                </div>
                <button onClick={() => setConfig(c => ({ ...c, isPrivate: !c.isPrivate }))}
                  className={`w-12 h-6 rounded-full transition-all ${config.isPrivate ? 'bg-purple-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${config.isPrivate ? 'ml-6' : 'ml-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-800 transition-all font-bold">
                Cancel
              </button>
              <button onClick={handleCreate} className="flex-1 py-3 rounded-xl btn-gold font-bold rounded-xl">
                Create Table
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h3 className="font-game font-bold text-xl text-white">Table Created!</h3>
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-900/20">
              <div className="text-xs text-gray-400 mb-1">Table ID</div>
              <div className="font-mono font-bold text-yellow-400 text-lg">{created.tableId}</div>
            </div>
            <div className="p-4 rounded-xl border border-pink-500/30 bg-pink-900/20">
              <div className="text-xs text-gray-400 mb-1">Invite Code</div>
              <div className="font-mono font-bold text-pink-400 text-2xl tracking-widest">{created.inviteCode}</div>
              <div className="text-xs text-gray-500 mt-1">Share this with your friends</div>
            </div>
            <button onClick={() => {}} className="w-full py-3 btn-purple rounded-xl font-bold">
              Start Game
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreateTableModal;