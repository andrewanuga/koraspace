"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant";
import { WorkspaceProvider } from "@/components/dashboard/WorkspaceProvider";
import { GlobalBanner } from "@/components/dashboard/GlobalBanner";

import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "koraspace-sidebar-collapsed";

import { useWorkspace } from "@/components/dashboard/WorkspaceProvider";

function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { persona } = useWorkspace();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /*
   * Restore sidebar preference.
   * mounted prevents visual layout shifting before localStorage is read.
   */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);

      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // Ignore storage errors.
    } finally {
      setMounted(true);
    }
  }, []);

  /*
   * Close mobile navigation whenever the route changes.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Prevent background scrolling while mobile navigation is open.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors.
      }

      return next;
    });
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div
      data-persona={persona}
      className="sai-app relative min-h-screen overflow-x-hidden bg-[#121212] text-[var(--fg)]"
    >
      {/* Desktop Sidebar */}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden md:block",
          "transition-[width] duration-300 ease-out"
        )}
      >
        <Sidebar
          collapsed={mounted ? collapsed : false}
          onToggle={toggleSidebar}
        />
      </aside>

      {/* Mobile Backdrop */}

      <div
        aria-hidden={!mobileOpen}
        onClick={closeMobileSidebar}
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      {/* Mobile Sidebar */}

      <aside
        aria-label="Mobile navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw]",
          "transform transition-transform duration-300 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          collapsed={false}
          isMobile
          onToggle={closeMobileSidebar}
        />
      </aside>

      {/* Main Application Area */}

      <div
        className={cn(
          "relative flex min-h-screen flex-col",
          "transition-[padding-left] duration-300 ease-out",
          mounted && collapsed
            ? "md:pl-[72px]"
            : "md:pl-[260px]"
        )}
      >
        {/* Global announcement / status */}

        <GlobalBanner />

        {/* Header */}

        <DashboardHeader
          onMobileMenuToggle={() => setMobileOpen((open) => !open)}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main Content */}

        <main
          id="main-content"
          className={cn(
            "relative flex-1",
            "min-w-0 overflow-x-hidden"
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              "px-4 py-5",
              "sm:px-6 sm:py-6",
              "lg:px-8 lg:py-8",
              "2xl:px-10"
            )}
          >
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Global AI Assistant */}

      <FloatingAiAssistant />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}