import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/database.types';

type Magazine = Database['public']['Tables']['magazines']['Row'];

interface MagazineWithStats extends Magazine {
  issues: Array<{
    id: string;
    issue_number: number;
    title: string | null;
    status: string;
    published_at: string | null;
    submission_count: number;
    accepted_count: number;
    pending_payment_amount: number;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const walletAddress = address;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Step 1: Get user ID from wallet address
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', normalizedAddress)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }

    // Step 2: Get magazines founded by this user
    const { data: magazines, error: magazinesError } = await supabaseAdmin
      .from('magazines')
      .select('*')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false });

    if (magazinesError) {
      console.error('Error fetching magazines:', magazinesError);
      return NextResponse.json(
        { success: false, error: magazinesError.message },
        { status: 500 }
      );
    }

    // Step 3: For each magazine, get issues with stats
    const magazinesWithStats: MagazineWithStats[] = await Promise.all(
      magazines.map(async (magazine) => {
        // Get all issues for this magazine
        const { data: issues, error: issuesError } = await supabaseAdmin
          .from('issues')
          .select('*')
          .eq('magazine_id', magazine.id)
          .order('issue_number', { ascending: false });

        if (issuesError) {
          console.error('Error fetching issues:', issuesError);
          return { ...magazine, issues: [] };
        }

        // For each issue, get submission stats and payment totals
        const issuesWithStats = await Promise.all(
          issues.map(async (issue) => {
            // Get submission counts
            const { count: totalSubmissions } = await supabaseAdmin
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .eq('issue_id', issue.id);

            const { count: acceptedSubmissions } = await supabaseAdmin
              .from('submissions')
              .select('*', { count: 'exact', head: true })
              .eq('issue_id', issue.id)
              .eq('status', 'ACCEPTED');

            // Get pending payment amount
            const { data: pendingPayments } = await supabaseAdmin
              .from('payments')
              .select('amount')
              .eq('issue_id', issue.id)
              .eq('status', 'PENDING');

            const pendingAmount = pendingPayments?.reduce(
              (sum, payment) => sum + payment.amount,
              0
            ) || 0;

            return {
              id: issue.id,
              issue_number: issue.issue_number,
              title: issue.title,
              status: issue.status,
              published_at: issue.published_at,
              submission_count: totalSubmissions || 0,
              accepted_count: acceptedSubmissions || 0,
              pending_payment_amount: pendingAmount,
            };
          })
        );

        return {
          ...magazine,
          issues: issuesWithStats,
        };
      })
    );

    return NextResponse.json({
      success: true,
      magazines: magazinesWithStats,
    });
  } catch (error) {
    console.error('Unexpected error in get magazines API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}

