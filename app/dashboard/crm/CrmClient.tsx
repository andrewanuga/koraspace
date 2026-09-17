"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Send,
  Flame,
  CheckCircle2,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  MessageCircle,
  ExternalLink,
  Target,
  Sparkles,
  ChevronRight,
  X,
  Trash2,
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { PageHeader, GlassCard, StatTile, Pill } from "@/components/dashboard/ui";
import { platformLabel } from "@/lib/dashboard/helpers";

export interface Lead {
  id: string;
  campaign_id: string;
  recipient_handle: string;
  status: "pending" | "sent" | "replied" | "closed";
  lead_score: number;
  notes?: string;
  last_contacted_at: string | null;
  created_at?: string;
  campaign_name: string;
  platform: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
}

const COLUMNS: {
  id: Lead["status"];
  title: string;
  color: string;
  accent: string;
  badgeTone: "muted" | "blue" | "warning" | "success";
  description: string;
}[] = [
  {
    id: "pending",
    title: "Pending Outreach",
    color: "var(--fg-4)",
    accent: "border-[var(--stroke)]",
    badgeTone: "muted",
    description: "Leads identified and queued for initial outreach",
  },
  {
    id: "sent",
    title: "Outreach Sent",
    color: "var(--kora-blue)",
    accent: "border-blue-500/30",
    badgeTone: "blue",
    description: "Initial message or sequence dispatched",
  },
  {
    id: "replied",
    title: "Replied / Hot",
    color: "#f59e0b",
    accent: "border-amber-500/30",
    badgeTone: "warning",
    description: "Engaged in conversation & showing high intent",
  },
  {
    id: "closed",
    title: "Closed Won",
    color: "#10b981",
    accent: "border-emerald-500/30",
    badgeTone: "success",
    description: "Converted client or successful collaboration",
  },
];

