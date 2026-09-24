"use client";

// Existing Inbox data, filtering, selection, and reply logic retained.
// UI-only redesign for unified inbox

import {
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
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
  Filter,
  ArrowUpRight,
  Inbox as InboxIcon,
  MessageSquare,
  CircleUserRound,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";
import type { PlatformId } from "@/lib/social/platforms";
import type {
  SocialAccount,
  SocialInboxMessage,
} from "@/lib/social/types";

/* -------------------------------------------------------------------------- */
/*                                  PLATFORMS                                 */
/* -------------------------------------------------------------------------- */

type IconProps = {
  className?: string;
  style?: CSSProperties;
};

const PLATFORM_ICONS: Record<
  PlatformId | "system" | "tiktok",
  ComponentType<IconProps>
> = {
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

const PLATFORM_COLORS: Record<
  PlatformId | "system" | "tiktok",
  string
> = {
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

/* -------------------------------------------------------------------------- */
/*                              PLATFORM HELPERS                              */
/* -------------------------------------------------------------------------- */

function getPlatformIcon(platform: string | null | undefined) {
  return (
    PLATFORM_ICONS[
      platform as PlatformId | "system" | "tiktok"
    ] || MessageCircle
  );
}

function getPlatformColor(platform: string | null | undefined) {
  return (
    PLATFORM_COLORS[
      platform as PlatformId | "system" | "tiktok"
    ] || "var(--brand-primary)"
  );
}

function getAccountName(account: SocialAccount) {
  return account.handle || account.display_name || "Connected account";
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

  const [messagesList, setMessagesList] =
    useState<SocialInboxMessage[]>(messages);

  const connectedCount = accounts.length;

  const [activeTab, setActiveTab] = useState<
    "all" | "messages" | "comments" | "mentions" | "dms"
  >("all");

  const [selectedAccount, setSelectedAccount] =
    useState<string>("all");

  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.id ?? null
  );

  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<
    Record<string, string>
  >({});
  const [sortNewest, setSortNewest] = useState(true);

  /* ---------------------------------------------------------------------- */
  /*                                COUNTS                                  */
  /* ---------------------------------------------------------------------- */

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
        (m.kind || "").toLowerCase().includes("mention")
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
        (message) =>
          !message.is_read && !localReplies[message.id]
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

  /* ---------------------------------------------------------------------- */
  /*                                FILTERING                               */
  /* ---------------------------------------------------------------------- */

  const filteredMessages = useMemo(() => {
    let result = [...messagesList];

    if (selectedAccount !== "all") {
      result = result.filter(
        (message) => message.account_id === selectedAccount
      );
    }

    if (activeTab !== "all") {
      result = result.filter((message) => {
        const kind = message.kind?.toLowerCase() || "";

        if (activeTab === "messages") {
          return kind.includes("message") || kind.includes("dm");
        }

        if (activeTab === "comments") {
          return kind.includes("comment");
        }

        if (activeTab === "mentions") {
          return kind.includes("mention");
        }

        if (activeTab === "dms") {
          return kind.includes("dm") || kind.includes("direct");
        }

        return true;
      });
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((message) => {
        return (
          message.author_name?.toLowerCase().includes(query) ||
          message.author_handle?.toLowerCase().includes(query) ||
          message.body?.toLowerCase().includes(query)
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
    search,
    sortNewest,
  ]);

  const selectedMessage = useMemo(
    () =>
      messagesList.find((m) => m.id === selectedId) || null,
    [messagesList, selectedId]
  );

  /* ---------------------------------------------------------------------- */
  /*                               ACTIONS                                  */
  /* ---------------------------------------------------------------------- */

  const sendReply = async (message: SocialInboxMessage) => {
    if (!reply.trim()) return;

    const currentReply = reply;

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

    setReply("");

    success(
      "Reply sent",
      "Your response has been sent to the user."
    );
  };

  /* ---------------------------------------------------------------------- */
  /*                                EMPTY STATE                             */
  /* ---------------------------------------------------------------------- */

  if (connectedCount === 0 && messagesList.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1500px] pb-10">
        <div className="mb-6">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
            Unified Inbox
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
            Inbox
          </h1>

          <p className="mt-1 text-xs text-[var(--fg-3)]">
            Your audience is talking. Stay connected, respond,
            and build your community.
          </p>
        </div>

        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
            <MessageCircle className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[var(--fg)]">
            Your inbox is quiet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--fg-3)]">
            Connect your social accounts to bring messages,
            comments, and mentions across all channels into one
            unified workspace.
          </p>

          <Link
            href="/dashboard/integrations"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Connect an Account
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                  RENDER                                */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mx-auto w-full max-w-[1600px] pb-8">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">
            Community
          </p>

          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
              Inbox
            </h1>

            {counts.all > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1.5 text-[9px] font-bold text-white">
                {counts.all}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-[var(--fg-3)]">
            Stay on top of comments, messages and mentions across
            your social channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 text-[11px] font-medium text-[var(--fg-2)] transition hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SUMMARY BAR                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--stroke)] sm:grid-cols-3 md:grid-cols-5">
        <div className="flex items-center gap-2.5 bg-[var(--panel-fill)] px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="text-sm font-bold text-[var(--fg)]">
            {counts.all}
          </span>
          <span className="text-[11px] text-[var(--fg-3)]">
            Total
          </span>
        </div>

        <div className="flex items-center gap-2.5 bg-[var(--panel-fill)] px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="text-sm font-bold text-[var(--fg)]">
            {unreadCount}
          </span>
          <span className="text-[11px] text-[var(--fg-3)]">
            Unread
          </span>
        </div>

        <div className="flex items-center gap-2.5 bg-[var(--panel-fill)] px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="text-sm font-bold text-[var(--fg)]">
            {needsReplyCount}
          </span>
          <span className="text-[11px] text-[var(--fg-3)]">
            Needs Reply
          </span>
        </div>

        <div className="flex items-center gap-2.5 bg-[var(--panel-fill)] px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="text-sm font-bold text-[var(--fg)]">
            {counts.mentions}
          </span>
          <span className="text-[11px] text-[var(--fg-3)]">
            Mentions
          </span>
        </div>

        <div className="col-span-2 flex items-center gap-2.5 bg-[var(--panel-fill)] px-3.5 py-2.5 sm:col-span-1 sm:px-4 sm:py-3">
          <span className="text-sm font-bold text-[var(--fg)]">
            {accounts.length}
          </span>
          <span className="text-[11px] text-[var(--fg-3)]">
            Channels
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE CATEGORY TABS (lg:hidden)                                  */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:hidden">
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
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                  : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`rounded px-1 text-[9px] font-bold ${
                    active
                      ? "bg-[var(--brand-primary)] text-white"
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
      {/* MAIN THREE-COLUMN INBOX                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid min-h-[720px] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] lg:grid-cols-[155px_300px_minmax(0,1fr)]">
        {/* ================================================================ */}
        {/* LEFT SIDEBAR                                                     */}
        {/* ================================================================ */}

        <aside className="hidden border-r border-[var(--stroke)] bg-[var(--panel-fill)] lg:flex lg:flex-col">
          <div className="border-b border-[var(--stroke)] px-3 py-4">
            <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
              Inbox
            </div>

            <div className="space-y-0.5">
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
                    onClick={() =>
                      setActiveTab(
                        item.id as typeof activeTab
                      )
                    }
                    className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition ${
                      active
                        ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                        : "text-[var(--fg-2)] hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          active
                            ? "text-[var(--brand-primary)]"
                            : "text-[var(--fg-4)]"
                        }`}
                      />

                      <span className="truncate text-[10px] font-medium">
                        {item.label}
                      </span>
                    </span>

                    {item.count > 0 && (
                      <span
                        className={`text-[9px] font-semibold ${
                          active
                            ? "text-[var(--brand-primary)]"
                            : "text-[var(--fg-4)]"
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
            <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
              Channels
            </div>

            <div className="space-y-0.5">
              {accounts.length === 0 ? (
                <div className="px-2 py-2 text-[10px] text-[var(--fg-4)]">
                  No connected accounts
                </div>
              ) : (
                accounts.map((account) => {
                  const Icon = getPlatformIcon(account.platform);
                  const color = getPlatformColor(
                    account.platform
                  );

                  const active =
                    selectedAccount === account.id;

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() =>
                        setSelectedAccount(
                          active ? "all" : account.id
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                        active
                          ? "bg-[var(--panel-fill-2)]"
                          : "hover:bg-[var(--panel-fill-2)]"
                      }`}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          color,
                          backgroundColor: `${color}16`,
                        }}
                      >
                        <Icon className="h-2.5 w-2.5" />
                      </span>

                      <span className="min-w-0 truncate text-[10px] font-medium text-[var(--fg-2)]">
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

          <div className="border-b border-[var(--stroke)] p-3">
            <div className="flex h-9 items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 transition focus-within:border-[var(--brand-primary-border)]">
              <Search className="h-3.5 w-3.5 shrink-0 text-[var(--fg-4)]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search messages, people or keywords..."
                className="min-w-0 flex-1 bg-transparent text-[10px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
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

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)]">
                {[
                  {
                    id: "all",
                    label: "All",
                  },
                  {
                    id: "messages",
                    label: "Unread",
                  },
                  {
                    id: "comments",
                    label: "Needs Reply",
                  },
                ].map((item, index) => {
                  const active =
                    index === 0
                      ? activeTab === "all"
                      : index === 1
                        ? unreadCount > 0
                        : needsReplyCount > 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (index === 0) {
                          setActiveTab("all");
                        } else if (index === 1) {
                          setActiveTab("messages");
                        } else {
                          setActiveTab("messages");
                        }
                      }}
                      className={`whitespace-nowrap px-2.5 py-1.5 text-[8px] font-semibold transition ${
                        active
                          ? "bg-[var(--brand-primary)] text-white"
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
                onClick={() =>
                  setSortNewest((value) => !value)
                }
                className="flex h-7 shrink-0 items-center gap-1 rounded-lg border border-[var(--stroke)] px-2 text-[9px] font-medium text-[var(--fg-3)] hover:text-[var(--fg)]"
              >
                <SlidersHorizontal className="h-3 w-3" />
                {sortNewest ? "Newest" : "Oldest"}
              </button>
            </div>
          </div>

          {/* LIST HEADER */}

          <div className="flex items-center justify-between border-b border-[var(--stroke)] px-3 py-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-4)]">
              Conversations
            </span>

            <span className="text-[9px] text-[var(--fg-4)]">
              {filteredMessages.length}
            </span>
          </div>

          {/* CONVERSATIONS */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex h-full min-h-[350px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--panel-fill-2)] text-[var(--fg-4)]">
                  <MessageCircle className="h-4 w-4" />
                </div>

                <p className="text-xs font-semibold text-[var(--fg-2)]">
                  No conversations found
                </p>

                <p className="mt-1 max-w-[190px] text-[9px] leading-4 text-[var(--fg-4)]">
                  Try changing your filters or search terms.
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const active =
                  selectedMessage?.id === message.id;

                const Icon = getPlatformIcon(
                  message.platform
                );

                const platformColor = getPlatformColor(
                  message.platform
                );

                const unread =
                  !message.is_read &&
                  !localReplies[message.id];

                const badge = getCategoryBadge(
                  message.category
                );

                return (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() =>
                      setSelectedId(message.id)
                    }
                    className={`relative flex w-full gap-2.5 border-b border-[var(--stroke)] px-3 py-3 text-left transition ${
                      active
                        ? "bg-[var(--brand-primary-soft)]"
                        : "hover:bg-[var(--panel-fill-2)]"
                    }`}
                  >
                    {/* ACTIVE BAR */}

                    {active && (
                      <span className="absolute inset-y-0 left-0 w-0.5 bg-[var(--brand-primary)]" />
                    )}

                    {/* AVATAR */}

                    <div className="relative shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[9px] font-bold text-[var(--fg-2)]">
                        {initials(
                          message.author_name ||
                            message.author_handle
                        )}
                      </div>

                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--panel-fill)]"
                        style={{
                          color: platformColor,
                          backgroundColor: `${platformColor}20`,
                        }}
                      >
                        <Icon className="h-1.5 w-1.5" />
                      </span>
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`truncate text-[10px] ${
                            unread
                              ? "font-bold text-[var(--fg)]"
                              : "font-semibold text-[var(--fg-2)]"
                          }`}
                        >
                          {message.author_name ||
                            message.author_handle ||
                            "Unknown"}
                        </p>

                        <span className="shrink-0 text-[8px] text-[var(--fg-4)]">
                          {formatTime(
                            message.received_at
                          )}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-[9px] text-[var(--fg-3)]">
                        {message.body}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        {message.category && (
                          <span
                            className="rounded px-1.5 py-0.5 text-[7px] font-semibold"
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {categoryLabel(
                              message.category
                            )}
                          </span>
                        )}

                        {unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
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
        {/* RIGHT CONVERSATION                                               */}
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

              <div className="flex min-h-[64px] items-center justify-between border-b border-[var(--stroke)] px-3 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="flex h-8 items-center gap-1 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2 text-[10px] font-semibold text-[var(--fg-2)] transition hover:text-[var(--fg)] lg:hidden"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[10px] font-bold text-[var(--fg-2)]">
                      {initials(
                        selectedMessage.author_name ||
                          selectedMessage.author_handle
                      )}
                    </div>

                    <span
                      className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[var(--panel-fill)]"
                      style={{
                        color: getPlatformColor(
                          selectedMessage.platform
                        ),
                        backgroundColor: `${getPlatformColor(
                          selectedMessage.platform
                        )}20`,
                      }}
                    >
                      {(() => {
                        const Icon = getPlatformIcon(
                          selectedMessage.platform
                        );

                        return (
                          <Icon className="h-2 w-2" />
                        );
                      })()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-xs font-semibold text-[var(--fg)]">
                        {selectedMessage.author_name ||
                          selectedMessage.author_handle ||
                          "Unknown"}
                      </h2>

                      {!selectedMessage.is_read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-[9px] text-[var(--fg-4)]">
                      {selectedMessage.author_handle
                        ? `@${selectedMessage.author_handle.replace(
                            "@",
                            ""
                          )}`
                        : selectedMessage.platform}{" "}
                      ·{" "}
                      <span className="capitalize">
                        {selectedMessage.kind}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="hidden items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2 py-1.5 text-[8px] text-[var(--fg-4)] md:flex">
                    <Clock className="h-3 w-3" />
                    {formatTime(
                      selectedMessage.received_at
                    )}
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

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mx-auto max-w-[720px]">
                  {/* POST CONTEXT */}

                  <div className="mb-6 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--panel-fill)] text-[var(--fg-4)]">
                        {(() => {
                          const Icon = getPlatformIcon(
                            selectedMessage.platform
                          );

                          return (
                            <Icon className="h-4 w-4" />
                          );
                        })()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-semibold text-[var(--fg)]">
                          {categoryLabel(
                            selectedMessage.kind
                          )}{" "}
                          conversation
                        </p>

                        <p className="mt-0.5 truncate text-[8px] text-[var(--fg-4)]">
                          {selectedMessage.platform
                            ? `${selectedMessage.platform} interaction`
                            : "Social interaction"}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="shrink-0 text-[8px] font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        View post
                      </button>
                    </div>
                  </div>

                  {/* DATE */}

                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[var(--stroke)]" />

                    <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
                      Conversation
                    </span>

                    <div className="h-px flex-1 bg-[var(--stroke)]" />
                  </div>

                  <div className="space-y-5">
                    {/* INCOMING MESSAGE */}

                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[8px] font-bold text-[var(--fg-2)]">
                        {initials(
                          selectedMessage.author_name
                        )}
                      </div>

                      <div className="max-w-[78%]">
                        <div className="rounded-xl rounded-tl-sm border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3.5 py-3">
                          <p className="text-[10px] leading-[1.65] text-[var(--fg)]">
                            {selectedMessage.body}
                          </p>
                        </div>

                        <div className="mt-1 flex items-center gap-2 px-1">
                          <span className="text-[8px] text-[var(--fg-4)]">
                            {new Date(
                              selectedMessage.received_at
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>

                          {selectedMessage.category && (
                            <>
                              <span className="text-[8px] text-[var(--fg-4)]">
                                ·
                              </span>

                              <span
                                className="text-[8px] font-medium"
                                style={{
                                  color: getCategoryBadge(
                                    selectedMessage.category
                                  ).text,
                                }}
                              >
                                {categoryLabel(
                                  selectedMessage.category
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SENT REPLY */}

                    {(selectedMessage.replied ||
                      localReplies[selectedMessage.id]) &&
                      selectedMessage.reply_body && (
                        <div className="flex justify-end">
                          <div className="max-w-[78%]">
                            <div className="rounded-xl rounded-tr-sm bg-[var(--brand-primary)] px-3.5 py-3 text-white">
                              <p className="text-[10px] leading-[1.65]">
                                {selectedMessage.reply_body}
                              </p>
                            </div>

                            <div className="mt-1 flex items-center justify-end gap-1.5 px-1 text-[8px] text-[var(--fg-4)]">
                              <span>Sent</span>

                              <CheckCheck className="h-3 w-3 text-[var(--brand-primary)]" />
                            </div>
                          </div>
                        </div>
                      )}

                    {/* AI SUGGESTION */}

                    {selectedMessage.category === "lead" && (
                      <div className="ml-9 rounded-xl border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] p-3.5">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white">
                            <Bot className="h-3 w-3" />
                          </div>

                          <div>
                            <p className="text-[9px] font-semibold text-[var(--brand-primary)]">
                              Kora AI · Suggested reply
                            </p>

                            <p className="text-[7px] text-[var(--fg-4)]">
                              Generated from this conversation
                            </p>
                          </div>
                        </div>

                        <p className="text-[9px] leading-[1.65] text-[var(--fg-2)]">
                          Hi{" "}
                          {(
                            selectedMessage.author_name ||
                            "there"
                          ).split(" ")[0]}
                          ! Thanks so much for reaching
                          out. I would be happy to share
                          more details and help you get
                          started with our services.
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setReply(
                                `Hi ${
                                  (
                                    selectedMessage.author_name ||
                                    "there"
                                  ).split(" ")[0]
                                }! Thanks so much for reaching out. I would be happy to share more details and help you get started with our services.`
                              )
                            }
                            className="rounded-lg border border-[var(--brand-primary-border)] bg-[var(--panel-fill)] px-2.5 py-1.5 text-[8px] font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--panel-fill-2)]"
                          >
                            Use reply
                          </button>

                          <button
                            type="button"
                            className="text-[8px] font-medium text-[var(--fg-4)] hover:text-[var(--fg)]"
                          >
                            Improve
                          </button>

                          <button
                            type="button"
                            className="text-[8px] font-medium text-[var(--fg-4)] hover:text-[var(--fg)]"
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

              {(selectedMessage.platform as string) !==
              "system" ? (
                <div className="border-t border-[var(--stroke)] bg-[var(--panel-fill)] p-3.5 sm:p-4">
                  <div className="mx-auto max-w-[720px]">
                    {/* AUTOMATION NOTICE */}

                    <div className="mb-2 flex items-center gap-1.5 px-1">
                      <Bot className="h-3 w-3 text-[var(--fg-4)]" />

                      <span className="text-[8px] text-[var(--fg-4)]">
                        Auto-reply rules are active
                      </span>

                      <span className="text-[8px] text-[var(--fg-4)]">
                        ·
                      </span>

                      <button
                        type="button"
                        className="text-[8px] font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        Manage automation →
                      </button>
                    </div>

                    {/* INPUT */}

                    <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-2.5 transition focus-within:border-[var(--brand-primary-border)]">
                      <textarea
                        value={reply}
                        onChange={(event) =>
                          setReply(event.target.value)
                        }
                        placeholder="Write a reply..."
                        className="min-h-[52px] w-full resize-none bg-transparent px-1 py-1 text-[10px] leading-[1.6] text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
                      />

                      <div className="mt-2 flex items-center justify-between border-t border-[var(--stroke)] pt-2">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--fg-4)] transition hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]"
                          >
                            <Smile className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--fg-4)] transition hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setReply(
                                reply ||
                                  `Hi ${
                                    (
                                      selectedMessage.author_name ||
                                      "there"
                                    ).split(" ")[0]
                                  }! Thanks for reaching out 🙌`
                              )
                            }
                            className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] px-2.5 text-[8px] font-semibold text-[var(--brand-primary)] transition hover:opacity-80"
                          >
                            <Sparkles className="h-3 w-3" />
                            AI Assist
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            sendReply(selectedMessage)
                          }
                          disabled={!reply.trim()}
                          className="inline-flex h-8 items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-3.5 text-[9px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
                    onClick={() =>
                      sendReply(selectedMessage)
                    }
                    className="rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2 text-[9px] font-semibold text-[var(--fg-2)] transition hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
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
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
                <MessageCircle className="h-5 w-5" />
              </div>

              <h3 className="text-sm font-semibold text-[var(--fg)]">
                Select a conversation
              </h3>

              <p className="mt-1 max-w-xs text-[10px] leading-5 text-[var(--fg-4)]">
                Choose a message from your inbox to review
                and reply to your audience.
              </p>

              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-semibold text-[var(--brand-primary)]"
              >
                Open first conversation
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}