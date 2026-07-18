import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import PlayerSeat from './PlayerSeat';
import ActionButtons from './ActionButtons';
import PotDisplay from './PotDisplay';
import ChatBox from './ChatBox';
import ResultModal from '../modals/ResultModal';
import { GAME_PHASES, PLAYER_ACTIONS, SEAT_POSITIONS } from '../../constants/gameConstants';
import { evaluateHand } from '../../utils/cardUtils';
import { HAND_RANKINGS } from '../../constants/gameConstants';

const GameTable = ({ onNavigate }) => {
  const { account } = useWeb3();
  const {
    players, gameState, currentPlayerIndex, pot, lastBet, winner,
    currentPhase, tableId, inviteCode, tableType, showResult,
    performAction, resetGame, setShowResult,
  } = useGame();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSeen, setIsSeen] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === account || currentPlayer?.id === players[0]?.id;
  const humanPlayerIndex = players.findIndex(p => p.isHuman);
  const humanPlayer = players[humanPlayerIndex];
  const humanState = gameState?.playerStates?.[humanPlayer?.id];
  const humanCards = humanState?.cards || [];
  const handEval = humanCards.length === 3 ? evaluateHand(humanCards) : null;
  const handInfo = handEval ? HAND_RANKINGS[handEval.type] : null;

  // Repositioned seats around table
  const seatPositions = [
    { top: '2%', left: '38%', transform: 'translateX(-50%)' },   // Top (Player 2)
    { top: '10%', right: '2%' },                                   // Top-right (Player 3)
    { top: '50%', right: '0%', transform: 'translateY(-50%)' },   // Right (Player 4)
    { bottom: '5%', right: '8%' },                                 // Bottom-right
    { bottom: '5%', left: '8%' },                                  // Bottom-left (You)
    { top: '50%', left: '0%', transform: 'translateY(-50%)' },    // Left (Player 6)
  ];

  const handleSee = () => {
    setIsSeen(true);
    performAction(PLAYER_ACTIONS.SEEN);
  };

  const handleLeave = () => {
    if (window.confirm('Leave game? You will forfeit your bet.')) {
      resetGame();
      onNavigate('home');
    }
  };

  if (!gameState) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
      <div className="text-center">
        <div className="text-6xl mb-4 animate-spin">🃏</div>
        <p className="text-white font-game text-xl">Loading Game...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #051015 0%, #0a1a0a 100%)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-green-900/50" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <div className="flex items-center gap-3">
          <button onClick={handleLeave} className="w-10 h-10 rounded-full border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-900/30">
            ↩
          </button>
          <div>
            <div className="text-xs text-gray-400">Table</div>
            <div className="text-sm font-mono font-bold text-yellow-400">#{tableId}</div>
          </div>
          {inviteCode && (
            <div className="hidden md:block">
              <div className="text-xs text-gray-400">Invite</div>
              <div className="text-sm font-mono font-bold text-pink-400">{inviteCode}</div>
            </div>
          )}
        </div>

        <div className="font-game font-bold text-lg neon-text-gold">Teen Patti</div>

        <div className="flex items-center gap-3">
          {handInfo && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold"
              style={{ borderColor: handInfo.color + '50', color: handInfo.color, background: handInfo.color + '15' }}>
              ✨ {handInfo.name}
            </div>
          )}
          <div className="text-xs text-gray-400 capitalize">{tableType}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* Outer table wrapper */}
        <div className="relative w-full max-w-4xl" style={{ paddingBottom: '60%' }}>
          
          {/* The Table */}
          <div className="absolute inset-8 game-table rounded-full flex items-center justify-center">
            {/* Table inner felt */}
            <div className="w-4/5 h-4/5 rounded-full flex items-center justify-center"
              style={{ background: 'radial-gradient(circle, #1f7a40 0%, #0d4a20 100%)' }}>
              <PotDisplay pot={pot} lastBet={lastBet} phase={currentPhase} roundNumber={gameState.roundNumber} />
            </div>
          </div>

          {/* Players around table */}
          {players.map((player, idx) => {
            const posIdx = idx % seatPositions.length;
            return (
              <PlayerSeat
                key={player.id}
                player={player}
                playerState={gameState.playerStates[player.id]}
                isCurrentTurn={currentPlayerIndex === idx}
                isCurrentPlayer={player.isHuman}
                position={seatPositions[posIdx]}
              />
            );
          })}
        </div>

        {/* Action Buttons - Only show on human player's turn */}
        <AnimatePresence>
          {isMyTurn && currentPhase === GAME_PHASES.BETTING && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-2xl"
              style={{ background: 'rgba(0,0,0,0.8)', borderRadius: '16px', padding: '16px', backdropFilter: 'blur(20px)', border: '1px solid rgba(157,0,255,0.2)' }}>
              
              {/* Turn indicator */}
              <div className="text-center mb-3">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-yellow-400 font-bold text-sm">
                  ⏰ Your Turn! Make a decision...
                </motion.div>
              </div>

              <ActionButtons
                onAction={performAction}
                lastBet={lastBet}
                pot={pot}
                isSeen={isSeen}
                canSee={!isSeen}
                onSee={handleSee}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting indicator */}
        {!isMyTurn && currentPhase === GAME_PHASES.BETTING && (
          <div className="text-center py-4">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-gray-400 text-sm">
              Waiting for {currentPlayer?.name}...
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-green-900/50" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <button onClick={handleLeave} className="btn-gold px-6 py-2 rounded-xl text-sm font-bold">
          Main Menu
        </button>
        <div className="text-xs text-gray-500 font-mono">
          {players.filter(p => !gameState.playerStates[p.id]?.isFolded).length} players active
        </div>
        <button className="px-6 py-2 rounded-xl border border-purple-500/30 text-purple-300 text-sm font-bold hover:bg-purple-900/20">
          Show Result
        </button>
      </div>

      {/* Chat */}
      <ChatBox isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && winner && (
          <ResultModal
            winner={winner}
            pot={pot}
            players={players}
            playerStates={gameState.playerStates}
            onPlayAgain={() => { setShowResult(false); onNavigate('home'); }}
            onHome={() => { resetGame(); onNavigate('home'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameTable;