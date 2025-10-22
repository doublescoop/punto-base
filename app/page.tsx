"use client";

import { useState, useMemo, useEffect } from "react";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
// import { useQuickAuth } from "@coinbase/onchainkit/minikit";

import { OpenCallCard } from "../components/OpenCallCard";
import { SubmissionDetail } from "../components/SubmissionDetail";
import { SubmissionForm } from "../components/SubmissionForm";
import { MyPage } from "../components/MyPage";
import { MagazineIssue } from "../components/MagazineIssue";
import { ArticleDetail } from "../components/ArticleDetail";
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

// Mock magazine issue data
interface MagazineIssue {
  magazineName: string;
  season: string;
  year: string;
  volume: string;
  number: string;
  coverImageUrl?: string;
  articles: Article[];
}

interface Article {
  id: string;
  category: string;
  authors: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

const mockMagazineIssues: { [key: string]: MagazineIssue } = {
  "access-1": {
    magazineName: "lobster",
    season: "Spring",
    year: "2022",
    volume: "24",
    number: "1",
    coverImageUrl: undefined, // Placeholder
    articles: [
      {
        id: "art-1",
        category: "Conversation",
        authors: "Kaja Silverman and Carrie Schneider",
        title: "Future Shock",
        subtitle: "Many people who all around me will ultimately reach for mine in the middle of the night—and find it under my pillow, although I don't remember putting it there.",
        imageUrl: undefined,
      },
      {
        id: "art-2",
        category: "REVIEW",
        authors: "Anuradha Vikram",
        title: "Uncanny Views: Reflections on the Human in the Age of AI",
        subtitle: "Uncanny Valley: Being Human in the Age of AI by Young Museum, San Francisco February 12, 2020-June 27, 2021",
        imageUrl: undefined,
      },
      {
        id: "art-3",
        category: "Conversation",
        authors: "Phil Chang and John Zujiang Wu",
        title: "Not Art, Not Yet Art",
        subtitle: "A conversation about the boundaries of artistic practice and commercial work.",
        imageUrl: undefined,
      },
      {
        id: "art-4",
        category: "ARTIST'S PROJECT",
        authors: "John Zujiang Wu",
        title: "Office Suite",
        subtitle: "Photographic documentation of abandoned commercial spaces in Los Angeles.",
        imageUrl: undefined,
      },
    ],
  },
  "access-2": {
    magazineName: "Concrete & Light",
    season: "Fall",
    year: "2024",
    volume: "12",
    number: "3",
    coverImageUrl: undefined,
    articles: [
      {
        id: "art-5",
        category: "Essay",
        authors: "Marcus Webb",
        title: "Urban Archaeologies",
        subtitle: "Excavating memory through the built environment.",
        imageUrl: undefined,
      },
      {
        id: "art-6",
        category: "Portfolio",
        authors: "Elena Martinez",
        title: "Concrete Dreams",
        subtitle: "A photographic series exploring brutalist architecture.",
        imageUrl: undefined,
      },
    ],
  },
};

// Mock article content with footnotes
interface Footnote {
  number: number;
  text: string;
}

const mockArticleContent: { [key: string]: { content: string; footnotes: Footnote[] } } = {
  "art-1": {
    content: "Many people who all around me will ultimately reach for mine in the middle of the night-and find it under my pillow, although I don't remember putting it there.\n\nThis conversation explores the boundaries between the conscious and unconscious, the remembered and forgotten. We discuss how technology mediates our relationship with memory and how the digital realm creates new forms of intimacy and distance.\n\nThe future is already here, but it's unevenly distributed. We find ourselves caught between nostalgia for a past that never quite existed and anxiety about a future we can barely imagine.",
    footnotes: [
      { number: 1, text: 'Kaja Silverman, "The Acoustic Mirror: The Female Voice in Psychoanalysis and Cinema" (Bloomington: Indiana University Press, 1988), 72.' },
      { number: 2, text: 'See also Vivian Sobchack, "The Address of the Eye: A Phenomenology of Film Experience" (Princeton: Princeton University Press, 1992).' },
      { number: 3, text: 'William Gibson, "The Future Is Already Here - It\'s Just Not Very Evenly Distributed," interview in The Economist, December 4, 2003.' },
    ]
  },
  "art-2": {
    content: "Uncanny Valley: Being Human in the Age of AI opened at the de Young Museum in San Francisco on February 12, 2020, just weeks before the pandemic would fundamentally alter our relationship with technology and each other.\n\nThe exhibition's title refers to the unsettling feeling we experience when confronted with robots or AI that appear almost, but not quite, human. This gap-the uncanny valley-becomes a metaphor for our contemporary condition, caught between the organic and the synthetic, the real and the simulated.\n\nWhat does it mean to be human in an age where machines can generate art, compose music, and write poetry? The exhibition doesn't offer easy answers, but instead presents a series of provocations that force us to confront our assumptions about consciousness, creativity, and what makes us uniquely human.",
    footnotes: [
      { number: 1, text: 'Masahiro Mori, "The Uncanny Valley," first published in 1970, reprinted in IEEE Robotics and Automation Magazine (June 2012).' },
      { number: 2, text: 'See Sigmund Freud, "The Uncanny" (1919), in The Standard Works of Sigmund Freud, vol. 17.' },
      { number: 3, text: 'Hito Steyerl, "A Sea of Data: Apophenia and Pattern (Mis-)Recognition," in How Not to Be Seen: A Fucking Didactic Educational .MOV File (New York and London: Verso, 2017).' },
      { number: 4, text: 'Jan Cheng, "The Out of Place and the Out of Time: Loneliness and the Weird," The Weird and the Eerie (London: Repeater Books, 2016).' },
      { number: 5, text: 'Mark Fisher, "The Out of Place and the Out of Time: Loneliness and the Weird," The Weird and the Eerie (London: Repeater Books, 2016).' },
    ]
  },
  "art-3": {
    content: "The conversation begins with a simple question: When does a commercial project become art? Or perhaps more accurately, when does art become merely commercial?\n\nThese boundaries have always been porous. We discuss the history of artists working on commission, from Renaissance masters to contemporary designers. The difference today is the speed and scale of production, the constant pressure to monetize creativity.\n\nYet there's something liberating in this ambiguity. By refusing to draw strict lines between art and commerce, we open up new possibilities for practice, new ways of thinking about value and meaning in creative work.",
    footnotes: []
  },
  "art-4": {
    content: "Office Suite documents the remnants of late capitalism's infrastructure: abandoned call centers, empty cubicle farms, forsaken break rooms with their fluorescent lights still humming.\n\nThese spaces were designed for efficiency, for the smooth operation of bureaucratic machinery. Now, emptied of their human occupants, they reveal something else: the melancholy beauty of functional architecture stripped of its function.\n\nThe photographs don't mourn or celebrate these spaces. They simply observe, allowing the viewer to project their own feelings about labor, obsolescence, and the future of work onto these vacant rooms.",
    footnotes: [
      { number: 1, text: 'Michel Foucault, "Discipline and Punish: The Birth of the Prison," trans. Alan Sheridan (New York: Vintage Books, 1977).' },
      { number: 2, text: 'See also Georges Perec, "Species of Spaces and Other Pieces," ed. and trans. John Sturrock (London: Penguin Books, 1997).' },
    ]
  },
};

export default function Home() {
  // If you need to verify the user's identity, you can use the useQuickAuth hook.
  // This hook will verify the user's signature and return the user's FID. You can update
  // this to meet your needs. See the /app/api/auth/route.ts file for more details.
  // Note: If you don't need to verify the user's identity, you can get their FID and other user data
  // via `useMiniKit().context?.user`.
  // const { data, isLoading, error } = useQuickAuth<{
  //   userFid: string;
  // }>("/api/auth");

  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  // State for the Open Calls UI
  const [view, setView] = useState<"list" | "voting" | "submission" | "mypage" | "issue" | "article">("list");
  const [selectedCall, setSelectedCall] = useState<OpenCall | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedMagazine, setSelectedMagazine] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [filterHighBounty, setFilterHighBounty] = useState(false);
  const [filterThisWeek, setFilterThisWeek] = useState(false);
  const [isAuthenticated] = useState(true); // Simulating logged in user

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

