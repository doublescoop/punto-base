"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, X, Users, Check } from "lucide-react";

type WizardStep = "event" | "topics" | "team" | "theme" | "treasury" | "review";

interface Topic {
  id: string;
  title: string;
  slotsNeeded: number;
  category: string;
}

interface TeamMember {
  id: string;
  role: "founder" | "editor";
  wallet: string;
  email: string;
}

const mockThemes = [
  {
    id: "clean-gallery",
    name: "Clean Gallery",
    description: "Playfair Display (H1–H3), Inter (body)",
    preview: "Clean, minimal design with elegant typography"
  },
  {
    id: "playful-experimental",
    name: "Playful Experimental", 
    description: "Gasoek One (all)",
    preview: "Bold, experimental design with dynamic layouts"
  }
];

const mockAccentColors = [
  { id: "blue", name: "Ocean Blue", value: "#3b82f6" },
  { id: "purple", name: "Royal Purple", value: "#8b5cf6" },
  { id: "green", name: "Forest Green", value: "#10b981" },
  { id: "orange", name: "Sunset Orange", value: "#f59e0b" },
  { id: "red", name: "Crimson Red", value: "#ef4444" },
  { id: "pink", name: "Rose Pink", value: "#ec4899" },
  { id: "teal", name: "Teal Blue", value: "#14b8a6" },
  { id: "indigo", name: "Deep Indigo", value: "#6366f1" },
  { id: "yellow", name: "Golden Yellow", value: "#eab308" },
  { id: "gray", name: "Slate Gray", value: "#64748b" },
  { id: "emerald", name: "Emerald Green", value: "#059669" },
  { id: "violet", name: "Deep Violet", value: "#7c3aed" }
];

