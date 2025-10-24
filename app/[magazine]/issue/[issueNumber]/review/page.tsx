"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { useAccount } from "wagmi";
import { SubmissionReviewCard } from "@/components/SubmissionReviewCard";
import type { Database } from "@/database.types";

type Submission = Database['public']['Tables']['submissions']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface SubmissionWithAuthor extends Submission {
  users: Pick<User, 'id' | 'wallet_address' | 'display_name' | 'avatar'>;
}

type StatusFilter = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export default function ReviewSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const { address } = useAccount();
  const [submissions, setSubmissions] = useState<SubmissionWithAuthor[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('SUBMITTED');
  const [issueId, setIssueId] = useState<string | null>(null);

  // Fetch issue ID from magazine slug and issue number
  useEffect(() => {
    const fetchIssueId = async () => {
      try {
        const res = await fetch(`/api/magazines/${params.magazine}/issues/${params.issueNumber}`);
        const data = await res.json();
        if (data.success) {
          setIssueId(data.issue.id);
        }
      } catch (error) {
        console.error('Failed to fetch issue:', error);
      }
    };

    if (params.magazine && params.issueNumber) {
      fetchIssueId();
    }
  }, [params.magazine, params.issueNumber]);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!issueId) return;

      setIsLoading(true);
      try {
        const res = await fetch(`/api/issues/${issueId}/submissions`);
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.submissions);
        }
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [issueId]);

  // Apply filter
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(sub => sub.status === statusFilter));
    }
  }, [submissions, statusFilter]);

  // Handler for accepting a submission
  const handleAccept = async (submissionId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Get user ID from wallet
      const userRes = await fetch(`/api/users/me?address=${address}`);
      const userData = await userRes.json();
      if (!userData.success) throw new Error('Failed to fetch user');

      // Update submission status
      const res = await fetch(`/api/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACCEPTED',
          editorId: userData.user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId ? { ...sub, status: 'ACCEPTED' } : sub
          )
        );
        alert('✅ Submission accepted!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to accept submission:', error);
      alert(error instanceof Error ? error.message : 'Failed to accept submission');
    }
  };

  // Handler for rejecting a submission
  const handleReject = async (submissionId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Get user ID from wallet
      const userRes = await fetch(`/api/users/me?address=${address}`);
      const userData = await userRes.json();
      if (!userData.success) throw new Error('Failed to fetch user');

      // Update submission status
      const res = await fetch(`/api/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          editorId: userData.user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId ? { ...sub, status: 'REJECTED' } : sub
          )
        );
        alert('❌ Submission rejected');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to reject submission:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject submission');
    }
  };

  // Handler for "hmm" (maybe later)
  const handleHmm = async (submissionId: string) => {
    if (!address) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Get user ID from wallet
      const userRes = await fetch(`/api/users/me?address=${address}`);
      const userData = await userRes.json();
      if (!userData.success) throw new Error('Failed to fetch user');

      // Update submission status to UNDER_REVIEW
      const res = await fetch(`/api/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'UNDER_REVIEW',
          editorId: userData.user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId ? { ...sub, status: 'UNDER_REVIEW' } : sub
          )
        );
        alert('🤔 Marked for review');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to update submission:', error);
      alert(error instanceof Error ? error.message : 'Failed to update submission');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <button
            onClick={() => router.push('/profile?tab=founder')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magazines
          </button>

          <div className="space-y-2">
            <div className="bg-accent text-accent-foreground px-3 py-1 font-mono text-sm font-light inline-block">
              Review Submissions
            </div>
            <h1 className="font-display text-3xl font-bold">
              {params.magazine} • Issue #{params.issueNumber}
            </h1>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-2">
              {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    statusFilter === status
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <main className="container mx-auto px-6 lg:px-12 py-12">
        {isLoading ? (
          <div className="bg-muted/30 backdrop-blur-sm p-12 text-center rounded-lg">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length > 0 ? (
          <div className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <SubmissionReviewCard
                key={submission.id}
                submission={submission}
                onAccept={() => handleAccept(submission.id)}
                onReject={() => handleReject(submission.id)}
                onHmm={() => handleHmm(submission.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 backdrop-blur-sm p-12 text-center rounded-lg">
            <p className="text-muted-foreground">
              No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} submissions found
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

