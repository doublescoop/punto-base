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


// export const runtime = 'edge';

interface CreateSubmissionRequest {
  topicId: string;
  authorId: string;
  magazineId: string;
  title?: string;
  description?: string;
  content: string;
  mediaUrls?: string[];
  bountyAmount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSubmissionRequest = await request.json();

    // Validate required fields
    if (!body.topicId || !body.authorId || !body.magazineId || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: topicId, authorId, magazineId, content',
        },
        { status: 400 }
      );
    }

    // Wallet validation removed - handled by auth

    // Verify topic exists and is open
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('topics')
      .select('id, status, slots_needed, issue_id')
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
    if (topic.slots_needed) {
      const { count } = await supabaseAdmin
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', body.topicId)
        .in('status', ['pending', 'accepted']);

      if (count && count >= topic.slots_needed) {
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
      title: body.title || 'Untitled',
      description: body.description || null,
      content: body.content,
      media_urls: body.mediaUrls || [],
      status: 'pending',
      issue_id: topic.issue_id,
      magazine_id: body.magazineId,
      bounty_amount: body.bountyAmount || 0,
      payment_status: 'pending',
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

    // Return submission data directly
    const responseSubmission = submission;

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

