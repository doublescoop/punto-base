/**
 * GET /api/payments/pending?issueId=xxx
 * 
 * Gets all pending payments for an issue (accepted submissions that haven't been paid)
 * 
 * Query params:
 * - issueId: string
 * 
 * Response:
 * {
 *   success: boolean;
 *   payments: Array<{
 *     id: string;
 *     recipient_id: string;
 *     recipient_wallet: string;
 *     amount: number;
 *     submission_id: string;
 *     submission_title: string;
 *   }>;
 *   totalAmount: number;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issueId');

    if (!issueId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing issueId parameter',
        },
        { status: 400 }
      );
    }

    // Get all pending payments with submission and user data
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        amount,
        currency,
        recipient_id,
        submission_id,
        users!payments_recipient_id_fkey (
          wallet_address,
          display_name
        ),
        submissions!payments_submission_id_fkey (
          title
        )
      `)
      .eq('issue_id', issueId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch pending payments:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Transform to response format
    const formattedPayments = payments.map((p) => ({
      id: p.id,
      recipient_id: p.recipient_id,
      recipient_wallet: Array.isArray(p.users) ? p.users[0]?.wallet_address : p.users?.wallet_address || '',
      recipient_name: Array.isArray(p.users) ? p.users[0]?.display_name : p.users?.display_name || 'Unknown',
      amount: p.amount,
      currency: p.currency,
      submission_id: p.submission_id || '',
      submission_title: Array.isArray(p.submissions) ? p.submissions[0]?.title : p.submissions?.title || 'Untitled',
    }));

    const totalAmount = formattedPayments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      totalAmount,
      count: formattedPayments.length,
    });

  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

