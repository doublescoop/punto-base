/**
 * GET /api/opencalls
 * 
 * Fetches all open call topics from the open_calls view
 * 
 * Response:
 * {
 *   success: boolean;
 *   openCalls?: Array<{
 *     id: string;
 *     title: string;
 *     description: string;
 *     magazine: {
 *       id: string;
 *       name: string;
 *       slug: string;
     *       cover: string;
     *     };
 *     bountyAmount: number;
 *     dueDate: string;
 *     format: string;
 *     slotsNeeded: number;
 *     submissionsCount: number;
 *     status: string;
 *   }>;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Fetch from the open_calls view
    const { data: openCalls, error } = await supabaseAdmin
      .from('open_calls')
      .select('*')
      .not('status', 'is', null) // Only get records with status
      .not('title', 'is', null); // Only get records with title

    if (error) {
      console.error('Error fetching open calls:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Format the response to match the expected interface
    const formattedOpenCalls = openCalls?.map(call => ({
      id: call.id || '',
      title: call.title || '',
      description: call.description || '',
      magazine: {
        id: call.magazine_id || '',
        name: call.magazine_name || '',
        slug: call.magazine_slug || '',
        cover: call.magazine_cover || '',
      },
      bountyAmount: call.bounty_amount || 0,
      dueDate: call.due_date || '',
      format: call.format || 'mixed',
      slotsNeeded: call.slots_needed || 1,
      submissionsCount: call.total_submissions || 0,
      status: call.status || 'UNFILLED',
    })) || [];

    console.log('Fetched open calls:', formattedOpenCalls.length, 'calls');

    return NextResponse.json({ success: true, openCalls: formattedOpenCalls });
  } catch (error) {
    console.error('Unexpected error in opencalls API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }, { status: 500 });
  }
}
