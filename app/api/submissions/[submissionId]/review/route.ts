/**
 * POST /api/submissions/[submissionId]/review
 * 
 * Reviews a submission (accept/reject)
 * 
 * Request body:
 * {
 *   action: 'accept' | 'reject';
 *   reviewerId: string;
 *   reviewNotes?: string;
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

interface ReviewSubmissionRequest {
  action: 'accept' | 'reject';
  reviewerId: string;
  reviewNotes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    const body: ReviewSubmissionRequest = await request.json();

    // Validate required fields
    if (!body.action || !body.reviewerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: action, reviewerId',
        },
        { status: 400 }
      );
    }

    if (body.action !== 'accept' && body.action !== 'reject') {
      return NextResponse.json(
        {
          success: false,
          error: 'Action must be either "accept" or "reject"',
        },
        { status: 400 }
      );
    }

    // Get submission
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from('submissions')
      .select('*, topics!inner(bounty_amount, issue_id)')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        {
          success: false,
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: `Submission has already been ${submission.status}`,
        },
        { status: 400 }
      );
    }

    // Update submission
    const updateData = {
      status: body.action === 'accept' ? 'accepted' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: body.reviewerId,
      review_notes: body.reviewNotes || null,
    };

    const { data: updatedSubmission, error: updateError } = await supabaseAdmin
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update submission:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    // If accepted, create a payment record
    if (body.action === 'accept') {
      const paymentData = {
        submission_id: submissionId,
        recipient_wallet: submission.author_wallet,
        amount_cents: submission.topics.bounty_amount,
        currency: 'USDC' as const,
        status: 'pending' as const,
      };

      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert(paymentData);

      if (paymentError) {
        console.error('Failed to create payment record:', paymentError);
        // Don't fail the review, just log the error
        // The payment can be created manually later
      }
    }

    // Transform to frontend format
    const responseSubmission: Submission = {
      id: updatedSubmission.id as `sub_${string}`,
      topicId: updatedSubmission.topic_id as `topic_${string}`,
      authorId: updatedSubmission.author_id as `user_${string}`,
      authorName: updatedSubmission.author_name,
      authorWallet: updatedSubmission.author_wallet,
      content: updatedSubmission.content,
      mediaUrls: updatedSubmission.media_urls,
      isAnonymous: updatedSubmission.is_anonymous,
      status: updatedSubmission.status as Submission['status'],
      submittedAt: updatedSubmission.submitted_at,
      reviewedAt: updatedSubmission.reviewed_at || undefined,
      reviewedBy: updatedSubmission.reviewed_by as `user_${string}` | undefined,
      reviewNotes: updatedSubmission.review_notes || undefined,
      createdAt: updatedSubmission.created_at,
      updatedAt: updatedSubmission.updated_at,
    };

    return NextResponse.json({
      success: true,
      submission: responseSubmission,
    });

  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

