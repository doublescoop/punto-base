import { useState, useEffect, useCallback } from "react";

interface SessionTokenData {
  sessionToken: string;
  expiresAt: string;
  success: boolean;
}

interface UseSessionTokenReturn {
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
  refreshToken: (userAddress?: string) => Promise<void>;
}

/**
 * Custom hook to manage OnchainKit session tokens
 * Automatically refreshes tokens before expiration
 */
export function useSessionToken(userAddress?: string): UseSessionTokenReturn {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const fetchToken = useCallback(async (userAddress?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = userAddress 
        ? `/api/auth/session-token?address=${encodeURIComponent(userAddress)}`
        : '/api/auth/session-token';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch session token');
      }
      
      const data: SessionTokenData = await response.json();
      
      if (data.success) {
        setSessionToken(data.sessionToken);
        setExpiresAt(new Date(data.expiresAt));
      } else {
        throw new Error('Session token generation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Session token fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (address?: string) => {
    await fetchToken(address || userAddress);
  }, [fetchToken, userAddress]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!expiresAt) return;

    const refreshBuffer = 30 * 1000; // Refresh 30 seconds before expiration
    const timeUntilRefresh = expiresAt.getTime() - Date.now() - refreshBuffer;
    
    if (timeUntilRefresh > 0) {
      const timeout = setTimeout(() => {
        refreshToken();
      }, timeUntilRefresh);
      
      return () => clearTimeout(timeout);
    } else {
      // Token is already expired or about to expire, refresh immediately
      refreshToken();
    }
  }, [expiresAt, refreshToken]);

  // Initial token fetch
  useEffect(() => {
    fetchToken(userAddress);
  }, [fetchToken, userAddress]);

  return {
    sessionToken,
    isLoading,
    error,
    refreshToken
  };
}