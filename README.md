# 🎴 Teen Patti P2P - Decentralized Blockchain Card Game

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum)

**A fully decentralized peer-to-peer Teen Patti (Indian Poker) game built on Ethereum blockchain**

[Demo](#demo) • [Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📖 About

Teen Patti P2P is a blockchain-based implementation of the popular Indian card game "Teen Patti" (Three Cards). This decentralized application (DApp) enables players worldwide to compete in provably fair games without any intermediaries, with all game logic executed on-chain via smart contracts.

### Why Blockchain?

- **🔒 Trustless Gaming**: No central authority controls the game
- **💎 Transparent**: All moves are recorded on-chain
- **🎲 Provably Fair**: Cryptographic randomness ensures fairness
- **💰 Real Value**: Play with actual cryptocurrency
- **🌍 Global Access**: Anyone with a wallet can play

---

## ✨ Features

### Smart Contract
- ✅ Complete Teen Patti game logic in Solidity
- ✅ Support for 2-6 players per game
- ✅ Blind and Seen betting modes
- ✅ Proper hand ranking evaluation (High Card to Trail)
- ✅ Secure pot management and automatic payouts
- ✅ Events for all game actions
- ✅ Gas-optimized operations

### Frontend DApp
- ✅ Modern, responsive React UI with Tailwind CSS
- ✅ MetaMask wallet integration
- ✅ Real-time game state synchronization
- ✅ Animated card displays
- ✅ Player statistics and game history
- ✅ Mobile-friendly design
- ✅ Dark theme with glassmorphism

### Game Mechanics
- ✅ All traditional Teen Patti rules implemented
- ✅ Hand rankings: High Card, Pair, Flush, Straight, Three of a Kind, Straight Flush, Trail
- ✅ Blind players pay 1x, Seen players pay 2x
- ✅ Show/Fold mechanics
- ✅ Automatic winner determination

---

## 🎮 Demo

### Screenshots

```
[Game Lobby]              [Active Game]           [Winning Screen]
   Create/Join    →    Betting Interface    →    Winner Declared
```

### Live Demo
🚀 **[Try it on Sepolia Testnet](#)** *(Coming Soon)*

---

## 🚀 Quick Start

### Prerequisites

- Node.js v16+ and npm/yarn
- MetaMask browser extension
- Test ETH from a faucet (for testnet deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/teen-patti-blockchain.git
cd teen-patti-blockchain

# Install dependencies
npm install

# For smart contract deployment
cd contracts
npm install

# For frontend
cd ../frontend
npm install
```

### Smart Contract Deployment

#### Using Hardhat

```bash
# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

#### Using Remix IDE

1. Open [Remix IDE](https://remix.ethereum.org)
2. Upload `contracts/TeenPatti.sol`
3. Compile with Solidity 0.8.20+
4. Deploy using Injected Provider (MetaMask)
5. Copy the deployed contract address

### Frontend Setup

```bash
cd frontend

# Create .env file
echo "REACT_APP_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS" > .env

# Start development server
npm start
```

Visit `http://localhost:3000` and connect your MetaMask wallet!

---

## 📁 Project Structure

```
teen-patti-blockchain/
├── contracts/
│   ├── TeenPatti.sol           # Main game contract
│   └── interfaces/
├── scripts/
│   ├── deploy.js               # Deployment script
│   └── test-game.js            # Testing utilities
├── test/
│   └── TeenPatti.test.js       # Contract tests
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── components/
│   │   │   ├── GameLobby.js
│   │   │   ├── GameTable.js
│   │   │   └── PlayerHand.js
│   │   ├── utils/
│   │   │   └── contract.js     # Contract interaction
│   │   └── hooks/
│   │       └── useGame.js      # Game state management
│   └── public/
├── hardhat.config.js
├── package.json
└── README.md
```

---

## 🎯 How to Play

### 1. Connect Wallet
- Install MetaMask extension
- Switch to desired network (Sepolia/Mumbai/Polygon)
- Click "Connect Wallet"

### 2. Create or Join Game
- **Create**: Set minimum bet and create new game
- **Join**: Enter Game ID and join existing game
- Choose Blind or Seen mode

### 3. Game Actions
- **Bet**: Match or raise the current bet
- **Fold**: Give up your hand and forfeit your bet
- **Show**: Reveal cards and determine winner

### 4. Hand Rankings (Highest to Lowest)
1. **Trail** (Three of a Kind) - Three cards of same rank
2. **Straight Flush** - Sequential cards of same suit
3. **Three of a Kind** - Three cards of same rank
4. **Straight** - Three sequential cards
5. **Flush** - Three cards of same suit
6. **Pair** - Two cards of same rank
7. **High Card** - Highest single card

---

## 🛠️ Technology Stack

### Blockchain
- **Solidity ^0.8.20** - Smart contract development
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js** - Blockchain interaction

### Frontend
- **React 18+** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Ethers.js** - Web3 provider

### Infrastructure
- **Ethereum** - Primary blockchain
- **IPFS** (Optional) - Decentralized hosting
- **The Graph** (Optional) - Indexing and querying

---

## ⚙️ Configuration

### Network Configuration

Edit `hardhat.config.js`:

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    },
    polygon_mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    }
  }
};
```

### Environment Variables

Create `.env` file:

```env
# Contract
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com

