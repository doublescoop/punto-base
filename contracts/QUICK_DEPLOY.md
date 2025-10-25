# 🚀 Quick Deploy Checklist (5 Minutes)

## Before You Start
- [x] Have Base Sepolia testnet ETH (get from https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [x] Wallet connected: `doublescoop.base.eth`
- [x] Have magazine ID and issue ID from database

---

## Step 1: Deploy Contract (2 min)

1. Open https://remix.ethereum.org
2. Create file: `MagazineEscrow.sol`
3. Copy from: `contracts/MagazineEscrow.sol`
4. Compile with Solidity 0.8.20+
5. Deploy with:
   ```
   _magazineId: "your-magazine-id"
   _issueId: "your-issue-id"
   _deadline: 1735689600  (7 days from now)
   _minVotesRequired: 1
   ```
6. **SAVE CONTRACT ADDRESS:** `0x...`
### 0xd9145CCE52D386f254917e481eB44e9943F39138 


---

## Step 2: Test Transactions (3 min)

### Transaction 1: Deposit
```solidity
deposit()
VALUE: 0.01 ETH
```
**SAVE TX HASH:** `0x...`

### Transaction 2: Register Submission
```solidity
registerSubmission(
  "test-submission-001",
  "0xYourTestWalletAddress",
  "5000000000000000"  // 0.005 ETH
)
```
**SAVE TX HASH:** `0x...`

### Transaction 3: Vote & Auto-Pay
```solidity
voteApprove("test-submission-001")
```
**SAVE TX HASH:** `0x...`

✨ **Check:** Contributor received 0.005 ETH automatically!

---

## Step 3: Document Everything

Update `contracts/deployments/your-issue-id.json`:
```json
{
  "contractAddress": "0x...",
  "transactionHashes": {
    "deploy": "0x...",
    "deposit": "0x...",
    "register": "0x...",
    "vote": "0x..."
  }
}
```

Update `README.md`:
- Contract address
- Transaction hashes
- BaseScan links

---

## Step 4: Verify on BaseScan

Visit: https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS

Check:
- [ ] Contract exists
- [ ] Deposit transaction visible
- [ ] Register transaction visible
- [ ] Vote transaction visible
- [ ] PaymentReleased event emitted
- [ ] ETH transfer to contributor

---

## Step 5: Screenshots

Take screenshots of:
1. Remix deployment success
2. BaseScan contract page
3. BaseScan transaction list
4. PaymentReleased event
5. Contributor wallet balance change

---

## Done! 🎉

You now have:
- ✅ Deployed smart contract
- ✅ 3+ testnet transactions
- ✅ Proof of onchain payment
- ✅ All transaction hashes documented

**Next:** Record demo video showing these transactions!

---

## Example Values (For Reference)

```
Contract: 0x1234567890123456789012345678901234567890
Deployer: doublescoop.base.eth
Network: Base Sepolia (84532)

Transactions:
- Deploy: 0xabcd1234...
- Deposit: 0xefgh5678...
- Register: 0xijkl9012...
- Vote: 0xmnop3456...

BaseScan: https://sepolia.basescan.org/address/0x1234...
```

