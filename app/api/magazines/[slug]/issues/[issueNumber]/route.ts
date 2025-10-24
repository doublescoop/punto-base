import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; issueNumber: string }> }
) {
  try {
    const { slug, issueNumber } = await params;
    
    // Step 1: Get magazine by slug
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('id')
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

    // Step 2: Get issue by magazine ID and issue number
    const { data: issue, error: issueError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('magazine_id', magazine.id)
      .eq('issue_number', parseInt(issueNumber))
      .single();

    if (issueError) {
      if (issueError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Issue not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching issue:', issueError);
      return NextResponse.json(
        { success: false, error: issueError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error('Unexpected error in get issue API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}

