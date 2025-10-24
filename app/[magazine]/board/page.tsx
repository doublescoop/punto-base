"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, DollarSign, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { LiquidGlass } from "../../../components/LiquidGlass";

type TopicStatus = "UNFILLED" | "IN_REVIEW" | "ACCEPTED" | "READY" | "PROOFED";

interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  slotsNeeded: number;
  submissions: number;
  accepted: number;
  ready: number;
}

// interface Submission {
//   id: string;
//   title: string;
//   author: string;
//   status: TopicStatus;
//   submittedAt: string;
//   score?: number;
// }

// interface PayTableItem {
//   role: string;
//   amount: string;
//   count: number;
//   total: string;
// }

const mockIssueData = {
  "concrete-light": {
    magazineName: "Concrete & Light",
    issueNumber: "12",
    deadline: "Oct 22, 2025",
    treasury: "2,500 USDC",
    requiredFunds: "3,200 USDC",
    shortfall: "700 USDC",
    topics: [
      {
        id: "1",
        title: "Fragments of Urban Decay",
        status: "IN_REVIEW" as TopicStatus,
        slotsNeeded: 3,
        submissions: 8,
        accepted: 2,
        ready: 1
      },
      {
        id: "2",
        title: "Concrete Dreams",
        status: "READY" as TopicStatus,
        slotsNeeded: 2,
        submissions: 5,
        accepted: 2,
        ready: 2
      },
      {
        id: "3",
        title: "Urban Archaeologies",
        status: "UNFILLED" as TopicStatus,
        slotsNeeded: 1,
        submissions: 2,
        accepted: 0,
        ready: 0
      },
      {
        id: "4",
        title: "Memory in Stone",
        status: "ACCEPTED" as TopicStatus,
        slotsNeeded: 2,
        submissions: 6,
        accepted: 2,
        ready: 1
      },
      {
        id: "5",
        title: "Brutalist Beauty",
        status: "PROOFED" as TopicStatus,
        slotsNeeded: 1,
        submissions: 4,
        accepted: 1,
        ready: 1
      }
    ],
    payTable: [
      { role: "Founder Stipend", amount: "50 USDC", count: 1, total: "50 USDC" },
      { role: "Editor Stipends", amount: "30 USDC", count: 2, total: "60 USDC" },
      { role: "Accepted Submissions", amount: "500 USDC", count: 7, total: "3,500 USDC" },
      { role: "Commissioned Content", amount: "200 USDC", count: 3, total: "600 USDC" },
      { role: "Buffer (10%)", amount: "", count: 0, total: "421 USDC" }
    ]
  }
};

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const magazineName = params.magazine as string;

  const [showPayTable, setShowPayTable] = useState(false);
  const [, setSelectedTopic] = useState<Topic | null>(null);

  const issueData = mockIssueData[magazineName as keyof typeof mockIssueData];

  if (!issueData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-mono text-2xl">Issue Not Found</h1>
                  <p className="text-muted-foreground">
                    The issue you&apos;re looking for doesn&apos;t exist.
                  </p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: TopicStatus) => {
    switch (status) {
      case "UNFILLED": return "rgba(239, 68, 68, 0.15)";
      case "IN_REVIEW": return "rgba(245, 158, 11, 0.15)";
      case "ACCEPTED": return "rgba(34, 197, 94, 0.15)";
      case "READY": return "rgba(59, 130, 246, 0.15)";
      case "PROOFED": return "rgba(147, 51, 234, 0.15)";
      default: return "rgba(236, 236, 240, 0.3)";
    }
  };

  const getStatusIcon = (status: TopicStatus) => {
    switch (status) {
      case "UNFILLED": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "IN_REVIEW": return <Clock className="w-4 h-4 text-orange-600" />;
      case "ACCEPTED": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "READY": return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "PROOFED": return <CheckCircle className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const canPublish = issueData.topics.every(topic => topic.status === "PROOFED") && 
                    parseFloat(issueData.treasury.replace(/[^\d.]/g, '')) >= 
                    parseFloat(issueData.requiredFunds.replace(/[^\d.]/g, '')) * 1.1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="w-full px-6 lg:px-12 py-8">
          <button
            onClick={() => router.push("/profile")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-mono text-3xl tracking-tight mb-2">
                {issueData.magazineName} Issue #{issueData.issueNumber}
              </h1>
              <p className="text-muted-foreground">
                Manage submissions and track issue progress
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPayTable(!showPayTable)}
                className="px-4 py-2 bg-card/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all rounded-lg flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Pay Table
              </button>
              <button
                onClick={() => router.push(`/${magazineName}/settings`)}
                className="px-4 py-2 bg-card/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all rounded-lg flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Status */}
      <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <LiquidGlass size={40} tint="rgba(245, 158, 11, 0.15)">
                <Clock className="w-5 h-5 text-orange-600" />
              </LiquidGlass>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-mono text-lg">{issueData.deadline}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LiquidGlass size={40} tint="rgba(59, 130, 246, 0.15)">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </LiquidGlass>
              <div>
                <p className="text-sm text-muted-foreground">Treasury</p>
                <p className="font-mono text-lg text-accent">{issueData.treasury}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LiquidGlass size={40} tint="rgba(239, 68, 68, 0.15)">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </LiquidGlass>
              <div>
                <p className="text-sm text-muted-foreground">Required Funds</p>
                <p className="font-mono text-lg">{issueData.requiredFunds}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LiquidGlass size={40} tint="rgba(34, 197, 94, 0.15)">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </LiquidGlass>
              <div>
                <p className="text-sm text-muted-foreground">Topics Ready</p>
                <p className="font-mono text-lg">
                  {issueData.topics.filter(t => t.status === "PROOFED").length} / {issueData.topics.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Topics Board */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                Topic Progress
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {issueData.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-card/50 backdrop-blur-sm p-6 rounded-lg hover:bg-card/80 transition-all cursor-pointer"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <LiquidGlass size={50} tint={getStatusColor(topic.status)}>
                        {getStatusIcon(topic.status)}
                      </LiquidGlass>
                      <div className="flex-1">
                        <h3 className="font-mono text-lg mb-1">{topic.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            topic.status === "UNFILLED" ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" :
                            topic.status === "IN_REVIEW" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" :
                            topic.status === "ACCEPTED" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                            topic.status === "READY" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                            "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          }`}>
                            {topic.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Slots Needed:</span>
                        <span>{topic.slotsNeeded}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Submissions:</span>
                        <span>{topic.submissions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accepted:</span>
                        <span className="text-green-600">{topic.accepted}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ready:</span>
                        <span className="text-blue-600">{topic.ready}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/30">
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{
                            width: `${(topic.ready / topic.slotsNeeded) * 100}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {topic.ready} / {topic.slotsNeeded} ready
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pay Table Side Panel */}
          {showPayTable && (
            <div className="lg:col-span-1">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg sticky top-6">
                <h3 className="font-mono text-lg mb-4">Pay Table</h3>
                
                <div className="space-y-4">
                  {issueData.payTable.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.role}</span>
                        <span>{item.total}</span>
                      </div>
                      {item.count > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.amount} × {item.count}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Required:</span>
                    <span>{issueData.requiredFunds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Treasury:</span>
                    <span className="text-accent">{issueData.treasury}</span>
                  </div>
                  {issueData.shortfall && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Shortfall:</span>
                      <span>{issueData.shortfall}</span>
                    </div>
                  )}
                </div>

                {!canPublish && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      You need {issueData.shortfall} more USDC in the Safe to publish.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Publish Button */}
      <div className="border-t border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="w-full px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {canPublish ? (
                <span className="text-green-600">All topics ready and funds available for publishing</span>
              ) : (
                <span>Complete all topics and ensure sufficient funds to publish</span>
              )}
            </div>
            <button
              disabled={!canPublish}
              className="px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center gap-2"
            >
              Publish Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
