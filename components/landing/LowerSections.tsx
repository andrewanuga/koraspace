"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain, Ghost, TrendingUp, DollarSign, Target, BarChart3,
  Calendar, MessageSquare, FileText, Clock,
  Link2, Sparkles, Send, LineChart,
  ArrowRight, Check, Star, Users, Zap, Search, Globe, Camera, Briefcase, Play, MessageCircle, Music,
  Bot, Cpu, ShieldCheck, Layers, Eye, Flame, Award, ChevronRight, RefreshCw, Layers3, Activity
} from "lucide-react";

/* ── Animation Variants ───────────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

/* ── Helper Components ────────────────────────────────────────────── */

function Eyebrow({ children, tone = "pink" }: { children: React.ReactNode; tone?: "pink" | "blue" | "gradient" }) {
  const colorClass =
    tone === "blue"
      ? "text-[#0066FF]"
      : tone === "gradient"
      ? "bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent"
      : "text-[#FF2E93]";

  return (
    <span className={`inline-block font-mono text-xs uppercase tracking-[0.25em] font-semibold ${colorClass}`}>
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow, tone = "pink", title, sub,
}: { eyebrow: string; tone?: "pink" | "blue" | "gradient"; title: React.ReactNode; sub?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUp}
      className="mx-auto mb-16 max-w-3xl text-center"
    >
      <div><Eyebrow tone={tone}>{eyebrow}</Eyebrow></div>
      <h2 className="font-display mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">
          {sub}
        </p>
      )}
    </motion.div>
  );
}

/* ── 1. The KoraSpace Autonomous Growth Loop ──────────────────────── */

const LOOP_STAGES = [
  {
    num: "01",
    title: "Understand & Research",
    desc: "Analyzes your brand data, target audience, past posts, and scans real-time niche trends across platforms.",
    icon: Search,
    color: "#FF2E93",
    badge: "Brand Brain & Search"
  },
  {
    num: "02",
    title: "Strategize & Create",
    desc: "Executes a multi-step AI composing pipeline: niche check -> voice match -> draft generation -> post scoring -> double web-search reflection.",
    icon: Sparkles,
    color: "#C13FE8",
    badge: "AI Composing Pipeline"
  },
  {
    num: "03",
    title: "Publish & Monitor",
    desc: "Schedules to Instagram, TikTok, LinkedIn, YouTube, X, and Threads. Monitors post performance and customer engagement in real time.",
    icon: Calendar,
    color: "#0066FF",
    badge: "Multi-Platform Auto-Scheduler"
  },
  {
    num: "04",
    title: "Learn & Optimize",
    desc: "Measures likes, DMs, leads, and revenue ($ to sales). Identifies winning hooks and feeds findings back to auto-improve the next strategy.",
    icon: RefreshCw,
    color: "#00E5FF",
    badge: "Social-to-Revenue Flywheel"
  }
];

