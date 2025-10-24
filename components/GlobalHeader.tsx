"use client";

import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import Link from "next/link";
import { useEffect } from "react";

export function GlobalHeader() {
  const { address, isConnected } = useAccount();

  // Auto-create user when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      // Call API to ensure user exists
      fetch("/api/users/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      }).catch(console.error);
    }
  }, [address, isConnected]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 pl-6 flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <span className="font-display font-bold text-xl">PUNTO</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/opencalls"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Open Calls
            </Link>
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Create Magazine
            </Link>
            {isConnected && (
              <Link
                href="/profile"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                My Page
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Wallet>
            <ConnectWallet>
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>
    </header>
  );
}

