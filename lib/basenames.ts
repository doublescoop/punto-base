/**
 * Basenames utilities for resolving wallet addresses to human-readable names
 * Uses OnchainKit's getName utility with Base chain configuration
 */

import { getName } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

/**
 * Resolves a wallet address to a Basename or fallback display name
 * @param address - Ethereum wallet address
 * @returns Promise<string> - Basename (e.g., "user.base.eth") or shortened address (e.g., "0x123...5678")
 */
export async function resolveBasename(address: string): Promise<string> {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid wallet address format');
  }

  try {
    // Try to get Basename on Base chain first
    const name = await getName({ 
      address: address as `0x${string}`, 
      chain: base 
    });

    // If a name is found and it's a Basename (ends with .base.eth or .basetest.eth)
    if (name && (name.endsWith('.base.eth') || name.endsWith('.basetest.eth'))) {
      return name;
    }

    // Fallback to shortened address format
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  } catch (error) {
    console.warn('Failed to resolve basename for address:', address, error);
    // Return shortened address as fallback
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

/**
 * Checks if a given name is a valid Basename format
 * @param name - Name to check
 * @returns boolean - True if it's a Basename format
 */
export function isBasename(name: string): boolean {
  return name.endsWith('.base.eth') || name.endsWith('.basetest.eth');
}

/**
 * Extracts the username part from a Basename
 * @param basename - Full basename (e.g., "user.base.eth")
 * @returns string - Username part (e.g., "user")
 */
export function getBasenameUsername(basename: string): string {
  if (isBasename(basename)) {
    return basename.split('.')[0];
  }
  return basename;
}

/**
 * Resolves multiple addresses to their Basenames in parallel
 * @param addresses - Array of wallet addresses
 * @returns Promise<Record<string, string>> - Map of address to resolved name
 */
export async function resolveMultipleBasenames(addresses: string[]): Promise<Record<string, string>> {
  const results = await Promise.allSettled(
    addresses.map(async (address) => ({
      address,
      name: await resolveBasename(address)
    }))
  );

  const resolved: Record<string, string> = {};
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      resolved[result.value.address] = result.value.name;
    }
  });

  return resolved;
}