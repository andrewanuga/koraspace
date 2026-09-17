"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  LayoutDashboard,
  MessagesSquare,
  Lightbulb,
  RefreshCw,
  CalendarRange,
  BarChart3,
  Inbox,
  Sparkles as BrandIcon,
  Plug,
  Settings,
  CreditCard,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  X,
  Megaphone,
  Users,
  Target,
  Sparkles,
  PenLine,
  Compass,
  Workflow,
  BriefcaseBusiness,
  Bot,
  Crown,
  Check,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { cn } from "@/lib/utils";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  useWorkspace,
} from "./WorkspaceProvider";

import {
  useToast,
} from "@/components/ui/toast";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Item = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  exact?: boolean;
};

type Mode = "creator" | "marketer";

/* -------------------------------------------------------------------------- */
/*                              CREATOR NAV                                   */
/* -------------------------------------------------------------------------- */

const CREATOR_NAV: Item[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },

  {
    href: "/dashboard/create",
    label: "Create",
    icon: PenLine,
  },

  {
    href: "/dashboard/ideas",
    label: "Ideas",
    icon: Lightbulb,
  },

  {
    href: "/dashboard/repurpose",
    label: "Repurpose",
    icon: RefreshCw,
  },

  {
    href: "/dashboard/calendar",
    label: "Calendar",
    icon: CalendarRange,
  },

  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },

  {
    href: "/dashboard/inbox",
    label: "Inbox",
    icon: Inbox,
  },

  {
    href: "/dashboard/brand",
    label: "Brand",
    icon: BrandIcon,
  },
];

/* -------------------------------------------------------------------------- */
/*                              MARKETER NAV                                  */
/* -------------------------------------------------------------------------- */

const MARKETER_NAV: Item[] = [
  {
    href: "/dashboard/agency",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },

  {
    href: "/dashboard/strategy",
    label: "Strategy",
    icon: Target,
  },

  {
    href: "/dashboard/create",
    label: "Create",
    icon: PenLine,
  },

  {
    href: "/dashboard/calendar",
    label: "Calendar",
    icon: CalendarRange,
  },

  {
    href: "/dashboard/discover",
    label: "Discover",
    icon: Compass,
  },

  {
    href: "/dashboard/campaigns",
    label: "Campaigns",
    icon: Megaphone,
  },

  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },

  {
    href: "/dashboard/inbox",
    label: "Inbox",
    icon: Inbox,
  },

  {
    href: "/dashboard/crm",
    label: "Leads",
    icon: Users,
  },

  {
    href: "/dashboard/automations",
    label: "Automations",
    icon: Workflow,
  },

  {
    href: "/dashboard/team",
    label: "Team",
    icon: BriefcaseBusiness,
  },

  {
    href: "/dashboard/brand",
    label: "Brand",
    icon: BrandIcon,
  },
];

/* -------------------------------------------------------------------------- */
/*                               UTILITY NAV                                  */
/* -------------------------------------------------------------------------- */

