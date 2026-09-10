/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Brain,
  Ghost,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  Send,
  ArrowRight,
  Check,
  Users,
  Zap,
  Search,
  Globe,
  Briefcase,
  MessageCircle,
  ChevronDown,
  Activity,
  RefreshCw,
  Eye,
  Flame,
  Award,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

/* ── Animation Physics & Variants ─────────────────────────────────── */

const springTransition = {
  type: "spring" as const,
  stiffness: 110,
  damping: 18,
  mass: 0.8,
};

const cardHoverSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: springTransition,
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: springTransition,
  },
};

/* ── Shared Action Button ─────────────────────────────────────────── */

function LandingButton({
  href,
  className = "",
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={cardHoverSpring}
        style={style}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition-colors duration-200 cursor-pointer ${className}`}
      >
        {children}
      </motion.button>
    </Link>
  );
}

/* ── Section Eyebrow & Header ─────────────────────────────────────── */

function Eyebrow({
  children,
  tone = "pink",
}: {
  children: React.ReactNode;
  tone?: "pink" | "blue" | "white";
}) {
  const toneClass =
    tone === "blue"
      ? "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/25 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      : tone === "white"
      ? "text-white/80 bg-white/5 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
      : "text-[#ff0a8a] bg-[#ff0a8a]/10 border-[#ff0a8a]/25 shadow-[0_0_15px_rgba(255,10,138,0.15)]";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold border ${toneClass}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full animate-pulse"
        style={{
          background:
            tone === "blue" ? "#3b82f6" : tone === "white" ? "#ffffff" : "#ff0a8a",
        }}
      />
      {children}
    </motion.span>
  );
}

function SectionHead({
  eyebrow,
  tone = "pink",
  title,
  sub,
}: {
  eyebrow: string;
  tone?: "pink" | "blue" | "white";
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={springTransition}
      className="mx-auto mb-14 max-w-3xl text-center"
    >
      <div>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      </div>
      <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/60 font-normal max-w-2xl mx-auto">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/* ── 1. Problem Solver Section ────────────────────────────────────── */

export function ProblemSolverSection() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="relative mx-auto max-w-6xl rounded-3xl border border-white/[0.08] bg-[#161616] p-8 sm:p-12 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Animated accent border at top */}
        <motion.div
          animate={{
            scaleX: [0.85, 1.15, 0.85],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-[#ff0a8a] via-white/50 to-[#3b82f6] rounded-full blur-[0.5px]"
        />

        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow tone="white">The Old Way vs The KoraSpace Way</Eyebrow>

          <h2 className="mt-5 font-display text-2xl sm:text-4xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
            Stop wasting 15+ hours a week fighting writer&apos;s block, copying
            posts between apps, and losing high-intent leads in messy DMs.
          </h2>

          <p className="mt-5 text-sm sm:text-base text-white/60 leading-relaxed font-normal">
            Traditional schedulers only push posts. KoraSpace is an autonomous
            growth workspace with dual engines: a <span className="text-[#ff0a8a] font-semibold">Creator Studio</span> for signature voice content and a <span className="text-[#3b82f6] font-semibold">Marketing Operator</span> for CRM lead conversion.
          </p>

          {/* 3 Pillars Grid with Staggered Entrance and 3D Spring Hover */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"
          >
            <motion.div
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(255,10,138,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-2xl border border-white/[0.07] bg-[#1a1a1a] p-5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff0a8a]/15 text-[#ff0a8a] mb-3">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Brand Brain</h3>
              <p className="mt-1.5 text-xs text-white/55 leading-relaxed">
                Learns your authentic voice, past top-performing hooks, and strict guidelines so posts never sound generic.
              </p>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(59,130,246,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-2xl border border-white/[0.07] bg-[#1a1a1a] p-5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b82f6]/15 text-[#3b82f6] mb-3">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-white">Visual 6-Platform Sync</h3>
              <p className="mt-1.5 text-xs text-white/55 leading-relaxed">
                Schedule and drag-and-drop across Instagram, TikTok, LinkedIn, YouTube, X, and Threads in one calendar.
              </p>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(52,211,153,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-2xl border border-white/[0.07] bg-[#1a1a1a] p-5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#34d399]/15 text-[#34d399] mb-3">
                <Target className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-white">Social CRM &amp; Revenue</h3>
              <p className="mt-1.5 text-xs text-white/55 leading-relaxed">
                Detects buying signals in comments and DMs (&quot;How much?&quot;), converts leads, and attributes real revenue.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3.5"
          >
            <LandingButton
              href="/signup"
              className="bg-[#ff0a8a] text-white shadow-[0_4px_20px_rgba(255,10,138,0.3)] hover:bg-[#ff299b]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </LandingButton>
            <LandingButton
              href="#dual-modes"
              className="border border-white/[0.10] bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              <span>Compare Dual Modes</span>
            </LandingButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 2. Dual-Mode Showcase Section (#dual-modes) ─────────────────── */

export function DualModeShowcaseSection() {
  return (
    <section id="dual-modes" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Two Distinct Operating Modes"
          tone="pink"
          title={
            <>
              Built for <span className="text-[#ff0a8a]">Creators</span> &amp;{" "}
              <span className="text-[#3b82f6]">Marketing Teams</span>
            </>
          }
          sub="Switch seamlessly between Creator Mode and Marketer Mode depending on whether you are crafting signature content or running an autonomous revenue campaign."
        />

        {/* Dual Cards Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creator Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={cardHoverSpring}
            className="relative rounded-3xl border border-[#ff0a8a]/25 bg-[#171717] p-8 shadow-[0_15px_45px_rgba(255,10,138,0.08)] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#ff0a8a]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-4 right-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff0a8a]/15 px-3 py-1 text-[11px] font-bold text-[#ff0a8a] border border-[#ff0a8a]/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Creator Mode</span>
              </span>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff0a8a]/15 text-[#ff0a8a] mb-5 border border-[#ff0a8a]/30">
                <Sparkles className="h-6 w-6" />
              </div>

              <h3 className="font-display text-2xl font-bold text-white">
                Brand Voice &amp; Audience Studio
              </h3>
              <p className="mt-2.5 text-sm text-white/60 leading-relaxed">
                For solo creators, thought leaders, and influencers who need to publish consistent, high-impact content across 6+ platforms without burning out.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "AI Composing Pipeline",
                    desc: "8-step AI workflow: voice match, web research, draft scoring, and reflection.",
                  },
                  {
                    title: "Visual Drag-and-Drop Calendar",
                    desc: "Plan and rearrange weekly schedules across Instagram, TikTok, LinkedIn, and X.",
                  },
                  {
                    title: "Content Repurposer",
                    desc: "Turn 1 YouTube video or article into 6 platform-native drafts instantly.",
                  },
                  {
                    title: "Viral Trend Radar & Idea Lab",
                    desc: "Real-time niche trend monitoring with instant \"Turn into Draft\" actions.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-[#141414] p-3 transition-colors hover:border-[#ff0a8a]/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#ff0a8a] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <p className="text-[11px] text-white/50">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.07] flex items-center justify-between">
              <span className="text-xs font-mono text-[#ff0a8a] font-semibold">Theme: Kora Pink (#ff0a8a)</span>
              <LandingButton
                href="/signup"
                className="bg-[#ff0a8a] text-white shadow-[0_4px_16px_rgba(255,10,138,0.25)] hover:bg-[#ff299b]"
              >
                <span>Launch Creator Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </LandingButton>
            </div>
          </motion.div>

          {/* Marketer Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={cardHoverSpring}
            className="relative rounded-3xl border border-[#3b82f6]/25 bg-[#171717] p-8 shadow-[0_15px_45px_rgba(59,130,246,0.08)] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-4 right-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6]/15 px-3 py-1 text-[11px] font-bold text-[#3b82f6] border border-[#3b82f6]/30">
                <Target className="h-3.5 w-3.5" />
                <span>Marketer Mode</span>
              </span>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b82f6]/15 text-[#3b82f6] mb-5 border border-[#3b82f6]/30">
                <Target className="h-6 w-6" />
              </div>

              <h3 className="font-display text-2xl font-bold text-white">
                Marketing Operator &amp; Social CRM
              </h3>
              <p className="mt-2.5 text-sm text-white/60 leading-relaxed">
                For marketing teams, agencies, and businesses looking to automate lead triage, campaign execution, and full-funnel revenue attribution.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "AI Marketing Operator",
                    desc: "Action queue prioritizing high-intent leads, budget reallocations, and approval tasks.",
                  },
                  {
                    title: "Lead Intelligence & CRM Pipeline",
                    desc: "Drag-and-drop Kanban board classifying leads from social comments and DMs.",
                  },
                  {
                    title: "Multi-Channel Campaigns Engine",
                    desc: "Server-side stats tracking real-time ROAS, spend, clicks, and qualified conversions.",
                  },
                  {
                    title: "Agency Workspaces & Approvals",
                    desc: "Manage multiple client brands with strict RLS permissions and shareable approval links.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-[#141414] p-3 transition-colors hover:border-[#3b82f6]/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#3b82f6] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <p className="text-[11px] text-white/50">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.07] flex items-center justify-between">
              <span className="text-xs font-mono text-[#3b82f6] font-semibold">Theme: Kora Blue (#3b82f6)</span>
              <LandingButton
                href="/signup"
                className="bg-[#3b82f6] text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)] hover:bg-[#2563eb]"
              >
                <span>Launch Marketer Operator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </LandingButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 3. Growth Loop Section (#how) ────────────────────────────────── */

const LOOP_STAGES = [
  {
    num: "01",
    title: "Understand & Research",
    desc: "Scans your brand guidelines, past viral winners, and real-time social trends across your niche.",
    icon: Search,
    color: "#ff0a8a",
    badge: "Brand Brain",
  },
  {
    num: "02",
    title: "Strategize & Compose",
    desc: "Executes an 8-step AI pipeline with tone-matching, draft scoring, and reflection before final output.",
    icon: Sparkles,
    color: "#ec4899",
    badge: "AI Composer",
  },
  {
    num: "03",
    title: "Publish & Triage",
    desc: "Auto-schedules across 6+ networks and triages incoming comments & DMs with high-intent lead detection.",
    icon: Calendar,
    color: "#3b82f6",
    badge: "Multi-Platform CRM",
  },
  {
    num: "04",
    title: "Measure & Optimize",
    desc: "Attributes social clicks to real pipeline revenue and automatically feeds insights into future strategy.",
    icon: RefreshCw,
    color: "#2563eb",
    badge: "Closed-Loop Growth",
  },
];

export function GrowthLoopSection() {
  return (
    <section id="how" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          eyebrow="The Autonomous Growth Loop"
          tone="white"
          title="Social media marketing that continuously optimizes itself."
          sub="Buffer and Hootsuite make you do everything manually. KoraSpace connects understanding, creation, distribution, and revenue attribution in a single automated loop."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {LOOP_STAGES.map((s) => (
            <motion.div
              key={s.num}
              variants={itemFadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={cardHoverSpring}
              className="relative flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#171717] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors hover:border-white/20 hover:bg-[#1a1a1a]"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="font-mono text-base font-extrabold tracking-wider"
                    style={{ color: s.color }}
                  >
                    #{s.num}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}35`,
                      color: s.color,
                    }}
                  >
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-semibold">
                  {s.badge}
                </span>

                <h3 className="font-display mt-3 text-lg font-bold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/55 font-normal">
                  {s.desc}
                </p>
              </div>

              <div
                className="mt-6 flex items-center gap-1.5 text-xs font-bold"
                style={{ color: s.color }}
              >
                <span>Feeds next stage</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 4. Alternating FeatureSection Layout ─────────────────────────── */