export function GrowthLoopSection() {
  return (
    <section id="how" className="relative px-5 py-28 sm:py-32 bg-[#07050d] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-r from-[#FF2E93]/15 via-[#5A3CFF]/15 to-[#0066FF]/15 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          eyebrow="The KoraSpace Autonomous Growth Loop"
          tone="gradient"
          title={
            <>
              Marketing that <span className="bg-gradient-to-r from-[#FF2E93] via-[#C13FE8] to-[#0066FF] bg-clip-text text-transparent">closes the loop</span> automatically.
            </>
          }
          sub="Buffer and Hootsuite make you schedule manually. KoraSpace is an AI growth engine that learns your business, creates content, measures revenue, and optimizes itself."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {LOOP_STAGES.map((s) => (
            <motion.div
              key={s.num}
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative flex flex-col justify-between rounded-3xl p-7 text-white transition-all duration-300 shadow-xl"
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
                <span className="font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                  {s.badge}
                </span>
                <h3 className="font-display mt-4 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">{s.desc}</p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold" style={{ color: s.color }}>
                <span>Feeds next stage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Loop closing summary box */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleIn}
          className="mt-12 rounded-3xl p-6 sm:p-8 text-center text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,46,147,0.12) 0%, rgba(0,102,255,0.12) 100%)",
            border: "1.5px solid rgba(255,255,255,0.15)"
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium sm:text-base">
            <span className="text-white/80">Learn business</span>
            <ChevronRight className="h-4 w-4 text-[#FF2E93]" />
            <span className="text-white/80">Research trends</span>
            <ChevronRight className="h-4 w-4 text-[#C13FE8]" />
            <span className="text-white/80">Create content</span>
            <ChevronRight className="h-4 w-4 text-[#0066FF]" />
            <span className="text-white/80">Publish & track ROI</span>
            <ChevronRight className="h-4 w-4 text-[#00E5FF]" />
            <span className="font-bold text-white bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">
              Auto-Grow
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── 2. Core Product Features (Composing Pipeline & Automations) ──── */

const CORE_FEATURES = [
  {
    icon: Sparkles,
    title: "The Composing Post Pipeline",
    desc: "Executes an 8-step AI workflow: checks client niche -> reads past posts -> scans active trends -> drafts post & caption -> assigns hashtags -> runs 2x web reflection.",
    tag: "Multi-Step AI Pipeline",
    tone: "pink"
  },
  {
    icon: RefreshCw,
    title: "Content Repurposing Engine",
    desc: "Turn 1 asset (YouTube video, blog, or podcast) into a LinkedIn post, X thread, Instagram carousel, TikTok script, and newsletter automatically.",
    tag: "Multi-Format Output",
    tone: "blue"
  },
  {
    icon: BarChart3,
    title: "AI Post Performance Scoring",
    desc: "Before publishing, KoraSpace scores posts across Hook (92), Relevance (95), CTA (76), Readability (89), and Brand Fit (94) with instant fix advice.",
    tag: "Predictive Analytics",
    tone: "pink"
  },
  {
    icon: Ghost,
    title: "Ghost Mode™ & Sales Bots",
    desc: "Automated DM & comment sales bots with randomized human-like delays (30s, 45s, 75s) to engage prospective leads naturally without platform bans.",
    tag: "Autonomous Automation",
    tone: "blue"
  },
  {
    icon: DollarSign,
    title: "Social Inbox -> CRM Lead Intelligence",
    desc: "Classifies DMs and comments automatically (Lead, Customer, Spam, Support). Detects high-intent buying signals ('How much?') and logs $ opportunities.",
    tag: "Revenue Intelligence",
    tone: "pink"
  },
  {
    icon: Eye,
    title: "AI Trend & Competitor Spy",
    desc: "Monitors top-performing competitor posts and viral video formats in your exact niche, giving you original inspired hooks before anyone else.",
    tag: "Competitor Intelligence",
    tone: "blue"
  }
];

export function Features() {
  return (
    <section id="features" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Core Product Engine"
          tone="pink"
          title={
            <>
              Built for speed. <br />
              <span className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">
                Engineered for conversion.
              </span>
            </>
          }
          sub="From drafting brand-accurate posts to tracking lead revenue, KoraSpace gives you everything modern marketing demands."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {CORE_FEATURES.map((f) => {
            const isPink = f.tone === "pink";
            const borderGlow = isPink
              ? "rgba(255, 46, 147, 0.25)"
              : "rgba(0, 102, 255, 0.25)";
            const iconBg = isPink ? "rgba(255, 46, 147, 0.15)" : "rgba(0, 102, 255, 0.15)";
            const iconColor = isPink ? "#FF2E93" : "#0066FF";

            return (
              <motion.div
                key={f.title}
                variants={fadeInUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-3xl p-7 transition-all duration-300"
                style={{
                  background: "linear-gradient(170deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                  border: `1.5px solid ${borderGlow}`,
                  backdropFilter: "blur(20px)"
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{ background: iconBg }}
                  >
                    <f.icon className="h-6 w-6" style={{ color: iconColor }} />
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full"
                    style={{ background: iconBg, color: iconColor }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3 className="font-display mt-6 text-xl font-bold text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 3. Brand Brain & Multi-Agent Swarm ───────────────────────────── */

const AGENT_SWARM = [
  { name: "Research Agent", role: "Scans viral niche trends & web data", icon: Search },
  { name: "Brand Agent", role: "Guarantees brand voice & guidelines", icon: ShieldCheck },
  { name: "Content Agent", role: "Drafts captions, scripts & carousels", icon: FileText },
  { name: "Strategy Agent", role: "Generates 30/60/90 day growth plans", icon: Target },
  { name: "Analytics Agent", role: "Tracks funnel metrics & revenue attribution", icon: BarChart3 },
  { name: "Competitor Agent", role: "Monitors rival video & post formats", icon: Eye },
  { name: "Engagement Agent", role: "Triage inbox & manages Ghost Mode DMs", icon: MessageSquare },
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-5 rounded-3xl p-8 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,46,147,0.12) 0%, rgba(0,102,255,0.08) 100%)",
              border: "1.5px solid rgba(255,46,147,0.3)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF2E93]/20 border border-[#FF2E93]/40 mb-6">
              <Brain className="h-7 w-7 text-[#FF2E93]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#FF2E93] font-semibold">
              Persistent Knowledge Base
            </span>
            <h3 className="font-display mt-2 text-2xl font-bold">KoraSpace Brand Brain</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {AGENT_SWARM.map((ag) => (
              <motion.div
                key={ag.name}
                variants={fadeInUp}
                className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 hover:bg-white/10"
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
                  <p className="text-xs text-white/60">{ag.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 4. Native Agent Tools ────────────────────────────────────────── */

const NATIVE_TOOLS = [
  { icon: Search, title: "Competitor Video Spy", desc: "Scrapes & analyzes high-performing competitor TikToks and Reels to find winning formats." },
  { icon: FileText, title: "Longform Repurposer", desc: "Turns long YouTube videos or articles into 7 days of platform-tailored posts." },
  { icon: ShieldCheck, title: "Fact & Citation Checker", desc: "Verifies statistical claims and attaches credible sources before scheduling." },
  { icon: Calendar, title: "Auto-Scheduler DB", desc: "Approve a draft with one click and the AI schedules directly to connected APIs." },
  { icon: Brain, title: "Visual Prompt Generator", desc: "Generates custom DALL-E & Midjourney prompts matched to your exact caption tone." },
  { icon: Flame, title: "Viral Hook Injector", desc: "Injects current trending meme formats and proven psychological hooks into your copy." }
];

export function AgentTools() {
  return (
    <section id="tools" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Native Tool Suite"
          tone="pink"
          title={
            <>
              Equipped with <span className="text-[#FF2E93]">Autonomous Tools</span>
            </>
          }
          sub="Your AI doesn't just write text — it executes tool actions to research, format, fact-check, and publish."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {NATIVE_TOOLS.map((t) => (
            <motion.div
              key={t.title}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="rounded-3xl p-6 transition-all duration-300 group"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1.5px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF2E93]/15 text-[#FF2E93] group-hover:scale-110 transition-transform">
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 5. Platform Integrations ─────────────────────────────────────── */

const PLATFORMS = [
  { name: "Instagram", icon: Camera, color: "#FF2E93" },
  { name: "TikTok", icon: Music, color: "#00E5FF" },
  { name: "LinkedIn", icon: Briefcase, color: "#0066FF" },
  { name: "YouTube", icon: Play, color: "#FF0000" },
  { name: "Facebook", icon: Globe, color: "#1877F2" },
  { name: "X (Twitter)", icon: MessageCircle, color: "#FFFFFF" },
  { name: "Threads", icon: Layers3, color: "#FF2E93" },
  { name: "WhatsApp", icon: MessageSquare, color: "#25D366" },
  { name: "Telegram", icon: Send, color: "#229ED9" }
];

export function Integrations() {
  return (
    <section className="relative px-5 py-24 bg-[#07050d] text-white overflow-hidden">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow tone="blue">Multi-Platform Ecosystem</Eyebrow>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Publish & manage across <span className="text-[#0066FF]">all your channels</span>
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
        {PLATFORMS.map((p) => (
          <motion.div
            key={p.name}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-md"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.12)"
            }}
          >
            <p.icon className="h-5 w-5" style={{ color: p.color }} />
            <span>{p.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── 6. Growth & Revenue Intelligence (Funnel & Attribution) ──────── */

export function RevenueAttributionSection() {
  return (
    <section id="revenue" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Growth & Revenue Intelligence"
          tone="gradient"
          title={
            <>
              From social engagement to <span className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">real revenue</span>
            </>
          }
          sub="Don't stop at vanity likes and views. Track the complete conversion funnel from post impressions down to actual dollar sales."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          {/* Revenue Attribution Funnel Visual */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-7 rounded-3xl p-8 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(170deg, rgba(0,102,255,0.1) 0%, rgba(255,46,147,0.05) 100%)",
              border: "1.5px solid rgba(0,102,255,0.3)",
              backdropFilter: "blur(20px)"
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold">Social-to-Revenue Funnel</h3>
              <span className="font-mono text-xs text-[#0066FF] bg-[#0066FF]/20 px-3 py-1 rounded-full font-semibold">
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-5 space-y-6"
          >
            <div
              className="rounded-3xl p-7 text-white"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/60">Account Health Score</span>
                <Award className="h-6 w-6 text-[#FF2E93]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold text-white">KoraScore: 78</span>
                <span className="text-sm text-white/50">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-[#FF2E93]">
                "Posting consistency dropped 24%. Re-engage video scheduler to regain 12 score points."
              </p>
            </div>

            <div
              className="rounded-3xl p-7 text-white"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/60">Lead Opportunity Radar</span>
                <Flame className="h-6 w-6 text-[#0066FF]" />
              </div>
              <h4 className="font-display mt-2 text-lg font-bold">4 Trending Niche Opportunities</h4>
              <p className="mt-1 text-xs text-white/60">
                3 competitor gaps identified · 2 high-value lead questions waiting in DMs ($2,000 opportunity).
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Multi-Seat Workspaces & Collaboration ─────────────────────── */

export function Collaboration() {
  return (
    <section className="relative px-5 py-24 bg-[#07050d] text-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="mx-auto max-w-4xl rounded-3xl p-10 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(255,46,147,0.08) 100%)",
          border: "1.5px solid rgba(0,102,255,0.25)",
          backdropFilter: "blur(20px)"
        }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0066FF]/20 text-[#0066FF]">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl text-white">
          Agency Workspaces & Multi-Seat Team Approval
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70 max-w-2xl mx-auto">
          Built for agencies, marketing teams, and brand managers. Invite teammates, assign client roles, review drafts, and manage multiple brand workspaces with enterprise-grade row-level security.
        </p>
      </motion.div>
    </section>
  );
}

/* ── 8. How It Works ──────────────────────────────────────────────── */

const STEPS = [
  { icon: Link2, title: "Connect your accounts", desc: "Link Instagram, TikTok, LinkedIn, YouTube, X, and Facebook via secure OAuth 2.0.", tag: "Secure OAuth" },
  { icon: Sparkles, title: "Train your Brand Brain", desc: "Paste your website URL or past posts. KoraSpace learns your voice in 60 seconds.", tag: "Brand Voice Engine" },
  { icon: Send, title: "Approve or Auto-Deploy", desc: "Review multi-format drafts, or let Ghost Mode run sales engagement on autopilot.", tag: "Human-in-the-Loop" },
  { icon: LineChart, title: "Watch Revenue Grow", desc: "Track exact revenue attribution from social views down to customer payments.", tag: "Conversion ROI" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <div className="mx-auto max-w-4xl">
        <SectionHead
          eyebrow="Simple 4-Step Setup"
          tone="blue"
          title={
            <>
              Deploy your AI marketing team in <span className="text-[#0066FF]">minutes</span>
            </>
          }
          sub="No complex setup or coding required. Connect, train your brand brain, and let autonomous agents execute."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeInUp}
              className="flex items-start gap-5 rounded-3xl p-6 text-white transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)"
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0066FF]/20 text-[#0066FF] font-bold">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className="font-mono text-xs uppercase tracking-wider text-[#0066FF] font-semibold">
                  Step 0{i + 1}
                </span>
                <h3 className="font-display mt-1 text-xl font-bold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 9. Stories (Testimonials) ────────────────────────────────────── */

const STORIES = [
  { name: "Adaeze Okonkwo", role: "Fintech Founder, Lagos", avatar: "AO", text: "I replaced Buffer and a freelance manager with KoraSpace. Ghost Mode handles engagement while I close deals. ROI in week one.", highlight: "Replaced freelance team" },
  { name: "Chukwuemeka Dike", role: "Digital Agency, Abuja", avatar: "CD", text: "Eight client accounts used to need three people. Now it's me and KoraSpace. Social Inbox Triage alone saves 2 hours a day.", highlight: "Manages 8 clients solo" },
  { name: "Fatima Al-Hassan", role: "E-commerce, Kano", avatar: "FA", text: "Revenue Attribution is wild. I can show 'this post made us ₦340,000 this week.' The marketing budget stopped being a question.", highlight: "₦340,000 from 1 post" },
  { name: "Tunde Fashola", role: "Brand Coach, Lagos", avatar: "TF", text: "Trend-to-Draft is a ghostwriter that never sleeps. It caught the news cycle before I woke up — three drafts waiting.", highlight: "Trend content on autopilot" },
  { name: "Ngozi Eze", role: "Fashion Brand, Port Harcourt", avatar: "NE", text: "I was skeptical about AI sounding like me. My followers can't tell. Engagement went up three times.", highlight: "3× engagement boost" },
  { name: "Biodun Afolabi", role: "SaaS Founder, Lagos", avatar: "BA", text: "The persistent Brand Brain keeps content private and accurate. And the pricing structure in NGN makes complete sense.", highlight: "Privacy-first Brand Brain" },
];

export function Stories() {
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {STORIES.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              className="rounded-3xl p-7 text-white flex flex-col justify-between"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1.5px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(16px)"
              }}
            >
              <p className="text-sm leading-relaxed text-white/75">“{t.text}”</p>
              <div className="mt-6">
                <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#FF2E93]/15 text-[#FF2E93] border border-[#FF2E93]/30">
                  {t.highlight}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #FF2E93, #0066FF)" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 10. Pricing (From PRD Section 9) ─────────────────────────────── */

const PLANS = [
  {
    name: "Free",
    price: "₦0",
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
    price: "₦13,500",
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
    price: "₦30,000",
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
    price: "₦130,000",
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="relative flex flex-col justify-between rounded-3xl p-7 text-white"
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
                  className="font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full absolute -top-3 left-6 text-white"
                  style={{ background: "linear-gradient(135deg, #FF2E93, #0066FF)" }}
                >
                  {p.badge}
                </span>
              )}

              <div>
                <h3 className="font-display text-xl font-bold text-white">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-white">{p.price}</span>
                  <span className="text-xs text-white/50">{p.period}</span>
                </div>
                <p className="mt-1 text-xs text-white/60">{p.desc}</p>

                <div className="mt-4 font-mono text-xs font-semibold text-[#FF2E93] bg-[#FF2E93]/10 px-3 py-1.5 rounded-xl border border-[#FF2E93]/20">
                  {p.posts}
                </div>

                <ul className="mt-6 space-y-2.5 text-xs text-white/70">
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
                  className="w-full rounded-full py-3 text-sm font-semibold transition-all"
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
        </motion.div>
      </div>
    </section>
  );
}

/* ── 11. Final CTA ────────────────────────────────────────────────── */

export function FinalCTA() {
  return (
    <section className="relative px-5 py-28 sm:py-32 bg-[#07050d] text-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="mx-auto max-w-4xl rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,46,147,0.15) 0%, rgba(0,102,255,0.15) 100%)",
          border: "1.5px solid rgba(255,46,147,0.3)",
          backdropFilter: "blur(20px)"
        }}
      >
        <Eyebrow tone="gradient">14-Day Free Trial — No Credit Card Required</Eyebrow>
        <h2 className="font-display mt-4 text-3xl font-extrabold sm:text-5xl text-white">
          Deploy your AI marketing engine <br />
          <span className="bg-gradient-to-r from-[#FF2E93] to-[#0066FF] bg-clip-text text-transparent">
            today.
          </span>
        </h2>
        <p className="mt-4 text-base text-white/70 max-w-xl mx-auto">
          Join modern creators, founders, and agencies automating content creation, scheduling, lead triage, and revenue growth.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <button
              className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg, #FF2E93 0%, #0066FF 100%)", boxShadow: "0 0 30px rgba(255,46,147,0.5)" }}
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/login">
            <button className="rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Sign In to Dashboard
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ── 12. Electric Blue & Deep Blue Footer ─────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="relative bg-[#05081c] border-t border-[#0066FF]/20 px-5 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="KoraSpace" width={32} height={32} className="h-8 w-auto object-contain" />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Kora<span className="text-[#0066FF]">Space</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
            <a href="#features" className="transition-colors hover:text-[#FF2E93]">Features</a>
            <a href="#how" className="transition-colors hover:text-[#0066FF]">Growth Loop</a>
            <a href="#pricing" className="transition-colors hover:text-[#FF2E93]">Pricing</a>
            <Link href="/login" className="transition-colors hover:text-[#0066FF]">Dashboard</Link>
            <Link href="/privacy" className="transition-colors hover:text-[#FF2E93]">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-[#0066FF]">Terms of Service</Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} KoraSpace by Techla. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>🇳🇬 Built in Nigeria</span>
            <span>•</span>
            <span className="text-[#0066FF]">Electric Blue & Pink Palette</span>
            <span>•</span>
            <span>AI Marketing Operating System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

