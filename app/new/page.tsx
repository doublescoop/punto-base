"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, X, Users, Check } from "lucide-react";
import { SocialLayerEvent } from "@/types/event";
import { useAccount } from "wagmi";
import { createMagazineTreasury } from "@/lib/treasury";
// import { useSessionToken } from "@/lib/hooks/useSessionToken"; // Removed for MVP

type WizardStep = "event" | "topics" | "theme" | "treasury" | "team" | "review";

interface Topic {
  id: string;
  title: string;
  slotsNeeded: number;
  category: string;
  bountyAmount?: number; // USDC amount for this topic
  format: "short" | "long" | "image" | "open"; // Format for the open call
  isOpenCall: boolean; // Toggle between open call and internal content
  dueDate?: string; // Due date for open calls (ISO date string)
  isTemplate?: boolean; // Whether this topic is from a template (placeholder)
}

interface TeamMember {
  id: string;
  role: "founder" | "editor";
  wallet: string;
  email: string;
  nickname?: string;
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

// Helper function to get default due date (3 days from now)
const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

// Helper function to get due date in X days
const getDueDateInDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Default topic templates for MVP
const defaultTopicTemplates = [
  {
    title: "I'm going to remember this quote forever:",
    format: "short" as const,
    slotsNeeded: 5,
    bountyAmount: 1,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "This photo from the event deserves to be seen!",
    format: "image" as const,
    slotsNeeded: 5,
    bountyAmount: 1,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "Your thoughts on....'___'?",
    format: "long" as const,
    slotsNeeded: 3,
    bountyAmount: 5,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "Would you do this again (Y/N)? Why?",
    format: "short" as const,
    slotsNeeded: 10,
    bountyAmount: 1,
    dueDate: getDueDateInDays(1),
    isOpenCall: true
  },
  {
    title: "Txt me when you see this... (shoutout to someone you met at the event)",
    format: "short" as const,
    slotsNeeded: 4,
    bountyAmount: 3,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "The moment that changed everything for me:",
    format: "long" as const,
    slotsNeeded: 3,
    bountyAmount: 5,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "What I learned about myself tonight:",
    format: "short" as const,
    slotsNeeded: 6,
    bountyAmount: 2,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "The person who made my night better:",
    format: "short" as const,
    slotsNeeded: 8,
    bountyAmount: 1,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "One thing I wish everyone knew about this event:",
    format: "long" as const,
    slotsNeeded: 4,
    bountyAmount: 3,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  },
  {
    title: "The energy in the room was...",
    format: "short" as const,
    slotsNeeded: 7,
    bountyAmount: 2,
    dueDate: getDueDateInDays(3),
    isOpenCall: true
  }
];

// Function to get a random topic template that hasn't been used yet
const getRandomTopicTemplate = (usedTemplates: Set<number>) => {
  const availableIndices = defaultTopicTemplates
    .map((_, index) => index)
    .filter(index => !usedTemplates.has(index));
  
  if (availableIndices.length === 0) {
    // If all templates have been used, reset the set and pick any
    return { template: defaultTopicTemplates[Math.floor(Math.random() * defaultTopicTemplates.length)], resetUsed: true };
  }
  
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { template: defaultTopicTemplates[randomIndex], usedIndex: randomIndex, resetUsed: false };
};

function NewIssueWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  // const { sessionToken, isLoading: isTokenLoading, error: tokenError } = useSessionToken(address); // Removed for MVP
  const [currentStep, setCurrentStep] = useState<WizardStep>("event");
  const [eventUrl, setEventUrl] = useState("");
  const [scrapedEventData, setScrapedEventData] = useState<SocialLayerEvent | null>(null);
  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", title: "", slotsNeeded: 1, category: "picture", bountyAmount: 20, format: "open", isOpenCall: true, dueDate: getDefaultDueDate() }
  ]);
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "1", role: "founder", wallet: "", email: "" }
  ]);

  // Auto-populate founder's wallet address when connected
  useEffect(() => {
    if (address && team[0].wallet === "") {
      setTeam(prevTeam => 
        prevTeam.map((member, index) => 
          index === 0 ? { ...member, wallet: address } : member
        )
      );
    }
  }, [address, team]);
  const [selectedTheme, setSelectedTheme] = useState(mockThemes[0].id);
  const [selectedColors, setSelectedColors] = useState<string[]>(["blue", "purple"]);
  const [magazineTreasury, setMagazineTreasury] = useState<{ address: string; founderAddress: string; magazineName: string; requiredFunding: number; currentBalance: number; createdAt: Date } | null>(null);
  const [usedTemplateIndices, setUsedTemplateIndices] = useState<Set<number>>(new Set());
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [publishDate, setPublishDate] = useState<string>("");
  const [isCreatingMagazine, setIsCreatingMagazine] = useState(false);

  // Calculate total bounty amount for open call topics only (bounty × slots per topic)
  const totalTopicBounties = topics.reduce((sum, topic) => 
    topic.isOpenCall ? sum + (topic.bountyAmount || 0) * topic.slotsNeeded : sum, 0
  );

  // Generate magazine treasury when user connects wallet
  useEffect(() => {
    if (address && scrapedEventData && !magazineTreasury) {
      const treasury = createMagazineTreasury(
        address,
        scrapedEventData.title || "Untitled Magazine",
        totalTopicBounties,
        scrapedEventData
      );
      setMagazineTreasury(treasury);
    }
  }, [address, scrapedEventData, totalTopicBounties, magazineTreasury]);

  // Read event data from URL parameters (only once)
  const initialEventData = useMemo(() => {
    const eventDataParam = searchParams.get('eventData');
    if (eventDataParam) {
      try {
        const eventData = JSON.parse(eventDataParam);
        return eventData;
      } catch (error) {
        console.error('Failed to parse event data:', error);
        return null;
      }
    }
    return null;
  }, [searchParams]);

  // Set the event data only once when initialEventData changes
  useEffect(() => {
    if (initialEventData && !scrapedEventData) {
      setScrapedEventData(initialEventData);
      setEventUrl(initialEventData.url || "");
    }
  }, [initialEventData, scrapedEventData]);

  const steps = [
    { id: "event", title: "Event", icon: "📅" },
    { id: "topics", title: "Topics", icon: "📝" },
    { id: "theme", title: "Theme", icon: "🎨" },
    { id: "treasury", title: "Treasury", icon: "💰" },
    { id: "team", title: "Team", icon: "👥" },
    { id: "review", title: "Review", icon: "✅" }
  ];

  // Handler for creating magazine + issue
  const handleCreateMagazine = async () => {
    if (!address || !scrapedEventData || !publishDate) {
      alert('Missing required data: wallet address, event data, or publish date');
      return;
    }

    setIsCreatingMagazine(true);

    try {
      // Step 1: Ensure user exists (create if needed)
      const userResponse = await fetch('/api/users/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const userData = await userResponse.json();

      if (!userData.success || !userData.user) {
        throw new Error('Failed to create/fetch user data. Please connect your wallet.');
      }

      const userId = userData.user.id;

      // Step 2: Create magazine
      const magazineName = `${scrapedEventData.title} Zine`;
      const baseSlug = scrapedEventData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Add timestamp to make slug unique - generate ONCE
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits
      const magazineSlug = `${baseSlug}-${timestamp}`;
      
      console.log('Generated slug ONCE:', { baseSlug, timestamp, finalSlug: magazineSlug });

      const magazinePayload = {
        name: magazineName,
        slug: magazineSlug,
        description: scrapedEventData.description || `A collaborative zine from ${scrapedEventData.title}`,
        founderId: userId,
        coverImageUrl: scrapedEventData.content?.media?.[0] || null,
        defaultBountyAmount: 100, // $1.00 in cents
        // Add missing required fields from frontend
        accentColors: selectedColors, // From theme step
        themeId: selectedTheme, // From theme step  
        treasuryAddress: magazineTreasury?.address || '', // From treasury step
        founderNickname: team[0]?.nickname || null, // From team step
      };

      const magazineResponse = await fetch('/api/magazines/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(magazinePayload),
      });

      const magazineData = await magazineResponse.json();

      if (!magazineData.success || !magazineData.magazine) {
        throw new Error(magazineData.error || 'Failed to create magazine');
      }

      const magazine = magazineData.magazine;
      const magazineId = magazine.id;
      const actualSlug = magazine.slug; // Use the actual slug from the database
      
      console.log('Created magazine:', { id: magazineId, slug: actualSlug, name: magazine.name });
      console.log('Using slug for issue creation:', actualSlug);

      // Wait a moment for database to commit (potential race condition fix)
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Waited 500ms for database commit');

      // Step 3: Create issue
      const issuePayload = {
        title: `Issue #1: ${scrapedEventData.title}`,
        description: `Post-event zine from ${scrapedEventData.title}`,
        submissionDeadline: new Date(publishDate).toISOString(),
        publicationDate: new Date(publishDate).toISOString(),
        // Add missing required fields from frontend
        requiredFunding: totalTopicBounties * 100, // Convert USDC to cents
        treasuryAddress: magazineTreasury?.address || '',
        sourceEventDate: scrapedEventData.date,
        sourceEventTitle: scrapedEventData.title,
        sourceEventLocation: scrapedEventData.location?.name,
        sourceEventUrl: eventUrl,
        sourceEventPlatform: eventUrl.includes('luma') ? 'luma' : 'sociallayer',
        // Fix topics mapping with proper field names and values
        topics: topics.filter(t => t.isOpenCall).map(t => ({
          title: t.title,
          description: `Submit your ${t.format} content for this topic`,
          bountyAmount: (t.bountyAmount || 1) * 100, // Convert USDC to cents
          maxSubmissions: t.slotsNeeded,
          format: t.format, // Pass actual format from frontend
          isOpenCall: t.isOpenCall, // Pass actual value from frontend
          dueDate: t.dueDate, // Add due date from frontend
        })),
      };

      console.log('Creating issue for magazine slug:', actualSlug);
      console.log('Issue payload:', issuePayload);
      console.log('Full URL being called:', `/api/magazines/${actualSlug}/issues/create`);
      
      const issueResponse = await fetch(`/api/magazines/${actualSlug}/issues/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issuePayload),
      });

      console.log('Issue response status:', issueResponse.status, issueResponse.statusText);
      console.log('Issue response headers:', Object.fromEntries(issueResponse.headers.entries()));
      
      if (!issueResponse.ok) {
        const errorText = await issueResponse.text();
        console.error('Issue creation failed:', errorText);
        throw new Error(`Issue creation failed: ${issueResponse.status} ${issueResponse.statusText}`);
      }
      
      const issueData = await issueResponse.json();
      console.log('Issue creation response:', issueData);

      if (!issueData.success || !issueData.issue) {
        throw new Error(issueData.error || 'Failed to create issue');
      }

      // Step 4: Create magazine editors (exclude founder, only editors)
      const editors = team.slice(1).filter(member => member.wallet && member.wallet.trim() !== '');
      console.log('Team members for editors:', team);
      console.log('Filtered editors:', editors);
      
      if (editors.length > 0) {
        console.log('Creating magazine editors:', editors);
        
        const editorsPayload = {
          editors: editors.map(editor => ({
            walletAddress: editor.wallet,
            nickname: editor.nickname || null,
          })),
        };

          const editorsResponse = await fetch(`/api/magazines/${actualSlug}/editors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editorsPayload),
          });

          if (!editorsResponse.ok) {
            const errorText = await editorsResponse.text();
            console.error('Editors creation failed:', errorText);
            throw new Error(`Editors creation failed: ${editorsResponse.status} ${editorsResponse.statusText}`);
          }

          const editorsData = await editorsResponse.json();
          console.log('Editors creation response:', editorsData);

        if (!editorsData.success) {
          console.error('Failed to create editors, but magazine/issue were created:', editorsData.error);
          // Don't throw error here - magazine was created successfully, editor creation is secondary
        } else {
          console.log(`✅ Created ${editorsData.editorsCreated} magazine editors`);
        }
      }

      // Step 5: Redirect to founder dashboard
      alert('✅ Magazine created successfully!');
      router.push('/profile?tab=founder');
    } catch (error) {
      console.error('Error creating magazine:', error);
      alert(error instanceof Error ? error.message : 'Failed to create magazine. Please try again.');
    } finally {
      setIsCreatingMagazine(false);
    }
  };

  const addTopic = () => {
    const { template, usedIndex, resetUsed } = getRandomTopicTemplate(usedTemplateIndices);
    
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: template.title,
      slotsNeeded: template.slotsNeeded,
      category: "picture",
      bountyAmount: template.bountyAmount,
      format: template.format,
      isOpenCall: template.isOpenCall,
      dueDate: template.dueDate,
      isTemplate: true
    };
    
    setTopics([...topics, newTopic]);
    
    if (resetUsed) {
      setUsedTemplateIndices(new Set([usedIndex]));
    } else {
      setUsedTemplateIndices(new Set([...usedTemplateIndices, usedIndex]));
    }
  };

  const removeTopic = (id: string) => {
    if (topics.length > 1) {
      setTopics(topics.filter(topic => topic.id !== id));
    }
  };

  const updateTopic = (id: string, field: keyof Topic, value: string | number | boolean) => {
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
            <div className="gallery-card p-8 space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center animate-pulse">
                  <Check className="w-8 h-8 text-accent-foreground" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-handwriting text-xl text-foreground">Check the details...</h3>
                <div className="space-y-4">
                  {isEditingEvent ? (
                    <input
                      type="text"
                      value={scrapedEventData?.title || ''}
                      onChange={(e) => setScrapedEventData(prev => prev ? {...prev, title: e.target.value} : null)}
                      className="text-clean text-3xl text-accent font-bold bg-transparent border-0 border-b-2 border-border/30 focus:border-accent focus:outline-none text-center w-full"
                    />
                  ) : (
                    <p className="text-clean text-3xl text-accent font-bold">
                      {scrapedEventData?.title || 'Your Event'}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-4">
                    {isEditingEvent ? (
                      <>
                        <input
                          type="date"
                          value={scrapedEventData?.date || ''}
                          onChange={(e) => setScrapedEventData(prev => prev ? {...prev, date: e.target.value} : null)}
                          className="text-clean text-muted-foreground bg-transparent border-0 border-b border-border/30 focus:border-accent focus:outline-none"
                        />
                        <span className="text-muted-foreground">•</span>
                        <input
                          type="time"
                          value={scrapedEventData?.time || ''}
                          onChange={(e) => setScrapedEventData(prev => prev ? {...prev, time: e.target.value} : null)}
                          className="text-clean text-muted-foreground bg-transparent border-0 border-b border-border/30 focus:border-accent focus:outline-none"
                        />
                      </>
                    ) : (
                      <p className="text-clean text-muted-foreground">
                        {scrapedEventData?.date || 'Event Date'} • {scrapedEventData?.time || 'Event Time'}
                      </p>
                    )}
            </div>
                </div>
              </div>

              {/* Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">👥</div>
                    <p className="font-mono text-sm text-muted-foreground">Participants</p>
                    {isEditingEvent ? (
              <input
                        type="number"
                        value={scrapedEventData?.participantCount?.count || ''}
                        onChange={(e) => setScrapedEventData(prev => prev ? {
                          ...prev, 
                          participantCount: { count: parseInt(e.target.value) || 0 }
                        } : null)}
                        className="font-display text-xl text-foreground bg-transparent border-0 border-b border-border/30 focus:border-accent focus:outline-none text-center w-full"
                      />
                    ) : (
                      <p className="font-display text-xl text-foreground">
                        {scrapedEventData?.participantCount?.count || '?'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">📍</div>
                    <p className="font-mono text-sm text-muted-foreground">Location</p>
                    {isEditingEvent ? (
                      <input
                        type="text"
                        value={scrapedEventData?.location?.name || ''}
                        onChange={(e) => setScrapedEventData(prev => prev ? {
                          ...prev,
                          location: { ...prev.location, name: e.target.value }
                        } : null)}
                        className="font-display text-lg text-foreground bg-transparent border-0 border-b border-border/30 focus:border-accent focus:outline-none text-center w-full"
                      />
                    ) : (
                      <p className="font-display text-lg text-foreground">
                        {scrapedEventData?.location?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">🏢</div>
                    <p className="font-mono text-sm text-muted-foreground">Organizer</p>
                    {isEditingEvent ? (
                      <input
                        type="text"
                        value={scrapedEventData?.organization?.name || ''}
                        onChange={(e) => setScrapedEventData(prev => prev ? {
                          ...prev,
                          organization: { ...prev.organization, name: e.target.value }
                        } : null)}
                        className="font-display text-lg text-foreground bg-transparent border-0 border-b border-border/30 focus:border-accent focus:outline-none text-center w-full"
                      />
                    ) : (
                      <p className="font-display text-lg text-foreground">
                        {scrapedEventData?.organization?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Options */}
              <div className="flex justify-between mt-8">
                <button 
                  onClick={() => setIsEditingEvent(!isEditingEvent)}
                  className="px-4 py-2 border-2 border-accent text-accent rounded-none font-mono text-sm uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {isEditingEvent ? 'Cancel' : 'Needs Editing'}
                </button>
                <button 
                  onClick={nextStep}
                  className="px-6 py-3 bg-accent text-accent-foreground rounded-none font-mono text-sm uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  {isEditingEvent ? 'Save & Continue' : 'Continue'}
                </button>
              </div>

              {/* Raw JSON for Dev Mode */}
              {process.env.NODE_ENV === 'development' && scrapedEventData && (
                <div className="mt-8 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                  <h4 className="font-mono text-sm mb-3 text-muted-foreground">Raw JSON Data (Dev Mode)</h4>
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-64">
                    {JSON.stringify(scrapedEventData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case "topics":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-6">
                Define 5-6 topics for your magazine issue. Each topic can be an open call for submissions or internal content.
              </p>
            </div>
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div key={topic.id} className="bg-card/50 backdrop-blur-sm p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-3xl font-bold text-foreground">#{index + 1}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateTopic(topic.id, "isOpenCall", !topic.isOpenCall)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            topic.isOpenCall ? 'bg-accent' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              topic.isOpenCall ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${topic.isOpenCall ? 'text-accent' : 'text-muted-foreground'}`}>
                          {topic.isOpenCall ? 'Open Call' : 'Internal'}
                        </span>
                      </div>
                    {topics.length > 1 && (
                      <button
                        onClick={() => removeTopic(topic.id)}
                        className="p-1 hover:bg-muted/50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="I'm going to remember this quote forever:"
                        value={topic.title}
                        onChange={(e) => updateTopic(topic.id, "title", e.target.value)}
                        className={`w-full font-display text-3xl italic bg-transparent border-0 border-b-2 border-border/30 focus:border-accent focus:outline-none placeholder:text-muted-foreground/50 placeholder:italic ${
                          topic.isTemplate && topic.title === defaultTopicTemplates.find(t => t.title === topic.title)?.title
                            ? 'text-muted-foreground/50'
                            : 'text-foreground'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Format</label>
                      <select
                        value={topic.format}
                        onChange={(e) => updateTopic(topic.id, "format", e.target.value as "short" | "long" | "image" | "open")}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="short">Short text (≤100 words)</option>
                        <option value="long">Long text (100+ words)</option>
                        <option value="image">Image with caption</option>
                        <option value="open">Open format</option>
                      </select>
                    </div>

                    {topic.isOpenCall && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
                          <label className="block text-sm font-medium mb-1">Bounty (USDC)</label>
                      <input
                            type="number"
                            min="0"
                            placeholder="20"
                            value={topic.bountyAmount || ""}
                            onChange={(e) => updateTopic(topic.id, "bountyAmount", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                          <label className="block text-sm font-medium mb-1">Due Date</label>
                      <input
                            type="date"
                            value={topic.dueDate || getDefaultDueDate()}
                            onChange={(e) => updateTopic(topic.id, "dueDate", e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                      </div>
                    )}
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
          <div className="space-y-8">
            <div>
              <h2 className="font-mono text-2xl mb-4">Treasury Setup</h2>
              <p className="text-muted-foreground mb-6">
                {address 
                  ? `Fund your magazine treasury to pay contributors. You need $${totalTopicBounties} USDC total for all topic bounties.`
                  : ``
                }
              </p>
            </div>

            <div className="space-y-6">
              {/* Wallet Connection Reminder */}
              {!address && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
                  <h3 className="font-mono text-lg mb-2 text-yellow-800 dark:text-yellow-200">Connect Your Wallet</h3>
                  <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                    Please connect your wallet using the button in the top-right corner to create your magazine treasury.
                  </p>
                  <div className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
                    <p>👆 Look for the wallet button in the top-right corner</p>
                    <p>✅ We&apos;ll create a separate treasury for your magazine</p>
                    <p>✅ Your personal funds stay separate from magazine funds</p>
                  </div>
                </div>
              )}

              {/* Identity & Treasury Display */}
              {address && magazineTreasury && (
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
                  <h3 className="font-mono text-lg mb-4">Magazine Identity & Treasury</h3>
            <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Founder (You):</span>
                      <code className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                        {address}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Magazine Treasury:</span>
                      <code className="font-mono text-sm bg-accent/10 px-2 py-1 rounded text-accent">
                        {magazineTreasury.address}
                      </code>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border/30">
                      <p>✅ Your personal wallet stays separate from magazine funds</p>
                      <p>✅ Magazine treasury can be managed by team members</p>
                      <p>✅ Clear separation for professional magazine management</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Funding Requirements */}
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
                <h3 className="font-mono text-lg mb-4">Funding Required</h3>
                 <div className="space-y-3">
                   {/* Per-topic breakdown - only open call topics */}
                   {topics.filter(topic => topic.isOpenCall).map((topic) => (
                     <div key={topic.id} className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground">
                         Topic {topics.indexOf(topic) + 1}: {topic.slotsNeeded} × {topic.bountyAmount || 0} USDC
                       </span>
                       <span className="font-mono">{(topic.bountyAmount || 0) * topic.slotsNeeded} USDC</span>
                     </div>
                   ))}
                  <div className="border-t border-border/50 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Topic Bounties:</span>
                      <span className="font-mono">{totalTopicBounties} USDC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Recommended Buffer (10%):</span>
                      <span className="font-mono">{Math.ceil(totalTopicBounties * 0.1)} USDC</span>
                    </div>
                    <div className="border-t border-border/50 pt-3">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Recommended:</span>
                        <span className="font-mono text-lg">{totalTopicBounties + Math.ceil(totalTopicBounties * 0.1)} USDC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OnchainKit Fund Card */}
              {!address ? (
                <div className="bg-muted/30 backdrop-blur-sm p-8 text-center rounded-lg">
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to access the funding interface.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use the wallet button in the top-right corner ↗️
                  </p>
                </div>
              ) : process.env.NODE_ENV === 'development' ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
                  <h3 className="font-mono text-lg mb-2 text-yellow-800 dark:text-yellow-200">Development Mode</h3>
                  <p className="text-yellow-600 dark:text-yellow-300 mb-4">
                    Fund card disabled in development due to IP restrictions. This will work in production/staging.
                  </p>
                  <div className="space-y-2 text-sm text-yellow-600 dark:text-yellow-300">
                    <p>✅ Session token generation implemented</p>
                    <p>✅ OnchainKit integration ready</p>
                    <p>✅ Will work automatically on deployment</p>
                  </div>
                  <button 
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    onClick={() => alert('This will fund your treasury with USDC when deployed!')}
                  >
                    Preview Fund Flow (Demo)
                  </button>
                </div>
              ) : (
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
                  <h3 className="font-mono text-lg mb-4">Fund Your Treasury</h3>
                  <p className="text-muted-foreground mb-4">
                    Treasury funding will be available after deployment. For now, you can proceed to create your magazine.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Coming soon:</strong> Direct USDC funding via Coinbase onramp
                    </p>
                  </div>
                </div>
              )}
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
                      {/* {member.role === "founder" ? "Founder" : `Editor ${index}`} */}
                      Founder(You!)
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
                    <label className="block text-sm font-medium mb-1">Nickname (Optional)</label>
                      <input
                        type="text"
                        placeholder="Display name..."
                        value={member.nickname || ''}
                        onChange={(e) => updateTeamMember(member.id, "nickname", e.target.value)}
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
                  Safe Address: {magazineTreasury?.address || "No address provided"}
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Publish Date</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Publish Date & Time</label>
                    <input
                      type="datetime-local"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border focus:border-accent focus:outline-none"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be the final deadline for submissions and when your zine goes live.
                  </p>
                </div>
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
        <div className="w-full px-6 lg:px-12 py-8">
          <div className="flex items-start justify-between mb-6">
          <button
            onClick={() => router.push("/profile")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
            
          </div>

          <div className="space-y-4">
            <div className="bg-accent text-accent-foreground px-3 py-1 font-mono text-sm font-light inline-block">
              New Issue Wizard
            </div>
            <div className="space-y-2">
              <h1 className="font-handwriting text-xl text-foreground">✨Let&apos;s make a zine with those who showed up for...</h1>
              <p className="font-display text-3xl font-bold text-foreground">
                {scrapedEventData?.title || 'Your Event'}
              </p>
            </div>
            {address && (
              <p className="text-muted-foreground text-sm">
                Creating as {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="w-full px-6 lg:px-12 py-6">
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
      <main className="w-full px-6 lg:px-12 py-12">
        {renderStepContent()}
      </main>

      {/* Navigation */}
      <div className="border-t border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="w-full px-6 lg:px-12 py-6">
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
                onClick={handleCreateMagazine}
                disabled={!publishDate || isCreatingMagazine || !address}
                className="px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingMagazine ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                <Check className="w-4 h-4" />
                Create Magazine Issue
                  </>
                )}
              </button>
            ) : currentStep !== "event" ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewIssueWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NewIssueWizardContent />
    </Suspense>
  );
}