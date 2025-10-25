/**
 * MagazineEscrow Integration Utilities
 * 
 * Provides TypeScript utilities to interact with deployed MagazineEscrow contracts
 * Integrates with existing database schema (issues, submissions, payments tables)
 */

import { createPublicClient, createWalletClient, http, parseEther, formatEther, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// ============ Contract ABI ============

export const MAGAZINE_ESCROW_ABI = [
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
    "inputs": [
      { "internalType": "address", "name": "editor", "type": "address" }
    ],
    "name": "addEditor",
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
  },
  {
    "inputs": [
      { "internalType": "string", "name": "submissionId", "type": "string" }
    ],
    "name": "getSubmissionDetails",
    "outputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "bounty", "type": "uint256" },
      { "internalType": "uint256", "name": "votes", "type": "uint256" },
      { "internalType": "bool", "name": "paid", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "depositor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newTotal", "type": "uint256" }
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "submissionId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "PaymentReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "string", "name": "submissionId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "editor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "newVoteCount", "type": "uint256" }
    ],
    "name": "VoteCast",
    "type": "event"
  }
] as const;

// ============ Types ============

export interface EscrowContractSummary {
  founder: Address;
  totalDeposited: bigint;
  totalPaidOut: bigint;
  availableBalance: bigint;
  deadline: bigint;
  editorCount: bigint;
  minVotesRequired: bigint;
}

export interface SubmissionDetails {
  recipient: Address;
  bounty: bigint;
  votes: bigint;
  paid: boolean;
}

// ============ Client Setup ============

const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

/**
 * Create a wallet client from a private key (server-side only)
 */
export function createEscrowWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
}

// ============ Read Functions ============

/**
 * Get contract summary (read-only)
 */
export async function getEscrowSummary(contractAddress: Address): Promise<EscrowContractSummary> {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: MAGAZINE_ESCROW_ABI,
    functionName: 'getContractSummary',
  } as any);

  return {
    founder: result[0],
    totalDeposited: result[1],
    totalPaidOut: result[2],
    availableBalance: result[3],
    deadline: result[4],
    editorCount: result[5],
    minVotesRequired: result[6],
  };
}

/**
 * Get submission details (read-only)
 */
export async function getSubmissionDetails(
  contractAddress: Address,
  submissionId: string
): Promise<SubmissionDetails> {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: MAGAZINE_ESCROW_ABI,
    functionName: 'getSubmissionDetails',
    args: [submissionId],
  } as any);

  return {
    recipient: result[0],
    bounty: result[1],
    votes: result[2],
    paid: result[3],
  };
}

// ============ Write Functions (require wallet) ============

/**
 * Deposit funds into escrow
 * @param contractAddress Escrow contract address
 * @param amountInEth Amount to deposit in ETH (e.g., "0.01")
 * @param walletClient Wallet client with signer
 */
export async function depositFunds(
  contractAddress: Address,
  amountInEth: string,
  walletClient: ReturnType<typeof createEscrowWalletClient>
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: MAGAZINE_ESCROW_ABI,
    functionName: 'deposit',
    value: parseEther(amountInEth),
  } as any);

  // Wait for transaction confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  return {
    transactionHash: hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
  };
}

/**
 * Register a submission for payment
 * @param contractAddress Escrow contract address
 * @param submissionId Submission ID from database
 * @param recipientAddress Contributor's wallet address
 * @param bountyInEth Bounty amount in ETH
 * @param walletClient Wallet client with signer (must be founder)
 */
export async function registerSubmission(
  contractAddress: Address,
  submissionId: string,
  recipientAddress: Address,
  bountyInEth: string,
  walletClient: ReturnType<typeof createEscrowWalletClient>
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: MAGAZINE_ESCROW_ABI,
    functionName: 'registerSubmission',
    args: [submissionId, recipientAddress, parseEther(bountyInEth)],
  } as any);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  return {
    transactionHash: hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
  };
}

/**
 * Vote to approve a submission (triggers payment if threshold reached)
 * @param contractAddress Escrow contract address
 * @param submissionId Submission ID from database
 * @param walletClient Wallet client with signer (must be editor)
 */
export async function voteApproveSubmission(
  contractAddress: Address,
  submissionId: string,
  walletClient: ReturnType<typeof createEscrowWalletClient>
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: MAGAZINE_ESCROW_ABI,
    functionName: 'voteApprove',
    args: [submissionId],
  } as any);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  // Check if payment was released (look for PaymentReleased event)
  const paymentReleasedEvent = receipt.logs.find(log => {
    try {
      // Simple event signature check (PaymentReleased has 3 indexed params)
      return (log as any).topics?.length === 3;
    } catch {
      return false;
    }
  });

  return {
    transactionHash: hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
    paymentReleased: !!paymentReleasedEvent,
  };
}

/**
 * Withdraw unused funds after deadline (founder only)
 * @param contractAddress Escrow contract address
 * @param walletClient Wallet client with signer (must be founder)
 */
export async function withdrawUnusedFunds(
  contractAddress: Address,
  walletClient: ReturnType<typeof createEscrowWalletClient>
) {
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: MAGAZINE_ESCROW_ABI,
    functionName: 'withdrawUnused',
  } as any);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  return {
    transactionHash: hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
  };
}

// ============ Helper Functions ============

/**
 * Format wei to ETH string
 */
export function formatWeiToEth(wei: bigint): string {
  return formatEther(wei);
}

/**
 * Parse ETH string to wei
 */
export function parseEthToWei(eth: string): bigint {
  return parseEther(eth);
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadlineTimestamp: bigint): boolean {
  return BigInt(Math.floor(Date.now() / 1000)) >= deadlineTimestamp;
}

/**
 * Get Base Sepolia block explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

/**
 * Get Base Sepolia block explorer URL for contract
 */
export function getContractExplorerUrl(contractAddress: Address): string {
  return `https://sepolia.basescan.org/address/${contractAddress}`;
}

