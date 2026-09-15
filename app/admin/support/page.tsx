"use client";

import { useEffect, useState, useMemo } from "react";
import {
  LifeBuoy,
  CheckCircle2,
  MessageSquare,
  Loader2,
  Send,
  User,
  Clock,
  Filter,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { resolveTicket, replyToTicket } from "./actions";
import { timeAgo } from "@/lib/dashboard/helpers";

type Ticket = {
  id: string;
  user_id: string;
  category: "bug" | "feature" | "help" | "other";
  message: string;
  email: string | null;
  status: "open" | "resolved";
  admin_reply?: string | null;
  priority?: "low" | "medium" | "high" | "critical";
  created_at: string;
};

export default function AdminSupport() {
  const { success, error: toastError } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("open");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const load = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setTickets(data as Ticket[]);
    } catch (e) {
      toastError("Couldn't load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [tickets, statusFilter, categoryFilter]);

  const handleResolve = async (id: string) => {
    setBusy(id);
    try {
      await resolveTicket(id);
      success("Ticket resolved");
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t)));
    } catch (e) {
      toastError("Couldn't resolve ticket");
    } finally {
      setBusy(null);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setBusy(`reply-${id}`);
    try {
      await replyToTicket(id, replyText.trim());
      success("Reply sent and ticket resolved");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, admin_reply: replyText.trim(), status: "resolved" }
            : t
        )
      );
      setActiveReplyId(null);
      setReplyText("");
    } catch (e) {
      toastError("Failed to send reply");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Customer Inquiries &amp; Triage"
        title="Support Desk"
        sub="Respond directly to user bug reports, feature requests, and account inquiries."
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

      {/* Filter Bar */}
      <GlassCard className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(["open", "resolved", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white/[0.02] border border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {tab} ({tickets.filter((t) => tab === "all" || t.status === tab).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#12131a] px-3 py-1.5 text-xs text-white font-medium focus:border-blue-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="bug">Bugs</option>
            <option value="feature">Feature Requests</option>
            <option value="help">General Help</option>
            <option value="other">Other</option>
          </select>
        </div>
      </GlassCard>

      {/* Tickets List */}
      <GlassCard className="p-6">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <LifeBuoy className="mb-3 h-8 w-8 text-white/30" />
            <p className="text-sm font-semibold text-white">No tickets found</p>
            <p className="mt-1 text-xs text-white/40">
              {statusFilter === "open" ? "Your inbox is completely clear!" : "No tickets in this view."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((t) => {
              const isReplying = activeReplyId === t.id;

              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 transition hover:border-white/15"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2.5">
                      <Pill
                        tone={
                          t.category === "bug"
                            ? "red"
                            : t.category === "feature"
                            ? "indigo"
                            : t.category === "help"
                            ? "gold"
                            : "muted"
                        }
                      >
                        {t.category.toUpperCase()}
                      </Pill>
                      <span className="text-xs text-white/40 font-data">{timeAgo(t.created_at)}</span>
                      {t.status === "resolved" && <Pill tone="green">Resolved</Pill>}
                    </div>

                    <div className="flex items-center gap-2">
                      {t.status !== "resolved" && (
                        <button
                          onClick={() => {
                            setActiveReplyId(isReplying ? null : t.id);
                            setReplyText("");
                          }}
                          className="flex h-8 items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-600/10 px-3 text-xs font-semibold text-blue-400 hover:bg-blue-600/20 transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{isReplying ? "Cancel Reply" : "Reply & Resolve"}</span>
                        </button>
                      )}

                      {t.status === "open" && (
                        <button
                          onClick={() => handleResolve(t.id)}
                          disabled={busy === t.id}
                          className="flex h-8 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-xs font-medium text-white/70 hover:text-white transition"
                        >
                          {busy === t.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-xs leading-relaxed text-white/90">
                    <p className="whitespace-pre-wrap">{t.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-white/40 border-t border-white/[0.04] pt-2 font-data">
                      <span>Sender: <strong className="text-white/70">{t.email || "Registered User"}</strong></span>
                      <span>•</span>
                      <span>User ID: <strong className="text-white/70">{t.user_id}</strong></span>
                    </div>
                  </div>

                  {/* Existing Admin Reply */}
                  {t.admin_reply && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-1">
                      <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Admin Reply Dispatched:
                      </p>
                      <p className="text-white/80 whitespace-pre-wrap">{t.admin_reply}</p>
                    </div>
                  )}

                  {/* Reply Composer Form */}
                  {isReplying && (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Compose Official Admin Response</span>
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write clear resolution steps or answers for the user..."
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-[#12131a] p-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="rounded-xl border border-white/10 px-3.5 py-1.5 text-xs font-medium text-white/60 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendReply(t.id)}
                          disabled={!replyText.trim() || busy === `reply-${t.id}`}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                          {busy === `reply-${t.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Send Response</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
