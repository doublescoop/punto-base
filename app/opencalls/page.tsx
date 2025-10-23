"use client";

import { useState, useMemo, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter, useSearchParams } from "next/navigation";
import { OpenCallCard } from "../../components/OpenCallCard";
import { SubmissionDetail } from "../../components/SubmissionDetail";
import { SubmissionForm } from "../../components/SubmissionForm";
import { ChevronDown, User } from "lucide-react";

interface OpenCall {
  id: string;
  title: string;
  magazine: string;
  dueDate: string;
  bounty: string;
  category: string;
}

interface Submission {
  id: string;
  content: string;
  type: string;
  author: string;
}

const openCalls: OpenCall[] = [
  {
    id: "1",
    title: "Fragments of Urban Decay",
    magazine: "Concrete & Light",
    dueDate: "Oct 22, 2025",
    bounty: "$500",
    category: "picture",
  },
  {
    id: "2",
    title: "Letters to My Younger Self",
    magazine: "Ephemera Quarterly",
    dueDate: "Dec 1, 2025",
    bounty: "$300",
    category: "shorttext",
  },
  {
    id: "3",
    title: "Sonic Meditations on Time",
    magazine: "Frequency Collective",
    dueDate: "Nov 30, 2025",
    bounty: "$750",
    category: "audio",
  },
  {
    id: "4",
    title: "Reimagining Public Spaces",
    magazine: "The Urban Review",
    dueDate: "Jan 10, 2026",
    bounty: "$1,000",
    category: "longtext",
  },
  {
    id: "5",
    title: "One Minute of Silence",
    magazine: "Moving Image Lab",
    dueDate: "Dec 20, 2025",
    bounty: "$600",
    category: "video",
  },
  {
    id: "6",
    title: "Objects That Changed You",
    magazine: "Material Culture",
    dueDate: "Oct 24, 2025",
    bounty: "$400",
    category: "picture",
  },
  {
    id: "7",
    title: "Whispers in the Archive",
    magazine: "Ephemera Quarterly",
    dueDate: "Oct 20, 2025",
    bounty: "$5",
    category: "audio",
  },
];

const mockSubmissions: { [key: string]: Submission[] } = {
  "1": [
    {
      id: "s1",
      content: "",
      type: "picture",
      author: "Elena Martinez",
    },
    {
      id: "s2",
      content: "",
      type: "picture",
      author: "James Chen",
    },
    {
      id: "s3",
      content: "",
      type: "picture",
      author: "Sofia Bergström",
    },
  ],
  "2": [
    {
      id: "s4",
      content: "Dear younger me, you were right to trust your instincts when everyone else told you to conform. The path less traveled was always yours to take. Remember the afternoon you spent in the library, discovering Borges? That moment changed everything. Your curiosity wasn't a flaw; it was your compass. The art you made in secret will one day be your voice.",
      type: "shorttext",
      author: "Marcus Webb",
    },
    {
      id: "s5",
      content: "I wish I could tell you that the heartbreak at seventeen wasn't the end of the world. It felt like it, I know. But that pain taught you empathy, showed you the depths of feeling that would later inform every word you write. You survived. You thrived. And that person you thought you couldn't live without? You barely remember their face now.",
      type: "shorttext",
      author: "Yuki Tanaka",
    },
  ],
  "3": [
    {
      id: "s6",
      content: "",
      type: "audio",
      author: "Alex Kowalski",
    },
    {
      id: "s7",
      content: "",
      type: "audio",
      author: "Priya Sharma",
    },
  ],
  "4": [
    {
      id: "s8",
      content: "The plaza was never just a plaza. It was a stage for daily life, a commons where strangers became neighbors through the simple act of coexistence. When the city council announced plans to privatize the space, transforming it into a shopping center, something fundamental was lost. Public space is not empty space waiting to be filled with commerce. It is the very fabric of democracy, the physical manifestation of our social contract...",
      type: "longtext",
      author: "David Okonkwo",
    },
  ],
  "5": [
    {
      id: "s9",
      content: "",
      type: "video",
      author: "Lena Andersen",
    },
  ],
  "6": [
    {
      id: "s10",
      content: "",
      type: "picture",
      author: "Rafael Santos",
    },
  ],
  "7": [
    {
      id: "s11",
      content: "",
      type: "audio",
      author: "Maya Thompson",
    },
  ],
};

