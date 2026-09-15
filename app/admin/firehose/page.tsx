"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  Loader2,
  Bot,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  Search,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import { fetchFirehose } from "./actions";
import { timeAgo } from "@/lib/dashboard/helpers";

type Action = {
  id: string;
  action: string;
  platform: string | null;
  comment: string;
  reply: string | null;
  reason: string | null;
  created_at: string;
  profiles: { full_name: string | null; username: string | null };
};

const PLATFORMS = ["all", "instagram", "x", "linkedin", "tiktok", "telegram", "whatsapp"] as const;

export default function AdminFirehose() {
  const { error: toastError } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const load = async () => {
    try {
      const data = await fetchFirehose();
      setActions(data as any);
    } catch (e) {
      toastError("Couldn't load firehose");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (streaming) {
      const interval = setInterval(load, 7000);
      return () => clearInterval(interval);
    }
  }, [streaming]);

  const filteredActions = actions.filter((a) => {
    if (platformFilter !== "all" && a.platform?.toLowerCase() !== platformFilter.toLowerCase())
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const content = `${a.comment} ${a.reply || ""} ${a.profiles?.full_name || ""} ${a.action}`.toLowerCase();
      if (!content.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Autonomous Agent Telemetry"
        title="Agent Action Firehose"
        sub="Live high-velocity stream of all autonomous AI decisions, auto-replies, and scheduled drip events across Koraspace."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStreaming(!streaming)}
              className={`flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${
                streaming
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  : "border-white/10 bg-white/[0.02] text-white/60"
              }`}
            >
              {streaming ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white/60" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            <button
              onClick={load}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-blue-600/10 px-3.5 text-xs font-semibold text-blue-400 hover:bg-blue-600/20 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <GlassCard className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`rounded-lg px-2.5 py-1 capitalize transition ${
                platformFilter === p
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search firehose events..."
            className="h-8 w-56 rounded-lg border border-white/10 bg-white/[0.02] pl-8 pr-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 outline-none"
          />
        </div>
      </GlassCard>

      {/* Firehose Stream Card */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="border-b border-white/[0.08] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="h-5 w-5 text-rose-400" />
            <p className="font-display text-[15px] font-semibold text-white">
              Real-time Ingest Pipeline
            </p>
            {streaming && (
              <div className="ml-2 flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
              </div>
            )}
          </div>
          <span className="text-xs text-white/40 font-data">{filteredActions.length} actions captured</span>
        </div>

        {loading ? (
          <div className="flex h-44 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/40">
            No agent activities recorded in the selected filter window.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] max-h-[640px] overflow-y-auto">
            {filteredActions.map((a) => (
              <div key={a.id} className="p-4 transition hover:bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-white">
                      {a.profiles?.full_name || a.profiles?.username || "Autonomous Agent"}
                    </span>
                    <Pill tone={a.action === "auto_reply" ? "green" : "indigo"}>
                      {a.action.replace("_", " ")}
                    </Pill>
                    {a.platform && (
                      <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white/50 font-data">
                        {a.platform}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-white/40 font-data">{timeAgo(a.created_at)}</span>
                </div>

                <div className="ml-6 space-y-1.5 text-xs">
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 space-y-1.5">
                    <p className="text-white/60">
                      <strong className="text-white/90 font-medium">Trigger Signal:</strong> &quot;{a.comment}&quot;
                    </p>
                    {a.reply && (
                      <p className="text-emerald-300">
                        <strong className="text-emerald-400 font-medium">Autonomous Action:</strong> &quot;{a.reply}&quot;
                      </p>
                    )}
                    {a.reason && (
                      <p className="text-[11px] text-white/40 italic">
                        Intent Scoring &amp; Reasoning: {a.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
