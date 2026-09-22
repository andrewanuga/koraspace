"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Brain,
  Search,
  Trash2,
  Edit3,
  Plus,
  Shield,
  Users,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { GlassCard, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";

interface SemanticMemory {
  id: string;
  workspaceId: string;
  source: string;
  platform?: string;
  memoryType: "brand_rule" | "preference" | "fact" | "decision" | "conversation";
  importance: 1 | 2 | 3 | 4 | 5;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface MemoryStats {
  total: number;
  byType: Record<string, number>;
  byImportance: Record<number, number>;
}

export function AIMemorySettingsTab() {
  const { toast, success, error } = useToast();
  const [memories, setMemories] = useState<SemanticMemory[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form State for Adding New Memory
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<SemanticMemory["memoryType"]>("fact");
  const [newImportance, setNewImportance] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingMemory, setEditingMemory] = useState<SemanticMemory | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImportance, setEditImportance] = useState<number>(4);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/memory?stats=true&limit=50");
      if (!res.ok) throw new Error("Failed to load AI memories");
      const data = await res.json();
      setMemories(data.memories || []);
      setStats(data.stats || null);
    } catch (err: any) {
      error("Could not load memories", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      const matchesSearch =
        !searchQuery ||
        mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mem.memoryType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || mem.memoryType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [memories, searchQuery, selectedType]);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent.trim(),
          memoryType: newType,
          importance: newImportance,
          source: "manual",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to store memory");
      }

      const created = await res.json();
      setMemories((prev) => [created.memory, ...prev]);
      setNewContent("");
      setIsAdding(false);
      success("Memory stored", "Koraspace AI will now remember this across agent runs.");
    } catch (err: any) {
      error("Error storing memory", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMemory = async (memoryId: string) => {
    if (!editContent.trim()) return;
    setActionLoadingId(memoryId);

    try {
      const res = await fetch(`/api/ai/memory/${memoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent.trim(),
          importance: editImportance,
        }),
      });

      if (!res.ok) throw new Error("Failed to update memory");
      const updated = await res.json();

      setMemories((prev) =>
        prev.map((m) => (m.id === memoryId ? updated.memory : m))
      );
      setEditingMemory(null);
      success("Memory updated", "Changes saved to persistent memory.");
    } catch (err: any) {
      error("Update failed", err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleForgetMemory = async (memoryId: string) => {
    if (!confirm("Are you sure you want Koraspace to forget this memory?")) return;
    setActionLoadingId(memoryId);

    try {
      const res = await fetch(`/api/ai/memory/${memoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete memory");

      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      toast({
        title: "Memory forgotten",
        description: "The memory was permanently removed from the knowledge base.",
        variant: "info",
      });
    } catch (err: any) {
      error("Could not forget memory", err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getTypeBadge = (type: SemanticMemory["memoryType"]) => {
    switch (type) {
      case "brand_rule":
        return {
          label: "Brand Rule",
          icon: Shield,
          color: "bg-red-500/10 text-red-500 border-red-500/20",
        };
      case "fact":
        return {
          label: "Audience & Fact",
          icon: Users,
          color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        };
      case "preference":
        return {
          label: "Style Preference",
          icon: Sliders,
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
      case "decision":
        return {
          label: "Strategic Decision",
          icon: CheckCircle2,
          color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        };
      default:
        return {
          label: "Conversation",
          icon: Sparkles,
          color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[var(--sai-indigo)]" />
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                AI Memory & Brand Knowledge
              </h2>
            </div>
            <p className="text-xs text-[var(--fg-3)]">
              Koraspace AI continuously remembers your audience, voice, brand guardrails,
              and strategic decisions across all agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMemories}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2 text-xs font-medium text-[var(--fg-2)] hover:bg-[var(--stroke)]/30 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--sai-indigo)] to-[var(--sai-purple)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Knowledge
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[var(--stroke)]">
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]/50 p-3">
              <p className="text-[11px] text-[var(--fg-4)] uppercase font-semibold tracking-wider">
                Total Memories
              </p>
              <p className="text-xl font-bold text-[var(--fg)] mt-1">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]/50 p-3">
              <p className="text-[11px] text-red-400 uppercase font-semibold tracking-wider">
                Brand Guardrails
              </p>
              <p className="text-xl font-bold text-[var(--fg)] mt-1">
                {stats.byType.brand_rule || 0}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]/50 p-3">
              <p className="text-[11px] text-blue-400 uppercase font-semibold tracking-wider">
                Audience Facts
              </p>
              <p className="text-xl font-bold text-[var(--fg)] mt-1">
                {stats.byType.fact || 0}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]/50 p-3">
              <p className="text-[11px] text-amber-400 uppercase font-semibold tracking-wider">
                Tone Preferences
              </p>
              <p className="text-xl font-bold text-[var(--fg)] mt-1">
                {stats.byType.preference || 0}
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Add Memory Form Dialog/Panel */}
      {isAdding && (
        <GlassCard className="p-6 border-[var(--sai-indigo)]/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleCreateMemory} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--fg)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--sai-indigo)]" />
                Add Persistent Knowledge or Brand Rule
              </h3>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-[var(--fg-4)] hover:text-[var(--fg)]"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--fg-2)] mb-1.5">
                Memory Content / Rule Statement
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="e.g. 'Never describe our platform as cheap software. Always emphasize enterprise reliability.'"
                className="w-full h-24 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:outline-none focus:ring-2 focus:ring-[var(--sai-indigo)]/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--fg-2)] mb-1.5">
                  Knowledge Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-xs text-[var(--fg)] focus:outline-none"
                >
                  <option value="fact">Audience & Business Fact</option>
                  <option value="brand_rule">Brand Rule / Guardrail</option>
                  <option value="preference">Writing Style Preference</option>
                  <option value="decision">Strategic Decision</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--fg-2)] mb-1.5">
                  Importance Level (1-5)
                </label>
                <select
                  value={newImportance}
                  onChange={(e) => setNewImportance(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-xs text-[var(--fg)] focus:outline-none"
                >
                  <option value={5}>5 - Critical / Mandatory Guardrail</option>
                  <option value={4}>4 - High Importance</option>
                  <option value={3}>3 - Standard Fact</option>
                  <option value={2}>2 - Useful Context</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-xs font-medium text-[var(--fg-3)] hover:bg-[var(--stroke)]/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newContent.trim()}
                className="rounded-xl bg-gradient-to-r from-[var(--sai-indigo)] to-[var(--sai-purple)] px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? "Storing..." : "Save to AI Memory"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--fg-4)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "brand_rule", label: "Guardrails" },
            { id: "fact", label: "Facts" },
            { id: "preference", label: "Preferences" },
            { id: "decision", label: "Decisions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                selectedType === tab.id
                  ? "bg-[var(--sai-indigo)] text-white shadow-xs"
                  : "bg-[var(--panel-fill)] border border-[var(--stroke)] text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="space-y-3">
        {loading && memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="h-6 w-6 text-[var(--sai-indigo)] animate-spin" />
            <p className="text-xs text-[var(--fg-4)] mt-2">Loading knowledge base...</p>
          </div>
        ) : filteredMemories.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-[var(--fg-4)] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[var(--fg)]">No memories found</h4>
            <p className="text-xs text-[var(--fg-4)] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No memories match your query. Try clearing search filters."
                : "Your AI hasn't recorded memories yet. As you chat or add rules, they will appear here."}
            </p>
          </GlassCard>
        ) : (
          filteredMemories.map((mem) => {
            const badge = getTypeBadge(mem.memoryType);
            const Icon = badge.icon;
            const isEditingThis = editingMemory?.id === mem.id;

            return (
              <GlassCard
                key={mem.id}
                className="p-4.5 hover:border-[var(--stroke-hover)] transition-all"
              >
                {isEditingThis ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-20 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] p-2.5 text-xs text-[var(--fg)] focus:outline-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--fg-3)]">Importance:</span>
                        <select
                          value={editImportance}
                          onChange={(e) => setEditImportance(Number(e.target.value))}
                          className="h-8 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2 text-xs text-[var(--fg)]"
                        >
                          <option value={5}>5 (Critical)</option>
                          <option value={4}>4 (High)</option>
                          <option value={3}>3 (Medium)</option>
                          <option value={2}>2 (Low)</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingMemory(null)}
                          className="rounded-lg border border-[var(--stroke)] px-3 py-1 text-xs text-[var(--fg-3)]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateMemory(mem.id)}
                          disabled={actionLoadingId === mem.id}
                          className="rounded-lg bg-[var(--sai-indigo)] px-3 py-1 text-xs font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-medium text-[var(--fg-4)]">
                          Importance: {mem.importance}/5
                        </span>
                        <span className="text-[10px] text-[var(--fg-4)]">
                          • {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--fg)] leading-relaxed break-words">
                        {mem.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 hover:opacity-100 shrink-0">
                      <button
                        onClick={() => {
                          setEditingMemory(mem);
                          setEditContent(mem.content);
                          setEditImportance(mem.importance);
                        }}
                        className="p-1.5 rounded-lg text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--stroke)]/50 transition-colors"
                        title="Edit Memory"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleForgetMemory(mem.id)}
                        disabled={actionLoadingId === mem.id}
                        className="p-1.5 rounded-lg text-[var(--fg-4)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Forget Memory"
                      >
                        {actionLoadingId === mem.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
