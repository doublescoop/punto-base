"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Users, DollarSign, Palette, Trash2, Save, Plus, Settings } from "lucide-react";

interface TeamMember {
  id: string;
  role: "founder" | "editor";
  wallet: string;
  email: string;
}

interface RoleStipend {
  role: "founder" | "editor";
  amount: string;
}

const mockSettingsData = {
  "concrete-light": {
    magazineName: "Concrete & Light",
    team: [
      { id: "1", role: "founder" as const, wallet: "0x742d...4a8c", email: "founder@concretelight.com" },
      { id: "2", role: "editor" as const, wallet: "0x8f3a...2b7d", email: "editor@concretelight.com" }
    ],
    roleStipends: [
      { role: "founder" as const, amount: "50" },
      { role: "editor" as const, amount: "30" }
    ],
    theme: "clean-gallery",
    accentColors: ["blue", "purple"],
    safeAddress: "0x1234...5678",
    issues: 3
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const magazineName = params.magazine as string;

  type Tab = "team" | "payments" | "theme" | "general";

  const [activeTab, setActiveTab] = useState<Tab>("team");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [roleStipends, setRoleStipends] = useState<RoleStipend[]>([]);
  const [safeAddress, setSafeAddress] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("clean-gallery");
  const [selectedColors, setSelectedColors] = useState<string[]>(["blue", "purple"]);

  const settingsData = mockSettingsData[magazineName as keyof typeof mockSettingsData];

  // Initialize state with mock data
  useEffect(() => {
    if (settingsData) {
      setTeam(settingsData.team);
      setRoleStipends(settingsData.roleStipends);
      setSafeAddress(settingsData.safeAddress);
      setSelectedTheme(settingsData.theme);
      setSelectedColors(settingsData.accentColors);
    }
  }, [settingsData]);

  if (!settingsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-mono text-2xl">Magazine Not Found</h1>
          <p className="text-muted-foreground">
            The magazine you&apos;re looking for doesn&apos;t exist.
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
    setTeam(team.filter(member => member.id !== id));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setTeam(team.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  const updateRoleStipend = (role: "founder" | "editor", amount: string) => {
    setRoleStipends(roleStipends.map(stipend => 
      stipend.role === role ? { ...stipend, amount } : stipend
    ));
  };

  const mockThemes = [
    { id: "clean-gallery", name: "Clean Gallery", description: "Playfair Display (H1–H3), Inter (body)" },
    { id: "playful-experimental", name: "Playful Experimental", description: "Gasoek One(all)" }
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

  const tabs = [
    { id: "team", label: "Team Management", icon: Users },
    { id: "payments", label: "Role Stipends", icon: DollarSign },
    { id: "theme", label: "Theme & Colors", icon: Palette },
    { id: "general", label: "General", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="w-full px-6 lg:px-12 py-8">
          <button
            onClick={() => router.push(`/${magazineName}/board`)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Issue Board
          </button>

          <div className="space-y-4">
            <h1 className="font-mono text-3xl tracking-tight">
              {settingsData.magazineName} Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your magazine&apos;s team, payments, and appearance
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <div className="w-full px-6 lg:px-12">
          <div className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-accent text-accent"
                      : "border-transparent hover:border-muted text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="w-full px-6 lg:px-12 py-12">
        {/* Team Management Tab */}
        {activeTab === "team" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-mono text-xl mb-4">Team Members</h2>
              <p className="text-muted-foreground mb-6">
                Manage your editorial team. Editors can review submissions and vote on acceptance.
              </p>
            </div>

            <div className="space-y-4">
              {team.map((member, index) => (
                <div key={member.id} className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono">
                      {member.role === "founder" ? "Founder" : `Editor ${index}`}
                    </h3>
                    {member.role !== "founder" && (
                      <button
                        onClick={() => removeTeamMember(member.id)}
                        className="p-2 hover:bg-muted/50 rounded transition-colors text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Wallet Address</label>
                      <input
                        type="text"
                        placeholder="0x..."
                        value={member.wallet}
                        onChange={(e) => updateTeamMember(member.id, "wallet", e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
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
                className="w-full py-4 border-2 border-dashed border-border/50 hover:border-accent transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Editor
              </button>
            </div>
          </div>
        )}

        {/* Role Stipends Tab */}
        {activeTab === "payments" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-mono text-xl mb-4">Role Stipend Defaults</h2>
              <p className="text-muted-foreground mb-6">
                Set default USDC amounts for team member stipends. These can be edited before voting on each issue.
              </p>
            </div>

            <div className="space-y-6">
              {roleStipends.map((stipend) => (
                <div key={stipend.role} className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                  <h3 className="font-mono text-lg mb-4 capitalize">{stipend.role} Stipend</h3>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Amount (USDC):</label>
                    <input
                      type="number"
                      min="0"
                      value={stipend.amount}
                      onChange={(e) => updateRoleStipend(stipend.role, e.target.value)}
                      className="px-3 py-2 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-32"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme & Colors Tab */}
        {activeTab === "theme" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-mono text-xl mb-4">Theme & Colors</h2>
              <p className="text-muted-foreground mb-6">
                Customize your magazine&apos;s visual appearance and branding.
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-mono text-lg mb-4">Design Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-6 border-2 rounded-lg text-left transition-all ${
                        selectedTheme === theme.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <h4 className="font-mono mb-2">{theme.name}</h4>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
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
                      className={`p-4 border-2 rounded-lg transition-all ${
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
        )}

        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-mono text-xl mb-4">General Settings</h2>
              <p className="text-muted-foreground mb-6">
                Manage your magazine&apos;s core settings and Safe wallet.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Safe Wallet Address</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This Safe manages all payments for contributors and team members.
                </p>
                <input
                  type="text"
                  placeholder="0x..."
                  value={safeAddress}
                  onChange={(e) => setSafeAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg">
                <h3 className="font-mono text-lg mb-4">Magazine Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-mono text-accent">{settingsData.issues}</p>
                    <p className="text-sm text-muted-foreground">Issues Published</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-mono text-accent">{team.length}</p>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-mono text-accent">0</p>
                    <p className="text-sm text-muted-foreground">Active Issues</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-mono text-lg mb-4 text-red-800 dark:text-red-200">Danger Zone</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Deleting this magazine will permanently remove all issues, submissions, and settings. This action cannot be undone.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded-lg flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Magazine
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <div className="flex items-center justify-end">
            <button className="px-8 py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
