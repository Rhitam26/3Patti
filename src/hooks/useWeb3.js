import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import useMetaMask from './useMetaMask';

// ─── Minimal ABI for Teen Patti contract interactions ─────────────────────────
const TEEN_PATTI_ABI = [
  // Events
  'event GameCreated(uint256 indexed tableId, address indexed creator, uint256 bootAmount)',
  'event PlayerJoined(uint256 indexed tableId, address indexed player)',
  'event BetPlaced(uint256 indexed tableId, address indexed player, uint256 amount, string action)',
  'event GameEnded(uint256 indexed tableId, address indexed winner, uint256 potAmount)',
  'event CardDealt(uint256 indexed tableId, address indexed player)',
  // Write functions
  'function createTable(uint256 bootAmount, uint8 maxPlayers, bool isPrivate) payable returns (uint256)',
  'function joinTable(uint256 tableId) payable',
  'function joinWithCode(bytes32 inviteCode) payable',
  'function placeBet(uint256 tableId, uint8 action, uint256 amount) payable',
  'function fold(uint256 tableId)',
  'function showCards(uint256 tableId)',
  // Read functions
  'function getTableInfo(uint256 tableId) view returns (tuple(uint256 id, address creator, uint256 bootAmount, uint256 pot, uint8 maxPlayers, uint8 currentPlayers, bool isActive, bool isPrivate))',
  'function getPlayerInfo(uint256 tableId, address player) view returns (tuple(address wallet, uint256 totalBet, bool isFolded, bool isSeen, bool isActive))',
  'function getActiveTables() view returns (uint256[])',
  'function getPlayerBalance(address player) view returns (uint256)',
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

const useWeb3 = () => {
  const metamask = useMetaMask();

  // ─── Provider / Signer / Contract state ────────────────────────────────────
  const [provider, setProvider]         = useState(null);
  const [signer, setSigner]             = useState(null);
  const [contract, setContract]         = useState(null);
  const [balance, setBalance]           = useState('0.0000');
  const [balanceWei, setBalanceWei]     = useState('0');
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [txHistory, setTxHistory]       = useState([]);
  const [pendingTx, setPendingTx]       = useState(null);
  const [gasPrice, setGasPrice]         = useState(null);
  const [blockNumber, setBlockNumber]   = useState(null);

  // Ref so event listener callbacks always see latest value
  const providerRef = useRef(null);

  // ─── Initialize provider, signer, contract on account change ──────────────
  useEffect(() => {
    if (!metamask.isConnected || !metamask.currentAccount) {
      setProvider(null);
      setSigner(null);
      setContract(null);
      setBalance('0.0000');
      return;
    }

    const initWeb3 = async () => {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const web3Signer = web3Provider.getSigner();

        // Instantiate contract only if address is set
        let web3Contract = null;
        if (CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
          web3Contract = new ethers.Contract(CONTRACT_ADDRESS, TEEN_PATTI_ABI, web3Signer);
        }

        setProvider(web3Provider);
        setSigner(web3Signer);
        setContract(web3Contract);
        providerRef.current = web3Provider;

        // Fetch gas price
        const currentGasPrice = await web3Provider.getGasPrice();
        setGasPrice(ethers.utils.formatUnits(currentGasPrice, 'gwei'));

        // Fetch block number
        const latestBlock = await web3Provider.getBlockNumber();
        setBlockNumber(latestBlock);
      } catch (err) {
        console.error('Failed to initialize Web3:', err);
      }
    };

    initWeb3();
  }, [metamask.isConnected, metamask.currentAccount, metamask.chainId]);

  // ─── Fetch native balance ──────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    if (!provider || !metamask.currentAccount) return;
    setIsFetchingBalance(true);
    try {
      const raw = await provider.getBalance(metamask.currentAccount);
      setBalanceWei(raw.toString());
      setBalance(parseFloat(ethers.utils.formatEther(raw)).toFixed(4));
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [provider, metamask.currentAccount]);

  // Auto-fetch balance when provider is ready
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh balance every 15 seconds
  useEffect(() => {
    if (!provider) return;
    const interval = setInterval(fetchBalance, 15_000);
    return () => clearInterval(interval);
  }, [provider, fetchBalance]);

  // ─── Listen for new blocks ─────────────────────────────────────────────────
  useEffect(() => {
    if (!provider) return;
    const handleBlock = (num) => {
      setBlockNumber(num);
      // Refresh balance on each new block
      fetchBalance();
    };
    provider.on('block', handleBlock);
    return () => provider.off('block', handleBlock);
  }, [provider, fetchBalance]);

  // ─── Contract: Create Table ────────────────────────────────────────────────
  const createTableOnChain = useCallback(async ({ bootAmount, maxPlayers, isPrivate }) => {
    if (!contract) {
      console.warn('Contract not initialized — using mock');
      return { success: true, tableId: Math.floor(Math.random() * 9000 + 1000), mock: true };
    }
    try {
      setPendingTx('createTable');
      const bootWei = ethers.utils.parseEther(bootAmount.toString());
      const tx = await contract.createTable(bootWei, maxPlayers, isPrivate, {
        value: bootWei,
      });
      addToTxHistory({ type: 'createTable', hash: tx.hash, status: 'pending' });
      const receipt = await tx.wait();
      updateTxStatus(tx.hash, 'confirmed');

      // Parse tableId from event
      const event = receipt.events?.find(e => e.event === 'GameCreated');
      const tableId = event?.args?.tableId?.toNumber() || 0;

      return { success: true, tableId, txHash: tx.hash };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setPendingTx(null);
    }
  }, [contract]);

  // ─── Contract: Join Table ─────────────────────────────────────────────────
  const joinTableOnChain = useCallback(async ({ tableId, bootAmount }) => {
    if (!contract) {
      return { success: true, mock: true };
    }
    try {
      setPendingTx('joinTable');
      const bootWei = ethers.utils.parseEther(bootAmount.toString());
      const tx = await contract.joinTable(tableId, { value: bootWei });
      addToTxHistory({ type: 'joinTable', hash: tx.hash, status: 'pending' });
      const receipt = await tx.wait();
      updateTxStatus(tx.hash, 'confirmed');
      return { success: true, txHash: tx.hash };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setPendingTx(null);
    }
  }, [contract]);

  // ─── Contract: Join with Invite Code ─────────────────────────────────────
  const joinWithCodeOnChain = useCallback(async ({ inviteCode, bootAmount }) => {
    if (!contract) {
      return { success: true, mock: true };
    }
    try {
      setPendingTx('joinWithCode');
      const codeBytes = ethers.utils.formatBytes32String(inviteCode);
      const bootWei = ethers.utils.parseEther(bootAmount.toString());
      const tx = await contract.joinWithCode(codeBytes, { value: bootWei });
      addToTxHistory({ type: 'joinWithCode', hash: tx.hash, status: 'pending' });
      const receipt = await tx.wait();
      updateTxStatus(tx.hash, 'confirmed');
      return { success: true, txHash: tx.hash };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setPendingTx(null);
    }
  }, [contract]);

  // ─── Contract: Place Bet ──────────────────────────────────────────────────
  const placeBetOnChain = useCallback(async ({ tableId, action, amount }) => {
    if (!contract) {
      return { success: true, mock: true };
    }
    const actionCodes = { call: 0, raise: 1, fold: 2, all_in: 3 };
    try {
      setPendingTx('placeBet');
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await contract.placeBet(tableId, actionCodes[action] ?? 0, amountWei, {
        value: action !== 'fold' ? amountWei : 0,
      });
      addToTxHistory({ type: 'placeBet', hash: tx.hash, status: 'pending', action });
      const receipt = await tx.wait();
      updateTxStatus(tx.hash, 'confirmed');
      return { success: true, txHash: tx.hash };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setPendingTx(null);
    }
  }, [contract]);

  // ─── Contract: Read table info ─────────────────────────────────────────────
  const getTableInfo = useCallback(async (tableId) => {
    if (!contract) return null;
    try {
      const info = await contract.getTableInfo(tableId);
      return {
        id: info.id.toNumber(),
        creator: info.creator,
        bootAmount: ethers.utils.formatEther(info.bootAmount),
        pot: ethers.utils.formatEther(info.pot),
        maxPlayers: info.maxPlayers,
        currentPlayers: info.currentPlayers,
        isActive: info.isActive,
        isPrivate: info.isPrivate,
      };
    } catch (err) {
      console.error('getTableInfo error:', err);
      return null;
    }
  }, [contract]);

  // ─── Estimate gas for a tx ─────────────────────────────────────────────────
  const estimateGas = useCallback(async ({ to, value, data }) => {
    if (!provider) return null;
    try {
      const estimate = await provider.estimateGas({
        to,
        value: ethers.utils.parseEther(value?.toString() || '0'),
        data: data || '0x',
      });
      return ethers.utils.formatUnits(estimate, 'gwei');
    } catch {
      return null;
    }
  }, [provider]);

  // ─── Transaction history helpers ───────────────────────────────────────────
  const addToTxHistory = useCallback((tx) => {
    setTxHistory(prev => [{ ...tx, timestamp: Date.now() }, ...prev.slice(0, 19)]);
  }, []);

  const updateTxStatus = useCallback((hash, status) => {
    setTxHistory(prev =>
      prev.map(tx => tx.hash === hash ? { ...tx, status } : tx)
    );
  }, []);

  // ─── Format value helpers ──────────────────────────────────────────────────
  const toWei   = useCallback((ether) => ethers.utils.parseEther(ether.toString()), []);
  const fromWei = useCallback((wei)   => ethers.utils.formatEther(wei.toString()), []);

  return {
    // From MetaMask hook
    ...metamask,
    // Web3 specifics
    provider,
    signer,
    contract,
    balance,
    balanceWei,
    isFetchingBalance,
    txHistory,
    pendingTx,
    gasPrice,
    blockNumber,
    // Contract actions
    createTableOnChain,
    joinTableOnChain,
    joinWithCodeOnChain,
    placeBetOnChain,
    getTableInfo,
    // Helpers
    fetchBalance,
    estimateGas,
    toWei,
    fromWei,
  };
};

export default useWeb3;