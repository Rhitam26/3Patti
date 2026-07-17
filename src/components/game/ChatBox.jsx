import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';

const QUICK_MESSAGES = ['Good luck! 🍀', 'Nice hand! 👏', 'Let\'s go! 🔥', 'GG! 🎉'];

const ChatBox = ({ isOpen, onToggle }) => {
  const { chatMessages, addChatMessage } = useGame();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = (msg) => {
    const text = msg || input.trim();
    if (!text) return;
    addChatMessage(text, 'You');
    setInput('');
  };

  return (
    <>
      <button onClick={onToggle}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full btn-purple flex items-center justify-center shadow-lg">
        💬
        {chatMessages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-xs flex items-center justify-center font-bold">
            {chatMessages.length > 9 ? '9+' : chatMessages.length}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-40 right-4 z-40 w-72 rounded-2xl border border-purple-500/30 overflow-hidden"
            style={{ background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(20px)', maxHeight: '40vh' }}>
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20">
              <span className="font-semibold text-sm">💬 Table Chat</span>
              <button onClick={onToggle} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: '25vh' }}>
              {chatMessages.length === 0 ? (
                <p className="text-center text-gray-500 text-xs py-4">No messages yet</p>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="text-xs">
                    <span className="text-purple-300 font-semibold">{msg.sender}: </span>
                    <span className="text-gray-300">{msg.message}</span>
                    <span className="text-gray-600 ml-1">{msg.time}</span>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex gap-1 px-3 py-2 border-t border-purple-500/20 flex-wrap">
              {QUICK_MESSAGES.map(msg => (
                <button key={msg} onClick={() => sendMessage(msg)}
                  className="text-xs px-2 py-1 rounded-full border border-purple-500/30 text-gray-300 hover:bg-purple-900/30">
                  {msg}
                </button>
              ))}
            </div>

            <div className="flex gap-2 px-3 pb-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-white text-xs focus:outline-none focus:border-purple-500" />
              <button onClick={() => sendMessage()}
                className="px-3 py-2 rounded-lg btn-purple text-xs font-bold">Send</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;