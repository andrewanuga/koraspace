"use client";

import { motion } from "framer-motion";
import {
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LandingButton, SectionHead, cardHoverSpring } from "@/components/landing/primitives";

/* ── 2. Dual-Mode Showcase Section (#dual-modes) ─────────────────── */

export function DualModeShowcaseSection() {
  return (
    <section id="dual-modes" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
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
