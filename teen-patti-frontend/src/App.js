import React, { useState, useEffect } from 'react';
import GameLobby from './components/GameLobby';
import GameTable from './components/GameTable';
import { initializeContract, connectWallet } from './utils/contrcats';
import { Wallet, Trophy } from 'lucide-react';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkWalletConnection();
    setupEventListeners();
  }, []);

  useEffect(() => {
    if (account) {
      initContract();
    }
  }, [account]);

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setContract(null);
          setGameId(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setError('Failed to check wallet connection');
      }
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    }
    setLoading(false);
  };

  const initContract = async () => {
    try {
      const contractInstance = await initializeContract();
      setContract(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
      setError('Failed to initialize contract');
    }
  };

  const handleGameCreated = (newGameId) => {
    setGameId(newGameId);
  };

  const handleGameJoined = (joinedGameId) => {
    setGameId(joinedGameId);
  };

  const handleLeaveGame = () => {
    setGameId(null);
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Wallet className="w-16 h-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Teen Patti P2P
          </h1>
          
          <p className="text-gray-600 text-center mb-6">
            Connect your wallet to start playing Teen Patti on the blockchain
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleConnectWallet}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </>
            )}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Don't have MetaMask?</p>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Download here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-2xl font-bold text-gray-800">
                Teen Patti P2P
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Connected: </span>
                <span className="font-mono text-gray-800 font-medium">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              
              {gameId && (
                <button
                  onClick={handleLeaveGame}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Leave Game
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!contract ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing contract...</p>
          </div>
        ) : !gameId ? (
          <GameLobby
            contract={contract}
            account={account}
            onGameCreated={handleGameCreated}
            onGameJoined={handleGameJoined}
            setError={setError}
          />
        ) : (
          <GameTable
            contract={contract}
            account={account}
            gameId={gameId}
            onLeaveGame={handleLeaveGame}
            setError={setError}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              🎴 Teen Patti P2P - Decentralized Card Gaming on Blockchain
            </p>
            <p className="text-xs">
              Play responsibly. Understand the risks. Transactions are irreversible.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;