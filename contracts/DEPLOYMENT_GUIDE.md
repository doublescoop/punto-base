# MagazineEscrow Deployment Guide

## Quick Start (Hackathon Fast Track)

### Prerequisites
1. **Get Base Sepolia Testnet ETH**
   - Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Connect your wallet (doublescoop.base.eth)
   - Request testnet ETH (0.1 ETH is plenty)

2. **Prepare Deployment Parameters**
   ```typescript
   magazineId: string;      // From database (magazines.id)
   issueId: string;         // From database (issues.id)
   deadline: number;        // Unix timestamp (e.g., 1735689600 for Jan 1, 2025)
   minVotesRequired: 1;     // 1 for solo founder MVP
   ```

---

## Deployment Method 1: Remix IDE (Fastest - Recommended for Hackathon)

### Step 1: Open Remix
1. Go to https://remix.ethereum.org
2. Create new file: `MagazineEscrow.sol`
3. Copy contents from `contracts/MagazineEscrow.sol`

### Step 2: Compile
1. Click "Solidity Compiler" tab (left sidebar)
2. Select compiler version: `0.8.20` or higher
3. Click "Compile MagazineEscrow.sol"
4. ✅ Verify: "Compilation successful"

### Step 3: Deploy
1. Click "Deploy & Run Transactions" tab
2. Select Environment: **"Injected Provider - MetaMask"**
3. Connect your wallet (doublescoop.base.eth)
4. Verify network: **Base Sepolia** (Chain ID: 84532)
5. Fill constructor parameters:
   ```
   _MAGAZINEID: "your-magazine-id-from-db"
   _ISSUEID: "your-issue-id-from-db"
   _DEADLINE: 1735689600  (Unix timestamp)
   _MINVOTESREQUIRED: 1
   ```
6. Click **"Deploy"**
7. Confirm transaction in MetaMask
8. ⏳ Wait for confirmation (~2 seconds)

### Step 4: Save Deployment Info
Copy the deployed contract address and save to `contracts/deployments/<issueId>.json`:

```json
{
  "network": "base-sepolia",
  "chainId": 84532,
  "contractName": "MagazineEscrow",
  "contractAddress": "0xd9145CCE52D386f254917e481eB44e9943F39138",
  "deployer": "0x...",
  "deployedAt": "2025-01-15T10:30:00Z",
  "constructorArgs": {
    "magazineId": "d2e7565b-b6c7-4b53-a976-0daff89b06bc",
    "issueId": "afec39bd-b5ac-4312-93e7-ad1f3d8f6102",
    "deadline": 1761693480,
    "minVotesRequired": 1
  },
  "transactionHash": "0x8f0d593830be71d4803659a9d61724166a24082cc73033449abc52d3590dcc27",
  "blockNumber": 1
}
```

[
  {
    "logIndex": "0x1",
    "blockNumber": "0x1",
    "blockHash": "0x808b519b64db5d9b8e588a31c51100e8a6f6eac086d79879b1ae4e84f70eb007",
    "transactionHash": "0x8f0d593830be71d4803659a9d61724166a24082cc73033449abc52d3590dcc27",
    "transactionIndex": "0x0",
    "address": "0xd9145CCE52D386f254917e481eB44e9943F39138",
    "data": "0x",
    "topics": [
      "0x2973ec437ba0a6207102c44c409e03815ee1cc4624578ad40d3e4c50f9785591",
      "0x0000000000000000000000005b38da6a701c568545dcfcb03fcb875f56beddc4"
    ]
  }
]

---

## Testing the Contract (Required for Hackathon Submission)

### Test 1: Deposit Funds ✅
```solidity
// In Remix, call deposit() function
// Set VALUE: 0.01 ETH
// Click "deposit"
```

**Expected Result:**
- Transaction succeeds
- Event emitted: `FundsDeposited(founder, 0.01 ETH, 0.01 ETH)`
- Contract balance: 0.01 ETH

**Save Transaction Hash:** `0x...` (for hackathon proof)

---

