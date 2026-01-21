# Reputation Heist

## Overview

Reputation Heist is a Web3 social betting game built on Base (Ethereum L2) where users stake ETH on "dares" and an AI judge (powered by Google Gemini) determines winners. The application combines on-chain smart contracts for escrow/betting mechanics with a cyberpunk-themed Next.js frontend featuring real-time interactions and dramatic UI elements.

Core concept: Players challenge each other to complete social or on-chain feats, stake reputation and ETH, then submit proof URLs that an AI "Heist Master" evaluates to determine winners.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js (App Router) with React 18
- **Styling**: Tailwind CSS with custom cyberpunk theme (dark/light mode via CSS variables)
- **Animations**: Framer Motion for transitions, glitch effects, and interactive elements
- **State Management**: React hooks + TanStack Query for server state
- **Web3 Integration**: wagmi v2 + viem for wallet connections and contract interactions

### Smart Contract Layer
- **Blockchain**: Base Sepolia (testnet) with Base Mainnet support configured
- **Contract Framework**: Hardhat with TypeScript
- **Main Contract**: HeistManager - handles heist creation, betting, proof submission, and payouts
- **Dependencies**: OpenZeppelin contracts v5.4 for security patterns
- **Deployed Address**: `0xe0759c5257608c4fDc4c9043a425ad4086075C66` (Base Sepolia)

### AI Judging System
- **Provider**: Google Gemini API (gemini-pro model)
- **Endpoint**: `/api/judge` - POST endpoint that evaluates proof URLs
- **Output**: Structured JSON with scores (balls, execution, chaos), confidence level, verdict text, and winner determination
- **Fallback**: Low confidence scores (< 80) trigger manual review pathway

### Key Design Patterns
1. **Hybrid Data**: Mock seed data (`LEGENDARY_HEISTS`) for demo + real contract reads for live heists
2. **Progressive Enhancement**: UI renders with mock data, enhances with blockchain data when available
3. **Theme System**: CSS custom properties enable runtime theme switching without rebuild
4. **Sound System**: Abstracted hook (`useHeistSounds`) ready for audio integration (currently mocked)

### Route Structure
- `/` - Main lobby with active heists feed and betting interface
- `/bounty-board` - Browse all available dares
- `/create-heist` - Form to create new on-chain heists
- `/heist/[id]` - Individual heist room with live chat, betting, and proof submission
- `/hall-of-fame` - Winners/losers leaderboard
- `/api/judge` - AI judging endpoint

## External Dependencies

### Blockchain Services
- **Base Sepolia RPC**: Default `https://sepolia.base.org` (configurable via `BASE_SEPOLIA_RPC_URL`)
- **Base Mainnet RPC**: Default `https://mainnet.base.org` (configurable via `BASE_MAINNET_RPC_URL`)
- **Basescan API**: Contract verification (API key placeholder in config)

### AI Services
- **Google Gemini**: Requires `GEMINI_API_KEY` environment variable for AI judging functionality

### Environment Variables Required
- `GEMINI_API_KEY` - Google Generative AI API key
- `WALLET_PRIVATE_KEY` - For contract deployment (dev only)
- `BASE_SEPOLIA_RPC_URL` - Optional custom RPC
- `BASE_MAINNET_RPC_URL` - Optional custom RPC

### NPM Package Categories
- **Web3**: wagmi, viem, ethers (dev)
- **UI**: framer-motion, lucide-react, clsx, tailwind-merge
- **AI**: @google/generative-ai, openai (secondary)
- **Smart Contracts**: @openzeppelin/contracts, hardhat toolchain