interface FeatureProps {
  badge?: string;
  tone?: "pink" | "blue";
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageLeft?: boolean;
}

export function FeatureSection({
  badge,
  tone = "pink",
  title,
  description,
  imageUrl,
  imageAlt,
  imageLeft = true,
}: FeatureProps) {
  const isBlue = tone === "blue";
  const brandColor = isBlue ? "#3b82f6" : "#ff0a8a";

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
      {/* Visual Image Preview with Spring Float & Hover */}
      <motion.div
        initial={{ opacity: 0, x: imageLeft ? -30 : 30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className={`flex-1 w-full ${imageLeft ? "md:order-1" : "md:order-2"}`}
      >
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={cardHoverSpring}
          className="relative rounded-3xl border border-white/[0.10] bg-[#161616] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-[300px] sm:h-[360px] rounded-2xl object-cover object-top border border-white/10"
          />
        </motion.div>
      </motion.div>

      {/* Content Text with Staggered Entrance */}
      <motion.div
        initial={{ opacity: 0, x: imageLeft ? 30 : -30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className={`flex-1 space-y-4 ${imageLeft ? "md:order-2" : "md:order-1"}`}
      >
        {badge && <Eyebrow tone={tone}>{badge}</Eyebrow>}

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-white/60 font-normal leading-relaxed">
          {description}
        </p>

        <div className="pt-2">
          <LandingButton
            href="/signup"
            className="text-white"
            style={{
              background: brandColor,
              boxShadow: `0 4px 18px ${brandColor}35`,
            }}
          >
            <span>Explore Feature</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </LandingButton>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 5. Interactive FeatureShowcase (#engines) ────────────────────── */

interface FeatureNode {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tone: "pink" | "blue";
  icon: React.ComponentType<{ className?: string }>;
  screenPath: string;
}

const FEATURE_SET_DATA: FeatureNode[] = [
  {
    id: "ai-composer",
    title: "AI Composing Pipeline",
    tagline: "Multi-Step Reflection Engine",
    description:
      "Executes an 8-step AI workflow: checks brand voice guidelines -> analyzes past viral posts -> scans real-time niche trends -> drafts post & caption -> assigns hashtag clusters -> double web reflections.",
    tone: "pink",
    icon: Sparkles,
    screenPath: "/features/Kora-AI-Composer.jpg",
  },
  {
    id: "visual-calendar",
    title: "Visual Drag-and-Drop Calendar",
    tagline: "Multi-Platform Scheduling",
    description:
      "A fast, unified planning board to schedule, rearrange, and manage scheduled posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly.",
    tone: "pink",
    icon: Calendar,
    screenPath: "/features/Visual-Drag-and-Drop Calendar.jpg",
  },
  {
    id: "repurposer",
    title: "Content Repurposer",
    tagline: "1 Asset to 6 Formats",
    description:
      "Transform a single YouTube video, podcast transcript, or article into LinkedIn carousels, X threads, Instagram captions, TikTok scripts, and newsletters with one click.",
    tone: "pink",
    icon: RefreshCw,
    screenPath: "/features/social-media-concept-with-device.jpg",
  },
  {
    id: "inbox-crm",
    title: "Social CRM & Lead Triage",
    tagline: "High-Intent Signal Detection",
    description:
      "Unified social inbox that classifies comments and DMs into Leads, Support, or Inquiries. Automatically flags buying questions ('How much is this?') and creates CRM opportunities.",
    tone: "blue",
    icon: DollarSign,
    screenPath: "/features/social-ecommerce.jpg",
  },
  {
    id: "agency-workspaces",
    title: "Agency Workspaces & Client Portals",
    tagline: "Multi-Seat Collaboration",
    description:
      "Built for marketing agencies and growth teams. Manage multiple client workspaces with strict RLS permissions, shareable approval links, and white-label reporting.",
    tone: "blue",
    icon: Users,
    screenPath: "/features/manage-multiple-brands.jpg",
  },
  {
    id: "growth-marketing",
    title: "Revenue & ROAS Attribution",
    tagline: "Full-Funnel Analytics",
    description:
      "Track the journey from social impressions to website visits, qualified CRM leads, and closed revenue. Identify high-ROI campaigns with verifiable Naira / dollar conversion data.",
    tone: "blue",
    icon: TrendingUp,
    screenPath: "/features/social-media-marketing.jpg",
  },
];

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURE_SET_DATA[activeIndex];

  return (
    <section id="engines" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="rounded-3xl border border-white/[0.08] bg-[#161616] p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header Text with Smooth AnimatePresence */}
        <div className="text-center max-w-3xl mx-auto mb-8 min-h-[140px] flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <Eyebrow tone={activeFeature.tone}>
                {activeFeature.tagline}
              </Eyebrow>

              <h3 className="font-display mt-3 text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {activeFeature.title}
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl mx-auto">
                {activeFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Display Mockup Frame with Smooth Crossfade */}
        <div className="relative w-full max-w-4xl mx-auto aspect-16/10 rounded-2xl overflow-hidden border border-white/[0.10] bg-black shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeFeature.screenPath}
              src={activeFeature.screenPath}
              alt={activeFeature.title}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-cover object-top"
            />
          </AnimatePresence>
        </div>

        {/* Tab Navigation Matrix with Sliding layoutId Pill */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {FEATURE_SET_DATA.map((feat, idx) => {
            const Icon = feat.icon;
            const isSelected = idx === activeIndex;
            const featColor = feat.tone === "blue" ? "#3b82f6" : "#ff0a8a";

            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-white/20 text-white shadow-sm"
                    : "border-white/[0.06] text-white/50 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="feature-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/25 -z-0"
                    transition={springTransition}
                  />
                )}

                <div
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg mb-2 transition-colors"
                  style={{
                    background: isSelected ? `${featColor}20` : "rgba(255,255,255,0.05)",
                    color: isSelected ? featColor : "inherit",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="relative z-10 text-xs font-semibold tracking-tight truncate w-full">
                  {feat.title}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/* ── 6. Brand Brain & 8-Agent Swarm (#brain) ──────────────────────── */

const AGENT_SWARM = [
  { name: "Research Agent", role: "Scans viral niche trends & web data", icon: Search },
  { name: "Brand Voice Guard", role: "Guarantees authentic tone & formatting", icon: ShieldCheck },
  { name: "Content Studio Agent", role: "Drafts captions, carousels & scripts", icon: FileText },
  { name: "Strategy Agent", role: "Builds 30/60/90 day growth roadmaps", icon: Target },
  { name: "Analytics Agent", role: "Tracks funnel metrics & revenue ROAS", icon: BarChart3 },
  { name: "Competitor Spy Agent", role: "Monitors rival formats & engagement hooks", icon: Eye },
  { name: "Engagement Triage Agent", role: "Manages DMs & flags hot CRM leads", icon: MessageSquare },
  { name: "Optimization Agent", role: "Calculates post scores & A/B performance", icon: Activity },
];

export function BrainAndAgentsSection() {
  return (
    <section id="brain" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="AI Multi-Agent Architecture"
          tone="pink"
          title={
            <>
              Powered by the <span className="text-[#ff0a8a]">Kora Brand Brain</span> &amp;{" "}
              <span className="text-[#3b82f6]">8-Agent Swarm</span>
            </>
          }
          sub="Instead of generic one-shot prompts, KoraSpace deploys a coordinated swarm of specialized agents connected to your persistent knowledge base."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          {/* Brand Brain Card with Glowing Memory Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -6 }}
            transition={cardHoverSpring}
            className="relative lg:col-span-5 rounded-3xl border border-[#ff0a8a]/25 bg-[#171717] p-7 sm:p-8 flex flex-col justify-between overflow-hidden"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-48 h-48 bg-[#ff0a8a] rounded-full blur-3xl pointer-events-none"
            />

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff0a8a]/15 text-[#ff0a8a] border border-[#ff0a8a]/30 mb-5">
                <Brain className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#ff0a8a] font-bold">
                Persistent Knowledge Base
              </span>
              <h3 className="font-display mt-2 text-2xl font-bold text-white">
                KoraSpace Brand Brain
              </h3>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-white/60 font-normal">
                Upload your website URL, product briefs, brand guidelines, and top-performing past posts. The Brand Brain builds a persistent memory profile so every post sounds authentically like your brand.
              </p>

              <div className="mt-6 space-y-2 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#ff0a8a]" />
                  <span>Learns signature tone, vocabulary, and emoji rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#ff0a8a]" />
                  <span>Enforces custom guardrails (&quot;Never mention competitors&quot;)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#ff0a8a]" />
                  <span>Uses winning historical content as benchmark truth</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Memory Status: Active</span>
                <span className="text-[#34d399] font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
                  100% Isolated RLS Data
                </span>
              </div>
            </div>
          </motion.div>

          {/* 8-Agent Swarm Grid with Staggered Entrance */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {AGENT_SWARM.map((ag) => (
              <motion.div
                key={ag.name}
                variants={itemFadeUp}
                whileHover={{ x: 6, scale: 1.02, borderColor: "rgba(59,130,246,0.3)" }}
                transition={cardHoverSpring}
                className="flex items-center gap-3.5 rounded-2xl border border-white/[0.07] bg-[#171717] p-4 transition-colors hover:bg-[#1a1a1a]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]/15 text-[#3b82f6]">
                  <ag.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{ag.name}</h4>
                  <p className="text-[11px] text-white/50 truncate">{ag.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Agent Tools Grid (#tools / #features) ─────────────────────── */

const AGENT_TOOLS_LIST = [
  {
    title: "8-Step AI Composing Pipeline",
    desc: "Checks niche context, past posts, active trends, drafts content, assigns hashtag sets, and reflects before publishing.",
    icon: Sparkles,
    badge: "Creator Engine",
    tone: "pink" as const,
  },
  {
    title: "Post Score Predictor",
    desc: "AI scores hook strength and estimated engagement probability (1-100) before you hit publish.",
    icon: Activity,
    badge: "Optimization",
    tone: "pink" as const,
  },
  {
    title: "Social CRM & Ghost Mode™",
    desc: "Automated DM & comment monitor with humanized delays that detects buying signals and logs leads to CRM.",
    icon: Ghost,
    badge: "Automation",
    tone: "blue" as const,
  },
  {
    title: "Competitor Video Spy",
    desc: "Tracks viral short-form videos in your niche and deconstructs their hooks, audio pacing, and CTAs.",
    icon: Eye,
    badge: "Intelligence",
    tone: "blue" as const,
  },
  {
    title: "Auto-Hashtag & Keyword Cluster",
    desc: "Generates platform-optimized hashtag clusters and keyword tags for maximum algorithmic distribution.",
    icon: Search,
    badge: "Reach",
    tone: "pink" as const,
  },
  {
    title: "Multi-Platform Repurposer",
    desc: "Converts 1 video, audio file, or article into LinkedIn carousels, X threads, and reels in seconds.",
    icon: RefreshCw,
    badge: "Repurposing",
    tone: "pink" as const,
  },
];

export function AgentTools() {
  return (
    <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Autonomous Toolkit"
          tone="pink"
          title="Supercharge your social presence with dedicated AI tools"
          sub="Everything you need to automate high-impact marketing workflows from ideation to revenue attribution."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {AGENT_TOOLS_LIST.map((tool) => {
            const isBlue = tool.tone === "blue";
            const iconColor = isBlue ? "#3b82f6" : "#ff0a8a";

            return (
              <motion.div
                key={tool.title}
                variants={itemFadeUp}
                whileHover={{ y: -8, scale: 1.02, borderColor: `${iconColor}40` }}
                transition={cardHoverSpring}
                className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 flex flex-col justify-between transition-colors hover:bg-[#1a1a1a]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: `${iconColor}18`,
                        border: `1px solid ${iconColor}30`,
                        color: iconColor,
                      }}
                    >
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-white mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-white/55 leading-relaxed font-normal">
                    {tool.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 8. Platform Integrations Section (#integrations) ─────────────── */

const PLATFORMS = [
  { name: "Instagram", iconPath: "/integrations/insta.png" },
  { name: "TikTok", iconPath: "/integrations/ticktok.png" },
  { name: "LinkedIn", iconPath: "/integrations/linkedin.png" },
  { name: "YouTube", iconPath: "/integrations/yt.png" },
  { name: "Facebook", iconPath: "/integrations/facebook.png" },
  { name: "X (Twitter)", iconPath: "/integrations/twitter.png" },
  { name: "Threads", iconPath: "/integrations/threads.png" },
  { name: "WhatsApp", iconPath: "/integrations/whatsapp.png" },
  { name: "Telegram", iconPath: "/integrations/telegram.png" },
  { name: "Snapchat", iconPath: "/integrations/Snapchat.png" },
  { name: "Discord", iconPath: "/integrations/discord.png" },
  { name: "Messenger", iconPath: "/integrations/messanger.png" },
  { name: "Pinterest", iconPath: "/integrations/pin.png" },
  { name: "Reddit", iconPath: "/integrations/reddit.png" },
];

export function Integrations() {
  return (
    <section id="integrations" className="relative px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={springTransition}
        className="mx-auto mb-10 max-w-2xl text-center"
      >
        <Eyebrow tone="blue">Multi-Platform Ecosystem</Eyebrow>
        <h2 className="font-display mt-3 text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Publish &amp; triage across <span className="text-[#3b82f6]">all your channels</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-white/60">
          Official OAuth 2.0 API integrations for instant scheduling and two-way messaging.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
      >
        {PLATFORMS.map((p) => (
          <motion.div
            key={p.name}
            variants={scaleIn}
            whileHover={{ y: -4, scale: 1.06, borderColor: "rgba(59,130,246,0.4)" }}
            transition={cardHoverSpring}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#171717] px-4 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-[#1c1c1c] hover:text-white cursor-pointer"
          >
            <img
              src={p.iconPath}
              alt={`${p.name} icon`}
              className="h-5 w-5 object-contain rounded select-none shrink-0"
            />
            <span>{p.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── 9. Revenue Attribution & Intelligence (#revenue) ─────────────── */

export function RevenueAttributionSection() {
  return (
    <section id="revenue" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Revenue & Conversion Tracking"
          tone="blue"
          title={
            <>
              From social impressions to <span className="text-[#3b82f6]">verifiable pipeline revenue</span>
            </>
          }
          sub="Stop guessing the ROI of your social posts. Track the full journey from views to profile visits, CRM leads, and closed revenue."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          {/* Revenue Attribution Funnel Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={springTransition}
            className="lg:col-span-7 rounded-3xl border border-[#3b82f6]/25 bg-[#171717] p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Social-to-Revenue Funnel</h3>
                  <p className="text-xs text-white/50">Real-time attribution powered by UTM tracking</p>
                </div>
                <span className="font-mono text-xs text-[#3b82f6] bg-[#3b82f6]/15 border border-[#3b82f6]/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { label: "50,000 Social Impressions", val: "Top of Funnel", tone: "text-white/50", ml: "" },
                  { label: "1,420 Profile Visits", val: "2.84% Conv.", tone: "text-[#ff0a8a]", ml: "ml-2 sm:ml-4" },
                  { label: "310 Website Clicks", val: "UTM Verified", tone: "text-[#3b82f6]", ml: "ml-4 sm:ml-8" },
                  { label: "48 Qualified Leads", val: "Social CRM Pipeline", tone: "text-[#34d399]", ml: "ml-6 sm:ml-12" },
                ].map((row, idx) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx, duration: 0.4 }}
                    className={`flex justify-between items-center bg-[#141414] p-3 rounded-xl border border-white/[0.06] ${row.ml}`}
                  >
                    <span className="text-white">{row.label}</span>
                    <span className={row.tone}>{row.val}</span>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="flex justify-between items-center bg-[#3b82f6]/15 border border-[#3b82f6]/30 p-3.5 rounded-xl font-bold ml-8 sm:ml-16 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                >
                  <span>14 Customers Closed</span>
                  <span className="text-[#3b82f6] font-extrabold text-sm">₦1,450,000 Revenue</span>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
              <span>Attribution Model: Multi-Touch</span>
              <span className="text-white/80 font-medium">ROAS: 4.2x</span>
            </div>
          </motion.div>

          {/* KoraScore & Opportunity Radar */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/50 font-bold">
                  Account Health Score
                </span>
                <Award className="h-5 w-5 text-[#ff0a8a]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-white">KoraScore: 88</span>
                <span className="text-xs text-white/40">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-[#34d399] font-medium leading-relaxed">
                &quot;Top 5% posting consistency this week. Schedule 2 more short videos to hit peak reach.&quot;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/50 font-bold">
                  Lead Opportunity Radar
                </span>
                <Flame className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <h4 className="font-display mt-2 text-base font-bold text-white">
                4 Hot Niche Opportunities Detected
              </h4>
              <p className="mt-1 text-xs text-white/55 leading-relaxed font-normal">
                3 high-intent lead questions in Instagram DMs + 1 trending competitor breakout format in your industry.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 10. Collaboration & Agency Workspaces (#collaboration) ───────── */

const COLLAB_FEATURES = [
  {
    title: "Client Workspace Portals",
    desc: "Isolated brand environments with strict row-level security. Give clients a clean view of their scheduled calendar and reports.",
    icon: Briefcase,
  },
  {
    title: "1-Click Shareable Draft Approvals",
    desc: "Send review links to clients or stakeholders without forcing them to create an account or login.",
    icon: ShieldCheck,
  },
  {
    title: "Role-Based Team Permissions",
    desc: "Assign roles (Admin, Editor, Reviewer, Client) with granular permissions over publishing, billing, and credentials.",
    icon: Users,
  },
  {
    title: "Audit Trail & Activity Log",
    desc: "Track every edit, approval, prompt update, and published post with complete timestamps and user attribution.",
    icon: Clock,
  },
];

export function Collaboration() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Team & Agency Workspaces"
          tone="blue"
          title="Collaborate seamlessly with multi-seat controls"
          sub="Built for marketing agencies, brand teams, and growth operators managing multiple client brands under one roof."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {COLLAB_FEATURES.map((collab) => (
            <motion.div
              key={collab.title}
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(59,130,246,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 sm:p-7 flex gap-4 items-start transition-colors hover:bg-[#1a1a1a]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30">
                <collab.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white mb-1.5">
                  {collab.title}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-normal">
                  {collab.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 11. Customer Stories (Testimonials) (#stories) ────────────────── */

const STORIES = [
  {
    name: "Adaeze Okonkwo",
    role: "Fintech Founder, Lagos",
    avatar: "AO",
    text: "I replaced Buffer and a freelance manager with KoraSpace. The AI operator handles our comment triage and schedules weekly content while I close enterprise deals.",
    highlight: "Saved 15 hrs / week",
    tone: "pink" as const,
  },
  {
    name: "Chukwuemeka Dike",
    role: "Digital Agency Lead, Abuja",
    avatar: "CD",
    text: "Managing 8 client accounts used to require three junior managers. Now it is just me and KoraSpace. The client approval links make signoffs effortless.",
    highlight: "Manages 8 brands solo",
    tone: "blue" as const,
  },
  {
    name: "Fatima Al-Hassan",
    role: "E-Commerce Founder, Kano",
    avatar: "FA",
    text: "The Social CRM detected high-intent buyer questions in our Instagram comments and generated ₦480,000 in sales within 2 weeks of switching.",
    highlight: "₦480,000 direct revenue",
    tone: "blue" as const,
  },
  {
    name: "Tunde Fashola",
    role: "Executive Brand Coach, Lagos",
    avatar: "TF",
    text: "Trend-to-Draft is like having a ghostwriter that never sleeps. It catches breaking news cycles and prepares three multi-format drafts before I wake up.",
    highlight: "Always on trend",
    tone: "pink" as const,
  },
  {
    name: "Ngozi Eze",
    role: "Fashion Brand Director, PH",
    avatar: "NE",
    text: "I was skeptical about AI capturing my brand voice. The Brand Brain learned our tone from past top posts so well that my followers could not tell the difference.",
    highlight: "Authentic voice matching",
    tone: "pink" as const,
  },
  {
    name: "Biodun Afolabi",
    role: "B2B SaaS Growth Marketer",
    avatar: "BA",
    text: "Transparent NGN pricing and seamless Paystack billing made adoption a no-brainer for our team. The multi-channel attribution is top notch.",
    highlight: "Predictable NGN billing",
    tone: "blue" as const,
  },
];

export function Stories() {
  return (
    <section id="stories" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Success Stories"
          tone="pink"
          title="Loved by creators, founders, &amp; growth teams"
          sub="See how businesses across Nigeria and beyond scale their social presence and revenue with KoraSpace."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {STORIES.map((t) => {
            const isBlue = t.tone === "blue";
            const badgeColor = isBlue ? "#3b82f6" : "#ff0a8a";

            return (
              <motion.div
                key={t.name}
                variants={itemFadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={cardHoverSpring}
                className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 text-white flex flex-col justify-between transition-colors hover:border-white/20 hover:bg-[#1a1a1a]"
              >
                <p className="text-xs leading-relaxed text-white/70 font-normal">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <span
                    className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border inline-block mb-3"
                    style={{
                      background: `${badgeColor}15`,
                      borderColor: `${badgeColor}30`,
                      color: badgeColor,
                    }}
                  >
                    {t.highlight}
                  </span>

                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{ background: badgeColor }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[11px] text-white/45">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 12. Transparent Pricing Section (#pricing) ───────────────────── */

const BASE_PLANS = [
  {
    name: "Starter / Free",
    monthlyPrice: 0,
    period: "/mo",
    desc: "For solo creators getting started",
    posts: "15 scheduled posts / mo",
    features: [
      "50,000 AI tokens / mo",
      "3 social account integrations",
      "Visual content calendar",
      "Basic AI post composer",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
    tone: "white" as const,
  },
  {
    name: "Creator Pro",
    monthlyPrice: 15000,
    period: "/mo",
    desc: "For active creators & influencers",
    posts: "150 scheduled posts / mo",
    features: [
      "400,000 AI tokens / mo",
      "6 social account integrations",
      "Full AI Composing Pipeline",
      "Content Repurposer (1->6)",
      "Viral Trend Radar & Brand Brain",
      "Post scoring & engagement prediction",
    ],
    cta: "Start Creator Trial",
    highlight: true,
    badge: "Creator Favorite",
    tone: "pink" as const,
  },
  {
    name: "Marketer Pro",
    monthlyPrice: 35000,
    period: "/mo",
    desc: "For growth operators & businesses",
    posts: "500 scheduled posts / mo",
    features: [
      "1,000,000 AI tokens / mo",
      "10 social account integrations",
      "Marketing Operator Agent",
      "Social CRM & High-Intent Triage",
      "Multi-channel Campaigns & Automations",
      "Full-Funnel Revenue Attribution",
      "Priority WhatsApp & email support",
    ],
    cta: "Start Marketer Trial",
    highlight: false,
    badge: "Marketer Tier",
    tone: "blue" as const,
  },
  {
    name: "Agency / Teams",
    monthlyPrice: 85000,
    period: "/mo",
    desc: "For agencies managing multiple brands",
    posts: "Unlimited scheduled posts",
    features: [
      "3,000,000 AI tokens / mo",
      "Unlimited social integrations",
      "Unlimited client workspace portals",
      "1-Click shareable approval links",
      "Multi-seat role permissions (RLS)",
      "White-label client performance reports",
      "Dedicated account manager",
    ],
    cta: "Get Agency Plan",
    highlight: false,
    badge: "Agency Tier",
    tone: "white" as const,
  },
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getFormattedPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return "₦0";
    const finalPrice = billingPeriod === "yearly" ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
    return `₦${finalPrice.toLocaleString("en-NG")}`;
  };

  return (
    <section id="pricing" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Transparent NGN Pricing"
          tone="pink"
          title={
            <>
              Simple plans.{" "}
              <span className="text-[#ff0a8a]">No USD conversion surprises.</span>
            </>
          }
          sub="Pay locally via Paystack, Flutterwave, or any Nigerian debit card. Every paid plan includes a 14-day free trial."
        />

        {/* Monthly / Yearly Toggle with layoutId sliding pill */}
        <div className="flex justify-center items-center gap-2 mb-12">
          <div className="relative bg-[#171717] p-1.5 rounded-2xl border border-white/[0.08] inline-flex items-center">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer z-10 ${
                billingPeriod === "monthly" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {billingPeriod === "monthly" && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 -z-10"
                  transition={springTransition}
                />
              )}
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer z-10 ${
                billingPeriod === "yearly" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {billingPeriod === "yearly" && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-xl bg-[#ff0a8a] shadow-[0_4px_16px_rgba(255,10,138,0.3)] -z-10"
                  transition={springTransition}
                />
              )}
              <span>Annual Billing</span>
              <span className="bg-black/30 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid with Max Springs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 items-stretch mb-12"
        >
          {BASE_PLANS.map((p) => {
            const isPink = p.tone === "pink";
            const isBlue = p.tone === "blue";
            const borderColor = isPink
              ? "border-[#ff0a8a]/40"
              : isBlue
              ? "border-[#3b82f6]/40"
              : "border-white/[0.08]";

            const buttonStyle = isPink
              ? "bg-[#ff0a8a] text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)] hover:bg-[#ff299b]"
              : isBlue
              ? "bg-[#3b82f6] text-white shadow-[0_4px_18px_rgba(59,130,246,0.25)] hover:bg-[#2563eb]"
              : "bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.10]";

            return (
              <motion.div
                key={p.name}
                variants={itemFadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={cardHoverSpring}
                className={`relative flex flex-col justify-between rounded-3xl border bg-[#171717] p-6 text-white transition-colors ${borderColor}`}
                style={{
                  boxShadow: p.highlight ? "0 10px 40px rgba(255,10,138,0.15)" : undefined,
                }}
              >
                {p.badge && (
                  <span
                    className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full absolute -top-3 left-6 text-white shadow-sm ${
                      isPink ? "bg-[#ff0a8a]" : isBlue ? "bg-[#3b82f6]" : "bg-white/20"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-white">
                      {getFormattedPrice(p.monthlyPrice)}
                    </span>
                    <span className="text-xs text-white/45">
                      {billingPeriod === "yearly" ? "/mo (billed annually)" : p.period}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">{p.desc}</p>

                  <div className="mt-4 font-mono text-xs font-semibold text-white/80 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                    {p.posts}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-white/70">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check
                          className="h-3.5 w-3.5 shrink-0"
                          style={{
                            color: isPink ? "#ff0a8a" : isBlue ? "#3b82f6" : "#ffffff",
                          }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/signup" className="mt-8">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={cardHoverSpring}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer ${buttonStyle}`}
                  >
                    {p.cta}
                  </motion.button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Custom Enterprise Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springTransition}
          className="rounded-2xl border border-white/[0.08] bg-[#161616] p-6 text-white flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 max-w-3xl mx-auto"
        >
          <div>
            <h4 className="font-display font-bold text-base text-white">
              Enterprise &amp; High-Volume Custom Workspaces
            </h4>
            <p className="text-white/60 text-xs mt-1">
              Need custom fine-tuned models, dedicated IPs, SLA guarantees, or 20+ team seats?
            </p>
          </div>
          <Link href="mailto:support@koraspace.ai" className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="border border-white/[0.10] bg-white/[0.04] text-white px-5 py-2 rounded-xl font-semibold text-xs hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Contact Enterprise Sales
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 13. FAQ Accordion (#faq) with Max Spring Animation ───────────── */

const FAQS_DATA = [
  {
    q: "What is the difference between Creator Mode and Marketer Mode?",
    a: "Creator Mode is built for creators, solo founders, and influencers focusing on brand voice learning, AI post composing, multi-format repurposing, and visual drag-and-drop scheduling across 6+ social networks. Marketer Mode is designed for growth operators and marketing agencies who need campaign execution, social CRM lead triage (converting comments & DMs to deals), autonomous agent operators, and closed-loop revenue attribution.",
  },
  {
    q: "How does the Brand Brain ensure posts sound like me?",
    a: "Simply input your website URL, brand guidelines, product briefs, or top past posts. The KoraSpace Brand Brain builds a persistent memory profile with vocabulary rules, tone settings, and custom guardrails so every generated post, carousel, or script sounds authentic.",
  },
  {
    q: "Which social media platforms are supported?",
    a: "KoraSpace connects directly to Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Facebook, Threads, WhatsApp, Telegram, and more via official authorized OAuth 2.0 APIs.",
  },
  {
    q: "How does Ghost Mode™ lead triage work?",
    a: "Ghost Mode™ monitors your comments and direct messages in real time. Using NLP and randomized human-like delays (30s–75s), it detects buying questions (e.g. 'How much does this cost?', 'Can I buy today?') and logs qualified leads directly into your CRM Kanban board.",
  },
  {
    q: "Can I use KoraSpace for multi-client agencies or teams?",
    a: "Yes! The Agency & Teams tier includes dedicated client workspace portals, multi-seat role permissions with row-level security, shareable draft approval links (no login required for clients), and white-label analytics reports.",
  },
  {
    q: "What payment methods are supported in Nigeria and internationally?",
    a: "All plans are billed in Nigerian Naira (NGN) without foreign exchange surprises. We accept all Nigerian debit cards (Mastercard, Visa, Verve), bank transfers, and international cards via Paystack and Flutterwave.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <SectionHead
        eyebrow="Frequently Asked Questions"
        tone="pink"
        title="Got questions? We've got answers."
        sub="Everything you need to know about KoraSpace, dual operating modes, AI safety, and pricing."
      />

      <div className="space-y-3">
        {FAQS_DATA.map((faq, i) => {
          const isOpen = openIndex === i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex justify-between items-center text-left p-5 focus:outline-none select-none cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white pr-4">
                  {faq.q}
                </span>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`text-white/60 shrink-0 ${isOpen ? "text-[#ff0a8a]" : ""}`}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal border-t border-white/[0.06] pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ── 14. Final Call To Action ─────────────────────────────────────── */

export function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={springTransition}
        className="relative mx-auto max-w-6xl rounded-3xl border border-white/[0.10] bg-[#161616] p-8 sm:p-12 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Animated breathing aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-[#ff0a8a]/20 to-[#3b82f6]/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-[#ff0a8a] to-[#3b82f6] rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Eyebrow tone="pink">14-Day Free Trial — No Credit Card Required</Eyebrow>

          <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Your autonomous AI marketing team{" "}
            <span className="text-[#ff0a8a]">starts today.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed font-normal max-w-xl mx-auto">
            Join thousands of creators, founders, and marketing operators automating content creation, scheduling, CRM triage, and revenue growth.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <LandingButton
              href="/signup"
              className="bg-[#ff0a8a] text-white shadow-[0_4px_20px_rgba(255,10,138,0.3)] hover:bg-[#ff299b]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </LandingButton>
            <LandingButton
              href="/login"
              className="border border-white/[0.10] bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              <span>Sign In to Workspace</span>
            </LandingButton>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#34d399]" />
              <span>Instant 2-minute onboarding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#34d399]" />
              <span>Supports 6+ social networks</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 15. Upgraded Footer ──────────────────────────────────────────── */

const FOOTER_LINKS = {
  Product: [
    { label: "AI Composing Pipeline", href: "#engines" },
    { label: "Visual Calendar 2.0", href: "#engines" },
    { label: "Brand Brain", href: "#brain" },
    { label: "Autonomous Growth Loop", href: "#how" },
    { label: "Pricing & Plans", href: "#pricing" },
  ],
  Platform: [
    { label: "Instagram Integration", href: "#integrations" },
    { label: "TikTok Auto-Scheduler", href: "#integrations" },
    { label: "LinkedIn & X Publisher", href: "#integrations" },
    { label: "YouTube Repurposer", href: "#integrations" },
    { label: "WhatsApp & Telegram CRM", href: "#integrations" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Nigeria Data Protection (NDPA)", href: "/privacy" },
    { label: "Cookie Policy", href: "/privacy" },
  ],
  Support: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "System Status", href: "#" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.10] bg-[#070d24] py-14 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={itemFadeUp} className="lg:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 p-[1px] border border-white/20">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0a1233]">
                  <img src="/logo.png" alt="KoraSpace Logo" className="h-4 w-4 object-contain" />
                </div>
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Kora<span className="text-[#3b82f6]">Space</span>
              </span>
            </Link>

            <p className="text-xs text-white/60 leading-relaxed font-normal">
              Autonomous AI marketing operating system built for modern creators, startups, and marketing agencies.
            </p>

            <div className="flex gap-2 pt-2">
              {[Globe, Send, Zap, MessageCircle].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white hover:text-white hover:border-white/40 hover:bg-white/15 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-white stroke-white" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <motion.div key={category} variants={itemFadeUp}>
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white/70 mb-3.5">
                {category}
              </h4>
              <ul className="space-y-2 text-xs">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Support Column */}
          <motion.div variants={itemFadeUp} className="space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white/80 mb-3.5">
              Direct Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-white shrink-0 mt-0.5" />
                <a
                  href="mailto:support@koraspace.ai"
                  className="hover:text-white transition-colors break-all"
                >
                  support@koraspace.ai
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-white shrink-0 mt-0.5" />
                <span>+234 701 313 4821</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-white shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Credits Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} KoraSpace by Techla. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-white/60">🇳🇬 Built in Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