### Test 2: Register Submission ✅  0x55be1cb6ed25279464f43092fea92497267bf267a77a9d31ff72a7300f4b8ff5
```solidity
// Call registerSubmission() with:
registerSubmission(
  "submission-001",           // submissionId from DB
  "0x...",                    // contributor wallet address
  "5000000000000000"          // 0.005 ETH in wei
)
```

**Expected Result:**
- Transaction succeeds
- Event emitted: `SubmissionRegistered(...)`

**Save Transaction Hash:** `0x...`

---

### Test 3: Vote & Auto-Payment ✅ 0xe2663a23ab39199f4fe65957b4f583031fc57c7601c65ff1d241e2b121b0f20b
```solidity
// Call voteApprove() with:
voteApprove("submission-001")
```

**Expected Result:**
- Transaction succeeds
- Event emitted: `VoteCast(...)`
- Event emitted: `PaymentReleased(...)` ← **This is the magic!**
- Contributor receives 0.005 ETH automatically
- Contract balance: 0.005 ETH remaining

**Save Transaction Hash:** `0x...` (CRITICAL for hackathon - shows onchain payment!)

---

## Verification on BaseScan

1. Go to: https://sepolia.basescan.org
2. Search for your contract address
3. Verify you can see:
   - ✅ Contract creation transaction
   - ✅ Deposit transaction
   - ✅ RegisterSubmission transaction
   - ✅ VoteApprove transaction (with PaymentReleased event)
   - ✅ ETH transfer to contributor

---

## Integration with Punto App

### Update Database
After deployment, update the `issues` table:

```sql
UPDATE issues
SET treasury_address = '0x...'  -- Your deployed contract address
WHERE id = 'your-issue-id';
```

### Use in API Routes

```typescript
import { 
  depositFunds, 
  registerSubmission, 
  voteApproveSubmission,
  getEscrowSummary 
} from '@/lib/escrow';

// Example: Founder deposits funds
const result = await depositFunds(
  '0x...',           // contract address
  '0.1',             // amount in ETH
  walletClient       // founder's wallet
);

// Example: Register submission when created
await registerSubmission(
  contractAddress,
  submission.id,
  submission.author_wallet_address,
  '0.005',           // bounty in ETH
  founderWalletClient
);

// Example: Vote to approve (triggers payment)
const voteResult = await voteApproveSubmission(
  contractAddress,
  submission.id,
  editorWalletClient
);

if (voteResult.paymentReleased) {
  // Update database: payment_status = 'paid'
  // Save transaction hash to payments table
}
```

---

## Troubleshooting

### Error: "Insufficient Balance"
- Make sure you have testnet ETH
- Check contract has enough deposited funds

### Error: "Only Founder"
- Verify you're calling from the founder's wallet
- Check the deployer address matches

### Error: "Already Paid"
- Submission has already been paid
- Check `submissionPaid` mapping

### Error: "Deadline Passed"
- Cannot register new submissions after deadline
- Deploy new contract for new issue

---

## Hackathon Submission Checklist

- [ ] Contract deployed to Base Sepolia
- [ ] Contract address saved
- [ ] Deposit transaction hash saved
- [ ] Register submission transaction hash saved
- [ ] Vote/payment transaction hash saved
- [ ] All transactions verified on BaseScan
- [ ] Screenshots of BaseScan showing transactions
- [ ] Contract address added to README
- [ ] Transaction hashes documented in submission

---

## Example Deployment (For Reference)

```
Contract Address: 0x1234567890123456789012345678901234567890
Deployer: doublescoop.base.eth (0xabcd...)
Network: Base Sepolia (84532)
Block: 12345678

Transactions:
1. Deploy: 0xdeploy...
2. Deposit 0.01 ETH: 0xdeposit...
3. Register Submission: 0xregister...
4. Vote & Pay: 0xvote... (includes PaymentReleased event)

BaseScan: https://sepolia.basescan.org/address/0x1234...
```

---

## Next Steps

1. Deploy contract using Remix
2. Run all 3 test transactions
3. Document transaction hashes
4. Take screenshots of BaseScan
5. Update README with deployment info
6. Record demo video showing the transactions