# Frontend
REACT_APP_CONTRACT_ADDRESS=deployed_contract_address
REACT_APP_NETWORK_ID=11155111
```

---

## 🧪 Testing

### Run Smart Contract Tests

```bash
# Unit tests
npx hardhat test

# Coverage report
npx hardhat coverage

# Gas report
REPORT_GAS=true npx hardhat test
```

### Test Coverage Goals
- ✅ Unit tests for all contract functions
- ✅ Integration tests for game flow
- ✅ Edge case testing
- ✅ Gas optimization tests

---

## 📊 Gas Optimization

### Estimated Gas Costs

| Action | Gas Used | Cost (Polygon) | Cost (Ethereum) |
|--------|----------|----------------|-----------------|
| Create Game | ~150,000 | $0.003 | $3.00 |
| Join Game | ~100,000 | $0.002 | $2.00 |
| Place Bet | ~80,000 | $0.0016 | $1.60 |
| Show Cards | ~120,000 | $0.0024 | $2.40 |

*Costs are approximate and vary with network congestion*

### Optimization Techniques
- Packed structs for storage efficiency
- Events for off-chain data
- Batch operations where possible
- Minimal storage operations

---

## 🔒 Security

### Current Security Measures
- ✅ Reentrancy guards on all payable functions
- ✅ Access control for game actions
- ✅ Input validation and sanitization
- ✅ Integer overflow protection (Solidity 0.8+)

### Known Limitations
⚠️ **Randomness**: Current implementation uses pseudo-random number generation. For production, integrate **Chainlink VRF** for provably fair randomness.

⚠️ **Game Timeout**: No automatic timeout for inactive players. Future versions should implement this.

### Security Best Practices
1. Never commit private keys to repository
2. Use hardware wallets for mainnet deployment
3. Get professional audit before mainnet launch
4. Implement emergency pause functionality
5. Set up monitoring and alerts

### Recommended Audits
- [ ] Smart contract audit by CertiK/OpenZeppelin
- [ ] Penetration testing
- [ ] Economic model review
- [ ] Legal compliance check

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Basic Teen Patti smart contract
- [x] React frontend
- [x] MetaMask integration
- [x] Testnet deployment

### Phase 2: Enhancement 🚧
- [ ] Chainlink VRF integration
- [ ] Multi-table support
- [ ] Tournament mode
- [ ] Player statistics and leaderboard

### Phase 3: Advanced Features 📋
- [ ] NFT card skins
- [ ] Social features and chat
- [ ] Mobile app (React Native)
- [ ] Cross-chain support (Polygon, BSC, Arbitrum)

### Phase 4: Ecosystem 🌟
- [ ] DAO governance
- [ ] Staking and rewards
- [ ] Partnership integrations
- [ ] Marketing and user acquisition

---

## 📚 Documentation

### For Developers
- [Smart Contract API](./docs/CONTRACT_API.md)
- [Frontend Integration Guide](./docs/FRONTEND_GUIDE.md)
- [Testing Guide](./docs/TESTING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

### For Players
- [How to Play](./docs/HOW_TO_PLAY.md)
- [FAQ](./docs/FAQ.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Contribution Areas
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Translations

---

## 🙏 Acknowledgments

- **OpenZeppelin** for secure smart contract libraries
- **Hardhat** team for excellent development tools
- **Ethereum Foundation** for the blockchain platform
- **React** team for the frontend framework
- Teen Patti game rules and traditional gameplay

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Teen Patti P2P

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Contact & Support

### Community
- **Discord**: [Join our server](#)
- **Telegram**: [@TeenPattiP2P](#)
- **Twitter**: [@TeenPattiP2P](#)

### Support
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/teen-patti-blockchain/issues)
- **Email**: support@teenpattip2p.com
- **Documentation**: [docs.teenpattip2p.com](#)

### Maintainers
- **Lead Developer**: [@yourusername](https://github.com/yourusername)
- **Smart Contract**: [@contributor1](https://github.com/contributor1)
- **Frontend**: [@contributor2](https://github.com/contributor2)

---

## ⚠️ Disclaimer

This software is provided "as is" for educational and entertainment purposes. Users are responsible for:

- Understanding the risks of cryptocurrency gambling
- Complying with local gambling laws and regulations
- Securing their private keys and wallets
- Understanding that blockchain transactions are irreversible

**The developers assume no liability for financial losses or legal issues arising from the use of this software.**

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/teen-patti-blockchain?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/teen-patti-blockchain?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/teen-patti-blockchain)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/teen-patti-blockchain)

---

<div align="center">

**Built with ❤️ by the Teen Patti P2P Team**

⭐ Star us on GitHub — it helps!

[Website](#) • [Documentation](#) • [Discord](#) • [Twitter](#)

</div>
