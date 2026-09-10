"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calendar,
  Check,
  ChevronRight,
  Flame,
  Globe,
  Layers3,
  Lightbulb,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export function Hero() {
  const [persona, setPersona] = useState<"creator" | "marketer">("creator");

  const isCreator = persona === "creator";
  const brandColor = isCreator ? "#ff0a8a" : "#3b82f6";
  const brandSoft = isCreator ? "rgba(255,10,138,0.12)" : "rgba(59,130,246,0.12)";
  const brandBorder = isCreator ? "rgba(255,10,138,0.28)" : "rgba(59,130,246,0.28)";
  const brandShadow = isCreator
    ? "0 10px 30px rgba(255,10,138,0.25)"
    : "0 10px 30px rgba(59,130,246,0.25)";

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-44 lg:pb-36">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[850px] rounded-full opacity-20 blur-[130px] transition-colors duration-700"
          style={{
            background: isCreator
              ? "radial-gradient(circle, #ff0a8a 0%, transparent 70%)"
              : "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================================================================ */}
        {/* INTERACTIVE MODE TOGGLE PILL */}
        {/* ================================================================ */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1 rounded-2xl border border-white/[0.10] bg-[#161616]/90 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setPersona("creator")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                isCreator
                  ? "bg-[#ff0a8a] text-white shadow-[0_4px_18px_rgba(255,10,138,0.35)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setPersona("marketer")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                !isCreator
                  ? "bg-[#3b82f6] text-white shadow-[0_4px_18px_rgba(59,130,246,0.35)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Marketer Mode</span>
            </button>
          </motion.div>
        </div>

        {/* ================================================================ */}
        {/* MAIN HEADLINE & SUBTITLE */}
        {/* ================================================================ */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={persona + "-badge"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
              style={{
                background: brandSoft,
                border: `1px solid ${brandBorder}`,
                color: brandColor,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: brandColor }}
              />
              <span>
                {isCreator
                  ? "Brand Voice & Audience Studio"
                  : "Autonomous Marketing Operator & Social CRM"}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={persona + "-title"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="font-display text-4xl font-bold tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl leading-[1.06]"
            >
              {isCreator ? (
                <>
                  Create in your voice.{" "}
                  <span className="block text-[#ff0a8a]">
                    Grow on autopilot.
                  </span>
                </>
              ) : (
                <>
                  Turn scattered marketing into{" "}
                  <span className="block text-[#3b82f6]">
                    predictable revenue.
                  </span>
                </>
              )}
            </motion.h1>
          </AnimatePresence>

          {/* Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={persona + "-sub"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mt-6 text-base sm:text-lg leading-relaxed text-white/55 max-w-2xl mx-auto font-normal"
            >
              {isCreator
                ? "Research viral trends, compose signature multi-format posts with AI reflections, and schedule visual drag-and-drop calendars across 6+ networks."
                : "Deploy an AI marketing operator that tracks opportunities, converts comments & DMs into CRM deals, and executes multi-channel revenue campaigns."}
            </motion.p>
          </AnimatePresence>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link
              href="/signup"
              className="inline-flex h-13 items-center justify-center gap-2.5 rounded-xl px-7 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: brandColor,
                boxShadow: brandShadow,
              }}
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#dual-modes"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.03] px-6 text-sm font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <span>Explore Dual Modes</span>
              <ChevronRight className="h-4 w-4 text-white/40" />
            </a>
          </motion.div>

          {/* Trust points */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" style={{ color: brandColor }} />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" style={{ color: brandColor }} />
              <span>Instant 2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5" style={{ color: brandColor }} />
              <span>Supports 6+ social networks</span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* INTERACTIVE HIGH-FIDELITY PRODUCT SHOWCASE */}
        {/* ================================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-14 sm:mt-18"
        >
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.10] bg-[#171717] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
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
                    <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
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
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* METRIC STRIP SUMMARY */}
        {/* ================================================================ */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <KpiMetricCard number="10×" label="Faster Content Speed" sub="From idea to 6-platform draft in seconds" />
          <KpiMetricCard number="₦8.4M+" label="Managed Pipeline Revenue" sub="Attributed social sales and conversions" />
          <KpiMetricCard number="4.2×" label="Higher Lead Intent" sub="Automated comment & DM lead classification" />
          <KpiMetricCard number="6+" label="Connected Networks" sub="Instagram, TikTok, LinkedIn, YouTube, X, Threads" />
        </div>
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
    <div className="rounded-xl border border-white/[0.07] bg-[#161616] p-3">
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
    </div>
  );
}

function KpiMetricCard({
  number,
  label,
  sub,
}: {
  number: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616]/60 p-5 text-center">
      <div className="font-display text-3xl font-bold tracking-tight text-white">
        {number}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-white/80">
        {label}
      </div>
      <div className="mt-1 text-[11px] text-white/40">
        {sub}
      </div>
    </div>
  );
}

export default Hero;