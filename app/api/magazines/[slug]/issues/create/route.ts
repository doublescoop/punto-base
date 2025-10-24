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

export const runtime = 'edge';

interface CreateIssueRequest {
  title: string;
  description: string;
  coverImageUrl?: string;
  submissionDeadline: string;
  publicationDate: string;
  topics: Array<{
    title: string;
    description: string;
    bountyAmount: number;
    maxSubmissions?: number;
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
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('id, status')
      .eq('slug', slug)
      .single();

    if (magazineError || !magazine) {
      return NextResponse.json(
        {
          success: false,
          error: 'Magazine not found',
        },
        { status: 404 }
      );
    }

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
      treasury_address: '0x0000000000000000000000000000000000000000', // Placeholder - will be updated when treasury is created
      required_funding: 0, // Will be calculated later
      current_balance: 0,
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
      status: 'open',
      format: 'mixed', // Default format
      is_open_call: true, // All topics are open calls in this API
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

