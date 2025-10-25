# Punto - 

[![Base](https://img.shields.io/badge/Built%20on-Base-0052FF)](https://base.org)
[![Basenames](https://img.shields.io/badge/Integrated-Basenames-0052FF)](https://www.base.org/names)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Live Demo:** [punto-base.vercel.app](https://punto-base.vercel.app)

**Base Sepolia Testnet:** [View on BaseScan](https://sepolia.basescan.org/address/0x...) 
- "deploy": "https://base-sepolia.blockscout.com/tx/0x54545f19f736a6875419a8fef43da83a0be4b8be4ce13a3ef93ba0098b9772e6",
- "deposit": "https://base-sepolia.blockscout.com/tx/0x55be1cb6ed25279464f43092fea92497267bf267a77a9d31ff72a7300f4b8ff5",
- "registerSubmission": "https://base-sepolia.blockscout.com/tx/0x9aaf401fd7315bbf1f2001968c8263a06b11a1b5a60c7f2df9b34217ab66a904",
- "voteApprove": "https://base-sepolia.blockscout.com/tx/0xe2663a23ab39199f4fe65957b4f583031fc57c7601c65ff1d241e2b121b0f20b"

---

## 🎯 Problem Statement

After attending amazing events, communities want to:
- **Capture collective memories** - But individual posts get lost in social media noise
- **Reward contributors** - But payment coordination is manual and trust-based
- **Create lasting artifacts** - But traditional publishing is slow and centralized

**Current Pain Points:**
1. Event organizers manually collect submissions via Google Forms
2. Payment promises are often forgotten or delayed
3. No transparent editorial process
4. Final publications live on centralized platforms
5. Contributors have no onchain proof of their work

---

## 💡 Solution

**Punto** is a platform to create collaborative zines! This MVP is focused on post-irl-event zines. 

### ✨ Key Features

1. **Automated Event Scraping**
   - Import event details from Luma/Social Layer
   - Auto-generate submission topics
   - Pre-fill magazine metadata

2. **Smart Contract Escrow**
   - Founder deposits bounty funds onchain
   - Contributors submit content
   - Editors vote to approve
   - **Payments auto-release when approved** ← No manual transfers!

3. **Basenames Integration**
   - Display human-readable names (e.g., `doublescoop.base.eth`)
   - Send payments to Basenames
   - Build reputation onchain

4. **Transparent Editorial Process**
   - All votes recorded onchain
   - Contributors see approval status in real-time
   - Payment history is publicly verifiable

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Event       │  │  Submission  │  │  Editor      │     │
│  │  Scraper     │  │  Form        │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────┬──────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────────────────────────────────────────┐
│                    API Routes (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  /magazines  │  │  /submissions│  │  /payments   │    │
│  │  /create     │  │  /create     │  │  /batch      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────┬────────────────────────────────┬─────────────┘
             │                                │
             ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────┐
│   Supabase (Postgres)  │      │  Base Sepolia Testnet      │
│  ┌──────────────────┐  │      │  ┌──────────────────────┐ │
│  │ magazines        │  │      │  │ MagazineEscrow.sol   │ │
│  │ issues           │  │      │  │                      │ │
│  │ topics           │  │      │  │ - deposit()          │ │
│  │ submissions      │  │      │  │ - registerSubmission │ │
│  │ payments         │  │      │  │ - voteApprove()      │ │
│  │ users            │  │      │  │ - auto-payment ✨    │ │
│  └──────────────────┘  │      │  └──────────────────────┘ │
└────────────────────────┘      └────────────────────────────┘
             │                                │
             └────────────────┬───────────────┘
                              ▼
                    ┌──────────────────┐
                    │  OnchainKit      │
                    │  - Wallet        │
                    │  - Basenames     │
                    │  - Transactions  │
                    └──────────────────┘
```

### Smart Contract Flow

```
1. Founder creates magazine issue
   ↓
2. Founder deploys MagazineEscrow contract
   ↓
3. Founder deposits bounty funds (0.1 ETH)
   ↓
4. Contributors submit content
   ↓
5. Founder registers submissions onchain
   ↓
6. Editors vote to approve
   ↓
7. Payment auto-releases when threshold reached ✨
   ↓
8. Contributor receives funds instantly
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **OnchainKit** - Coinbase wallet integration

### Backend
- **Supabase** - PostgreSQL database
- **Next.js API Routes** - Backend logic
- **Viem** - Ethereum interactions

### Blockchain
- **Base Sepolia** - Testnet deployment
- **Solidity 0.8.20** - Smart contracts
- **Basenames** - Human-readable addresses
- **OnchainKit** - Wallet & identity

### External APIs
- **Luma API** - Event data scraping
- **Social Layer API** - Event data scraping

---

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js 18+ or Bun
- Supabase account
- Base Sepolia testnet ETH
- Wallet with Basename (optional but recommended)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/punto-base.git
cd punto-base
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base Network
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

# OnchainKit (Coinbase)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key

# Contract Addresses (fill after deployment)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
```

4. **Set up database**
```bash
# Run migrations in Supabase dashboard
# Import schema from supabase/schema.sql
```

5. **Run development server**
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)


---

## 🎬 Demo Flow

### 1. Create Magazine (Founder)
1. Connect wallet (doublescoop.base.eth)
2. Paste Luma event URL
3. Auto-scrape event details
4. Customize submission topics
5. Deploy escrow contract
6. Deposit bounty funds

### 2. Submit Content (Contributor)
1. Browse open calls
2. Select topic
3. Submit content (text/image)
4. Wait for editorial review

### 3. Review & Pay (Editor)
1. View submissions
2. Vote to approve
3. **Payment auto-releases onchain** ✨
4. Contributor receives funds instantly

---

## 📊 Database Schema

Key tables (see [`database.types.ts`](database.types.ts) for full schema):

- **magazines** - Magazine metadata
- **issues** - Individual magazine issues
- **topics** - Submission topics/prompts
- **submissions** - Contributor submissions
- **payments** - Payment records
- **users** - User profiles with Basenames

---

## 🔗 Base Integration

### Basenames
- Display human-readable names throughout app
- Send payments to Basenames
- Resolve names to addresses automatically

### OnchainKit
- Wallet connection
- Transaction signing
- Identity management
- Basename resolution

### Smart Contracts
- Deployed on Base Sepolia testnet
- Trustless escrow for payments
- Transparent editorial voting
- Automatic payment release

---

## 🎯 Hackathon Submission

### ✅ Requirements Met

- [x] **Functioning onchain app** - Live at punto-base.vercel.app
- [x] **Open-source repo** - This repository
- [x] **Base testnet deployment** - Contract at `0x...`
- [x] **1+ testnet transactions** - See transaction hashes below
- [x] **Basenames integration** - Display and payment support
- [x] **Base Account integration** - OnchainKit wallet

### 📹 Demo Video

**Video Link:** [YouTube/Loom Link] *(Update after recording)*

**Contents:**
- 0:00 - Introduction & Problem Statement
- 0:30 - Solution Overview
- 1:00 - Live Demo (Create Magazine)
- 2:00 - Smart Contract Interaction
- 3:00 - Payment Auto-Release
- 3:30 - Architecture Overview
- 4:00 - Conclusion

### 🔗 Deployment Proof

**Contract Address:** `0x...` *(Update after deployment)*  
**Deployer:** `doublescoop.base.eth`  
**Network:** Base Sepolia (Chain ID: 84532)

**Transaction Hashes:**
1. Contract Deployment: `0x...`
2. Deposit Funds: `0x...`
3. Register Submission: `0x...`
4. Vote & Auto-Payment: `0x...`

**BaseScan Links:**
- Contract: https://sepolia.basescan.org/address/0x...
- Transactions: https://sepolia.basescan.org/tx/0x...

---

## 🎨 Unique Value Proposition

### What Makes Punto Different?

1. **Auto-Payment on Approval** ← Most important!
   - No manual payment coordination
   - Trustless escrow
   - Instant contributor payouts

2. **Event-First Design**
   - Scrapes event data automatically
   - Pre-generates relevant topics
   - Captures collective memory

3. **Onchain Editorial Process**
   - Transparent voting
   - Verifiable decisions
   - Permanent record

4. **Basenames Native**
   - Human-readable throughout
   - Build contributor reputation
   - Onchain identity

---

## 🎯 Target Customer Profile

### Primary: Event Organizers
- Run 10-100 person events
- Want to capture collective experience
- Have small budget for contributor rewards
- Value transparency and automation

### Secondary: Community Leaders
- Manage online communities
- Run regular activities/challenges
- Want to reward active members
- Need trustless payment system

### Use Cases
- Post-conference zines
- Hackathon recap magazines
- Community challenge collections
- Event memory books

---

## 🚧 Roadmap

### MVP (Current - Hackathon)
- [x] Event scraping
- [x] Submission management
- [x] Smart contract escrow
- [x] Basenames integration
- [x] Auto-payment on approval

### V2 (Post-Hackathon)
- [ ] Multi-signature editorial voting
- [ ] IPFS storage for submissions
- [ ] NFT minting for published work
- [ ] Mainnet deployment
- [ ] Revenue sharing for editors

### V3 (Future)
- [ ] DAO governance
- [ ] Tokenized reputation
- [ ] Cross-chain support
- [ ] AI-assisted curation

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **Base** - For the amazing L2 infrastructure
- **Coinbase** - For OnchainKit and Basenames
- **Supabase** - For the database platform
- **Luma** - For event data API

---

## 📞 Contact

- **Twitter:** [@yourhandle]
- **Email:** your@email.com
- **Discord:** [Join our server]

---

**Built with ❤️ on Base for Base Build Hackathon**
