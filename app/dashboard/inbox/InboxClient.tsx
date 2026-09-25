"use client";

import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import Link from "next/link";
import {
  Search,
  MoreVertical,
  Send,
  Smile,
  Paperclip,
  Sparkles,
  MessageCircle,
  MessagesSquare,
  AtSign,
  Camera,
  Play,
  Video,
  Briefcase,
  Users,
  Hash,
  Ghost,
  Bell,
  Bot,
  ChevronDown,
  CheckCheck,
  Clock,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Inbox as InboxIcon,
  MessageSquare,
  TrendingUp,
  Activity,
  Heart,
  Eye,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "lucide-react";

import { GlassCard, Pill } from "@/components/dashboard/ui";
import { fmtNum } from "@/lib/dashboard/helpers";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import type { PlatformId } from "@/lib/social/platforms";
import type { SocialAccount, SocialInboxMessage } from "@/lib/social/types";

/* -------------------------------------------------------------------------- */
/*                                  PLATFORMS                                 */
/* -------------------------------------------------------------------------- */

type IconProps = {
  className?: string;
  style?: CSSProperties;
};

const PLATFORM_ICONS: Record<PlatformId | "system" | "tiktok", ComponentType<IconProps>> = {
  instagram: Camera,
  youtube: Video,
  x: AtSign,
  linkedin: Briefcase,
  facebook: Users,
  threads: Hash,
  snapchat: Ghost,
  reddit: MessagesSquare,
  telegram: Send,
  whatsapp: MessageCircle,
  system: Bell,
  tiktok: Play,
};

const PLATFORM_COLORS: Record<PlatformId | "system" | "tiktok", string> = {
  instagram: "#ec168c",
  youtube: "#ef4444",
  x: "#e2e8f0",
  linkedin: "#3b82f6",
  facebook: "#6366f1",
  threads: "#a855f7",
  snapchat: "#facc15",
  reddit: "#f97316",
  telegram: "#38bdf8",
  whatsapp: "#22c55e",
  system: "#ec168c",
  tiktok: "#a855f7",
};

const PLATFORM_IMAGE_MAP: Record<string, string> = {
  youtube: "/integrations/yt.png",
  instagram: "/integrations/insta.png",
  facebook: "/integrations/facebook.png",
  x: "/integrations/twitter.png",
  twitter: "/integrations/twitter.png",
  threads: "/integrations/threads.png",
  telegram: "/integrations/telegram.png",
  tiktok: "/integrations/ticktok.png",
  whatsapp: "/integrations/whatsapp.png",
  linkedin: "/integrations/linkedin.png",
  snapchat: "/integrations/Snapchat.png",
  reddit: "/integrations/reddit.png",
  pinterest: "/integrations/pin.png",
  discord: "/integrations/discord.png",
  messenger: "/integrations/messanger.png",
};

function PlatformIcon({
  platform,
  className = "h-4 w-4",
  imgClassName = "object-cover",
}: {
  platform: string | null | undefined;
  className?: string;
  imgClassName?: string;
}) {
  const normPlatform = (platform || "").toLowerCase();
  const imageSrc = PLATFORM_IMAGE_MAP[normPlatform];

  if (imageSrc) {
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      >
        <img
          src={imageSrc}
          alt={platform || "Social platform"}
          className={`h-full w-full rounded-full object-cover ${imgClassName}`}
        />
      </span>
    );
  }

  const Icon = PLATFORM_ICONS[normPlatform as PlatformId] || MessageCircle;
  const color = PLATFORM_COLORS[normPlatform as PlatformId] || "var(--brand-primary)";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ color, backgroundColor: `${color}16` }}
    >
      <Icon className="h-3/5 w-3/5" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function initials(name: string | null | undefined) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(date: string | null | undefined) {
  if (!date) return "";

  const value = new Date(date);
  const now = new Date();

  const diff = now.getTime() - value.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;

  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function categoryLabel(category: string | null | undefined) {
  if (!category) return "Message";

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getCategoryBadge(category: string | null | undefined) {
  switch (category?.toLowerCase()) {
    case "lead":
      return {
        bg: "rgba(245, 158, 11, 0.12)",
        text: "#f59e0b",
        border: "rgba(245, 158, 11, 0.25)",
      };

    case "complaint":
      return {
        bg: "rgba(239, 68, 68, 0.12)",
        text: "#ef4444",
        border: "rgba(239, 68, 68, 0.25)",
      };

    case "question":
      return {
        bg: "var(--kora-blue-soft)",
        text: "var(--kora-blue)",
        border: "rgba(59, 130, 246, 0.25)",
      };

    case "mention":
      return {
        bg: "var(--brand-primary-soft)",
        text: "var(--brand-primary)",
        border: "var(--brand-primary-border)",
      };

    default:
      return {
        bg: "var(--panel-fill-2)",
        text: "var(--fg-4)",
        border: "var(--stroke)",
      };
  }
}

function getAccountName(account: SocialAccount) {
  return account.handle || account.display_name || "Connected account";
}

/* -------------------------------------------------------------------------- */
/*                                STAT CARD                                   */
/* -------------------------------------------------------------------------- */

function InboxStatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "primary" | "pink" | "blue" | "green" | "purple" | "indigo";
  highlight?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-black/80 bg-[var(--panel-fill)] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] dark:border-[var(--stroke)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-black bg-black text-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
          <Icon className="h-4 w-4" />
        </div>

        {highlight && (
          <span className="flex h-2 w-2 rounded-full bg-black dark:bg-white" />
        )}
      </div>

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-4)]">
        {label}
      </p>

      <p className="mt-0.5 font-display text-xl font-bold tracking-tight text-[var(--fg)]">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

