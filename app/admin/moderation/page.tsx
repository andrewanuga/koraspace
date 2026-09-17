"use client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";



import { useEffect, useState } from "react";
import { Flag, UserX, UserCheck, Loader2, AlertTriangle } from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/dashboard/helpers";
import { suspendUser, unsuspendUser, flagUserForReview } from "./actions";

type FlaggedUser = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  suspended: boolean;
  persona: string | null;
  plan: string | null;
  created_at: string;
  reason?: string;
};

type ContentReport = {
  id: string;
  type: string;
  severity: string;
  user_id: string | null;
  detail: string | null;
  created_at: string;
};

export default function AdminModeration() {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<FlaggedUser[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: flagged }, { data: events }] = await Promise.all([
        // Get suspended + recently flagged users
        supabase
          .from("profiles")
          .select("id, full_name, username, email, suspended, persona, plan, created_at")
          .or("suspended.eq.true")
          .order("created_at", { ascending: false })
          .limit(50),
        // Get flagged/suspicious security events
        supabase
          .from("security_events")
          .select("id, type, severity, user_id, detail, created_at")
          .in("type", ["user_flagged", "user_suspended", "ip_auto_blocked", "rate_limit_exceeded"])
          .order("created_at", { ascending: false })
          .limit(60),
      ]);
      setUsers((flagged as FlaggedUser[]) ?? []);
      setReports((events as ContentReport[]) ?? []);
    } catch {
      /* offline */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSuspend = async (user: FlaggedUser) => {
    setBusy(user.id);
    try {
      if (user.suspended) {
        await unsuspendUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, suspended: false } : u));
        success("User unsuspended");
      } else {
        await suspendUser(user.id, "Suspended via moderation dashboard");
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, suspended: true } : u));
        success("User suspended");
      }
    } catch (e) {
      toastError("Action failed", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const handleFlag = async (userId: string) => {
    setBusy(userId + "-flag");
    try {
      await flagUserForReview(userId, "Manually flagged via moderation dashboard");
      success("User flagged for review");
    } catch (e) {
      toastError("Couldn't flag user", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const sevTone = (s: string) => (s === "critical" ? "red" : s === "warning" ? "gold" : "indigo") as "red" | "gold" | "indigo";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Content moderation"
        title="Moderation"
        sub="Review suspended accounts and flagged security events."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        {/* Suspended / flagged users */}
        <GlassCard className="h-fit p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--sai-gold)]" />
            <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Suspended users</p>
            <Pill tone="gold">{users.filter((u) => u.suspended).length}</Pill>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--fg-4)]" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-[13px] text-[var(--fg-4)]">No suspended users.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[13.5px] text-[var(--fg)]">
                        {u.full_name ?? u.username ?? "Unknown"}
                      </span>
                      {u.suspended && <Pill tone="red">suspended</Pill>}
                      {u.persona && <Pill tone="muted">{u.persona}</Pill>}
                    </div>
                    <p className="text-[11.5px] text-[var(--fg-4)] mt-0.5">{u.email ?? u.username}</p>
                    <p className="text-[11px] text-[var(--fg-4)] mt-0.5">Joined {timeAgo(u.created_at)}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleFlag(u.id)}
                      disabled={busy === u.id + "-flag"}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--fg-4)] hover:text-[var(--sai-gold)] disabled:opacity-50 transition-colors"
                      title="Flag for review"
                    >
                      {busy === u.id + "-flag" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSuspend(u)}
                      disabled={busy === u.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--fg-4)] hover:text-[var(--sai-red)] disabled:opacity-50 transition-colors"
                      title={u.suspended ? "Unsuspend" : "Suspend"}
                    >
                      {busy === u.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : u.suspended
                        ? <UserCheck className="h-3.5 w-3.5" />
                        : <UserX className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Moderation event feed */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Flag className="h-4 w-4 text-[var(--sai-indigo)]" />
            <p className="font-display text-[15px] font-semibold text-[var(--fg)]">Activity feed</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--fg-4)]" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-[13px] text-[var(--fg-4)]">No flagged events.</p>
          ) : (
            <div className="max-h-[calc(100vh-280px)] space-y-1.5 overflow-y-auto pr-1">
              {reports.map((r) => (
                <div key={r.id} className="flex items-start gap-2.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2">
                  <span
                    className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      background: r.severity === "critical"
                        ? "var(--sai-red)"
                        : r.severity === "warning"
                        ? "var(--sai-gold)"
                        : "var(--sai-indigo)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Pill tone={sevTone(r.severity)}>{r.type.replace(/_/g, " ")}</Pill>
                      <span className="ml-auto text-[11px] text-[var(--fg-4)]">{timeAgo(r.created_at)}</span>
                    </div>
                    <p className="mt-1 truncate text-[12.5px] text-[var(--fg-3)]">{r.detail ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
