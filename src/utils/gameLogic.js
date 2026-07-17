import { createDeck, shuffleDeck, dealCards, evaluateHand } from './cardUtils';
import { GAME_PHASES } from '../constants/gameConstants';

export const initializeGame = (players, bootAmount) => {
  const deck = shuffleDeck(createDeck());
  const hands = dealCards(deck, players.length);
  
  return {
    phase: GAME_PHASES.BETTING,
    pot: bootAmount * players.length,
    lastBet: bootAmount,
    currentPlayerIndex: 0,
    roundNumber: 1,
    hands,
    activePlayers: players.map(p => p.id),
    playerStates: players.reduce((acc, p, idx) => ({
      ...acc,
      [p.id]: {
        isSeen: false,
        isFolded: false,
        totalBet: bootAmount,
        cards: hands[idx],
        lastAction: null,
      }
    }), {}),
  };
};

export const getNextActivePlayer = (players, currentIndex, playerStates) => {
  let next = (currentIndex + 1) % players.length;
  let attempts = 0;
  while (playerStates[players[next].id]?.isFolded && attempts < players.length) {
    next = (next + 1) % players.length;
    attempts++;
  }
  return next;
};

export const determineWinner = (playerStates, players) => {
  const activePlayers = players.filter(p => !playerStates[p.id]?.isFolded);
  if (activePlayers.length === 1) return activePlayers[0];
  
  let winner = activePlayers[0];
  let bestHand = evaluateHand(playerStates[activePlayers[0].id].cards);
  
  for (let i = 1; i < activePlayers.length; i++) {
    const hand = evaluateHand(playerStates[activePlayers[i].id].cards);
    if (hand.score > bestHand.score) {
      bestHand = hand;
      winner = activePlayers[i];
    }
  }
  return winner;
};

export const generateTableId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};