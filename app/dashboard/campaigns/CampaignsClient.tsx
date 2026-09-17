"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Filter,
  Flame,
  Loader2,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { PageHeader, GlassCard, StatTile, Pill } from "@/components/dashboard/ui";
import { platformLabel } from "@/lib/dashboard/helpers";

interface CampaignStats {
  totalLeads: number;
  sentCount: number;
  repliedCount: number;
  convertedCount: number;
  replyRate: number;
  conversionRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  audience_filter?: Record<string, any>;
  message_sequence?: any[];
  created_at: string;
  updated_at?: string;
  stats: CampaignStats;
}

interface Overview {
  totalCampaigns: number;
  activeCampaigns: number;
  pausedCampaigns: number;
  draftCampaigns: number;
  totalLeads: number;
  totalSent: number;
  totalReplies: number;
  totalConversions: number;
  replyRate: number;
  conversionRate: number;
}

interface Props {
  initialCampaigns: Campaign[];
  overview: Overview;
  userName: string;
}

type Tab = "all" | "active" | "paused" | "drafts";

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  paused: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  draft: "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)]",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-300",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize tracking-wide ${
        STATUS_STYLES[status] ||
        "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
      }`}
    >
      {status}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-[var(--panel-fill)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] border border-[var(--stroke)]">
      {platformLabel(platform)}
    </span>
  );
}

export function CampaignsClient({
  initialCampaigns,
  overview: initialOverview,
  userName,
}: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "leads" | "reply">("recent");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    platform: "instagram",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Recompute Overview dynamically
  const overview = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
    const pausedCampaigns = campaigns.filter((c) => c.status === "paused").length;
    const draftCampaigns = campaigns.filter((c) => c.status === "draft").length;

    const totalLeads = campaigns.reduce((sum, c) => sum + c.stats.totalLeads, 0);
    const totalSent = campaigns.reduce((sum, c) => sum + c.stats.sentCount, 0);
    const totalReplies = campaigns.reduce((sum, c) => sum + c.stats.repliedCount, 0);
    const totalConversions = campaigns.reduce(
      (sum, c) => sum + c.stats.convertedCount,
      0
    );

    const replyRate = totalSent > 0 ? (totalReplies / totalSent) * 100 : 0;
    const conversionRate =
      totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      pausedCampaigns,
      draftCampaigns,
      totalLeads,
      totalSent,
      totalReplies,
      totalConversions,
      replyRate,
      conversionRate,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (activeTab === "drafts") {
      result = result.filter((campaign) => campaign.status === "draft");
    } else if (activeTab !== "all") {
      result = result.filter((campaign) => campaign.status === activeTab);
    }

    if (platformFilter !== "all") {
      result = result.filter(
        (campaign) =>
          campaign.platform.toLowerCase() === platformFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(query) ||
          campaign.platform.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "leads") {
        return b.stats.totalLeads - a.stats.totalLeads;
      }
      if (sortBy === "reply") {
        return b.stats.replyRate - a.stats.replyRate;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return result;
  }, [campaigns, activeTab, platformFilter, search, sortBy]);

  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => b.stats.replyRate - a.stats.replyRate)
      .slice(0, 5);
  }, [campaigns]);

  async function changeCampaignStatus(campaign: Campaign) {
    const nextStatus = campaign.status === "active" ? "paused" : "active";

    setLoadingId(campaign.id);
    setError(null);

    try {
      const response = await fetch(`/api/marketer/campaigns/${campaign.id}`, {
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
        throw new Error(data.error || "Unable to update campaign status");
      }

      setCampaigns((current) =>
        current.map((item) =>
          item.id === campaign.id
            ? {
                ...item,
                status: data.campaign.status,
                updated_at: data.campaign.updated_at,
              }
            : item
        )
      );
      showToast(`Campaign ${campaign.name} set to ${nextStatus}`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong updating campaign");
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteCampaign(campaign: Campaign) {
    const confirmed = window.confirm(
      `Delete "${campaign.name}" and all associated leads? This cannot be undone.`
    );

    if (!confirmed) return;

    setLoadingId(campaign.id);
    setError(null);

    try {
      const response = await fetch(`/api/marketer/campaigns/${campaign.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete campaign");
      }

      setCampaigns((current) =>
        current.filter((item) => item.id !== campaign.id)
      );

      if (selectedCampaign?.id === campaign.id) {
        setSelectedCampaign(null);
      }
      showToast(`Deleted "${campaign.name}"`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong deleting campaign");
    } finally {
      setLoadingId(null);
    }
  }

  async function createCampaign() {
    if (!newCampaign.name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/marketer/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCampaign.name.trim(),
          platform: newCampaign.platform,
          status: "draft",
          audience_filter: {},
          message_sequence: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create campaign");
      }

      const created: Campaign = {
        ...data.campaign,
        stats: {
          totalLeads: 0,
          sentCount: 0,
          repliedCount: 0,
          convertedCount: 0,
          replyRate: 0,
          conversionRate: 0,
        },
      };

      setCampaigns((current) => [created, ...current]);
      setShowCreate(false);
      setNewCampaign({
        name: "",
        platform: "instagram",
      });
      showToast(`Created campaign "${created.name}"`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong creating campaign");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-full flex-col min-h-screen pb-16 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm bg-emerald-950/80 border-emerald-500/30 text-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        eyebrow="Marketing Execution"
        title="Campaigns"
        sub="Plan, launch, monitor and optimize your outbound marketing campaigns from one command center."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </button>
          </div>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="rounded-lg p-1 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total Campaigns"
          value={formatNumber(overview.totalCampaigns)}
          icon={Megaphone}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              +{overview.activeCampaigns} active running
            </span>
          }
          tone="neutral"
        />
        <StatTile
          label="Active Campaigns"
          value={formatNumber(overview.activeCampaigns)}
          icon={Activity}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {overview.pausedCampaigns} paused • {overview.draftCampaigns} drafts
            </span>
          }
          tone="green"
        />
        <StatTile
          label="Messages Sent"
          value={formatNumber(overview.totalSent)}
          icon={Send}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {overview.replyRate.toFixed(1)}% reply rate
            </span>
          }
          tone="blue"
        />
        <StatTile
          label="Conversions"
          value={formatNumber(overview.totalConversions)}
          icon={TrendingUp}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {overview.conversionRate.toFixed(1)}% conversion rate
            </span>
          }
          tone="success"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--stroke)]">
        <div className="flex items-center gap-6 overflow-x-auto pb-1">
          <CampaignTab
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label="All Campaigns"
            count={overview.totalCampaigns}
          />
          <CampaignTab
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            label="Active"
            count={overview.activeCampaigns}
          />
          <CampaignTab
            active={activeTab === "paused"}
            onClick={() => setActiveTab("paused")}
            label="Paused"
            count={overview.pausedCampaigns}
          />
          <CampaignTab
            active={activeTab === "drafts"}
            onClick={() => setActiveTab("drafts")}
            label="Drafts"
            count={overview.draftCampaigns}
          />
        </div>
      </div>

      {/* Analytics Row: Performance Chart + Top Campaigns */}
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <GlassCard className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--fg)]">
                Campaign Performance
              </h2>
              <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                Lead distribution and velocity across your campaigns
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-1.5 text-xs text-[var(--fg-3)]">
              All Active Data
            </div>
          </div>

          <PerformanceChart campaigns={campaigns} />

          <div className="mt-5 grid grid-cols-3 border-t border-[var(--stroke)] pt-4">
            <MiniMetric
              label="Total Leads"
              value={formatNumber(overview.totalLeads)}
              icon={Users}
            />
            <MiniMetric
              label="Total Replies"
              value={formatNumber(overview.totalReplies)}
              icon={MessageCircle}
            />
            <MiniMetric
              label="Avg Reply Rate"
              value={`${overview.replyRate.toFixed(1)}%`}
              icon={TrendingUp}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader icon={Flame} title="Top Campaigns" />

          <div className="mt-4 divide-y divide-[var(--stroke)]">
            {topCampaigns.length === 0 ? (
              <EmptySmall />
            ) : (
              topCampaigns.map((campaign, index) => (
                <button
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[var(--panel-fill-2)] rounded-xl px-2"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--fg)]">
                      {campaign.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <PlatformBadge platform={campaign.platform} />
                      <span className="text-[10px] text-[var(--fg-4)]">
                        {formatNumber(campaign.stats.totalLeads)} leads
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">
                      {campaign.stats.replyRate.toFixed(1)}%
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">reply rate</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {/* Campaign Table Section */}
      <GlassCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-[var(--stroke)] p-5 lg:flex-row lg:items-center lg:justify-between bg-[var(--panel-fill)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--fg)]">
              Campaign Overview
            </h2>
            <p className="mt-0.5 text-xs text-[var(--fg-4)]">
              Manage, monitor, and iterate every outbound sequence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fg-4)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="h-9 w-56 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] pl-9 pr-3 text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-blue-500 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all ${
                showFilters
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                  : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:text-[var(--fg)] transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--stroke)] bg-[var(--panel-fill-2)]/60 px-5 py-3">
            <span className="mr-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
              Platform
            </span>

            {[
              ["all", "All"],
              ["instagram", "Instagram"],
              ["linkedin", "LinkedIn"],
              ["x", "X"],
              ["tiktok", "TikTok"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPlatformFilter(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  platformFilter === value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)] border border-[var(--stroke)]"
                }`}
              >
                {label}
              </button>
            ))}

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "recent" | "leads" | "reply")
                }
                className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-xs font-medium text-[var(--fg-2)] outline-none focus:border-blue-500"
              >
                <option value="recent">Recently Created</option>
                <option value="leads">Most Leads</option>
                <option value="reply">Best Reply Rate</option>
              </select>
            </div>
          </div>
        )}

        {filteredCampaigns.length === 0 ? (
          <EmptyCampaigns onCreate={() => setShowCreate(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[var(--stroke)] bg-[var(--panel-fill-2)]/40 text-left">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Campaign
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Leads
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Sent
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Replies
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Performance
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCampaigns.map((campaign) => {
                  const busy = loadingId === campaign.id;

                  return (
                    <tr
                      key={campaign.id}
                      className="group border-b border-[var(--stroke)]/60 transition hover:bg-[var(--panel-fill-2)]/50"
                    >
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <Megaphone className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-[var(--fg)] group-hover:text-blue-400 transition-colors">
                              {campaign.name}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <PlatformBadge platform={campaign.platform} />
                              <span className="text-[10px] text-[var(--fg-4)]">
                                Created {formatDate(campaign.created_at)}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-[var(--fg)]">
                          {formatNumber(campaign.stats.totalLeads)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs text-[var(--fg-2)]">
                          {formatNumber(campaign.stats.sentCount)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-xs font-semibold text-[var(--fg)]">
                            {formatNumber(campaign.stats.repliedCount)}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium text-emerald-400">
                            {campaign.stats.replyRate.toFixed(1)}%
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="w-32">
                          <div className="mb-1.5 flex justify-between">
                            <span className="text-[10px] text-[var(--fg-4)]">
                              Conversion
                            </span>
                            <span className="text-[10px] font-medium text-[var(--fg-2)]">
                              {campaign.stats.conversionRate.toFixed(1)}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel-fill-2)] border border-[var(--stroke)]">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${Math.min(
                                  campaign.stats.conversionRate,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          {campaign.status !== "draft" && (
                            <button
                              disabled={busy}
                              onClick={() => changeCampaignStatus(campaign)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-40 transition-all"
                              title={
                                campaign.status === "active" ? "Pause" : "Resume"
                              }
                            >
                              {busy ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : campaign.status === "active" ? (
                                <Pause className="h-3.5 w-3.5" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCampaign(campaign)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--panel-fill-2)] transition-all"
                            title="View details"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => deleteCampaign(campaign)}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-4)] hover:border-red-500/30 hover:text-red-400 disabled:opacity-40 transition-all"
                            title="Delete campaign"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Bottom Intelligence Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader icon={Activity} title="Recent Activity" />

          <div className="mt-4 space-y-3">
            <ActivityItem
              icon={Send}
              title="Campaign performance synced"
              description={`${formatNumber(
                overview.totalSent
              )} messages sent across active campaigns.`}
              time="Today"
            />
            <ActivityItem
              icon={MessageCircle}
              title="Replies received"
              description={`${formatNumber(
                overview.totalReplies
              )} prospects have engaged in discussion.`}
              time="Today"
            />
            <ActivityItem
              icon={Target}
              title="Conversion milestones"
              description={`${formatNumber(
                overview.totalConversions
              )} leads reached converted status.`}
              time="This week"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-blue-500/20 bg-blue-950/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                AI Campaign Assistant
              </h3>
              <p className="mt-0.5 text-xs text-[var(--fg-3)]">
                Intelligent optimization signals based on your current reply and conversion rates.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <AIRecommendation
              icon={TrendingUp}
              text={
                overview.replyRate < 10
                  ? "Test a shorter initial hook to increase your 30-day reply rate."
                  : "Your reply rate is strong (10%+). Scale outreach limits on winning campaigns."
              }
              action="Review"
            />
            <AIRecommendation
              icon={Users}
              text="Segment leads with intent scores >= 70 into an accelerated follow-up cadence."
              action="Segment"
            />
            <AIRecommendation
              icon={Zap}
              text="Duplicate top-converting sequence into a new platform experiment."
              action="Duplicate"
            />
          </div>
        </GlassCard>
      </div>

      {/* ========================================================= */}
      {/* CREATE CAMPAIGN MODAL */}
      {/* ========================================================= */}
      {showCreate && (
        <Modal title="Create Campaign" onClose={() => setShowCreate(false)}>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--fg-2)]">
                Campaign Name *
              </label>
              <input
                autoFocus
                value={newCampaign.name}
                onChange={(e) =>
                  setNewCampaign((curr) => ({ ...curr, name: e.target.value }))
                }
                placeholder="e.g. Q4 Founder & Creator Outreach"
                className="h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)] focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--fg-2)]">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["instagram", "Instagram"],
                  ["linkedin", "LinkedIn"],
                  ["x", "X / Twitter"],
                  ["tiktok", "TikTok"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setNewCampaign((curr) => ({ ...curr, platform: value }))
                    }
                    className={`rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                      newCampaign.platform === value
                        ? "border-blue-500 bg-blue-500/10 text-blue-300 font-semibold"
                        : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:text-[var(--fg)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--stroke)]">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2 text-xs font-medium text-[var(--fg-3)] hover:text-[var(--fg)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createCampaign}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-5 py-2 text-xs font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create Campaign
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* CAMPAIGN DETAIL MODAL */}
      {/* ========================================================= */}
      {selectedCampaign && (
        <Modal
          title={selectedCampaign.name}
          onClose={() => setSelectedCampaign(null)}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <PlatformBadge platform={selectedCampaign.platform} />
              <StatusBadge status={selectedCampaign.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailStat
                label="Targeted Leads"
                value={formatNumber(selectedCampaign.stats.totalLeads)}
              />
              <DetailStat
                label="Messages Sent"
                value={formatNumber(selectedCampaign.stats.sentCount)}
              />
              <DetailStat
                label="Replies"
                value={formatNumber(selectedCampaign.stats.repliedCount)}
              />
              <DetailStat
                label="Reply Rate"
                value={`${selectedCampaign.stats.replyRate.toFixed(1)}%`}
              />
            </div>

            <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--fg)]">
                  Campaign Configuration
                </p>
                <Target className="h-3.5 w-3.5 text-blue-400" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--fg-4)]">Audience rules</span>
                  <span className="text-[var(--fg-2)] font-medium">
                    {Object.keys(selectedCampaign.audience_filter || {}).length || 0} filters
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fg-4)]">Message sequence steps</span>
                  <span className="text-[var(--fg-2)] font-medium">
                    {Array.isArray(selectedCampaign.message_sequence)
                      ? selectedCampaign.message_sequence.length
                      : 0}{" "}
                    steps
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fg-4)]">Created At</span>
                  <span className="text-[var(--fg-2)] font-medium">
                    {new Date(selectedCampaign.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                changeCampaignStatus(selectedCampaign);
                setSelectedCampaign(null);
              }}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
            >
              {selectedCampaign.status === "active" ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Activate Campaign
                </>
              )}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function CampaignTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 pb-3 text-xs font-medium transition-all ${
        active ? "text-blue-400 font-semibold" : "text-[var(--fg-4)] hover:text-[var(--fg)]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
          active
            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            : "bg-[var(--panel-fill-2)] text-[var(--fg-4)] border border-[var(--stroke)]"
        }`}
      >
        {count}
      </span>

      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full bg-blue-500" />
      )}
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: any;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-blue-400" />
      <h2 className="text-sm font-semibold text-[var(--fg)]">{title}</h2>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-3.5 w-3.5 text-blue-400" />
      <div>
        <p className="text-[10px] text-[var(--fg-4)] font-medium">{label}</p>
        <p className="mt-0.5 text-xs font-bold text-[var(--fg)]">{value}</p>
      </div>
    </div>
  );
}

function PerformanceChart({ campaigns }: { campaigns: Campaign[] }) {
  const max = Math.max(...campaigns.map((c) => c.stats.totalLeads), 1);

  if (!campaigns.length) {
    return (
      <div className="flex h-[190px] items-center justify-center rounded-2xl border-2 border-dashed border-[var(--stroke)] text-xs text-[var(--fg-4)] bg-[var(--panel-fill-2)]/30">
        Create a campaign to begin monitoring performance velocity.
      </div>
    );
  }

  const points = campaigns
    .slice(0, 12)
    .map((campaign, index) => {
      const x =
        (index / Math.max(campaigns.slice(0, 12).length - 1, 1)) * 100;
      const y = 100 - (campaign.stats.totalLeads / max) * 82;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-[190px] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)]/40 p-4">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
        {Array.from({ length: 24 }).map((_, index) => (
          <div key={index} className="border-r border-t border-[var(--stroke)]/30" />
        ))}
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-5 h-[calc(100%-40px)] w-[calc(100%-40px)] overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        {campaigns.slice(0, 12).map((campaign, index) => {
          const x =
            (index / Math.max(campaigns.slice(0, 12).length - 1, 1)) * 100;
          const y = 100 - (campaign.stats.totalLeads / max) * 82;

          return (
            <circle
              key={campaign.id}
              cx={x}
              cy={y}
              r="2.5"
              fill="#3b82f6"
            />
          );
        })}
      </svg>

      <div className="absolute bottom-2 left-3 text-[9px] text-[var(--fg-4)] font-medium">
        Campaigns
      </div>
      <div className="absolute right-3 top-2 text-[9px] text-[var(--fg-4)] font-medium">
        Leads Max: {max}
      </div>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
}: {
  icon: any;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)]/40 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold text-[var(--fg)]">{title}</p>
          <span className="shrink-0 text-[10px] text-[var(--fg-4)]">{time}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--fg-3)]">{description}</p>
      </div>
    </div>
  );
}

function AIRecommendation({
  icon: Icon,
  text,
  action,
}: {
  icon: any;
  text: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)]/50 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p className="flex-1 text-[11px] text-[var(--fg-2)] leading-tight">{text}</p>

      <button className="shrink-0 rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
        {action}
      </button>
    </div>
  );
}

function EmptySmall() {
  return (
    <div className="py-8 text-center text-xs text-[var(--fg-4)]">
      No campaign data available yet.
    </div>
  );
}

function EmptyCampaigns({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <Megaphone className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-bold text-[var(--fg)]">
        No campaigns found
      </h3>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-[var(--fg-3)]">
        Create your first campaign and begin orchestrating automated outbound sequences.
      </p>

      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        Create Campaign
      </button>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3.5">
      <p className="text-[10px] uppercase font-semibold text-[var(--fg-4)]">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-[var(--fg)]">{value}</p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--stroke)] px-6 py-4">
          <h2 className="text-sm font-bold text-[var(--fg)]">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--fg-4)] hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
