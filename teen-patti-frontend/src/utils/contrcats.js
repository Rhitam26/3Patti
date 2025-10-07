// Contract configuration
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";

const CONTRACT_ABI = [
  "function createGame(uint256 _minBet) external payable returns (uint256)",
  "function joinGame(uint256 _gameId, bool _playBlind) external payable",
  "function placeBet(uint256 _gameId) external payable",
  "function fold(uint256 _gameId) external",
  "function show(uint256 _gameId) external",
  "function getGame(uint256 _gameId) external view returns (uint256 gameId, uint256 pot, uint256 currentBet, uint256 minBet, uint256 playerCount, uint8 state, address winner)",
  "function getPlayerCards(uint256 _gameId) external view returns (tuple(uint8 rank, uint8 suit)[] memory)",
  "function getPlayers(uint256 _gameId) external view returns (address[] memory addresses, uint256[] memory bets, bool[] memory folded, bool[] memory isBlind)",
  "function gameCounter() external view returns (uint256)",
  "event GameCreated(uint256 indexed gameId, address indexed creator, uint256 minBet)",
  "event PlayerJoined(uint256 indexed gameId, address indexed player)",
  "event BetPlaced(uint256 indexed gameId, address indexed player, uint256 amount)",
  "event PlayerFolded(uint256 indexed gameId, address indexed player)",
  "event GameEnded(uint256 indexed gameId, address indexed winner, uint256 pot)",
  "event CardsDealt(uint256 indexed gameId)"
];

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Connect to MetaMask wallet
 */
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this DApp.');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.');
    }

    return accounts[0];
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection request rejected by user');
    }
    throw error;
  }
};

/**
 * Initialize contract instance
 */
export const initializeContract = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
    throw new Error('Contract address not configured. Please set REACT_APP_CONTRACT_ADDRESS in your .env file');
  }

  try {
    const ethers = window.ethers;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return contract;
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw new Error('Failed to initialize contract: ' + error.message);
  }
};

/**
 * Get current network information
 */
export const getNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const ethers = window.ethers;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    return network;
  } catch (error) {
    console.error('Error getting network:', error);
    throw error;
  }
};

/**
 * Get account balance
 */
export const getBalance = async (address) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const ethers = window.ethers;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

/**
 * Switch network (if needed)
 */
export const switchNetwork = async (chainId) => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      throw new Error('Network not found in MetaMask. Please add it manually.');
    }
    throw error;
  }
};

/**
 * Format error messages for user display
 */
export const formatError = (error) => {
  if (!error) return 'Unknown error occurred';

  // User rejected transaction
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user';
  }

  // Insufficient funds
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }

  // Gas estimation failed
  if (error.message?.includes('gas required exceeds')) {
    return 'Transaction would fail. Please check your inputs.';
  }

  // Contract reverted
  if (error.reason) {
    return error.reason;
  }

  // Network errors
  if (error.message?.includes('network')) {
    return 'Network error. Please check your connection.';
  }

  // Default
  return error.message || 'Transaction failed';
};

/**
 * Parse game state from contract
 */
export const parseGameData = (gameData, playersData) => {
  const ethers = window.ethers;
  
  const states = ['Waiting', 'Playing', 'Ended'];
  
  return {
    gameId: gameData[0].toString(),
    pot: ethers.utils.formatEther(gameData[1]),
    currentBet: ethers.utils.formatEther(gameData[2]),
    minBet: ethers.utils.formatEther(gameData[3]),
    playerCount: gameData[4].toNumber(),
    state: states[gameData[5]],
    winner: gameData[6],
    players: playersData ? {
      addresses: playersData[0],
      bets: playersData[1].map(b => ethers.utils.formatEther(b)),
      folded: playersData[2],
      isBlind: playersData[3]
    } : null
  };
};

/**
 * Parse cards from contract
 */
export const parseCards = (cardsData) => {
  if (!cardsData || cardsData.length === 0) {
    return [];
  }

  return cardsData.map(card => ({
    rank: card.rank,
    suit: card.suit
  }));
};

/**
 * Validate bet amount
 */
export const validateBetAmount = (amount, currentBet, balance) => {
  const betNum = parseFloat(amount);
  const currentBetNum = parseFloat(currentBet);
  const balanceNum = parseFloat(balance);

  if (isNaN(betNum) || betNum <= 0) {
    return { valid: false, error: 'Bet amount must be greater than 0' };
  }

  if (betNum < currentBetNum) {
    return { valid: false, error: `Bet must be at least ${currentBet} ETH` };
  }

  if (betNum > balanceNum) {
    return { valid: false, error: 'Insufficient balance' };
  }

  return { valid: true };
};

/**
 * Listen for contract events
 */
export const subscribeToGameEvents = (contract, gameId, callbacks) => {
  const filters = {
    gameCreated: contract.filters.GameCreated(gameId),
    playerJoined: contract.filters.PlayerJoined(gameId),
    betPlaced: contract.filters.BetPlaced(gameId),
    playerFolded: contract.filters.PlayerFolded(gameId),
    gameEnded: contract.filters.GameEnded(gameId),
    cardsDealt: contract.filters.CardsDealt(gameId)
  };

  // Set up listeners
  if (callbacks.onGameCreated) {
    contract.on(filters.gameCreated, callbacks.onGameCreated);
  }
  if (callbacks.onPlayerJoined) {
    contract.on(filters.playerJoined, callbacks.onPlayerJoined);
  }
  if (callbacks.onBetPlaced) {
    contract.on(filters.betPlaced, callbacks.onBetPlaced);
  }
  if (callbacks.onPlayerFolded) {
    contract.on(filters.playerFolded, callbacks.onPlayerFolded);
  }
  if (callbacks.onGameEnded) {
    contract.on(filters.gameEnded, callbacks.onGameEnded);
  }
  if (callbacks.onCardsDealt) {
    contract.on(filters.cardsDealt, callbacks.onCardsDealt);
  }

  // Return cleanup function
  return () => {
    contract.removeAllListeners(filters.gameCreated);
    contract.removeAllListeners(filters.playerJoined);
    contract.removeAllListeners(filters.betPlaced);
    contract.removeAllListeners(filters.playerFolded);
    contract.removeAllListeners(filters.gameEnded);
    contract.removeAllListeners(filters.cardsDealt);
  };
};

/**
 * Estimate gas for transaction
 */
export const estimateGas = async (contract, method, params, value) => {
  try {
    const ethers = window.ethers;
    const gasEstimate = await contract.estimateGas[method](...params, { value });
    const gasPrice = await contract.provider.getGasPrice();
    const totalCost = gasEstimate.mul(gasPrice);
    return ethers.utils.formatEther(totalCost);
  } catch (error) {
    console.error('Error estimating gas:', error);
    return null;
  }
};

/**
 * Get transaction receipt
 */
export const getTransactionReceipt = async (txHash) => {
  try {
    const ethers = window.ethers;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error('Error getting transaction receipt:', error);
    return null;
  }
};

/**
 * Export all functions as default
 */
export default {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  isMetaMaskInstalled,
  connectWallet,
  initializeContract,
  getNetwork,
  getBalance,
  switchNetwork,
  formatError,
  parseGameData,
  parseCards,
  validateBetAmount,
  subscribeToGameEvents,
  estimateGas,
  getTransactionReceipt
};