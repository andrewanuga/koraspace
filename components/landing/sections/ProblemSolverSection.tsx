"use client";

import { motion } from "framer-motion";
import {
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  LandingButton,
  Eyebrow,
  springTransition,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

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
