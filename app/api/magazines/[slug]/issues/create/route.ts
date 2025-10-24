/**
 * POST /api/magazines/[slug]/issues/create
 * 
 * Creates a new issue for a magazine
 * 
 * Request body:
 * {
 *   title: string;
 *   description: string;
 *   coverImageUrl?: string;
 *   submissionDeadline: string; // ISO 8601
 *   publicationDate: string; // ISO 8601
 *   topics: Array<{
 *     title: string;
 *     description: string;
 *     bountyAmount: number; // USDC cents
 *     maxSubmissions?: number;
 *   }>;
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   issue?: MagazineIssue;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Database } from '@/database.types';
import type { MagazineIssue } from '@/types/schema';

// Removed 'edge' runtime - causes issues with Supabase
// export const runtime = 'edge';

interface CreateIssueRequest {
  title: string;
  description: string;
  coverImageUrl?: string;
  submissionDeadline: string;
  publicationDate: string;
  // Add missing fields from frontend
  requiredFunding?: number;
  treasuryAddress?: string;
  sourceEventDate?: string;
  sourceEventTitle?: string;
  sourceEventLocation?: string;
  sourceEventUrl?: string;
  sourceEventPlatform?: string;
  topics: Array<{
    title: string;
    description: string;
    bountyAmount: number;
    maxSubmissions?: number;
    // Add missing topic fields
    format?: string;
    isOpenCall?: boolean; 
    dueDate?: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: CreateIssueRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.submissionDeadline || !body.publicationDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, submissionDeadline, publicationDate',
        },
        { status: 400 }
      );
    }

    if (!body.topics || body.topics.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one topic is required',
        },
        { status: 400 }
      );
    }

    // Get magazine by slug
    console.log('[API] Looking up magazine by slug:', slug);
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    console.log('[API] Magazine query result:', { magazine, magazineError });

    if (magazineError || !magazine) {
      console.error('[API] Magazine not found. Error:', magazineError);
      return NextResponse.json(
        {
          success: false,
          error: 'Magazine not found',
        },
        { status: 404 }
      );
    }
    
    console.log('[API] Found magazine:', magazine.id);

    // Get the next issue number
    const { data: existingIssues } = await supabaseAdmin
      .from('issues')
      .select('issue_number')
      .eq('magazine_id', magazine.id)
      .order('issue_number', { ascending: false })
      .limit(1);

    const nextIssueNumber = existingIssues && existingIssues.length > 0
      ? (existingIssues[0] as { issue_number: number }).issue_number + 1
      : 1;

    // Create issue
    const issueData: Database['public']['Tables']['issues']['Insert'] = {
      magazine_id: magazine.id,
      issue_number: nextIssueNumber,
      title: body.title,
      description: body.description,
      status: 'DRAFT',
      deadline: body.submissionDeadline,
      // Use frontend values instead of hardcoded defaults
      treasury_address: body.treasuryAddress || '0x0000000000000000000000000000000000000000',
      required_funding: body.requiredFunding || 0,
      current_balance: 0,
      // Add source event data from frontend
      source_event_date: body.sourceEventDate || null,
      source_event_title: body.sourceEventTitle || null,
      source_event_location: body.sourceEventLocation || null,
      source_event_url: body.sourceEventUrl || null,
      source_event_platform: body.sourceEventPlatform || null,
    };

    const { data: issue, error: issueError } = await supabaseAdmin
      .from('issues')
      .insert(issueData)
      .select()
      .single();

    if (issueError) {
      console.error('Failed to create issue:', issueError);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${issueError.message}`,
        },
        { status: 500 }
      );
    }

    // Create topics
    const topicsData = body.topics.map((topic, index) => ({
      issue_id: issue.id,
      title: topic.title,
      description: topic.description,
      bounty_amount: topic.bountyAmount,
      slots_needed: topic.maxSubmissions || 1,
      position: index,
      status: 'UNFILLED', // Use valid status from CHECK constraint
      // Use frontend values instead of hardcoded defaults
      format: topic.format || 'open', // Use actual format from frontend
      is_open_call: topic.isOpenCall !== false, // Use actual value, default true
      due_date: topic.dueDate || null, // Add due date from frontend
    }));

    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .insert(topicsData)
      .select();

    if (topicsError) {
      console.error('Failed to create topics:', topicsError);
      // Rollback: delete the issue
      await supabaseAdmin.from('issues').delete().eq('id', issue.id);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create topics: ${topicsError.message}`,
        },
        { status: 500 }
      );
    }

    // Return issue data directly (types now match database)
    const responseIssue: MagazineIssue = issue;

    return NextResponse.json({
      success: true,
      issue: responseIssue,
      topicsCreated: topics.length,
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

