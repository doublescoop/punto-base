import { useState } from "react";
import { Lock, Copy, FileText, BookOpen, Users, Briefcase, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { SubmissionDetailDrawer } from "./SubmissionDetailDrawer";
import { LiquidGlass } from "./LiquidGlass";

interface MyPageProps {
  onBack: () => void;
  onExploreOpenCalls?: () => void;
  onReadIssue?: (issueId: string) => void;
}

// Types for the mock data
type SubmissionStatus = "IN_REVIEW" | "ACCEPTED" | "PUBLISHED" | "PAID" | "REJECTED";

// Mock user data - in reality this would come from API
const mockUserData = {
  avatar: "",
  displayName: "Alex Rivera",
  wallet: "0x742d...4a8c",
  email: "alex@example.com",
  roles: {
    hasSubmissions: true,
    isFounder: false,
    isEditor: false,
    isReader: true,
  },
  submissions: [
    {
      id: "sub-1",
      title: "Fragments of Memory",
      topic: "Fragments of Urban Decay",
      magazine: "Concrete & Light",
      issue: "Issue #12",
      status: "IN_REVIEW" as SubmissionStatus,
      submittedAt: "2 days ago",
      lastUpdated: "1 day ago",
      content: "In the crumbling edifice of what once stood proud, I found beauty. Each crack tells a story of time's passage...",
      description: "A photographic exploration of abandoned urban spaces and the unexpected beauty found in decay.",
      format: "picture",
      fileSize: "4.2 MB",
      fileType: "JPEG",
      cid: "QmX4k9r7YnGtHvK2pL8mN9oQ3wR5sT6uV1xY2zA3bC4dE5f",
      approvalProgress: 2,
      approvalThreshold: 3,
    },
    {
      id: "sub-2",
      title: "Letters to Tomorrow",
      topic: "Letters to My Younger Self",
      magazine: "Ephemera Quarterly",
      issue: "Issue #8",
      status: "ACCEPTED" as SubmissionStatus,
      submittedAt: "1 week ago",
      lastUpdated: "3 days ago",
      content: "Dear younger me, you were right to trust your instincts when everyone else told you to conform...",
      description: "A personal reflection on growth, mistakes, and the wisdom that only comes with time.",
      format: "shorttext",
      cid: "QmA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W",
      approvalProgress: 3,
      approvalThreshold: 3,
    },
  ],
  payments: [
    {
      id: "pay-1",
      issue: "Ephemera Quarterly #8",
      role: "Contributor",
      amount: "300 USDC",
      status: "pending" as const,
      expectedDate: "On publish",
    },
  ],
  freeAccess: [
    {
      id: "access-1",
      magazine: "Ephemera Quarterly",
      issue: "Issue #8",
      cover: "",
      reason: "Contributor",
    },
  ],
};

export function MyPage({ onBack, onExploreOpenCalls, onReadIssue }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<"contributions" | "founder" | "editor" | "library">("contributions");
  const [selectedSubmission, setSelectedSubmission] = useState<typeof mockUserData.submissions[0] | null>(null);

  const tabs = [
    {
      id: "contributions" as const,
      label: "Contributions",
      icon: FileText,
      locked: !mockUserData.roles.hasSubmissions,
      lockMessage: "Submit to an Open Call to see your contributions.",
    },
    {
      id: "founder" as const,
      label: "Founder",
      icon: Briefcase,
      locked: !mockUserData.roles.isFounder,
      lockMessage: "Start a new Magazine to unlock founder tools.",
    },
    {
      id: "editor" as const,
      label: "Editor",
      icon: Users,
      locked: !mockUserData.roles.isEditor,
      lockMessage: "You&apos;ll unlock this when a Founder adds you as an Editor.",
    },
    {
      id: "library" as const,
      label: "Library",
      icon: BookOpen,
      locked: false,
      lockMessage: "",
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {selectedSubmission && (
        <SubmissionDetailDrawer
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {/* Header */}
      <div className="border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            ← Back to Open Calls
          </button>

          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <LiquidGlass size={80} tint="rgba(236, 236, 240, 0.3)">
              <span className="text-2xl">{mockUserData.displayName[0]}</span>
            </LiquidGlass>
            
            <div className="flex-1 space-y-3">
              <h1 className="font-mono text-3xl tracking-tight">{mockUserData.displayName}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Wallet:</span>
                  <code className="bg-muted px-2 py-1">{mockUserData.wallet}</code>
                  <button
                    onClick={() => handleCopy(mockUserData.wallet)}
                    className="hover:text-accent transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{mockUserData.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-1 border-b border-border/30 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.locked && setActiveTab(tab.id)}
                  disabled={tab.locked}
                  className={`px-4 sm:px-6 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-accent text-accent"
                      : tab.locked
                      ? "border-transparent text-muted-foreground cursor-not-allowed opacity-40"
                      : "border-transparent hover:border-muted text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                  {tab.locked && <Lock className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Contributions Tab */}
        {activeTab === "contributions" && !tabs[0].locked && (
          <div className="space-y-12">
            {/* Active Submissions */}
            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                Active Submissions
              </h2>

              {mockUserData.submissions.length > 0 ? (
                <div className="space-y-6">
                  {mockUserData.submissions.map((sub) => {
                    // Determine tint color based on status
                    const statusTint = 
                      sub.status === "IN_REVIEW" ? "rgba(255, 0, 0, 0.15)" :
                      sub.status === "ACCEPTED" ? "rgba(34, 197, 94, 0.15)" :
                      sub.status === "PUBLISHED" ? "rgba(34, 197, 94, 0.15)" :
                      sub.status === "PAID" ? "rgba(34, 197, 94, 0.15)" :
                      "rgba(236, 236, 240, 0.3)";

                    return (
                      <div
                        key={sub.id}
                        className="bg-card/50 backdrop-blur-sm p-6 hover:bg-card/80 transition-all cursor-pointer rounded-lg"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <div className="flex items-start gap-6">
                          {/* Liquid Glass Status Indicator */}
                          <LiquidGlass size={60} tint={statusTint}>
                            <div className="text-center">
                              <div className="text-xs uppercase tracking-wider">
                                {sub.status.split("_")[0]}
                              </div>
                            </div>
                          </LiquidGlass>

                          <div className="flex-1">
                            <h3 className="font-mono text-xl mb-2">{sub.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {sub.magazine} › {sub.issue} › {sub.topic}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Submitted {sub.submittedAt}</span>
                              <span>•</span>
                              <span>Updated {sub.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-muted/30 backdrop-blur-sm p-12 text-center space-y-4 rounded-lg">
                  <p className="text-muted-foreground">
                    You haven&apos;t submitted yet.
                  </p>
                  <button
                    onClick={onExploreOpenCalls || onBack}
                    className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2 rounded-full"
                  >
                    Explore Open Calls
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

            {/* Payments */}
            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                Payments
              </h2>

              {mockUserData.payments.length > 0 ? (
                <div className="bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                          Issue
                        </th>
                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUserData.payments.map((payment) => (
                        <tr key={payment.id} className="border-t border-border/30 last:border-0">
                          <td className="px-4 py-4 text-sm">{payment.issue}</td>
                          <td className="px-4 py-4 text-sm">{payment.role}</td>
                          <td className="px-4 py-4 text-sm text-accent">{payment.amount}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {payment.status === "pending" ? payment.expectedDate : payment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-muted/30 backdrop-blur-sm p-8 text-center rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Payments show up after an Issue you contributed to is published.
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Payments submit within 5 minutes of publish; confirmations may take up to 15 minutes.
              </p>
            </section>

            {/* Access */}
            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                Access
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockUserData.freeAccess.map((access) => (
                  <div key={access.id} className="bg-card/50 backdrop-blur-sm p-6 space-y-4 rounded-lg hover:bg-card/80 transition-all">
                    <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center rounded-lg overflow-hidden">
                      <LiquidGlass size={100} tint="rgba(236, 236, 240, 0.25)">
                        <BookOpen className="w-8 h-8 opacity-50" />
                      </LiquidGlass>
                    </div>
                    <div>
                      <h3 className="font-mono mb-1">{access.magazine}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{access.issue}</p>
                      <p className="text-xs text-accent mb-4">Free as {access.reason}</p>
                      <button 
                        onClick={() => onReadIssue?.(access.id)}
                        className="w-full px-4 py-2 bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
                      >
                        Read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Locked Contributions Tab */}
        {activeTab === "contributions" && tabs[0].locked && (
          <div className="text-center py-12 space-y-6">
            <LiquidGlass size={120} tint="rgba(113, 113, 130, 0.15)" className="mx-auto">
              <Lock className="w-10 h-10 opacity-50" />
            </LiquidGlass>
            <div className="space-y-2">
              <h3 className="font-mono text-xl">Contributions Locked</h3>
              <p className="text-muted-foreground">{tabs[0].lockMessage}</p>
            </div>
            <button
              onClick={onExploreOpenCalls || onBack}
              className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2 rounded-full"
            >
              Explore Open Calls
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Founder Tab (Locked) */}
        {activeTab === "founder" && (
          <div className="text-center py-12 space-y-6">
            <LiquidGlass size={120} tint="rgba(113, 113, 130, 0.15)" className="mx-auto">
              <Lock className="w-10 h-10 opacity-50" />
            </LiquidGlass>
            <div className="space-y-2">
              <h3 className="font-mono text-xl">Founder Tools Locked</h3>
              <p className="text-muted-foreground">{tabs[1].lockMessage}</p>
            </div>
            <button className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-full">
              Create New Magazine
            </button>
          </div>
        )}

        {/* Editor Tab (Locked) */}
        {activeTab === "editor" && (
          <div className="text-center py-12 space-y-6">
            <LiquidGlass size={120} tint="rgba(113, 113, 130, 0.15)" className="mx-auto">
              <Lock className="w-10 h-10 opacity-50" />
            </LiquidGlass>
            <div className="space-y-2">
              <h3 className="font-mono text-xl">Editor Access Locked</h3>
              <p className="text-muted-foreground">{tabs[2].lockMessage}</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Editors are invited by Founders to help curate submissions. Once you&apos;re added to an editorial team, you&apos;ll see your assigned Issues here.
              </p>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                Your Library
              </h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-accent bg-accent text-accent-foreground">
                  All
                </button>
                <button className="px-3 py-1 text-xs border border-border hover:border-accent transition-colors">
                  Purchased
                </button>
                <button className="px-3 py-1 text-xs border border-border hover:border-accent transition-colors">
                  Free Access
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {mockUserData.freeAccess.map((access) => (
                <div key={access.id} className="bg-card/50 backdrop-blur-sm p-4 space-y-4 rounded-lg hover:bg-card/80 transition-all">
                  <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center rounded-lg overflow-hidden">
                    <LiquidGlass size={80} tint="rgba(236, 236, 240, 0.25)">
                      <BookOpen className="w-6 h-6 opacity-50" />
                    </LiquidGlass>
                  </div>
                  <div>
                    <h3 className="font-mono text-sm mb-1">{access.magazine}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{access.issue}</p>
                    <button 
                      onClick={() => onReadIssue?.(access.id)}
                      className="w-full px-3 py-2 text-sm bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
                    >
                      Read
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {mockUserData.freeAccess.length === 0 && (
              <div className="bg-muted/30 backdrop-blur-sm p-12 text-center rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Your library is empty. Explore Issues →
                </p>
                <button className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-full">
                  Browse Issues
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
