/**
 * PATCH /api/submissions/[submissionId]/status
 * 
 * Updates submission status (accept/reject)
 * 
 * Request body:
 * {
 *   status: 'ACCEPTED' | 'REJECTED';
 *   reviewerId: string; // UUID of reviewer (founder/editor)
 *   notes?: string;
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
import type { Database } from '@/database.types';

// export const runtime = 'edge';

type SubmissionUpdate = Database['public']['Tables']['submissions']['Update'];
type SubmissionRow = Database['public']['Tables']['submissions']['Row'];

interface UpdateStatusRequest {
  status: 'ACCEPTED' | 'REJECTED';
  reviewerId: string;
  notes?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params;
    const body: UpdateStatusRequest = await request.json();

    // Validate required fields
    if (!body.status || !body.reviewerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: status, reviewerId',
        },
        { status: 400 }
      );
    }

    if (body.status !== 'ACCEPTED' && body.status !== 'REJECTED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Status must be either ACCEPTED or REJECTED',
        },
        { status: 400 }
      );
    }

    // Get current submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('*, topics!inner(bounty_amount, issue_id, id)')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        {
          success: false,
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    // Check if already reviewed
    if (submission.status !== 'SUBMITTED') {
      return NextResponse.json(
        {
          success: false,
          error: `Submission has already been ${submission.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Update submission
    const updateData: SubmissionUpdate = {
      status: body.status,
      accepted_at: body.status === 'ACCEPTED' ? new Date().toISOString() : null,
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

    // If accepted, create approval record and payment record
    if (body.status === 'ACCEPTED') {
      // Create approval record
      const approvalData = {
        submission_id: submissionId,
        editor_id: body.reviewerId,
        decision: 'APPROVE',
        notes: body.notes || null,
      };

      const { error: approvalError } = await supabaseAdmin
        .from('submission_approvals')
        .insert(approvalData);

      if (approvalError) {
        console.error('Failed to create approval:', approvalError);
        // Don't fail the request, approval is logged separately
      }

      // Create payment record
      const topicData = Array.isArray(submission.topics) ? submission.topics[0] : submission.topics;
      
      const paymentData = {
        submission_id: submissionId,
        recipient_id: submission.author_id,
        amount: topicData?.bounty_amount || submission.bounty_amount,
        currency: 'USDC',
        role: 'CONTRIBUTOR',
        status: 'PENDING',
        issue_id: topicData?.issue_id || submission.issue_id,
        magazine_id: submission.magazine_id,
      };

      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert(paymentData);

      if (paymentError) {
        console.error('Failed to create payment:', paymentError);
        // Don't fail the request, payment can be created later
      }
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });

  } catch (error) {
    console.error('Error updating submission status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

