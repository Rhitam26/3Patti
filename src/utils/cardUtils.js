import { SUITS, RANKS } from '../constants/gameConstants';

export const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  return deck;
};

export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const dealCards = (deck, numPlayers, cardsPerPlayer = 3) => {
  const hands = Array.from({ length: numPlayers }, () => []);
  let cardIndex = 0;
  for (let card = 0; card < cardsPerPlayer; card++) {
    for (let player = 0; player < numPlayers; player++) {
      hands[player].push(deck[cardIndex++]);
    }
  }
  return hands;
};

export const getCardColor = (suit) => {
  return suit === '♥' || suit === '♦' ? '#e53e3e' : '#1a202c';
};

export const getRankValue = (rank) => {
  const values = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
};

export const evaluateHand = (cards) => {
  if (cards.length !== 3) return null;
  
  const ranks = cards.map(c => getRankValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1;
  const isSpecialStraight = ranks[0] === 14 && ranks[1] === 3 && ranks[2] === 2;
  
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
    return { type: 'TRAIL', score: 6000 + ranks[0] };
  }
  if (isFlush && (isStraight || isSpecialStraight)) {
    return { type: 'PURE_SEQUENCE', score: 5000 + ranks[0] };
  }
  if (isStraight || isSpecialStraight) {
    return { type: 'SEQUENCE', score: 4000 + ranks[0] };
  }
  if (isFlush) {
    return { type: 'COLOR', score: 3000 + ranks[0] * 100 + ranks[1] };
  }
  if (ranks[0] === ranks[1] || ranks[1] === ranks[2]) {
    const pairRank = ranks[0] === ranks[1] ? ranks[0] : ranks[1];
    return { type: 'PAIR', score: 2000 + pairRank * 100 };
  }
  return { type: 'HIGH_CARD', score: 1000 + ranks[0] * 100 + ranks[1] * 10 + ranks[2] };
};