export function CrmClient({
  initialLeads,
  initialCampaigns,
}: {
  initialLeads: Lead[];
  initialCampaigns: Campaign[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all"); // 'all' | 'hot' (>=70) | 'warm' (>=40)
  const [activeTabStatus, setActiveTabStatus] = useState<string>("all");

  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Lead Detail Drawer State
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState("");
  const [drawerScoreInput, setDrawerScoreInput] = useState<number>(50);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [quickMessageText, setQuickMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Add Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCampaignId, setNewCampaignId] = useState<string>(
    initialCampaigns[0]?.id || ""
  );
  const [newHandle, setNewHandle] = useState("");
  const [newStatus, setNewStatus] = useState<Lead["status"]>("pending");
  const [newScore, setNewScore] = useState<number>(60);
  const [newNotes, setNewNotes] = useState("");
  const [isSubmittingNewLead, setIsSubmittingNewLead] = useState(false);
  const [addLeadError, setAddLeadError] = useState<string | null>(null);

  // Notification / Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const pending = leads.filter((l) => l.status === "pending").length;
    const sent = leads.filter((l) => l.status === "sent").length;
    const replied = leads.filter((l) => l.status === "replied").length;
    const closed = leads.filter((l) => l.status === "closed").length;

    const contactedCount = sent + replied + closed;
    const responseRate =
      contactedCount > 0
        ? Math.round(((replied + closed) / contactedCount) * 100)
        : 0;
    const conversionRate =
      contactedCount > 0 ? Math.round((closed / contactedCount) * 100) : 0;
    const hotLeadsCount = leads.filter((l) => l.lead_score >= 70).length;

    return {
      total,
      pending,
      sent,
      replied,
      closed,
      responseRate,
      conversionRate,
      hotLeadsCount,
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      if (
        search &&
        !lead.recipient_handle.toLowerCase().includes(search) &&
        !lead.campaign_name.toLowerCase().includes(search) &&
        !(lead.notes && lead.notes.toLowerCase().includes(search))
      ) {
        return false;
      }

      // Platform
      if (
        selectedPlatform !== "all" &&
        lead.platform.toLowerCase() !== selectedPlatform.toLowerCase()
      ) {
        return false;
      }

      // Campaign
      if (
        selectedCampaign !== "all" &&
        lead.campaign_id !== selectedCampaign
      ) {
        return false;
      }

      // Score filter
      if (scoreFilter === "hot" && lead.lead_score < 70) return false;
      if (scoreFilter === "warm" && (lead.lead_score < 40 || lead.lead_score >= 70))
        return false;
      if (scoreFilter === "cold" && lead.lead_score >= 40) return false;

      // Tab status filter for mobile / collapsed view
      if (activeTabStatus !== "all" && lead.status !== activeTabStatus) {
        return false;
      }

      return true;
    });
  }, [
    leads,
    searchTerm,
    selectedPlatform,
    selectedCampaign,
    scoreFilter,
    activeTabStatus,
  ]);

  // Distinct Platforms for filter dropdown
  const availablePlatforms = useMemo(() => {
    const list = Array.from(new Set(leads.map((l) => l.platform)));
    return list.filter(Boolean);
  }, [leads]);

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Lead["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    setDraggedLeadId(null);

    if (!leadId) return;

    const leadToMove = leads.find((l) => l.id === leadId);
    if (!leadToMove || leadToMove.status === targetStatus) return;

    // Optimistic Update
    const prevLeads = [...leads];
    setLeads((curr) =>
      curr.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: targetStatus,
              last_contacted_at:
                targetStatus !== "pending"
                  ? new Date().toISOString()
                  : l.last_contacted_at,
            }
          : l
      )
    );

    if (activeLead && activeLead.id === leadId) {
      setActiveLead((curr) => (curr ? { ...curr, status: targetStatus } : null));
    }

    try {
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: targetStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update lead status on server");
      }

      const data = await res.json();
      if (data.lead) {
        setLeads((curr) =>
          curr.map((l) => (l.id === leadId ? { ...l, ...data.lead } : l))
        );
      }
      showToast("success", `Moved ${leadToMove.recipient_handle} to ${targetStatus}`);
    } catch (err: any) {
      console.error("Status update error:", err);
      setLeads(prevLeads);
      showToast("error", "Could not sync stage change. Reverted to previous stage.");
    }
  };

  // Open Lead Drawer
  const openLeadDrawer = (lead: Lead) => {
    setActiveLead(lead);
    setNotesInput(lead.notes || "");
    setDrawerScoreInput(lead.lead_score || 50);
    setIsEditingNotes(false);
    setQuickMessageText("");
  };

  // Save Lead Detail Updates (Score, Notes, Status)
  const saveLeadDetails = async (
    updates: Partial<{
      status: Lead["status"];
      lead_score: number;
      notes: string;
      recipient_handle: string;
    }>
  ) => {
    if (!activeLead) return;
    setIsSavingDetails(true);

    try {
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeLead.id, ...updates }),
      });

      if (!res.ok) {
        throw new Error("Failed to save lead updates");
      }

      const data = await res.json();
      const updatedLead = data.lead;

      setLeads((curr) =>
        curr.map((l) => (l.id === activeLead.id ? { ...l, ...updatedLead } : l))
      );
      setActiveLead(updatedLead);
      setIsEditingNotes(false);
      showToast("success", "Lead details saved successfully");
    } catch (err: any) {
      console.error("Save details error:", err);
      showToast("error", "Failed to save lead details");
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Quick Send Outreach from Drawer
  const handleSendQuickMessage = async () => {
    if (!activeLead) return;
    setIsSendingMessage(true);

    try {
      const updatedNotes = activeLead.notes
        ? `${activeLead.notes}\n[Sent DM ${new Date().toLocaleDateString()}]: ${quickMessageText || "Standard Sequence"}`
        : `[Sent DM ${new Date().toLocaleDateString()}]: ${quickMessageText || "Standard Sequence"}`;

      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeLead.id,
          status: activeLead.status === "pending" ? "sent" : activeLead.status,
          notes: updatedNotes,
          last_contacted_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to log message outreach");

      const data = await res.json();
      setLeads((curr) =>
        curr.map((l) => (l.id === activeLead.id ? { ...l, ...data.lead } : l))
      );
      setActiveLead(data.lead);
      setNotesInput(data.lead.notes || "");
      setQuickMessageText("");
      showToast("success", `Dispatched outreach to ${activeLead.recipient_handle}`);
    } catch (err) {
      showToast("error", "Failed to dispatch outreach message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/crm/leads?id=${leadId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete lead");
      }

      setLeads((curr) => curr.filter((l) => l.id !== leadId));
      if (activeLead?.id === leadId) {
        setActiveLead(null);
      }
      showToast("success", "Lead removed successfully");
    } catch (err) {
      showToast("error", "Could not delete lead");
    }
  };

  // Add New Lead
  const handleCreateNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignId) {
      setAddLeadError("Please select a target campaign");
      return;
    }
    if (!newHandle.trim()) {
      setAddLeadError("Please provide a recipient handle");
      return;
    }

    setIsSubmittingNewLead(true);
    setAddLeadError(null);

    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: newCampaignId,
          recipient_handle: newHandle.trim(),
          status: newStatus,
          lead_score: newScore,
          notes: newNotes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.lead) {
        throw new Error(data.error || "Failed to create lead");
      }

      setLeads((curr) => [data.lead, ...curr]);
      setIsAddModalOpen(false);
      setNewHandle("");
      setNewNotes("");
      setNewScore(60);
      setNewStatus("pending");
      showToast("success", `Added ${data.lead.recipient_handle} to pipeline!`);
    } catch (err: any) {
      setAddLeadError(err.message || "Failed to create lead");
    } finally {
      setIsSubmittingNewLead(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-full flex-col min-h-screen pb-16 space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm transition-all duration-300 ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
              : "bg-red-950/80 border-red-500/30 text-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-white/50 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        eyebrow="Outbound CRM & Pipeline"
        title="Lead Management"
        sub="Track prospects, manage multi-channel outreach stages, and convert warm conversations."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {campaigns.length === 0 ? (
              <a
                href="/dashboard/campaigns"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus className="h-4 w-4" />
                Create First Campaign
              </a>
            ) : (
              <button
                onClick={() => {
                  setNewCampaignId(campaigns[0]?.id || "");
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </button>
            )}
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total Prospects"
          value={stats.total.toLocaleString()}
          icon={Users}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {stats.hotLeadsCount} high intent (🔥 70%+)
            </span>
          }
          tone="neutral"
        />
        <StatTile
          label="Outreach Sent"
          value={stats.sent.toLocaleString()}
          icon={Send}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}% of pipeline
            </span>
          }
          tone="blue"
        />
        <StatTile
          label="Replied / Hot Rate"
          value={`${stats.responseRate}%`}
          icon={Flame}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {stats.replied} active discussions
            </span>
          }
          tone="warning"
        />
        <StatTile
          label="Closed Won"
          value={stats.closed.toLocaleString()}
          icon={CheckCircle2}
          footer={
            <span className="text-xs text-[var(--fg-4)] font-medium">
              {stats.conversionRate}% conversion rate
            </span>
          }
          tone="success"
        />
      </div>

      {/* Zero Campaigns Warning Banner */}
      {campaigns.length === 0 && (
        <GlassCard className="p-6 border-amber-500/30 bg-amber-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--fg)]">
                  No outreach campaigns found
                </h3>
                <p className="text-sm text-[var(--fg-3)]">
                  Leads must belong to a campaign. Create your first campaign in the Campaigns dashboard to unlock automated outreach.
                </p>
              </div>
            </div>
            <a
              href="/dashboard/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              Go to Campaigns
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </GlassCard>
      )}

      {/* Filter & Controls Bar */}
      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by handle, campaign, or notes..."
              className="h-10 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] pl-10 pr-4 text-sm text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-blue-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)] hover:text-[var(--fg)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Campaign Filter */}
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs font-medium text-[var(--fg-2)] focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Campaigns ({campaigns.length})</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs font-medium text-[var(--fg-2)] focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {platformLabel(p)}
                </option>
              ))}
            </select>

            {/* Score Filter */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs font-medium text-[var(--fg-2)] focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Intent Scores</option>
              <option value="hot">🔥 High Intent (70-100%)</option>
              <option value="warm">⚡ Warm Intent (40-69%)</option>
              <option value="cold">❄️ Cold (0-39%)</option>
            </select>

            {/* Reset Filters */}
            {(searchTerm ||
              selectedPlatform !== "all" ||
              selectedCampaign !== "all" ||
              scoreFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedPlatform("all");
                  setSelectedCampaign("all");
                  setScoreFilter("all");
                }}
                className="h-10 px-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-xs font-medium text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--panel-fill-2)] flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Responsive Status Tabs */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1 border-t border-[var(--stroke)] pt-3 hide-scrollbar">
          <button
            onClick={() => setActiveTabStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTabStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-[var(--panel-fill-2)] text-[var(--fg-3)]"
            }`}
          >
            All Columns ({leads.length})
          </button>
          {COLUMNS.map((col) => {
            const count = leads.filter((l) => l.status === col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setActiveTabStatus(col.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTabStatus === col.id
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--panel-fill-2)] text-[var(--fg-3)]"
                }`}
              >
                <span>{col.title}</span>
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.filter(
          (col) => activeTabStatus === "all" || activeTabStatus === col.id
        ).map((col) => {
          const colLeads = filteredLeads.filter((l) => l.status === col.id);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-3xl bg-[var(--panel-fill)] p-4 border transition-all duration-200 min-h-[520px] ${
                isOver
                  ? "border-blue-500 shadow-lg shadow-blue-500/10 bg-blue-950/10"
                  : "border-[var(--stroke)]"
              }`}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: col.color,
                      boxShadow: `0 0 10px ${col.color}40`,
                    }}
                  />
                  <h3 className="font-display text-sm font-bold text-[var(--fg)] tracking-tight">
                    {col.title}
                  </h3>
                </div>
                <Pill tone={col.badgeTone} className="text-xs px-2.5 py-0.5">
                  {colLeads.length}
                </Pill>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5 pb-2">
                {colLeads.length === 0 ? (
                  <div
                    className={`flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                      isOver
                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                        : "border-[var(--stroke)] bg-[var(--panel-fill-2)]/40 text-[var(--fg-4)]"
                    }`}
                  >
                    <p className="text-xs font-medium">
                      {isOver ? "Release to drop lead here" : "No leads in this stage"}
                    </p>
                    <p className="mt-1 text-[11px] opacity-75">
                      Drag leads across stages or add new prospects
                    </p>
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const isHot = lead.lead_score >= 70;
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => openLeadDrawer(lead)}
                        className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-[var(--panel-fill-2)] ${
                          isHot
                            ? "border-amber-500/30 hover:border-amber-500/60"
                            : "border-[var(--stroke)] hover:border-blue-500/40"
                        } ${draggedLeadId === lead.id ? "opacity-40" : "opacity-100"}`}
                      >
                        {/* Card Top Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-[var(--fg)] tracking-tight">
                              {lead.recipient_handle}
                            </span>
                            {isHot && (
                              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                                🔥 {lead.lead_score}%
                              </span>
                            )}
                          </div>

                          <span className="rounded bg-[var(--panel-fill)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] border border-[var(--stroke)]">
                            {platformLabel(lead.platform)}
                          </span>
                        </div>

                        {/* Campaign Association */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--fg-3)] truncate font-medium">
                          <Target className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{lead.campaign_name}</span>
                        </div>

                        {/* Notes Preview */}
                        {lead.notes && (
                          <p className="mt-2 text-xs text-[var(--fg-4)] line-clamp-2 italic bg-[var(--panel-fill)]/60 p-2 rounded-xl border border-[var(--stroke)]/50">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Card Footer */}
                        <div className="mt-3.5 flex items-center justify-between border-t border-[var(--stroke)] pt-2.5">
                          <span className="text-[11px] font-medium text-[var(--fg-4)] flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-blue-400" />
                            {lead.last_contacted_at
                              ? new Date(lead.last_contacted_at).toLocaleDateString()
                              : "Not contacted"}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openLeadDrawer(lead);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-white hover:bg-blue-600 transition-all border border-[var(--stroke)]"
                              title="View details & outreach"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* LEAD DETAIL DRAWER / SLIDEOVER MODAL */}
      {/* ========================================================= */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-lg bg-[var(--panel-fill)] border-l border-[var(--stroke)] shadow-2xl h-full flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[var(--stroke)] flex items-center justify-between sticky top-0 bg-[var(--panel-fill)] z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-base">
                  {activeLead.recipient_handle.replace("@", "").charAt(0).toUpperCase() || "L"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--fg)] flex items-center gap-2">
                    {activeLead.recipient_handle}
                    {activeLead.lead_score >= 70 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🔥 Hot
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[var(--fg-3)]">
                    {activeLead.campaign_name} • {platformLabel(activeLead.platform)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveLead(null)}
                className="p-2 rounded-xl text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--panel-fill-2)] transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Pipeline Stage Transition */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-3)]">
                  Pipeline Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLUMNS.map((col) => {
                    const isSelected = activeLead.status === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => saveLeadDetails({ status: col.id })}
                        disabled={isSavingDetails}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-blue-300 font-semibold"
                            : "bg-[var(--panel-fill-2)] border-[var(--stroke)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-[var(--stroke)]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: col.color }}
                          />
                          {col.title}
                        </span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lead Intent Score */}
              <div className="space-y-2 p-4 rounded-2xl bg-[var(--panel-fill-2)] border border-[var(--stroke)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-3)]">
                    Intent & Lead Score
                  </label>
                  <span className="text-sm font-bold text-[var(--fg)]">
                    {drawerScoreInput}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={drawerScoreInput}
                  onChange={(e) => setDrawerScoreInput(Number(e.target.value))}
                  onMouseUp={() => saveLeadDetails({ lead_score: drawerScoreInput })}
                  onTouchEnd={() => saveLeadDetails({ lead_score: drawerScoreInput })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--fg-4)] font-medium">
                  <span>Cold (0%)</span>
                  <span>Warm (50%)</span>
                  <span>Hot (100%)</span>
                </div>
              </div>

              {/* Quick Outreach Simulator */}
              <div className="space-y-3 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400">
                  <MessageCircle className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Direct Outreach Action
                  </h4>
                </div>
                <p className="text-xs text-[var(--fg-3)]">
                  Log direct contact or dispatch automated sequence message.
                </p>

                <textarea
                  rows={2}
                  value={quickMessageText}
                  onChange={(e) => setQuickMessageText(e.target.value)}
                  placeholder="Hey, loved your recent post! Wondering if you're exploring..."
                  className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-blue-500 focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[var(--fg-4)]">
                    Auto-updates last contacted timestamp
                  </span>
                  <button
                    type="button"
                    onClick={handleSendQuickMessage}
                    disabled={isSendingMessage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" />
                    {isSendingMessage ? "Dispatching..." : "Log & Send"}
                  </button>
                </div>
              </div>

              {/* Lead Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-3)]">
                    Internal Notes & History
                  </label>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Add conversation summary, deal size, or next follow up date..."
                      className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-blue-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNotesInput(activeLead.notes || "");
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveLeadDetails({ notes: notesInput })}
                        disabled={isSavingDetails}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[var(--panel-fill-2)] border border-[var(--stroke)] text-xs text-[var(--fg-2)] whitespace-pre-wrap min-h-[72px]">
                    {activeLead.notes ? activeLead.notes : <span className="text-[var(--fg-4)] italic">No notes added yet.</span>}
                  </div>
                )}
              </div>

              {/* Lead Metadata Info */}
              <div className="p-4 rounded-2xl bg-[var(--panel-fill-2)] border border-[var(--stroke)] space-y-2 text-xs">
                <div className="flex justify-between text-[var(--fg-3)]">
                  <span>Last Contacted:</span>
                  <span className="text-[var(--fg)] font-medium">
                    {activeLead.last_contacted_at
                      ? new Date(activeLead.last_contacted_at).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--fg-3)]">
                  <span>Created At:</span>
                  <span className="text-[var(--fg)] font-medium">
                    {activeLead.created_at
                      ? new Date(activeLead.created_at).toLocaleDateString()
                      : "Recent"}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--fg-3)]">
                  <span>Platform:</span>
                  <span className="text-[var(--fg)] font-medium">
                    {platformLabel(activeLead.platform)}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-[var(--stroke)] flex items-center justify-between sticky bottom-0 bg-[var(--panel-fill)]">
              <button
                type="button"
                onClick={() => handleDeleteLead(activeLead.id)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Prospect
              </button>

              <button
                type="button"
                onClick={() => setActiveLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--panel-fill-2)] hover:bg-[var(--hover)] text-[var(--fg)] border border-[var(--stroke)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD LEAD MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-[var(--panel-fill)] border border-[var(--stroke)] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--fg)]">
                    Add Lead to Pipeline
                  </h3>
                  <p className="text-xs text-[var(--fg-3)]">
                    Manually qualify and track a prospect
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[var(--fg-4)] hover:text-[var(--fg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addLeadError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{addLeadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewLead} className="space-y-4">
              {/* Campaign selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--fg-2)]">
                  Target Campaign *
                </label>
                <select
                  value={newCampaignId}
                  onChange={(e) => setNewCampaignId(e.target.value)}
                  required
                  className="w-full h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] focus:border-blue-500 focus:outline-none"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({platformLabel(c.platform)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Handle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--fg-2)]">
                  Recipient Handle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="@handle or profile name"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Initial Stage */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--fg-2)]">
                  Initial Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Lead["status"])}
                  className="w-full h-10 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 text-xs text-[var(--fg)] focus:border-blue-500 focus:outline-none"
                >
                  <option value="pending">Pending (Queued)</option>
                  <option value="sent">Outreach Sent</option>
                  <option value="replied">Replied / Hot</option>
                  <option value="closed">Closed Won</option>
                </select>
              </div>

              {/* Lead Score Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-[var(--fg-2)]">
                    Intent Score ({newScore}%)
                  </label>
                  <span className="text-[var(--fg-3)]">
                    {newScore >= 70 ? "🔥 High Intent" : newScore >= 40 ? "⚡ Warm" : "❄️ Cold"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Initial Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--fg-2)]">
                  Initial Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Key interest, follower count, or context..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--stroke)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--fg-3)] hover:text-[var(--fg)] bg-[var(--panel-fill-2)] border border-[var(--stroke)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewLead}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isSubmittingNewLead ? "Adding..." : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
