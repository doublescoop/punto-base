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

// Removed 'edge' runtime - causes issues with Supabase

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

    if (submission.status !== 'SUBMITTED') {
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
      status: body.action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      accepted_at: body.action === 'accept' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
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
        recipient_id: submission.author_id,
        amount: submission.bounty_amount,
        currency: 'USDC' as const,
        status: 'PENDING' as const,
        role: 'CONTRIBUTOR' as const,
        issue_id: submission.issue_id,
        magazine_id: submission.magazine_id,
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

    // Return submission data directly
    const responseSubmission = updatedSubmission;

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