export default function OpenCallsPage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // State for the Open Calls UI
  const [view, setView] = useState<"list" | "voting" | "submission">("list");
  const [selectedCall, setSelectedCall] = useState<OpenCall | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [filterHighBounty, setFilterHighBounty] = useState(false);
  const [filterThisWeek, setFilterThisWeek] = useState(false);
  const [isAuthenticated] = useState(true); // Simulating logged in user
  
  // Get magazine filter from URL
  const magazineFilter = searchParams.get('magazine');

  // Get unique magazines and formats
  const magazines = ["all", ...Array.from(new Set(openCalls.map((call) => call.magazine)))];
  const formats = ["all", "picture", "shorttext", "longtext", "video", "audio"];

  // Filter open calls
  const filteredCalls = useMemo(() => {
    return openCalls.filter((call) => {
      // Magazine filter
      if (selectedMagazine !== "all" && call.magazine !== selectedMagazine) {
        return false;
      }

      // Format filter
      if (selectedFormat !== "all" && call.category !== selectedFormat) {
        return false;
      }

      // Bounty filter (over $10)
      if (filterHighBounty) {
        const bountyAmount = parseInt(call.bounty.replace(/\$|,/g, ""));
        if (bountyAmount <= 10) {
          return false;
        }
      }

      // Due date this week filter
      if (filterThisWeek) {
        const today = new Date("2025-10-19");
        const dueDate = new Date(call.dueDate);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        
        if (dueDate < today || dueDate > weekEnd) {
          return false;
        }
      }

      // URL magazine filter
      if (magazineFilter) {
        const magazineSlug = call.magazine.toLowerCase().replace(/\s+/g, '-');
        if (magazineSlug !== magazineFilter && !call.magazine.toLowerCase().includes(magazineFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [selectedMagazine, selectedFormat, filterHighBounty, filterThisWeek, magazineFilter]);

  // Handle different views
  if (view === "submission" && selectedCall) {
    return (
      <SubmissionForm
        openCall={selectedCall}
        onBack={() => setView("voting")}
        onSubmitted={() => {
          setView("list");
          setSelectedCall(null);
        }}
      />
    );
  }

  if (view === "voting" && selectedCall) {
    return (
      <SubmissionDetail
        openCall={selectedCall}
        submissions={mockSubmissions[selectedCall.id] || []}
        onBack={() => {
          setView("list");
          setSelectedCall(null);
        }}
        onSubmitMine={() => setView("submission")}
      />
    );
  }

  return (
    <div className="min-h-screen gallery-clean">
        {/* Header */}
        <header className="border-b border-border/20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-6">
                <button
                  onClick={() => router.push("/")}
                  className="text-sm text-muted-foreground hover:text-accent transition-colors mb-4 block font-mono uppercase tracking-wider"
                >
                  ← Back to Home
                </button>
               <h1 className="headline-bold text-foreground">OPEN CALLS</h1>
               <p className="subtitle-artistic">
                 {magazineFilter ? `Open calls for ${magazineFilter.replace(/-/g, ' ')}` : 'submit your work, we write each line'}
               </p>
                <p className="text-clean text-lg text-muted-foreground max-w-md leading-relaxed">
                  Submit your work to independent magazines and publications. Get published and paid for your creative contributions.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Wallet Component */}
                <Wallet />
                
                {isAuthenticated && (
                  <button
                    onClick={() => router.push("/profile")}
                    className="border-2 border-accent px-6 py-3 flex items-center gap-2 hover:bg-accent hover:text-white transition-all relative font-mono text-sm uppercase tracking-wider"
                  >
                    <User className="w-4 h-4" />
                    <span>My Page</span>
                    {/* Notification dot - shows when there are submissions in review */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b border-border/20 bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Magazine Filter */}
              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block font-mono">
                  Magazine
                </label>
                <select
                  value={selectedMagazine}
                  onChange={(e) => setSelectedMagazine(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border focus:border-accent focus:outline-none cursor-pointer font-mono text-sm"
                >
                  {magazines.map((mag) => (
                    <option key={mag} value={mag}>
                      {mag === "all" ? "All Magazines" : mag}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-12 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Format Filter */}
              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block font-mono">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-4 py-3 bg-background border-2 border-border focus:border-accent focus:outline-none cursor-pointer font-mono text-sm"
                >
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format === "all" ? "All Formats" : format}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-12 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Bounty Filter */}
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block font-mono">
                  Bounty
                </label>
                <button
                  onClick={() => setFilterHighBounty(!filterHighBounty)}
                  className={`w-full px-4 py-3 text-left transition-all font-mono text-sm ${
                    filterHighBounty
                      ? "bg-accent text-white"
                      : "bg-background border-2 border-border hover:border-accent"
                  }`}
                >
                  Over $10
                </button>
              </div>

              {/* Due Date Filter */}
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block font-mono">
                  Due Date
                </label>
                <button
                  onClick={() => setFilterThisWeek(!filterThisWeek)}
                  className={`w-full px-4 py-3 text-left transition-all font-mono text-sm ${
                    filterThisWeek
                      ? "bg-accent text-white"
                      : "bg-background border-2 border-border hover:border-accent"
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Open Calls */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No open calls match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCalls.map((call) => (
                <OpenCallCard
                  key={call.id}
                  {...call}
                  onClick={() => {
                    setSelectedCall(call);
                    setView("voting");
                  }}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/20 mt-24">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>© 2025 Open Calls Network</div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-accent transition-colors">
                  About
                </a>
                <a href="#" className="hover:text-accent transition-colors">
                  Guidelines
                </a>
                <a href="#" className="hover:text-accent transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
