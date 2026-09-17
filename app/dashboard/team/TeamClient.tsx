"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Shield,
  Activity,
  Mail,
  Search,
  MoreHorizontal,
  UserPlus,
  Clock3,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Building2,
} from "lucide-react";
import { GlassCard, PageHeader, StatTile, Pill } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  department: string;
  last_active_at: string | null;
  created_at: string;
  status: "online" | "away" | "offline";
  is_current_user: boolean;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  department: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface ActivityItem {
  id: string;
  actor_name: string;
  actor_avatar: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

interface TeamClientProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  };
  initialMembers: TeamMember[];
  initialInvitations: TeamInvitation[];
  initialActivity: ActivityItem[];
}

export function TeamClient({
  currentUser,
  initialMembers,
  initialInvitations,
  initialActivity,
}: TeamClientProps) {
  const [activeTab, setActiveTab] = useState<"members" | "roles" | "activity">("members");
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [invitations, setInvitations] = useState<TeamInvitation[]>(initialInvitations);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivity);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteDept, setInviteDept] = useState("Marketing");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Action Menu States
  const [actionMenuMemberId, setActionMenuMemberId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  // Derived Stats
  const onlineCount = members.filter((m) => m.status === "online").length;
  const adminCount = members.filter((m) => m.role === "admin" || m.role === "owner").length;

  // Invite Member API Handler
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          department: inviteDept.trim() || "Marketing",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setInviteSuccess(data.inviteLink || "Invitation registered successfully!");
      if (data.invitation) {
        setInvitations((prev) => [data.invitation, ...prev]);
      }
      setInviteEmail("");
    } catch (err: any) {
      setInviteError(err.message || "An unexpected error occurred");
    } finally {
      setInviteLoading(false);
    }
  };

  // Update Member Role
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setUpdatingMemberId(memberId);
    setActionMenuMemberId(null);
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    setUpdatingMemberId(memberId);
    setActionMenuMemberId(null);
    try {
      const res = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove member");
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* Top Header */}
      <PageHeader
        eyebrow="Workspace Collaboration"
        title="Team Management"
        sub="Manage your marketing team members, assign workspace roles, and coordinate client campaigns."
        actions={
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        }
      />

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total Members"
          value={String(members.length)}
          icon={Users}
          tone="blue"
          footer={<span className="text-[11px] text-emerald-400 font-medium">+1 this week · Active accounts</span>}
        />
        <StatTile
          label="Active Now"
          value={String(onlineCount)}
          icon={Activity}
          tone="success"
          footer={<span className="text-[11px] text-[var(--fg-4)]">Active in last 10 minutes</span>}
        />
        <StatTile
          label="Pending Invites"
          value={String(invitations.length)}
          icon={Mail}
          tone="warning"
          footer={<span className="text-[11px] text-[var(--fg-4)]">Awaiting member acceptance</span>}
        />
        <StatTile
          label="Administrators"
          value={String(adminCount)}
          icon={Shield}
          tone="indigo"
          footer={<span className="text-[11px] text-[var(--fg-4)]">Managers & Admins</span>}
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--stroke)] pb-3">
        <button
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "members"
              ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
              : "text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
          )}
        >
          <Users className="w-4 h-4" />
          Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "roles"
              ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
              : "text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
          )}
        >
          <Shield className="w-4 h-4" />
          Roles & Permissions
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
            activeTab === "activity"
              ? "bg-blue-600/15 border border-blue-500/30 text-blue-400"
              : "text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
          )}
        >
          <Activity className="w-4 h-4" />
          Activity Feed
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <GlassCard className="p-4" padding="none">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-4)]" />
                <input
                  type="text"
                  placeholder="Search by name, role, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl text-sm text-[var(--fg)] placeholder-[var(--fg-4)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl text-xs text-[var(--fg-2)] focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl text-xs text-[var(--fg-2)] focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Members Table */}
          <GlassCard className="overflow-hidden" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--stroke)] text-xs font-semibold text-[var(--fg-4)] uppercase tracking-wider bg-[var(--panel-fill-2)]/50">
                    <th className="py-3.5 px-5">Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Presence</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--stroke)] text-sm">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[var(--fg-4)]">
                        <Users className="w-8 h-8 mx-auto mb-2 text-[var(--fg-4)] opacity-60" />
                        No team members match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[var(--hover)] transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 overflow-hidden">
                                {member.avatar_url ? (
                                  <img
                                    src={member.avatar_url}
                                    alt={member.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  member.full_name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--panel-fill)] ${
                                  member.status === "online"
                                    ? "bg-emerald-400"
                                    : member.status === "away"
                                    ? "bg-amber-400"
                                    : "bg-slate-500"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-[var(--fg)] flex items-center gap-2">
                                {member.full_name}
                                {member.is_current_user && (
                                  <Pill tone="blue">You</Pill>
                                )}
                              </div>
                              <div className="text-xs text-[var(--fg-4)]">@{member.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              member.role === "owner"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                : member.role === "admin"
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                : member.role === "manager"
                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                : "bg-[var(--panel-fill-2)] border-[var(--stroke)] text-[var(--fg-3)]"
                            }`}
                          >
                            {member.role === "owner" && <Shield className="w-3 h-3 text-amber-400" />}
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--fg-3)]">
                            <Building2 className="w-3.5 h-3.5 text-[var(--fg-4)]" />
                            {member.department || "Marketing"}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium capitalize ${
                                member.status === "online"
                                  ? "text-emerald-400"
                                  : member.status === "away"
                                  ? "text-amber-400"
                                  : "text-[var(--fg-4)]"
                              }`}
                            >
                              {member.status}
                            </span>
                            {member.last_active_at && (
                              <span className="text-[11px] text-[var(--fg-4)]">
                                ({new Date(member.last_active_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setActionMenuMemberId(
                                  actionMenuMemberId === member.id ? null : member.id
                                )
                              }
                              disabled={updatingMemberId === member.id}
                              className="p-1.5 rounded-lg hover:bg-[var(--hover)] text-[var(--fg-4)] hover:text-[var(--fg)] transition-colors cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {actionMenuMemberId === member.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-[var(--panel-fill)] border border-[var(--stroke)] rounded-xl shadow-2xl py-1 z-50">
                                <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--fg-4)] uppercase tracking-wider border-b border-[var(--stroke)]">
                                  Change Role
                                </div>
                                {["admin", "manager", "member"].map((r) => (
                                  <button
                                    key={r}
                                    onClick={() => handleUpdateRole(member.id, r)}
                                    disabled={member.role === r}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--hover)] cursor-pointer ${
                                      member.role === r ? "text-blue-400 font-semibold" : "text-[var(--fg-2)]"
                                    }`}
                                  >
                                    <span>Make {r.charAt(0).toUpperCase() + r.slice(1)}</span>
                                    {member.role === r && <Check className="w-3.5 h-3.5 text-blue-400" />}
                                  </button>
                                ))}

                                {!member.is_current_user && member.role !== "owner" && (
                                  <>
                                    <div className="border-t border-[var(--stroke)] my-1" />
                                    <button
                                      onClick={() => handleRemoveMember(member.id, member.full_name)}
                                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                      Remove Member
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Pending Invitations Section */}
          {invitations.length > 0 && (
            <GlassCard className="p-5 space-y-4" padding="none">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-[var(--fg)] text-sm">
                      Pending Invitations ({invitations.length})
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {invitations.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3.5 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl"
                    >
                      <div>
                        <div className="text-sm font-medium text-[var(--fg)]">{invite.email}</div>
                        <div className="text-xs text-[var(--fg-4)] flex items-center gap-2 mt-0.5">
                          <span className="capitalize text-blue-400">{invite.role}</span>
                          <span>•</span>
                          <span>{invite.department}</span>
                          <span>•</span>
                          <span>Sent {new Date(invite.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <Pill tone="warning">Pending</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === "roles" && (
        <GlassCard className="p-6 space-y-6" padding="none">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--fg)]">Workspace Permission Matrix</h3>
              <p className="text-xs text-[var(--fg-4)] mt-1">
                Role definitions and capability privileges across client workspaces.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--stroke)] text-[var(--fg-4)] uppercase tracking-wider bg-[var(--panel-fill-2)]/50">
                    <th className="py-3 px-4">Permission Area</th>
                    <th className="py-3 px-4 text-center">Owner</th>
                    <th className="py-3 px-4 text-center">Admin</th>
                    <th className="py-3 px-4 text-center">Manager</th>
                    <th className="py-3 px-4 text-center">Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--stroke)]">
                  {[
                    { name: "Workspace Settings & Deletion", owner: true, admin: false, manager: false, member: false },
                    { name: "Billing & Subscription Plans", owner: true, admin: true, manager: false, member: false },
                    { name: "Invite & Remove Team Members", owner: true, admin: true, manager: false, member: false },
                    { name: "Connect Social Media Accounts", owner: true, admin: true, manager: true, member: false },
                    { name: "Create & Publish Campaigns", owner: true, admin: true, manager: true, member: true },
                    { name: "AI Strategy & Discovery Tools", owner: true, admin: true, manager: true, member: true },
                    { name: "View Analytics & Reports", owner: true, admin: true, manager: true, member: true },
                    { name: "Manage Client CRM & Leads", owner: true, admin: true, manager: true, member: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[var(--hover)]">
                      <td className="py-3 px-4 font-medium text-[var(--fg-2)]">{row.name}</td>
                      <td className="py-3 px-4 text-center">
                        {row.owner ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[var(--fg-4)] opacity-40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.admin ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[var(--fg-4)] opacity-40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.manager ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[var(--fg-4)] opacity-40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.member ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--fg-3)] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[var(--fg-4)] opacity-40 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      )}

      {/* TAB 3: ACTIVITY FEED */}
      {activeTab === "activity" && (
        <GlassCard className="p-6 space-y-4" padding="none">
          <div className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[var(--fg)]">Team Audit & Activity Log</h3>
            <p className="text-xs text-[var(--fg-4)]">
              Real-time chronological events recorded for team management actions.
            </p>

            <div className="space-y-3 mt-4">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-[var(--fg-4)] text-xs">
                  No activity records logged yet.
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3.5 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                      {act.actor_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--fg-2)]">
                        <strong className="text-[var(--fg)]">{act.actor_name}</strong>{" "}
                        {act.action === "invite_sent" && "sent a team invitation to " + (act.details?.email || "user")}
                        {act.action === "member_joined" && "joined the workspace team"}
                        {act.action === "role_updated" && `updated a member role to ${act.details?.new_role}`}
                        {act.action === "member_removed" && "removed a member from the workspace"}
                        {act.action === "member_left" && "left the workspace team"}
                      </p>
                      <span className="text-[10px] text-[var(--fg-4)] flex items-center gap-1 mt-1">
                        <Clock3 className="w-3 h-3" />
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--panel-fill)] border border-[var(--stroke)] rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setIsInviteOpen(false);
                setInviteSuccess(null);
                setInviteError("");
              }}
              className="absolute top-5 right-5 text-[var(--fg-4)] hover:text-[var(--fg)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-[var(--fg)] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                Invite Team Member
              </h3>
              <p className="text-xs text-[var(--fg-4)] mt-1">
                Collaborate with your agency colleagues and client managers.
              </p>
            </div>

            {inviteSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Invitation created successfully!
                </div>
                <p className="text-xs text-[var(--fg-2)]">
                  Share this invitation link with your team member to accept access:
                </p>
                <div className="flex items-center gap-2 bg-[var(--panel-fill-2)] p-2.5 rounded-lg border border-[var(--stroke)] text-xs font-mono text-[var(--fg-2)] truncate">
                  <span className="truncate flex-1">{inviteSuccess}</span>
                  <button
                    onClick={() => copyToClipboard(inviteSuccess)}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsInviteOpen(false);
                    setInviteSuccess(null);
                  }}
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                {inviteError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@agency.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl text-sm text-[var(--fg)] placeholder-[var(--fg-4)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wider mb-1.5">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl text-xs text-[var(--fg)] focus:outline-none focus:border-blue-500"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wider mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="Growth, Media, Design..."
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[var(--panel-fill-2)] border border-[var(--stroke)] rounded-xl text-xs text-[var(--fg)] placeholder-[var(--fg-4)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Sending Invite...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Send Workspace Invite
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
