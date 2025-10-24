"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Copy, FileText, BookOpen, Users, Briefcase, ArrowRight, Plus, TrendingUp, Clock, DollarSign, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { SubmissionDetailDrawer } from "../../components/SubmissionDetailDrawer";
import { LiquidGlass } from "../../components/LiquidGlass";

// Types for the mock data
type SubmissionStatus = "IN_REVIEW" | "ACCEPTED" | "PUBLISHED" | "PAID" | "REJECTED";

// Types for real magazine data
interface MagazineIssue {
  id: string;
  issue_number: number;
  title: string | null;
  status: string;
  published_at: string | null;
  submission_count: number;
  accepted_count: number;
  pending_payment_amount: number;
}

interface MagazineWithStats {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  treasury_address: string;
  default_bounty_amount: number;
  created_at: string;
  issues: MagazineIssue[];
}

// Mock user data - in reality this would come from API
const mockUserData = {
  avatar: "",
  displayName: "Frank Darabont",
  wallet: "0x742d...4a8c",
  email: "frankdd@example.com",
  roles: {
    hasSubmissions: true,
    isFounder: true,
    isEditor: false,
    isReader: true,
  },
  // Dashboard stats
  quickStats: {
    totalSubmissions: 20,
    pendingDeadlines: 2,
    totalTreasury: "4,300 USDC",
    activeMagazines: 2,
  },
  // User's magazines (for founder tab)
  magazines: [
    {
      id: "mag-1",
      name: "Concrete & Light",
      status: "active",
      issues: 3,
      submissions: 12,
      deadline: "Oct 22, 2025",
      treasury: "2,500 USDC",
      requiredFunds: "3,200 USDC",
      shortfall: "700 USDC",
    },
    {
      id: "mag-2", 
      name: "Ephemera Quarterly",
      status: "planning",
      issues: 1,
      submissions: 8,
      deadline: "Dec 1, 2025",
      treasury: "1,800 USDC",
      requiredFunds: "2,100 USDC",
      shortfall: "300 USDC",
    },
  ],
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

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"contributions" | "founder" | "editor" | "library">("contributions");
  const [selectedSubmission, setSelectedSubmission] = useState<typeof mockUserData.submissions[0] | null>(null);
  const [magazines, setMagazines] = useState<MagazineWithStats[]>([]);
  const [isLoadingMagazines, setIsLoadingMagazines] = useState(false);
  const [userRoles, setUserRoles] = useState({
    hasSubmissions: false,
    isFounder: false,
    isEditor: false,
    isReader: true,
  });

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['contributions', 'founder', 'editor', 'library'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Fetch founder's magazines and determine roles
  useEffect(() => {
    if (address && activeTab === "founder") {
      setIsLoadingMagazines(true);
      fetch(`/api/users/${address}/magazines`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setMagazines(data.magazines);
            // Update user roles based on fetched data
            setUserRoles(prev => ({
              ...prev,
              isFounder: data.magazines.length > 0
            }));
          }
        })
        .catch((error) => console.error("Failed to fetch magazines:", error))
        .finally(() => setIsLoadingMagazines(false));
    }
  }, [address, activeTab]);

  // Check if user is founder on mount (for tab availability)
  useEffect(() => {
    if (address) {
      fetch(`/api/users/${address}/magazines`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserRoles(prev => ({
              ...prev,
              isFounder: data.magazines.length > 0
            }));
          }
        })
        .catch((error) => console.error("Failed to check founder status:", error));
    }
  }, [address]);

  const tabs = [
    {
      id: "contributions" as const,
      label: "Contributions",
      icon: FileText,
      locked: !userRoles.hasSubmissions,
      lockMessage: "Submit to an Open Call to see your contributions.",
    },
    {
      id: "founder" as const,
      label: "Founder",
      icon: Briefcase,
      locked: !userRoles.isFounder,
      lockMessage: "Start a new Magazine to unlock founder tools.",
    },
    {
      id: "editor" as const,
      label: "Editor",
      icon: Users,
      locked: !userRoles.isEditor,
      lockMessage: "You'll unlock this when a Founder adds you as an Editor.",
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

  // Get display info from wallet
  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";
  const displayName = address ? `User ${address.slice(0, 6)}` : "Connect Wallet";

  // Show wallet connection prompt if no address
  if (!address) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <LiquidGlass size={120} tint="rgba(113, 113, 130, 0.15)" className="mx-auto">
            <Lock className="w-10 h-10 opacity-50" />
          </LiquidGlass>
          <div className="space-y-2">
            <h3 className="font-mono text-xl">Connect Wallet</h3>
            <p className="text-muted-foreground">
              Please connect your wallet to view your profile and magazines.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-full"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
        <div className="w-full px-6 lg:px-12 py-8">
          <button
            onClick={() => router.push("/opencalls")}
            className="text-sm text-muted-# 2025/punto/punto-base/app/profile/page.tsx

I'll continue from where I left off, completing the profile page implementation:

```tsx
            transition-colors mb-6"
          >
            ← Back to Open Calls
          </button>

          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <LiquidGlass size={80} tint="rgba(236, 236, 240, 0.3)">
              <span className="text-2xl">{displayName[0]}</span>
            </LiquidGlass>
            
            <div className="flex-1 space-y-3">
              <h1 className="font-mono text-3xl tracking-tight">{displayName}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Wallet:</span>
                  <code className="bg-muted px-2 py-1">{displayAddress}</code>
                  {address && (
                    <button
                      onClick={() => handleCopy(address)}
                      className="hover:text-accent transition-colors"
                      title="Copy full address"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                {userRoles.isFounder && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Founder</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <LiquidGlass size={40} tint="rgba(34, 197, 94, 0.15)">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </LiquidGlass>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="text-xl font-mono">0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <LiquidGlass size={40} tint="rgba(255, 165, 0, 0.15)">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </LiquidGlass>
                  <div>
                    <p className="text-sm text-muted-foreground">Open Issues</p>
                    <p className="text-xl font-mono">
                      {magazines.reduce((count, mag) => 
                        count + mag.issues.filter(issue => issue.status === "OPEN").length, 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <LiquidGlass size={40} tint="rgba(59, 130, 246, 0.15)">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </LiquidGlass>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payouts</p>
                    <p className="text-xl font-mono">
                      ${(magazines.reduce((total, mag) => 
                        total + mag.issues.reduce((issueTotal, issue) => 
                          issueTotal + issue.pending_payment_amount, 0
                        ), 0) / 100).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <LiquidGlass size={40} tint="rgba(147, 51, 234, 0.15)">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </LiquidGlass>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Magazines</p>
                    <p className="text-xl font-mono">{magazines.length}</p>
                  </div>
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
      <div className="w-full px-6 lg:px-12 py-12">
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
                    onClick={() => router.push("/opencalls")}
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
                        onClick={() => router.push(`/${access.magazine.toLowerCase().replace(/\s+/g, '-')}/issue-8`)}
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
              onClick={() => router.push("/opencalls")}
              className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2 rounded-full"
            >
              Explore Open Calls
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Founder Tab */}
        {activeTab === "founder" && (
          <div className="space-y-12">
            {/* Your Magazines */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                  Your Magazines
                </h2>
                <button
                  onClick={() => router.push("/new")}
                  className="px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2 rounded-full text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Magazine
                </button>
              </div>

              {isLoadingMagazines ? (
                <div className="bg-muted/30 backdrop-blur-sm p-12 text-center">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading your magazines...</p>
                </div>
              ) : magazines.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {magazines.map((magazine) => {
                    const latestIssue = magazine.issues[0];
                    const totalSubmissions = magazine.issues.reduce((sum, issue) => sum + issue.submission_count, 0);
                    const totalAccepted = magazine.issues.reduce((sum, issue) => sum + issue.accepted_count, 0);
                    const totalPending = magazine.issues.reduce((sum, issue) => sum + issue.pending_payment_amount, 0);

                    return (
                      <div key={magazine.id} className="bg-card/50 backdrop-blur-sm p-6 rounded-lg hover:bg-card/80 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-mono text-xl mb-1">{magazine.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{magazine.description}</p>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                latestIssue?.status === "OPEN" 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : latestIssue?.status === "CLOSED"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              }`}>
                                {latestIssue?.status || "No Issues"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-mono text-accent">{magazine.issues.length}</p>
                            <p className="text-xs text-muted-foreground">Issues</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-mono text-accent">{totalSubmissions}</p>
                            <p className="text-xs text-muted-foreground">Submissions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-mono text-accent">{totalAccepted}</p>
                            <p className="text-xs text-muted-foreground">Accepted</p>
                          </div>
                        </div>

                        {totalPending > 0 && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-orange-800 dark:text-orange-400">Pending Payouts</span>
                              <span className="font-mono font-semibold text-orange-800 dark:text-orange-400">
                                ${(totalPending / 100).toFixed(2)} USDC
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 mb-4">
                          {latestIssue && (
                            <button
                              onClick={() => router.push(`/${magazine.slug}/issue/${latestIssue.issue_number}/review`)}
                              className="w-full px-4 py-3 bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg text-sm flex items-center justify-between"
                            >
                              <span>Review Submissions</span>
                              <span className="font-mono">{latestIssue.submission_count}</span>
                            </button>
                          )}
                          {totalPending > 0 && latestIssue && (
                            <button
                              onClick={() => router.push(`/${magazine.slug}/issue/${latestIssue.issue_number}/pay`)}
                              className="w-full px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-lg text-sm flex items-center justify-between"
                            >
                              <span>Pay Winners →</span>
                              <span className="font-mono">${(totalPending / 100).toFixed(2)}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-muted/30 backdrop-blur-sm p-12 text-center space-y-4 rounded-lg">
                  <LiquidGlass size={120} tint="rgba(113, 113, 130, 0.15)" className="mx-auto">
                    <BookOpen className="w-10 h-10 opacity-50" />
                  </LiquidGlass>
                  <div className="space-y-2">
                    <h3 className="font-mono text-xl">No Magazines Yet</h3>
                    <p className="text-muted-foreground">
                      Start your publishing journey by creating your first magazine.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/new")}
                    className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors inline-flex items-center gap-2 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Magazine
                  </button>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => router.push("/new")}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-lg hover:bg-card/80 transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <LiquidGlass size={40} tint="rgba(34, 197, 94, 0.15)">
                      <Plus className="w-5 h-5 text-green-600" />
                    </LiquidGlass>
                    <h3 className="font-mono">New Issue Wizard</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a new magazine issue from an event or theme
                  </p>
                </button>

                <button
                  onClick={() => router.push("/opencalls")}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-lg hover:bg-card/80 transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <LiquidGlass size={40} tint="rgba(59, 130, 246, 0.15)">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </LiquidGlass>
                    <h3 className="font-mono">Browse Open Calls</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Discover and submit to active open calls
                  </p>
                </button>

                <button
                  onClick={() => router.push("/profile")}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-lg hover:bg-card/80 transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <LiquidGlass size={40} tint="rgba(147, 51, 234, 0.15)">
                      <Users className="w-5 h-5 text-purple-600" />
                    </LiquidGlass>
                    <h3 className="font-mono">My Profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View your submissions, payments, and library
                  </p>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Founder Tab (Locked) */}
        {activeTab === "founder" && tabs[1].locked && (
          <div className="text-center py-12 space-y-6">
            <LiquidGlass size={120} tint="rgba(113, 113, 130, 0.15)" className="mx-auto">
              <Lock className="w-10 h-10 opacity-50" />
            </LiquidGlass>
            <div className="space-y-2">
              <h3 className="font-mono text-xl">Founder Tools Locked</h3>
              <p className="text-muted-foreground">{tabs[1].lockMessage}</p>
            </div>
            <button 
              onClick={() => router.push("/new")}
              className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-full"
            >
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
                      onClick={() => router.push(`/${access.magazine.toLowerCase().replace(/\s+/g, '-')}/issue-8`)}
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
