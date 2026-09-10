"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Shield,
  Activity,
  Mail,
  Search,
  MoreHorizontal,
  ChevronDown,
  UserPlus,
  Clock3,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Lock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

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
      // Clear fields
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" /> Workspace Collaboration
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Team Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your marketing team members, assign workspace roles, and coordinate client campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Members</span>
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{members.length}</span>
            <span className="text-xs text-emerald-400 font-medium">+1 this week</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Active workspace accounts</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Active Now</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{onlineCount}</span>
            <span className="text-xs text-slate-400">online</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Active in last 10 minutes</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Invites</span>
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300">{invitations.length}</span>
            <span className="text-xs text-slate-400">awaiting</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sent invites not yet accepted</p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Administrators</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{adminCount}</span>
            <span className="text-xs text-indigo-400 font-medium">Managers & Admins</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Full control permissions</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Users className="w-4 h-4" />
          Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "roles"
              ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Shield className="w-4 h-4" />
          Roles & Permissions
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "activity"
              ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity Feed
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#0d1322] p-4 rounded-2xl border border-slate-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, role, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/80"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
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
                className="px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                    <th className="py-3.5 px-5">Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Presence</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        No team members match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 overflow-hidden">
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
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1322] ${
                                  member.status === "online"
                                    ? "bg-emerald-400"
                                    : member.status === "away"
                                    ? "bg-amber-400"
                                    : "bg-slate-500"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-2">
                                {member.full_name}
                                {member.is_current_user && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">@{member.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                              member.role === "owner"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                : member.role === "admin"
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                                : member.role === "manager"
                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                                : "bg-slate-700/20 border-slate-700/50 text-slate-300"
                            }`}
                          >
                            {member.role === "owner" && <Shield className="w-3 h-3 text-amber-400" />}
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
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
                                  : "text-slate-400"
                              }`}
                            >
                              {member.status}
                            </span>
                            {member.last_active_at && (
                              <span className="text-[11px] text-slate-400">
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
                              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {actionMenuMemberId === member.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                  Change Role
                                </div>
                                {["admin", "manager", "member"].map((r) => (
                                  <button
                                    key={r}
                                    onClick={() => handleUpdateRole(member.id, r)}
                                    disabled={member.role === r}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                                      member.role === r ? "text-purple-400 font-semibold" : "text-slate-300"
                                    }`}
                                  >
                                    <span>Make {r.charAt(0).toUpperCase() + r.slice(1)}</span>
                                    {member.role === r && <Check className="w-3.5 h-3.5 text-purple-400" />}
                                  </button>
                                ))}

                                {!member.is_current_user && member.role !== "owner" && (
                                  <>
                                    <div className="border-t border-slate-800 my-1" />
                                    <button
                                      onClick={() => handleRemoveMember(member.id, member.full_name)}
                                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
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
          </div>

          {/* Pending Invitations Section */}
          {invitations.length > 0 && (
            <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <h3 className="font-semibold text-white text-sm">
                    Pending Invitations ({invitations.length})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200">{invite.email}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="capitalize text-purple-400">{invite.role}</span>
                        <span>•</span>
                        <span>{invite.department}</span>
                        <span>•</span>
                        <span>Sent {new Date(invite.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === "roles" && (
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Workspace Permission Matrix</h3>
            <p className="text-xs text-slate-400 mt-1">
              Role definitions and capability privileges across client workspaces.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3 px-4">Permission Area</th>
                  <th className="py-3 px-4 text-center">Owner</th>
                  <th className="py-3 px-4 text-center">Admin</th>
                  <th className="py-3 px-4 text-center">Manager</th>
                  <th className="py-3 px-4 text-center">Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
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
                  <tr key={idx} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-medium text-slate-200">{row.name}</td>
                    <td className="py-3 px-4 text-center">
                      {row.owner ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.admin ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.manager ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.member ? (
                        <CheckCircle2 className="w-4 h-4 text-slate-300 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY FEED */}
      {activeTab === "activity" && (
        <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Team Audit & Activity Log</h3>
          <p className="text-xs text-slate-400">
            Real-time chronological events recorded for team management actions.
          </p>

          <div className="space-y-3 mt-4">
            {activities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No activity records logged yet.
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                    {act.actor_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200">
                      <strong className="text-white">{act.actor_name}</strong>{" "}
                      {act.action === "invite_sent" && "sent a team invitation to " + (act.details?.email || "user")}
                      {act.action === "member_joined" && "joined the workspace team"}
                      {act.action === "role_updated" && `updated a member role to ${act.details?.new_role}`}
                      {act.action === "member_removed" && "removed a member from the workspace"}
                      {act.action === "member_left" && "left the workspace team"}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock3 className="w-3 h-3" />
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d1322] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => {
                setIsInviteOpen(false);
                setInviteSuccess(null);
                setInviteError("");
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Invite Team Member
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Collaborate with your agency colleagues and client managers.
              </p>
            </div>

            {inviteSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Invitation created successfully!
                </div>
                <p className="text-xs text-slate-300">
                  Share this invitation link with your team member to accept access:
                </p>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 truncate">
                  <span className="truncate flex-1">{inviteSuccess}</span>
                  <button
                    onClick={() => copyToClipboard(inviteSuccess)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsInviteOpen(false);
                    setInviteSuccess(null);
                  }}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@agency.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500/80"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/80"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="Growth, Media, Design..."
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500/80"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
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
    </div>
  );
}
