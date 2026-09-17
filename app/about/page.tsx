"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Shield,
  Users,
  Globe2,
  TrendingUp,
  Brain,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Target,
  Heart,
  Layers,
  Lock,
  MessageSquare,
  BarChart3,
  Cpu,
  Workflow,
  Sparkle,
  Share2,
  Award,
  ChevronRight,
} from "lucide-react";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { SiteFooter } from "@/components/landing/LowerSections";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const STATS = [
  { value: "10+", label: "Social Platforms Supported", detail: "Instagram, TikTok, X, LinkedIn, YouTube & more" },
  { value: "500k+", label: "AI Posts & Assets Generated", detail: "Trained across diverse brand voices & industries" },
  { value: "10x", label: "Faster Publishing Velocity", detail: "From raw idea to multi-channel deployment" },
  { value: "99.99%", label: "Multi-Region Uptime", detail: "Prisma PostgreSQL with real-time backup sync" },
];

const PILLARS = [
  {
    icon: Brain,
    title: "Autonomous Cognitive Brain",
    badge: "Intelligence",
    tone: "pink",
    description:
      "Unlike generic chatbots, Koraspace builds a deep, persistent memory profile of your brand voice, tone guidelines, target audience psychology, and past top performers to generate high-converting content effortlessly.",
  },
  {
    icon: Workflow,
    title: "Multi-Agent Workflow Engine",
    badge: "Automation",
    tone: "blue",
    description:
      "Specialized AI agents collaborate synchronously: Trend Agent monitors viral hooks, Composer crafts platform-native copy, Repurposer formats for video and threads, and Ghost Mode triages social DMs and comments.",
  },
  {
    icon: Target,
    title: "Closed-Loop Revenue CRM",
    badge: "Attribution",
    tone: "emerald",
    description:
      "We bridge the gap between social engagement and actual revenue. Capture inbound buyer inquiries from comments and messages directly into an automated Kanban CRM with precise ROI attribution.",
  },
  {
    icon: Shield,
    title: "Enterprise Zero-Trust Security",
    badge: "Protection",
    tone: "purple",
    description:
      "Your social tokens and confidential brand assets are encrypted using AES-256-GCM authentication keys. Multi-tenant database isolation and automated backup redundancy keep your data protected 24/7.",
  },
];

const VALUES = [
  {
    icon: Sparkles,
    title: "Creator-Centric Innovation",
    text: "We build tools that amplify human creativity rather than replacing it. Our AI takes care of tedious scheduling, repurposing, and inbox triage so you can focus on high-impact strategy.",
  },
  {
    icon: Lock,
    title: "Uncompromising Privacy & Trust",
    text: "Your data belongs solely to you. We never train public foundation models on your private drafts, CRM leads, or proprietary business information.",
  },
  {
    icon: Globe2,
    title: "Global Scale, Local Relevance",
    text: "Built to serve global creators and fast-growing enterprises alike, with multi-language localization, regional payment options, and geo-aware trend intelligence.",
  },
  {
    icon: Zap,
    title: "Speed & Continuous Evolution",
    text: "Social algorithms evolve daily, and so do our models. We continuously deploy real-time intelligence upgrades to keep your brand ahead of algorithmic shifts.",
  },
];

const TIMELINE = [
  {
    year: "Phase 1: The Genesis",
    title: "Tackling Social Workflow Fragmentation",
    desc: "Frustrated by juggling 8 disconnected tools for copy, video repurposing, scheduling, analytics, and CRM, the foundation for a unified AI social operating system was born.",
  },
  {
    year: "Phase 2: The Agentic Leap",
    title: "Introducing Ghost Mode & Autonomous Agents",
    desc: "Pioneered multi-agent collaboration with Ghost Mode for real-time DM/comment lead triage and localized viral trend detection.",
  },
  {
    year: "Phase 3: Enterprise Architecture",
    title: "PostgreSQL Migration & Global Sync Engine",
    desc: "Re-engineered the platform with Prisma ORM, Supabase connection pooling, automated 3-hour Neon backup sync, and next-generation NextAuth security.",
  },
  {
    year: "Phase 4: The Next Frontier",
    title: "Continuous Closed-Loop Social Commerce",
    desc: "Scaling autonomous marketing workflows, direct ecommerce integrations, multi-client agency portals, and predictive revenue modeling for brands worldwide.",
  },
];

