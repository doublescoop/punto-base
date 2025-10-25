/**
 * Test component to demonstrate Basenames functionality
 * Can be added to any page to test the integration
 */

"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { BasenameDisplay } from './BasenameDisplay';
import { useBasename } from '../lib/hooks/useBasename';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function BasenameTest() {
  const { address } = useAccount();
  const { basename, isLoading, refresh } = useBasename(address);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/users/refresh-basename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
      
      const data = await response.json();
      if (data.success) {
        refresh();
        if (data.updated) {
          toast.success(`Updated: ${data.user.display_name}`);
        } else {
          toast.info('No changes detected');
        }
      } else {
        toast.error(data.error || 'Failed to refresh');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!address) {
    return (
      <div className="p-4 border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">Connect wallet to test Basenames</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-medium">Basenames Test</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Address:</span>
          <code className="text-xs">{address}</code>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Resolved Name:</span>
          {isLoading ? (
            <span className="text-sm animate-pulse">Loading...</span>
          ) : (
            <BasenameDisplay address={address} className="text-sm font-medium" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hook Result:</span>
          <span className="text-sm">{basename || 'None'}</span>
        </div>
      </div>

      <button
        onClick={handleRefresh}
        disabled={isRefreshing || isLoading}
        className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-muted/50 disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}