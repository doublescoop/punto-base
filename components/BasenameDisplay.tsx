/**
 * Component for displaying user names with Basename resolution
 * Falls back gracefully to shortened addresses
 */

"use client";

import { useBasename } from '@/lib/hooks/useBasename';
import { isBasename } from '@/lib/basenames';

interface BasenameDisplayProps {
  address: string;
  fallbackName?: string;
  showAddress?: boolean;
  className?: string;
}

/**
 * Displays a resolved Basename or fallback name for a wallet address
 */
export function BasenameDisplay({ 
  address, 
  fallbackName, 
  showAddress = false, 
  className = "" 
}: BasenameDisplayProps) {
  const { basename, isLoading, isBasenameFormat } = useBasename(address);

  if (isLoading) {
    return (
      <span className={`animate-pulse ${className}`}>
        Loading...
      </span>
    );
  }

  const displayName = basename || fallbackName || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <span className={className} title={showAddress ? address : undefined}>
      {displayName}
      {isBasenameFormat && (
        <span className="ml-1 text-xs text-blue-500" title="Base Name">
          ✓
        </span>
      )}
    </span>
  );
}

interface BasenameWithAddressProps {
  address: string;
  fallbackName?: string;
  className?: string;
}

/**
 * Displays Basename with address below (useful for detailed views)
 */
export function BasenameWithAddress({ 
  address, 
  fallbackName, 
  className = "" 
}: BasenameWithAddressProps) {
  const { basename, isLoading, isBasenameFormat } = useBasename(address);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse">Loading...</div>
        <div className="text-xs text-muted-foreground">{address}</div>
      </div>
    );
  }

  const displayName = basename || fallbackName || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {displayName}
        {isBasenameFormat && (
          <span className="text-xs text-blue-500" title="Base Name">
            ✓
          </span>
        )}
      </div>
      <div className="text-xs text-muted-foreground font-mono">
        {address}
      </div>
    </div>
  );
}