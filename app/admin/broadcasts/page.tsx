"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Eye,
  Radio,
  Sparkles,
  Link2,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { createBroadcast, toggleBroadcast, deleteBroadcast } from "./actions";
import { timeAgo } from "@/lib/dashboard/helpers";
import { PLAN_ORDER } from "@/lib/billing/plans";

type Broadcast = {
  id: string;
  message: string;
  type: "info" | "warning" | "critical";
  is_active: boolean;
  target_plan?: string | null;
  style?: "banner" | "toast" | "modal";
  link_url?: string | null;
  created_at: string;
};

export default function AdminBroadcasts() {
  const { success, error: toastError } = useToast();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [msgInput, setMsgInput] = useState("");
  const [typeInput, setTypeInput] = useState<"info" | "warning" | "critical">("info");
  const [targetPlan, setTargetPlan] = useState<string>("all");
  const [styleInput, setStyleInput] = useState<"banner" | "toast" | "modal">("banner");
  const [linkInput, setLinkInput] = useState("");
  const [targetUser, setTargetUser] = useState("");

  const load = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("system_broadcasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setBroadcasts(data as Broadcast[]);
    } catch (e) {
      toastError("Couldn't load broadcasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!msgInput.trim()) return;
    setBusy("create");
    try {
      await createBroadcast(
        msgInput.trim(),
        typeInput,
        targetUser.trim() || undefined,
        targetPlan === "all" ? undefined : targetPlan,
        styleInput,
        linkInput.trim() || undefined
      );
      success("Broadcast deployed to users");
      setMsgInput("");
      setTargetUser("");
      setLinkInput("");
      load();
    } catch (e) {
      toastError("Couldn't create broadcast", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleToggle = async (b: Broadcast) => {
    setBusy(b.id);
    const next = !b.is_active;
    setBroadcasts((prev) => prev.map((x) => (x.id === b.id ? { ...x, is_active: next } : x)));
    try {
      await toggleBroadcast(b.id, next);
      success(next ? "Broadcast activated" : "Broadcast hidden");
    } catch (e) {
      setBroadcasts((prev) => prev.map((x) => (x.id === b.id ? { ...x, is_active: !next } : x)));
      toastError("Couldn't toggle broadcast");
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (b: Broadcast) => {
    if (!confirm("Delete this broadcast permanently?")) return;
    setBusy(b.id);
    try {
      await deleteBroadcast(b.id);
      setBroadcasts((prev) => prev.filter((x) => x.id !== b.id));
      success("Broadcast deleted");
    } catch (e) {
      toastError("Couldn't delete broadcast");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Global User Notifications"
        title="System Broadcasts"
        sub="Push real-time banners, maintenance alerts, and feature updates across all workspaces."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        }
      />

      {/* Broadcast Composer */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-400" />
          <h3 className="font-display text-[15px] font-semibold text-white">
            Deploy New Announcement
          </h3>
        </div>

        <div className="space-y-3">
          <textarea
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            placeholder="e.g. Platform update: Llama 3.3 70B fine-tuning is now live for all creators..."
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            {/* Severity Type */}
            <div>
              <label className="block mb-1 text-[10.5px] uppercase font-bold text-white/40 font-data">
                Alert Severity
              </label>
              <select
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-[#12131a] p-2.5 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="info">Info (Blue)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="critical">Critical (Red)</option>
              </select>
            </div>

            {/* Target Plan */}
            <div>
              <label className="block mb-1 text-[10.5px] uppercase font-bold text-white/40 font-data">
                Target Audience
              </label>
              <select
                value={targetPlan}
                onChange={(e) => setTargetPlan(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#12131a] p-2.5 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="all">All Plans (Global)</option>
                {PLAN_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)} Tier Only
                  </option>
                ))}
              </select>
            </div>

            {/* Display Style */}
            <div>
              <label className="block mb-1 text-[10.5px] uppercase font-bold text-white/40 font-data">
                Display Format
              </label>
              <select
                value={styleInput}
                onChange={(e) => setStyleInput(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-[#12131a] p-2.5 text-xs text-white focus:border-blue-500 outline-none"
              >
                <option value="banner">Top Banner</option>
                <option value="toast">Toast Alert</option>
                <option value="modal">Modal Prompt</option>
              </select>
            </div>

            {/* Link URL (optional) */}
            <div>
              <label className="block mb-1 text-[10.5px] uppercase font-bold text-white/40 font-data">
                Action Link (Optional)
              </label>
              <input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="/dashboard/repurpose"
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white placeholder:text-white/30 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreate}
              disabled={!msgInput.trim() || busy === "create"}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {busy === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>Publish Broadcast</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Broadcast History Table */}
      <GlassCard className="p-6">
        <h3 className="mb-4 font-display text-[15px] font-semibold text-white">
          Active &amp; Historical Broadcasts
        </h3>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          </div>
        ) : broadcasts.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-6">No broadcasts deployed.</p>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <Pill
                      tone={
                        b.type === "critical"
                          ? "red"
                          : b.type === "warning"
                          ? "gold"
                          : "indigo"
                      }
                    >
                      {b.type.toUpperCase()}
                    </Pill>
                    {b.target_plan && (
                      <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/60 font-data">
                        {b.target_plan.toUpperCase()}
                      </span>
                    )}
                    <span className="text-[11px] text-white/40 font-data">{timeAgo(b.created_at)}</span>
                  </div>
                  <p className="text-xs font-medium text-white/90 leading-relaxed">{b.message}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggle(b)}
                    disabled={busy === b.id}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      b.is_active ? "bg-blue-600" : "bg-white/10"
                    }`}
                  >
                    <div
                      className="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform"
                      style={{ left: b.is_active ? "calc(100% - 20px)" : "4px" }}
                    />
                  </button>

                  <button
                    onClick={() => handleDelete(b)}
                    disabled={busy === b.id}
                    className="p-1.5 text-white/40 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
