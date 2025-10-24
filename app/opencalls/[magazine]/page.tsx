"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { OpenCallCard } from "../../../components/OpenCallCard";
import { SubmissionDetail } from "../../../components/SubmissionDetail";
import { SubmissionForm } from "../../../components/SubmissionForm";
import { ChevronDown, User, ArrowLeft } from "lucide-react";

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
  "7": [
    {
      id: "s11",
      content: "",
      type: "audio",
      author: "Maya Thompson",
    },
  ],
};

export default function MagazineOpenCallsPage() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();
  const router = useRouter();
  const params = useParams();
  const magazineName = params.magazine as string;

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // State for the Open Calls UI
  const [view, setView] = useState<"list" | "voting" | "submission">("list");
  const [selectedCall, setSelectedCall] = useState<OpenCall | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [filterHighBounty, setFilterHighBounty] = useState(false);
  const [filterThisWeek, setFilterThisWeek] = useState(false);
  const [isAuthenticated] = useState(true); // Simulating logged in user

  // Get formats
  const formats = ["all", "picture", "shorttext", "longtext", "video", "audio"];

  // Filter open calls for this magazine
  const filteredCalls = useMemo(() => {
    return openCalls.filter((call) => {
      // Magazine filter - convert magazine name to match format
      const callMagazineSlug = call.magazine.toLowerCase().replace(/\s+/g, '-');
      if (callMagazineSlug !== magazineName) {
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

      return true;
    });
  }, [magazineName, selectedFormat, filterHighBounty, filterThisWeek]);

  // Get the magazine display name
  const magazineDisplayName = openCalls.find(call => 
    call.magazine.toLowerCase().replace(/\s+/g, '-') === magazineName
  )?.magazine || magazineName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
    <div className="min-h-screen bg-background">
        {/* Header with Background Image */}
        <header className="border-b border-border/20 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1716653055218-0d4b29004105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXRlcmFyeSUyMG1hZ2F6aW5lJTIwb3BlbiUyMGJvb2t8ZW58MXx8fHwxNzYwOTEyNDIwfDA&ixlib=rb-4.1.0&q=80&w=1080')"
            }}
          />
          <div className="w-full px-6 lg:px-12 py-12 relative">
            <div className="flex items-start justify-between">
              <div>
                <button
                  onClick={() => router.push("/opencalls")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Open Calls
                </button>
                <h1 className="font-mono text-5xl tracking-tight mb-2">{magazineDisplayName}</h1>
                <p className="text-muted-foreground">
                  Open calls from {magazineDisplayName}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Wallet Component */}
                <Wallet />
                
                {isAuthenticated && (
                  <button
                    onClick={() => router.push("/profile")}
                    className="px-4 py-2 flex items-center gap-2 bg-card/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all relative rounded-full"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">My Page</span>
                    {/* Notification dot - shows when there are submissions in review */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
          <div className="w-full px-6 lg:px-12 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Format Filter */}
              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm appearance-none cursor-pointer hover:bg-background transition-colors pr-8 rounded-lg"
                >
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format === "all" ? "All Formats" : format}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-9 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Bounty Filter */}
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Bounty
                </label>
                <button
                  onClick={() => setFilterHighBounty(!filterHighBounty)}
                  className={`w-full px-3 py-2 text-left transition-all rounded-lg ${
                    filterHighBounty
                      ? "bg-accent text-accent-foreground"
                      : "bg-background/50 backdrop-blur-sm hover:bg-background"
                  }`}
                >
                  Over $10
                </button>
              </div>

              {/* Due Date Filter */}
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Due Date
                </label>
                <button
                  onClick={() => setFilterThisWeek(!filterThisWeek)}
                  className={`w-full px-3 py-2 text-left transition-all rounded-lg ${
                    filterThisWeek
                      ? "bg-accent text-accent-foreground"
                      : "bg-background/50 backdrop-blur-sm hover:bg-background"
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Open Calls */}
        <main className="w-full px-6 lg:px-12 py-12">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No open calls from {magazineDisplayName} match your filters.
              </p>
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
          <div className="w-full px-6 lg:px-12 py-8">
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
