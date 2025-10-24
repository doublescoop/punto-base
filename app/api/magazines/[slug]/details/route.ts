/**
 * GET /api/magazines/[slug]/details
 * 
 * Gets complete magazine details with issues and topics for success page
 * 
 * Response:
 * {
 *   success: boolean;
 *   magazine?: MagazineWithDetails;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/database.types';

type Magazine = Database['public']['Tables']['magazines']['Row'];
type Issue = Database['public']['Tables']['issues']['Row'];
type Topic = Database['public']['Tables']['topics']['Row'];

interface MagazineWithDetails extends Magazine {
  issues: Array<Issue & {
    topics: Topic[];
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get magazine by slug
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('*')
      .eq('slug', slug)
      .single();

    if (magazineError) {
      if (magazineError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Magazine not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching magazine:', magazineError);
      return NextResponse.json(
        { success: false, error: magazineError.message },
        { status: 500 }
      );
    }

    // Get issues for this magazine
    const { data: issues, error: issuesError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('magazine_id', magazine.id)
      .order('issue_number', { ascending: false });

    if (issuesError) {
      console.error('Error fetching issues:', issuesError);
      return NextResponse.json(
        { success: false, error: issuesError.message },
        { status: 500 }
      );
    }

    // Get topics for each issue
    const issuesWithTopics = await Promise.all(
      issues.map(async (issue) => {
        const { data: topics, error: topicsError } = await supabaseAdmin
          .from('topics')
          .select('*')
          .eq('issue_id', issue.id)
          .order('position', { ascending: true });

        if (topicsError) {
          console.error('Error fetching topics for issue:', issue.id, topicsError);
          return { ...issue, topics: [] };
        }

        return { ...issue, topics: topics || [] };
      })
    );

    const magazineWithDetails: MagazineWithDetails = {
      ...magazine,
      issues: issuesWithTopics,
    };

    return NextResponse.json({
      success: true,
      magazine: magazineWithDetails,
    });
  } catch (error) {
    console.error('Unexpected error in get magazine details API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}