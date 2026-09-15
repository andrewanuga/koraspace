"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Target,
  BarChart3,
  MessageSquare,
  FileText,
  Check,
  Search,
  Activity,
  Eye,
  ShieldCheck,
} from "lucide-react";
import {
  SectionHead,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

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
    <section id="brain" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
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
