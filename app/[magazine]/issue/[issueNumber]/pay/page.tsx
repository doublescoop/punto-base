"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { encodeFunctionData, parseUnits, type Hex } from "viem";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";

// USDC contract on Base
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// USDC ABI (transfer function)
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
  amount: number; // in cents
  recipient_id: string;
  recipient_name: string;
  recipient_wallet: string;
  submission_id: string | null;
  submission_title: string;
}

export default function PayWinnersPage() {
  const router = useRouter();
  const params = useParams();
  const { address } = useAccount();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [issueId, setIssueId] = useState<string | null>(null);
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);

  // Fetch issue ID
  useEffect(() => {
    const fetchIssueId = async () => {
      try {
        const res = await fetch(`/api/magazines/${params.magazine}/issues/${params.issueNumber}`);
        const data = await res.json();
        if (data.success) {
          setIssueId(data.issue.id);
        }
      } catch (error) {
        console.error('Failed to fetch issue:', error);
      }
    };

    if (params.magazine && params.issueNumber) {
      fetchIssueId();
    }
  }, [params.magazine, params.issueNumber]);

  // Fetch pending payments
  useEffect(() => {
    const fetchPayments = async () => {
      if (!issueId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/payments/pending?issueId=${issueId}`);
        const data = await res.json();
        if (data.success) {
          setPayments(data.payments);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [issueId]);

  // Handle transaction success
  const handleOnStatus = useCallback(async (status: LifecycleStatus) => {
    console.log('Transaction status:', status);

    if (status.statusName === 'success') {
      const transactionReceipts = status.statusData.transactionReceipts;
      const firstReceipt = transactionReceipts[0];

      try {
        // Update payment record
        await fetch('/api/payments/batch-payout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIds: [payments[currentPaymentIndex].id],
            transactionHash: firstReceipt.transactionHash,
            blockNumber: Number(firstReceipt.blockNumber),
          }),
        });

        // Move to next payment
        setCurrentPaymentIndex(prev => prev + 1);
      } catch (error) {
        console.error('Failed to update payment record:', error);
      }
    }
  }, [payments, currentPaymentIndex]);

  const currentPayment = payments[currentPaymentIndex];
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments.slice(0, currentPaymentIndex).reduce((sum, p) => sum + p.amount, 0);

  // Prepare transaction calls for current payment
  const calls = currentPayment ? [
    {
      to: USDC_ADDRESS_BASE,
      data: encodeFunctionData({
        abi: USDC_ABI,
        functionName: "transfer",
        args: [
          currentPayment.recipient_wallet as Hex,
          parseUnits((currentPayment.amount / 100).toString(), 6),
        ],
      }),
      value: BigInt(0),
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <button
            onClick={() => router.push('/profile?tab=founder')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magazines
          </button>

          <div className="space-y-2">
            <div className="bg-accent text-accent-foreground px-3 py-1 font-mono text-sm font-light inline-block">
              Pay Winners
            </div>
            <h1 className="font-display text-3xl font-bold">
              {params.magazine} • Issue #{params.issueNumber}
            </h1>
          </div>
        </div>
      </div>

      {/* Payment Content */}
      <main className="container mx-auto px-6 lg:px-12 py-12">
        {isLoading ? (
          <div className="bg-muted/30 backdrop-blur-sm p-12 text-center rounded-lg">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-12 text-center rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="font-mono text-2xl mb-2">All Paid!</h2>
            <p className="text-muted-foreground mb-6">
              No pending payments for this issue.
            </p>
            <button
              onClick={() => router.push('/profile?tab=founder')}
              className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        ) : currentPaymentIndex >= payments.length ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-12 text-center rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h2 className="font-mono text-2xl mb-2">All Done!</h2>
            <p className="text-muted-foreground mb-6">
              Successfully paid {payments.length} contributor{payments.length !== 1 ? 's' : ''}.
            </p>
            <button
              onClick={() => router.push('/profile?tab=founder')}
              className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Progress */}
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-lg">Payment Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {currentPaymentIndex} of {payments.length} paid
                </span>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 mb-4">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentPaymentIndex / payments.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono">${(paidAmount / 100).toFixed(2)} USDC</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-mono">${((totalAmount - paidAmount) / 100).toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Current Payment */}
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg border-2 border-accent">
              <h3 className="font-mono text-sm text-muted-foreground mb-2">Next Payment</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xl mb-1">{currentPayment.recipient_name}</p>
                    <p className="text-sm text-muted-foreground">{currentPayment.submission_title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {currentPayment.recipient_wallet.slice(0, 6)}...{currentPayment.recipient_wallet.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-3xl text-accent">${(currentPayment.amount / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">USDC on Base</p>
                  </div>
                </div>

                {/* Transaction Component */}
                {address ? (
                  <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                    <Transaction
                      chainId={base.id}
                      calls={calls}
                      onStatus={handleOnStatus}
                    >
                      {/* @ts-expect-error - OnchainKit type issue with React 19 */}
                      <TransactionButton text="Pay This Winner" />
                      <TransactionStatus>
                        {/* @ts-expect-error - OnchainKit type issue with React 19 */}
                        <TransactionStatusLabel />
                        {/* @ts-expect-error - OnchainKit type issue with React 19 */}
                        <TransactionStatusAction />
                      </TransactionStatus>
                    </Transaction>
                  </Suspense>
                ) : (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg text-center">
                    <p className="text-sm text-orange-800 dark:text-orange-400">
                      Please connect your wallet to process payments
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ Make sure you have at least ${(currentPayment.amount / 100).toFixed(2)} USDC in your wallet
                </p>
              </div>
            </div>

            {/* Queue */}
            {payments.slice(currentPaymentIndex + 1).length > 0 && (
              <div className="bg-muted/30 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-sm text-muted-foreground mb-4">
                  Next in Queue ({payments.slice(currentPaymentIndex + 1).length})
                </h3>
                <div className="space-y-2">
                  {payments.slice(currentPaymentIndex + 1, currentPaymentIndex + 4).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[200px]">
                        {payment.recipient_name} • {payment.submission_title}
                      </span>
                      <span className="font-mono">${(payment.amount / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  {payments.slice(currentPaymentIndex + 1).length > 3 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      + {payments.slice(currentPaymentIndex + 4).length} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

