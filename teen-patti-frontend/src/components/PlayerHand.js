import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SUITS = ['♥', '♦', '♣', '♠'];
const SUIT_NAMES = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const PlayerHand = ({ cards, showCards, setShowCards, isMyTurn }) => {
  const renderCard = (card, index) => {
    const suit = SUITS[card.suit];
    const rank = RANKS[card.rank];
    const isRed = card.suit === 0 || card.suit === 1; // Hearts or Diamonds
    
    return (
      <div 
        key={index}
        className={`relative w-24 h-36 rounded-lg shadow-xl flex flex-col items-center justify-center text-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
          isRed ? 'bg-white text-red-600' : 'bg-white text-black'
        } border-2 ${isRed ? 'border-red-300' : 'border-gray-300'}`}
        style={{
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}
      >
        {/* Top rank and suit */}
        <div className="absolute top-2 left-2 text-sm">
          <div className="font-bold">{rank}</div>
          <div className="text-xl leading-none">{suit}</div>
        </div>

        {/* Center suit (large) */}
        <div className="text-5xl">{suit}</div>
        <div className="text-3xl font-bold">{rank}</div>

        {/* Bottom rank and suit (upside down) */}
        <div className="absolute bottom-2 right-2 text-sm transform rotate-180">
          <div className="font-bold">{rank}</div>
          <div className="text-xl leading-none">{suit}</div>
        </div>
      </div>
    );
  };

  const renderCardBack = (index) => {
    return (
      <div 
        key={index}
        className="relative w-24 h-36 rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}
      >
        {/* Card back pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-6xl opacity-50">
            🂠
          </div>
        </div>
        
        {/* Decorative border */}
        <div className="absolute inset-2 border-2 border-white opacity-30 rounded"></div>
        <div className="absolute inset-3 border border-white opacity-20 rounded"></div>
      </div>
    );
  };

  const getHandRank = () => {
    if (!cards || cards.length !== 3) return null;

    // Sort cards by rank
    const sortedCards = [...cards].sort((a, b) => a.rank - b.rank);
    
    const ranks = sortedCards.map(c => c.rank);
    const suits = sortedCards.map(c => c.suit);
    
    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
    const isStraight = 
      (ranks[2] === ranks[1] + 1 && ranks[1] === ranks[0] + 1) ||
      (ranks[0] === 2 && ranks[1] === 3 && ranks[2] === 14); // A-2-3 special case
    
    // Trail (Three of a Kind)
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
      return { 
        rank: 'Trail', 
        description: 'Three of a Kind!', 
        color: 'text-purple-600', 
        emoji: '🔥' 
      };
    }
    
    // Straight Flush
    if (isFlush && isStraight) {
      return { 
        rank: 'Straight Flush', 
        description: 'Sequential & Same Suit!', 
        color: 'text-red-600', 
        emoji: '💎' 
      };
    }
    
    // Straight
    if (isStraight) {
      return { 
        rank: 'Straight', 
        description: 'Sequential Cards!', 
        color: 'text-blue-600', 
        emoji: '📈' 
      };
    }
    
    // Flush
    if (isFlush) {
      return { 
        rank: 'Flush', 
        description: 'Same Suit!', 
        color: 'text-green-600', 
        emoji: '✨' 
      };
    }
    
    // Pair
    if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
      return { 
        rank: 'Pair', 
        description: 'Two of a Kind!', 
        color: 'text-yellow-600', 
        emoji: '👥' 
      };
    }
    
    // High Card
    return { 
      rank: 'High Card', 
      description: `${RANKS[Math.max(...ranks)]} High`, 
      color: 'text-gray-600', 
      emoji: '🎴' 
    };
  };

  const handRank = showCards ? getHandRank() : null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Your Cards</h3>
          {isMyTurn && (
            <span className="text-sm text-green-600 font-medium">🎯 Your turn to play!</span>
          )}
        </div>
        
        <button
          onClick={() => setShowCards(!showCards)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          {showCards ? (
            <>
              <EyeOff className="w-5 h-5" />
              <span className="font-medium">Hide Cards</span>
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              <span className="font-medium">Show Cards</span>
            </>
          )}
        </button>
      </div>

      {/* Cards Display */}
      <div className="flex justify-center gap-4 mb-4">
        {showCards ? (
          cards.map((card, idx) => renderCard(card, idx))
        ) : (
          [0, 1, 2].map((idx) => renderCardBack(idx))
        )}
      </div>

      {/* Hand Ranking Display */}
      {showCards && handRank && (
        <div className={`mt-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 ${
          handRank.rank === 'Trail' ? 'border-purple-500' :
          handRank.rank === 'Straight Flush' ? 'border-red-500' :
          handRank.rank === 'Straight' ? 'border-blue-500' :
          handRank.rank === 'Flush' ? 'border-green-500' :
          handRank.rank === 'Pair' ? 'border-yellow-500' :
          'border-gray-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Your Hand:</div>
              <div className={`text-2xl font-bold ${handRank.color}`}>
                {handRank.emoji} {handRank.rank}
              </div>
              <div className="text-sm text-gray-600 mt-1">{handRank.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* Hint for blind players */}
      {!showCards && (
        <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>💡 Playing Blind:</strong> You're playing without seeing your cards. 
            Click "Show Cards" to reveal them and switch to seen mode (double stakes).
          </p>
        </div>
      )}

      {/* Card Details */}
      {showCards && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
          {cards.map((card, idx) => (
            <div key={idx} className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold">{RANKS[card.rank]} of {SUIT_NAMES[card.suit]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;