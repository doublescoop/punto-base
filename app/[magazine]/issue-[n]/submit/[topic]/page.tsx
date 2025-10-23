"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SubmissionForm } from "../../../../../components/SubmissionForm";
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Mock data for topics
const mockTopics = {
  "concrete-light-12": {
    "fragments-of-urban-decay": {
      id: "1",
      title: "Fragments of Urban Decay",
      magazine: "Concrete & Light",
      dueDate: "Oct 22, 2025",
      bounty: "$500",
      category: "picture",
      requirements: "Submit 3-5 high-resolution photographs capturing urban decay and abandonment. Images should explore themes of time, memory, and the beauty found in deterioration.",
      fileCaps: {
        maxSize: "10MB per file",
        formats: "JPEG, PNG, TIFF",
        maxFiles: 5
      }
    }
  },
  "ephemera-quarterly-8": {
    "letters-to-my-younger-self": {
      id: "2",
      title: "Letters to My Younger Self",
      magazine: "Ephemera Quarterly",
      dueDate: "Dec 1, 2025",
      bounty: "$300",
      category: "shorttext",
      requirements: "Write a letter to your younger self (500-1000 words). Share wisdom, comfort, or warnings. Be honest and vulnerable.",
      fileCaps: {
        maxSize: "5MB",
        formats: "PDF, DOC, DOCX, TXT",
        maxFiles: 1
      }
    }
  }
};

export default function SubmitPage() {
  const router = useRouter();
  const params = useParams();
  const magazineName = params.magazine as string;
  const issueNumber = params.n as string;
  const topicSlug = params.topic as string;

  const [showWarning, setShowWarning] = useState(true);

  // Generate the issue key and get topic data
  const issueKey = `${magazineName}-${issueNumber}`;
  const topicData = mockTopics[issueKey as keyof typeof mockTopics]?.[topicSlug as keyof typeof mockTopics[typeof issueKey]];

  // If topic doesn't exist, redirect or show error
  if (!topicData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-mono text-2xl">Topic Not Found</h1>
          <p className="text-muted-foreground">
            The submission topic you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/opencalls")}
            className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg"
          >
            Browse Open Calls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="space-y-4">
            <h1 className="font-mono text-3xl tracking-tight">Submit to {topicData.title}</h1>
            <p className="text-muted-foreground">
              {topicData.magazine} • Issue #{issueNumber} • Due {topicData.dueDate}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      {showWarning && (
        <div className="border-b border-border/20 bg-yellow-50 dark:bg-yellow-900/10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Important Notice
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Submissions are final and non-cancellable.</strong> Make sure you're happy with your work before you send it. Once submitted, you cannot withdraw or edit your submission.
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 underline"
                >
                  I understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Details */}
      <div className="border-b border-border/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-mono text-xl mb-3">Requirements</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {topicData.requirements}
                </p>
              </div>

              <div>
                <h2 className="font-mono text-xl mb-3">File Requirements</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max file size:</span>
                    <span>{topicData.fileCaps.maxSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accepted formats:</span>
                    <span>{topicData.fileCaps.formats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max files:</span>
                    <span>{topicData.fileCaps.maxFiles}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="font-mono text-lg mb-3">Submission Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bounty:</span>
                    <span className="text-accent font-mono">{topicData.bounty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="capitalize">{topicData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due date:</span>
                    <span>{topicData.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                <p className="text-sm text-muted-foreground">
                  Acceptance requires 80% approvals from assigned curators. The editorial team will review your submission within 7 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <SubmissionForm
          openCall={topicData}
          onBack={() => router.back()}
          onSubmitted={() => {
            router.push("/profile");
          }}
        />
      </div>
    </div>
  );
}
