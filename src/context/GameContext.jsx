import React, { createContext, useContext, useState, useCallback, useReducer } from 'react';
import { initializeGame, getNextActivePlayer, determineWinner, generateTableId, generateInviteCode } from '../utils/gameLogic';
import { GAME_PHASES, PLAYER_ACTIONS } from '../constants/gameConstants';

const GameContext = createContext(null);

const MOCK_PLAYERS_PRACTICE = [
  { id: 'p1', name: 'You', isHuman: true, avatar: '🧑', balance: '10.0' },
  { id: 'p2', name: 'CryptoBot', isHuman: false, avatar: '🤖', balance: '10.0' },
  { id: 'p3', name: 'ChainMaster', isHuman: false, avatar: '🧔', balance: '10.0' },
];

const initialState = {
  tableId: null,
  inviteCode: null,
  tableType: null,
  gameState: null,
  players: [],
  currentPhase: GAME_PHASES.WAITING,
  pot: 0,
  lastBet: 0,
  currentPlayerIndex: 0,
  winner: null,
  chatMessages: [],
  isGameActive: false,
  bootAmount: 0.01,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        isGameActive: true,
        currentPhase: GAME_PHASES.DEALING,
        gameState: action.payload.gameState,
        players: action.payload.players,
        tableId: action.payload.tableId,
        inviteCode: action.payload.inviteCode,
        tableType: action.payload.tableType,
        bootAmount: action.payload.bootAmount,
        pot: action.payload.gameState.pot,
        lastBet: action.payload.gameState.lastBet,
        currentPlayerIndex: 0,
        winner: null,
      };
    case 'PLAYER_ACTION':
      return {
        ...state,
        gameState: action.payload.gameState,
        pot: action.payload.pot,
        lastBet: action.payload.lastBet,
        currentPlayerIndex: action.payload.nextPlayerIndex,
        currentPhase: action.payload.phase,
        winner: action.payload.winner || null,
      };
    case 'SHOW_RESULT':
      return { ...state, currentPhase: GAME_PHASES.RESULT, winner: action.payload };
    case 'ADD_CHAT':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'RESET_GAME':
      return { ...initialState };
    case 'SET_BOOT':
      return { ...state, bootAmount: action.payload };
    default:
      return state;
  }
}

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [showResult, setShowResult] = useState(false);

  const startPracticeGame = useCallback((account) => {
    const players = [
      { id: account, name: 'You', isHuman: true, avatar: '🧑', balance: '10.0', address: account },
      ...MOCK_PLAYERS_PRACTICE.slice(1),
    ];
    const gameState = initializeGame(players, state.bootAmount);
    dispatch({
      type: 'START_GAME',
      payload: {
        gameState,
        players,
        tableId: generateTableId(),
        inviteCode: generateInviteCode(),
        tableType: 'practice',
        bootAmount: state.bootAmount,
      },
    });
    setTimeout(() => dispatch({ type: 'PLAYER_ACTION', payload: { ...gameState, phase: GAME_PHASES.BETTING, nextPlayerIndex: 0, pot: gameState.pot, lastBet: gameState.lastBet, winner: null } }), 1500);
  }, [state.bootAmount]);

  const startRandomGame = useCallback((account) => {
    const players = [
      { id: account, name: 'You', isHuman: true, avatar: '🧑', balance: '10.0', address: account },
      { id: 'rand1', name: 'Player_' + Math.random().toString(36).slice(2, 6).toUpperCase(), isHuman: false, avatar: '👩', balance: '10.0' },
      { id: 'rand2', name: 'Player_' + Math.random().toString(36).slice(2, 6).toUpperCase(), isHuman: false, avatar: '🧔', balance: '10.0' },
    ];
    const gameState = initializeGame(players, state.bootAmount);
    dispatch({
      type: 'START_GAME',
      payload: { gameState, players, tableId: generateTableId(), inviteCode: null, tableType: 'random', bootAmount: state.bootAmount },
    });
    setTimeout(() => dispatch({ type: 'PLAYER_ACTION', payload: { ...gameState, phase: GAME_PHASES.BETTING, nextPlayerIndex: 0, pot: gameState.pot, lastBet: gameState.lastBet, winner: null } }), 1500);
  }, [state.bootAmount]);

  const createTable = useCallback((account, config) => {
    const tableId = generateTableId();
    const inviteCode = generateInviteCode();
    const players = [
      { id: account, name: 'You', isHuman: true, avatar: '🧑', balance: config.balance || '10.0', address: account },
    ];
    dispatch({
      type: 'START_GAME',
      payload: { gameState: initializeGame(players, config.bootAmount), players, tableId, inviteCode, tableType: 'private', bootAmount: config.bootAmount },
    });
    return { tableId, inviteCode };
  }, []);

  const performAction = useCallback((action, amount = 0) => {
    const { gameState, players, currentPlayerIndex, lastBet } = state;
    if (!gameState) return;

    const currentPlayer = players[currentPlayerIndex];
    const updatedState = { ...gameState };
    const playerState = { ...updatedState.playerStates[currentPlayer.id] };

    let newPot = state.pot;
    let newLastBet = lastBet;

    switch (action) {
      case PLAYER_ACTIONS.FOLD:
        playerState.isFolded = true;
        playerState.lastAction = 'FOLD';
        break;
      case PLAYER_ACTIONS.CALL:
        playerState.totalBet += playerState.isSeen ? lastBet : lastBet / 2;
        newPot += playerState.isSeen ? lastBet : lastBet / 2;
        playerState.lastAction = playerState.isSeen ? 'CALL' : 'BLIND CALL';
        break;
      case PLAYER_ACTIONS.RAISE:
        const raiseAmount = amount || lastBet * 2;
        playerState.totalBet += raiseAmount;
        newPot += raiseAmount;
        newLastBet = raiseAmount;
        playerState.lastAction = 'RAISE';
        break;
      case PLAYER_ACTIONS.SEEN:
        playerState.isSeen = true;
        playerState.lastAction = 'SEEN';
        break;
      case PLAYER_ACTIONS.ALL_IN:
        const balance = parseFloat(players[currentPlayerIndex].balance);
        newPot += balance;
        playerState.totalBet += balance;
        playerState.lastAction = 'ALL IN';
        break;
      default:
        break;
    }

    updatedState.playerStates[currentPlayer.id] = playerState;

    const activePlayers = players.filter(p => !updatedState.playerStates[p.id]?.isFolded);
    let nextIndex = getNextActivePlayer(players, currentPlayerIndex, updatedState.playerStates);
    let phase = GAME_PHASES.BETTING;
    let winner = null;

    if (activePlayers.length === 1) {
      winner = activePlayers[0];
      phase = GAME_PHASES.RESULT;
      setShowResult(true);
    }

    dispatch({
      type: 'PLAYER_ACTION',
      payload: {
        gameState: updatedState,
        pot: newPot,
        lastBet: newLastBet,
        nextPlayerIndex: nextIndex,
        phase,
        winner,
      },
    });

    // AI turn simulation
    if (phase !== GAME_PHASES.RESULT && players[nextIndex] && !players[nextIndex].isHuman) {
      setTimeout(() => simulateAIAction(nextIndex, updatedState, newLastBet, newPot), 1500);
    }
  }, [state]);

  const simulateAIAction = useCallback((playerIndex, gameState, lastBet, pot) => {
    const actions = [PLAYER_ACTIONS.CALL, PLAYER_ACTIONS.RAISE, PLAYER_ACTIONS.FOLD];
    const weights = [0.5, 0.3, 0.2];
    const rand = Math.random();
    let cumulative = 0;
    let chosenAction = PLAYER_ACTIONS.CALL;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) { chosenAction = actions[i]; break; }
    }
    // Simplified AI dispatch
    dispatch({ type: 'PLAYER_ACTION', payload: { gameState, pot, lastBet, nextPlayerIndex: (playerIndex + 1) % 3, phase: GAME_PHASES.BETTING, winner: null } });
  }, []);

  const addChatMessage = useCallback((message, sender) => {
    dispatch({ type: 'ADD_CHAT', payload: { id: Date.now(), message, sender, time: new Date().toLocaleTimeString() } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    setShowResult(false);
  }, []);

  const setBootAmount = useCallback((amount) => {
    dispatch({ type: 'SET_BOOT', payload: amount });
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      showResult, setShowResult,
      startPracticeGame, startRandomGame, createTable,
      performAction, addChatMessage, resetGame, setBootAmount,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};