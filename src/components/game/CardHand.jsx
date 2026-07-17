import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getCardColor } from '../../utils/cardUtils';

const SingleCard = ({ card, faceDown, index, isRevealing }) => {
  if (faceDown) {
    return (
      <motion.div
        initial={{ rotateY: 180, y: -50, opacity: 0 }}
        animate={{ rotateY: 0, y: 0, opacity: 1 }}
        transition={{ delay: index * 0.2, duration: 0.6 }}
        className="playing-card card-back w-14 h-20 md:w-16 md:h-24 flex items-center justify-center"
        style={{ transform: `rotate(${(index - 1) * 8}deg)` }}>
        <div className="text-purple-300 text-xs font-bold">🂠</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, scale: 0.8 }}
      animate={{ rotateY: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.5, type: 'spring' }}
      className="playing-card w-14 h-20 md:w-16 md:h-24 flex flex-col justify-between p-1"
      style={{ transform: `rotate(${(index - 1) * 8}deg)` }}
      whileHover={{ scale: 1.1, rotate: 0, zIndex: 10 }}>
      <div className="text-sm font-black leading-none" style={{ color: getCardColor(card.suit) }}>
        {card.rank}
      </div>
      <div className="text-center text-xl leading-none" style={{ color: getCardColor(card.suit) }}>
        {card.suit}
      </div>
      <div className="text-sm font-black leading-none self-end rotate-180" style={{ color: getCardColor(card.suit) }}>
        {card.rank}
      </div>
    </motion.div>
  );
};

const CardHand = ({ cards, faceDown = false, isSeen = false, isCurrentPlayer = false }) => {
  const [revealed, setRevealed] = useState(false);
  const showCards = !faceDown || (isSeen && isCurrentPlayer) || revealed;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end gap-1">
        {cards.map((card, i) => (
          <SingleCard key={card.id} card={card} faceDown={!showCards} index={i} />
        ))}
      </div>
      {faceDown && isCurrentPlayer && !isSeen && (
        <button onClick={() => setRevealed(!revealed)}
          className="text-xs px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 hover:bg-purple-900/30 transition-all">
          {revealed ? '🙈 Hide' : '👁 Peek'}
        </button>
      )}
    </div>
  );
};

export default CardHand;