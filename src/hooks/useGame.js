import { useState, useCallback, useEffect, useRef } from 'react';
import { createDeck, shuffleDeck, dealCards, evaluateHand } from '../utils/cardUtils';
import { generateTableId, generateInviteCode, determineWinner } from '../utils/gameLogic';
import {
  GAME_PHASES,
  PLAYER_ACTIONS,
  HAND_RANKINGS,
} from '../constants/gameConstants';

// ─── AI difficulty profiles ────────────────────────────────────────────────
const AI_PROFILES = {
  conservative: { foldWeight: 0.35, callWeight: 0.50, raiseWeight: 0.15 },
  balanced:     { foldWeight: 0.20, callWeight: 0.55, raiseWeight: 0.25 },
  aggressive:   { foldWeight: 0.10, callWeight: 0.40, raiseWeight: 0.50 },
};

const pickWeighted = (weights) => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [action, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) return action;
  }
  return Object.keys(weights)[0];
};

const useGame = () => {
  // ─── Core game state ────────────────────────────────────────────────────
  const [phase, setPhase]                   = useState(GAME_PHASES.WAITING);
  const [players, setPlayers]               = useState([]);
  const [playerStates, setPlayerStates]     = useState({});
  const [pot, setPot]                       = useState(0);
  const [lastBet, setLastBet]               = useState(0);
  const [bootAmount, setBootAmount]         = useState(0.01);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [roundNumber, setRoundNumber]       = useState(1);
  const [tableId, setTableId]               = useState(null);
  const [inviteCode, setInviteCode]         = useState(null);
  const [tableType, setTableType]           = useState(null);
  const [winner, setWinner]                 = useState(null);
  const [isGameActive, setIsGameActive]     = useState(false);
  const [showResult, setShowResult]         = useState(false);
  const [isDealing, setIsDealing]           = useState(false);
  const [chatMessages, setChatMessages]     = useState([]);
  const [actionLog, setActionLog]           = useState([]);
  const [turnTimeLeft, setTurnTimeLeft]     = useState(30);

  // ─── Timer ref so we can clear it ──────────────────────────────────────
  const timerRef  = useRef(null);
  const aiTimeout = useRef(null);

  // ─── Deal cards to all players ─────────────────────────────────────────
  const dealToPlayers = useCallback((gamePlayers, boot) => {
    const deck  = shuffleDeck(createDeck());
    const hands = dealCards(deck, gamePlayers.length);

    const states = {};
    gamePlayers.forEach((p, idx) => {
      states[p.id] = {
        cards: hands[idx],
        isFolded: false,
        isSeen: false,
        totalBet: boot,
        lastAction: null,
        sideShowRequested: false,
        allIn: false,
      };
    });
    return states;
  }, []);

  // ─── Log an action ──────────────────────────────────────────────────────
  const logAction = useCallback((playerId, action, amount = 0) => {
    const player = players.find(p => p.id === playerId);
    setActionLog(prev => [
      {
        id: Date.now(),
        player: player?.name || playerId,
        action,
        amount,
        time: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 49), // Keep last 50 actions
    ]);
  }, [players]);

  // ─── Start turn timer ───────────────────────────────────────────────────
  const startTurnTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTurnTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ─── Clear timer on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current)  clearInterval(timerRef.current);
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
    };
  }, []);

  // ─── Generic game initializer ───────────────────────────────────────────
  const initGame = useCallback((gamePlayers, type, boot, tId, iCode) => {
    const initialStates = dealToPlayers(gamePlayers, boot);
    const initialPot    = boot * gamePlayers.length;

    setPlayers(gamePlayers);
    setPlayerStates(initialStates);
    setPot(initialPot);
    setLastBet(boot);
    setBootAmount(boot);
    setCurrentPlayerIndex(0);
    setRoundNumber(1);
    setTableId(tId || generateTableId());
    setInviteCode(iCode || null);
    setTableType(type);
    setWinner(null);
    setShowResult(false);
    setIsGameActive(true);
    setActionLog([]);
    setChatMessages([]);
    setIsDealing(true);

    // Simulate dealing animation delay
    setTimeout(() => {
      setIsDealing(false);
      setPhase(GAME_PHASES.BETTING);
      startTurnTimer();
    }, 2000);
  }, [dealToPlayers, startTurnTimer]);

  // ─── Start Practice Game ────────────────────────────────────────────────
  const startPracticeGame = useCallback((userAddress) => {
    const gamePlayers = [
      {
        id: userAddress,
        name: 'You',
        isHuman: true,
        avatar: '🧑',
        balance: '10.0',
        aiProfile: null,
      },
      {
        id: 'ai_bot_1',
        name: 'CryptoBot',
        isHuman: false,
        avatar: '🤖',
        balance: '10.0',
        aiProfile: 'balanced',
      },
      {
        id: 'ai_bot_2',
        name: 'ChainMaster',
        isHuman: false,
        avatar: '🧔',
        balance: '10.0',
        aiProfile: 'aggressive',
      },
    ];
    initGame(gamePlayers, 'practice', bootAmount, generateTableId(), null);
  }, [bootAmount, initGame]);

  // ─── Start Random Game ──────────────────────────────────────────────────
  const startRandomGame = useCallback((userAddress) => {
    const randSuffix = () =>
      Math.random().toString(36).slice(2, 6).toUpperCase();
    const profiles = ['conservative', 'balanced', 'aggressive'];

    const gamePlayers = [
      {
        id: userAddress,
        name: 'You',
        isHuman: true,
        avatar: '🧑',
        balance: '10.0',
        aiProfile: null,
      },
      {
        id: `rand_${randSuffix()}`,
        name: `Player_${randSuffix()}`,
        isHuman: false,
        avatar: '👩',
        balance: '10.0',
        aiProfile: profiles[Math.floor(Math.random() * 3)],
      },
      {
        id: `rand_${randSuffix()}`,
        name: `Player_${randSuffix()}`,
        isHuman: false,
        avatar: '🧔',
        balance: '10.0',
        aiProfile: profiles[Math.floor(Math.random() * 3)],
      },
    ];
    initGame(gamePlayers, 'random', bootAmount, generateTableId(), null);
  }, [bootAmount, initGame]);

  // ─── Create Private Table ───────────────────────────────────────────────
  const createTable = useCallback((userAddress, config) => {
    const tId   = generateTableId();
    const iCode = generateInviteCode();

    const gamePlayers = [
      {
        id: userAddress,
        name: 'You',
        isHuman: true,
        avatar: '🧑',
        balance: config.balance || '10.0',
        aiProfile: null,
      },
      // Extra bots to fill for demo
      {
        id: 'filler_bot_1',
        name: 'Waiting...',
        isHuman: false,
        avatar: '👤',
        balance: '10.0',
        aiProfile: 'balanced',
      },
      {
        id: 'filler_bot_2',
        name: 'Waiting...',
        isHuman: false,
        avatar: '👤',
        balance: '10.0',
        aiProfile: 'conservative',
      },
    ];

    initGame(gamePlayers, 'private', config.bootAmount, tId, iCode);
    return { tableId: tId, inviteCode: iCode };
  }, [initGame]);

  // ─── Get next non-folded player ─────────────────────────────────────────
  const getNextPlayerIndex = useCallback((currentIndex, states, playerList) => {
    let next = (currentIndex + 1) % playerList.length;
    let attempts = 0;
    while (states[playerList[next]?.id]?.isFolded && attempts < playerList.length) {
      next = (next + 1) % playerList.length;
      attempts++;
    }
    return next;
  }, []);

  // ─── Check if game should end ──────────────────────────────────────────
  const checkGameEnd = useCallback((states, playerList) => {
    const active = playerList.filter(p => !states[p.id]?.isFolded);
    if (active.length === 1) {
      return active[0];
    }
    return null;
  }, []);

  // ─── Evaluate best hand among active players ───────────────────────────
  const getHandSummary = useCallback((playerId) => {
    const cards = playerStates[playerId]?.cards;
    if (!cards || cards.length !== 3) return null;
    const evaluation = evaluateHand(cards);
    return {
      ...evaluation,
      info: HAND_RANKINGS[evaluation.type],
    };
  }, [playerStates]);

  // ─── Perform a player action ────────────────────────────────────────────
  const performAction = useCallback((action, amount = 0) => {
    if (phase !== GAME_PHASES.BETTING) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setPlayerStates(prevStates => {
      const currentPlayer = players[currentPlayerIndex];
      if (!currentPlayer) return prevStates;

      const updated = { ...prevStates };
      const ps      = { ...updated[currentPlayer.id] };
      let newPot    = pot;
      let newLastBet = lastBet;

      switch (action) {
        case PLAYER_ACTIONS.FOLD:
          ps.isFolded   = true;
          ps.lastAction = 'FOLD';
          logAction(currentPlayer.id, 'FOLD');
          break;

        case PLAYER_ACTIONS.CALL: {
          const callAmt = ps.isSeen ? lastBet : lastBet / 2;
          ps.totalBet  += callAmt;
          newPot       += callAmt;
          ps.lastAction = ps.isSeen ? 'CALL' : 'BLIND CALL';
          logAction(currentPlayer.id, ps.lastAction, callAmt);
          break;
        }

        case PLAYER_ACTIONS.RAISE: {
          const raiseAmt = amount > 0 ? amount : lastBet * 2;
          ps.totalBet  += raiseAmt;
          newPot       += raiseAmt;
          newLastBet    = raiseAmt;
          ps.lastAction = 'RAISE';
          logAction(currentPlayer.id, 'RAISE', raiseAmt);
          break;
        }

        case PLAYER_ACTIONS.ALL_IN: {
          const allInAmt = parseFloat(players[currentPlayerIndex].balance);
          ps.totalBet  += allInAmt;
          newPot       += allInAmt;
          ps.allIn      = true;
          ps.lastAction = 'ALL IN';
          logAction(currentPlayer.id, 'ALL IN', allInAmt);
          break;
        }

        case PLAYER_ACTIONS.SEEN:
          ps.isSeen     = true;
          ps.lastAction = 'SEEN';
          logAction(currentPlayer.id, 'SEEN');
          break;

        case PLAYER_ACTIONS.SHOW:
          ps.isSeen     = true;
          ps.lastAction = 'SHOW';
          logAction(currentPlayer.id, 'SHOW');
          break;

        default:
          break;
      }

      updated[currentPlayer.id] = ps;

      // Check game end
      const earlyWinner = checkGameEnd(updated, players);
      if (earlyWinner) {
        setTimeout(() => {
          setWinner(earlyWinner);
          setPhase(GAME_PHASES.RESULT);
          setShowResult(true);
          setPot(newPot);
        }, 500);
        return updated;
      }

      // Advance to next player
      setPot(newPot);
      setLastBet(newLastBet);

      const nextIdx = getNextPlayerIndex(currentPlayerIndex, updated, players);
      setCurrentPlayerIndex(nextIdx);

      const nextPlayer = players[nextIdx];
      if (nextPlayer && !nextPlayer.isHuman) {
        triggerAI(nextIdx, updated, newLastBet, newPot);
      } else {
        startTurnTimer();
      }

      return updated;
    });
  }, [
    phase, players, currentPlayerIndex, pot, lastBet,
    logAction, checkGameEnd, getNextPlayerIndex, startTurnTimer,
  ]);

  // ─── AI decision engine ─────────────────────────────────────────────────
  const triggerAI = useCallback((aiIndex, states, currentLastBet, currentPot) => {
    const aiPlayer = players[aiIndex];
    if (!aiPlayer || aiPlayer.isHuman) return;

    const profile  = AI_PROFILES[aiPlayer.aiProfile] || AI_PROFILES.balanced;
    const aiCards  = states[aiPlayer.id]?.cards || [];
    const handEval = aiCards.length === 3 ? evaluateHand(aiCards) : null;

    // Adjust weights based on hand strength
    let weights = { ...profile };
    if (handEval) {
      if (handEval.type === 'TRAIL' || handEval.type === 'PURE_SEQUENCE') {
        weights = { foldWeight: 0.02, callWeight: 0.38, raiseWeight: 0.60 };
      } else if (handEval.type === 'SEQUENCE' || handEval.type === 'COLOR') {
        weights = { foldWeight: 0.10, callWeight: 0.50, raiseWeight: 0.40 };
      } else if (handEval.type === 'HIGH_CARD') {
        weights = { foldWeight: 0.45, callWeight: 0.45, raiseWeight: 0.10 };
      }
    }

    const delayMs = 1000 + Math.random() * 1500; // 1–2.5s delay

    aiTimeout.current = setTimeout(() => {
      const weightMap = {
        fold:  weights.foldWeight,
        call:  weights.callWeight,
        raise: weights.raiseWeight,
      };
      const chosen = pickWeighted(weightMap);

      setPlayerStates(prev => {
        const updated = { ...prev };
        const ps      = { ...updated[aiPlayer.id] };
        let newPot    = currentPot;
        let newLastBet = currentLastBet;

        switch (chosen) {
          case 'fold':
            ps.isFolded   = true;
            ps.lastAction = 'FOLD';
            logAction(aiPlayer.id, 'FOLD');
            break;
          case 'call': {
            const callAmt = currentLastBet / 2;
            ps.totalBet  += callAmt;
            newPot       += callAmt;
            ps.lastAction = 'BLIND CALL';
            logAction(aiPlayer.id, 'BLIND CALL', callAmt);
            break;
          }
          case 'raise': {
            const raiseAmt = currentLastBet * (1.5 + Math.random());
            ps.totalBet  += raiseAmt;
            newPot       += raiseAmt;
            newLastBet    = raiseAmt;
            ps.lastAction = 'RAISE';
            logAction(aiPlayer.id, 'RAISE', raiseAmt);
            break;
          }
          default:
            break;
        }

        updated[aiPlayer.id] = ps;
        setPot(newPot);
        setLastBet(newLastBet);

        const earlyWinner = checkGameEnd(updated, players);
        if (earlyWinner) {
          setTimeout(() => {
            setWinner(earlyWinner);
            setPhase(GAME_PHASES.RESULT);
            setShowResult(true);
          }, 500);
          return updated;
        }

        const nextIdx     = getNextPlayerIndex(aiIndex, updated, players);
        const nextPlayer  = players[nextIdx];
        setCurrentPlayerIndex(nextIdx);

        if (nextPlayer && !nextPlayer.isHuman) {
          triggerAI(nextIdx, updated, newLastBet, newPot);
        } else {
          startTurnTimer();
        }

        return updated;
      });
    }, delayMs);
  }, [players, logAction, checkGameEnd, getNextPlayerIndex, startTurnTimer]);

  // ─── Request sideshow ───────────────────────────────────────────────────
  const requestSideshow = useCallback((requesterId, targetId) => {
    // In real blockchain version this would call the contract
    const requesterCards = playerStates[requesterId]?.cards;
    const targetCards    = playerStates[targetId]?.cards;
    if (!requesterCards || !targetCards) return null;

    const r = evaluateHand(requesterCards);
    const t = evaluateHand(targetCards);
    const loser = r.score < t.score ? requesterId : targetId;

    setPlayerStates(prev => ({
      ...prev,
      [loser]: { ...prev[loser], isFolded: true, lastAction: 'SIDESHOW LOST' },
    }));
    logAction(requesterId, 'SIDESHOW');
    return loser;
  }, [playerStates, logAction]);

  // ─── Force showdown ─────────────────────────────────────────────────────
  const forceShowdown = useCallback(() => {
    const activePlayers  = players.filter(p => !playerStates[p.id]?.isFolded);
    const winnerPlayer   = determineWinner(playerStates, activePlayers);
    setWinner(winnerPlayer);
    setPhase(GAME_PHASES.RESULT);
    setShowResult(true);
  }, [players, playerStates]);

  // ─── Chat ───────────────────────────────────────────────────────────────
  const addChatMessage = useCallback((message, sender = 'You') => {
    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        message,
        sender,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  // ─── Reset everything ───────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    if (timerRef.current)  clearInterval(timerRef.current);
    if (aiTimeout.current) clearTimeout(aiTimeout.current);

    setPhase(GAME_PHASES.WAITING);
    setPlayers([]);
    setPlayerStates({});
    setPot(0);
    setLastBet(0);
    setCurrentPlayerIndex(0);
    setRoundNumber(1);
    setTableId(null);
    setInviteCode(null);
    setTableType(null);
    setWinner(null);
    setIsGameActive(false);
    setShowResult(false);
    setIsDealing(false);
    setActionLog([]);
    setChatMessages([]);
    setTurnTimeLeft(30);
  }, []);

  // ─── Play next hand ─────────────────────────────────────────────────────
  const playNextHand = useCallback(() => {
    if (!players.length) return;
    const newStates = dealToPlayers(players, bootAmount);
    const newPot    = bootAmount * players.length;

    setPlayerStates(newStates);
    setPot(newPot);
    setLastBet(bootAmount);
    setCurrentPlayerIndex(0);
    setRoundNumber(prev => prev + 1);
    setWinner(null);
    setShowResult(false);
    setIsDealing(true);
    setActionLog([]);

    setTimeout(() => {
      setIsDealing(false);
      setPhase(GAME_PHASES.BETTING);
      startTurnTimer();
    }, 2000);
  }, [players, bootAmount, dealToPlayers, startTurnTimer]);

  // ─── Computed helpers ───────────────────────────────────────────────────
  const activePlayers = players.filter(p => !playerStates[p.id]?.isFolded);
  const currentPlayer = players[currentPlayerIndex];
  const isHumanTurn   = currentPlayer?.isHuman === true;

  return {
    // State
    phase,
    players,
    playerStates,
    pot,
    lastBet,
    bootAmount,
    currentPlayerIndex,
    roundNumber,
    tableId,
    inviteCode,
    tableType,
    winner,
    isGameActive,
    showResult,
    isDealing,
    chatMessages,
    actionLog,
    turnTimeLeft,
    activePlayers,
    currentPlayer,
    isHumanTurn,
    // Setters
    setBootAmount,
    setShowResult,
    // Actions
    startPracticeGame,
    startRandomGame,
    createTable,
    performAction,
    requestSideshow,
    forceShowdown,
    addChatMessage,
    resetGame,
    playNextHand,
    getHandSummary,
  };
};

export default useGame;