# Smart Contracts

This directory contains the smart contracts for Punto's trustless payment system.

## 📁 Files

- **`MagazineEscrow.sol`** - Main escrow contract for magazine issue payments
- **`deploy.ts`** - Deployment script (TypeScript)
- **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment instructions
- **`QUICK_DEPLOY.md`** - 5-minute quick start guide
- **`deployments/`** - Deployment records (created after deployment)

## 🎯 MagazineEscrow Contract

### Purpose
Holds bounty funds for a magazine issue and automatically releases payments when submissions are approved by editors.

### Key Features
- ✅ Founder deposits funds
- ✅ Editors vote on submissions (1 vote for MVP)
- ✅ **Automatic payment release** when threshold reached
- ✅ Founder can withdraw unused funds after deadline
- ✅ Transparent onchain voting
- ✅ Integrates with database schema

### Contract Functions

#### Write Functions (Require Transaction)
```solidity
// Deposit funds into escrow
deposit() payable

// Register a submission for payment
registerSubmission(
    string submissionId,
    address recipient,
    uint256 bounty
)

// Vote to approve submission (triggers payment if threshold reached)
voteApprove(string submissionId)

// Withdraw unused funds after deadline
withdrawUnused()

// Add/remove editors
addEditor(address editor)
removeEditor(address editor)
```

#### Read Functions (Free)
```solidity
// Get contract summary
getContractSummary() returns (
    address founder,
    uint256 totalDeposited,
    uint256 totalPaidOut,
    uint256 availableBalance,
    uint256 deadline,
    uint256 editorCount,
    uint256 minVotesRequired
)

// Get submission details
getSubmissionDetails(string submissionId) returns (
    address recipient,
    uint256 bounty,
    uint256 votes,
    bool paid
)

// Check if submission is paid
isSubmissionPaid(string submissionId) returns (bool)

// Get vote count
getVoteCount(string submissionId) returns (uint256)
```

### Events
```solidity
event FundsDeposited(address indexed depositor, uint256 amount, uint256 newTotal)
event SubmissionRegistered(string indexed submissionId, address indexed recipient, uint256 bounty)
event VoteCast(string indexed submissionId, address indexed editor, uint256 newVoteCount)
event PaymentReleased(string indexed submissionId, address indexed recipient, uint256 amount)
event FundsWithdrawn(address indexed founder, uint256 amount)
event EditorAdded(address indexed editor)
event EditorRemoved(address indexed editor)
```

## 🚀 Quick Deploy

### Prerequisites
1. Base Sepolia testnet ETH
2. Wallet (e.g., doublescoop.base.eth)
3. Magazine ID and Issue ID from database

### Deploy Steps
1. Open https://remix.ethereum.org
2. Create `MagazineEscrow.sol` file
3. Paste contract code
4. Compile with Solidity 0.8.20+
5. Deploy with constructor args:
   - `_magazineId`: Your magazine ID
   - `_issueId`: Your issue ID
   - `_deadline`: Unix timestamp
   - `_minVotesRequired`: 1 (for solo founder)
6. Save contract address

**Full guide:** See `DEPLOYMENT_GUIDE.md`  
**Quick guide:** See `QUICK_DEPLOY.md`

## 🧪 Testing

### Test Flow
1. **Deposit:** Call `deposit()` with 0.01 ETH
2. **Register:** Call `registerSubmission()` with test data
3. **Vote:** Call `voteApprove()` - payment auto-releases!
4. **Verify:** Check BaseScan for PaymentReleased event

### Example Test Data
```solidity
// Register submission
registerSubmission(
    "test-submission-001",
    "0xRecipientAddress",
    "5000000000000000"  // 0.005 ETH
)

// Vote to approve
voteApprove("test-submission-001")
// → Payment automatically released!
```

## 🔗 Integration

### TypeScript Utilities
Use the utilities in `lib/escrow.ts`:

```typescript
import { 
    depositFunds, 
    registerSubmission, 
    voteApproveSubmission,
    getEscrowSummary 
} from '@/lib/escrow';

// Deposit funds
await depositFunds(
    contractAddress,
    '0.1',  // ETH amount
    walletClient
);

// Register submission
await registerSubmission(
    contractAddress,
    submissionId,
    recipientAddress,
    '0.005',  // Bounty in ETH
    founderWalletClient
);

// Vote to approve (triggers payment)
const result = await voteApproveSubmission(
    contractAddress,
    submissionId,
    editorWalletClient
);

if (result.paymentReleased) {
    console.log('Payment released automatically!');
}
```

## 📊 Database Integration

The contract integrates with these database tables:

### `issues` table
```typescript
{
    id: string;                    // Maps to issueId in contract
    magazine_id: string;           // Maps to magazineId in contract
    treasury_address: string;      // Set to deployed contract address
    deadline: string;              // Maps to deadline in contract
    required_funding: number;      // Total bounties needed
}
```

### `submissions` table
```typescript
{
    id: string;                    // Maps to submissionId in contract
    author_id: string;             // Maps to recipient in contract
    bounty_amount: number;         // Maps to bounty in contract
    payment_status: string;        // Update when payment released
}
```

### `payments` table
```typescript
{
    submission_id: string;         // Links to submission
    recipient_id: string;          // Contributor who received payment
    amount: number;                // Payment amount
    transaction_hash: string;      // Transaction hash from contract
    status: string;                // 'paid' when released
}
```

## 🔒 Security Considerations

### Access Control
- Only founder can deposit funds
- Only founder can register submissions
- Only editors can vote
- Only founder can withdraw after deadline

### Safety Features
- Deadline enforcement
- Duplicate payment prevention
- Duplicate vote prevention
- Balance checks before payment
- Reentrancy protection (via checks-effects-interactions pattern)

### Auditing
⚠️ **Note:** This contract is for hackathon/testnet use. Before mainnet deployment:
- Get professional security audit
- Add emergency pause functionality
- Implement timelock for critical functions
- Add comprehensive test suite

## 📝 Gas Estimates

Approximate gas costs on Base Sepolia:

| Function | Gas Used | Cost (at 0.1 gwei) |
|----------|----------|-------------------|
| Deploy | ~2,000,000 | ~$0.01 |
| deposit() | ~50,000 | ~$0.0025 |
| registerSubmission() | ~100,000 | ~$0.005 |
| voteApprove() | ~150,000 | ~$0.0075 |
| withdrawUnused() | ~50,000 | ~$0.0025 |

*Actual costs may vary based on network congestion*

## 🐛 Troubleshooting

### Common Errors

**"OnlyFounder"**
- You're not calling from the founder's wallet
- Check deployer address matches

**"InsufficientBalance"**
- Contract doesn't have enough funds
- Call `deposit()` first

**"AlreadyPaid"**
- Submission has already been paid
- Check `isSubmissionPaid()`

**"DeadlinePassed"**
- Cannot register new submissions after deadline
- Deploy new contract for new issue

**"AlreadyVoted"**
- Editor has already voted on this submission
- Each editor can only vote once per submission

## 📚 Additional Resources

- **Base Docs:** https://docs.base.org
- **Solidity Docs:** https://docs.soliditylang.org
- **Remix IDE:** https://remix.ethereum.org
- **BaseScan:** https://sepolia.basescan.org

## 🤝 Contributing

Improvements welcome! Consider:
- Gas optimizations
- Additional safety checks
- Enhanced voting mechanisms
- Multi-signature support
- Upgrade patterns

## 📄 License

MIT License - see LICENSE file

