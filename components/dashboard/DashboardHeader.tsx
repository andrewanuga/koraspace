"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  Menu,
  Plus,
  PanelLeft,
  Command,
  Zap,
  Briefcase,
} from "lucide-react";

import {
  NotificationsMenu,
  ProfileMenu,
  WorkspaceMenu,
} from "./HeaderMenus";

import { useWorkspace } from "./WorkspaceProvider";
import { useToast } from "@/components/ui/toast";

export function DashboardHeader({
  onMobileMenuToggle,
  onToggleSidebar,
}: {
  title?: string;
  onMobileMenuToggle?: () => void;
  onToggleSidebar?: () => void;
}) {
  const router = useRouter();

  const { persona, setPersona, hasMarketerMode, isSwitchingPersona } =
    useWorkspace();

  const { error } = useToast();

  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  /* ---------------------------------------------
     Mode switcher
  ---------------------------------------------- */

  const handleModeSwitch = async (
    mode: "creator" | "marketer"
  ) => {
    if (mode === "marketer" && !hasMarketerMode) {
      error(
        "Premium feature",
        "Marketer Mode is available on KoraSpace Premium and above."
      );

      return;
    }

    const switched = await setPersona(mode);

    if (!switched) {
      error(
        "Unable to switch mode",
        "Something went wrong while switching your workspace mode."
      );
    }
  };

  /* ---------------------------------------------
     Keyboard shortcut
     Cmd/Ctrl + K focuses dashboard search
  ---------------------------------------------- */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCommand =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";

      if (!isCommand) return;

      event.preventDefault();
      searchRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ---------------------------------------------
     Search
  ---------------------------------------------- */

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    router.push(
      `/dashboard/trends?q=${encodeURIComponent(cleanQuery)}`
    );

    searchRef.current?.blur();
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--stroke)] px-4 sm:px-6"
      style={{
        background: "rgba(18,18,18,0.88)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* LEFT */}

      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}

        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)] md:hidden"
        >
          <Menu className="h-[19px] w-[19px]" />
        </button>

        {/* Desktop sidebar toggle */}

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-[var(--fg-3)] transition-all hover:bg-[var(--hover)] hover:text-[var(--fg)] md:flex"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>

        <div className="hidden h-5 w-px bg-[var(--stroke)] md:block" />

        {/* Search */}

        <form
          onSubmit={handleSearch}
          className="relative hidden lg:block"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-4)]"
          />

          <input
            ref={searchRef}
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search your workspace..."
            className="h-9 w-[280px] rounded-xl border bg-[var(--panel-fill)] pl-9 pr-16 text-[12.5px] text-[var(--fg)] outline-none transition-all placeholder:text-[var(--fg-4)]"
            style={{
              borderColor: searchFocused
                ? "rgba(236,72,153,0.55)"
                : "var(--stroke)",
              boxShadow: searchFocused
                ? "0 0 0 3px rgba(236,72,153,0.08)"
                : "none",
            }}
          />

          <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-1.5 py-0.5">
            <Command className="h-3 w-3 text-[var(--fg-4)]" />

            <span className="text-[9px] text-[var(--fg-4)]">
              K
            </span>
          </div>
        </form>
      </div>

      {/* RIGHT */}

      <div className="flex flex-shrink-0 items-center gap-2">
        {/* Create button */}

        <Link
          href="/dashboard/create"
          className="hidden items-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] sm:flex"
          style={{
            background: "#ec4899",
            boxShadow:
              "0 8px 24px rgba(236,72,153,0.18)",
          }}
        >
          <Plus className="h-4 w-4" />

          Create
        </Link>

        {/* Mobile create */}

        <Link
          href="/dashboard/create"
          aria-label="Create content"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white sm:hidden"
          style={{
            background: "#ec4899",
          }}
        >
          <Plus className="h-4 w-4" />
        </Link>

        <div className="mx-1 hidden h-5 w-px bg-[var(--stroke)] sm:block" />

        {/* Mode switcher */}

        <div
          className="
            hidden items-center gap-1 rounded-xl
            border border-[var(--stroke)]
            bg-[var(--panel-fill)]
            p-1
            sm:flex
          "
        >
          <button
            onClick={() => handleModeSwitch("creator")}
            disabled={isSwitchingPersona}
            className={`
              flex items-center gap-2 rounded-lg
              px-3 py-2 text-[12px] font-semibold
              transition-all duration-200
              disabled:cursor-not-allowed
              ${
                persona === "creator"
                  ? "bg-[var(--kora-pink-soft)] text-[var(--kora-pink)]"
                  : "text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
              }
            `}
          >
            <Zap className="h-3.5 w-3.5" />

            Creator
          </button>

          <button
            onClick={() => handleModeSwitch("marketer")}
            disabled={isSwitchingPersona}
            className={`
              flex items-center gap-2 rounded-lg
              px-3 py-2 text-[12px] font-semibold
              transition-all duration-200
              disabled:cursor-not-allowed
              ${
                persona === "marketer"
                  ? "bg-[var(--kora-blue-soft)] text-[var(--kora-blue)]"
                  : "text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
              }
            `}
          >
            <Briefcase className="h-3.5 w-3.5" />

            Marketer

            {!hasMarketerMode && (
              <span
                className="
                  ml-1 rounded-md
                  border border-[var(--stroke)]
                  px-1.5 py-0.5
                  text-[9px] font-bold uppercase
                  tracking-wide text-[var(--fg-4)]
                "
              >
                Pro
              </span>
            )}
          </button>
        </div>

        <div className="mx-1 hidden h-5 w-px bg-[var(--stroke)] sm:block" />

        <WorkspaceMenu />

        <NotificationsMenu />

        <ProfileMenu />
      </div>
    </header>
  );
}