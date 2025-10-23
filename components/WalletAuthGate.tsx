"use client";

import { ReactNode } from "react";
import { useAccount } from "wagmi";
import { Wallet } from "@coinbase/onchainkit/wallet";

interface WalletAuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireConnection?: boolean;
  message?: string;
}

interface ConnectWalletPromptProps {
  message?: string;
  description?: string;
}

export function ConnectWalletPrompt({ 
  message = "Connect Your Wallet",
  description = "Connect your wallet to continue with magazine creation."
}: ConnectWalletPromptProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border border-border/50 text-center space-y-6">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">🔗</span>
        </div>
        <div className="space-y-2">
          <h3 className="font-mono text-xl text-foreground">{message}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Wallet />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>✅ Secure wallet connection via OnchainKit</p>
        <p>✅ Your wallet = your magazine identity</p>
        <p>✅ We&apos;ll generate a separate treasury for your magazine</p>
      </div>
    </div>
  );
}

export function WalletAuthGate({ 
  children, 
  fallback, 
  requireConnection = true,
  message 
}: WalletAuthGateProps) {
  const { isConnected } = useAccount();
  
  if (requireConnection && !isConnected) {
    return fallback || <ConnectWalletPrompt message={message} />;
  }
  
  return <>{children}</>;
}