      return true;
    });
  }, [selectedMagazine, selectedFormat, filterHighBounty, filterThisWeek]);

  // Handle different views
  if (view === "article" && selectedArticle && selectedIssueId) {
    const issue = mockMagazineIssues[selectedIssueId];
    const articleData = mockArticleContent[selectedArticle.id] || { content: "Article content coming soon...", footnotes: [] };
    return (
      <ArticleDetail
        category={selectedArticle.category}
        authors={selectedArticle.authors}
        title={selectedArticle.title}
        subtitle={selectedArticle.subtitle}
        imageUrl={selectedArticle.imageUrl}
        content={articleData.content}
        footnotes={articleData.footnotes}
        magazineName={issue.magazineName}
        season={issue.season}
        year={issue.year}
        volume={issue.volume}
        number={issue.number}
        coverImageUrl={issue.coverImageUrl}
        onBack={() => setView("issue")}
      />
    );
  }

  if (view === "issue" && selectedIssueId) {
    const issue = mockMagazineIssues[selectedIssueId];
    if (!issue) {
      setView("mypage");
      return null;
    }
    
    return (
      <MagazineIssue
        {...issue}
        onBack={() => setView("mypage")}
        onArticleClick={(article: Article) => {
          setSelectedArticle(article);
          setView("article");
        }}
      />
    );
  }

  if (view === "mypage") {
    return (
      <MyPage
        onBack={() => setView("list")}
        onExploreOpenCalls={() => setView("list")}
        onReadIssue={(issueId: string) => {
          setSelectedIssueId(issueId);
          setView("issue");
        }}
      />
    );
  }

  if (view === "submission" && selectedCall) {
    return (
      <SubmissionForm
        openCall={selectedCall}
        onBack={() => setView("voting")}
        onSubmitted={() => {
          setView("mypage");
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
          <div className="max-w-7xl mx-auto px-6 py-12 relative">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-mono text-5xl tracking-tight mb-2">Open Calls</h1>
                <p className="text-muted-foreground">
                  Submit your work to independent magazines and publications
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Wallet Component */}
                <Wallet />
                
                {isAuthenticated && (
                  <button
                    onClick={() => setView("mypage")}
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
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Magazine Filter */}
              <div className="relative">
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Magazine
                </label>
                <select
                  value={selectedMagazine}
                  onChange={(e) => setSelectedMagazine(e.target.value)}
                  className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm appearance-none cursor-pointer hover:bg-background transition-colors pr-8 rounded-lg"
                >
                  {magazines.map((mag) => (
                    <option key={mag} value={mag}>
                      {mag === "all" ? "All Magazines" : mag}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-9 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>

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
