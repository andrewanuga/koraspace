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
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PlanKey } from "@/lib/i18n/pricing";

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
      ? "text-slate-700 bg-slate-100 border-slate-300 dark:text-white/80 dark:bg-white/5 dark:border-white/10 dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
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
            tone === "blue" ? "#3b82f6" : tone === "white" ? "#94a3b8" : "#ff0a8a",
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
      <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-white/60 font-normal max-w-2xl mx-auto">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/* ── 1. Problem Solver Section ────────────────────────────────────── */

export function ProblemSolverSection() {
  const { t } = useLanguage();

<<<<<<< HEAD
const GAME_CHANGERS = [
  { icon: Brain, title: "Predictive Koraspace Score", desc: "Know a post's engagement odds before you schedule. No more guessing.", tone: "indigo", badge: "Pro" },
  { icon: Ghost, title: "Ghost Mode™ Agent", desc: "Replies to the noise in your voice, escalates real leads to you.", tone: "violet", badge: "Pro" },
  { icon: TrendingUp, title: "Trend-to-Draft", desc: "Three drafts waiting the moment something breaks in your niche.", tone: "indigo", badge: "Pro" },
  { icon: DollarSign, title: "Auto-Plug Loop", desc: "Hits your threshold, drops the conversion comment automatically.", tone: "gold", badge: "Pro" },
  { icon: Target, title: "Brand Voice", desc: "Paste a URL. It sounds like you in sixty seconds. Not a bot.", tone: "violet", badge: "Basic+" },
  { icon: BarChart3, title: "Smart Inbox Triage", desc: "Leads, complaints, fluff — sorted. Spend minutes, not hours.", tone: "indigo", badge: "Advanced" },
];

const toneColor = (t?: string) =>
  t === "violet" ? "var(--sai-violet)" : t === "gold" ? "var(--sai-gold)" : "var(--sai-indigo)";

export function Features() {
  const ref = useGsapReveal<HTMLElement>();
  return (
    <section id="features" ref={ref} className="sai-vignette relative px-5 py-28 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Full feature suite"
          title={<>Everything you need.<br /><span className="sai-gradient-text">Then some.</span></>}
          sub="Most tools tell you what happened. Koraspace AI tells you what will — and often handles it before you open the app."
=======
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="relative mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#161616] p-8 sm:p-12 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <motion.div
          animate={{
            scaleX: [0.85, 1.15, 0.85],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-[#ff0a8a] via-blue-500/50 to-[#3b82f6] rounded-full blur-[0.5px]"
>>>>>>> main
        />

        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow tone="white">{t.problemSolver.eyebrow}</Eyebrow>

          <h2 className="mt-5 font-display text-2xl sm:text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {t.problemSolver.heading}
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-white/60 leading-relaxed font-normal">
            {t.problemSolver.paragraph}
          </p>

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
              className="rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-white/[0.07] dark:bg-[#1a1a1a] p-5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff0a8a]/15 text-[#ff0a8a] mb-3">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.problemSolver.pillar1Title}</h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-white/55 leading-relaxed">
                {t.problemSolver.pillar1Desc}
              </p>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(59,130,246,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-white/[0.07] dark:bg-[#1a1a1a] p-5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b82f6]/15 text-[#3b82f6] mb-3">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.problemSolver.pillar2Title}</h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-white/55 leading-relaxed">
                {t.problemSolver.pillar2Desc}
              </p>
            </motion.div>

            <motion.div
              variants={itemFadeUp}
              whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(52,211,153,0.3)" }}
              transition={cardHoverSpring}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-white/[0.07] dark:bg-[#1a1a1a] p-5 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#34d399]/15 text-[#34d399] mb-3">
                <Target className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.problemSolver.pillar3Title}</h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-white/55 leading-relaxed">
                {t.problemSolver.pillar3Desc}
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
              <span>{t.problemSolver.ctaButton}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </LandingButton>
            <LandingButton
              href="#dual-modes"
              className="border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-white/[0.10] dark:bg-white/[0.03] dark:text-white/80 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <span>{t.problemSolver.secondaryButton}</span>
            </LandingButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 2. Dual-Mode Showcase Section (#dual-modes) ─────────────────── */

export function DualModeShowcaseSection() {
  const { t } = useLanguage();

  return (
    <section id="dual-modes" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.dualModes.eyebrow}
          tone="pink"
          title={
            <>
              {t.dualModes.titleLead} <span className="text-[#ff0a8a]">{t.dualModes.titleCreators}</span> {t.dualModes.titleAnd}{" "}
              <span className="text-[#3b82f6]">{t.dualModes.titleMarketers}</span>
            </>
          }
          sub={t.dualModes.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creator Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={cardHoverSpring}
            className="relative rounded-3xl border border-[#ff0a8a]/25 bg-white dark:bg-[#171717] p-8 shadow-[0_15px_45px_rgba(255,10,138,0.08)] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#ff0a8a]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-4 right-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff0a8a]/15 px-3 py-1 text-[11px] font-bold text-[#ff0a8a] border border-[#ff0a8a]/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.dashboardShowcase.creatorMode}</span>
              </span>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff0a8a]/15 text-[#ff0a8a] mb-5 border border-[#ff0a8a]/30">
                <Sparkles className="h-6 w-6" />
              </div>

              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {t.dualModes.creatorStudioTitle}
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                {t.dualModes.creatorStudioDesc}
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: t.features.composerTitle,
                    desc: t.features.composerDesc,
                  },
                  {
                    title: t.features.calendarTitle,
                    desc: t.features.calendarDesc,
                  },
                  {
                    title: t.features.repurposerTitle,
                    desc: t.features.repurposerDesc,
                  },
                  {
                    title: t.dashboardShowcase.composerTitle,
                    desc: t.dashboardShowcase.composerDesc,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:border-white/[0.05] dark:bg-[#141414] p-3 transition-colors hover:border-[#ff0a8a]/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#ff0a8a] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                      <p className="text-[11px] text-slate-500 dark:text-white/50">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.07] flex items-center justify-between">
              <span className="text-xs font-mono text-[#ff0a8a] font-semibold">Theme: Kora Pink (#ff0a8a)</span>
              <LandingButton
                href="/signup"
                className="bg-[#ff0a8a] text-white shadow-[0_4px_16px_rgba(255,10,138,0.25)] hover:bg-[#ff299b]"
              >
                <span>{t.dualModes.launchCreator}</span>
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
            className="relative rounded-3xl border border-[#3b82f6]/25 bg-white dark:bg-[#171717] p-8 shadow-[0_15px_45px_rgba(59,130,246,0.08)] flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="absolute top-4 right-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6]/15 px-3 py-1 text-[11px] font-bold text-[#3b82f6] border border-[#3b82f6]/30">
                <Target className="h-3.5 w-3.5" />
                <span>{t.dashboardShowcase.marketerMode}</span>
              </span>
            </div>

            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b82f6]/15 text-[#3b82f6] mb-5 border border-[#3b82f6]/30">
                <Target className="h-6 w-6" />
              </div>

              <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {t.dualModes.marketerStudioTitle}
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                {t.dualModes.marketerStudioDesc}
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: t.features.inboxTitle,
                    desc: t.features.inboxDesc,
                  },
                  {
                    title: t.features.agencyTitle,
                    desc: t.features.agencyDesc,
                  },
                  {
                    title: t.features.attributionTitle,
                    desc: t.features.attributionDesc,
                  },
                  {
                    title: t.dashboardShowcase.crmTitle,
                    desc: t.dashboardShowcase.crmDesc,
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 dark:border-white/[0.05] dark:bg-[#141414] p-3 transition-colors hover:border-[#3b82f6]/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#3b82f6] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                      <p className="text-[11px] text-slate-500 dark:text-white/50">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.07] flex items-center justify-between">
              <span className="text-xs font-mono text-[#3b82f6] font-semibold">Theme: Kora Blue (#3b82f6)</span>
              <LandingButton
                href="/signup"
                className="bg-[#3b82f6] text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)] hover:bg-[#2563eb]"
              >
                <span>{t.dualModes.launchMarketer}</span>
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

export function GrowthLoopSection() {
  const { t } = useLanguage();

  const loopStages = [
    {
      num: "01",
      title: t.growthLoop.stage1Title,
      desc: t.growthLoop.stage1Desc,
      icon: Search,
      color: "#ff0a8a",
      badge: "Brand Brain",
    },
    {
      num: "02",
      title: t.growthLoop.stage2Title,
      desc: t.growthLoop.stage2Desc,
      icon: Sparkles,
      color: "#ec4899",
      badge: "AI Composer",
    },
    {
      num: "03",
      title: t.growthLoop.stage3Title,
      desc: t.growthLoop.stage3Desc,
      icon: Calendar,
      color: "#3b82f6",
      badge: "Multi-Platform CRM",
    },
    {
      num: "04",
      title: t.growthLoop.stage4Title,
      desc: t.growthLoop.stage4Desc,
      icon: RefreshCw,
      color: "#2563eb",
      badge: "Closed-Loop Growth",
    },
  ];

  return (
    <section id="how" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.growthLoop.eyebrow}
          tone="white"
          title={t.growthLoop.title}
          sub={t.growthLoop.subtitle}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {loopStages.map((s) => (
            <motion.div
              key={s.num}
              variants={itemFadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={cardHoverSpring}
              className="relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
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

                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-white/60 font-semibold">
                  {s.badge}
                </span>

                <h3 className="font-display mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-white/55 font-normal">
                  {s.desc}
                </p>
              </div>

              <div
                className="mt-6 flex items-center gap-1.5 text-xs font-bold"
                style={{ color: s.color }}
              >
                <span>{t.growthLoop.feedsNext}</span>
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
  id?: string;
  badge?: string;
  tone?: "pink" | "blue";
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageLeft?: boolean;
}

export function FeatureSection({
  id,
  badge,
  tone = "pink",
  title,
  description,
  imageUrl,
  imageAlt,
  imageLeft = true,
}: FeatureProps) {
  const { t } = useLanguage();
  const isBlue = tone === "blue";
  const brandColor = isBlue ? "#3b82f6" : "#ff0a8a";

  return (
    <section
      id={id}
      className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14 scroll-mt-24"
    >
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
          className="relative rounded-3xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-[#161616] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-[300px] sm:h-[360px] rounded-2xl object-cover object-top border border-slate-100 dark:border-white/10"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: imageLeft ? 30 : -30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className={`flex-1 space-y-4 ${imageLeft ? "md:order-2" : "md:order-1"}`}
      >
        {badge && <Eyebrow tone={tone}>{badge}</Eyebrow>}

        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-white/60 font-normal leading-relaxed">
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
            <span>{t.common.exploreFeature}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </LandingButton>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 5. Interactive FeatureShowcase (#engines) ────────────────────── */

const FEATURE_SCREEN_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>; screenPath: string }> = {
  "ai-composer": { icon: Sparkles, screenPath: "/features/Kora-AI-Composer.jpg" },
  "visual-calendar": { icon: Calendar, screenPath: "/features/Visual-Drag-and-Drop Calendar.jpg" },
  "repurposer": { icon: RefreshCw, screenPath: "/features/social-media-concept-with-device.jpg" },
  "inbox-crm": { icon: DollarSign, screenPath: "/features/social-ecommerce.jpg" },
  "agency-workspaces": { icon: Users, screenPath: "/features/manage-multiple-brands.jpg" },
  "growth-marketing": { icon: TrendingUp, screenPath: "/features/social-media-marketing.jpg" },
};

export function FeatureShowcase() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const featureItems = t.featureShowcase.map((f) => ({
    ...f,
    icon: FEATURE_SCREEN_MAP[f.id]?.icon || Sparkles,
    screenPath: FEATURE_SCREEN_MAP[f.id]?.screenPath || "/features/Kora-AI-Composer.jpg",
  }));

  const activeFeature = featureItems[activeIndex] || featureItems[0];

  return (
    <section id="engines" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#161616] p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
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

              <h3 className="font-display mt-3 text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {activeFeature.title}
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed max-w-2xl mx-auto">
                {activeFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative w-full max-w-4xl mx-auto aspect-16/10 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.10] bg-slate-900 shadow-2xl">
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

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {featureItems.map((feat, idx) => {
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
                    ? "border-slate-300 bg-slate-100 text-slate-900 shadow-sm dark:border-white/20 dark:bg-white/[0.08] dark:text-white"
                    : "border-slate-200 text-slate-500 hover:text-slate-900 dark:border-white/[0.06] dark:text-white/50 dark:hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="feature-active-pill"
                    className="absolute inset-0 rounded-xl bg-slate-200/80 border border-slate-300 dark:bg-white/[0.08] dark:border-white/25 -z-0"
                    transition={springTransition}
                  />
                )}

                <div
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg mb-2 transition-colors"
                  style={{
                    background: isSelected ? `${featColor}20` : "rgba(148,163,184,0.15)",
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

const SWARM_ICONS = [
  Search,
  ShieldCheck,
  FileText,
  Target,
  BarChart3,
  Eye,
  MessageSquare,
  Activity,
];

export function BrainAndAgentsSection() {
  const { t } = useLanguage();

  return (
    <section id="brain" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.brandBrain.eyebrow}
          tone="pink"
          title={t.brandBrain.title}
          sub={t.brandBrain.subtitle}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ y: -6 }}
            transition={cardHoverSpring}
            className="relative lg:col-span-5 rounded-3xl border border-[#ff0a8a]/25 bg-white dark:bg-[#171717] p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm dark:shadow-none"
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
                {t.brandBrain.brainTitle}
              </span>
              <h3 className="font-display mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {t.brandBrain.brainTitle}
              </h3>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-white/60 font-normal">
                {t.brandBrain.brainDesc}
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-700 dark:text-white/70">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#ff0a8a]" />
                  <span>{t.brandBrain.brainCheck1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#ff0a8a]" />
                  <span>{t.brandBrain.brainCheck2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#ff0a8a]" />
                  <span>{t.brandBrain.brainCheck3}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
                <span>Memory Status: Active</span>
                <span className="text-[#34d399] font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
                  100% Isolated RLS Data
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {t.brandBrain.swarmAgents.map((ag, idx) => {
              const Icon = SWARM_ICONS[idx] || Search;
              return (
                <motion.div
                  key={ag.name}
                  variants={itemFadeUp}
                  whileHover={{ x: 6, scale: 1.02, borderColor: "rgba(59,130,246,0.3)" }}
                  transition={cardHoverSpring}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-[#171717] p-4 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a] shadow-xs"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]/15 text-[#3b82f6]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{ag.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 truncate">{ag.role}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Agent Tools Grid (#tools / #features) ─────────────────────── */

const AGENT_TOOL_ICONS = [
  Sparkles,
  Activity,
  Ghost,
  Eye,
  Search,
  RefreshCw,
];

export function AgentTools() {
  const { t } = useLanguage();

  return (
    <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.agentTools.eyebrow}
          tone="pink"
          title={t.agentTools.title}
          sub={t.agentTools.subtitle}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {t.agentTools.list.map((tool, idx) => {
            const isBlue = tool.tone === "blue";
            const iconColor = isBlue ? "#3b82f6" : "#ff0a8a";
            const Icon = AGENT_TOOL_ICONS[idx] || Sparkles;

            return (
              <motion.div
                key={tool.title}
                variants={itemFadeUp}
                whileHover={{ y: -8, scale: 1.02, borderColor: `${iconColor}40` }}
                transition={cardHoverSpring}
                className="rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] p-6 flex flex-col justify-between transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a] shadow-sm"
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
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-white/60">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-white/55 leading-relaxed font-normal">
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
  const { t } = useLanguage();

  return (
    <section id="integrations" className="relative px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={springTransition}
        className="mx-auto mb-10 max-w-2xl text-center"
      >
        <Eyebrow tone="blue">{t.integrationsSection.eyebrow}</Eyebrow>
        <h2 className="font-display mt-3 text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t.integrationsSection.titleLead}{" "}
          <span className="text-[#3b82f6]">{t.integrationsSection.titleHighlight}</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-white/60">
          {t.integrationsSection.subtitle}
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
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-white/80 transition-colors hover:bg-slate-50 dark:hover:bg-[#1c1c1c] dark:hover:text-white cursor-pointer shadow-xs"
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
  const { t } = useLanguage();

  return (
    <section id="revenue" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.revenueAttribution.eyebrow}
          tone="blue"
          title={
            <>
              {t.revenueAttribution.titleLead}{" "}
              <span className="text-[#3b82f6]">{t.revenueAttribution.titleHighlight}</span>
            </>
          }
          sub={t.revenueAttribution.subtitle}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={springTransition}
            className="lg:col-span-7 rounded-3xl border border-[#3b82f6]/25 bg-white dark:bg-[#171717] p-6 sm:p-8 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {t.revenueAttribution.funnelTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-white/50">
                    {t.revenueAttribution.funnelSubtitle}
                  </p>
                </div>
                <span className="font-mono text-xs text-[#3b82f6] bg-[#3b82f6]/15 border border-[#3b82f6]/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                  {t.revenueAttribution.liveSync}
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { label: t.revenueAttribution.impressionsLabel, val: t.revenueAttribution.impressionsVal, tone: "text-slate-500 dark:text-white/50", ml: "" },
                  { label: t.revenueAttribution.visitsLabel, val: t.revenueAttribution.visitsVal, tone: "text-[#ff0a8a]", ml: "ml-2 sm:ml-4" },
                  { label: t.revenueAttribution.clicksLabel, val: t.revenueAttribution.clicksVal, tone: "text-[#3b82f6]", ml: "ml-4 sm:ml-8" },
                  { label: t.revenueAttribution.leadsLabel, val: t.revenueAttribution.leadsVal, tone: "text-[#34d399]", ml: "ml-6 sm:ml-12" },
                ].map((row, idx) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx, duration: 0.4 }}
                    className={`flex justify-between items-center bg-slate-50 border border-slate-200 text-slate-900 dark:bg-[#141414] dark:border-white/[0.06] dark:text-white p-3 rounded-xl ${row.ml}`}
                  >
                    <span>{row.label}</span>
                    <span className={row.tone}>{row.val}</span>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="flex justify-between items-center bg-[#3b82f6]/15 border border-[#3b82f6]/30 p-3.5 rounded-xl font-bold ml-8 sm:ml-16 text-slate-900 dark:text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                >
                  <span>{t.revenueAttribution.closedCustomers}</span>
                  <span className="text-[#3b82f6] font-extrabold text-sm">{t.revenueAttribution.revenueVal}</span>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.07] flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
              <span>{t.revenueAttribution.attributionModel}</span>
              <span className="text-slate-800 dark:text-white/80 font-medium">{t.revenueAttribution.roas}</span>
            </div>
          </motion.div>

          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-white/50 font-bold">
                  {t.revenueAttribution.koraScoreLabel}
                </span>
                <Award className="h-5 w-5 text-[#ff0a8a]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">KoraScore: 88</span>
                <span className="text-xs text-slate-400 dark:text-white/40">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-[#34d399] font-medium leading-relaxed">
                {t.revenueAttribution.koraScoreTip}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-white/50 font-bold">
                  {t.revenueAttribution.radarTitle}
                </span>
                <Flame className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <h4 className="font-display mt-2 text-base font-bold text-slate-900 dark:text-white">
                {t.revenueAttribution.radarHeading}
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-white/55 leading-relaxed font-normal">
                {t.revenueAttribution.radarDesc}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 10. Collaboration & Agency Workspaces (#collaboration) ───────── */

<<<<<<< HEAD
const STORIES = [
  { name: "Adaeze Okonkwo", role: "Fintech Founder, Lagos", avatar: "AO", text: "I replaced Buffer and a freelance manager with Koraspace AI. Ghost Mode handles engagement while I close deals. ROI in week one.", highlight: "Replaced a freelance manager" },
  { name: "Chukwuemeka Dike", role: "Digital Agency, Abuja", avatar: "CD", text: "Eight client accounts used to need three people. Now it's me and the agent. Inbox Triage alone saves two hours a day.", highlight: "Manages 8 clients solo" },
  { name: "Fatima Al-Hassan", role: "E-commerce, Kano", avatar: "FA", text: "ROI Pulse is wild. I can show 'this post made us ₦340,000 this week.' The marketing budget stopped being a question.", highlight: "₦340k from one post" },
  { name: "Tunde Fashola", role: "Brand Coach, Lagos", avatar: "TF", text: "Trend-to-Draft is a ghostwriter that never sleeps. It caught the news cycle before I woke up — three drafts waiting.", highlight: "Trend content before it peaks" },
  { name: "Ngozi Eze", role: "Fashion, Port Harcourt", avatar: "NE", text: "I was skeptical about AI sounding like me. My followers can't tell. Engagement went up three times.", highlight: "3× engagement" },
  { name: "Biodun Afolabi", role: "SaaS Founder, Lagos", avatar: "BA", text: "They self-host Llama 3.3 70B, so my content data doesn't go to anyone else. And the pricing makes sense here.", highlight: "Privacy-first" },
];
=======
const COLLAB_ICONS = [Briefcase, ShieldCheck, Users, Clock];

export function Collaboration() {
  const { t } = useLanguage();
>>>>>>> main

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.collaboration.eyebrow}
          tone="blue"
          title={t.collaboration.title}
          sub={t.collaboration.subtitle}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
<<<<<<< HEAD
          {t.avatar}
        </div>
        <div>
          <p className="text-[13px] font-medium text-white">{t.name}</p>
          <p className="text-[12px] text-white/45">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: typeof STORIES; reverse?: boolean }) {
  // Duplicate the set so the -50% translate loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className="sai-marquee py-2">
      <div className={`sai-marquee-track${reverse ? " reverse" : ""}`}>
        {doubled.map((t, i) => (
          <StoryCard key={`${t.name}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

export function Stories() {
  const ref = useGsapReveal<HTMLElement>();
  const rowA = STORIES.slice(0, 3);
  const rowB = STORIES.slice(3);
  return (
    <section id="stories" ref={ref} className="sai-vignette relative overflow-hidden py-28 sm:py-32">
      <div className="mx-auto mb-14 max-w-2xl px-5 text-center">
        <div data-reveal><Eyebrow tone="gold">Loved by operators</Eyebrow></div>
        <h2 data-reveal className="font-display mt-4 text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
          Creators & businesses<br /><span className="sai-gradient-text">love Koraspace AI</span>
        </h2>
        <div data-reveal className="mt-4 flex items-center justify-center gap-1.5 text-white/60">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[var(--sai-gold)] text-[var(--sai-gold)]" />
          ))}
          <span className="ml-2 text-sm">4.9 / 5 average</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
=======
          {t.collaboration.list.map((collab, idx) => {
            const Icon = COLLAB_ICONS[idx] || Briefcase;
            return (
              <motion.div
                key={collab.title}
                variants={itemFadeUp}
                whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(59,130,246,0.3)" }}
                transition={cardHoverSpring}
                className="rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] p-6 sm:p-7 flex gap-4 items-start transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1a1a] shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {collab.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed font-normal">
                    {collab.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
>>>>>>> main
      </div>
    </section>
  );
}

/* ── 11. Customer Stories (Testimonials) (#stories) ────────────────── */

export function Stories() {
  const { t } = useLanguage();

  return (
    <section id="stories" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.stories.eyebrow}
          tone="pink"
          title={t.stories.title}
          sub={t.stories.subtitle}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {t.stories.list.map((item) => {
            const isBlue = item.tone === "blue";
            const badgeColor = isBlue ? "#3b82f6" : "#ff0a8a";

            return (
              <motion.div
                key={item.name}
                variants={itemFadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={cardHoverSpring}
                className="rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#171717] p-6 text-slate-900 dark:text-white flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#1a1a1a] shadow-sm"
              >
                <p className="text-xs leading-relaxed text-slate-600 dark:text-white/70 font-normal">
                  &ldquo;{item.text}&rdquo;
                </p>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
                  <span
                    className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border inline-block mb-3"
                    style={{
                      background: `${badgeColor}15`,
                      borderColor: `${badgeColor}30`,
                      color: badgeColor,
                    }}
                  >
                    {item.highlight}
                  </span>

                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{ background: badgeColor }}
                    >
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-white/45">{item.role}</p>
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

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const { t, formatPlanPrice } = useLanguage();

  return (
    <section id="pricing" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow={t.pricing.eyebrow}
          tone="pink"
          title={
            <>
              {t.pricing.titleLead}{" "}
              <span className="text-[#ff0a8a]">{t.pricing.titleHighlight}</span>
            </>
          }
          sub={t.pricing.subtitle}
        />

        <div className="flex justify-center items-center gap-2 mb-12">
          <div className="relative bg-slate-100 dark:bg-[#171717] p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] inline-flex items-center">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer z-10 ${
                billingPeriod === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
              }`}
            >
              {billingPeriod === "monthly" && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-xl bg-white shadow-sm border border-slate-200 dark:bg-white/[0.12] dark:border-white/20 -z-10"
                  transition={springTransition}
                />
              )}
              {t.pricing.monthlyBilling}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer z-10 ${
                billingPeriod === "yearly" ? "text-white" : "text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
              }`}
            >
              {billingPeriod === "yearly" && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-xl bg-[#ff0a8a] shadow-[0_4px_16px_rgba(255,10,138,0.3)] -z-10"
                  transition={springTransition}
                />
              )}
              <span>{t.pricing.annualBilling}</span>
              <span className="bg-black/30 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                {t.pricing.discountBadge}
              </span>
            </button>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 items-stretch mb-12"
        >
          {t.pricing.plans.map((p) => {
            const isPink = p.planKey === "pro";
            const isBlue = p.planKey === "advanced";
            const borderColor = isPink
              ? "border-[#ff0a8a]/40"
              : isBlue
              ? "border-[#3b82f6]/40"
              : "border-slate-200 dark:border-white/[0.08]";

            const buttonStyle = isPink
              ? "bg-[#ff0a8a] text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)] hover:bg-[#ff299b]"
              : isBlue
              ? "bg-[#3b82f6] text-white shadow-[0_4px_18px_rgba(59,130,246,0.25)] hover:bg-[#2563eb]"
              : "bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-white dark:border-white/[0.10] dark:hover:bg-white/[0.10]";


            const planPrice = formatPlanPrice(p.planKey as PlanKey, billingPeriod);

            return (
              <motion.div
                key={p.planKey}
                variants={itemFadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={cardHoverSpring}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white dark:bg-[#171717] p-6 text-slate-900 dark:text-white transition-colors ${borderColor}`}
                style={{
                  boxShadow: p.highlight ? "0 10px 40px rgba(255,10,138,0.15)" : undefined,
                }}
              >
                {p.badge && (
                  <span
                    className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full absolute -top-3 left-6 text-white shadow-sm ${
                      isPink ? "bg-[#ff0a8a]" : isBlue ? "bg-[#3b82f6]" : "bg-slate-700 dark:bg-white/20"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                      {planPrice}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-white/45">
                      {billingPeriod === "yearly" ? t.pricing.billedAnnually : t.pricing.perMonth}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50">{p.desc}</p>

                  <div className="mt-4 font-mono text-xs font-semibold text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/[0.04] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.06]">
                    {p.posts}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-white/70">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check
                          className="h-3.5 w-3.5 shrink-0"
                          style={{
                            color: isPink ? "#ff0a8a" : isBlue ? "#3b82f6" : "#64748b",
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springTransition}
          className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#161616] p-6 text-slate-900 dark:text-white flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 max-w-3xl mx-auto shadow-sm"
        >
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
              {t.pricing.enterpriseTitle}
            </h4>
            <p className="text-slate-600 dark:text-white/60 text-xs mt-1">
              {t.pricing.enterpriseDesc}
            </p>
          </div>
          <Link href="mailto:support@koraspace.ai" className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-white px-5 py-2 rounded-xl font-semibold text-xs dark:hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              {t.pricing.enterpriseButton}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 13. FAQ Accordion (#faq) ─────────────────────────────────────── */

export function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
  ];

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
      <SectionHead
        eyebrow={t.faq.eyebrow}
        tone="pink"
        title={t.faq.title}
        sub={t.faq.subtitle}
      />

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#161616] overflow-hidden transition-colors shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex justify-between items-center text-left p-5 focus:outline-none select-none cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pr-4">
                  {faq.q}
                </span>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`text-slate-400 dark:text-white/60 shrink-0 ${isOpen ? "text-[#ff0a8a]" : ""}`}
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
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal border-t border-slate-200 dark:border-white/[0.06] pt-3">
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
  const { t } = useLanguage();

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={springTransition}
        className="relative mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white dark:border-white/[0.10] dark:bg-[#161616] p-8 sm:p-12 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
      >
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
          <Eyebrow tone="pink">{t.cta.eyebrow}</Eyebrow>

          <h2 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t.cta.titleLead}{" "}
            <span className="text-[#ff0a8a]">{t.cta.titleHighlight}</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-white/60 leading-relaxed font-normal max-w-xl mx-auto">
            {t.cta.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <LandingButton
              href="/signup"
              className="bg-[#ff0a8a] text-white shadow-[0_4px_20px_rgba(255,10,138,0.3)] hover:bg-[#ff299b]"
            >
              <span>{t.cta.startTrial}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </LandingButton>
            <LandingButton
              href="/login"
              className="border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-white/[0.10] dark:bg-white/[0.03] dark:text-white/80 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <span>{t.cta.signIn}</span>
            </LandingButton>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-white/40">
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#34d399]" />
              <span>{t.cta.feature1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[#34d399]" />
              <span>{t.cta.feature2}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 15. Upgraded Footer ──────────────────────────────────────────── */

export function SiteFooter() {
  const { t } = useLanguage();

  const footerGroups = [
    { title: t.footer.productHeading, links: t.footer.links.product },
    { title: t.footer.platformHeading, links: t.footer.links.platform },
    { title: t.footer.legalHeading, links: t.footer.links.legal },
    { title: t.footer.supportHeading, links: t.footer.links.support },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-900 dark:border-white/[0.10] dark:bg-[#070d24] py-14 px-4 sm:px-6 lg:px-8 text-white">
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
              {t.footer.brandDesc}
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
          {footerGroups.map((group) => (
            <motion.div key={group.title} variants={itemFadeUp}>
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white/70 mb-3.5">
                {group.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {group.links.map((link) => (
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
              {t.footer.directContact}
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

<<<<<<< HEAD
export function FinalCTA() {
  const ref = useGsapReveal<HTMLElement>();
  return (
    <section ref={ref} className="relative px-5 py-32">
      <div
        className="glass-panel mx-auto max-w-4xl overflow-hidden rounded-[28px] px-6 py-20 text-center"
        style={{ background: "rgba(20,20,26,0.6)" }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div data-reveal><Eyebrow>Free for 14 days — no card required</Eyebrow></div>
        <h2 data-reveal className="font-display mx-auto mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl">
          Your AI marketing team<br /><span className="sai-gradient-text">starts today.</span>
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-xl text-base text-white/60 sm:text-lg">
          Join 2,000+ creators and businesses who stopped posting manually and started delegating to AI.
        </p>
        <div data-reveal className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <button
              className="group flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#6366f1 0%,#a855f7 60%,#f5c451 130%)", boxShadow: "0 0 44px -8px rgba(99,102,241,0.7)" }}
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
          <Link href="/login">
            <button className="rounded-full border border-white/15 bg-white/[0.05] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Sign in to dashboard
            </button>
          </Link>
        </div>
        <p data-reveal className="mt-8 text-xs text-white/40">
          Then from ₦5,000/month. Paystack, Flutterwave, and all Nigerian cards.
        </p>
      </div>
    </section>
  );
}

/* ── Footer -------------------------------------------------------- */

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-5 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={24} height={21} className="h-[22px] w-auto" />
          <span className="font-display text-[15px] font-semibold text-white">
            Koraspace<span className="text-[var(--sai-indigo)]"> AI</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-white/50">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#pricing" className="transition-colors hover:text-white">Pricing</a>
          <Link href="/login" className="transition-colors hover:text-white">Sign in</Link>
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-white/30 sm:text-left">
        © {new Date().getFullYear()} Koraspace AI — Personal Social Agent. Powered by Llama 3.3 70B.
      </p>
=======
        {/* Bottom Credits Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} {t.footer.rightsReserved}</p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="compact" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
              <span className="text-white/60">{t.footer.builtLocation}</span>
            </div>
          </div>
        </div>
      </div>
>>>>>>> main
    </footer>
  );
}
