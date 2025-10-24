import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/database.types';

type Submission = Database['public']['Tables']['submissions']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface SubmissionWithAuthor extends Submission {
  users: Pick<User, 'id' | 'wallet_address' | 'display_name' | 'avatar'>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ issueId: string }> }
) {
  try {
    const { issueId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter

    let query = supabaseAdmin
      .from('submissions')
      .select(`
        *,
        users!submissions_author_id_fkey (id, wallet_address, display_name, avatar)
      `)
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query.returns<SubmissionWithAuthor[]>();

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error) {
    console.error('Unexpected error in get submissions API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}

