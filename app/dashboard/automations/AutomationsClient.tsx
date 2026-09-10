"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Edit3,
  Filter,
  GitBranch,
  Layers3,
  Mail,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

type AutomationStatus = "active" | "paused" | "draft";

type AutomationType =
  | "lead_nurturing"
  | "re_engagement"
  | "social_posting"
  | "welcome"
  | "ecommerce"
  | "event_follow_up"
  | "product_launch"
  | "feedback"
  | "custom";

interface Automation {
  id: string;
  name: string;
  description: string;
  type: AutomationType;
  status: AutomationStatus;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  steps: unknown[];
  contacts_count: number;
  conversion_rate: number;
  avg_time: string;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  initialAutomations: Automation[];
  userName: string;
}

const TYPE_META: Record<
  AutomationType,
  {
    label: string;
    icon: any;
  }
> = {
  lead_nurturing: {
    label: "Lead Nurturing",
    icon: Users,
  },
  re_engagement: {
    label: "Re-engagement",
    icon: Activity,
  },
  social_posting: {
    label: "Social Auto-Post",
    icon: Zap,
  },
  welcome: {
    label: "Welcome",
    icon: Mail,
  },
  ecommerce: {
    label: "E-commerce",
    icon: Layers3,
  },
  event_follow_up: {
    label: "Event Follow-Up",
    icon: CalendarClock,
  },
  product_launch: {
    label: "Product Launch",
    icon: Sparkles,
  },
  feedback: {
    label: "Feedback",
    icon: GitBranch,
  },
  custom: {
    label: "Custom Workflow",
    icon: Settings2,
  },
};

