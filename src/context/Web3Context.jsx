import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CHAIN_ID } from '../constants/gameConstants';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not installed! Please install MetaMask.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();
      const rawBalance = await web3Provider.getBalance(address);
      const formattedBalance = parseFloat(ethers.formatEther(rawBalance)).toFixed(4);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);
      setBalance(formattedBalance);
      setChainId(`0x${network.chainId.toString(16)}`);

      return true;
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance('0');
  }, []);

  const switchToPolygon = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: CHAIN_ID,
            chainName: 'Polygon Mumbai Testnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
            blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
          }],
        });
      }
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) disconnectWallet();
        else setAccount(accounts[0]);
      });
      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(newChainId);
        window.location.reload();
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [disconnectWallet]);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <Web3Context.Provider value={{
      account, provider, signer, balance,
      isConnecting, error, chainId, shortAddress,
      connectWallet, disconnectWallet, switchToPolygon,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
};