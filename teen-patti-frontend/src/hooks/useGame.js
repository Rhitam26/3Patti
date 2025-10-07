import { useState, useEffect, useCallback } from 'react';
import { parseGameData, parseCards, subscribeToGameEvents } from '../utils/contrcats';

const useGame = (contract, account, gameId, setError) => {
  const [gameData, setGameData] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [betAmount, setBetAmount] = useState('0.01');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [amIPlaying, setAmIPlaying] = useState(false);

  /**
   * Load game data from contract
   */
  const loadGameData = useCallback(async () => {
    if (!contract || !gameId) return;

    try {
      // Get basic game info
      const game = await contract.getGame(gameId);
      
      // Get players info
      const players = await contract.getPlayers(gameId);
      
      // Parse and set game data
      const parsedData = parseGameData(game, players);
      setGameData(parsedData);

      // Update bet amount to match current bet
      if (parsedData.currentBet && parseFloat(parsedData.currentBet) > parseFloat(betAmount)) {
        setBetAmount(parsedData.currentBet);
      }

      // Check if I'm in the game
      const myIndex = players[0].findIndex(
        addr => addr.toLowerCase() === account.toLowerCase()
      );
      
      setAmIPlaying(myIndex !== -1);

      // Check if it's my turn (simplified - in production, track currentPlayerIndex from contract)
      if (myIndex !== -1 && !players[2][myIndex] && parsedData.state === 'Playing') {
        // This is a simplified check - you might want to add currentPlayerIndex to contract
        setIsMyTurn(true);
      } else {
        setIsMyTurn(false);
      }

      // Load my cards if game is playing
      if (parsedData.state === 'Playing' && myIndex !== -1) {
        try {
          const cards = await contract.getPlayerCards(gameId);
          const parsedCards = parseCards(cards);
          setMyCards(parsedCards);
        } catch (err) {
          console.log('Could not load cards:', err);
          // This is expected if cards aren't dealt yet
        }
      }
    } catch (error) {
      console.error('Error loading game data:', error);
      if (error.message?.includes('Game does not exist')) {
        setError('Game not found');
      }
    }
  }, [contract, gameId, account, betAmount, setError]);

  /**
   * Handle placing a bet
   */
  const handlePlaceBet = async () => {
    if (!contract || !gameId) return;
    
    setLoading(true);
    setError(null);

    try {
      const ethers = window.ethers;
      
      // Validate bet amount
      if (parseFloat(betAmount) < parseFloat(gameData.currentBet)) {
        throw new Error(`Bet must be at least ${gameData.currentBet} ETH`);
      }

      const tx = await contract.placeBet(gameId, {
        value: ethers.utils.parseEther(betAmount)
      });

      await tx.wait();
      
      // Reload game data
      await loadGameData();
      
      setError(null);
    } catch (error) {
      console.error('Error placing bet:', error);
      
      if (error.code === 4001) {
        setError('Transaction rejected by user');
      } else if (error.message?.includes('Not your turn')) {
        setError('Not your turn to play');
      } else if (error.message?.includes('Bet too low')) {
        setError(`Bet must be at least ${gameData.currentBet} ETH`);
      } else if (error.message?.includes('insufficient funds')) {
        setError('Insufficient funds for bet + gas');
      } else {
        setError(error.reason || error.message || 'Failed to place bet');
      }
    }

    setLoading(false);
  };

  /**
   * Handle folding
   */
  const handleFold = async () => {
    if (!contract || !gameId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to fold? You will lose your current bet.'
    );
    
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.fold(gameId);
      await tx.wait();
      
      // Reload game data
      await loadGameData();
      
      setError(null);
    } catch (error) {
      console.error('Error folding:', error);
      
      if (error.code === 4001) {
        setError('Transaction rejected by user');
      } else if (error.message?.includes('Not your turn')) {
        setError('Not your turn to fold');
      } else {
        setError(error.reason || error.message || 'Failed to fold');
      }
    }

    setLoading(false);
  };

  /**
   * Handle show (reveal cards)
   */
  const handleShow = async () => {
    if (!contract || !gameId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to show your cards? This will end the game and determine the winner.'
    );
    
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.show(gameId);
      await tx.wait();
      
      // Reload game data
      await loadGameData();
      
      setError(null);
    } catch (error) {
      console.error('Error showing cards:', error);
      
      if (error.code === 4001) {
        setError('Transaction rejected by user');
      } else if (error.message?.includes('Need at least 2 players')) {
        setError('Need at least 2 players to show');
      } else {
        setError(error.reason || error.message || 'Failed to show cards');
      }
    }

    setLoading(false);
  };

  /**
   * Subscribe to game events
   */
  useEffect(() => {
    if (!contract || !gameId) return;

    const unsubscribe = subscribeToGameEvents(contract, gameId, {
      onPlayerJoined: (gameId, player) => {
        console.log('Player joined:', player);
        loadGameData();
      },
      onBetPlaced: (gameId, player, amount) => {
        console.log('Bet placed:', player, amount);
        loadGameData();
      },
      onPlayerFolded: (gameId, player) => {
        console.log('Player folded:', player);
        loadGameData();
      },
      onGameEnded: (gameId, winner, pot) => {
        console.log('Game ended:', winner, pot);
        loadGameData();
      },
      onCardsDealt: (gameId) => {
        console.log('Cards dealt for game:', gameId);
        loadGameData();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [contract, gameId, loadGameData]);

  /**
   * Initial load and periodic refresh
   */
  useEffect(() => {
    if (contract && gameId) {
      loadGameData();
      
      // Refresh every 5 seconds
      const interval = setInterval(() => {
        loadGameData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [contract, gameId, loadGameData]);

  /**
   * Auto-show cards when it's my turn (for seen players)
   */
  useEffect(() => {
    if (isMyTurn && amIPlaying && !showCards) {
      // Check if I'm a seen player
      if (gameData?.players) {
        const myIndex = gameData.players.addresses.findIndex(
          addr => addr.toLowerCase() === account.toLowerCase()
        );
        
        if (myIndex !== -1 && !gameData.players.isBlind[myIndex]) {
          // Automatically show cards for seen players
          setShowCards(true);
        }
      }
    }
  }, [isMyTurn, amIPlaying, showCards, gameData, account]);

  return {
    gameData,
    myCards,
    loading,
    showCards,
    betAmount,
    isMyTurn,
    amIPlaying,
    setBetAmount,
    setShowCards,
    handlePlaceBet,
    handleFold,
    handleShow,
    loadGameData
  };
};

export default useGame;