export default function AboutPage() {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <div className="relative min-h-screen transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-[#121212] dark:text-white selection:bg-[#ff0a8a]/20 selection:text-[#ff0a8a]">
      <FloatingNav />

      <main className="pt-28 pb-20">
        {/* ── 1. Hero Section ────────────────────────────────────────── */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#ff0a8a]/15 via-[#3b82f6]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 dark:border-white/[0.12] dark:bg-white/[0.04] px-4 py-1.5 backdrop-blur-md shadow-xs mb-6"
            >
              <Sparkle className="h-4 w-4 text-[#ff0a8a]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white/80">
                About Koraspace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              The Autonomous OS for{" "}
              <span className="bg-gradient-to-r from-[#ff0a8a] via-[#ec4899] to-[#3b82f6] bg-clip-text text-transparent">
                Modern Social Growth
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-6 text-base sm:text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto leading-relaxed"
            >
              We are building the intelligent operating system that bridges creative content, autonomous multi-platform publishing, real-time community engagement, and measurable revenue attribution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#ff0a8a] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(255,10,138,0.3)] hover:bg-[#ff299b] transition-all hover:scale-105"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-100 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] transition-all shadow-xs"
              >
                <span>Explore Platform</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── 2. Numbers & Scale ─────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STATS.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.45 }}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-[#171717] shadow-sm transition-all"
                >
                  <p className="font-display text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    <span className={idx % 2 === 0 ? "text-[#ff0a8a]" : "text-[#3b82f6]"}>
                      {stat.value}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50 leading-normal">
                    {stat.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Our Mission & Origin Story ──────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-6 space-y-6"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-500">
                  <Rocket className="h-3.5 w-3.5" />
                  <span>The Story of Koraspace</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Born to solve the chaos of modern social media operations.
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-white/70 leading-relaxed">
                  As creators and marketing teams scale, their operations quickly splinter across dozens of isolated apps: text generation tools, video editors, calendar schedulers, CRM tables, analytics dashboards, and DM inboxes.
                </p>

                <p className="text-sm sm:text-base text-slate-600 dark:text-white/70 leading-relaxed">
                  Context is lost, brand voice drifts, inquiries go unanswered, and hours are wasted on repetitive copy-pasting.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/[0.08] dark:bg-[#1a1a1a] p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#ff0a8a]" />
                    <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 dark:text-white">
                      Our Core Thesis
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-white/80 italic leading-relaxed">
                    &ldquo;Social media should not be a manual full-time grind of repetitive tasks. With the right cognitive architecture, AI can autonomously handle execution while creators and marketers steer the creative vision.&rdquo;
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-6"
              >
                <div className="relative rounded-3xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-[#161616] p-7 sm:p-9 shadow-lg">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-[#ff0a8a]/10 to-transparent rounded-tr-3xl pointer-events-none" />

                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                    <Layers className="h-5 w-5 text-[#ff0a8a]" />
                    <span>How Koraspace Changes the Game</span>
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Single Source of Truth",
                        text: "One central Brand Brain remembers your exact tone, products, and messaging rules across all channels.",
                      },
                      {
                        title: "Autonomous Ghost Triage",
                        text: "Real-time AI monitoring replies to comments and routes prospective buyers straight to your sales pipeline.",
                      },
                      {
                        title: "Visual 2.0 Drag & Drop",
                        text: "Multi-platform scheduling matrix with automated best-time-to-post algorithms tailored to each platform.",
                      },
                      {
                        title: "Multi-Brand Collaboration",
                        text: "Agency-ready workspaces, team role permissions, and client approval workflows built right in.",
                      },
                    ].map((item, i) => (
                      <div key={item.title} className="flex items-start gap-3.5">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#34d399]/15 text-[#34d399]">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── 4. The 4 Technology Pillars ────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-100/60 dark:bg-[#161616]/50 border-y border-slate-200 dark:border-white/[0.06]">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ff0a8a]/20 bg-[#ff0a8a]/10 px-3.5 py-1 text-xs font-bold text-[#ff0a8a]">
                <Cpu className="h-3.5 w-3.5" />
                <span>Architectural Foundations</span>
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Engineered for Precision, Scale, and Reliability
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-white/65">
                Koraspace integrates state-of-the-art LLMs, real-time web scrapers, and enterprise database systems into a unified platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isPink = pillar.tone === "pink";
                const isBlue = pillar.tone === "blue";
                const isEmerald = pillar.tone === "emerald";
                const badgeColor = isPink
                  ? "text-[#ff0a8a] bg-[#ff0a8a]/10 border-[#ff0a8a]/20"
                  : isBlue
                  ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20"
                  : isEmerald
                  ? "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20"
                  : "text-purple-400 bg-purple-500/10 border-purple-500/20";

                return (
                  <motion.div
                    key={pillar.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ y: -6 }}
                    className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 dark:border-white/[0.08] dark:bg-[#1a1a1a] shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-900 dark:text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${badgeColor}`}
                      >
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-white/65 leading-relaxed">
                      {pillar.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. Our Guiding Principles ──────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 dark:border-white/[0.10] dark:bg-white/[0.05] px-3.5 py-1 text-xs font-bold text-slate-700 dark:text-white/80">
                <Heart className="h-3.5 w-3.5 text-[#ff0a8a]" />
                <span>Our Principles</span>
              </div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Values That Drive Our Engineering
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val, i) => {
                const Icon = val.icon;
                return (
                  <motion.div
                    key={val.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.45 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/[0.08] dark:bg-[#171717] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center text-slate-900 dark:text-white mb-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {val.title}
                      </h3>
                      <p className="mt-2.5 text-xs text-slate-600 dark:text-white/60 leading-relaxed">
                        {val.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 6. Evolution Timeline ──────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-100/60 dark:bg-[#161616]/40 border-y border-slate-200 dark:border-white/[0.06]">
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Koraspace Roadmap & Journey
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
                From initial spark to enterprise-grade autonomous social marketing engine.
              </p>
            </div>

            <div className="space-y-6">
              {TIMELINE.map((item, idx) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#181818] p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                >
                  <div className="space-y-1 sm:max-w-xl">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff0a8a]">
                      {item.year}
                    </span>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-white/65 leading-relaxed pt-1">
                      {item.desc}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-white">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Final Call To Action ────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-[#161616] p-8 sm:p-14 shadow-lg text-center overflow-hidden"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-r from-[#ff0a8a]/20 to-[#3b82f6]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#ff0a8a]/10 text-[#ff0a8a] border border-[#ff0a8a]/20">
                Join Koraspace Today
              </span>

              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                Ready to transform your social presence?
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-white/65 leading-relaxed">
                Experience the power of autonomous AI composing, visual multi-channel scheduling, and Ghost Mode CRM lead capture.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#ff0a8a] px-8 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(255,10,138,0.3)] hover:bg-[#ff299b] transition-all hover:scale-105"
                >
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 px-7 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-200 dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08] transition-all"
                >
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
