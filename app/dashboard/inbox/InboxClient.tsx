"use client";

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
  Plug,
  Bot,
  ChevronDown,
  CheckCheck,
  Clock,
  Flag,
  X,
  Filter,
  ArrowUpRight,
  Inbox as InboxIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { GlassCard, PageHeader, Pill } from "@/components/dashboard/ui";
import type { PlatformId } from "@/lib/social/platforms";
import type { SocialAccount, SocialInboxMessage } from "@/lib/social/types";

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
        bg: "var(--kora-pink-soft)",
        text: "var(--kora-pink)",
        border: "rgba(236, 22, 140, 0.25)",
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

  const [activeTab, setActiveTab] = useState<
    "all" | "messages" | "comments" | "mentions" | "dms"
  >("all");

  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    messages[0]?.id ?? null
  );
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [localReplies, setLocalReplies] = useState<Record<string, boolean>>({});
  const [sortNewest, setSortNewest] = useState(true);

  /* ---------------------------------------------------------------------- */
  /*                                FILTERING                               */
  /* ---------------------------------------------------------------------- */

  const filteredMessages = useMemo(() => {
    let result = [...messages];

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
  }, [messages, activeTab, selectedAccount, search, sortNewest]);

  const selectedMessage =
    filteredMessages.find((message) => message.id === selectedId) ??
    messages.find((message) => message.id === selectedId) ??
    filteredMessages[0] ??
    null;

  /* ---------------------------------------------------------------------- */
  /*                                  COUNTS                                */
  /* ---------------------------------------------------------------------- */

  const counts = useMemo(() => {
    return {
      all: messages.length,
      messages: messages.filter((m) =>
        m.kind?.toLowerCase().includes("message")
      ).length,
      comments: messages.filter((m) =>
        m.kind?.toLowerCase().includes("comment")
      ).length,
      mentions: messages.filter((m) =>
        m.kind?.toLowerCase().includes("mention")
      ).length,
      dms: messages.filter((m) => {
        const kind = m.kind?.toLowerCase() || "";
        return kind.includes("dm") || kind.includes("direct");
      }).length,
    };
  }, [messages]);

  /* ---------------------------------------------------------------------- */
  /*                                  REPLY                                 */
  /* ---------------------------------------------------------------------- */

  async function sendReply(message: SocialInboxMessage) {
    if ((message.platform as string) !== "system" && !reply.trim()) {
      return;
    }

    setLocalReplies((current) => ({
      ...current,
      [message.id]: true,
    }));

    const supabase = createClient();

    if ((message.platform as string) === "system") {
      await supabase
        .from("user_notifications")
        .update({
          is_read: true,
        })
        .eq("id", message.id);

      success("Notification dismissed");
    } else {
      await supabase
        .from("social_inbox")
        .update({
          replied: true,
          reply_body: reply,
          is_read: true,
        })
        .eq("id", message.id);

      success("Reply sent");
    }

    setReply("");
  }

  /* ---------------------------------------------------------------------- */
  /*                               EMPTY STATE                              */
  /* ---------------------------------------------------------------------- */

  if (!messages.length) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          eyebrow="Unified Inbox"
          title="Inbox"
          sub="Your audience is talking. Stay connected, respond, and build your community."
        />

        <GlassCard className="mt-6 flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] text-[var(--kora-pink)]">
            <MessageCircle className="h-7 w-7" />
          </div>

          <h2 className="mt-5 font-display text-xl font-bold text-[var(--fg)]">
            Your inbox is quiet
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--fg-3)]">
            Connect your social accounts to bring messages, comments, and
            mentions across all channels into one unified workspace.
          </p>

          <Link
            href="/dashboard/integrations"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--kora-pink)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-[0_8px_20px_rgba(236,22,140,0.3)]"
          >
            Connect an Account
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                  RENDER                                */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 pb-10">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] px-3 py-1 text-xs font-semibold text-[var(--kora-pink)]">
            <InboxIcon className="h-3.5 w-3.5" />
            <span>Unified Community Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--fg)]">
              Inbox
            </h1>
            {counts.all > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--kora-pink)] px-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(236,22,140,0.3)]">
                {counts.all}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-[var(--fg-3)]">
            Consolidate comments, DMs, and mentions across your connected platforms.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 transition focus-within:border-[var(--stroke-strong)] md:w-[320px]">
          <Search className="h-4 w-4 text-[var(--fg-4)]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search messages, users..."
            className="min-w-0 flex-1 bg-transparent text-xs text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="h-3.5 w-3.5 text-[var(--fg-4)] hover:text-[var(--fg)]" />
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap gap-2">
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
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                active
                  ? "border-[var(--kora-pink)] bg-[var(--kora-pink)] text-white shadow-[0_6px_16px_rgba(236,22,140,0.25)]"
                  : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[var(--panel-fill-2)] text-[var(--fg-4)]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN INBOX WORKSPACE */}
      <div className="grid min-h-[680px] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] xl:grid-cols-[340px_1fr]">
        {/* LEFT COLUMN - CONVERSATION LIST */}
        <aside className="flex flex-col border-b border-[var(--stroke)] xl:border-b-0 xl:border-r">
          {/* FILTERS HEADER */}
          <div className="flex items-center justify-between border-b border-[var(--stroke)] bg-[var(--panel-fill)] p-3.5">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1.5">
              <Filter className="h-3.5 w-3.5 text-[var(--fg-4)]" />
              <select
                value={selectedAccount}
                onChange={(event) => setSelectedAccount(event.target.value)}
                className="bg-transparent text-xs font-medium text-[var(--fg-2)] outline-none"
              >
                <option value="all" className="bg-[#181818] text-white">
                  All Platforms
                </option>
                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                    className="bg-[#181818] text-white"
                  >
                    {account.platform} ·{" "}
                    {account.handle || account.display_name || "Account"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSortNewest((value) => !value)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1.5 text-xs font-medium text-[var(--fg-3)] transition hover:text-[var(--fg)]"
            >
              <span>{sortNewest ? "Newest" : "Oldest"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* CONVERSATION LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--stroke)]">
            {filteredMessages.length === 0 ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <MessageCircle className="mb-2.5 h-7 w-7 text-[var(--fg-4)]" />
                <p className="text-sm font-semibold text-[var(--fg-2)]">
                  No conversations found
                </p>
                <p className="mt-1 text-xs text-[var(--fg-4)]">
                  Try changing your filters or search terms.
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const active = selectedMessage?.id === message.id;
                const Icon =
                  PLATFORM_ICONS[
                    message.platform as PlatformId | "system" | "tiktok"
                  ] || MessageCircle;
                const platformColor =
                  PLATFORM_COLORS[
                    message.platform as PlatformId | "system" | "tiktok"
                  ] || "#3b82f6";
                const unread = !message.is_read && !localReplies[message.id];
                const badge = getCategoryBadge(message.category);

                return (
                  <button
                    key={message.id}
                    onClick={() => setSelectedId(message.id)}
                    className={`relative flex w-full gap-3 p-4 text-left transition-colors ${
                      active
                        ? "bg-[var(--panel-fill-2)]"
                        : "hover:bg-[var(--panel-fill-2)]/50"
                    }`}
                  >
                    {/* ACTIVE ACCENT BAR */}
                    {active && (
                      <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[var(--kora-pink)]" />
                    )}

                    {/* PLATFORM ICON */}
                    <div
                      className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${platformColor}18`,
                        border: `1px solid ${platformColor}30`,
                        color: platformColor,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* TEXT PREVIEW */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`truncate text-xs ${
                            unread
                              ? "font-bold text-[var(--fg)]"
                              : "font-medium text-[var(--fg-2)]"
                          }`}
                        >
                          {message.author_name ||
                            message.author_handle ||
                            "Unknown"}
                        </p>
                        <span className="flex-shrink-0 text-[10px] text-[var(--fg-4)]">
                          {formatTime(message.received_at)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-[var(--fg-3)]">
                        {message.body}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2">
                        {message.category && (
                          <span
                            className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
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
                          <span className="h-2 w-2 rounded-full bg-[var(--kora-pink)] shadow-[0_0_8px_rgba(236,22,140,0.6)]" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN - CHAT VIEW */}
        <section className="flex flex-col bg-[var(--panel-fill)]">
          {selectedMessage ? (
            <>
              {/* CHAT HEADER */}
              <div className="flex items-center justify-between border-b border-[var(--stroke)] bg-[var(--panel-fill)] px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${
                        PLATFORM_COLORS[
                          selectedMessage.platform as
                            | PlatformId
                            | "system"
                            | "tiktok"
                        ] || "#3b82f6"
                      }18`,
                      border: `1px solid ${
                        PLATFORM_COLORS[
                          selectedMessage.platform as
                            | PlatformId
                            | "system"
                            | "tiktok"
                        ] || "#3b82f6"
                      }30`,
                      color:
                        PLATFORM_COLORS[
                          selectedMessage.platform as
                            | PlatformId
                            | "system"
                            | "tiktok"
                        ] || "#3b82f6",
                    }}
                  >
                    {(() => {
                      const Icon =
                        PLATFORM_ICONS[
                          selectedMessage.platform as
                            | PlatformId
                            | "system"
                            | "tiktok"
                        ] || MessageCircle;
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-sm font-bold text-[var(--fg)]">
                        {selectedMessage.author_name ||
                          selectedMessage.author_handle ||
                          "Unknown"}
                      </h2>
                      {!selectedMessage.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--kora-pink)]" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--fg-4)]">
                      {selectedMessage.author_handle
                        ? `@${selectedMessage.author_handle.replace("@", "")}`
                        : selectedMessage.platform}{" "}
                      · <span className="capitalize">{selectedMessage.kind}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1 text-xs text-[var(--fg-3)] sm:flex">
                    <Clock className="h-3.5 w-3.5 text-[var(--fg-4)]" />
                    <span>{formatTime(selectedMessage.received_at)}</span>
                  </div>

                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] transition hover:text-[var(--fg)]">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CHAT MESSAGES BODY */}
              <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[var(--stroke)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]">
                    Conversation
                  </span>
                  <div className="h-px flex-1 bg-[var(--stroke)]" />
                </div>

                <div className="mx-auto max-w-[760px] space-y-5">
                  {/* INCOMING MESSAGE */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-xs font-bold text-[var(--fg-2)]">
                      {initials(selectedMessage.author_name)}
                    </div>

                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-sm border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 shadow-sm">
                        <p className="text-xs leading-relaxed text-[var(--fg)]">
                          {selectedMessage.body}
                        </p>
                      </div>
                      <p className="mt-1 ml-1 text-[10px] text-[var(--fg-4)]">
                        {new Date(
                          selectedMessage.received_at
                        ).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* AI SUGGESTION BOX */}
                  {selectedMessage.category === "lead" && (
                    <div className="ml-11 max-w-[620px] rounded-2xl border border-[var(--kora-blue-soft)] bg-[var(--kora-blue-soft)] p-4">
                      <div className="mb-2.5 flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--kora-blue)] text-white">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-[var(--kora-blue)]">
                          AI Suggested Reply
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-[var(--fg-2)]">
                        Hi{" "}
                        {(selectedMessage.author_name || "there").split(" ")[0]}!
                        Thanks so much for reaching out. I would be happy to share
                        more details and help you get started with our services.
                      </p>

                      <button
                        onClick={() =>
                          setReply(
                            `Hi ${
                              (
                                selectedMessage.author_name || "there"
                              ).split(" ")[0]
                            }! Thanks so much for reaching out. I would be happy to share more details and help you get started with our services.`
                          )
                        }
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--kora-blue)]/30 bg-[var(--panel-fill)] px-3 py-1.5 text-xs font-semibold text-[var(--kora-blue)] transition hover:bg-[var(--panel-fill-2)]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Use Suggestion
                      </button>
                    </div>
                  )}

                  {/* OUTGOING REPLY */}
                  {(selectedMessage.replied ||
                    localReplies[selectedMessage.id]) &&
                    selectedMessage.reply_body && (
                      <div className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="rounded-2xl rounded-tr-sm bg-[var(--kora-pink)] p-4 text-white shadow-[0_6px_20px_rgba(236,22,140,0.25)]">
                            <p className="text-xs leading-relaxed">
                              {selectedMessage.reply_body}
                            </p>
                          </div>

                          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-[var(--fg-4)]">
                            <span>Delivered</span>
                            <CheckCheck className="h-3.5 w-3.5 text-[var(--kora-pink)]" />
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* COMPOSER / ACTION FOOTER */}
              {(selectedMessage.platform as string) !== "system" ? (
                <div className="border-t border-[var(--stroke)] bg-[var(--panel-fill)] p-4">
                  <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 focus-within:border-[var(--stroke-strong)]">
                    <textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Type your response..."
                      className="min-h-[70px] w-full resize-none bg-transparent px-1 text-xs leading-relaxed text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
                    />

                    <div className="mt-2 flex items-center justify-between border-t border-[var(--stroke)] pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-4)] transition hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]">
                          <Smile className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-4)] transition hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]">
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
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
                          className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--kora-pink)] transition hover:opacity-90"
                        >
                          <Sparkles className="h-3 w-3" />
                          AI Assist
                        </button>
                      </div>

                      <button
                        onClick={() => sendReply(selectedMessage)}
                        disabled={!reply.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[var(--kora-pink)] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 shadow-[0_4px_16px_rgba(236,22,140,0.3)]"
                      >
                        Send
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end border-t border-[var(--stroke)] bg-[var(--panel-fill)] p-4">
                  <button
                    onClick={() => sendReply(selectedMessage)}
                    className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 py-2 text-xs font-semibold text-[var(--fg-2)] transition hover:border-[var(--stroke-strong)] hover:text-[var(--fg)]"
                  >
                    Dismiss Notification
                  </button>
                </div>
              )}
            </>
          ) : (
            /* NO CONVERSATION SELECTED */
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--kora-pink-soft)] bg-[var(--kora-pink-soft)] text-[var(--kora-pink)]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-[var(--fg)]">
                Select a conversation
              </h3>
              <p className="mt-1 max-w-xs text-xs text-[var(--fg-4)]">
                Choose a message from your inbox to review and reply to your audience.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
