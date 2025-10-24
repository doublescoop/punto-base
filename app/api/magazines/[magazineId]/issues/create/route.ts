/**
 * POST /api/magazines/[magazineId]/issues/create
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
  { params }: { params: Promise<{ magazineId: string }> }
) {
  try {
    const { magazineId } = await params;
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

    // Verify magazine exists
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('id, status')
      .eq('id', magazineId)
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
      .from('magazine_issues')
      .select('issue_number')
      .eq('magazine_id', magazineId)
      .order('issue_number', { ascending: false })
      .limit(1);

    const nextIssueNumber = existingIssues && existingIssues.length > 0
      ? existingIssues[0].issue_number + 1
      : 1;

    // Create issue
    const issueData = {
      magazine_id: magazineId,
      issue_number: nextIssueNumber,
      title: body.title,
      description: body.description,
      cover_image_url: body.coverImageUrl,
      status: 'planning' as const,
      submission_deadline: body.submissionDeadline,
      publication_date: body.publicationDate,
    };

    const { data: issue, error: issueError } = await supabaseAdmin
      .from('magazine_issues')
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
      max_submissions: topic.maxSubmissions || null,
      position: index,
      status: 'open' as const,
    }));

    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .insert(topicsData)
      .select();

    if (topicsError) {
      console.error('Failed to create topics:', topicsError);
      // Rollback: delete the issue
      await supabaseAdmin.from('magazine_issues').delete().eq('id', issue.id);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create topics: ${topicsError.message}`,
        },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const responseIssue: MagazineIssue = {
      id: issue.id as `issue_${string}`,
      magazineId: issue.magazine_id as `mag_${string}`,
      issueNumber: issue.issue_number,
      title: issue.title,
      description: issue.description,
      coverImageUrl: issue.cover_image_url || undefined,
      status: issue.status as MagazineIssue['status'],
      submissionDeadline: issue.submission_deadline,
      publicationDate: issue.publication_date,
      publishedAt: issue.published_at || undefined,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    };

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