export default function NewIssueWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<WizardStep>("event");
  const [eventUrl, setEventUrl] = useState("");
  const [scrapedEventData, setScrapedEventData] = useState<Record<string, unknown> | null>(null);
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "", slotsNeeded: 1, category: "picture" }
  ]);
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "1", role: "founder", wallet: "", email: "" }
  ]);
  const [selectedTheme, setSelectedTheme] = useState(mockThemes[0].id);
  const [selectedColors, setSelectedColors] = useState<string[]>(["blue", "purple"]);
  const [treasuryAmount, setTreasuryAmount] = useState("");

  // Read event data from URL parameters
  useEffect(() => {
    const eventDataParam = searchParams.get('eventData');
    if (eventDataParam) {
      try {
        const eventData = JSON.parse(eventDataParam);
        setScrapedEventData(eventData);
        setEventUrl(eventData.url || "");
      } catch (error) {
        console.error('Failed to parse event data:', error);
      }
    }
  }, [searchParams]);

  const steps = [
    { id: "event", title: "Event", icon: "📅" },
    { id: "topics", title: "Topics", icon: "📝" },
    { id: "team", title: "Team", icon: "👥" },
    { id: "theme", title: "Theme", icon: "🎨" },
    { id: "treasury", title: "Treasury", icon: "💰" },
    { id: "review", title: "Review", icon: "✅" }
  ];

  const addTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: "",
      slotsNeeded: 1,
      category: "picture"
    };
    setTopics([...topics, newTopic]);
  };

  const removeTopic = (id: string) => {
    if (topics.length > 1) {
      setTopics(topics.filter(topic => topic.id !== id));
    }
  };

  const updateTopic = (id: string, field: keyof Topic, value: string | number) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, [field]: value } : topic
    ));
  };

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      role: "editor",
      wallet: "",
      email: ""
    };
    setTeam([...team, newMember]);
  };

  const removeTeamMember = (id: string) => {
    if (team.length > 1) {
      setTeam(team.filter(member => member.id !== id));
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeam(team.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const toggleColor = (colorId: string) => {
    if (selectedColors.includes(colorId)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter(id => id !== colorId));
      }
    } else {
      if (selectedColors.length < 2) {
        setSelectedColors([...selectedColors, colorId]);
      }
    }
  };

  const nextStep = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id as WizardStep);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as WizardStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "event":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-2xl mb-4">Event Information</h2>
              <p className="text-muted-foreground mb-6">
                {scrapedEventData ? "Event data successfully scraped!" : "Start by providing the event URL that will inspire your magazine issue."}
              </p>
            </div>
            
            {scrapedEventData ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-mono text-lg mb-2 text-green-800 dark:text-green-200">✅ Event Data Scraped Successfully</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Found: <strong>{scrapedEventData.title as string}</strong> on {scrapedEventData.date as string}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Organization: {(scrapedEventData.organization as any)?.name || 'Unknown'} • 
                    Hosts: {(scrapedEventData.hosts as any[])?.length || 0} • 
                    Location: {(scrapedEventData.location as any)?.name || 'Unknown'} • 
                    Participants: {(scrapedEventData.participants as any[])?.length || 0}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-mono text-lg mb-4">Raw JSON Data</h3>
                  <pre className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 overflow-auto text-xs text-muted-foreground max-h-96">
                    {JSON.stringify(scrapedEventData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Event Page URL</label>
                <input
                  type="url"
                  placeholder="https://lu.ma/your-event or https://sociallayer.io/event/..."
                  value={eventUrl}
                  onChange={(e) => setEventUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Supports Luma, SocialLayer, and other event platforms
                </p>
              </div>
            )}
          </div>
        );

      case "topics":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-2xl mb-4">Topics & Content</h2>
              <p className="text-muted-foreground mb-6">
                Define 5-6 topics for your magazine issue. Each topic will become an open call for submissions.
              </p>
            </div>
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div key={topic.id} className="bg-card/50 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-mono">Topic {index + 1}</h3>
                    {topics.length > 1 && (
                      <button
                        onClick={() => removeTopic(topic.id)}
                        className="p-1 hover:bg-muted/50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Fragments of Urban Decay"
                        value={topic.title}
                        onChange={(e) => updateTopic(topic.id, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Slots Needed</label>
                      <input
                        type="number"
                        min="1"
                        value={topic.slotsNeeded}
                        onChange={(e) => updateTopic(topic.id, "slotsNeeded", parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addTopic}
                className="w-full py-3 border-2 border-dashed border-border/50 hover:border-accent transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Topic
              </button>
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-2xl mb-4">Team Setup</h2>
              <p className="text-muted-foreground mb-6">
                Add team members who will help curate submissions. You need at least one Editor in addition to yourself as Founder.
              </p>
            </div>
            <div className="space-y-4">
              {team.map((member, index) => (
                <div key={member.id} className="bg-card/50 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-mono">
                      {member.role === "founder" ? "Founder" : `Editor ${index}`}
                    </h3>
                    {team.length > 1 && member.role !== "founder" && (
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="p-1 hover:bg-muted/50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Wallet Address</label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={member.wallet}
                        onChange={(e) => updateTeamMember(member.id, "wallet", e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="editor@example.com"
                        value={member.email}
                        onChange={(e) => updateTeamMember(member.id, "email", e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addTeamMember}
                className="w-full py-3 border-2 border-dashed border-border/50 hover:border-accent transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Add Editor
              </button>
            </div>
          </div>
        );

      case "theme":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-2xl mb-4">Theme & Colors</h2>
              <p className="text-muted-foreground mb-6">
                Choose your magazine&apos;s visual theme and accent colors.
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-mono text-lg mb-4">Design Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedTheme === theme.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <h4 className="font-mono mb-2">{theme.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{theme.description}</p>
                      <p className="text-xs text-muted-foreground">{theme.preview}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-lg mb-4">Accent Colors (Choose 2)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mockAccentColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        selectedColors.includes(color.id)
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded mb-2"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-xs font-medium">{color.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "treasury":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-2xl mb-4">Treasury Setup</h2>
              <p className="text-muted-foreground mb-6">
                Set up your Safe wallet address for managing payments and treasury.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Safe Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={treasuryAmount}
                  onChange={(e) => setTreasuryAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This Safe will manage all payments for contributors and team members.
                </p>
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-2xl mb-4">Review & Create</h2>
              <p className="text-muted-foreground mb-6">
                Review your magazine settings before creating the issue.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Event</h3>
                <p className="text-sm text-muted-foreground">{eventUrl || "No event URL provided"}</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Topics ({topics.length})</h3>
                <div className="space-y-2">
                  {topics.map((topic, index) => (
                    <div key={topic.id} className="flex justify-between text-sm">
                      <span>{topic.title || `Topic ${index + 1}`}</span>
                      <span className="text-muted-foreground">{topic.slotsNeeded} slots</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Team ({team.length} members)</h3>
                <div className="space-y-2">
                  {team.map((member, index) => (
                    <div key={member.id} className="flex justify-between text-sm">
                      <span>{member.role === "founder" ? "Founder" : `Editor ${index}`}</span>
                      <span className="text-muted-foreground">{member.wallet || "No wallet set"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Theme</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Design:</span>
                    <span className="text-muted-foreground">
                      {mockThemes.find(t => t.id === selectedTheme)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Colors:</span>
                    <span className="text-muted-foreground">
                      {selectedColors.map(id => 
                        mockAccentColors.find(c => c.id === id)?.name
                      ).join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Treasury</h3>
                <p className="text-sm text-muted-foreground">
                  Safe Address: {treasuryAmount || "No address provided"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push("/profile")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>

          <div className="space-y-4">
            <h1 className="font-mono text-3xl tracking-tight">New Issue Wizard</h1>
            <p className="text-muted-foreground">
              Create a new magazine issue in 6 simple steps
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
                    isActive ? "bg-accent text-accent-foreground" : 
                    isCompleted ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                    "bg-muted/50 text-muted-foreground"
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                    <span className="text-sm font-medium">{step.title}</span>
                    {isCompleted && <Check className="w-4 h-4" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-px mx-2 ${
                      isCompleted ? "bg-green-200 dark:bg-green-800" : "bg-border"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {renderStepContent()}
      </main>

      {/* Navigation */}
      <div className="border-t border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === "event"}
              className="px-6 py-3 border border-border hover:border-accent transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep === "review" ? (
              <button
                onClick={() => {
                  // TODO: Create the magazine issue
                  router.push("/profile");
                }}
                className="px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Create Magazine Issue
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
