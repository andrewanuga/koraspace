"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Ban,
  CircleCheck,
  Loader2,
  ChevronRight,
  Filter,
  Sparkles,
  Shield,
  ShieldAlert,
  ArrowUpDown,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
} from "lucide-react";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
// import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/billing/plans";
import { updateUserPlan, toggleUserSuspension, grantUserCredits, setUserAdminRole, getUsers } from "./actions";
import Link from "next/link";

type Row = {
  id: string;
  full_name: string | null;
  username: string | null;
  persona: string | null;
  plan: PlanId;
  subscription_status: string | null;
  suspended: boolean;
  is_admin: boolean;
  created_at: string;
  generations_used?: number;
};

export default function AdminUsers() {
  const { success, error: toastError } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [personaFilter, setPersonaFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"created" | "name" | "plan">("created");
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Credit modal state
  const [creditUser, setCreditUser] = useState<Row | null>(null);
  const [creditAmount, setCreditAmount] = useState(50);

  const load = async () => {
    try {
      const data = await getUsers();
      if (data) setRows(data as any);
    } catch {
      // offline
    }
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...rows];

    // Search query
    const s = q.trim().toLowerCase();
    if (s) {
      result = result.filter((r) =>
        [r.full_name, r.username, r.persona, r.plan, r.id].some((v) =>
          (v ?? "").toLowerCase().includes(s)
        )
      );
    }

    // Plan Filter
    if (planFilter !== "all") {
      result = result.filter((r) => r.plan === planFilter);
    }

    // Status Filter
    if (statusFilter === "suspended") {
      result = result.filter((r) => r.suspended);
    } else if (statusFilter === "active") {
      result = result.filter((r) => !r.suspended);
    } else if (statusFilter === "admin") {
      result = result.filter((r) => r.is_admin);
    }

    // Persona Filter
    if (personaFilter !== "all") {
      result = result.filter((r) => (r.persona || "").toLowerCase() === personaFilter.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name") {
        return (a.full_name || a.username || "").localeCompare(b.full_name || b.username || "");
      }
      if (sortBy === "plan") {
        return a.plan.localeCompare(b.plan);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [rows, q, planFilter, statusFilter, personaFilter, sortBy]);

  const toggleSuspend = async (r: Row) => {
    setBusy(r.id);
    const next = !r.suspended;
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, suspended: next } : x)));
    try {
      await toggleUserSuspension(r.id, next, r.full_name);
      success(next ? "Account suspended" : "Account reinstated");
    } catch (e) {
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, suspended: r.suspended } : x)));
      toastError("Couldn't update account", e instanceof Error ? e.message : undefined);
    } finally {
      setBusy(null);
    }
  };

  const changePlan = async (r: Row, plan: PlanId) => {
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, plan } : x)));
    try {
      await updateUserPlan(r.id, plan);
      success(`Updated ${r.full_name || "user"} to ${plan.toUpperCase()}`);
    } catch (e) {
      toastError("Couldn't change plan", e instanceof Error ? e.message : undefined);
      load();
    }
  };

  const handleGrantCredits = async () => {
    if (!creditUser) return;
    setBusy("credits");
    try {
      await grantUserCredits(creditUser.id, creditAmount);
      success(`Granted +${creditAmount} credits to ${creditUser.full_name || "user"}`);
      setCreditUser(null);
      load();
    } catch (e) {
      toastError("Failed to grant credits");
    } finally {
      setBusy(null);
    }
  };

  const initials = (r: Row) =>
    (r.full_name || r.username || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="User Lifecycle Administration"
        title="Users &amp; Accounts"
        sub={`Manage ${rows.length} registered accounts, enforce zero-trust policies, override plans, or grant generative compute allowances.`}
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

      {/* Filter Toolbar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, handle, email, ID..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-[#12131a] px-3 font-medium text-white/80 focus:border-blue-500/50 focus:outline-none"
            >
              <option value="all">All Plans</option>
              {PLAN_ORDER.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-[#12131a] px-3 font-medium text-white/80 focus:border-blue-500/50 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="admin">Administrators</option>
            </select>

            {/* Persona Filter */}
            <select
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-[#12131a] px-3 font-medium text-white/80 focus:border-blue-500/50 focus:outline-none"
            >
              <option value="all">All Personas</option>
              <option value="creator">Creator</option>
              <option value="marketer">Marketer</option>
              <option value="agency">Agency</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl border border-white/10 bg-[#12131a] px-3 font-medium text-white/80 focus:border-blue-500/50 focus:outline-none"
            >
              <option value="created">Recently Joined</option>
              <option value="name">Name (A-Z)</option>
              <option value="plan">Plan Tier</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="grid grid-cols-[1.8fr_1fr_1.1fr_1fr_auto] gap-3 border-b border-white/[0.08] px-5 py-3.5 font-data text-[10.5px] uppercase tracking-wider text-white/40">
          <span>Account User</span>
          <span>Persona</span>
          <span>Plan Tier</span>
          <span>Joined Date</span>
          <span className="text-right">Actions</span>
        </div>

        {!loaded ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40">
            No accounts matching search and filters.
          </div>
        ) : (
          <div className="max-h-[calc(100vh-320px)] divide-y divide-white/[0.06] overflow-y-auto">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.8fr_1fr_1.1fr_1fr_auto] items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]"
                style={r.suspended ? { opacity: 0.55 } : undefined}
              >
                {/* User Column */}
                <Link
                  prefetch={false}
                  href={`/admin/users/${r.id}`}
                  className="group flex min-w-0 items-center gap-3 transition"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md">
                    {initials(r)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-white group-hover:text-blue-400">
                      {r.full_name || "Untitled User"}
                      {r.is_admin && <Pill tone="red">admin</Pill>}
                      {r.suspended && <Pill tone="red">suspended</Pill>}
                    </p>
                    <p className="truncate text-[11.5px] text-white/40">
                      {r.username ? `@${r.username}` : r.id.slice(0, 12)}
                    </p>
                  </div>
                </Link>

                {/* Persona */}
                <span className="text-[12.5px] font-medium capitalize text-white/70">
                  {r.persona || "-"}
                </span>

                {/* Plan Select */}
                <div>
                  <select
                    value={r.plan}
                    onChange={(e) => changePlan(r, e.target.value as PlanId)}
                    className="rounded-lg border border-white/10 bg-[#14151e] px-2.5 py-1 text-xs font-semibold capitalize text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {PLAN_ORDER.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Joined Date */}
                <span className="text-xs text-white/40 font-data">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setCreditUser(r)}
                    className="flex h-8 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] px-2.5 text-[11.5px] font-medium text-white/70 transition hover:bg-blue-600/15 hover:text-blue-400 hover:border-blue-500/30"
                    title="Grant Credits"
                  >
                    <Sparkles className="h-3 w-3 text-blue-400" />
                    <span>Credits</span>
                  </button>

                  <button
                    onClick={() => toggleSuspend(r)}
                    disabled={busy === r.id || r.is_admin}
                    className={`flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11.5px] font-medium transition disabled:opacity-40 ${
                      r.suspended
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    }`}
                  >
                    {busy === r.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : r.suspended ? (
                      <UserCheck className="h-3.5 w-3.5" />
                    ) : (
                      <UserX className="h-3.5 w-3.5" />
                    )}
                    <span>{r.suspended ? "Reinstate" : "Suspend"}</span>
                  </button>

                  <Link
                    prefetch={false}
                    href={`/admin/users/${r.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/40 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Grant Credits Modal */}
      {creditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12131a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h3 className="font-display text-lg font-bold text-white">
                Grant Generative Credits
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-white/70">
              Grant additional AI generations and compute credits to{" "}
              <strong className="text-white">{creditUser.full_name || creditUser.username || creditUser.id}</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70">Credit Amount</label>
              <div className="grid grid-cols-3 gap-2">
                {[50, 150, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCreditAmount(amt)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      creditAmount === amt
                        ? "border-blue-500 bg-blue-600/20 text-blue-400"
                        : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    +{amt} Credits
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                onClick={() => setCreditUser(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantCredits}
                disabled={busy === "credits"}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                {busy === "credits" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Grant Allowance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
