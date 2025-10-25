/**
 * Deployment script for MagazineEscrow contract to Base Sepolia testnet
 * 
 * Usage:
 *   bun run contracts/deploy.ts
 * 
 * Environment variables required:
 *   - PRIVATE_KEY: Deployer private key
 *   - BASE_SEPOLIA_RPC_URL: Base Sepolia RPC endpoint (default: public RPC)
 */

import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import * as fs from 'fs';
import * as path from 'path';

// ============ Configuration ============

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

if (!PRIVATE_KEY) {
  console.error('❌ Error: PRIVATE_KEY environment variable is required');
  console.log('Usage: PRIVATE_KEY=0x... bun run contracts/deploy.ts');
  process.exit(1);
}

// ============ Contract Bytecode & ABI ============
// Note: In production, compile with solc or hardhat. For hackathon speed, we'll use a pre-compiled version.

const MAGAZINE_ESCROW_BYTECODE = ''; // Will be filled after compilation
const MAGAZINE_ESCROW_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_magazineId", "type": "string" },
      { "internalType": "string", "name": "_issueId", "type": "string" },
      { "internalType": "uint256", "name": "_deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "_minVotesRequired", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "submissionId", "type": "string" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "bounty", "type": "uint256" }
    ],
    "name": "registerSubmission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "submissionId", "type": "string" }
    ],
    "name": "voteApprove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawUnused",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractSummary",
    "outputs": [
      { "internalType": "address", "name": "_founder", "type": "address" },
      { "internalType": "uint256", "name": "_totalDeposited", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalPaidOut", "type": "uint256" },
      { "internalType": "uint256", "name": "_availableBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "_deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "_editorCount", "type": "uint256" },
      { "internalType": "uint256", "name": "_minVotesRequired", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ============ Setup Clients ============

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

// ============ Deployment Function ============

interface DeploymentParams {
  magazineId: string;
  issueId: string;
  deadlineTimestamp: number; // Unix timestamp
  minVotesRequired: number; // 1 for solo founder
}

async function deployMagazineEscrow(params: DeploymentParams) {
  console.log('\n🚀 Deploying MagazineEscrow to Base Sepolia...\n');
  console.log('📋 Deployment Parameters:');
  console.log(`   Magazine ID: ${params.magazineId}`);
  console.log(`   Issue ID: ${params.issueId}`);
  console.log(`   Deadline: ${new Date(params.deadlineTimestamp * 1000).toISOString()}`);
  console.log(`   Min Votes Required: ${params.minVotesRequired}`);
  console.log(`   Deployer: ${account.address}\n`);

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Deployer Balance: ${formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error('\n❌ Error: Deployer has 0 ETH. Get testnet ETH from Base Sepolia faucet:');
    console.log('   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
    process.exit(1);
  }

  // Note: For hackathon, we'll use Remix or Foundry to compile and deploy
  // This script provides the structure for programmatic deployment
  
  console.log('\n⚠️  Manual Deployment Steps (Hackathon Fast Track):');
  console.log('\n1. Go to Remix IDE: https://remix.ethereum.org');
  console.log('2. Create new file: MagazineEscrow.sol');
  console.log('3. Paste contract code from contracts/MagazineEscrow.sol');
  console.log('4. Compile with Solidity 0.8.20+');
  console.log('5. Deploy to Base Sepolia with parameters:');
  console.log(`   - _magazineId: "${params.magazineId}"`);
  console.log(`   - _issueId: "${params.issueId}"`);
  console.log(`   - _deadline: ${params.deadlineTimestamp}`);
  console.log(`   - _minVotesRequired: ${params.minVotesRequired}`);
  console.log('\n6. Copy deployed contract address');
  console.log('7. Save to contracts/deployments.json\n');

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Create template deployment record
  const deploymentRecord = {
    network: 'base-sepolia',
    chainId: baseSepolia.id,
    contractName: 'MagazineEscrow',
    contractAddress: '0x...', // Fill in after deployment
    deployer: account.address,
    deployedAt: new Date().toISOString(),
    constructorArgs: {
      magazineId: params.magazineId,
      issueId: params.issueId,
      deadline: params.deadlineTimestamp,
      minVotesRequired: params.minVotesRequired,
    },
    transactionHash: '0x...', // Fill in after deployment
    blockNumber: 0, // Fill in after deployment
  };

  const deploymentFile = path.join(deploymentsDir, `${params.issueId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentRecord, null, 2));
  
  console.log(`✅ Deployment template saved to: ${deploymentFile}`);
  console.log('   Update with actual contract address and transaction hash after deployment\n');

  return deploymentRecord;
}

// ============ Example Usage ============

async function main() {
  // Example deployment for a test magazine issue
  const testDeployment = await deployMagazineEscrow({
    magazineId: 'test-magazine-001',
    issueId: 'test-issue-001',
    deadlineTimestamp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
    minVotesRequired: 1, // Solo founder for MVP
  });

  console.log('\n✨ Next Steps:');
  console.log('1. Deploy contract using Remix');
  console.log('2. Update contracts/deployments/test-issue-001.json with contract address');
  console.log('3. Test deposit: call deposit() with 0.01 ETH');
  console.log('4. Test submission: call registerSubmission()');
  console.log('5. Test approval: call voteApprove()');
  console.log('6. Verify payment released automatically\n');
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { deployMagazineEscrow, MAGAZINE_ESCROW_ABI };

