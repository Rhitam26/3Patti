
# Teen Patti Blockchain Game

A modern, decentralized version of the classic Indian card game Teen Patti, built with React and blockchain technology. This application offers both traditional credential-based authentication and Web3 wallet integration, making it accessible to both crypto-native users and newcomers to blockchain gaming.

## Overview

Teen Patti, also known as Indian Poker, is one of the most popular card games in South Asia. This digital implementation brings the excitement of the traditional game to the blockchain, ensuring fair play through transparent, on-chain mechanics while maintaining the social and strategic elements that make Teen Patti so engaging.

## Key Features

### Dual Authentication System
The game supports two authentication methods to cater to different user preferences:

- **MetaMask Wallet Authentication**: For users familiar with Web3 and cryptocurrency wallets
- **Credential-Based Login**: Traditional username/password system for users new to blockchain technology

### Game Modes
- **Practice Mode**: Play against AI opponents without any financial commitment
- **Random Tables**: Join public games with other players
- **Private Tables**: Create invite-only games for friends and family
- **Live Tables**: Browse and join active games in real-time

### Blockchain Integration
- Built on Polygon Mumbai testnet for fast, low-cost transactions
- Smart contract integration for transparent game mechanics
- Real-time balance tracking and transaction history
- Secure, verifiable random card dealing

### User Experience
- Responsive design that works on desktop and mobile devices
- Smooth animations and transitions using Framer Motion
- Real-time chat system for player interaction
- Comprehensive game statistics and hand rankings
- Intuitive interface suitable for both beginners and experienced players

## Technology Stack

### Frontend
- **React 18** with modern hooks and functional components
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations and transitions

### Blockchain
- **Ethers.js v6** for Web3 interactions
- **MetaMask** integration for wallet connectivity
- **Polygon Mumbai** testnet for development and testing

### Development Tools
- **ESLint** for code quality and consistency
- **PostCSS** and **Autoprefixer** for CSS processing
- **Modern JavaScript** (ES2022+) with module syntax

## Installation

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn package manager
- MetaMask browser extension (optional, for Web3 features)

### Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd 3Patti-final
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables (optional):
```bash
# Create .env file in project root
VITE_CONTRACT_ADDRESS=your_contract_address_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Getting Started

1. **Choose Authentication Method**: On the welcome screen, select either "Connect Wallet" for MetaMask integration or "Sign In" for credential-based access.

2. **For MetaMask Users**:
   - Ensure you have MetaMask installed and configured
   - Connect to Polygon Mumbai testnet
   - Approve the connection when prompted

3. **For Credential Users**:
   - Enter any username and password (demo accepts all credentials)
   - Your session will be saved for future visits

### Playing the Game

1. **Select Boot Amount**: Choose your preferred betting amount from the available options

2. **Choose Game Mode**:
   - **Practice**: Play with AI opponents for free
   - **Random Table**: Join a public game with other players
   - **Create Table**: Set up a private game and invite friends
   - **Join Table**: Enter an invite code to join a private game

3. **Game Controls**:
   - **See Cards**: View your hand (changes betting dynamics)
   - **Call**: Match the current bet
   - **Raise**: Increase the bet amount
   - **Fold**: Exit the current hand
   - **All In**: Bet your entire balance

### Game Rules

Teen Patti is played with a standard 52-card deck. Each player receives three cards, and the goal is to have the best hand or successfully bluff other players into folding.

**Hand Rankings (Highest to Lowest)**:
1. **Trail** (Three of a Kind): Three cards of the same rank
2. **Pure Sequence** (Straight Flush): Three consecutive cards of the same suit
3. **Sequence** (Straight): Three consecutive cards of different suits
4. **Color** (Flush): Three cards of the same suit
5. **Pair**: Two cards of the same rank
6. **High Card**: When no other combination is achieved

## Architecture

### Component Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Shared UI components
│   ├── game/           # Game-specific components
│   └── modals/         # Modal dialogs
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── constants/          # Game constants and configurations
└── styles/             # CSS and styling
```

### State Management
The application uses React Context for state management, with separate contexts for:
- **AuthContext**: Manages user authentication and session state
- **Web3Context**: Handles blockchain interactions and wallet connectivity
- **GameContext**: Controls game state, player actions, and game flow

### Authentication Flow
The dual authentication system allows seamless switching between Web3 and traditional authentication methods. User sessions are managed independently, ensuring a smooth experience regardless of the chosen authentication method.

## Development

### Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Create production build
- `npm run lint`: Run ESLint for code quality checks
- `npm run preview`: Preview production build locally

### Code Style
The project follows modern React best practices:
- Functional components with hooks
- Proper separation of concerns
- Consistent naming conventions
- Comprehensive error handling
- Responsive design patterns

### Contributing Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure they follow the existing code style
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Future Enhancements

### Planned Features
- Tournament mode with bracket-style competitions
- NFT integration for unique card designs and avatars
- Enhanced AI with different difficulty levels and playing styles
- Spectator mode for watching ongoing games
- Achievement system and player rankings
- Mobile application for iOS and Android

### Technical Improvements
- Mainnet deployment with production smart contracts
- Advanced security auditing and testing
- Performance optimization for larger player bases
- Integration with additional blockchain networks
- Enhanced analytics and reporting features

## Security Considerations

This application is designed for educational and entertainment purposes. When deploying to mainnet or handling real funds, additional security measures should be implemented:

- Comprehensive smart contract auditing
- Enhanced input validation and sanitization
- Rate limiting for API calls and user actions
- Advanced authentication and authorization systems
- Regular security assessments and updates

## Support and Community

For questions, bug reports, or feature requests, please create an issue in the project repository. We welcome contributions from the community and are committed to maintaining an inclusive and collaborative development environment.

## License

This project is open source and available under the MIT License. See the LICENSE file for more details.

---

**Note**: This application uses testnet cryptocurrencies and is intended for educational purposes. Always exercise caution when dealing with real cryptocurrency transactions and ensure you understand the risks involved in blockchain-based applications.
