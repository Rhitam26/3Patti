import React from 'react';
import PlayerHand from './PlayerHand';
import useGame from '../hooks/useGame';
import { Trophy, Users, Coins, TrendingUp } from 'lucide-react';

const GameTable = ({ contract, account, gameId, onLeaveGame, setError }) => {
  const {
    gameData,
    myCards,
    loading,
    showCards,
    betAmount,
    setBetAmount,
    setShowCards,
    handlePlaceBet,
    handleFold,
    handleShow,
    isMyTurn,
    amIPlaying
  } = useGame(contract, account, gameId, setError);

  if (!gameData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading game data...</p>
      </div>
    );
  }

  const getStateColor = () => {
    switch (gameData.state) {
      case 'Waiting': return 'text-yellow-600';
      case 'Playing': return 'text-green-600';
      case 'Ended': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStateBadge = () => {
    const colors = {
      'Waiting': 'bg-yellow-100 text-yellow-800',
      'Playing': 'bg-green-100 text-green-800',
      'Ended': 'bg-red-100 text-red-800'
    };
    return colors[gameData.state] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Game #{gameId}
            </h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStateBadge()}`}>
              {gameData.state}
            </span>
          </div>
          
          {gameData.state === 'Ended' && gameData.winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">
                  Winner: {gameData.winner.slice(0, 6)}...{gameData.winner.slice(-4)}
                  {gameData.winner.toLowerCase() === account.toLowerCase() && ' (You!)'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Pot</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {gameData.pot} ETH
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Current Bet</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {gameData.currentBet} ETH
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Players</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {gameData.playerCount}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Min Bet</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {gameData.minBet} ETH
          </div>
        </div>
      </div>

      {/* My Hand - Using PlayerHand Component */}
      {myCards.length > 0 && gameData.state !== 'Ended' && (
        <PlayerHand
          cards={myCards}
          showCards={showCards}
          setShowCards={setShowCards}
          isMyTurn={isMyTurn}
        />
      )}

      {/* Players List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-600" />
          Players at Table
        </h3>

        <div className="space-y-3">
          {gameData.players && gameData.players.addresses.map((addr, idx) => {
            const isMe = addr.toLowerCase() === account.toLowerCase();
            const isFolded = gameData.players.folded[idx];
            const isBlindPlayer = gameData.players.isBlind[idx];

            return (
              <div
                key={idx}
                className={`p-4 rounded-lg transition-all ${
                  isMe
                    ? 'bg-green-100 border-2 border-green-500'
                    : isFolded
                    ? 'bg-gray-100 opacity-60'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium">
                        {addr.slice(0, 8)}...{addr.slice(-6)}
                      </span>
                      
                      {isMe && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          YOU
                        </span>
                      )}
                      
                      {isBlindPlayer && !isFolded && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          BLIND
                        </span>
                      )}
                      
                      {isFolded && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          FOLDED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {gameData.players.bets[idx]} ETH
                    </div>
                    <div className="text-xs text-gray-500">
                      Total bet
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Actions */}
      {gameData.state === 'Playing' && amIPlaying && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {isMyTurn ? '🎯 Your Turn!' : '⏳ Waiting for your turn...'}
          </h3>

          {isMyTurn && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bet Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min={gameData.currentBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder={`Min: ${gameData.currentBet} ETH`}
                />
                <p className="mt-2 text-sm text-gray-600">
                  {gameData.players?.isBlind[gameData.players?.addresses.findIndex(a => a.toLowerCase() === account.toLowerCase())]
                    ? `As a blind player, you pay ${betAmount} ETH`
                    : `As a seen player, you pay ${betAmount} ETH (2x multiplier applied on-chain)`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handlePlaceBet}
                  disabled={loading || parseFloat(betAmount) < parseFloat(gameData.currentBet)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Bet'
                  )}
                </button>

                <button
                  onClick={handleFold}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Fold'
                  )}
                </button>

                <button
                  onClick={handleShow}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Show'
                  )}
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
                <p className="font-medium mb-2">💡 Action Guide:</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Bet:</strong> Match or raise the current bet to stay in the game</li>
                  <li><strong>Fold:</strong> Give up your hand and lose your current bet</li>
                  <li><strong>Show:</strong> Reveal cards and determine the winner (ends the game)</li>
                </ul>
              </div>
            </div>
          )}

          {!isMyTurn && (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-500 mb-4">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p>Waiting for other players to complete their turn...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameData.state === 'Ended' && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg p-8 text-center">
          <Trophy className="w-20 h-20 mx-auto mb-4 text-white" />
          <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
          
          {gameData.winner !== '0x0000000000000000000000000000000000000000' && (
            <>
              <p className="text-white text-xl mb-2">
                🎉 Winner: {gameData.winner.slice(0, 8)}...{gameData.winner.slice(-6)}
              </p>
              {gameData.winner.toLowerCase() === account.toLowerCase() && (
                <p className="text-white text-2xl font-bold mb-4">
                  Congratulations! You Won! 🏆
                </p>
              )}
              <p className="text-white text-xl font-bold mb-6">
                Prize: {gameData.pot} ETH
              </p>
            </>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={onLeaveGame}
              className="bg-white text-yellow-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}

      {/* Waiting State */}
      {gameData.state === 'Waiting' && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <Users className="w-12 h-12 mx-auto mb-2 animate-bounce" />
            <p className="text-lg">Waiting for more players to join...</p>
            <p className="text-sm mt-2">Game will start when at least 2 players have joined</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-sm text-gray-700 mb-2">
              Share this Game ID with friends:
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-white px-4 py-2 rounded border text-lg font-bold text-blue-600">
                {gameId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(gameId);
                  alert('Game ID copied to clipboard!');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTable;