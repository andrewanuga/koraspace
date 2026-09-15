"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { LandingButton, Eyebrow, springTransition } from "@/components/landing/primitives";

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
            {/* Was "Join thousands of creators, founders, and marketing
                operators…" — a user count we cannot stand behind, in the most
                prominent CTA on the site. Says what the product does instead. */}
            Create, schedule, engage and measure in one workspace — with a brand brain that gets sharper every time you post.
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
