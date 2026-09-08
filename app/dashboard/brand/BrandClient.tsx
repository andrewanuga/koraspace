"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Brain,
  Edit3,
  MapPin,
  UserRound,
  Target,
  PenLine,
  BookOpen,
  Database,
  Camera,
  FileText,
  Link2,
  Plus,
  Trash2,
  Check,
  X,
  ChevronRight,
  Loader2,
  WandSparkles,
  Save,
  Lightbulb,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import type {
  BrandProfile,
  BrandContentPreference,
  BrandWritingStyle,
  BrandMemory,
  BrandKnowledgeItem,
  BrandAIInsight,
} from "@/lib/brand/types";

type Tab = "profile" | "voice" | "content" | "memory" | "knowledge";

interface Props {
  profile: BrandProfile | null;
  contentPreferences: BrandContentPreference[];
  writingStyles: BrandWritingStyle[];
  memories: BrandMemory[];
  knowledge: BrandKnowledgeItem[];
  insights: BrandAIInsight[];
  userId: string;
}

const DEFAULT_PROFILE = {
  display_name: "",
  username: "",
  avatar_url: "",
  role: "Creator",
  niche: "",
  target_audience: "",
  location: "Remote",
  bio: "",
  mission: "",
  voice_summary: "",
};

const STYLE_PRESETS = [
  "Conversational",
  "Direct & Concise",
  "Authoritative",
  "Educational",
  "Engaging Storyteller",
  "Witty & Relatable",
  "Data-Backed",
  "Action-Oriented",
];

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-[var(--kora-pink)] bg-[var(--kora-pink)] text-white shadow-[0_4px_14px_rgba(236,22,140,0.3)]"
          : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-2)] hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
      }`}
    >
      {children}
    </button>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--stroke)] px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-bold text-[var(--fg)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--fg-4)]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none transition focus:border-[var(--kora-pink)] focus:ring-2 focus:ring-[var(--kora-pink-soft)]"
      />
    </label>
  );
}

export function BrandClient({
  profile,
  contentPreferences,
  writingStyles,
  memories,
  knowledge,
  insights: initialInsights,
  userId,
}: Props) {
  const supabase = createClient();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [localProfile, setLocalProfile] = useState({
    ...DEFAULT_PROFILE,
    ...(profile ?? {}),
  });

  const [localPreferences, setLocalPreferences] = useState(contentPreferences);
  const [localWritingStyles, setLocalWritingStyles] = useState(writingStyles);
  const [localMemories, setLocalMemories] = useState(memories);
  const [localKnowledge, setLocalKnowledge] = useState(knowledge);
  const [localInsights, setLocalInsights] = useState(initialInsights);

  const [newPreference, setNewPreference] = useState("");
  const [newStyle, setNewStyle] = useState("");
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newKnowledgeTitle, setNewKnowledgeTitle] = useState("");
  const [newKnowledgeContent, setNewKnowledgeContent] = useState("");
  const [newKnowledgeType, setNewKnowledgeType] = useState("note");
  const [newKnowledgeUrl, setNewKnowledgeUrl] = useState("");

  const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: "profile", label: "Brand Profile", icon: UserRound },
    { id: "voice", label: "Voice & Style", icon: PenLine },
    { id: "content", label: "Content Preferences", icon: Target },
    { id: "memory", label: "AI Memory", icon: Brain },
    { id: "knowledge", label: "Knowledge Base", icon: Database },
  ];

  const memoryStats = useMemo(() => {
    return {
      enabled: localMemories.filter((m) => m.enabled).length,
      total: localMemories.length,
    };
  }, [localMemories]);

  async function saveProfile() {
    setSaving(true);
    try {
      const payload = {
        user_id: userId,
        display_name: localProfile.display_name || null,
        username: localProfile.username || null,
        avatar_url: localProfile.avatar_url || null,
        role: localProfile.role || "Creator",
        niche: localProfile.niche || null,
        target_audience: localProfile.target_audience || null,
        location: localProfile.location || "Remote",
        bio: localProfile.bio || null,
        mission: localProfile.mission || null,
        voice_summary: localProfile.voice_summary || null,
      };

      const { error } = await supabase
        .from("brand_profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) throw error;
      setEditingProfile(false);
      success("Brand profile updated successfully");
    } catch (err) {
      console.error(err);
      toastError("Unable to save your brand profile.");
    } finally {
      setSaving(false);
    }
  }

  async function addPreference() {
    const label = newPreference.trim();
    if (!label) return;
    try {
      const { data, error } = await supabase
        .from("brand_content_preferences")
        .insert({ user_id: userId, label })
        .select()
        .single();

      if (error) throw error;
      setLocalPreferences((current) => [...current, data]);
      setNewPreference("");
      success("Content topic added");
    } catch (err) {
      console.error(err);
    }
  }

  async function removePreference(id: string) {
    await supabase
      .from("brand_content_preferences")
      .delete()
      .eq("id", id);
    setLocalPreferences((current) => current.filter((item) => item.id !== id));
  }

  async function addWritingStyle(customStyle?: string) {
    const label = (customStyle || newStyle).trim();
    if (!label) return;
    try {
      const { data, error } = await supabase
        .from("brand_writing_styles")
        .insert({ user_id: userId, label })
        .select()
        .single();

      if (error) throw error;
      setLocalWritingStyles((current) => [...current, data]);
      if (!customStyle) setNewStyle("");
      success("Writing style added");
    } catch (err) {
      console.error(err);
    }
  }

  async function removeWritingStyle(id: string) {
    await supabase
      .from("brand_writing_styles")
      .delete()
      .eq("id", id);
    setLocalWritingStyles((current) => current.filter((item) => item.id !== id));
  }

  async function addMemory() {
    if (!newMemoryTitle.trim()) return;
    try {
      const { data, error } = await supabase
        .from("brand_memories")
        .insert({
          user_id: userId,
          title: newMemoryTitle.trim(),
          content: newMemoryContent.trim() || null,
          enabled: true,
          importance: 5,
          source: "manual",
        })
        .select()
        .single();

      if (error) throw error;
      setLocalMemories((current) => [data, ...current]);
      setNewMemoryTitle("");
      setNewMemoryContent("");
      success("Memory added to Brand Brain");
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleMemory(memory: BrandMemory) {
    const nextEnabled = !memory.enabled;
    await supabase
      .from("brand_memories")
      .update({ enabled: nextEnabled })
      .eq("id", memory.id);

    setLocalMemories((current) =>
      current.map((item) =>
        item.id === memory.id ? { ...item, enabled: nextEnabled } : item
      )
    );
  }

  async function deleteMemory(id: string) {
    await supabase
      .from("brand_memories")
      .delete()
      .eq("id", id);
    setLocalMemories((current) => current.filter((item) => item.id !== id));
    success("Memory removed");
  }

  async function addKnowledge() {
    if (!newKnowledgeTitle.trim()) return;
    try {
      const { data, error } = await supabase
        .from("brand_knowledge_items")
        .insert({
          user_id: userId,
          title: newKnowledgeTitle.trim(),
          content: newKnowledgeContent.trim() || null,
          type: newKnowledgeType,
          source_url: newKnowledgeUrl.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      setLocalKnowledge((current) => [data, ...current]);
      setNewKnowledgeTitle("");
      setNewKnowledgeContent("");
      setNewKnowledgeUrl("");
      success("Knowledge item added");
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteKnowledge(id: string) {
    await supabase
      .from("brand_knowledge_items")
      .delete()
      .eq("id", id);
    setLocalKnowledge((current) => current.filter((item) => item.id !== id));
    success("Knowledge item removed");
  }

  async function generateBrandInsights() {
    setGenerating(true);
    try {
      const response = await fetch("/api/brand/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze_brand" }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const resData = await response.json();
      if (resData.insights && Array.isArray(resData.insights)) {
        setLocalInsights(resData.insights);
        success("Brand Brain insights updated");
      }
    } catch (err) {
      console.error(err);
      toastError("Unable to generate brand insights.");
    } finally {
      setGenerating(false);
    }
  }

  const initials =
    localProfile.display_name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BR";

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-12">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--stroke)] bg-gradient-to-r from-[#380b3d] via-[#521350] to-[#261353] px-6 py-8 text-white shadow-[0_16px_40px_rgba(0,0,0,0.3)] sm:px-8">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -right-20 -top-28 h-[320px] w-[320px] rounded-full bg-[var(--kora-pink)] blur-[80px]" />
          <div className="absolute -bottom-28 left-[30%] h-[260px] w-[260px] rounded-full bg-[var(--kora-blue)] blur-[70px]" />
        </div>

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-pink-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personal Brand Brain</span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Brand <span className="text-[var(--kora-pink)]">✦</span>
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">
              Your AI-powered personal brand brain. It learns your signature voice,
              remembers your preferences, and makes every piece of content sound
              unmistakably like you.
            </p>
          </div>

          <button
            onClick={generateBrandInsights}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-60 shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin text-pink-300" />
            ) : (
              <WandSparkles className="h-4 w-4 text-pink-300" />
            )}
            {generating ? "Analyzing Brand..." : "Refresh Brand Intelligence"}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                active
                  ? "border-[var(--kora-pink)] bg-[var(--kora-pink)] text-white shadow-[0_6px_16px_rgba(236,22,140,0.25)]"
                  : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="space-y-5">
          <SectionCard
            title="Brand Identity"
            action={
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--kora-pink)] hover:underline"
              >
                {editingProfile ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Edit3 className="h-3.5 w-3.5" />
                )}
                {editingProfile ? "Cancel" : "Edit"}
              </button>
            }
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--stroke)] bg-gradient-to-br from-[var(--kora-pink)] to-[var(--kora-blue)] font-display text-xl font-bold text-white shadow-lg">
                  {localProfile.avatar_url ? (
                    <img
                      src={localProfile.avatar_url}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[var(--panel-fill)] bg-[var(--success)]" />
              </div>

              <h3 className="mt-3 font-display text-base font-bold text-[var(--fg)]">
                {localProfile.display_name || "Define Your Brand"}
              </h3>

              <p className="text-xs text-[var(--fg-4)]">
                {localProfile.username
                  ? `@${localProfile.username.replace("@", "")}`
                  : "@yourhandle"}
              </p>

              <span className="mt-2.5 inline-block rounded-full border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] px-3 py-0.5 text-[11px] font-semibold text-[var(--kora-pink)]">
                {localProfile.role || "Creator"}
              </span>
            </div>

            <div className="my-4 h-px bg-[var(--stroke)]" />

            {!editingProfile ? (
              <div className="space-y-3.5">
                <BrandInfo
                  icon={Target}
                  label="Niche"
                  value={localProfile.niche || "Not defined yet"}
                />
                <BrandInfo
                  icon={UserRound}
                  label="Target Audience"
                  value={localProfile.target_audience || "Not defined yet"}
                />
                <BrandInfo
                  icon={MapPin}
                  label="Location"
                  value={localProfile.location || "Remote"}
                />
                <BrandInfo
                  icon={FileText}
                  label="Bio"
                  value={
                    localProfile.bio ||
                    "Add your elevator pitch and what you want to be known for."
                  }
                  multiline
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Field
                  label="Display Name"
                  value={localProfile.display_name || ""}
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, display_name: val })
                  }
                />
                <Field
                  label="Username"
                  value={localProfile.username || ""}
                  placeholder="alex_creator"
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, username: val })
                  }
                />
                <Field
                  label="Avatar URL"
                  value={localProfile.avatar_url || ""}
                  placeholder="https://..."
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, avatar_url: val })
                  }
                />
                <Field
                  label="Role"
                  value={localProfile.role || ""}
                  placeholder="Founder / Creator"
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, role: val })
                  }
                />
                <Field
                  label="Niche"
                  value={localProfile.niche || ""}
                  placeholder="Tech & Productivity"
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, niche: val })
                  }
                />
                <Field
                  label="Target Audience"
                  value={localProfile.target_audience || ""}
                  placeholder="Founders & Builders"
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, target_audience: val })
                  }
                />
                <Field
                  label="Location"
                  value={localProfile.location || ""}
                  placeholder="Lagos / Remote"
                  onChange={(val) =>
                    setLocalProfile({ ...localProfile, location: val })
                  }
                />
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
                    Bio
                  </span>
                  <textarea
                    value={localProfile.bio || ""}
                    onChange={(event) =>
                      setLocalProfile({
                        ...localProfile,
                        bio: event.target.value,
                      })
                    }
                    className="min-h-[90px] w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-2.5 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />
                </label>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kora-pink)] py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(236,22,140,0.3)] transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save Brand Profile
                </button>
              </div>
            )}
          </SectionCard>

          {/* BRAND AI CALLOUT */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--kora-blue-soft)] bg-[var(--kora-blue-soft)] text-[var(--kora-blue)]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-xs font-bold text-[var(--fg)]">
                  Your Brand. Amplified.
                </h4>
                <p className="text-[11px] text-[var(--fg-4)]">
                  Active across all AI generators
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--fg-3)]">
              The more you configure your Brand Brain, the sharper your generated
              hooks, threads, and captions become.
            </p>

            <button
              onClick={() => setActiveTab("memory")}
              className="mt-4 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] py-2 text-xs font-semibold text-[var(--fg)] transition hover:border-[var(--stroke-strong)]"
            >
              Configure AI Memory
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: TABBED CONTENT */}
        <div className="space-y-6">
          {/* TAB: PROFILE OVERVIEW */}
          {activeTab === "profile" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard
                title="Content Preferences"
                subtitle="Key themes and pillars for your content"
                action={
                  <span className="text-xs text-[var(--fg-4)]">
                    {localPreferences.length} topics
                  </span>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {localPreferences.map((pref) => (
                    <div
                      key={pref.id}
                      className="group flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-1 text-xs text-[var(--fg-2)]"
                    >
                      <span>{pref.label}</span>
                      <button
                        onClick={() => removePreference(pref.id)}
                        className="text-[var(--fg-4)] hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {localPreferences.length === 0 && (
                    <p className="text-xs text-[var(--fg-4)]">
                      No topics added yet.
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPreference()}
                    placeholder="Add topic (e.g. AI tools, Tech Career)..."
                    className="h-9 flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />
                  <button
                    onClick={addPreference}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--kora-pink)] text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </SectionCard>

              <SectionCard
                title="Writing Style"
                subtitle="Your communication tone and style presets"
                action={
                  <button
                    onClick={() => setActiveTab("voice")}
                    className="text-xs font-semibold text-[var(--kora-pink)] hover:underline"
                  >
                    Edit
                  </button>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {localWritingStyles.map((style) => (
                    <Chip key={style.id}>{style.label}</Chip>
                  ))}
                  {localWritingStyles.length === 0 && (
                    <p className="text-xs text-[var(--fg-4)]">
                      No tone presets configured yet.
                    </p>
                  )}
                </div>

                {localProfile.voice_summary && (
                  <div className="mt-4 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3">
                    <div className="flex items-start gap-2">
                      <PenLine className="mt-0.5 h-3.5 w-3.5 text-[var(--kora-pink)] flex-shrink-0" />
                      <p className="text-xs leading-relaxed text-[var(--fg-2)]">
                        {localProfile.voice_summary}
                      </p>
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="AI Memory Status"
                subtitle="Intelligence layers powering content generation"
                action={
                  <button
                    onClick={() => setActiveTab("memory")}
                    className="text-xs font-semibold text-[var(--kora-pink)] hover:underline"
                  >
                    Manage
                  </button>
                }
              >
                <div className="space-y-2.5">
                  <MemorySummary
                    icon={Brain}
                    label="Remembering Content Preferences"
                    value={localPreferences.length > 0 ? "Active" : "Learning"}
                  />
                  <MemorySummary
                    icon={BookOpen}
                    label="Knowledge Base Integration"
                    value={localKnowledge.length > 0 ? "Active" : "Off"}
                  />
                  <MemorySummary
                    icon={RefreshCw}
                    label="Audience Persona Adaptation"
                    value={localMemories.length > 0 ? "Active" : "Learning"}
                  />
                  <MemorySummary
                    icon={Sparkles}
                    label="Active Memory Rules"
                    value={`${memoryStats.enabled} / ${memoryStats.total}`}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Knowledge Base"
                subtitle="Your reference materials, notes, and links"
                action={
                  <button
                    onClick={() => setActiveTab("knowledge")}
                    className="text-xs font-semibold text-[var(--kora-pink)] hover:underline"
                  >
                    Manage
                  </button>
                }
              >
                <div className="space-y-2.5">
                  <KnowledgeSummary
                    icon={Link2}
                    label="Links & Sources"
                    value={`${
                      localKnowledge.filter((item) => item.type === "link")
                        .length
                    } items`}
                  />
                  <KnowledgeSummary
                    icon={BookOpen}
                    label="Research & Documents"
                    value={`${
                      localKnowledge.filter((item) => item.type === "document")
                        .length
                    } items`}
                  />
                  <KnowledgeSummary
                    icon={FileText}
                    label="Personal Notes"
                    value={`${
                      localKnowledge.filter((item) => item.type === "note")
                        .length
                    } items`}
                  />
                </div>
              </SectionCard>
            </div>
          )}

          {/* TAB: VOICE & STYLE */}
          {activeTab === "voice" && (
            <SectionCard
              title="Voice & Writing Style"
              subtitle="Define how your brand sounds across all social channels."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Brand Personality
                  </h3>
                  <p className="mt-1 text-xs text-[var(--fg-3)]">
                    Select communication traits that describe your tone.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {localWritingStyles.map((style) => (
                      <div
                        key={style.id}
                        className="group flex items-center gap-1.5 rounded-full border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] px-3 py-1 text-xs font-medium text-[var(--kora-pink)]"
                      >
                        <span>{style.label}</span>
                        <button
                          onClick={() => removeWritingStyle(style.id)}
                          className="hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={newStyle}
                      onChange={(e) => setNewStyle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addWritingStyle()}
                      placeholder="Add trait (e.g. Sharp, Analytical)..."
                      className="h-10 flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                    />
                    <button
                      onClick={() => addWritingStyle()}
                      className="rounded-xl bg-[var(--kora-pink)] px-4 text-xs font-bold text-white hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-semibold text-[var(--fg-4)]">
                      Suggested Presets:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {STYLE_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => addWritingStyle(preset)}
                          className="rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1 text-[11px] text-[var(--fg-3)] hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Voice Summary & Guidelines
                  </h3>
                  <p className="mt-1 text-xs text-[var(--fg-3)]">
                    Give the AI detailed guidelines on phrases to use or avoid.
                  </p>

                  <textarea
                    value={localProfile.voice_summary || ""}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        voice_summary: e.target.value,
                      })
                    }
                    placeholder="Example: Clear, practical, and conversational. I avoid corporate buzzwords and prefer short paragraphs with bullet points..."
                    className="mt-3 min-h-[160px] w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-xs leading-relaxed text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--kora-pink)] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(236,22,140,0.3)] transition hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Voice Guidelines
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB: CONTENT PREFERENCES */}
          {activeTab === "content" && (
            <SectionCard
              title="Content Preferences & Pillars"
              subtitle="Teach the Brand Brain what topics and angles resonate best."
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Topics You Create About
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {localPreferences.map((pref) => (
                      <div
                        key={pref.id}
                        className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-1 text-xs text-[var(--fg)]"
                      >
                        <span>{pref.label}</span>
                        <button
                          onClick={() => removePreference(pref.id)}
                          className="text-[var(--fg-4)] hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={newPreference}
                      onChange={(e) => setNewPreference(e.target.value)}
                      placeholder="Add a topic..."
                      className="h-10 flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                    />
                    <button
                      onClick={addPreference}
                      className="rounded-xl bg-[var(--kora-pink)] px-4 text-xs font-bold text-white hover:opacity-90"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[var(--kora-pink)]" />
                    <h4 className="font-display text-xs font-bold text-[var(--fg)]">
                      AI Content Resonance Checklist
                    </h4>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-[var(--fg-3)]">
                    Your AI uses your preferred topics, niche, audience, and
                    knowledge base to recommend high-converting content formats.
                  </p>

                  <div className="mt-4 space-y-2.5">
                    <AIStatus
                      label="Niche Defined"
                      active={Boolean(localProfile.niche)}
                    />
                    <AIStatus
                      label="Target Audience Specified"
                      active={Boolean(localProfile.target_audience)}
                    />
                    <AIStatus
                      label="Content Topics Configured"
                      active={localPreferences.length > 0}
                    />
                    <AIStatus
                      label="Voice Guidelines Established"
                      active={Boolean(localProfile.voice_summary)}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB: AI MEMORY */}
          {activeTab === "memory" && (
            <SectionCard
              title="AI Memory Rules"
              subtitle="Explicit instructions and learnings your AI retains across features."
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-3">
                  {localMemories.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[var(--stroke)] py-12 text-center">
                      <Brain className="mx-auto h-8 w-8 text-[var(--fg-4)]" />
                      <p className="mt-2 text-xs font-semibold text-[var(--fg-2)]">
                        Your AI Memory is empty
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                        Add rules, preferences, and guidelines for your AI to follow.
                      </p>
                    </div>
                  )}

                  {localMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-start gap-3.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 transition hover:border-[var(--stroke-strong)]"
                    >
                      <button
                        onClick={() => toggleMemory(memory)}
                        className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition ${
                          memory.enabled
                            ? "border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] text-[var(--kora-pink)]"
                            : "bg-[var(--panel-fill)] text-[var(--fg-4)]"
                        }`}
                      >
                        <Brain className="h-4 w-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[var(--fg)]">
                            {memory.title}
                          </p>
                          <span
                            className={`text-[10px] font-bold ${
                              memory.enabled
                                ? "text-[var(--success)]"
                                : "text-[var(--fg-4)]"
                            }`}
                          >
                            {memory.enabled ? "Active" : "Paused"}
                          </span>
                        </div>

                        {memory.content && (
                          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-3)]">
                            {memory.content}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-[var(--fg-4)]">
                          <span className="uppercase tracking-wider">
                            {memory.source}
                          </span>
                          <button
                            onClick={() => deleteMemory(memory.id)}
                            className="hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD MEMORY FORM */}
                <div className="h-fit rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4">
                  <h3 className="font-display text-xs font-bold text-[var(--fg)]">
                    Teach Your AI
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                    Add explicit preferences (e.g. &quot;Never use clickbait&quot;).
                  </p>

                  <input
                    value={newMemoryTitle}
                    onChange={(e) => setNewMemoryTitle(e.target.value)}
                    placeholder="Memory title (e.g. Tone rule)"
                    className="mt-3 h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />

                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="Example: I prefer practical step-by-step advice and never use clickbait language."
                    className="mt-2.5 min-h-[100px] w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 text-xs leading-relaxed text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />

                  <button
                    onClick={addMemory}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kora-pink)] py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(236,22,140,0.3)] transition hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Add to AI Memory
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* TAB: KNOWLEDGE BASE */}
          {activeTab === "knowledge" && (
            <SectionCard
              title="Knowledge Base"
              subtitle="Add trusted notes, product details, links, and documents."
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-3">
                  {localKnowledge.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[var(--stroke)] py-12 text-center">
                      <Database className="mx-auto h-8 w-8 text-[var(--fg-4)]" />
                      <p className="mt-2 text-xs font-semibold text-[var(--fg-2)]">
                        Knowledge base is empty
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                        Add product overviews, customer FAQs, or research notes.
                      </p>
                    </div>
                  )}

                  {localKnowledge.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-start gap-3.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 hover:border-[var(--stroke-strong)]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--panel-fill)] text-[var(--fg-3)]">
                        {item.type === "link" ? (
                          <Link2 className="h-4 w-4" />
                        ) : item.type === "document" ? (
                          <BookOpen className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-[var(--fg)]">
                            {item.title}
                          </p>
                          <button
                            onClick={() => deleteKnowledge(item.id)}
                            className="text-[var(--fg-4)] transition hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {item.content && (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--fg-3)]">
                            {item.content}
                          </p>
                        )}

                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="rounded-md bg-[var(--panel-fill)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--fg-4)]">
                            {item.type}
                          </span>
                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[var(--kora-pink)] hover:underline"
                            >
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD KNOWLEDGE FORM */}
                <div className="h-fit rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4">
                  <h3 className="font-display text-xs font-bold text-[var(--fg)]">
                    Add Knowledge Item
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-4)]">
                    Reference materials for AI context.
                  </p>

                  <input
                    value={newKnowledgeTitle}
                    onChange={(e) => setNewKnowledgeTitle(e.target.value)}
                    placeholder="Title (e.g. Product Pitch)"
                    className="mt-3 h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />

                  <div className="mt-2.5 flex gap-2">
                    <select
                      value={newKnowledgeType}
                      onChange={(e) => setNewKnowledgeType(e.target.value)}
                      className="h-9 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-xs text-[var(--fg)] outline-none"
                    >
                      <option value="note">Note</option>
                      <option value="document">Document</option>
                      <option value="link">Link</option>
                      <option value="guideline">Guideline</option>
                    </select>

                    <input
                      value={newKnowledgeUrl}
                      onChange={(e) => setNewKnowledgeUrl(e.target.value)}
                      placeholder="URL (optional)"
                      className="h-9 flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                    />
                  </div>

                  <textarea
                    value={newKnowledgeContent}
                    onChange={(e) => setNewKnowledgeContent(e.target.value)}
                    placeholder="Add the core knowledge, facts, or guidelines..."
                    className="mt-2.5 min-h-[110px] w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 text-xs leading-relaxed text-[var(--fg)] outline-none focus:border-[var(--kora-pink)]"
                  />

                  <button
                    onClick={addKnowledge}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kora-pink)] py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(236,22,140,0.3)] transition hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    Save Knowledge
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* BRAND INTELLIGENCE / AI INSIGHTS */}
          {localInsights.length > 0 && (
            <SectionCard
              title="Brand Intelligence"
              subtitle="Automated strategic insights generated from your Brand Brain profile"
              action={<Sparkles className="h-4 w-4 text-[var(--kora-pink)]" />}
            >
              <div className="grid gap-3.5 md:grid-cols-2">
                {localInsights.map((insight) => (
                  <div
                    key={insight.id || insight.title}
                    className="flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] text-[var(--kora-pink)]">
                      <Zap className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[var(--fg)]">
                          {insight.title}
                        </p>
                        <Pill
                          tone={
                            insight.priority === "high"
                              ? "pink"
                              : insight.priority === "medium"
                              ? "blue"
                              : "neutral"
                          }
                        >
                          {insight.priority}
                        </Pill>
                      </div>

                      {insight.description && (
                        <p className="mt-1 text-xs leading-relaxed text-[var(--fg-3)]">
                          {insight.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

function BrandInfo({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
          {label}
        </p>
        <p
          className={`mt-0.5 text-xs text-[var(--fg-2)] ${
            multiline ? "leading-relaxed" : "truncate"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MemorySummary({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--panel-fill)] text-[var(--kora-pink)]">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs text-[var(--fg-2)]">{label}</span>
      </div>
      <span
        className={`text-xs font-bold ${
          value === "Active" || value === "On"
            ? "text-[var(--success)]"
            : "text-[var(--kora-pink)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function KnowledgeSummary({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--panel-fill)] text-[var(--fg-3)]">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs text-[var(--fg-2)]">{label}</span>
      </div>
      <span className="text-xs font-semibold text-[var(--fg-4)]">{value}</span>
    </div>
  );
}

function AIStatus({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          active
            ? "bg-[var(--success)] text-black"
            : "border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-4)]"
        }`}
      >
        {active && <Check className="h-2.5 w-2.5 stroke-[3]" />}
      </div>
      <span
        className={`text-xs ${
          active
            ? "font-medium text-[var(--fg)]"
            : "text-[var(--fg-4)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
