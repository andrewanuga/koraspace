"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Lock,
  Search,
  Shield,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface LegalSectionItem {
  id: string;
  title: string;
}

interface LegalShellProps {
  title: string;
  updated: string;
  intro: string;
  sections?: LegalSectionItem[];
  other: { href: string; label: string };
  badge?: string;
  summaryPills?: Array<{ icon?: React.ComponentType<{ className?: string }>; text: string }>;
  children: React.ReactNode;
}

export function LegalShell({
  title,
  updated,
  intro,
  sections = [],
  other,
  badge = "Legal & Compliance",
  summaryPills = [
    { icon: Shield, text: "NDPA 2023 Compliant" },
    { icon: Lock, text: "Zero-Password OAuth" },
    { icon: Sparkles, text: "Transparent AI Processing" },
  ],
  children,
}: LegalShellProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate Reading Progress & Scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      if (sections.length === 0) return;

      const scrollPosition = window.scrollY + 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => s.title.toLowerCase().includes(q));
  }, [sections, searchQuery]);

  const copyAnchor = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(id);
    setTimeout(() => {
      setCopiedSection((cur) => (cur === id ? null : cur));
    }, 2500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-blue-500/20 selection:text-blue-300" style={{ background: "#0b0c10", color: "#f3f4f6" }}>
      {/* Scroll Progress Bar */}
      <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-white/[0.04]">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #3b82f6, #6366f1, #a855f7)",
            boxShadow: "0 0 12px rgba(99,102,241,0.6)",
          }}
        />
      </div>

      {/* Ambient background bloom */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-20 h-[500px] w-[500px] rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }}
        />
        <div
          className="absolute -right-32 top-[40%] h-[450px] w-[450px] rounded-full opacity-15 blur-[140px]"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
        />
      </div>

      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] backdrop-blur-xl" style={{ background: "rgba(11, 12, 16, 0.75)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Koraspace" width={26} height={23} className="h-6 w-auto transition-transform group-hover:scale-105" />
            <span className="font-display text-[17px] font-bold tracking-tight text-white">
              Kora<span className="text-blue-500">space</span>
            </span>
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10.5px] font-medium tracking-wide text-white/60 sm:inline-block">
              Trust & Legal Center
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href={other.href}
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white sm:flex"
            >
              {other.label} <ArrowUpRight className="h-3.5 w-3.5 text-white/50" />
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-blue-600/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to App
            </Link>

            {sections.length > 0 && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/70 lg:hidden"
                aria-label="Toggle Table of Contents"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Hero Header Section */}
        <div className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            <Shield className="h-3.5 w-3.5" />
            {badge}
          </div>

          <h1 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[52px]">
            {title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/50">
            <span>Last reviewed: <strong className="text-white/80 font-medium">{updated}</strong></span>
            <span>•</span>
            <span>Est. reading time: <strong className="text-white/80 font-medium">6 minutes</strong></span>
          </div>

          <p className="mt-6 text-[15.5px] leading-relaxed text-white/70 sm:text-[16.5px]">
            {intro}
          </p>

          {/* Quick highlights / Trust pills */}
          {summaryPills && summaryPills.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {summaryPills.map((pill, idx) => {
                const IconComponent = pill.icon || Check;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-white/85 shadow-sm"
                  >
                    <IconComponent className="h-3.5 w-3.5 text-blue-400" />
                    <span>{pill.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two-column Layout: TOC + Content */}
        <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
          {/* Desktop Sticky Sidebar / TOC */}
          {sections.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                      Table of Contents
                    </p>
                    <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-semibold text-white/60">
                      {sections.length} Sections
                    </span>
                  </div>

                  {/* Search Filter */}
                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter sections..."
                      className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Links List */}
                  <nav className="max-h-[calc(100vh-320px)] space-y-1 overflow-y-auto pr-1 text-xs">
                    {filteredSections.length === 0 ? (
                      <p className="py-3 text-center text-xs text-white/40">No matching section</p>
                    ) : (
                      filteredSections.map((sec) => {
                        const isActive = activeSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => scrollToSection(sec.id)}
                            className={cn(
                              "group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors",
                              isActive
                                ? "bg-blue-600/15 text-blue-400 font-semibold"
                                : "text-white/60 hover:bg-white/[0.04] hover:text-white/90"
                            )}
                          >
                            <span className="truncate">{sec.title}</span>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-transform",
                                isActive ? "text-blue-400 translate-x-0.5" : "text-white/20 group-hover:text-white/40"
                              )}
                            />
                          </button>
                        );
                      })
                    )}
                  </nav>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-white/50">
                  <p className="font-semibold text-white/80">Need legal inquiry?</p>
                  <p className="mt-1 leading-relaxed">Reach our Data Protection Officer at <a href="mailto:privacy@koraspace.com" className="text-blue-400 hover:underline">privacy@koraspace.com</a></p>
                </div>
              </div>
            </aside>
          )}

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-x-0 bottom-0 top-[65px] z-50 overflow-y-auto bg-[#0b0c10]/95 p-6 backdrop-blur-2xl lg:hidden">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <p className="font-bold text-white">Table of Contents</p>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/60"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-1.5">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm font-medium text-white/80"
                  >
                    <span>{sec.title}</span>
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Body */}
          <main className="min-w-0 max-w-3xl space-y-12 leading-relaxed">
            {children}

            {/* Footer Navigation */}
            <div className="mt-16 flex flex-col gap-6 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={other.href}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                <span>Read our {other.label}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <span>•</span>
                <span>© {new Date().getFullYear()} Koraspace Technologies</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function Section({
  id,
  title,
  takeaway,
  children,
}: {
  id?: string;
  title: string;
  takeaway?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!id) return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id={id} className="group scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {id && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2 text-[11px] font-medium text-white/40 opacity-0 transition-all hover:bg-white/[0.08] hover:text-white group-hover:opacity-100"
            title="Copy link to this section"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy link</span>
              </>
            )}
          </button>
        )}
      </div>

      {takeaway && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-[13px] text-blue-200">
          <span className="font-semibold text-blue-300">Key Takeaway: </span>
          {takeaway}
        </div>
      )}

      <div className="space-y-3.5 text-[14.5px] leading-relaxed text-white/70">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="grid gap-2 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 text-[14px]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
          <span className="text-white/75">{it}</span>
        </li>
      ))}
    </ul>
  );
}
