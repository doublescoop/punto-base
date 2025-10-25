/**
 * React hook for resolving wallet addresses to Basenames
 * Uses OnchainKit's getName with Base chain configuration
 */

import { useState, useEffect } from 'react';
import { resolveBasename, isBasename } from '@/lib/basenames';

interface UseBasenameResult {
  basename: string | null;
  isLoading: boolean;
  error: string | null;
  isBasenameFormat: boolean;
  refresh: () => void;
}

/**
 * Hook to resolve a wallet address to its Basename
 * @param address - Wallet address to resolve
 * @param enabled - Whether to auto-resolve (default: true)
 * @returns UseBasenameResult
 */
export function useBasename(address: string | undefined, enabled: boolean = true): UseBasenameResult {
  const [basename, setBasename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveAddress = async () => {
    if (!address || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const resolved = await resolveBasename(address);
      setBasename(resolved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve basename');
      setBasename(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resolveAddress();
  }, [address, enabled]);

  const refresh = () => {
    resolveAddress();
  };

  return {
    basename,
    isLoading,
    error,
    isBasenameFormat: basename ? isBasename(basename) : false,
    refresh,
  };
}

/**
 * Hook for multiple address resolution
 * @param addresses - Array of wallet addresses
 * @param enabled - Whether to auto-resolve (default: true)
 */
export function useMultipleBasenames(addresses: string[], enabled: boolean = true) {
  const [basenames, setBasenames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveAddresses = async () => {
    if (!addresses.length || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const resolved = await Promise.allSettled(
        addresses.map(async (addr) => ({
          address: addr,
          basename: await resolveBasename(addr)
        }))
      );

      const results: Record<string, string> = {};
      resolved.forEach((result) => {
        if (result.status === 'fulfilled') {
          results[result.value.address] = result.value.basename;
        }
      });

      setBasenames(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve basenames');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resolveAddresses();
  }, [addresses.join(','), enabled]);

  return {
    basenames,
    isLoading,
    error,
    refresh: resolveAddresses,
  };
}