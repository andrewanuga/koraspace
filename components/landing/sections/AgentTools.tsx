"use client";

import { motion } from "framer-motion";
import {
  Ghost,
  Sparkles,
  Search,
  Activity,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  SectionHead,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

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
    <section id="features" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
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
