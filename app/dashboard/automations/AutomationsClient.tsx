"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarClock,
  Clock,
  GitBranch,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface AutomationItem {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "paused" | "draft" | "archived";
  trigger_type?: string;
  nodes?: any[];
  edges?: any[];
  steps?: any[];
  total_runs?: number;
  successful_runs?: number;
  failed_runs?: number;
  contacts_count?: number;
  conversion_rate?: number;
  avg_time?: string;
  last_run_at?: string | null;
  updated_at: string;
  created_at?: string;
}

interface Props {
  initialAutomations: AutomationItem[];
  userName: string;
}

export function AutomationsClient({ initialAutomations, userName }: Props) {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<AutomationItem[]>(initialAutomations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "draft">("all");
  const [runningId, setRunningId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = automations.length;
    const active = automations.filter((a) => a.status === "active").length;
    const paused = automations.filter((a) => a.status === "paused").length;
    const totalRuns = automations.reduce(
      (sum, a) => sum + Number(a.total_runs || a.contacts_count || 0),
      0
    );

    return { total, active, paused, totalRuns };
  }, [automations]);

  const filtered = useMemo(() => {
    return automations.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [automations, statusFilter, search]);

  async function toggleStatus(automation: AutomationItem) {
    const nextStatus = automation.status === "active" ? "paused" : "active";

    try {
      const res = await fetch(`/api/automations/${automation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? { ...a, status: nextStatus } : a))
      );

      toast({
        title: nextStatus === "active" ? "Automation Activated" : "Automation Paused",
        description: `"${automation.name}" is now ${nextStatus}.`,
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Could not update automation status.",
        variant: "error",
      });
    }
  }

  async function deleteAutomation(id: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return;

    try {
      const res = await fetch(`/api/automations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setAutomations((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Automation Deleted",
        description: "The automation has been archived.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not delete automation.",
        variant: "error",
      });
    }
  }

  async function runAutomation(id: string, name: string) {
    setRunningId(id);
    try {
      const res = await fetch(`/api/automations/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: { manual: true, triggeredBy: userName } }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");

      setAutomations((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                total_runs: Number(a.total_runs || 0) + 1,
                last_run_at: new Date().toISOString(),
              }
            : a
        )
      );

      toast({
        title: "Workflow Executed",
        description: `"${name}" ran successfully!`,
      });
    } catch (err: any) {
      toast({
        title: "Execution Error",
        description: err.message || "Failed to run workflow.",
        variant: "error",
      });
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div className="min-h-full bg-[#121212] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#168cff]">
              <Workflow className="h-4 w-4" />
              Marketing Workflows & Integrations
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Automations</h1>
            <p className="mt-1 text-sm text-white/50">
              Build automated marketing systems connecting social channels, CRM leads, and 24 integrations.
            </p>
          </div>

          <Link
            href="/dashboard/automations/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#168cff] px-5 text-sm font-semibold text-white transition hover:bg-[#0b7be5] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Automation
          </Link>
        </div>

        {/* METRICS */}
        <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatTile
            icon={Workflow}
            label="Total Automations"
            value={stats.total}
            detail="Across all categories"
          />
          <StatTile
            icon={Zap}
            label="Active"
            value={stats.active}
            detail="Listening for triggers"
          />
          <StatTile
            icon={Pause}
            label="Paused"
            value={stats.paused}
            detail="Inactive workflows"
          />
          <StatTile
            icon={Activity}
            label="Total Executions"
            value={stats.totalRuns.toLocaleString()}
            detail="All-time workflow runs"
          />
        </div>

        {/* TOOLBAR */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search automations..."
              className="h-10 w-full rounded-xl border border-white/10 bg-[#171717] pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-[#168cff]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["all", "active", "paused", "draft"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3.5 py-2 text-xs font-medium capitalize transition ${
                  statusFilter === status
                    ? "bg-[#168cff] text-white"
                    : "border border-white/10 bg-[#171717] text-white/60 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* WORKFLOW LIST */}
        <div className="mt-6 space-y-3">
          {filtered.map((automation) => (
            <AutomationRow
              key={automation.id}
              automation={automation}
              isRunning={runningId === automation.id}
              onToggle={() => toggleStatus(automation)}
              onRun={() => runAutomation(automation.id, automation.name)}
              onDelete={() => deleteAutomation(automation.id)}
            />
          ))}

          {!filtered.length && (
            <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center">
              <Bot className="mx-auto h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-base font-semibold text-white">No automations found</h3>
              <p className="mt-1 text-xs text-white/40">
                {search ? "No automations match your search criteria." : "Create your first marketing workflow."}
              </p>
              <Link
                href="/dashboard/automations/new"
                className="mt-6 inline-flex h-9 items-center gap-2 rounded-xl bg-[#168cff] px-4 text-xs font-semibold text-white transition hover:bg-[#0b7be5]"
              >
                <Plus className="h-4 w-4" />
                Create Automation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: any;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171717] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#168cff]/10 text-[#168cff]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <div className="mt-4 text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-[11px] text-[#168cff]">{detail}</div>
    </div>
  );
}

function AutomationRow({
  automation,
  isRunning,
  onToggle,
  onRun,
  onDelete,
}: {
  automation: AutomationItem;
  isRunning: boolean;
  onToggle: () => void;
  onRun: () => void;
  onDelete: () => void;
}) {
  const stepsCount =
    (automation.nodes && automation.nodes.length) ||
    (automation.steps && automation.steps.length) ||
    0;

  const totalRuns = automation.total_runs || automation.contacts_count || 0;
  const successRuns = automation.successful_runs || 0;
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;

  return (
    <div className="group rounded-2xl border border-white/10 bg-[#161616] p-4 transition hover:border-[#168cff]/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT: Icon & Meta */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#168cff]/20 bg-[#168cff]/10 text-[#168cff]">
            <Zap className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/dashboard/automations/${automation.id}`}
                className="truncate text-sm font-semibold text-white transition hover:text-[#168cff]"
              >
                {automation.name}
              </Link>
              <StatusBadge status={automation.status} />
            </div>

            <p className="mt-1 truncate text-xs text-white/40">
              {automation.description || "Marketing automation workflow"}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50">
                {stepsCount} steps
              </span>
              <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50">
                {automation.trigger_type || "manual"} trigger
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE: Metrics */}
        <div className="flex items-center gap-8 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Runs</div>
            <div className="mt-1 font-semibold text-white">{totalRuns}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Success</div>
            <div className="mt-1 font-semibold text-emerald-400">{successRate}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Last Run</div>
            <div className="mt-1 text-white/60">
              {automation.last_run_at ? new Date(automation.last_run_at).toLocaleDateString() : "Never"}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={isRunning}
            title="Test run workflow"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-[#1a1a1a] px-3 text-xs font-medium text-white/70 transition hover:border-[#168cff]/50 hover:text-white"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin text-[#168cff]" : ""}`} />
            {isRunning ? "Running..." : "Test"}
          </button>

          <button
            onClick={onToggle}
            title={automation.status === "active" ? "Pause automation" : "Activate automation"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a1a] text-white/70 transition hover:border-[#168cff]/50 hover:text-white"
          >
            {automation.status === "active" ? (
              <Pause className="h-4 w-4 text-amber-400" />
            ) : (
              <Play className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          <Link
            href={`/dashboard/automations/${automation.id}`}
            title="Edit workflow in builder"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#168cff] px-3 text-xs font-semibold text-white transition hover:bg-[#0b7be5]"
          >
            Edit
          </Link>

          <button
            onClick={onDelete}
            title="Delete automation"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a1a] text-white/40 transition hover:border-red-500/50 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: "Active", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    paused: { label: "Paused", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    draft: { label: "Draft", bg: "bg-white/5 text-white/50 border-white/10" },
    archived: { label: "Archived", bg: "bg-red-500/10 text-red-400 border-red-500/20" },
  }[status] || { label: status, bg: "bg-white/5 text-white/50 border-white/10" };

  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${config.bg}`}>
      {config.label}
    </span>
  );
}