export function InboxClient({
  accounts,
  messages,
}: {
  accounts: SocialAccount[];
  messages: SocialInboxMessage[];
}) {
  const { success } = useToast();

  const [messagesList, setMessagesList] = useState<SocialInboxMessage[]>(messages);
  const connectedCount = accounts.length;

  const [activeTab, setActiveTab] = useState<
    "all" | "messages" | "comments" | "mentions" | "dms"
  >("all");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "unread" | "needs-reply"
  >("all");

  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.id ?? null
  );

  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Record<string, string>>({});
  const [sortNewest, setSortNewest] = useState(true);

  /* ------------------------------------------------------------------------ */
  /*                                COUNTS                                    */
  /* ------------------------------------------------------------------------ */

  const counts = useMemo(() => {
    return {
      all: messagesList.length,

      messages: messagesList.filter(
        (m) =>
          (m.kind || "").toLowerCase().includes("message") ||
          (m.kind || "").toLowerCase().includes("dm")
      ).length,

      comments: messagesList.filter((m) =>
        (m.kind || "").toLowerCase().includes("comment")
      ).length,

      mentions: messagesList.filter((m) =>
        (m.kind || "").toLowerCase().includes("mention") ||
        (m.category || "").toLowerCase() === "mention"
      ).length,

      dms: messagesList.filter(
        (m) =>
          (m.kind || "").toLowerCase().includes("dm") ||
          (m.kind || "").toLowerCase().includes("direct")
      ).length,
    };
  }, [messagesList]);

  const unreadCount = useMemo(
    () =>
      messagesList.filter(
        (message) => !message.is_read && !localReplies[message.id]
      ).length,
    [messagesList, localReplies]
  );

  const needsReplyCount = useMemo(
    () =>
      messagesList.filter(
        (message) =>
          !message.replied &&
          !localReplies[message.id] &&
          message.platform !== "system"
      ).length,
    [messagesList, localReplies]
  );

  /* ------------------------------------------------------------------------ */
  /*                                FILTERING                                 */
  /* ------------------------------------------------------------------------ */

  const filteredMessages = useMemo(() => {
    let result = [...messagesList];

    if (selectedAccount !== "all") {
      result = result.filter(
        (message) =>
          message.account_id === selectedAccount ||
          message.platform === selectedAccount
      );
    }

    if (activeTab !== "all") {
      result = result.filter((message) => {
        const kind = message.kind?.toLowerCase() || "";
        const cat = message.category?.toLowerCase() || "";

        if (activeTab === "messages") {
          return kind.includes("message") || kind.includes("dm") || kind.includes("reply");
        }

        if (activeTab === "comments") {
          return kind.includes("comment");
        }

        if (activeTab === "mentions") {
          return kind.includes("mention") || cat.includes("mention");
        }

        if (activeTab === "dms") {
          return kind.includes("dm") || kind.includes("direct");
        }

        return true;
      });
    }

    if (statusFilter === "unread") {
      result = result.filter(
        (message) => !message.is_read && !localReplies[message.id]
      );
    } else if (statusFilter === "needs-reply") {
      result = result.filter(
        (message) =>
          !message.replied &&
          !localReplies[message.id] &&
          message.platform !== "system"
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();

      result = result.filter((message) => {
        return (
          (message.author_name &&
            message.author_name.toLowerCase().includes(query)) ||
          (message.author_handle &&
            message.author_handle.toLowerCase().includes(query)) ||
          (message.body &&
            message.body.toLowerCase().includes(query)) ||
          (message.platform &&
            message.platform.toLowerCase().includes(query)) ||
          (message.category &&
            message.category.toLowerCase().includes(query)) ||
          (message.kind &&
            message.kind.toLowerCase().includes(query))
        );
      });
    }

    result.sort((a, b) => {
      const aTime = new Date(a.received_at).getTime();
      const bTime = new Date(b.received_at).getTime();

      return sortNewest ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [
    messagesList,
    activeTab,
    selectedAccount,
    statusFilter,
    search,
    localReplies,
    sortNewest,
  ]);

  const selectedMessage = useMemo(
    () => messagesList.find((m) => m.id === selectedId) || null,
    [messagesList, selectedId]
  );

  /* ------------------------------------------------------------------------ */
  /*                                ACTIONS                                   */
  /* ------------------------------------------------------------------------ */

  const selectConversation = async (id: string) => {
    setSelectedId(id);
    setMessagesList((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, is_read: true } : msg
      )
    );

    try {
      const supabase = createClient();
      await supabase
        .from("social_inbox")
        .update({ is_read: true })
        .eq("id", id);
    } catch (err) {
      console.warn("Failed to mark conversation as read in db:", err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    const unreadIds = messagesList.filter((m) => !m.is_read).map((m) => m.id);

    setMessagesList((prev) =>
      prev.map((msg) => ({
        ...msg,
        is_read: true,
      }))
    );

    try {
      const supabase = createClient();
      if (unreadIds.length > 0) {
        await supabase
          .from("social_inbox")
          .update({ is_read: true })
          .in("id", unreadIds);
      }
    } catch (err) {
      console.warn("Failed to mark all as read in db:", err);
    }

    success(
      "All marked as read",
      "All inbox conversations and notifications have been marked as read."
    );
  };

  const sendReply = async (message: SocialInboxMessage) => {
    if (!reply.trim()) return;

    const currentReply = reply.trim();
    setReply("");

    setLocalReplies((prev) => ({
      ...prev,
      [message.id]: currentReply,
    }));

    setMessagesList((prev) =>
      prev.map((item) =>
        item.id === message.id
          ? {
              ...item,
              replied: true,
              reply_body: currentReply,
              is_read: true,
            }
          : item
      )
    );

    try {
      if (message.platform && message.platform !== "system") {
        await fetch("/api/social/send-dm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accountId:
              message.account_id !== message.platform
                ? message.account_id
                : undefined,
            platform: message.platform,
            recipientId:
              message.thread_id ||
              message.author_handle ||
              message.author_name,
            message: currentReply,
            isHumanAgent: true,
          }),
        }).catch((e) => console.warn("Dispatch warning:", e));
      }

      const supabase = createClient();
      await supabase
        .from("social_inbox")
        .update({
          replied: true,
          reply_content: currentReply,
          is_read: true,
        })
        .eq("id", message.id);

      success("Reply sent", "Your response has been sent.");
    } catch (err) {
      console.error("Error sending reply:", err);
      success("Reply recorded", "Your reply was updated locally.");
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-12">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/5 px-2.5 py-1 text-[10px] font-semibold text-black dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
            <MessageSquare className="h-3 w-3" />
            <span>Community & Engagement</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--fg)]">
              Inbox
            </h1>

            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-2 text-[9px] font-bold text-white shadow-sm dark:bg-white dark:text-black">
                {unreadCount} new
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[var(--fg-3)]">
            Stay on top of comments, messages and mentions across your social channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 text-[11px] font-medium text-[var(--fg-2)] transition hover:border-[var(--stroke-strong)] hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5 text-black dark:text-white" />
            Mark all as read
          </button>

          <Link
            href="/dashboard/integrations"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3.5 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
          >
            <Plus className="h-3.5 w-3.5" />
            Connect Channel
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE CHANNELS (lg:hidden) - Directly below Mark all as read      */}
      {/* ------------------------------------------------------------------ */}

      <div className="block lg:hidden">
        <div className="mb-2 flex items-center justify-between px-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
            Channels ({accounts.length})
          </span>
          <Link
            href="/dashboard/integrations"
            className="text-[9px] font-semibold text-[var(--fg)] hover:underline"
          >
            + Connect
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedAccount("all")}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition ${
              selectedAccount === "all"
                ? "border-black bg-black font-semibold text-white dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)]"
            }`}
          >
            <span>All Channels</span>
          </button>

          {accounts.length === 0 ? (
            <Link
              href="/dashboard/integrations"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-[var(--stroke)] px-3 py-1 text-[10px] font-medium text-[var(--fg-4)] hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
            >
              <span>+ Connect your first channel</span>
            </Link>
          ) : (
            accounts.map((account) => {
              const active = selectedAccount === account.id;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() =>
                    setSelectedAccount(active ? "all" : account.id)
                  }
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                    active
                      ? "border-black bg-black font-semibold text-white dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                      : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)]"
                  }`}
                >
                  <PlatformIcon
                    platform={account.platform}
                    className="h-4 w-4 rounded-full ring-1 ring-[var(--stroke)]"
                  />
                  <span className="max-w-[120px] truncate">
                    {getAccountName(account)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* METRIC CARDS                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        <InboxStatCard
          label="Total Messages"
          value={fmtNum(counts.all)}
          icon={MessageSquare}
        />

        <InboxStatCard
          label="Unread"
          value={fmtNum(unreadCount)}
          icon={Bell}
          highlight={unreadCount > 0}
        />

        <InboxStatCard
          label="Needs Reply"
          value={fmtNum(needsReplyCount)}
          icon={MessageCircle}
          highlight={needsReplyCount > 0}
        />

        <InboxStatCard
          label="Mentions"
          value={fmtNum(counts.mentions)}
          icon={AtSign}
        />

        <InboxStatCard
          label="Channels"
          value={fmtNum(accounts.length)}
          icon={Users}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE CATEGORY TABS (lg:hidden)                                  */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:hidden">
        {[
          { id: "all", label: "All", count: counts.all },
          { id: "messages", label: "Messages", count: counts.messages },
          { id: "comments", label: "Comments", count: counts.comments },
          { id: "mentions", label: "Mentions", count: counts.mentions },
          { id: "dms", label: "DMs", count: counts.dms },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition ${
                active
                  ? "border-black bg-black text-white dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                  : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`rounded px-1 text-[9px] font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN THREE-COLUMN INBOX CONTAINER                                 */}
      {/* ------------------------------------------------------------------ */}

      <GlassCard className="grid min-h-[740px] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] lg:grid-cols-[165px_320px_minmax(0,1fr)]">
        {/* ================================================================ */}
        {/* LEFT SIDEBAR                                                     */}
        {/* ================================================================ */}

        <aside className="hidden border-r border-[var(--stroke)] bg-[var(--panel-fill)] lg:flex lg:flex-col">
          <div className="border-b border-[var(--stroke)] px-3 py-4">
            <div className="mb-2.5 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
              Categories
            </div>

            <div className="space-y-1">
              {[
                {
                  id: "all",
                  label: "All",
                  icon: InboxIcon,
                  count: counts.all,
                },
                {
                  id: "messages",
                  label: "Messages",
                  icon: MessageSquare,
                  count: counts.messages,
                },
                {
                  id: "comments",
                  label: "Comments",
                  icon: MessageCircle,
                  count: counts.comments,
                },
                {
                  id: "mentions",
                  label: "Mentions",
                  icon: AtSign,
                  count: counts.mentions,
                },
                {
                  id: "dms",
                  label: "DMs",
                  icon: Send,
                  count: counts.dms,
                },
              ].map((item) => {
                const active = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition ${
                      active
                        ? "border border-black bg-black text-white font-semibold dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                        : "text-[var(--fg-2)] hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          active
                            ? "text-white dark:text-white"
                            : "text-[var(--fg-4)]"
                        }`}
                      />

                      <span className="truncate text-[11px]">
                        {item.label}
                      </span>
                    </span>

                    {item.count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHANNELS */}

          <div className="border-b border-[var(--stroke)] px-3 py-4">
            <div className="mb-2.5 flex items-center justify-between px-2">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
                Channels
              </span>
              <Link
                href="/dashboard/integrations"
                className="text-[9px] font-medium text-[var(--fg)] transition hover:underline"
              >
                + Connect
              </Link>
            </div>

            <div className="space-y-1">
              {accounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--stroke)] p-3 text-center">
                  <p className="text-[10px] text-[var(--fg-4)]">
                    No connected accounts
                  </p>
                  <Link
                    href="/dashboard/integrations"
                    className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-[var(--fg)] hover:underline"
                  >
                    Connect channel
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </Link>
                </div>
              ) : (
                accounts.map((account) => {
                  const active = selectedAccount === account.id;

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() =>
                        setSelectedAccount(active ? "all" : account.id)
                      }
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                        active
                          ? "border border-black bg-black text-white font-semibold dark:border-white/10 dark:bg-white/[0.08] dark:text-white"
                          : "text-[var(--fg-3)] hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
                      }`}
                    >
                      <PlatformIcon
                        platform={account.platform}
                        className="h-5 w-5 rounded-full ring-1 ring-[var(--stroke)]"
                      />

                      <span className="min-w-0 truncate text-[11px] font-medium">
                        {getAccountName(account)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* ================================================================ */}
        {/* MIDDLE CONVERSATION LIST                                         */}
        {/* ================================================================ */}

        <section
          className={`${
            selectedId ? "hidden lg:flex" : "flex"
          } min-w-0 flex-col border-r border-[var(--stroke)]`}
        >
          {/* SEARCH */}

          <div className="border-b border-[var(--stroke)] p-3.5">
            <div className="flex h-9 items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 transition focus-within:border-[var(--stroke-strong)]">
              <Search className="h-3.5 w-3.5 shrink-0 text-[var(--fg-4)]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages, people or keywords..."
                className="min-w-0 flex-1 bg-transparent text-[11px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[var(--fg-4)] hover:text-[var(--fg)]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* MINI FILTERS */}

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] p-0.5">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "needs-reply", label: "Needs Reply" },
                ].map((item) => {
                  const active = statusFilter === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setStatusFilter(item.id as typeof statusFilter)
                      }
                      className={`rounded-md whitespace-nowrap px-2.5 py-1 text-[9px] font-semibold transition ${
                        active
                          ? "bg-black text-white shadow-sm dark:bg-white dark:text-black"
                          : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setSortNewest((value) => !value)}
                className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2 text-[9px] font-medium text-[var(--fg-3)] hover:text-[var(--fg)]"
              >
                <SlidersHorizontal className="h-3 w-3" />
                {sortNewest ? "Newest" : "Oldest"}
              </button>
            </div>
          </div>

          {/* LIST HEADER */}

          <div className="flex items-center justify-between border-b border-[var(--stroke)] px-3.5 py-2.5 bg-[var(--panel-fill-2)]">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-4)]">
              Conversations
            </span>

            <span className="rounded-full bg-[var(--panel-fill)] px-2 py-0.5 text-[9px] font-bold text-[var(--fg-3)]">
              {filteredMessages.length}
            </span>
          </div>

          {/* CONVERSATIONS LIST */}

          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-[var(--stroke)]">
            {filteredMessages.length === 0 ? (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black bg-black text-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>

                <p className="font-display text-sm font-bold text-[var(--fg)]">
                  {messagesList.length === 0
                    ? "No conversations yet"
                    : "No conversations found"}
                </p>

                <p className="mt-1 max-w-[210px] text-[10px] leading-4 text-[var(--fg-4)]">
                  {messagesList.length === 0
                    ? "Connect your social channels to receive messages, comments, and mentions."
                    : "Try adjusting your filters, channels, or search query."}
                </p>

                {messagesList.length === 0 && accounts.length === 0 && (
                  <Link
                    href="/dashboard/integrations"
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-black px-3.5 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:opacity-90 dark:bg-white dark:text-black"
                  >
                    Connect Channels
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ) : (
              filteredMessages.map((message) => {
                const active = selectedMessage?.id === message.id;
                const unread = !message.is_read && !localReplies[message.id];
                const badge = getCategoryBadge(message.category);

                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => selectConversation(message.id)}
                    className={`relative flex w-full gap-3 p-3.5 text-left transition ${
                      active
                        ? "bg-black/[0.04] dark:bg-white/[0.06]"
                        : "hover:bg-[var(--panel-fill-2)]"
                    }`}
                  >
                    {/* ACTIVE ACCENT BAR */}
                    {active && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-black dark:bg-white" />
                    )}

                    {/* AVATAR */}
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[10px] font-bold text-[var(--fg-2)]">
                        {initials(
                          message.author_name || message.author_handle
                        )}
                      </div>

                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--panel-fill)] bg-[var(--panel-fill)] shadow-xs">
                        <PlatformIcon
                          platform={message.platform}
                          className="h-full w-full rounded-full"
                        />
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`truncate text-[11px] ${
                            unread
                              ? "font-bold text-[var(--fg)]"
                              : "font-semibold text-[var(--fg-2)]"
                          }`}
                        >
                          {message.author_name ||
                            message.author_handle ||
                            "Unknown"}
                        </p>

                        <span className="shrink-0 text-[9px] text-[var(--fg-4)]">
                          {formatTime(message.received_at)}
                        </span>
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-[var(--fg-3)]">
                        {message.body}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5">
                        {message.category && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {categoryLabel(message.category)}
                          </span>
                        )}

                        {unread && (
                          <span className="h-2 w-2 rounded-full bg-black dark:bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* RIGHT CONVERSATION THREAD                                        */}
        {/* ================================================================ */}

        <section
          className={`${
            selectedId ? "flex" : "hidden lg:flex"
          } min-w-0 flex-col bg-[var(--panel-fill)]`}
        >
          {selectedMessage ? (
            <>
              {/* ---------------------------------------------------------- */}
              {/* CHAT HEADER                                                 */}
              {/* ---------------------------------------------------------- */}

              <div className="flex min-h-[64px] items-center justify-between border-b border-[var(--stroke)] px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="flex h-8 items-center gap-1 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 text-[11px] font-semibold text-[var(--fg-2)] transition hover:text-[var(--fg)] lg:hidden"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[11px] font-bold text-[var(--fg-2)]">
                      {initials(
                        selectedMessage.author_name ||
                          selectedMessage.author_handle
                      )}
                    </div>

                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--panel-fill)] bg-[var(--panel-fill)] shadow-xs">
                      <PlatformIcon
                        platform={selectedMessage.platform}
                        className="h-full w-full rounded-full"
                      />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display truncate text-xs font-bold text-[var(--fg)]">
                        {selectedMessage.author_name ||
                          selectedMessage.author_handle ||
                          "Unknown"}
                      </h2>

                      {!selectedMessage.is_read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-black dark:bg-white" />
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-[10px] text-[var(--fg-4)]">
                      {selectedMessage.author_handle
                        ? `@${selectedMessage.author_handle.replace("@", "")}`
                        : selectedMessage.platform}{" "}
                      ·{" "}
                      <span className="capitalize">{selectedMessage.kind}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1 text-[9px] font-medium text-[var(--fg-4)] md:flex">
                    <Clock className="h-3 w-3" />
                    {formatTime(selectedMessage.received_at)}
                  </div>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] transition hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* CHAT BODY                                                   */}
              {/* ---------------------------------------------------------- */}

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="mx-auto max-w-[760px] space-y-6">
                  {/* POST CONTEXT */}

                  <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)]">
                        <PlatformIcon
                          platform={selectedMessage.platform}
                          className="h-6 w-6 rounded-full"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px] font-semibold text-[var(--fg)]">
                          {categoryLabel(selectedMessage.kind)} conversation
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-[var(--fg-4)]">
                          {selectedMessage.platform
                            ? `${selectedMessage.platform} interaction`
                            : "Social interaction"}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[9px] font-semibold text-[var(--fg)] hover:underline"
                      >
                        View post
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* DATE SEPARATOR */}

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--stroke)]" />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
                      Conversation
                    </span>

                    <div className="h-px flex-1 bg-[var(--stroke)]" />
                  </div>

                  <div className="space-y-5">
                    {/* INCOMING MESSAGE */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[9px] font-bold text-[var(--fg-2)]">
                        {initials(selectedMessage.author_name)}
                      </div>

                      <div className="max-w-[78%]">
                        <div className="rounded-2xl rounded-tl-sm border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-3 shadow-xs">
                          <p className="text-[11px] leading-[1.65] text-[var(--fg)]">
                            {selectedMessage.body}
                          </p>
                        </div>

                        <div className="mt-1.5 flex items-center gap-2 px-1">
                          <span className="text-[9px] text-[var(--fg-4)]">
                            {new Date(
                              selectedMessage.received_at
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>

                          {selectedMessage.category && (
                            <>
                              <span className="text-[9px] text-[var(--fg-4)]">
                                ·
                              </span>

                              <span
                                className="text-[9px] font-semibold"
                                style={{
                                  color: getCategoryBadge(
                                    selectedMessage.category
                                  ).text,
                                }}
                              >
                                {categoryLabel(selectedMessage.category)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SENT REPLY */}

                    {(selectedMessage.replied ||
                      localReplies[selectedMessage.id]) &&
                      (selectedMessage.reply_body ||
                        localReplies[selectedMessage.id]) && (
                        <div className="flex justify-end">
                          <div className="max-w-[78%]">
                            <div className="rounded-2xl rounded-tr-sm bg-black px-4 py-3 text-white shadow-sm dark:bg-white/[0.08] dark:text-white dark:border dark:border-white/10">
                              <p className="text-[11px] leading-[1.65]">
                                {selectedMessage.reply_body ||
                                  localReplies[selectedMessage.id]}
                              </p>
                            </div>

                            <div className="mt-1.5 flex items-center justify-end gap-1.5 px-1 text-[9px] text-[var(--fg-4)]">
                              <span>Delivered</span>
                              <CheckCheck className="h-3 w-3 text-black dark:text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                    {/* AI SUGGESTION */}

                    {selectedMessage.category === "lead" && (
                      <div className="ml-11 rounded-xl border border-black/20 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-black text-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                            <Bot className="h-3.5 w-3.5" />
                          </div>

                          <div>
                            <p className="font-display text-[10px] font-bold text-[var(--fg)]">
                              Kora AI · Suggested reply
                            </p>

                            <p className="text-[8px] text-[var(--fg-4)]">
                              Generated from this conversation context
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] leading-[1.65] text-[var(--fg-2)]">
                          Hi{" "}
                          {(
                            selectedMessage.author_name || "there"
                          ).split(" ")[0]}
                          ! Thanks so much for reaching out. I would be happy to share more details and help you get started with our services.
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setReply(
                                `Hi ${
                                  (
                                    selectedMessage.author_name || "there"
                                  ).split(" ")[0]
                                }! Thanks so much for reaching out. I would be happy to share more details and help you get started with our services.`
                              )
                            }
                            className="rounded-lg border border-black/30 bg-[var(--panel-fill)] px-3 py-1.5 text-[9px] font-semibold text-[var(--fg)] transition hover:bg-[var(--panel-fill-2)] dark:border-white/20"
                          >
                            Use reply
                          </button>

                          <button
                            type="button"
                            className="text-[9px] font-medium text-[var(--fg-4)] hover:text-[var(--fg)]"
                          >
                            Improve
                          </button>

                          <button
                            type="button"
                            className="text-[9px] font-medium text-[var(--fg-4)] hover:text-[var(--fg)]"
                          >
                            Change tone
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* COMPOSER                                                    */}
              {/* ---------------------------------------------------------- */}

              {(selectedMessage.platform as string) !== "system" ? (
                <div className="border-t border-[var(--stroke)] bg-[var(--panel-fill)] p-4">
                  <div className="mx-auto max-w-[760px]">
                    {/* AUTOMATION NOTICE */}

                    <div className="mb-2 flex items-center gap-1.5 px-1">
                      <Bot className="h-3 w-3 text-[var(--fg-4)]" />

                      <span className="text-[9px] text-[var(--fg-4)]">
                        Auto-reply rules are active
                      </span>

                      <span className="text-[9px] text-[var(--fg-4)]">·</span>

                      <Link
                        href="/dashboard/automations"
                        className="text-[9px] font-semibold text-[var(--fg)] hover:underline"
                      >
                        Manage automation →
                      </Link>
                    </div>

                    {/* INPUT CONTAINER */}

                    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 transition focus-within:border-[var(--stroke-strong)]">
                      <textarea
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Write a reply..."
                        className="min-h-[60px] w-full resize-none bg-transparent px-1 py-1 text-[11px] leading-[1.6] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
                      />

                      <div className="mt-2 flex items-center justify-between border-t border-[var(--stroke)] pt-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--fg-4)] transition hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]"
                          >
                            <Smile className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--fg-4)] transition hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]"
                          >
                            <Paperclip className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setReply(
                                reply ||
                                  `Hi ${
                                    (
                                      selectedMessage.author_name || "there"
                                    ).split(" ")[0]
                                  }! Thanks for reaching out 🙌`
                              )
                            }
                            className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-lg border border-black/20 bg-black/5 px-2.5 text-[9px] font-semibold text-black transition hover:bg-black/10 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10"
                          >
                            <Sparkles className="h-3 w-3" />
                            AI Assist
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => sendReply(selectedMessage)}
                          disabled={!reply.trim()}
                          className="inline-flex h-8 items-center gap-2 rounded-xl bg-black px-4 text-[10px] font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
                        >
                          Send
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end border-t border-[var(--stroke)] bg-[var(--panel-fill)] p-4">
                  <button
                    type="button"
                    onClick={() => sendReply(selectedMessage)}
                    className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2 text-[10px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
                  >
                    Dismiss Notification
                  </button>
                </div>
              )}
            </>
          ) : (
            /* -------------------------------------------------------------- */
            /* NO CONVERSATION SELECTED                                      */
            /* -------------------------------------------------------------- */

            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-black bg-black text-white dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>

              <h3 className="font-display text-base font-bold text-[var(--fg)]">
                Select a conversation
              </h3>

              <p className="mt-1.5 max-w-xs text-[11px] leading-5 text-[var(--fg-4)]">
                Choose a message from your inbox to review and reply to your audience.
              </p>

              {filteredMessages.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    filteredMessages[0] &&
                    selectConversation(filteredMessages[0].id)
                  }
                  className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--fg)] transition hover:underline"
                >
                  Open first conversation
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </section>
      </GlassCard>
    </div>
  );
}