const STATUS_META = {
  active: {
    label: "Active",
  },
  paused: {
    label: "Paused",
  },
  draft: {
    label: "Draft",
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function formatDate(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function AutomationsClient({ initialAutomations, userName }: Props) {
  const { toast } = useToast();

  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | AutomationStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AutomationType>("all");
  const [sort, setSort] = useState<"recent" | "contacts" | "conversion">("recent");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pageSize = 7;

  const totals = useMemo(() => {
    const active = automations.filter((item) => item.status === "active").length;
    const paused = automations.filter((item) => item.status === "paused").length;
    const contacts = automations.reduce(
      (sum, item) => sum + Number(item.contacts_count || 0),
      0
    );
    const revenue = 4832;

    return {
      total: automations.length,
      active,
      paused,
      contacts,
      revenue,
    };
  }, [automations]);

  const filtered = useMemo(() => {
    let result = [...automations];

    if (activeTab !== "all") {
      result = result.filter((item) => item.status === activeTab);
    }

    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }

    const q = search.trim().toLowerCase();

    if (q) {
      result = result.filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          TYPE_META[item.type]?.label.toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      if (sort === "contacts") {
        return b.contacts_count - a.contacts_count;
      }

      if (sort === "conversion") {
        return Number(b.conversion_rate) - Number(a.conversion_rate);
      }

      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

    return result;
  }, [automations, activeTab, typeFilter, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetPage() {
    setPage(1);
  }

  async function toggleAutomation(automation: Automation) {
    const nextStatus = automation.status === "active" ? "paused" : "active";
    setSaving(true);

    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update automation");
      }

      setAutomations((current) =>
        current.map((item) =>
          item.id === automation.id ? data.automation : item
        )
      );

      toast({
        title:
          nextStatus === "active"
            ? "Automation activated"
            : "Automation paused",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
      setMenuId(null);
    }
  }

  async function deleteAutomation(automation: Automation) {
    const confirmed = window.confirm(
      `Delete "${automation.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/automations/${automation.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete automation");
      }

      setAutomations((current) =>
        current.filter((item) => item.id !== automation.id)
      );

      toast({
        title: "Automation deleted",
        variant: "info",
      });
    } catch (error: any) {
      toast({
        title: "Could not delete automation",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
      setMenuId(null);
    }
  }

  async function duplicateAutomation(automation: Automation) {
    setSaving(true);

    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${automation.name} Copy`,
          description: automation.description,
          type: automation.type,
          status: "draft",
          trigger_type: automation.trigger_type,
          trigger_config: automation.trigger_config,
          steps: automation.steps,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not duplicate automation");
      }

      setAutomations((current) => [data.automation, ...current]);

      toast({
        title: "Automation duplicated",
        description: "The copy was saved as a draft.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Could not duplicate automation",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
      setMenuId(null);
    }
  }

  async function runAutomation(automation: Automation) {
    if (automation.status !== "active") {
      toast({
        title: "Automation is not active",
        description: "Activate it before running it.",
        variant: "error",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/automations/${automation.id}/run`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not run automation");
      }

      const now = new Date().toISOString();

      setAutomations((current) =>
        current.map((item) =>
          item.id === automation.id
            ? {
                ...item,
                last_run_at: now,
              }
            : item
        )
      );

      toast({
        title: "Automation run started",
        description: "Workflow executed successfully.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Could not run automation",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function createAutomation(payload: Partial<Automation>) {
    setSaving(true);

    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create automation");
      }

      setAutomations((current) => [data.automation, ...current]);
      setShowCreate(false);

      toast({
        title: "Automation created",
        description: "Your new workflow is ready.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Could not create automation",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function updateAutomation(id: string, payload: Partial<Automation>) {
    setSaving(true);

    try {
      const response = await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update automation");
      }

      setAutomations((current) =>
        current.map((item) => (item.id === id ? data.automation : item))
      );

      setEditing(null);

      toast({
        title: "Automation updated",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Could not update automation",
        description: error.message,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full bg-[#121212] text-[#f5f7fb]">
      <div className="mx-auto max-w-[1450px] px-4 py-5 md:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#287cff]/30 bg-[#287cff]/10 text-[#4d91ff]">
                <Zap className="h-4 w-4" />
              </div>

              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5e9cff]">
                Marketing Automation
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-[36px]">
              Automations
            </h1>

            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#8f9bad]">
              Save time, nurture leads, and scale your marketing with intelligent workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#287cff] px-4 text-[13px] font-semibold text-white transition hover:bg-[#3c89ff] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Automation
            </button>
          </div>
        </div>

        {/* METRICS */}
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            icon={Zap}
            label="Total Automations"
            value={formatNumber(totals.total)}
            change="+33%"
            positive
          />

          <MetricCard
            icon={Play}
            label="Active"
            value={formatNumber(totals.active)}
            change="+50%"
            positive
          />

          <MetricCard
            icon={Pause}
            label="Paused"
            value={formatNumber(totals.paused)}
            change="-20%"
            positive={false}
          />

          <MetricCard
            icon={Users}
            label="Contacts in Workflows"
            value={formatNumber(totals.contacts)}
            change="+68%"
            positive
          />
        </div>

        {/* AI BUILDER */}
        <div className="mb-6 overflow-hidden rounded-xl border border-[#287cff]/25 bg-[#151a22]">
          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#287cff]/30 bg-[#287cff]/10 text-[#4d91ff]">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[14px] font-semibold">
                  Let AI build your next workflow
                </p>

                <p className="mt-1 max-w-xl text-[12px] leading-5 text-[#8f9bad]">
                  Describe your goal and KoraSpace can turn it into a reusable marketing automation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#287cff]/40 bg-[#287cff]/10 px-4 text-[12px] font-semibold text-[#67a1ff] transition hover:bg-[#287cff]/20 cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              Generate with AI
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mb-4 border-b border-[#222a35]">
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              ["all", "All Workflows"],
              ["active", "Active"],
              ["paused", "Paused"],
              ["draft", "Drafts"],
            ].map(([value, label]) => {
              const selected = activeTab === value;

              return (
                <button
                  key={value}
                  onClick={() => {
                    setActiveTab(value as typeof activeTab);
                    resetPage();
                  }}
                  className={[
                    "relative whitespace-nowrap px-4 py-3 text-[12px] font-medium transition cursor-pointer",
                    selected ? "text-[#66a1ff]" : "text-[#8390a2] hover:text-white",
                  ].join(" ")}
                >
                  {label}

                  {selected && (
                    <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#287cff]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#607086]" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder="Search automations..."
              className="h-10 w-full rounded-lg border border-[#263140] bg-[#151a21] pl-10 pr-4 text-[12px] text-white outline-none placeholder:text-[#617087] focus:border-[#287cff]"
            />
          </div>

          <SelectButton
            icon={Filter}
            label={
              typeFilter === "all" ? "All Types" : TYPE_META[typeFilter]?.label || "All Types"
            }
            options={[
              ["all", "All Types"] as [string, string],
              ...Object.entries(TYPE_META).map(
                ([key, value]) => [key, value.label] as [string, string]
              ),
            ]}
            onChange={(value) => {
              setTypeFilter(value as typeof typeFilter);
              resetPage();
            }}
          />

          <SelectButton
            icon={Clock3}
            label={
              sort === "recent"
                ? "Recently Updated"
                : sort === "contacts"
                ? "Most Contacts"
                : "Best Conversion"
            }
            options={[
              ["recent", "Recently Updated"],
              ["contacts", "Most Contacts"],
              ["conversion", "Best Conversion"],
            ]}
            onChange={(value) => {
              setSort(value as typeof sort);
              resetPage();
            }}
          />
        </div>

        {/* AUTOMATION LIST */}
        <div className="space-y-2.5">
          {visible.length === 0 ? (
            <EmptyState search={search} onCreate={() => setShowCreate(true)} />
          ) : (
            visible.map((automation) => (
              <AutomationRow
                key={automation.id}
                automation={automation}
                menuOpen={menuId === automation.id}
                onMenu={() =>
                  setMenuId(menuId === automation.id ? null : automation.id)
                }
                onToggle={() => toggleAutomation(automation)}
                onEdit={() => setEditing(automation)}
                onDuplicate={() => duplicateAutomation(automation)}
                onDelete={() => deleteAutomation(automation)}
                onRun={() => runAutomation(automation)}
              />
            ))
          )}
        </div>

        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div className="mt-5 flex items-center justify-between border-t border-[#202832] pt-4">
            <p className="text-[11px] text-[#667386]">
              Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–
              {Math.min(page * pageSize, filtered.length)} of{" "}
              {formatNumber(filtered.length)} workflows
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#263140] text-[#8390a2] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#181e26] cursor-pointer"
              >
                ‹
              </button>

              {Array.from(
                { length: Math.min(pageCount, 5) },
                (_, index) => index + 1
              ).map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={[
                    "h-8 min-w-8 rounded-md px-2 text-[11px] cursor-pointer",
                    number === page
                      ? "bg-[#287cff] font-semibold text-white"
                      : "border border-[#263140] text-[#8390a2] hover:bg-[#181e26]",
                  ].join(" ")}
                >
                  {number}
                </button>
              ))}

              <button
                disabled={page === pageCount}
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#263140] text-[#8390a2] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#181e26] cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {/* FOOTER INSIGHT */}
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <InsightCard
            icon={Zap}
            title="Workflow health"
            text="Your active automations are running normally."
            value={`${totals.active}/${Math.max(totals.total, 1)}`}
          />

          <InsightCard
            icon={Users}
            title="Audience coverage"
            text="Contacts currently enrolled in automated workflows."
            value={formatNumber(totals.contacts)}
          />

          <InsightCard
            icon={Activity}
            title="Revenue influenced"
            text="Attributed revenue from automation activity."
            value="$4,832"
          />
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <AutomationModal
          title="Create Automation"
          saving={saving}
          onClose={() => setShowCreate(false)}
          onSubmit={createAutomation}
        />
      )}

      {/* EDIT MODAL */}
      {editing && (
        <AutomationModal
          title="Edit Automation"
          automation={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={(payload) => updateAutomation(editing.id, payload)}
        />
      )}
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: any) {
  return (
    <div className="rounded-xl border border-[#25303d] bg-[#151a21] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#287cff]/25 bg-[#287cff]/10 text-[#5b9aff]">
          <Icon className="h-4 w-4" />
        </div>

        <span
          className={[
            "text-[10px] font-semibold",
            positive ? "text-[#20d7a0]" : "text-[#ff3d9b]",
          ].join(" ")}
        >
          {positive ? "↑" : "↓"} {change}
        </span>
      </div>

      <p className="text-[11px] text-[#7e8b9d]">{label}</p>

      <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">{value}</p>
    </div>
  );
}

/* =========================================================
   AUTOMATION ROW
========================================================= */

function AutomationRow({
  automation,
  menuOpen,
  onMenu,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onRun,
}: {
  automation: Automation;
  menuOpen: boolean;
  onMenu: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRun: () => void;
}) {
  const meta = TYPE_META[automation.type] || {
    label: "Custom Workflow",
    icon: Settings2,
  };

  const Icon = meta.icon;
  const active = automation.status === "active";
  const paused = automation.status === "paused";

  return (
    <div className="relative rounded-xl border border-[#263342] bg-[#151a21] transition hover:border-[#344456]">
      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:px-5">
        {/* ICON */}
        <div className="flex items-start gap-3 lg:w-[43%]">
          <div
            className={[
              "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              active
                ? "border-[#287cff]/40 bg-[#287cff]/10 text-[#5d9dff]"
                : paused
                ? "border-[#8b6a22]/40 bg-[#8b6a22]/10 text-[#dcae49]"
                : "border-[#35404e] bg-[#1b212a] text-[#7f8b9d]",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[13px] font-semibold text-[#f4f7fb]">
                {automation.name}
              </h3>

              <StatusBadge status={automation.status} />
            </div>

            <p className="mt-1 line-clamp-1 text-[11px] text-[#7d8b9e]">
              {automation.description || "No description provided."}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Tag>{meta.label}</Tag>
              <Tag>{automation.trigger_type.replace(/_/g, " ")}</Tag>
              <Tag>{automation.steps?.length || 0} steps</Tag>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 lg:flex-1 lg:grid-cols-3">
          <MiniStat
            label="Contacts"
            value={formatNumber(automation.contacts_count)}
          />

          <MiniStat
            label="Conversion"
            value={`${Number(automation.conversion_rate || 0).toFixed(1)}%`}
          />

          <MiniStat label="Avg. time" value={automation.avg_time || "—"} />
        </div>

        {/* LAST RUN */}
        <div className="hidden min-w-[115px] lg:block">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#586679]">
            Last run
          </p>

          <p className="mt-1 text-[11px] text-[#9aa6b6]">
            {formatDate(automation.last_run_at)}
          </p>
        </div>

        {/* TOGGLE */}
        <button
          onClick={onToggle}
          aria-label={active ? "Pause automation" : "Activate automation"}
          className={[
            "relative h-5 w-9 shrink-0 rounded-full border transition cursor-pointer",
            active ? "border-[#287cff] bg-[#287cff]" : "border-[#3a4655] bg-[#252c36]",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition",
              active ? "left-[17px]" : "left-[2px]",
            ].join(" ")}
          />
        </button>

        {/* MENU */}
        <div className="relative shrink-0">
          <button
            onClick={onMenu}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#758296] hover:bg-[#202731] hover:text-white cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 w-48 rounded-lg border border-[#2b3543] bg-[#181e26] p-1.5 shadow-2xl">
              {active && (
                <MenuItem icon={Play} label="Run now" onClick={onRun} />
              )}

              <MenuItem
                icon={Edit3}
                label="Edit automation"
                onClick={onEdit}
              />

              <MenuItem
                icon={Copy}
                label="Duplicate"
                onClick={onDuplicate}
              />

              <div className="my-1 border-t border-[#252d38]" />

              <MenuItem
                icon={Trash2}
                label="Delete"
                danger
                onClick={onDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({ status }: { status: AutomationStatus }) {
  const config = {
    active: {
      label: "Active",
      className: "border-[#13bd91]/25 bg-[#13bd91]/10 text-[#26d7a7]",
    },
    paused: {
      label: "Paused",
      className: "border-[#b48831]/25 bg-[#b48831]/10 text-[#d9af50]",
    },
    draft: {
      label: "Draft",
      className: "border-[#536174]/30 bg-[#536174]/10 text-[#98a4b5]",
    },
  }[status] || {
    label: "Draft",
    className: "border-[#536174]/30 bg-[#536174]/10 text-[#98a4b5]",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-[#293544] bg-[#19212b] px-2 py-0.5 text-[9px] capitalize text-[#8390a2]">
      {children}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.08em] text-[#536174]">
        {label}
      </p>

      <p className="mt-1 text-[12px] font-medium text-[#d7dde7]">{value}</p>
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectButton({
  icon: Icon,
  label,
  options,
  onChange,
}: {
  icon: any;
  label: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 min-w-[155px] items-center justify-between gap-3 rounded-lg border border-[#263140] bg-[#151a21] px-3 text-[11px] text-[#a6b0bf] hover:border-[#354457] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#6d7c90]" />
          {label}
        </span>

        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-52 rounded-lg border border-[#2b3543] bg-[#181e26] p-1.5 shadow-2xl">
          {options.map(([value, text]) => (
            <button
              key={value}
              onClick={() => {
                onChange(value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[11px] text-[#a8b2c1] hover:bg-[#222a34] hover:text-white cursor-pointer"
            >
              {text}

              {label === text && (
                <Check className="h-3.5 w-3.5 text-[#4d91ff]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MENU ITEM
========================================================= */

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] transition cursor-pointer",
        danger
          ? "text-[#ff5d9f] hover:bg-[#3a202d]"
          : "text-[#a8b2c1] hover:bg-[#222a34] hover:text-white",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  search,
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#2b3644] bg-[#151a21] px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#287cff]/30 bg-[#287cff]/10 text-[#5c9cff]">
        <Zap className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-[15px] font-semibold">
        {search ? "No workflows found" : "Create your first automation"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-[12px] leading-5 text-[#7d8a9c]">
        {search
          ? "Try another search term or remove one of your filters."
          : "Automate repetitive marketing tasks, nurture leads, and keep your campaigns moving automatically."}
      </p>

      {!search && (
        <button
          onClick={onCreate}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-[#287cff] px-4 text-[12px] font-semibold text-white hover:bg-[#3c89ff] cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Automation
        </button>
      )}
    </div>
  );
}

/* =========================================================
   INSIGHT
========================================================= */

function InsightCard({
  icon: Icon,
  title,
  text,
  value,
}: {
  icon: any;
  title: string;
  text: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#263140] bg-[#151a21] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#287cff]/20 bg-[#287cff]/10 text-[#5b9aff]">
            <Icon className="h-3.5 w-3.5" />
          </div>

          <span className="text-[12px] font-semibold">{title}</span>
        </div>

        <span className="text-[13px] font-semibold text-[#6ba4ff]">{value}</span>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-[#748195]">{text}</p>
    </div>
  );
}

/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

function AutomationModal({
  title,
  automation,
  saving,
  onClose,
  onSubmit,
}: {
  title: string;
  automation?: Automation;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<Automation>) => void;
}) {
  const [name, setName] = useState(automation?.name ?? "");
  const [description, setDescription] = useState(automation?.description ?? "");
  const [type, setType] = useState<AutomationType>(
    automation?.type ?? "lead_nurturing"
  );
  const [trigger, setTrigger] = useState(
    automation?.trigger_type ?? "lead_created"
  );
  const [status, setStatus] = useState<AutomationStatus>(
    automation?.status ?? "draft"
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      type,
      trigger_type: trigger,
      status,
      trigger_config: {},
      steps: automation?.steps ?? [
        {
          id: crypto.randomUUID(),
          type: "wait",
          label: "Wait 1 day",
          config: {
            amount: 1,
            unit: "day",
          },
        },
      ],
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#2b3746] bg-[#151a21] shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#263140] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-white">{title}</h2>

            <p className="mt-1 text-[11px] text-[#718096]">
              Configure the basic workflow settings.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#758296] hover:bg-[#222a34] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          <Field label="Automation name">
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Lead Nurturing Sequence"
              className="w-full h-10 rounded-lg border border-[#293544] bg-[#11161d] px-3 text-xs text-[#f5f7fb] outline-none placeholder:text-[#5e6c7e] focus:border-[#287cff] focus:bg-[#141a21]"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What should this workflow accomplish?"
              rows={3}
              className="w-full rounded-lg border border-[#293544] bg-[#11161d] p-3 text-xs text-[#f5f7fb] outline-none placeholder:text-[#5e6c7e] focus:border-[#287cff] focus:bg-[#141a21] resize-none"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Workflow type">
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as AutomationType)
                }
                className="w-full h-10 rounded-lg border border-[#293544] bg-[#11161d] px-3 text-xs text-[#f5f7fb] outline-none focus:border-[#287cff] focus:bg-[#141a21]"
              >
                {Object.entries(TYPE_META).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Trigger">
              <select
                value={trigger}
                onChange={(event) => setTrigger(event.target.value)}
                className="w-full h-10 rounded-lg border border-[#293544] bg-[#11161d] px-3 text-xs text-[#f5f7fb] outline-none focus:border-[#287cff] focus:bg-[#141a21]"
              >
                <option value="lead_created">New lead</option>
                <option value="lead_stage_changed">Lead stage changes</option>
                <option value="form_submitted">Form submitted</option>
                <option value="schedule">Schedule</option>
                <option value="campaign_started">Campaign starts</option>
                <option value="event_registered">Event registration</option>
                <option value="cart_abandoned">Cart abandoned</option>
                <option value="webhook">Webhook</option>
                <option value="manual">Manual</option>
              </select>
            </Field>
          </div>

          <Field label="Initial status">
            <div className="grid grid-cols-3 gap-2">
              {(["draft", "active", "paused"] as AutomationStatus[]).map(
                (value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setStatus(value)}
                    className={[
                      "h-10 rounded-lg border text-[11px] font-medium capitalize transition cursor-pointer",
                      status === value
                        ? "border-[#287cff] bg-[#287cff]/10 text-[#65a0ff]"
                        : "border-[#293443] bg-[#181e26] text-[#78869a] hover:text-white",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                )
              )}
            </div>
          </Field>

          <div className="rounded-lg border border-[#293544] bg-[#11161d] p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#5c9cff]">
                <Webhook className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-200">
                  Workflow engine
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#6f7d90]">
                  After creation, you can extend this automation with email, social, lead, delay, webhook and notification steps.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#263140] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#293443] px-4 text-[12px] font-medium text-[#8895a7] hover:bg-[#202731] hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#287cff] px-4 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#3c89ff] cursor-pointer"
            >
              {saving && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}

              {automation ? "Save Changes" : "Create Automation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium text-[#8b98aa]">
        {label}
      </span>

      {children}
    </label>
  );
}
