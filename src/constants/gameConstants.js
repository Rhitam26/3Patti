export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const HAND_RANKINGS = {
  TRAIL: { rank: 6, name: 'Trail (Three of a Kind)', color: '#f5c518' },
  PURE_SEQUENCE: { rank: 5, name: 'Pure Sequence (Straight Flush)', color: '#9d00ff' },
  SEQUENCE: { rank: 4, name: 'Sequence (Straight)', color: '#00d4ff' },
  COLOR: { rank: 3, name: 'Color (Flush)', color: '#ff2d78' },
  PAIR: { rank: 2, name: 'Pair', color: '#4caf50' },
  HIGH_CARD: { rank: 1, name: 'High Card', color: '#aaaaaa' },
};

export const GAME_PHASES = {
  WAITING: 'waiting',
  DEALING: 'dealing',
  BETTING: 'betting',
  SHOWDOWN: 'showdown',
  RESULT: 'result',
};

export const PLAYER_ACTIONS = {
  CALL: 'call',
  RAISE: 'raise',
  FOLD: 'fold',
  ALL_IN: 'all_in',
  SHOW: 'show',
  BLIND: 'blind',
  SEEN: 'seen',
};

export const TABLE_TYPES = {
  RANDOM: 'random',
  PRACTICE: 'practice',
  PRIVATE: 'private',
};

export const BLIND_AMOUNTS = [
  { label: '0.001 MATIC', value: '0.001' },
  { label: '0.01 MATIC', value: '0.01' },
  { label: '0.1 MATIC', value: '0.1' },
  { label: '1 MATIC', value: '1' },
];

export const SEAT_POSITIONS = [
  { top: '5%', left: '42%' },     // Top center
  { top: '15%', right: '5%' },    // Top right
  { top: '50%', right: '2%' },    // Middle right
  { bottom: '10%', right: '15%' }, // Bottom right
  { bottom: '10%', left: '15%' }, // Bottom left
  { top: '50%', left: '2%' },     // Middle left
];

export const AVATARS = [
  '👤', '🧑', '👩', '🧔', '👱', '🧕',
];

export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual
export const CHAIN_ID = '0x13881'; // Mumbai testnet