"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
// import { ArrowRight, ExternalLink } from "lucide-react";

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const router = useRouter();
  const [eventUrl, setEventUrl] = useState("");

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  const handleStartZine = async () => {
    if (eventUrl.trim()) {
      try {
        // Call the scraper API
        const response = await fetch(`/api/scrape-event?url=${encodeURIComponent(eventUrl)}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Navigate to /new page with the scraped data
          const params = new URLSearchParams({
            eventData: JSON.stringify(result.data)
          });
          router.push(`/new?${params.toString()}`);
        } else {
          console.error('Failed to scrape event:', result.error);
          // Still navigate to /new but without data
          router.push('/new');
        }
      } catch (error) {
        console.error('Error scraping event:', error);
        // Still navigate to /new but without data
        router.push('/new');
      }
    }
  };

  const handleBrowseOpenCalls = () => {
    router.push("/opencalls");
  };

  return (
    <div className="min-h-screen gallery-clean">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="w-full px-6 lg:px-12 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="headline-bold text-foreground">
                PUNTO
                </h1>
                <p className="subtitle-artistic">
                  make zine, we write each line at punto de reunión.
                </p>
                <p className="text-clean text-lg text-muted-foreground max-w-md leading-relaxed">
                Collective Zine Making Tool with easy open call operations.
                oh, did we mention instant payouts on chain? instant sharing to participants with Farcaster? 

                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-accent text-accent-foreground px-8 py-4 rounded-none font-mono text-sm uppercase tracking-wider hover:bg-red-700 transition-colors">
                  Start Creating
                </button>
                <button className="border-2 border-accent px-8 py-4 rounded-none font-mono text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                  Browse Issues
                </button>
              </div>
            </div>

            {/* Right Content - Event URL Input */}
            <div className="gallery-card p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="font-display text-2xl text-foreground">Start making a post-event Zine!</h3>
                <p className="text-clean text-muted-foreground">
                  Paste your event page URL and we&apos;ll take it from there!
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder="https://lu.ma/event or https://sociallayer.io/event/..."
                    value={eventUrl}
                    onChange={(e) => setEventUrl(e.target.value)}
                    className="flex-1 px-4 py-4 bg-background border-2 border-border focus:border-accent focus:outline-none text-base"
                  />
                  <button
                    onClick={handleStartZine}
                    disabled={!eventUrl.trim()}
                    className="bg-accent text-white px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-sm uppercase tracking-wider"
                  >
                    Start
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports Luma, SocialLayer, and other event platforms
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground font-mono uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Browse Open Calls */}
              <div className="space-y-4">
                <h4 className="font-display text-xl text-foreground">Browse Open calls for existing zines</h4>
                <p className="text-clean text-muted-foreground">
                  Discover active open calls from independent magazines and submit your work
                </p>
                <button
                  onClick={handleBrowseOpenCalls}
                  className="w-full border-2 border-accent px-6 py-4 text-accent hover:bg-accent hover:text-white transition-colors font-mono text-sm uppercase tracking-wider"
                >
                  Explore Open Calls
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Component - Fixed Position */}
        <div className="fixed top-6 right-6 z-20">
          <Wallet />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-background/50 backdrop-blur-sm">
        <div className="w-full px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="font-display text-lg text-foreground">PUNTO</h4>
              <p className="text-clean text-sm text-muted-foreground">
                Cellective Zine Making Tool with easy open call operations.
              </p>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-mono text-sm uppercase tracking-wider text-foreground">Platform</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/opencalls" className="hover:text-accent transition-colors">Open Calls</Link></li>
                <li><Link href="/profile" className="hover:text-accent transition-colors">Profile</Link></li>
                <li><Link href="/new" className="hover:text-accent transition-colors">Create Magazine</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-mono text-sm uppercase tracking-wider text-foreground">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">About</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-mono text-sm uppercase tracking-wider text-foreground">Connect</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Newsletter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/20 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2025 Punto. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}