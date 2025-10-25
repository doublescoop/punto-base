/**
 * GET /api/topics/[topicId]
 * 
 * Fetches topic details including magazine_id and issue_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await context.params;

    const { data: topic, error } = await supabaseAdmin
      .from('topics')
      .select(`
        *,
        issues!inner(
          id,
          magazine_id
        )
      `)
      .eq('id', topicId)
      .single();

    if (error) {
      console.error('Error fetching topic:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, topic });
  } catch (error) {
    console.error('Unexpected error in topic API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
