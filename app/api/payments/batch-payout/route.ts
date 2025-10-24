/**
 * POST /api/payments/batch-payout
 * 
 * Marks multiple payments as paid after on-chain transaction
 * 
 * Request body:
 * {
 *   paymentIds: string[]; // Array of payment IDs
 *   transactionHash: string; // On-chain transaction hash
 *   blockNumber: number; // Block number
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   paymentsUpdated: number;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/database.types';

export const runtime = 'edge';

type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

interface BatchPayoutRequest {
  paymentIds: string[];
  transactionHash: string;
  blockNumber: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchPayoutRequest = await request.json();

    // Validate required fields
    if (!body.paymentIds || body.paymentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing paymentIds',
        },
        { status: 400 }
      );
    }

    if (!body.transactionHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing transactionHash',
        },
        { status: 400 }
      );
    }

    if (!body.blockNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing blockNumber',
        },
        { status: 400 }
      );
    }

    // Update all payments
    const updateData: PaymentUpdate = {
      status: 'COMPLETED',
      paid_at: new Date().toISOString(),
      transaction_hash: body.transactionHash,
      block_number: body.blockNumber,
    };

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update(updateData)
      .in('id', body.paymentIds)
      .select();

    if (error) {
      console.error('Failed to update payments:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Also update corresponding submissions
    const { error: submissionError } = await supabaseAdmin
      .from('submissions')
      .update({
        payment_status: 'COMPLETED',
        paid_at: new Date().toISOString(),
        transaction_hash: body.transactionHash,
      })
      .in(
        'id',
        data
          .map((p) => p.submission_id)
          .filter((id): id is string => id !== null)
      );

    if (submissionError) {
      console.error('Failed to update submissions:', submissionError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      paymentsUpdated: data.length,
    });

  } catch (error) {
    console.error('Error in batch payout:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

