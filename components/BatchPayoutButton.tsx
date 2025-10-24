"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { parseUnits } from "viem";

// USDC contract on Base
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const;

interface Payment {
  id: string;
  recipient_wallet: string;
  recipient_name: string;
  amount: number; // USDC cents
  submission_title: string;
}

interface BatchPayoutButtonProps {
  issueId: string;
  className?: string;
}

export function BatchPayoutButton({ issueId, className }: BatchPayoutButtonProps) {
  const { address } = useAccount();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Fetch pending payments
  useEffect(() => {
    async function fetchPayments() {
      try {
        const response = await fetch(`/api/payments/pending?issueId=${issueId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch payments");
        }

        setPayments(data.payments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    }

    if (issueId) {
      fetchPayments();
    }
  }, [issueId]);

  // Handle payment execution
  const handlePay = () => {
    if (payments.length === 0 || !address) return;

    setIsPaying(true);
    const firstPayment = payments[0];

    writeContract({
      address: USDC_ADDRESS_BASE,
      abi: USDC_ABI,
      functionName: "transfer",
      args: [
        firstPayment.recipient_wallet as `0x${string}`,
        parseUnits((firstPayment.amount / 100).toString(), 6),
      ],
      chain: base,
      account: address,
    });
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      (async () => {
        try {
          // Update payment record
          await fetch("/api/payments/batch-payout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentIds: [payments[0].id],
              transactionHash: hash,
              blockNumber: 0, // TODO: Get actual block number
            }),
          });

          // Refresh payments list
          setPayments((prev) => prev.slice(1));
          setIsPaying(false);
        } catch (err) {
          console.error("Failed to update payment record:", err);
          setIsPaying(false);
        }
      })();
    }
  }, [isSuccess, hash, payments]);

  if (loading) {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className={className}>
        <div className="text-sm text-muted-foreground">✅ No pending payments</div>
      </div>
    );
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const nextPayment = payments[0];

  return (
    <div className={className}>
      {/* Payment Summary */}
      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-mono text-sm font-semibold mb-2">
          Pending Payments ({payments.length})
        </h3>
        <div className="space-y-1 text-xs">
          {payments.map((payment, index) => (
            <div key={payment.id} className="flex justify-between">
              <span className="text-muted-foreground truncate max-w-[200px]">
                {index === 0 && "▶️ "}
                {payment.recipient_name} • {payment.submission_title}
              </span>
              <span className="font-mono">${(payment.amount / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-border flex justify-between font-mono text-sm font-semibold">
          <span>Total:</span>
          <span>${(totalAmount / 100).toFixed(2)} USDC</span>
        </div>
      </div>

      {/* Payment Status */}
      {isConfirming && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
          ⏳ Confirming transaction...
        </div>
      )}

      {isSuccess && (
        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
          ✅ Payment successful! Hash: {hash?.slice(0, 10)}...
        </div>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm">
          ❌ {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={isPending || isConfirming || isPaying || !address}
        className="w-full px-4 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isPending || isConfirming
          ? "Processing..."
          : `Pay ${nextPayment.recipient_name} $${(nextPayment.amount / 100).toFixed(2)} USDC`}
      </button>

      {/* Warning */}
      <p className="mt-2 text-xs text-muted-foreground">
        ⚠️ Paying one at a time for MVP. Need at least ${(nextPayment.amount / 100).toFixed(2)} USDC
      </p>
    </div>
  );
}

