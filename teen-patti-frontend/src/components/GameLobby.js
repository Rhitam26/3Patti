import React, { useState } from 'react';
import { Play, Users, Info } from 'lucide-react';

const GameLobby = ({ contract, account, onGameCreated, onGameJoined, setError }) => {
  const [minBet, setMinBet] = useState('0.01');
  const [joinGameId, setJoinGameId] = useState('');
  const [isBlind, setIsBlind] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const handleCreateGame = async () => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    if (parseFloat(minBet) <= 0) {
      setError('Minimum bet must be greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ethers = window.ethers;
      const tx = await contract.createGame(
        ethers.utils.parseEther(minBet),
        {
          value: ethers.utils.parseEther(minBet)
        }
      );

      const receipt = await tx.wait();
      
      // Find GameCreated event
      const event = receipt.events?.find(e => e.event === 'GameCreated');
      
      if (event) {
        const gameId = event.args.gameId.toString();
        onGameCreated(gameId);
        setError(null);
      } else {
        setError('Game created but could not get Game ID');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      if (error.code === 4001) {
        setError('Transaction rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        setError('Insufficient funds for transaction');
      } else {
        setError(error.reason || error.message || 'Failed to create game');
      }
    }

    setLoading(false);
  };

  const handleJoinGame = async () => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    if (!joinGameId || joinGameId.trim() === '') {
      setError('Please enter a valid Game ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ethers = window.ethers;
      
      // Get game details first to know the minimum bet
      const gameData = await contract.getGame(joinGameId);
      const minBetRequired = gameData[3]; // minBet is at index 3
      
      const tx = await contract.joinGame(
        joinGameId,
        isBlind,
        {
          value: minBetRequired
        }
      );

      await tx.wait();
      onGameJoined(joinGameId);
      setError(null);
    } catch (error) {
      console.error('Error joining game:', error);
      if (error.code === 4001) {
        setError('Transaction rejected by user');
      } else if (error.message.includes('Game does not exist')) {
        setError('Game not found. Check the Game ID');
      } else if (error.message.includes('Game already started')) {
        setError('This game has already started');
      } else if (error.message.includes('Game is full')) {
        setError('This game is full (max 6 players)');
      } else if (error.message.includes('Already joined')) {
        setError('You have already joined this game');
      } else if (error.message.includes('insufficient funds')) {
        setError('Insufficient funds for minimum bet');
      } else {
        setError(error.reason || error.message || 'Failed to join game');
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Rules Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Game Rules</h2>
          </div>
          <span className="text-gray-500">
            {showRules ? '▲' : '▼'}
          </span>
        </button>

        {showRules && (
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Hand Rankings (High to Low):</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Trail/Trio</strong> - Three of same rank (e.g., A-A-A)</li>
                <li><strong>Straight Flush</strong> - Sequential cards of same suit</li>
                <li><strong>Straight</strong> - Three sequential cards</li>
                <li><strong>Flush</strong> - Three cards of same suit</li>
                <li><strong>Pair</strong> - Two cards of same rank</li>
                <li><strong>High Card</strong> - Highest single card wins</li>
              </ol>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Betting Rules:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Blind Player:</strong> Plays without seeing cards, pays 1x bet</li>
                <li><strong>Seen Player:</strong> Plays after seeing cards, pays 2x bet</li>
                <li><strong>Bet:</strong> Match or raise the current bet to continue</li>
                <li><strong>Fold:</strong> Give up and lose your bet</li>
                <li><strong>Show:</strong> Reveal cards and determine winner</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum 2 players, maximum 6 players per game</li>
                <li>Game starts automatically when 2+ players join</li>
                <li>All bets go into a pot, winner takes all</li>
                <li>Transactions are on-chain and irreversible</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Create and Join Game Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Game Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Create New Game</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Bet (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={minBet}
                onChange={(e) => setMinBet(e.target.value)}
                placeholder="0.01"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                You will pay this amount to create the game
              </p>
            </div>

            <button
              onClick={handleCreateGame}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Create Game
                </>
              )}
            </button>
          </div>
        </div>

        {/* Join Game Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Join Existing Game</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game ID
              </label>
              <input
                type="text"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                placeholder="Enter game ID (e.g., 0, 1, 2...)"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Get this from the game creator
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="blindMode"
                  checked={isBlind}
                  onChange={(e) => setIsBlind(e.target.checked)}
                  disabled={loading}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="blindMode" 
                    className="font-medium text-gray-700 cursor-pointer"
                  >
                    Play Blind
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Play without seeing your cards and pay half the betting amount.
                    Risk taker's choice!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleJoinGame}
              disabled={loading || !joinGameId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Join Game
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Pro Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Start with small bets to learn the game mechanics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Playing blind is riskier but costs half the stakes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Save your Game ID after creating - share it with friends!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            <span>Make sure you have enough ETH for gas fees + bets</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GameLobby;