const UTILITY_NAV: Item[] = [
  {
    href: "/dashboard/integrations",
    label: "Integrations",
    icon: Plug,
  },

  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export function Sidebar({
  collapsed,
  onToggle,
  isMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();

  const router = useRouter();

  const {
    persona,
    plan,
    setPersona,
  } = useWorkspace();

  const { error } = useToast();

  const [inboxUnread, setInboxUnread] =
    useState(0);

  const [
    profile,
    setProfile,
  ] = useState<{
    full_name: string | null;
    avatar_url?: string | null;
  } | null>(null);

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const [
    modeMenuOpen,
    setModeMenuOpen,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*                           INBOX COUNT                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();

        const { count } = await supabase
          .from("social_inbox")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("is_read", false);

        setInboxUnread(count ?? 0);
      } catch {
        // Offline or unavailable
      }
    })();
  }, [pathname]);

  /* ---------------------------------------------------------------------- */
  /*                              PROFILE                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select(
            "full_name, avatar_url"
          )
          .eq("id", user.id)
          .single();

        setProfile(data);
      } catch {
        // Offline
      }
    })();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                              ACTIVE ROUTE                               */
  /* ---------------------------------------------------------------------- */

  const isActive = (
    href: string,
    exact?: boolean
  ) => {
    if (exact) {
      return pathname === href;
    }

    return (
      pathname.startsWith(href) &&
      href !== "/dashboard"
    );
  };

  /* ---------------------------------------------------------------------- */
  /*                              LOGOUT                                     */
  /* ---------------------------------------------------------------------- */

  const logout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");

    router.refresh();
  };

  /* ---------------------------------------------------------------------- */
  /*                              MODE SWITCH                                */
  /* ---------------------------------------------------------------------- */

  const handleModeSwitch = async (
    mode: Mode
  ) => {
    if (mode === persona) {
      setModeMenuOpen(false);
      return;
    }

    const hasMarketerAccess =
      plan === "advanced" ||
      plan === "team";

    if (
      mode === "marketer" &&
      !hasMarketerAccess
    ) {
      error(
        "Premium feature",
        "Marketer Mode is available on Advanced and Team plans."
      );

      setModeMenuOpen(false);

      return;
    }

    await setPersona(mode);

    setModeMenuOpen(false);

    /*
      Redirect user to the correct mode overview.
    */

    if (mode === "creator") {
      router.push("/dashboard");
    }

    if (mode === "marketer") {
      router.push("/dashboard/agency");
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              NAV ITEM                                   */
  /* ---------------------------------------------------------------------- */

  const Row = ({
    item,
  }: {
    item: Item;
  }) => {
    const active = isActive(
      item.href,
      item.exact
    );

    const badge =
      item.href === "/dashboard/inbox"
        ? inboxUnread || undefined
        : item.badge;

    const accent =
      persona === "marketer"
        ? "#3B82F6"
        : "#EC4899";

    return (
      <Link
        href={item.href}
        onClick={() => {
          if (isMobile) {
            onToggle();
          }
        }}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
          active
            ? "text-[var(--fg)]"
            : "text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]",
          collapsed &&
            "justify-center px-2"
        )}
        style={
          active
            ? {
                background:
                  persona === "marketer"
                    ? "rgba(59,130,246,0.10)"
                    : "rgba(236,72,153,0.10)",
              }
            : undefined
        }
      >
        {/* ACTIVE BAR */}

        {active && (
          <span
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
            style={{
              background: accent,
            }}
          />
        )}

        {/* ICON */}

        <item.icon
          className="h-[17px] w-[17px] flex-shrink-0"
          style={
            active
              ? {
                  color: accent,
                }
              : undefined
          }
        />

        {/* LABEL */}

        {!collapsed && (
          <span className="flex-1 truncate">
            {item.label}
          </span>
        )}

        {/* BADGE */}

        {!collapsed && badge && (
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
            style={{
              background: accent,
            }}
          >
            {badge}
          </span>
        )}

        {/* COLLAPSED TOOLTIP */}

        {collapsed && (
          <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-[var(--stroke)] bg-[#1A1A1A] px-2.5 py-1.5 text-xs text-[var(--fg)] opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            {item.label}

            {badge ? (
              <span
                className="ml-1"
                style={{
                  color: accent,
                }}
              >
                · {badge}
              </span>
            ) : null}
          </span>
        )}
      </Link>
    );
  };

  /* ---------------------------------------------------------------------- */
  /*                              MODE DATA                                  */
  /* ---------------------------------------------------------------------- */

  const nav =
    persona === "marketer"
      ? MARKETER_NAV
      : CREATOR_NAV;

  const modeLabel =
    persona === "marketer"
      ? "Marketer Mode"
      : "Creator Mode";

  const modeColor =
    persona === "marketer"
      ? "#3B82F6"
      : "#EC4899";

  const modeIcon =
    persona === "marketer"
      ? BriefcaseBusiness
      : Sparkles;

  const ModeIcon = modeIcon;

  const initial = (
    profile?.full_name || "U"
  )
    .slice(0, 1)
    .toUpperCase();

  /* ---------------------------------------------------------------------- */
  /*                                RENDER                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full border-r border-[var(--stroke)]"
      style={{
        background: "var(--app-surface)",
      }}
    >
      <div
        className={cn(
          "flex h-full flex-col transition-[width] duration-300 ease-in-out",
          collapsed
            ? "w-[68px]"
            : "w-[252px]"
        )}
      >
        {/* ================================================================ */}
        {/* LOGO */}
        {/* ================================================================ */}

        <div
          className={cn(
            "flex h-16 flex-shrink-0 items-center border-b border-[var(--stroke)]",
            collapsed
              ? "justify-center"
              : "gap-2.5 px-4"
          )}
        >
          {/* LOGO MARK */}

          <div className="h-10 w-10 flex-shrink rounded-xl bg-white shadow-sm transition-all duration-300">
            <img
              src={persona === "marketer" ? "/logo-blue.png" : "/logo.png"}
              alt="KoraSpace"
              className="h-full w-full object-contain"
            />
          </div>

          {/* BRAND */}

          {!collapsed && (
<<<<<<< HEAD
            <span className="font-display text-[16px] font-semibold text-[var(--fg)]">
              Koraspace<span className="text-[var(--sai-indigo)]"> AI</span>
=======
            <span className="font-display whitespace-nowrap text-[16px] font-semibold tracking-[-0.02em] text-[var(--fg)]">
              KoraSpace
>>>>>>> main
            </span>
          )}

          {/* MOBILE CLOSE */}

          {isMobile && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();

                event.stopPropagation();

                onToggle();
              }}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ================================================================ */}
        {/* MODE SWITCHER */}
        {/* ================================================================ */}

        {!collapsed && (
          <div className="relative px-3 pt-3">
            <button
              type="button"
              onClick={() =>
                setModeMenuOpen(
                  (value) => !value
                )
              }
              className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all hover:bg-[var(--hover)]"
              style={{
                background:
                  persona === "marketer"
                    ? "rgba(59,130,246,0.06)"
                    : "rgba(236,72,153,0.06)",

                borderColor:
                  persona === "marketer"
                    ? "rgba(59,130,246,0.20)"
                    : "rgba(236,72,153,0.20)",
              }}
            >
              <span className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{
                    background:
                      persona === "marketer"
                        ? "rgba(59,130,246,0.12)"
                        : "rgba(236,72,153,0.12)",
                  }}
                >
                  <ModeIcon
                    className="h-3.5 w-3.5"
                    style={{
                      color: modeColor,
                    }}
                  />
                </span>

                <span>
                  <span className="block text-[11px] text-[var(--fg-4)]">
                    Workspace mode
                  </span>

                  <span className="block text-[12.5px] font-medium text-[var(--fg)]">
                    {modeLabel}
                  </span>
                </span>
              </span>

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[var(--fg-4)] transition-transform",
                  modeMenuOpen &&
                    "rotate-180"
                )}
              />
            </button>

            {/* MODE MENU */}

            {modeMenuOpen && (
              <div className="absolute left-3 right-3 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--app-surface)] p-1.5 shadow-2xl backdrop-blur-xl">
                {/* HEADER */}

                <div className="px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-4)]">
                    Switch workspace mode
                  </p>
                </div>

                {/* CREATOR */}

                <button
                  type="button"
                  onClick={() =>
                    handleModeSwitch("creator")
                  }
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[var(--hover)]"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "rgba(236,72,153,0.12)",
                    }}
                  >
                    <Sparkles
                      className="h-4 w-4"
                      style={{
                        color: "#EC4899",
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-[var(--fg)]">
                      Creator
                    </p>

                    <p className="mt-0.5 text-[10.5px] text-[var(--fg-4)]">
                      Create and grow your audience
                    </p>
                  </div>

                  {persona === "creator" && (
                    <Check
                      className="h-4 w-4"
                      style={{
                        color: "#EC4899",
                      }}
                    />
                  )}
                </button>

                {/* MARKETER */}

                <button
                  type="button"
                  onClick={() =>
                    handleModeSwitch("marketer")
                  }
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[var(--hover)]"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "rgba(59,130,246,0.12)",
                    }}
                  >
                    <BriefcaseBusiness
                      className="h-4 w-4"
                      style={{
                        color: "#3B82F6",
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--fg)]">
                      Marketer

                      {plan !== "advanced" &&
                        plan !== "team" && (
                          <Crown
                            className="h-3 w-3"
                            style={{
                              color: "#F59E0B",
                            }}
                          />
                        )}
                    </p>

                    <p className="mt-0.5 text-[10.5px] text-[var(--fg-4)]">
                      Grow brands and campaigns
                    </p>
                  </div>

                  {persona === "marketer" && (
                    <Check
                      className="h-4 w-4"
                      style={{
                        color: "#3B82F6",
                      }}
                    />
                  )}
                </button>

                {/* PREMIUM FOOTER */}

                {plan !== "advanced" &&
                  plan !== "team" && (
                    <Link
                      href="/dashboard/billing"
                      className="mx-1 mt-1 flex items-center gap-2 rounded-xl border border-[var(--stroke)] px-3 py-2.5 text-[10.5px] text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)]"
                    >
                      <Crown
                        className="h-3.5 w-3.5"
                        style={{
                          color: "#F59E0B",
                        }}
                      />

                      Unlock both modes with Premium
                    </Link>
                  )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* NAVIGATION */}
        {/* ================================================================ */}

        <nav className="flex-1 overflow-y-auto px-2.5 py-4">
          <div className="space-y-0.5">
            {nav.map((item) => (
              <Row
                key={item.href}
                item={item}
              />
            ))}
          </div>

          {/* DIVIDER */}

          {collapsed ? (
            <div className="mx-auto my-4 h-px w-6 bg-[var(--stroke)]" />
          ) : (
            <div className="my-4 h-px w-full bg-[var(--stroke)]" />
          )}

          {/* UTILITY NAV */}

          <div className="space-y-0.5">
            {UTILITY_NAV.map((item) => (
              <Row
                key={item.href}
                item={item}
              />
            ))}
          </div>
        </nav>

        {/* ================================================================ */}
        {/* PREMIUM CARD */}
        {/* ================================================================ */}

        {!collapsed &&
          persona !== "marketer" &&
          plan !== "advanced" &&
          plan !== "team" && (
            <div className="px-3 pb-3">
              <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 transition-colors">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "var(--brand-primary-soft)",
                    }}
                  >
                    <Crown
                      className="h-4 w-4"
                      style={{
                        color: "var(--brand-primary)",
                      }}
                    />
                  </div>

                  <span
                    className="rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em]"
                    style={{
                      background:
                        "var(--brand-primary-soft)",
                      color: "var(--brand-primary)",
                    }}
                  >
                    Premium
                  </span>
                </div>

                <p className="text-[13px] font-semibold text-[var(--fg)]">
                  Unlock both modes
                </p>

                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--fg-4)]">
                  Switch between Creator and
                  Marketer workspaces whenever you
                  need.
                </p>

                <Link
                  href="/dashboard/billing"
                  className="mt-4 block rounded-xl py-2 text-center text-[11.5px] font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: "var(--brand-primary)",
                  }}
                >
                  Upgrade plan
                </Link>
              </div>
            </div>
          )}

        {/* ================================================================ */}
        {/* PROFILE */}
        {/* ================================================================ */}

        <div className="relative border-t border-[var(--stroke)] p-2.5">
          <button
            type="button"
            onClick={() =>
              setProfileMenuOpen(
                (value) => !value
              )
            }
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[var(--hover)]",
              collapsed &&
                "justify-center px-0"
            )}
          >
            {/* AVATAR */}

            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{
                  background:
                    "var(--brand-primary)",
                }}
              >
                {initial}
              </div>
            )}

            {/* INFO */}

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-[var(--fg)]">
                  {profile?.full_name || "User"}
                </p>

                <p className="truncate text-[10.5px] capitalize text-[var(--fg-4)]">
                  {persona === "marketer" ? "Marketer Mode" : "Creator Mode"}
                </p>
              </div>
            )}

            {!collapsed && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-[var(--fg-4)] transition-transform",
                  profileMenuOpen &&
                    "rotate-180"
                )}
              />
            )}
          </button>

          {/* PROFILE MENU */}

          {profileMenuOpen &&
            !collapsed && (
              <div className="absolute bottom-[calc(100%+8px)] left-2.5 right-2.5 z-[100] overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--app-surface)] p-1.5 shadow-2xl backdrop-blur-xl">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                >
                  <Settings className="h-4 w-4" />

                  Account settings
                </Link>

                <Link
                  href="/dashboard/support"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                >
                  <LifeBuoy className="h-4 w-4" />

                  Help & support
                </Link>

                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                >
                  <CreditCard className="h-4 w-4" />

                  Billing
                </Link>

                <div className="my-1 h-px bg-[var(--stroke)]" />

                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[#F87171]"
                >
                  <LogOut className="h-4 w-4" />

                  Sign out
                </button>
              </div>
            )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* DESKTOP COLLAPSE BUTTON */}
      {/* ================================================================ */}

      {!isMobile && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-[70px] z-50 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--stroke)] bg-[var(--app-surface)] text-[var(--fg-3)] shadow-lg transition-all hover:bg-[var(--hover)] hover:text-[var(--fg)]"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </aside>
  );
}