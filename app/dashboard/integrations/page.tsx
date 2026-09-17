"use client";
import { createClient } from "@/lib/supabase/client";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";



import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Play,
  AtSign,
  Building2,
  Users,
  Hash,
  Ghost,
  MessagesSquare,
  Send,
  MessageCircle,
  Check,
  Plug,
  Loader2,
  X,
  KeyRound,
  CalendarDays,
  LineChart,
  Table,
  FileText,
  Mail,
  Zap,
  Webhook,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Link2,
  Settings2,
  Plus,
  CircleCheck,
  CircleAlert,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

import {
  PLATFORM_LIST,
  CAPABILITY_LABEL,
  type PlatformId,
  type PlatformDef,
} from "@/lib/social/platforms";

import {
  TOOL_LIST,
  type ToolId,
  type ToolDef,
} from "@/lib/social/tools";

import type { SocialAccount } from "@/lib/social/types";

/* -------------------------------------------------------------------------- */
/* Brand                                                                       */
/* -------------------------------------------------------------------------- */

const BRAND = {
  pink: "#ff0a8a",
  pinkSoft: "#ff3ca6",
  blue: "#2f80ff",
  blueSoft: "#5c9dff",
  bg: "#121212",
  panel: "#181818",
  panel2: "#1d1d1d",
  stroke: "#2b2b2b",
  muted: "#777777",
  text: "#f5f5f5",
  text2: "#b4b4b4",
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

const ICONS: Record<
  PlatformId,
  React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  instagram: Camera,
  youtube: Play,
  x: AtSign,
  linkedin: Building2,
  facebook: Users,
  threads: Hash,
  snapchat: Ghost,
  reddit: MessagesSquare,
  telegram: Send,
  whatsapp: MessageCircle,
};

const TOOL_ICONS: Record<
  ToolId,
  React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  google_calendar: CalendarDays,
  google_analytics: LineChart,
  google_sheets: Table,
  slack: MessagesSquare,
  notion: FileText,
  discord: MessageCircle,
  mailchimp: Mail,
  zapier: Zap,
  webhook: Webhook,
};

/* -------------------------------------------------------------------------- */
/* Small UI helpers                                                            */
/* -------------------------------------------------------------------------- */

function SectionLabel({
  children,
  count,
}: {
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff0a8a]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#777]">
          {children}
        </span>
        {typeof count === "number" && (
          <span className="rounded-full border border-[#2b2b2b] bg-[#181818] px-2 py-0.5 text-[10px] text-[#888]">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  connected,
  comingSoon,
}: {
  connected?: boolean;
  comingSoon?: boolean;
}) {
  if (comingSoon) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#1b1b1b] px-2.5 py-1 text-[10px] font-medium text-[#888]">
        <Lock className="h-3 w-3" />
        Coming soon
      </span>
    );
  }

  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#124b32] bg-[#10261c] px-2.5 py-1 text-[10px] font-medium text-[#52dc91]">
        <CircleCheck className="h-3 w-3" />
        Connected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#181818] px-2.5 py-1 text-[10px] font-medium text-[#8a8a8a]">
      Available
    </span>
  );
}

function CapabilityTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-[#292929] bg-[#171717] px-2 py-1 text-[10px] text-[#858585]">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

export default function IntegrationsPage() {
  const supabase = createClient();
  const { success, error: toastError } = useToast();

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [tools, setTools] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<"social" | "tools">(
    "social"
  );

  const [tokenFor, setTokenFor] = useState<PlatformDef | null>(null);
  const [tokenVal, setTokenVal] = useState("");

  const [oauthFor, setOauthFor] = useState<PlatformDef | null>(null);
  const [oauthHandle, setOauthHandle] = useState("");

  const [keyFor, setKeyFor] = useState<ToolDef | null>(null);
  const [keyVal, setKeyVal] = useState("");

  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------------ */
  /* Load                                                                      */
  /* ------------------------------------------------------------------------ */

  const load = async () => {
    setLoading(true);

    try {
      const session = await auth();
        const user = session?.user;

      if (!user) return;

      setUserId(user.id);

      const [{ data: accts }, { data: ints }] = await Promise.all([
        supabase
          .from("social_accounts")
          .select("id, user_id, platform, account_type, external_id, handle, display_name, avatar_url, scopes, status, followers, following, runs_ads, connected_at, last_synced_at, meta")
          .eq("user_id", user.id)
          .order("connected_at", { ascending: false }),

        supabase
          .from("integrations")
          .select("provider, account_label, status")
          .eq("status", "connected"),
      ]);

      if (accts) {
        setAccounts(accts as SocialAccount[]);
      }

      if (ints) {
        setTools(
          Object.fromEntries(
            ints.map((i: any) => [
              i.provider,
              i.account_label ?? "Connected",
            ])
          )
        );
      }
    } catch {
      // Keep the UI usable if the request fails.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* OAuth redirect feedback                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);

    const connected = sp.get("connected");
    const err = sp.get("error");

    if (connected) {
      success(`${connected} connected`);
    } else if (err) {
      const map: Record<string, string> = {
        not_configured:
          "This platform isn't configured yet — add its API keys.",
        denied: "Connection was cancelled.",
        bad_state: "Session expired. Please try again.",
        token_failed: "The platform rejected the token exchange.",
        store_failed: "Couldn't save the account.",
        unsupported: "That platform isn't available.",
        exchange_error: "Couldn't reach the platform.",
      };

      toastError(
        "Couldn't connect",
        map[err] ?? err
      );
    }

    if (connected || err) {
      window.history.replaceState(
        {},
        "",
        "/dashboard/integrations"
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Derived                                                                    */
  /* ------------------------------------------------------------------------ */

  const accountsFor = (id: PlatformId) =>
    accounts.filter((a) => a.platform === id);

  const connectedPlatforms = useMemo(() => {
    return new Set(accounts.map((a) => a.platform));
  }, [accounts]);

  const connectedCount = accounts.length;

  const toolsConnectedCount = Object.keys(tools).length;

  const publishingPlatforms = PLATFORM_LIST.filter(
    (p) => p.category === "Publishing"
  );

  const messagingPlatforms = PLATFORM_LIST.filter(
    (p) => p.category === "Messaging"
  );

  /* ------------------------------------------------------------------------ */
  /* Social connections                                                        */
  /* ------------------------------------------------------------------------ */

  const connectOAuth = (p: PlatformDef) => {
    if (p.id === "instagram") {
      setOauthFor(p);
      setOauthHandle("");
      return;
    }

    window.location.href = `/api/social/connect/${p.id}`;
  };

  const proceedOAuth = () => {
    if (!oauthFor) return;

    const url = new URL(
      `/api/social/connect/${oauthFor.id}`,
      window.location.origin
    );

    if (oauthHandle.trim()) {
      url.searchParams.set(
        "handle",
        oauthHandle.trim()
      );
    }

    window.location.href = url.toString();
  };

  const connectToken = async () => {
    if (!tokenFor || !tokenVal.trim()) return;

    setBusy(tokenFor.id);

    try {
      const res = await fetch(
        `/api/social/connect/${tokenFor.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: tokenVal.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Connection failed"
        );
      }

      success(`${tokenFor.name} connected`);

      setTokenFor(null);
      setTokenVal("");

      await load();
    } catch (e) {
      toastError(
        "Couldn't connect",
        e instanceof Error
          ? e.message
          : undefined
      );
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (acc: SocialAccount) => {
    setAccounts((prev) =>
      prev.filter((a) => a.id !== acc.id)
    );

    if (!userId) return;

    try {
      const { error } = await supabase
        .from("social_accounts")
        .delete()
        .eq("id", acc.id);

      if (error) {
        toastError(
          "Couldn't disconnect",
          error.message
        );

        await load();
        return;
      }

      success("Account disconnected");
    } catch {
      await load();
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Tools                                                                      */
  /* ------------------------------------------------------------------------ */

  const connectTool = (t: ToolDef) => {
    if (t.connectType === "oauth") {
      window.location.href = `/api/tools/connect/${t.id}`;
      return;
    }

    setKeyFor(t);
    setKeyVal("");
  };

  const submitKey = async () => {
    if (!keyFor || !keyVal.trim()) return;

    setBusy(keyFor.id);

    try {
      const res = await fetch(
        `/api/tools/connect/${keyFor.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: keyVal.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Connection failed"
        );
      }

      success(`${keyFor.name} connected`);

      setKeyFor(null);
      setKeyVal("");

      await load();
    } catch (e) {
      toastError(
        "Couldn't connect",
        e instanceof Error
          ? e.message
          : undefined
      );
    } finally {
      setBusy(null);
    }
  };

  const disconnectTool = async (t: ToolDef) => {
    setTools((prev) => {
      const next = { ...prev };
      delete next[t.id];
      return next;
    });

    try {
      await fetch(
        `/api/tools/connect/${t.id}`,
        {
          method: "DELETE",
        }
      );

      success(`${t.name} disconnected`);
    } catch {
      await load();
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Card                                                                       */
  /* ------------------------------------------------------------------------ */

  const SocialCard = ({
    platform,
  }: {
    platform: PlatformDef;
  }) => {
    const Icon = ICONS[platform.id];

    const isComingSoon = [
      "linkedin",
      "snapchat",
      "reddit",
      "whatsapp",
    ].includes(platform.id);

    const connected = accountsFor(platform.id);

    return (
      <div
        className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: BRAND.panel,
          borderColor:
            connected.length > 0
              ? "#3b1740"
              : BRAND.stroke,
        }}
      >
        {/* top accent */}
        <div
          className="absolute left-0 right-0 top-0 h-[2px] opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            backgroundColor:
              platform.color,
          }}
        />

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border"
              style={{
                background: `color-mix(in srgb, ${platform.color} 10%, #181818)`,
                borderColor: `color-mix(in srgb, ${platform.color} 25%, #2b2b2b)`,
              }}
            >
              {Icon && (
                <Icon
                  className="h-5 w-5"
                  style={{
                    color: platform.color,
                  }}
                />
              )}
            </div>

            <StatusBadge
              connected={connected.length > 0}
              comingSoon={isComingSoon}
            />
          </div>

          <div className="mt-5">
            <h3 className="text-[15px] font-semibold text-[#f5f5f5]">
              {platform.name}
            </h3>

            <p className="mt-1 text-[12px] leading-relaxed text-[#777]">
              {platform.note ||
                "Connect your account to unlock Koraspace automation."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {platform.capabilities
              .slice(0, 4)
              .map((capability) => (
                <CapabilityTag key={capability}>
                  {CAPABILITY_LABEL[capability]}
                </CapabilityTag>
              ))}
          </div>
        </div>

        <div className="mt-auto border-t border-[#292929]">
          {connected.length > 0 && (
            <div className="space-y-2 p-4">
              {connected.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#151515] px-3 py-2.5"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${platform.color}18`,
                    }}
                  >
                    {Icon && (
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{
                          color: platform.color,
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-[#ddd]">
                      {account.handle ||
                        account.display_name ||
                        account.external_id ||
                        "Connected account"}
                    </p>

                    <p className="text-[10px] text-[#666]">
                      Active connection
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      disconnect(account)
                    }
                    className="rounded-lg p-1.5 text-[#666] transition-colors hover:bg-[#242424] hover:text-[#ff4b4b]"
                    title="Disconnect"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 pt-0">
            <button
              type="button"
              onClick={() => {
                if (isComingSoon) return;

                if (
                  platform.connectType === "oauth"
                ) {
                  connectOAuth(platform);
                } else {
                  setTokenFor(platform);
                }
              }}
              disabled={
                isComingSoon ||
                busy === platform.id
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[12px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
              style={
                isComingSoon
                  ? {
                      borderColor: "#2b2b2b",
                      backgroundColor: "#191919",
                      color: "#777",
                    }
                  : connected.length > 0
                  ? {
                      borderColor: "#353535",
                      backgroundColor: "#202020",
                      color: "#eee",
                    }
                  : {
                      borderColor: BRAND.pink,
                      backgroundColor: BRAND.pink,
                      color: "#fff",
                    }
              }
            >
              {busy === platform.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isComingSoon ? (
                <Lock className="h-3.5 w-3.5" />
              ) : connected.length > 0 ? (
                <Plus className="h-3.5 w-3.5" />
              ) : (
                <Plug className="h-3.5 w-3.5" />
              )}

              {isComingSoon
                ? "Coming soon"
                : connected.length > 0
                ? "Connect another"
                : "Connect account"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Tool card                                                                  */
  /* ------------------------------------------------------------------------ */

  const ToolCard = ({
    tool,
  }: {
    tool: ToolDef;
  }) => {
    const Icon = TOOL_ICONS[tool.id];
    const connected = !!tools[tool.id];

    // Keep your current product decision:
    // tools are displayed as coming soon.
    const isComingSoon = true;

    return (
      <div
        className="group relative flex min-h-[270px] flex-col rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: BRAND.panel,
          borderColor: BRAND.stroke,
        }}
      >
        <div className="flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl border"
            style={{
              background: `color-mix(in srgb, ${tool.color} 10%, #181818)`,
              borderColor: `color-mix(in srgb, ${tool.color} 25%, #2b2b2b)`,
            }}
          >
            {Icon && (
              <Icon
                className="h-5 w-5"
                style={{
                  color: tool.color,
                }}
              />
            )}
          </div>

          <StatusBadge
            connected={connected}
            comingSoon={isComingSoon}
          />
        </div>

        <h3 className="mt-5 text-[15px] font-semibold text-[#f5f5f5]">
          {tool.name}
        </h3>

        <div className="mt-2">
          <span className="rounded-md border border-[#292929] bg-[#151515] px-2 py-1 text-[10px] text-[#777]">
            {tool.category}
          </span>
        </div>

        <p className="mt-4 flex-1 text-[12px] leading-relaxed text-[#777]">
          {tool.desc}
        </p>

        <button
          type="button"
          disabled={isComingSoon}
          onClick={() => {
            if (!isComingSoon) {
              connected
                ? disconnectTool(tool)
                : connectTool(tool);
            }
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: "#191919",
            borderColor: "#2b2b2b",
            color: "#777",
          }}
        >
          <Lock className="h-3.5 w-3.5" />
          Coming soon
        </button>
      </div>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                    */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div
        className="min-h-full px-4 py-6 md:px-6 lg:px-8"
        style={{ backgroundColor: BRAND.bg }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 animate-pulse">
            <div className="h-3 w-24 rounded bg-[#222]" />
            <div className="mt-4 h-9 w-64 rounded bg-[#202020]" />
            <div className="mt-3 h-4 w-[420px] max-w-full rounded bg-[#1c1c1c]" />
          </div>

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-[#242424] bg-[#181818]"
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-2xl border border-[#242424] bg-[#181818]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Page                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: BRAND.bg }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="relative overflow-hidden rounded-3xl border border-[#292929] bg-[#171717]">
          <div className="absolute right-0 top-0 h-full w-[35%] overflow-hidden">
            <div
              className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full blur-[100px]"
              style={{
                backgroundColor: "rgba(255,10,138,0.10)",
              }}
            />

            <div
              className="absolute bottom-[-120px] right-[20%] h-[260px] w-[260px] rounded-full blur-[100px]"
              style={{
                backgroundColor: "rgba(47,128,255,0.08)",
              }}
            />
          </div>

          <div className="relative flex flex-col gap-7 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: BRAND.pink,
                  }}
                >
                  <Link2 className="h-4 w-4 text-white" />
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#777]">
                  Workspace connections
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#f5f5f5] md:text-4xl">
                Integrations
              </h1>

              <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#858585]">
                Connect the platforms and tools that power your
                content, audience, analytics, and automation.
                Everything stays connected to your Koraspace
                workspace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2d2d2d] bg-[#121212] px-3 py-2 text-[11px] text-[#999]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#52dc91]" />
                  Secure connections
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-[#2d2d2d] bg-[#121212] px-3 py-2 text-[11px] text-[#999]">
                  <RefreshCw className="h-3.5 w-3.5 text-[#5c9dff]" />
                  Automatic syncing
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#333] bg-[#1d1d1d] px-4 py-2.5 text-[12px] font-medium text-[#ccc] transition-colors hover:bg-[#242424]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh connections
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Stats                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#292929] bg-[#181818] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#666]">
                Social accounts
              </span>

              <Camera className="h-4 w-4 text-[#ff0a8a]" />
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-semibold text-[#f5f5f5]">
                {connectedCount}
              </span>
              <span className="mb-1 text-[11px] text-[#666]">
                connected
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#181818] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#666]">
                Platforms
              </span>

              <Sparkles className="h-4 w-4 text-[#2f80ff]" />
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-semibold text-[#f5f5f5]">
                {connectedPlatforms.size}
              </span>
              <span className="mb-1 text-[11px] text-[#666]">
                active
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#181818] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#666]">
                Tools
              </span>

              <Zap className="h-4 w-4 text-[#777]" />
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-2xl font-semibold text-[#f5f5f5]">
                {toolsConnectedCount}
              </span>
              <span className="mb-1 text-[11px] text-[#666]">
                connected
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Navigation                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8 flex flex-col gap-4 border-b border-[#292929] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#eee]">
              Your connections
            </h2>

            <p className="mt-1 text-[12px] text-[#666]">
              Manage the services available to your workspace.
            </p>
          </div>

          <div className="flex rounded-xl border border-[#292929] bg-[#181818] p-1">
            <button
              type="button"
              onClick={() =>
                setActiveSection("social")
              }
              className="rounded-lg px-4 py-2 text-[11px] font-semibold transition-all"
              style={
                activeSection === "social"
                  ? {
                      backgroundColor:
                        BRAND.pink,
                      color: "#fff",
                    }
                  : {
                      color: "#777",
                    }
              }
            >
              Social platforms
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("tools")
              }
              className="rounded-lg px-4 py-2 text-[11px] font-semibold transition-all"
              style={
                activeSection === "tools"
                  ? {
                      backgroundColor:
                        BRAND.blue,
                      color: "#fff",
                    }
                  : {
                      color: "#777",
                    }
              }
            >
              Tools & analytics
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SOCIAL                                                             */}
        {/* ---------------------------------------------------------------- */}

        {activeSection === "social" && (
          <div className="mt-7">
            <SectionLabel count={PLATFORM_LIST.length}>
              Social platforms
            </SectionLabel>

            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#ddd]">
                  Publishing
                </span>

                <span className="text-[11px] text-[#555]">
                  Create, schedule and analyze content
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publishingPlatforms.map(
                  (platform) => (
                    <SocialCard
                      key={platform.id}
                      platform={platform}
                    />
                  )
                )}
              </div>
            </div>

            {messagingPlatforms.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#ddd]">
                    Messaging & communities
                  </span>

                  <span className="text-[11px] text-[#555]">
                    Inbox, conversations and audience
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {messagingPlatforms.map(
                    (platform) => (
                      <SocialCard
                        key={platform.id}
                        platform={platform}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TOOLS                                                              */}
        {/* ---------------------------------------------------------------- */}

        {activeSection === "tools" && (
          <div className="mt-7">
            <SectionLabel count={TOOL_LIST.length}>
              Tools & analytics
            </SectionLabel>

            <div className="mb-6 rounded-2xl border border-[#292929] bg-[#181818] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                  style={{
                    backgroundColor:
                      "rgba(47,128,255,0.08)",
                    borderColor:
                      "rgba(47,128,255,0.2)",
                  }}
                >
                  <Settings2
                    className="h-5 w-5"
                    style={{
                      color: BRAND.blue,
                    }}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-[13px] font-semibold text-[#ddd]">
                    Expand your Koraspace workflow
                  </h3>

                  <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[#666]">
                    Connect calendars, analytics,
                    collaboration tools and
                    automation services to give
                    your workspace more context.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#303030] bg-[#141414] px-3 py-1.5 text-[10px] text-[#777]">
                  <Lock className="h-3 w-3" />
                  Rolling out soon
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOL_LIST.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Bottom security note                                               */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-[#292929] bg-[#161616] p-5 sm:flex-row sm:items-center">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor:
                "rgba(255,10,138,0.08)",
            }}
          >
            <ShieldCheck
              className="h-5 w-5"
              style={{
                color: BRAND.pink,
              }}
            />
          </div>

          <div className="flex-1">
            <p className="text-[12px] font-medium text-[#ddd]">
              Your connections stay inside your workspace
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-[#666]">
              Koraspace uses authenticated connections
              and encrypted credentials. Disconnect an
              account at any time from this page.
            </p>
          </div>

          <ArrowUpRight className="hidden h-4 w-4 text-[#555] sm:block" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* TOKEN MODAL                                                        */}
      {/* ================================================================== */}

      {tokenFor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!busy) {
              setTokenFor(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#333] bg-[#181818] p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      "rgba(255,10,138,0.1)",
                  }}
                >
                  <KeyRound
                    className="h-5 w-5"
                    style={{
                      color: BRAND.pink,
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-[#eee]">
                    Connect {tokenFor.name}
                  </h3>

                  <p className="mt-0.5 text-[11px] text-[#666]">
                    Secure token connection
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTokenFor(null)
                }
                className="rounded-lg p-2 text-[#666] hover:bg-[#242424] hover:text-[#eee]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-[#292929] bg-[#141414] p-4">
              <div className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#52dc91]" />

                <p className="text-[11px] leading-relaxed text-[#777]">
                  Your token is used only to authenticate
                  this integration with Koraspace.
                </p>
              </div>
            </div>

            <label className="mt-5 block text-[11px] font-medium text-[#aaa]">
              {tokenFor.tokenSetup?.label ||
                "Access token"}
            </label>

            <input
              autoFocus
              value={tokenVal}
              onChange={(e) =>
                setTokenVal(e.target.value)
              }
              placeholder="Paste token…"
              className="mt-2 h-11 w-full rounded-xl border border-[#303030] bg-[#121212] px-3.5 text-sm text-[#eee] outline-none placeholder:text-[#555] focus:border-[#ff0a8a]"
            />

            {tokenFor.tokenSetup?.docs && (
              <a
                href={
                  tokenFor.tokenSetup.docs
                }
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-[#5c9dff] hover:underline"
              >
                Where do I get this?
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setTokenFor(null)
                }
                className="rounded-xl border border-[#303030] bg-[#202020] px-4 py-2.5 text-[12px] font-medium text-[#aaa] hover:bg-[#282828]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={connectToken}
                disabled={
                  !tokenVal.trim() ||
                  busy === tokenFor.id
                }
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
                style={{
                  backgroundColor: BRAND.pink,
                }}
              >
                {busy === tokenFor.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4" />
                )}
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* INSTAGRAM HANDLE MODAL                                             */}
      {/* ================================================================== */}

      {oauthFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      "rgba(255,10,138,0.1)",
                  }}
                >
                  <Camera
                    className="h-5 w-5"
                    style={{
                      color: BRAND.pink,
                    }}
                  />
                </div>

                <h3 className="text-[16px] font-semibold text-[#eee]">
                  Connect {oauthFor.name}
                </h3>

                <p className="mt-1 text-[11px] text-[#666]">
                  One quick detail before authentication
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOauthFor(null)
                }
                className="rounded-lg p-2 text-[#666] hover:bg-[#242424] hover:text-[#eee]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 text-[12px] leading-relaxed text-[#888]">
              Enter your Instagram handle so Koraspace
              can associate your account with the correct
              audience and performance data.
            </p>

            <label className="mt-5 block text-[11px] font-medium text-[#aaa]">
              Instagram handle
            </label>

            <input
              autoFocus
              type="text"
              value={oauthHandle}
              onChange={(e) =>
                setOauthHandle(e.target.value)
              }
              placeholder="@yourusername"
              className="mt-2 h-11 w-full rounded-xl border border-[#303030] bg-[#121212] px-4 text-sm text-[#eee] outline-none placeholder:text-[#555] focus:border-[#ff0a8a]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  proceedOAuth();
                }
              }}
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setOauthFor(null)
                }
                className="rounded-xl px-4 py-2.5 text-[12px] font-medium text-[#777] hover:text-[#eee]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={proceedOAuth}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white"
                style={{
                  backgroundColor: BRAND.pink,
                }}
              >
                Continue
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* TOOL KEY MODAL                                                      */}
      {/* ================================================================== */}

      {keyFor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!busy) {
              setKeyFor(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#333] bg-[#181818] p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-start justify-between">
              <div>
                <div
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor:
                      "rgba(47,128,255,0.1)",
                  }}
                >
                  <KeyRound
                    className="h-5 w-5"
                    style={{
                      color: BRAND.blue,
                    }}
                  />
                </div>

                <h3 className="text-[16px] font-semibold text-[#eee]">
                  Connect {keyFor.name}
                </h3>

                <p className="mt-1 text-[11px] text-[#666]">
                  Add your integration credential
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setKeyFor(null)
                }
                className="rounded-lg p-2 text-[#666] hover:bg-[#242424] hover:text-[#eee]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-6 block text-[11px] font-medium text-[#aaa]">
              {keyFor.keySetup?.label ||
                "Integration key"}
            </label>

            <input
              autoFocus
              value={keyVal}
              onChange={(e) =>
                setKeyVal(e.target.value)
              }
              placeholder={
                keyFor.connectType ===
                "webhook"
                  ? "https://…"
                  : "Paste key…"
              }
              className="mt-2 h-11 w-full rounded-xl border border-[#303030] bg-[#121212] px-3.5 text-sm text-[#eee] outline-none placeholder:text-[#555] focus:border-[#2f80ff]"
            />

            {keyFor.keySetup?.docs && (
              <a
                href={keyFor.keySetup.docs}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-[#5c9dff] hover:underline"
              >
                Where do I get this?
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setKeyFor(null)
                }
                className="rounded-xl border border-[#303030] bg-[#202020] px-4 py-2.5 text-[12px] font-medium text-[#aaa] hover:bg-[#282828]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitKey}
                disabled={
                  !keyVal.trim() ||
                  busy === keyFor.id
                }
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white disabled:opacity-50"
                style={{
                  backgroundColor: BRAND.blue,
                }}
              >
                {busy === keyFor.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4" />
                )}
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}