# Punto - 

## hackathon submissions: 
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

## Problem Statement

After attending amazing events, communities want to:
- **Capture collective memories** - But individual posts get lost in social media noise
- **Reward contributors** - But payment coordination is manual and trust-based
- **Create lasting artifacts** - But traditional publishing is slow and centralized

**Current Pain Points:**
1. Event organizers manually collect submissions via Google Forms or use $2k/yr outdated software
2. Payment promises are often forgotten or delayed (see screenshot in devpost!)
3. No transparent editorial process
4. Bored artsy kids don't have tools to create a curation together online with monetization. (=me and my friends need it)

---

##  Solution

**Punto** is a platform to create collaborative zines! This MVP is focused on post-irl-event zines. 

###  Key Features

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

## Architecture Overview

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

##  Tech Stack

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
- (post-hackathon) 401x
- (post-hackathon) Miniapp share on Farcaster to join Zine making open calls

### Smart Contracts
- Deployed on Base Sepolia testnet
- Trustless escrow for payments
- Transparent editorial voting
- Automatic payment release

---



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

## 📄 License

MIT License - see [LICENSE](LICENSE) file

**Built with ❤️ on Base for Base Build Hackathon**
