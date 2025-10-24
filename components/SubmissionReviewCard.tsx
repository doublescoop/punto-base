"use client";

import { ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/database.types";

type SubmissionRow = Database['public']['Tables']['submissions']['Row'];

interface SubmissionReviewCardProps {
  submission: SubmissionRow;
  reviewerId: string; // UUID of current reviewer
  onAccept?: (submissionId: string) => void;
  onReject?: (submissionId: string) => void;
  showVoteButtons?: boolean;
  isReviewing?: boolean; // true = founder/editor reviewing, false = public voting
}

export function SubmissionReviewCard({
  submission,
  reviewerId,
  onAccept,
  onReject,
  showVoteButtons = true,
  isReviewing = false,
}: SubmissionReviewCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localStatus, setLocalStatus] = useState(submission.status);

  const handleVote = async (decision: "ACCEPTED" | "REJECTED" | "hmm") => {
    if (!reviewerId || !isReviewing || isProcessing) return;
    if (decision === "hmm") return; // Skip neutral for now (can implement later)

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/submissions/${submission.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: decision,
          reviewerId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to update submission");
      }

      setLocalStatus(decision);

      // Call callbacks
      if (decision === "ACCEPTED" && onAccept) {
        onAccept(submission.id);
      } else if (decision === "REJECTED" && onReject) {
        onReject(submission.id);
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      alert(error instanceof Error ? error.message : "Failed to update submission");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border border-border bg-card rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-mono text-lg font-semibold">{submission.title}</h3>
            {submission.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {submission.description}
              </p>
            )}
          </div>
          {localStatus !== 'SUBMITTED' && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              localStatus === 'ACCEPTED'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}>
              {localStatus}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {submission.submitted_at 
            ? `Submitted ${new Date(submission.submitted_at).toLocaleDateString()}`
            : 'Draft'}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose max-w-none text-sm">
          {submission.content}
        </div>

        {/* Media URLs */}
        {submission.media_urls && submission.media_urls.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">Attachments:</p>
            {submission.media_urls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {url}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Voting Buttons (only for reviewers) */}
      {showVoteButtons && isReviewing && localStatus === 'SUBMITTED' && (
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleVote("REJECTED")}
              disabled={isProcessing}
              className="w-14 h-14 rounded-full border-2 border-border hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reject"
              title="Reject submission"
            >
              <ThumbsDown className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleVote("hmm")}
              disabled={true}
              className="w-14 h-14 rounded-full border-2 border-border opacity-30 cursor-not-allowed flex items-center justify-center"
              aria-label="Skip (coming soon)"
              title="Skip for later (coming soon)"
            >
              <Meh className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleVote("ACCEPTED")}
              disabled={isProcessing}
              className="w-14 h-14 rounded-full border-2 border-border hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Accept"
              title="Accept submission"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            {isProcessing ? "Processing..." : "Click to accept or reject"}
          </p>
        </div>
      )}

      {/* Already reviewed */}
      {localStatus !== 'SUBMITTED' && (
        <div className="p-4 border-t border-border bg-muted/30 text-center text-sm text-muted-foreground">
          {localStatus === 'ACCEPTED' ? '✅ Accepted' : '❌ Rejected'}
          {submission.accepted_at && ` on ${new Date(submission.accepted_at).toLocaleDateString()}`}
        </div>
      )}
    </div>
  );
}

