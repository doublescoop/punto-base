/**
 * POST /api/submissions/create
 * 
 * Creates a new submission for a topic
 * 
 * Request body:
 * {
 *   topicId: string;
 *   authorId: string;
 *   authorName: string;
 *   authorWallet: string; // Base address
 *   content: string;
 *   mediaUrls?: string[];
 *   isAnonymous?: boolean;
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   submission?: Submission;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Submission } from '@/types/schema';

export const runtime = 'edge';

interface CreateSubmissionRequest {
  topicId: string;
  authorId: string;
  authorName: string;
  authorWallet: string;
  content: string;
  mediaUrls?: string[];
  isAnonymous?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubmissionRequest = await request.json();

    // Validate required fields
    if (!body.topicId || !body.authorId || !body.authorName || !body.authorWallet || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: topicId, authorId, authorName, authorWallet, content',
        },
        { status: 400 }
      );
    }

    // Validate wallet address (Base address format)
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.authorWallet)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid wallet address format',
        },
        { status: 400 }
      );
    }

    // Verify topic exists and is open
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('topics')
      .select('id, status, max_submissions, issue_id')
      .eq('id', body.topicId)
      .single();

    if (topicError || !topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic not found',
        },
        { status: 404 }
      );
    }

    if (topic.status !== 'open') {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is not accepting submissions',
        },
        { status: 400 }
      );
    }

    // Check if max submissions reached
    if (topic.max_submissions) {
      const { count } = await supabaseAdmin
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', body.topicId)
        .in('status', ['pending', 'accepted']);

      if (count && count >= topic.max_submissions) {
        return NextResponse.json(
          {
            success: false,
            error: 'Maximum submissions reached for this topic',
          },
          { status: 400 }
        );
      }
    }

    // Check if user already submitted to this topic
    const { data: existingSubmission } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('topic_id', body.topicId)
      .eq('author_id', body.authorId)
      .single();

    if (existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already submitted to this topic',
        },
        { status: 409 }
      );
    }

    // Create submission
    const submissionData = {
      topic_id: body.topicId,
      author_id: body.authorId,
      author_name: body.authorName,
      author_wallet: body.authorWallet,
      content: body.content,
      media_urls: body.mediaUrls || [],
      is_anonymous: body.isAnonymous || false,
      status: 'pending' as const,
    };

    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .insert(submissionData)
      .select()
      .single();

    if (submissionError) {
      console.error('Failed to create submission:', submissionError);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${submissionError.message}`,
        },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const responseSubmission: Submission = {
      id: submission.id as `sub_${string}`,
      topicId: submission.topic_id as `topic_${string}`,
      authorId: submission.author_id as `user_${string}`,
      authorName: submission.author_name,
      authorWallet: submission.author_wallet,
      content: submission.content,
      mediaUrls: submission.media_urls,
      isAnonymous: submission.is_anonymous,
      status: submission.status as Submission['status'],
      submittedAt: submission.submitted_at,
      reviewedAt: submission.reviewed_at || undefined,
      reviewedBy: submission.reviewed_by as `user_${string}` | undefined,
      reviewNotes: submission.review_notes || undefined,
      createdAt: submission.created_at,
      updatedAt: submission.updated_at,
    };

    return NextResponse.json({
      success: true,
      submission: responseSubmission,
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

