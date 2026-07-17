import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

const METAMASK_ERRORS = {
  4001: 'You rejected the connection request.',
  4902: 'Network not found. Adding it now...',
  '-32002': 'MetaMask request already pending. Please open MetaMask.',
  '-32603': 'Internal MetaMask error. Please try again.',
};

const useMetaMask = () => {
  const [isInstalled, setIsInstalled]       = useState(false);
  const [isConnected, setIsConnected]       = useState(false);
  const [isConnecting, setIsConnecting]     = useState(false);
  const [accounts, setAccounts]             = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [chainId, setChainId]               = useState(null);
  const [error, setError]                   = useState(null);
  const [networkName, setNetworkName]       = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Target network - Polygon Mumbai testnet
  const TARGET_CHAIN_ID = '0x13881';
  const TARGET_NETWORK = {
    chainId: TARGET_CHAIN_ID,
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  };

  // ─── Check if MetaMask is installed ───────────────────────────────────────
  useEffect(() => {
    const checkInstallation = () => {
      const installed = typeof window !== 'undefined' &&
        typeof window.ethereum !== 'undefined' &&
        window.ethereum.isMetaMask;
      setIsInstalled(!!installed);
    };
    checkInstallation();
  }, []);

  // ─── Detect network name from chainId ─────────────────────────────────────
  const resolveNetworkName = useCallback((id) => {
    const networks = {
      '0x1':     'Ethereum Mainnet',
      '0x3':     'Ropsten Testnet',
      '0x4':     'Rinkeby Testnet',
      '0x5':     'Goerli Testnet',
      '0x89':    'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0xa86a':  'Avalanche Mainnet',
      '0x38':    'BNB Smart Chain',
    };
    return networks[id] || `Unknown Network (${id})`;
  }, []);

  // ─── Check already connected accounts on mount ────────────────────────────
  useEffect(() => {
    if (!isInstalled) return;

    const checkExistingConnection = async () => {
      try {
        const existingAccounts = await window.ethereum.request({
          method: 'eth_accounts', // Does NOT prompt, only checks
        });
        if (existingAccounts.length > 0) {
          setAccounts(existingAccounts);
          setCurrentAccount(existingAccounts[0]);
          setIsConnected(true);
        }

        const currentChain = await window.ethereum.request({
          method: 'eth_chainId',
        });
        setChainId(currentChain);
        setNetworkName(resolveNetworkName(currentChain));
        setIsCorrectNetwork(currentChain === TARGET_CHAIN_ID);
      } catch (err) {
        console.warn('Could not check existing MetaMask connection:', err);
      }
    };

    checkExistingConnection();
  }, [isInstalled, resolveNetworkName]);

  // ─── Connect wallet (triggers MetaMask popup) ─────────────────────────────
  const connect = useCallback(async () => {
    if (!isInstalled) {
      setError('MetaMask is not installed. Please install it from metamask.io');
      return { success: false, error: 'not_installed' };
    }

    setIsConnecting(true);
    setError(null);

    try {
      const requestedAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const currentChain = await window.ethereum.request({
        method: 'eth_chainId',
      });

      setAccounts(requestedAccounts);
      setCurrentAccount(requestedAccounts[0]);
      setIsConnected(true);
      setChainId(currentChain);
      setNetworkName(resolveNetworkName(currentChain));
      setIsCorrectNetwork(currentChain === TARGET_CHAIN_ID);

      return { success: true, account: requestedAccounts[0], chainId: currentChain };
    } catch (err) {
      const friendlyMessage =
        METAMASK_ERRORS[err.code] ||
        err.message ||
        'Unknown error during connection';
      setError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    } finally {
      setIsConnecting(false);
    }
  }, [isInstalled, resolveNetworkName]);

  // ─── Disconnect (MetaMask doesn't truly disconnect, we clear local state) ─
  const disconnect = useCallback(() => {
    setAccounts([]);
    setCurrentAccount(null);
    setIsConnected(false);
    setError(null);
    // Note: This only clears app state.
    // MetaMask doesn't expose a programmatic disconnect method.
  }, []);

  // ─── Switch to correct network ────────────────────────────────────────────
  const switchNetwork = useCallback(async () => {
    if (!isInstalled) return { success: false };
    setError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID }],
      });
      return { success: true };
    } catch (switchError) {
      // Chain not added to MetaMask yet
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [TARGET_NETWORK],
          });
          return { success: true };
        } catch (addError) {
          const msg = addError.message || 'Failed to add network';
          setError(msg);
          return { success: false, error: msg };
        }
      }
      const msg = METAMASK_ERRORS[switchError.code] || switchError.message;
      setError(msg);
      return { success: false, error: msg };
    }
  }, [isInstalled]);

  // ─── Sign a message (for verifying wallet ownership) ─────────────────────
  const signMessage = useCallback(async (message) => {
    if (!isConnected || !currentAccount) {
      return { success: false, error: 'Wallet not connected' };
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      return { success: true, signature };
    } catch (err) {
      const msg = err.message || 'Failed to sign message';
      setError(msg);
      return { success: false, error: msg };
    }
  }, [isConnected, currentAccount]);

  // ─── Send transaction helper ───────────────────────────────────────────────
  const sendTransaction = useCallback(async ({ to, value, data }) => {
    if (!isConnected || !currentAccount) {
      return { success: false, error: 'Wallet not connected' };
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(value.toString()),
        data: data || '0x',
      });
      const receipt = await tx.wait();
      return { success: true, tx, receipt };
    } catch (err) {
      const msg = METAMASK_ERRORS[err.code] || err.message || 'Transaction failed';
      setError(msg);
      return { success: false, error: msg };
    }
  }, [isConnected, currentAccount]);

  // ─── MetaMask event listeners ─────────────────────────────────────────────
  useEffect(() => {
    if (!isInstalled) return;

    const handleAccountsChanged = (newAccounts) => {
      if (newAccounts.length === 0) {
        // User locked MetaMask or removed all accounts
        disconnect();
      } else {
        setAccounts(newAccounts);
        setCurrentAccount(newAccounts[0]);
        setIsConnected(true);
      }
    };

    const handleChainChanged = (newChainId) => {
      setChainId(newChainId);
      setNetworkName(resolveNetworkName(newChainId));
      setIsCorrectNetwork(newChainId === TARGET_CHAIN_ID);
      // Best practice is to reload on chain change
      window.location.reload();
    };

    const handleConnect = ({ chainId: connectedChainId }) => {
      setChainId(connectedChainId);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('connect', handleConnect);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [isInstalled, disconnect, resolveNetworkName]);

  // ─── Shorten address helper ───────────────────────────────────────────────
  const shortenAddress = useCallback((address, chars = 4) => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  }, []);

  return {
    // State
    isInstalled,
    isConnected,
    isConnecting,
    accounts,
    currentAccount,
    chainId,
    networkName,
    isCorrectNetwork,
    error,
    // Actions
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    sendTransaction,
    // Utils
    shortenAddress,
    shortAddress: shortenAddress(currentAccount),
    targetChainId: TARGET_CHAIN_ID,
    targetNetwork: TARGET_NETWORK,
  };
};

export default useMetaMask;