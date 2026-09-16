"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  ChevronRight,
  Layers3,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/**
 * The homepage's product preview: one real environment rather than a wall of
 * screenshots.
 *
 * `overlay` renders floating cards around the app frame. They sit OUTSIDE the
 * frame element on purpose — the frame is overflow-hidden to contain its own
 * UI, so anything placed inside it that breaks the frame's edge gets cropped.
 */
export function DashboardShowcase({
  overlay,
  after,
}: {
  /** Floating cards positioned relative to the app frame. */
  overlay?: ReactNode;
  /** Content below the frame, e.g. links into the product pages. */
  after?: ReactNode;
} = {}) {
  const [persona, setPersona] = useState<"creator" | "marketer">("creator");

  const isCreator = persona === "creator";
  const brandColor = isCreator ? "#ff0a8a" : "#3b82f6";
  const brandSoft = isCreator ? "rgba(255,10,138,0.12)" : "rgba(59,130,246,0.12)";
  const brandBorder = isCreator ? "rgba(255,10,138,0.28)" : "rgba(59,130,246,0.28)";

  return (
    <section id="how-it-works" className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 scroll-mt-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-10 -translate-x-1/2 h-[450px] w-[800px] rounded-full opacity-20 blur-[130px] transition-colors duration-700"
          style={{
            background: isCreator
              ? "radial-gradient(circle, #ff0a8a 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* ================================================================ */}
        {/* INTERACTIVE MODE TOGGLE PILL */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center mb-10"
        >
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold border text-white/80 bg-white/5 border-white/10 shadow-sm backdrop-blur-md">
              <span
                className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
                style={{ background: brandColor }}
              />
              Interactive preview
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-white max-w-3xl">
            Everything your marketing needs.{" "}
            <span style={{ color: brandColor }} className="transition-colors duration-300">
              Connected by intelligence.
            </span>
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-white/60 max-w-xl">
            One workspace for creating, publishing, engaging and learning. Switch modes to see how it adapts to the way you work.
          </p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-2xl border border-white/[0.10] bg-[#161616]/90 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setPersona("creator")}
              className={`relative flex items-center gap-2 rounded-xl px-4.5 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] ${
                isCreator ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {isCreator && (
                <motion.div
                  layoutId="dashboard-mode-pill"
                  className="absolute inset-0 rounded-xl bg-[#ff0a8a] shadow-[0_4px_18px_rgba(255,10,138,0.35)]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Creator Mode</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPersona("marketer")}
              className={`relative flex items-center gap-2 rounded-xl px-4.5 py-2 text-xs font-semibold transition-colors duration-200 cursor-pointer before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-[''] ${
                !isCreator ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              {!isCreator && (
                <motion.div
                  layoutId="dashboard-mode-pill"
                  className="absolute inset-0 rounded-xl bg-[#3b82f6] shadow-[0_4px_18px_rgba(59,130,246,0.35)]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Target className="h-3.5 w-3.5" />
                <span>Marketer Mode</span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* INTERACTIVE HIGH-FIDELITY PRODUCT SHOWCASE FRAME */}
        {/* ================================================================ */}
        <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.10] bg-[#171717] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
        >
          {/* Window header */}
          <div className="flex h-12 items-center justify-between border-b border-white/[0.07] bg-[#141414] px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
              <span className="h-3 w-3 rounded-full bg-white/15" />
            </div>

            {/* URL bar indicator */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-1.5 text-xs text-white/45 font-mono">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: brandColor }}
              />
              <span>app.koraspace.ai/dashboard</span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase"
                style={{ background: brandColor }}
              >
                {persona}
              </span>
            </div>

            <div className="h-6 w-6 rounded-full border border-white/10 bg-white/[0.04]" />
          </div>

          {/* Dashboard Mockup Grid */}
          <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[190px_1fr] min-h-[460px] sm:min-h-[520px]">
            {/* Left Sidebar */}
            <div className="border-r border-white/[0.06] bg-[#151515] p-3 sm:p-4 flex flex-col justify-between">
              <div>
                {/* Workspace selector */}
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-xs"
                    style={{ background: brandColor }}
                  >
                    K
                  </div>
                  <div className="min-w-0 flex-1 hidden sm:block">
                    <div className="text-xs font-semibold text-white truncate">
                      Acme Workspace
                    </div>
                    <div className="text-[10px] text-white/35 capitalize">
                      {persona} Mode
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <div className="space-y-1">
                  {isCreator ? (
                    <>
                      <MockNavItem active icon={Sparkles} label="AI Studio" color={brandColor} />
                      <MockNavItem icon={Calendar} label="Visual Calendar" color={brandColor} />
                      <MockNavItem icon={TrendingUp} label="Viral Trends" color={brandColor} />
                      <MockNavItem icon={RefreshCw} label="Repurpose" color={brandColor} />
                      <MockNavItem icon={Users} label="Audience" color={brandColor} />
                      <MockNavItem icon={Layers3} label="Brand Kit" color={brandColor} />
                    </>
                  ) : (
                    <>
                      <MockNavItem active icon={Bot} label="Agent Operator" color={brandColor} />
                      <MockNavItem icon={Target} label="Campaigns" color={brandColor} />
                      <MockNavItem icon={Users} label="CRM & Leads" color={brandColor} />
                      <MockNavItem icon={Zap} label="Automations" color={brandColor} />
                      <MockNavItem icon={BarChart3} label="Attribution" color={brandColor} />
                      <MockNavItem icon={Layers3} label="Strategy" color={brandColor} />
                    </>
                  )}
                </div>
              </div>

              {/* Bottom status badge */}
              <div className="hidden sm:block rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <span className="h-2 w-2 rounded-full bg-[#34d399] motion-safe:animate-pulse" />
                  <span>Real-time Sync</span>
                </div>
              </div>
            </div>

            {/* Main Preview Content */}
            <div className="p-4 sm:p-7 bg-[#121212] overflow-x-hidden flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {isCreator ? (
                  <motion.div
                    key="creator-preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Top Metric Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MockStat label="Total Reach" value="482.4K" change="+28.4%" positive color="#ff0a8a" />
                      <MockStat label="Engagement" value="6.82%" change="+1.4%" positive color="#ff0a8a" />
                      <MockStat label="Scheduled" value="18 Posts" change="All synced" positive color="#ff0a8a" />
                      <MockStat label="AI Content Score" value="96/100" change="Optimal voice" positive color="#ff0a8a" />
                    </div>

                    {/* Main Workspace Card: AI Compose Studio */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#181818] p-4 sm:p-5">
                      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ff0a8a]/20 text-[#ff0a8a]">
                            <Sparkles className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-white">
                            Active AI Generation • Signature Brand Voice
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] text-white/50">Instagram</span>
                          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] text-white/50">LinkedIn</span>
                          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] text-white/50">TikTok</span>
                        </div>
                      </div>

                      {/* Post content preview */}
                      <div className="rounded-xl border border-white/[0.06] bg-[#141414] p-3.5">
                        <p className="text-xs font-semibold text-[#ff7fba]">
                          Hook: 3 AI strategies modern creators are using to scale audience in 2026.
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-white/70">
                          Most creators focus on raw volume. The top 1% build repeatable audience loops.
                          Here is the 4-step framework we used to 10x distribution while cutting editing time in half...
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40">
                          <span>#CreatorEconomy</span>
                          <span>#BrandGrowth</span>
                          <span>#AIWorkflow</span>
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-white/45">
                          <Check className="h-3.5 w-3.5 text-[#34d399]" />
                          <span>8-step brand reflection passed</span>
                        </div>

                        <button className="rounded-xl bg-[#ff0a8a] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(255,10,138,0.25)]">
                          Schedule to 5 Platforms
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="marketer-preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Top Metric Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MockStat label="Managed Revenue" value="₦8.42M" change="+34.2%" positive color="#3b82f6" />
                      <MockStat label="Pipeline ROAS" value="3.42×" change="+0.62x" positive color="#3b82f6" />
                      <MockStat label="Qualified Leads" value="1,284" change="+182 this week" positive color="#3b82f6" />
                      <MockStat label="Agent Actions" value="94 Done" change="4 awaiting" positive color="#3b82f6" />
                    </div>

                    {/* Main Workspace Card: Marketing Operator & CRM Queue */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#181818] p-4 sm:p-5">
                      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#3b82f6]/20 text-[#60a5fa]">
                            <Bot className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-white">
                            AI Operator Action Queue • High-Intent Triage
                          </span>
                        </div>

                        <span className="rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#60a5fa]">
                          4 Awaiting Approval
                        </span>
                      </div>

                      {/* Leads row preview */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#141414] p-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]/20 text-xs font-bold text-[#60a5fa]">
                              EK
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                Emeka Kalu • Growth Lead at Paystack
                              </div>
                              <div className="text-[10px] text-white/45">
                                Commented: &quot;What are the team workspace limits on Pro plan?&quot;
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#34d399]/15 text-[#34d399] px-2 py-1 text-[10px] font-semibold">
                              Score: 94 (Hot)
                            </span>
                            <button className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-[11px] font-semibold text-white">
                              Approve DM
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#141414] p-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-xs font-bold text-white/70">
                              SA
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                Sarah Adams • Founder at Designly
                              </div>
                              <div className="text-[10px] text-white/45">
                                Campaign &quot;Black Friday Early Access&quot; scale recommendation +20%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#3b82f6]/15 text-[#60a5fa] px-2 py-1 text-[10px] font-semibold">
                              ROAS: 4.1x
                            </span>
                            <button className="rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/[0.08]">
                              Apply Scale
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom mini status */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/35">
                <span>KoraSpace v2.4 • Active Workspace Node</span>
                <span>Unified Intelligence Cloud</span>
              </div>
            </div>
          </div>
        </motion.div>

          {overlay}
        </div>

        {/* A metric strip used to sit here claiming "₦8.4M+ managed pipeline
            revenue", "10× faster content" and "4.2× higher lead intent", plus
            LinkedIn and TikTok as connected networks. None of it is backed by
            real customers or the PRD, so it was removed rather than reworded. */}
        {after}
      </div>
    </section>
  );
}

function MockNavItem({
  icon: Icon,
  label,
  active = false,
  color,
}: {
  icon: typeof Sparkles;
  label: string;
  active?: boolean;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-white/40 hover:text-white/70"
      }`}
    >
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: active ? color : undefined }}
      />
      <span className="truncate hidden sm:inline">{label}</span>
    </div>
  );
}

function MockStat({
  label,
  value,
  change,
  positive = true,
  color,
}: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-white/[0.07] bg-[#161616] p-3 cursor-default"
    >
      <div className="text-[10px] text-white/40 truncate">{label}</div>
      <div className="mt-1 text-base font-bold text-white tracking-tight">
        {value}
      </div>
      <div
        className="mt-1 text-[10px] font-medium"
        style={{ color: positive ? "#34d399" : color }}
      >
        {change}
      </div>
    </motion.div>
  );
}


export default DashboardShowcase;

