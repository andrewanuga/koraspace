"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Megaphone,
  ToggleLeft,
  Activity,
  Flame,
  LifeBuoy,
  Flag,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { href: "/admin", label: "SOC Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users & Accounts", icon: Users },
  { href: "/admin/security", label: "Security & IPs", icon: ShieldAlert, badgeKey: "security" },
  { href: "/admin/moderation", label: "Moderation Queue", icon: Flag },
  { href: "/admin/features", label: "Feature Flags", icon: ToggleLeft },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Megaphone },
  { href: "/admin/health", label: "Health Matrix", icon: Activity },
  { href: "/admin/firehose", label: "Agent Firehose", icon: Flame },
  { href: "/admin/support", label: "Support Desk", icon: LifeBuoy, badgeKey: "support" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<{ support: number; security: number }>({ support: 0, security: 0 });

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const supabase = createClient();
        const [{ count: openTickets }, { count: criticalEvents }] = await Promise.all([
          supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("security_events").select("id", { count: "exact", head: true }).eq("severity", "critical"),
        ]);
        setCounts({
          support: openTickets ?? 0,
          security: criticalEvents ?? 0,
        });
      } catch {}
    };
    fetchBadges();
  }, [pathname]);

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full w-[250px] flex-col border-r border-white/[0.08]"
      style={{
        background: "rgba(11, 12, 16, 0.92)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
<<<<<<< HEAD
        <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
        <div>
          <span className="font-display text-[15px] font-semibold text-[var(--fg)]">Koraspace</span>
          <span className="ml-1.5 rounded-md px-1.5 py-0.5 font-data text-[9px] uppercase tracking-wider" style={{ color: "var(--sai-red)", background: "color-mix(in srgb, var(--sai-red) 14%, transparent)" }}>Admin</span>
=======
        <img src="/logo.png" alt="Koraspace" width={26} height={23} className="h-6 w-auto" />
        <div className="flex items-center gap-2">
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            Kora<span className="text-blue-500">space</span>
          </span>
          <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 font-data text-[9px] font-bold uppercase tracking-wider text-rose-400">
            SOC
          </span>
>>>>>>> main
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-xs">
        <p className="px-3 py-1.5 font-data text-[10px] font-bold uppercase tracking-widest text-white/30">
          Command Center
        </p>

        {ITEMS.map((it) => {
          const on = active(it.href, it.exact);
          const badgeCount = it.badgeKey ? counts[it.badgeKey as keyof typeof counts] : 0;

          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                on
                  ? "bg-blue-600/15 text-white font-semibold shadow-sm"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                {on && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue-500"
                    style={{ boxShadow: "0 0 8px #3b82f6" }}
                  />
                )}
                <it.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    on ? "text-blue-400" : "text-white/40 group-hover:text-white/70"
                  )}
                />
                <span>{it.label}</span>
              </div>

              {badgeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 px-1 font-data text-[10px] font-bold text-rose-300">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Exit Links */}
      <div className="space-y-1 border-t border-white/[0.08] p-3 text-xs">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit to Dashboard</span>
        </Link>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium text-white/60 transition hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
