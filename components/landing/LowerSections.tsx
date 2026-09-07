/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Brain, Ghost, TrendingUp, DollarSign, Target, BarChart3,
  Calendar, MessageSquare, FileText, Clock,
  Link2, Sparkles, Send, LineChart,
  ArrowRight, Check, Star, Users, Zap, Search, Globe, Camera, Briefcase, Play, MessageCircle, Music,
  ChevronDown, Activity, RefreshCw, Layers3, Eye, Flame, Award, ShieldCheck, QrCode,
  Mail, Phone, MapPin
} from "lucide-react";

/* ── Shared Button ────────────────────────────────────────────────── */

function LandingButton({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <button
        className={`px-7 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${className}`}
      >
        {children}
      </button>
    </Link>
  );
}

/* ── Section Header Component ─────────────────────────────────────── */

function Eyebrow({ children, tone = "pink" }: { children: React.ReactNode; tone?: "pink" | "blue" | "gradient" }) {
  const colorClass =
    tone === "blue"
      ? "text-[#0066FF]"
      : tone === "gradient"
      ? "bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent"
      : "text-[#FF2E93]";

  return (
    <span className={`inline-block font-mono text-xs uppercase tracking-[0.25em] font-extrabold ${colorClass}`}>
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  tone = "pink",
  title,
  sub,
}: {
  eyebrow: string;
  tone?: "pink" | "blue" | "gradient";
  title: React.ReactNode;
  sub?: string;
}) {
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={headerVariants}
      className="mx-auto mb-16 max-w-3xl text-center"
    >
      <div><Eyebrow tone={tone}>{eyebrow}</Eyebrow></div>
      <h2 className="font-display mt-4 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg font-medium">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/* ── 1. Alternating FeatureSection Layout (From Reference Code) ───── */

interface FeatureProps {
  badge?: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageLeft?: boolean;
}

export function FeatureSection({
  badge,
  title,
  description,
  imageUrl,
  imageAlt,
  imageLeft = true,
}: FeatureProps) {
  const imageContainer: Variants = {
    hidden: {
      opacity: 0,
      x: imageLeft ? -40 : 40,
      y: 20,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const textContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const textItem: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 20,
      },
    },
  };

  return (
    <section className="py-12 md:py-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
      {/* Animated Image Wrapper Panel */}
      <motion.div
        variants={imageContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex-1 w-full will-change-transform cursor-pointer ${
          imageLeft ? "md:order-1" : "md:order-2"
        }`}
      >
        <div
          className={`relative rounded-[40px] p-2.5 shadow-2xl border overflow-hidden ${
            imageLeft
              ? "bg-gradient-to-br from-[#FF2E93]/20 via-black to-[#0066FF]/10 border-[#FF2E93]/30"
              : "bg-gradient-to-br from-[#0066FF]/20 via-black to-[#FF2E93]/10 border-[#0066FF]/30"
          }`}
          style={{ backdropFilter: "blur(20px)" }}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-[320px] sm:h-[380px] rounded-[32px] object-cover select-none border border-white/10"
          />
        </div>
      </motion.div>

      {/* Animated Content Wrapper Panel */}
      <motion.div
        variants={textContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className={`flex-1 space-y-6 ${imageLeft ? "md:order-2" : "md:order-1"}`}
      >
        {badge && (
          <motion.div variants={textItem}>
            <Eyebrow tone={imageLeft ? "pink" : "blue"}>{badge}</Eyebrow>
          </motion.div>
        )}

        <motion.h2
          variants={textItem}
          className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
        >
          {title}
        </motion.h2>

        <motion.p
          variants={textItem}
          className="text-base md:text-lg text-white/70 font-medium leading-relaxed"
        >
          {description}
        </motion.p>

        <motion.div
          variants={textItem}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-fit"
        >
          <LandingButton
            href="/signup"
            className={
              imageLeft
                ? "bg-[#FF2E93] text-white shadow-lg shadow-[#FF2E93]/30 hover:shadow-[#FF2E93]/50"
                : "bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30 hover:shadow-[#0066FF]/50"
            }
          >
            Try it Now
          </LandingButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── 2. The KoraSpace Autonomous Growth Loop Section ──────────────── */

const LOOP_STAGES = [
  {
    num: "01",
    title: "Understand & Research",
    desc: "Analyzes brand data, target audience, past posts, and scans real-time niche trends across platforms.",
    icon: Search,
    color: "#FF2E93",
    badge: "Brand Brain & Search"
  },
  {
    num: "02",
    title: "Strategize & Create",
    desc: "Executes an 8-step AI pipeline: niche check -> voice match -> draft generation -> post scoring -> double web reflection.",
    icon: Sparkles,
    color: "#C13FE8",
    badge: "AI Composing Pipeline"
  },
  {
    num: "03",
    title: "Publish & Monitor",
    desc: "Schedules to Instagram, TikTok, LinkedIn, YouTube, X, and Threads. Monitors post performance and lead engagement in real time.",
    icon: Calendar,
    color: "#0066FF",
    badge: "Multi-Platform Auto-Scheduler"
  },
  {
    num: "04",
    title: "Learn & Optimize",
    desc: "Measures likes, DMs, leads, and revenue. Identifies winning hooks and feeds findings back to auto-improve the next strategy.",
    icon: RefreshCw,
    color: "#00E5FF",
    badge: "Social-to-Revenue Flywheel"
  }
];

export function GrowthLoopSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 90, damping: 18 },
    },
  };

  return (
    <section id="how" className="relative px-5 py-24 sm:py-32 bg-[#07050d] overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-[#FF2E93]/15 via-[#5A3CFF]/15 to-[#0066FF]/15 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          eyebrow="The KoraSpace Autonomous Growth Loop"
          tone="gradient"
          title={
            <>
              Marketing that <span className="bg-gradient-to-r from-[#FF2E93] via-[#C13FE8] to-[#0066FF] bg-clip-text text-transparent">markets itself</span> automatically.
            </>
          }
          sub="Buffer and Hootsuite make you schedule manually. KoraSpace is an AI growth engine that learns your business, creates content, measures revenue, and optimizes itself."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {LOOP_STAGES.map((s) => (
            <motion.div
              key={s.num}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className="relative flex flex-col justify-between rounded-[36px] p-7 text-white transition-all duration-300 shadow-xl"
              style={{
                background: "linear-gradient(170deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1.5px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold tracking-wider" style={{ color: s.color }}>
                  #{s.num}
                </span>
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}
                >
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
              </div>

              <div className="mt-8">
                <span className="font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-semibold">
                  {s.badge}
                </span>
                <h3 className="font-display mt-4 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/65 font-medium">{s.desc}</p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold" style={{ color: s.color }}>
                <span>Feeds next stage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 3. Interactive FeatureShowcase (From Reference Code) ─────────── */

interface FeatureNode {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  screenPath: string;
}

const FEATURE_SET_DATA: FeatureNode[] = [
  {
    id: "ai-composer",
    title: "AI Composing Pipeline",
    tagline: "Multi-Step Content Engine",
    description: "Executes an 8-step AI workflow: checks client niche -> reads past posts -> scans active trends -> drafts post & caption -> assigns hashtags -> double web reflection.",
    icon: Sparkles,
    screenPath: "/features/Kora-AI-Composer.jpg",
  },
  {
    id: "visual-calendar",
    title: "Visual Calendar 2.0",
    tagline: "Drag-and-Drop Planning",
    description: "Visual planning surface to schedule, organize, and drag-and-drop posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads seamlessly.",
    icon: Calendar,
    screenPath: "/features/Visual-Drag-and-Drop Calendar.jpg",
  },
  {
    id: "repurposer",
    title: "Content Repurposer",
    tagline: "One Asset to Multi-Platform",
    description: "Turn one YouTube video, blog article, or podcast into LinkedIn posts, X threads, Instagram carousels, TikTok scripts, and newsletters automatically.",
    icon: RefreshCw,
    screenPath: "/features/social-media-concept-with-device.jpg",
  },
  {
    id: "inbox-crm",
    title: "Social Inbox & Sales CRM",
    tagline: "Lead Intelligence & Triage",
    description: "Unified inbox that classifies comments and DMs into Leads, Support, or Spam. Detects high-intent buying signals ('How much?') and logs $ opportunities.",
    icon: DollarSign,
    screenPath: "/features/social-ecommerce.jpg",
  },
  {
    id: "agency-workspaces",
    title: "Agency Workspaces",
    tagline: "Multi-Seat Collaboration",
    description: "Built for agencies and growth teams. Manage multiple client workspaces, invite team members with strict RLS permissions, and streamline draft approvals.",
    icon: Users,
    screenPath: "/features/manage-multiple-brands.jpg",
  },
  {
    id: "growth-marketing",
    title: "Growth & Marketing Suite",
    tagline: "Revenue Attribution & Strategy",
    description: "Track the full funnel from social impressions to website visits, leads, and revenue. Get AI-driven 30/60/90 day growth plans automatically.",
    icon: TrendingUp,
    screenPath: "/features/social-media-marketing.jpg",
  },
];

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoLoopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimerPipeline = () => {
    clearActiveTimer();
    autoLoopTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURE_SET_DATA.length);
    }, 5000);
  };

  const clearActiveTimer = () => {
    if (autoLoopTimerRef.current) {
      clearInterval(autoLoopTimerRef.current);
    }
  };

  useEffect(() => {
    startTimerPipeline();
    return () => clearActiveTimer();
  });

  const handleManualSelectionToggle = (index: number) => {
    setActiveIndex(index);
    startTimerPipeline();
  };

  const activeFeature = FEATURE_SET_DATA[activeIndex];

  return (
    <section className="py-24 rounded-[36px] bg-[#0c0919] text-white relative overflow-hidden font-sans border border-white/10 my-8 mx-4 sm:mx-8">
      <div>
        {/* Dynamic Content Description Area */}
        <div className="min-h-40 max-w-4xl mx-auto px-6 text-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-3"
            >
              <div>
                <span className="text-xs font-mono font-extrabold tracking-widest text-[#FF2E93] uppercase">
                  {activeFeature.tagline}
                </span>
                <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1">
                  {activeFeature.title}
                </h3>
              </div>

              <p className="text-sm md:text-base max-w-2xl mx-auto font-medium text-white/70 leading-relaxed">
                {activeFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dot Matrix */}
          <div className="flex items-center gap-2 justify-center pt-2 mt-6">
            {FEATURE_SET_DATA.map((_, idx) => (
              <div
                key={idx}
                onClick={() => handleManualSelectionToggle(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? "w-8 bg-gradient-to-r from-[#FF2E93] to-[#0066FF]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Display Viewport Showcase Frame */}
        <div className="flex items-center justify-center relative w-full max-w-4xl mx-auto mt-8 px-6 transform-gpu">
          <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeFeature.id}
                src={activeFeature.screenPath}
                alt={`${activeFeature.title} Showcase`}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full h-full object-cover object-top"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Navigation Stack Node Matrix */}
        <nav className="hidden md:flex gap-3 relative w-full max-w-5xl mx-auto justify-center flex-wrap mt-10 px-4">
          {FEATURE_SET_DATA.map((feat, idx) => {
            const IconComponent = feat.icon;
            const isSelected = idx === activeIndex;

            return (
              <button
                key={feat.id}
                onClick={() => handleManualSelectionToggle(idx)}
                className={`overflow-hidden text-left px-5 py-3.5 rounded-2xl flex items-center justify-between border transition-all duration-300 relative group cursor-pointer ${
                  isSelected
                    ? "border-[#FF2E93]/60 bg-white/10 shadow-lg shadow-[#FF2E93]/20"
                    : "border-white/10 hover:bg-white/5 bg-black/30 text-white/70"
                }`}
              >
                <div className="flex items-center gap-3 relative z-10 w-full shrink-0">
                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-gradient-to-r from-[#FF2E93] to-[#0066FF] text-white"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm shrink-0 font-bold tracking-tight text-white">
                    {feat.title}
                  </span>
                </div>

                {/* Active Progress Track */}
                {isSelected && (
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#FF2E93] to-[#0066FF] z-10"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Swipable Selector Row */}
        <div className="flex md:hidden flex-wrap justify-center p-4 gap-2 no-scrollbar scroll-smooth snap-x mt-6">
          {FEATURE_SET_DATA.map((feat, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={feat.id}
                onClick={() => handleManualSelectionToggle(idx)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap snap-center cursor-pointer transition-all ${
                  isSelected
                    ? "text-white bg-gradient-to-r from-[#FF2E93] to-[#0066FF] border-transparent shadow-lg"
                    : "text-white/70 border-white/10 bg-white/5"
                }`}
              >
                {feat.title}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 4. KoraSpace Brand Brain & 8-Agent Swarm Section ─────────────── */

const AGENT_SWARM = [
  { name: "Research Agent", role: "Scans viral niche trends & web data", icon: Search },
  { name: "Brand Agent", role: "Guarantees brand voice & guidelines", icon: ShieldCheck },
  { name: "Content Agent", role: "Drafts captions, scripts & carousels", icon: FileText },
  { name: "Strategy Agent", role: "Generates 30/60/90 day growth plans", icon: Target },
  { name: "Analytics Agent", role: "Tracks funnel metrics & revenue attribution", icon: BarChart3 },
  { name: "Competitor Agent", role: "Monitors rival video & post formats", icon: Eye },
  { name: "Engagement Agent", role: "Triages inbox & manages Ghost Mode DMs", icon: MessageSquare },
  { name: "Optimization Agent", role: "Executes A/B testing & post scoring", icon: Activity }
];

export function BrainAndAgentsSection() {
  return (
    <section id="brain" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="AI Architecture & Brain"
          tone="blue"
          title={
            <>
              Powered by the <span className="text-[#FF2E93]">KoraSpace Brand Brain</span> & <span className="text-[#0066FF]">8-Agent Swarm</span>
            </>
          }
          sub="Instead of a generic single AI prompt, KoraSpace deploys a specialized multi-agent system connected to your business Knowledge Base."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          {/* Brand Brain Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 rounded-[36px] p-8 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,46,147,0.12) 0%, rgba(0,102,255,0.08) 100%)",
              border: "1.5px solid rgba(255,46,147,0.3)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF2E93]/20 border border-[#FF2E93]/40 mb-6">
              <Brain className="h-7 w-7 text-[#FF2E93]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF2E93] font-extrabold">
              Persistent Knowledge Base
            </span>
            <h3 className="font-display mt-2 text-2xl font-black">KoraSpace Brand Brain</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70 font-medium">
              Upload your website URL, product PDFs, brand guidelines, or past top posts. The Brand Brain builds a persistent memory profile so every post sounds authentically like you — never generic.
            </p>

            <ul className="mt-6 space-y-2.5 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#FF2E93]" /> Learns tone, vocabulary & emojis
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#FF2E93]" /> Remembers custom guidelines ("No competitors")
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#FF2E93]" /> Uses past winning content as ground truth
              </li>
            </ul>
          </motion.div>

          {/* 8-Agent Swarm Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGENT_SWARM.map((ag) => (
              <motion.div
                key={ag.name}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)"
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0066FF]/20 text-[#0066FF]">
                  <ag.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-white">{ag.name}</h4>
                  <p className="text-xs text-white/60 font-medium">{ag.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 4.5 Agent Tools & Autonomous Capabilities ─────────────────────── */

const AGENT_TOOLS_LIST = [
  {
    title: "8-Step AI Composing Pipeline",
    desc: "Checks client niche, past posts, active trends, drafts content, assigns hashtags, and reflects before outputting.",
    icon: Sparkles,
    badge: "Generation"
  },
  {
    title: "Post Score Predictor",
    desc: "AI scores post quality (1-100) before publishing and predicts engagement probability across platforms.",
    icon: Activity,
    badge: "Optimization"
  },
  {
    title: "Ghost Mode™ Lead Triage",
    desc: "Automated DM & comment monitor with human-like delays that detects buying signals and logs leads to CRM.",
    icon: Ghost,
    badge: "Automation"
  },
  {
    title: "Competitor Video Spy",
    desc: "Tracks top-performing short videos in your niche and breaks down their hooks, pacing, and calls to action.",
    icon: Eye,
    badge: "Intelligence"
  },
  {
    title: "Auto-Hashtag & SEO Engine",
    desc: "Generates platform-optimized hashtag clusters and keyword tags for max algorithmic distribution.",
    icon: Search,
    badge: "Reach"
  },
  {
    title: "Multi-Platform Repurposer",
    desc: "Turns 1 video or article into Instagram carousels, X threads, LinkedIn posts, and newsletter digests in 1 click.",
    icon: RefreshCw,
    badge: "Repurposing"
  }
];

export function AgentTools() {
  return (
    <section className="relative px-5 py-24 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Autonomous Toolkit"
          tone="pink"
          title={
            <>
              Supercharge your social presence with <span className="text-[#FF2E93]">AI Agent Tools</span>
            </>
          }
          sub="Deeply integrated utilities designed to automate high-impact marketing tasks end-to-end."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENT_TOOLS_LIST.map((tool) => (
            <motion.div
              key={tool.title}
              whileHover={{ y: -5, scale: 1.02 }}
              className="rounded-[32px] p-7 text-white flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, rgba(255,46,147,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1.5px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(16px)"
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF2E93]/15 border border-[#FF2E93]/30">
                    <tool.icon className="h-5 w-5 text-[#FF2E93]" />
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed font-medium">{tool.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ── 5. Platform Integrations Section ─────────────────────────────── */

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
    <section className="relative px-5 py-24 bg-[#07050d] text-white overflow-hidden">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow tone="blue">Multi-Platform Ecosystem</Eyebrow>
        <h2 className="font-display mt-3 text-3xl font-black sm:text-4xl">
          Publish & manage across <span className="text-[#0066FF]">all your channels</span>
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
        {PLATFORMS.map((p) => (
          <motion.div
            key={p.name}
            whileHover={{ scale: 1.06, y: -2 }}
            className="flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white transition-all shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)"
            }}
          >
            <img
              src={p.iconPath}
              alt={`${p.name} icon`}
              className="h-6 w-6 object-contain rounded-md select-none shrink-0"
            />
            <span>{p.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── 6. Growth & Revenue Intelligence Section ─────────────────────── */

export function RevenueAttributionSection() {
  return (
    <section id="revenue" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Growth & Revenue Intelligence"
          tone="gradient"
          title={
            <>
              From social views to <span className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">real revenue</span>
            </>
          }
          sub="Don't stop at vanity likes. Track the complete conversion funnel from post impressions down to actual dollar sales."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          {/* Revenue Attribution Funnel Visual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 rounded-[36px] p-8 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(170deg, rgba(0,102,255,0.1) 0%, rgba(255,46,147,0.05) 100%)",
              border: "1.5px solid rgba(0,102,255,0.3)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-extrabold">Social-to-Revenue Funnel</h3>
              <span className="font-mono text-xs text-[#0066FF] bg-[#0066FF]/20 px-3 py-1 rounded-full font-bold">
                Live Attribution
              </span>
            </div>

            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <span>50,000 Social Views</span>
                <span className="text-white/60">Top of Funnel</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/10 ml-3">
                <span>1,420 Profile Visits</span>
                <span className="text-[#FF2E93]">2.84% Conv.</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/10 ml-6">
                <span>310 Website Visitors</span>
                <span className="text-[#0066FF]">UTM Tracked</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/10 ml-9">
                <span>48 Qualified Leads</span>
                <span className="text-[#00E5FF]">Social Inbox CRM</span>
              </div>
              <div className="flex justify-between items-center bg-gradient-to-r from-[#FF2E93]/20 to-[#0066FF]/20 p-4 rounded-2xl border border-[#FF2E93]/50 font-bold ml-12 text-white">
                <span>11 Customers ($4,850 Revenue)</span>
                <span className="text-[#FF2E93]">$4,850 Total</span>
              </div>
            </div>
          </motion.div>

          {/* KoraScore & Health Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="rounded-[32px] p-7 text-white"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/60 font-bold">Account Health Score</span>
                <Award className="h-6 w-6 text-[#FF2E93]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-black text-white">KoraScore: 78</span>
                <span className="text-sm text-white/50">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-[#FF2E93] font-medium">
                "Posting consistency dropped 24%. Re-engage video scheduler to regain 12 score points."
              </p>
            </div>

            <div
              className="rounded-[32px] p-7 text-white"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/60 font-bold">Lead Opportunity Radar</span>
                <Flame className="h-6 w-6 text-[#0066FF]" />
              </div>
              <h4 className="font-display mt-2 text-lg font-black">4 Trending Niche Opportunities</h4>
              <p className="mt-1 text-xs text-white/60 font-medium">
                3 competitor gaps identified · 2 high-value lead questions waiting in DMs ($2,000 opportunity).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 6.5 Agency & Team Collaboration Section ───────────────────────── */

const COLLAB_FEATURES = [
  {
    title: "Client Workspace Portals",
    desc: "Isolated brand environments with row-level security. Give clients a clean view of their scheduled calendar and analytics.",
    icon: Briefcase
  },
  {
    title: "1-Click Draft Approval",
    desc: "Send shareable draft review links to clients or team leads without forcing them to create an account.",
    icon: ShieldCheck
  },
  {
    title: "Role-Based Permissions",
    desc: "Assign roles (Admin, Editor, Reviewer, Client) with granular rights over posting, billing, and social credentials.",
    icon: Users
  },
  {
    title: "Audit Log & Version Control",
    desc: "Track every edit, approval, prompt change, and published post with full timestamps and user attribution.",
    icon: Clock
  }
];

export function Collaboration() {
  return (
    <section className="relative px-5 py-24 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Team & Agency Workspaces"
          tone="blue"
          title={
            <>
              Collaborate seamlessly with <span className="text-[#0066FF]">multi-seat controls</span>
            </>
          }
          sub="Built for marketing agencies, brand teams, and founders managing multiple social accounts with ease."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COLLAB_FEATURES.map((collab) => (
            <motion.div
              key={collab.title}
              whileHover={{ y: -5 }}
              className="rounded-[32px] p-8 text-white flex gap-5 items-start"
              style={{
                background: "linear-gradient(135deg, rgba(0,102,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1.5px solid rgba(0, 102, 255, 0.2)",
                backdropFilter: "blur(16px)"
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#0066FF]">
                <collab.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{collab.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed font-medium">{collab.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 7. FAQ Accordion Section (From Reference Code) ───────────────── */

const FAQS_DATA = [
  {
    q: "What is KoraSpace and how does the Autonomous Growth Loop work?",
    a: "KoraSpace is an AI-powered marketing operating system. Unlike simple schedulers, KoraSpace runs a continuous 4-stage loop: it understands your brand voice, researches trends in your niche, creates and schedules posts across channels, and analyzes performance down to sales revenue to auto-optimize future strategy."
  },
  {
    q: "How does the Brand Brain learn my tone of voice?",
    a: "Simply paste your website URL, brand guidelines, product PDFs, or past top-performing social posts. The KoraSpace Brand Brain builds a persistent memory profile so every generated post, caption, and reply sounds authentically like you."
  },
  {
    q: "What is Ghost Mode™ and is it safe from platform bans?",
    a: "Ghost Mode™ runs sales DM and comment engagement with randomized human-like delays (30s, 45s, 75s) and strict compliance rules. It handles noise, answers FAQs, and flags high-value buying leads directly to your inbox."
  },
  {
    q: "Which social media platforms are supported?",
    a: "KoraSpace connects directly to Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Facebook, Threads, WhatsApp, and Telegram via official authorized OAuth 2.0 APIs."
  },
  {
    q: "Can I use KoraSpace for multi-client agencies or teams?",
    a: "Yes! Our Teams & Agency plans offer dedicated client workspace portals, multi-seat team member permissions, draft approval workflows, and white-label client performance reports."
  },
  {
    q: "What payment methods are supported?",
    a: "All plans are priced in Nigerian Naira (NGN) with transparent billing via Paystack and Flutterwave. We accept all Nigerian debit cards, bank transfers, and international cards."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 18,
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-24 px-6 bg-[#0c0919] text-white rounded-[36px] my-8 mx-4 sm:mx-8 border border-white/10 relative overflow-hidden"
    >
      <div className="max-w-3xl mx-auto">
        <SectionHead
          eyebrow="Frequently Asked Questions"
          tone="pink"
          title={<>Got questions? <span className="text-[#FF2E93]">We've got answers.</span></>}
          sub="Everything you need to know about KoraSpace, AI automation, and pricing."
        />

        <motion.div variants={listVariants} className="space-y-4 transform-gpu">
          {FAQS_DATA.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="border-b border-white/10 pb-2"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex justify-between items-center text-left py-5 focus:outline-none group select-none cursor-pointer"
                >
                  <span className="text-lg md:text-xl font-bold text-white group-hover:text-[#FF2E93] transition-colors duration-200">
                    {faq.q}
                  </span>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[#FF2E93] ml-4 shrink-0"
                  >
                    <ChevronDown size={22} className="stroke-[2.5]" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.25, delay: 0.05 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.15 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="text-white/70 text-base leading-relaxed pb-5 pr-6 font-medium">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ── 8. Stories (Testimonials) ────────────────────────────────────── */

const STORIES = [
  { name: "Adaeze Okonkwo", role: "Fintech Founder, Lagos", avatar: "AO", text: "I replaced Buffer and a freelance manager with KoraSpace. Ghost Mode handles engagement while I close deals. ROI in week one.", highlight: "Replaced freelance team" },
  { name: "Chukwuemeka Dike", role: "Digital Agency, Abuja", avatar: "CD", text: "Eight client accounts used to need three people. Now it's me and KoraSpace. Social Inbox Triage alone saves 2 hours a day.", highlight: "Manages 8 clients solo" },
  { name: "Fatima Al-Hassan", role: "E-commerce, Kano", avatar: "FA", text: "Revenue Attribution is wild. I can show 'this post made us ₦340,000 this week.' The marketing budget stopped being a question.", highlight: "₦340,000 from 1 post" },
  { name: "Tunde Fashola", role: "Brand Coach, Lagos", avatar: "TF", text: "Trend-to-Draft is a ghostwriter that never sleeps. It caught the news cycle before I woke up — three drafts waiting.", highlight: "Trend content on autopilot" },
  { name: "Ngozi Eze", role: "Fashion Brand, Port Harcourt", avatar: "NE", text: "I was skeptical about AI sounding like me. My followers can't tell. Engagement went up three times.", highlight: "3× engagement boost" },
  { name: "Biodun Afolabi", role: "SaaS Founder, Lagos", avatar: "BA", text: "The persistent Brand Brain keeps content private and accurate. And the pricing structure in NGN makes complete sense.", highlight: "Privacy-first Brand Brain" },
];

export function Stories() {
  const quoteContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2,
      },
    },
  };

  const wordtext: Variants = {
    hidden: { opacity: 0, y: 3, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.18, ease: "easeOut" },
    },
  };

  return (
    <section id="stories" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Operator Success Stories"
          tone="pink"
          title={
            <>
              Loved by <span className="text-[#FF2E93]">creators & growth teams</span>
            </>
          }
          sub="See how businesses and agencies scale their social media marketing using KoraSpace."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STORIES.map((t) => {
            const words = t.text.split(" ");
            return (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-[32px] p-7 text-white flex flex-col justify-between cursor-pointer group"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1.5px solid rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(16px)"
                }}
              >
                <motion.p variants={quoteContainer} className="text-sm leading-relaxed text-white/80 font-medium select-none flex flex-wrap">
                  <span className="text-[#FF2E93] font-bold mr-1">“</span>
                  {words.map((word, index) => (
                    <motion.span key={index} variants={wordtext} className="inline-block mr-1">
                      {word}
                    </motion.span>
                  ))}
                  <span className="text-[#FF2E93] font-bold ml-1">”</span>
                </motion.p>

                <div className="mt-6">
                  <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#FF2E93]/15 text-[#FF2E93] border border-[#FF2E93]/30 font-bold">
                    {t.highlight}
                  </span>
                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-md group-hover:scale-105 transition-transform"
                      style={{ background: "linear-gradient(135deg, #FF2E93, #0066FF)" }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#FF2E93] transition-colors">{t.name}</p>
                      <p className="text-xs text-white/50 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 9. Pricing Section (From PRD Section 9 & Reference Code) ─────── */

const BASE_PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    period: "/month",
    desc: "For creators getting started",
    posts: "3 scheduled posts / mo",
    features: [
      "50,000 AI tokens/mo",
      "3 social integrations",
      "Basic analytics",
      "Visual content calendar",
      "Mobile app access"
    ],
    cta: "Start Free",
    highlight: false
  },
  {
    name: "Pro",
    monthlyPrice: 13500,
    period: "/month",
    desc: "For growing brands & businesses",
    posts: "100 scheduled posts / mo",
    features: [
      "400,000 AI tokens/mo",
      "7 social integrations",
      "3 team collaborators",
      "5 sales & Ghost Mode bots",
      "Trend analysis & Brand Brain",
      "Post scoring prediction"
    ],
    cta: "Start Pro Trial",
    highlight: true,
    badge: "Most Popular"
  },
  {
    name: "Advanced",
    monthlyPrice: 30000,
    period: "/month",
    desc: "For scaling businesses & creators",
    posts: "500 scheduled posts / mo",
    features: [
      "900,000 AI tokens/mo",
      "10 social integrations",
      "7 team collaborators",
      "15 sales & Ghost Mode bots",
      "Competitor video spy",
      "A/B testing & Hashtag manager",
      "Social-to-Revenue Attribution"
    ],
    cta: "Get Advanced",
    highlight: false
  },
  {
    name: "Teams / Agency",
    monthlyPrice: 130000,
    period: "/month",
    desc: "For marketing agencies at scale",
    posts: "High Volume",
    features: [
      "1.8M tokens/wk (7.2M/mo)",
      "Unlimited* social integrations",
      "Unlimited team & client seats",
      "Unlimited/very high bots",
      "White-label client reports",
      "Client workspace portals",
      "Priority API & support"
    ],
    cta: "Get Teams Plan",
    highlight: false,
    badge: "Agency Tier"
  }
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getFormattedPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return "₦0";
    const finalPrice = billingPeriod === "yearly" ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
    return `₦${finalPrice.toLocaleString("en-NG")}`;
  };

  return (
    <section id="pricing" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Simple NGN Pricing"
          tone="gradient"
          title={
            <>
              Transparent plans. <br />
              <span className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">
                No USD exchange surprises.
              </span>
            </>
          }
          sub="Pay with Paystack, Flutterwave, or any card. Every paid plan includes a 14-day free trial."
        />

        {/* Billing Toggle Switch (From Reference Code) */}
        <div className="flex justify-center items-center gap-2 mb-14">
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 inline-flex items-center backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-gradient-to-r from-[#FF2E93] to-[#0066FF] text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all capitalize flex items-center gap-2 cursor-pointer ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-[#FF2E93] to-[#0066FF] text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>Yearly Billing</span>
              <span className="bg-[#FF2E93] text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-start mb-16">
          {BASE_PLANS.map((p) => (
            <motion.div
              key={p.name}
              whileHover={{ y: -6, scale: 1.01 }}
              className="relative flex flex-col justify-between rounded-[36px] p-7 text-white h-full"
              style={{
                background: p.highlight
                  ? "linear-gradient(170deg, rgba(255,46,147,0.15) 0%, rgba(0,102,255,0.1) 100%)"
                  : "rgba(255, 255, 255, 0.04)",
                border: p.highlight
                  ? "2px solid #FF2E93"
                  : "1.5px solid rgba(255, 255, 255, 0.08)",
                boxShadow: p.highlight ? "0 0 35px rgba(255,46,147,0.25)" : "none"
              }}
            >
              {p.badge && (
                <span
                  className="font-mono text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full absolute -top-3 left-6 text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #FF2E93, #0066FF)" }}
                >
                  {p.badge}
                </span>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black text-white">
                    {getFormattedPrice(p.monthlyPrice)}
                  </span>
                  <span className="text-xs text-white/50 font-medium">
                    {billingPeriod === "yearly" ? "/mo (billed annually)" : p.period}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/60 font-medium">{p.desc}</p>

                <div className="mt-4 font-mono text-xs font-bold text-[#FF2E93] bg-[#FF2E93]/10 px-3 py-1.5 rounded-xl border border-[#FF2E93]/20">
                  {p.posts}
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-white/75 font-medium">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#0066FF] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/signup" className="mt-8">
                <button
                  className="w-full rounded-full py-3 text-sm font-bold transition-all cursor-pointer"
                  style={
                    p.highlight
                      ? { background: "linear-gradient(135deg, #FF2E93 0%, #0066FF 100%)", color: "#ffffff", boxShadow: "0 0 20px rgba(255,46,147,0.4)" }
                      : { background: "rgba(255,255,255,0.08)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)" }
                  }
                >
                  {p.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Add-on Alert Box Block (From Reference Code) */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="max-w-3xl mx-auto rounded-3xl p-6 text-white flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(255,46,147,0.12) 0%, rgba(0,102,255,0.12) 100%)",
            border: "1.5px solid rgba(0,102,255,0.3)",
            backdropFilter: "blur(16px)"
          }}
        >
          <div>
            <h4 className="font-display font-black text-lg text-white">Custom Enterprise & Dedicated AI Workspaces</h4>
            <p className="text-white/70 text-xs mt-1 font-medium">
              Need custom LLM fine-tuning, dedicated IP addresses, SLA guarantees, or custom team seats?
            </p>
          </div>
          <Link href="mailto:support@koraspace.ai" className="shrink-0">
            <button className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer">
              Contact Enterprise Sales
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 10. FinalCTA Component (From Reference Code) ─────────────────── */

export function FinalCTA() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 80, damping: 16 },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 18,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="py-16 md:py-24 px-6 bg-gradient-to-br from-[#0c0919] via-[#07050d] to-[#05081c] text-white rounded-[36px] border border-white/10 my-8 mx-4 sm:mx-8 z-50 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* Content Side */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.h2 variants={textVariants} className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#FF2E93]">
            14-Day Free Trial — No Credit Card Required
          </motion.h2>

          <motion.h1 variants={textVariants} className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Your AI marketing team <br />
            <span className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">
              starts today.
            </span>
          </motion.h1>

          <motion.p variants={textVariants} className="text-white/80 text-lg font-medium max-w-xl mx-auto md:mx-0">
            Join 2,000+ creators, founders, and agencies automating content creation, scheduling, lead triage, and revenue growth.
          </motion.p>

          <motion.div variants={textVariants} className="pt-4 flex justify-center md:justify-start">
            <LandingButton
              href="/signup"
              className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] text-white shadow-lg shadow-[#FF2E93]/30 hover:shadow-[#0066FF]/40 transition-all duration-300"
            >
              Get Started Free
            </LandingButton>
          </motion.div>
        </div>

        {/* Image Mockup Side */}
        <motion.div variants={imageVariants} className="flex-1 w-full transform-gpu">
          <div className="relative rounded-[36px] overflow-hidden shadow-2xl border border-white/15 bg-black/40 p-4">
            <img
              src="/features/social-media-marketing.jpg"
              alt="KoraSpace Social Media Growth Dashboard"
              className="w-full h-80 sm:h-96 rounded-[28px] object-cover object-top"
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ── 11. Upgraded Multi-Column Footer UI (From Reference Code) ────── */

const FOOTER_LINKS = {
  Product: [
    { label: "AI Composing Pipeline", href: "#features" },
    { label: "Visual Calendar 2.0", href: "#features" },
    { label: "Brand Brain", href: "#brain" },
    { label: "Autonomous Growth Loop", href: "#how" },
    { label: "Pricing & Plans", href: "#pricing" },
  ],
  Platform: [
    { label: "Instagram Integration", href: "#" },
    { label: "TikTok Auto-Scheduler", href: "#" },
    { label: "LinkedIn & X Publisher", href: "#" },
    { label: "YouTube Short Repurposer", href: "#" },
    { label: "WhatsApp & Telegram Bots", href: "#" },
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
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const columnVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const descriptionStream: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.2 },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 3, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const descWords = "An AI-powered marketing operating system built for modern creators, startups, and agencies.".split(" ");

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={containerVariants}
      className="border-t border-[#0066FF]/20 bg-[#05081c] py-16 px-6 text-white relative overflow-hidden transform-gpu"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <motion.div variants={columnVariants} className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3 mb-2">
              <img src="/logo.png" alt="KoraSpace Logo" width={32} height={32} className="h-8 w-auto object-contain" />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Kora<span className="text-[#0066FF]">Space</span>
              </span>
            </Link>

            {/* Word-by-Word Stream Description */}
            <motion.p variants={descriptionStream} className="text-sm text-white/60 leading-relaxed font-medium flex flex-wrap select-none">
              {descWords.map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block mr-1">
                  {word}
                </motion.span>
              ))}
            </motion.p>

            <div className="flex gap-3 pt-2">
              {[Globe, Send, Zap, MessageCircle].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#FF2E93]/50 hover:bg-[#FF2E93]/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <motion.div key={category} variants={columnVariants}>
              <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0066FF] mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Support Column (From Reference Code) */}
          <motion.div variants={columnVariants} className="space-y-4">
            <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#FF2E93] mb-4">
              Direct Contact
            </h4>
            <ul className="space-y-3.5 text-sm font-medium text-white/60">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#FF2E93] shrink-0 mt-0.5" />
                <a href="mailto:support@koraspace.ai" className="hover:text-white transition-colors break-all">
                  support@koraspace.ai
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[#0066FF] shrink-0 mt-0.5" />
                <span>+234 701 313 4821</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#FF2E93] shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Credits Bar */}
        <motion.div variants={columnVariants} className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-medium">
          <p>© {new Date().getFullYear()} KoraSpace by Techla. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>🇳🇬 Built in Nigeria</span>
            <span>•</span>
            <span className="text-[#FF2E93]">Electric Pink & Blue</span>
            <span>•</span>
            <span>Paystack & Flutterwave Billing</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}


