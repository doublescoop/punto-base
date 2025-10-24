"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle, BookOpen, Users, DollarSign } from "lucide-react";
import { useAccount } from "wagmi";
import { LiquidGlass } from "../../components/LiquidGlass";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [magazineData, setMagazineData] = useState<any>(null);

  const magazineName = searchParams.get('magazine');
  const issueTitle = searchParams.get('issue');
  const slug = searchParams.get('slug');

  useEffect(() => {
    // If we have magazine data in URL params, we could fetch full details
    // For now, just use the URL params
    if (magazineName && issueTitle) {
      setMagazineData({
        name: magazineName,
        issueTitle: issueTitle,
        slug: slug
      });
    }
  }, [magazineName, issueTitle, slug]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <LiquidGlass size={120} tint="rgba(34, 197, 94, 0.15)" className="mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </LiquidGlass>
            
            <h1 className="font-mono text-4xl mb-4 tracking-tight">
              🎉 Magazine Created Successfully!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-2">
              Your collaborative magazine is now live and ready for submissions.
            </p>
            
            {magazineData && (
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg mt-6 max-w-2xl mx-auto">
                <h2 className="font-mono text-2xl mb-2">{magazineData.name}</h2>
                <p className="text-muted-foreground mb-4">{magazineData.issueTitle}</p>
                {address && (
                  <div className="text-sm text-muted-foreground">
                    <span>Founded by: </span>
                    <code className="bg-muted px-2 py-1 rounded">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* What Happens Next */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg text-center">
              <LiquidGlass size={60} tint="rgba(59, 130, 246, 0.15)" className="mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </LiquidGlass>
              <h3 className="font-mono text-lg mb-2">Open Calls Published</h3>
              <p className="text-sm text-muted-foreground">
                Your magazine topics are now visible on the Open Calls page for contributors to discover and submit to.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg text-center">
              <LiquidGlass size={60} tint="rgba(147, 51, 234, 0.15)" className="mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </LiquidGlass>
              <h3 className="font-mono text-lg mb-2">Contributors Can Submit</h3>
              <p className="text-sm text-muted-foreground">
                People can now find your topics, submit their content, and earn bounties for accepted submissions.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg text-center">
              <LiquidGlass size={60} tint="rgba(34, 197, 94, 0.15)" className="mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </LiquidGlass>
              <h3 className="font-mono text-lg mb-2">Review & Pay Winners</h3>
              <p className="text-sm text-muted-foreground">
                You'll review submissions, select winners, and pay them directly from your magazine treasury.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => router.push('/profile?tab=founder')}
              className="bg-accent text-accent-foreground p-6 rounded-lg hover:bg-accent/90 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-lg">Manage Your Magazine</h3>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm opacity-90">
                View submissions, manage issues, and track your magazine's performance from your founder dashboard.
              </p>
            </button>

            <button
              onClick={() => router.push('/opencalls')}
              className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-lg hover:bg-card/80 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-lg">See Your Open Calls</h3>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-sm text-muted-foreground">
                Check how your magazine appears to potential contributors on the Open Calls page.
              </p>
            </button>
          </div>

          {/* Magazine Details */}
          {magazineData?.slug && (
            <div className="bg-muted/30 backdrop-blur-sm p-6 rounded-lg text-center">
              <h3 className="font-mono text-lg mb-2">Your Magazine URL</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share this link with potential contributors:
              </p>
              <code className="bg-background px-4 py-2 rounded border text-sm">
                {window.location.origin}/{magazineData.slug}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${magazineData.slug}`);
                  // Could add toast here
                }}
                className="ml-3 px-3 py-1 bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-colors text-sm rounded"
              >
                Copy
              </button>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="text-center mt-12 pt-8 border-t border-border/30">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}