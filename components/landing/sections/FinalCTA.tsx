"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCw } from "lucide-react";
import { LandingButton, Eyebrow, springTransition } from "@/components/landing/primitives";

/**
 * The close — the page ends where the product begins.
 *
 * Deliberately not another boxed card: an open composition on the page's own
 * atmosphere, with a short run of the loop above the headline so the last
 * thing a visitor sees is the cycle turning over into their next move.
 *
 * Shared with /pricing, so the copy holds on both pages.
 *
 * Removed claims: "Instant 2-minute onboarding" (not documented anywhere) and
 * "Supports 6+ social networks" (the PRD lists five live publishing
 * platforms). The two assurances kept here are both stated on the signup page.
 */

const LOOP = ["Create", "Publish", "Learn", "Next move"];

export function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-x-clip px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
      {/* environment — a low glow the headline sits in, not a container */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[760px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,46,122,0.28) 0%, rgba(90,60,255,0.18) 45%, transparent 72%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="relative mx-auto max-w-3xl text-center"
      >
        {/* the loop, returning */}
        <div
          aria-label="Create, publish, learn, next move, and round again"
          className="mb-10 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-[12px] font-semibold uppercase tracking-[0.16em]"
        >
          {LOOP.map((step, i) => (
            <Fragment key={step}>
              <motion.span
                initial={reduce ? false : { opacity: 0.25 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.2 }}
                className={i === LOOP.length - 1 ? "text-[#ff9fc9]" : "text-white/45"}
              >
                {step}
              </motion.span>
              <span aria-hidden="true" className="text-white/20">
                {i === LOOP.length - 1 ? (
                  <RotateCw className="h-3.5 w-3.5 text-[#ff9fc9]" />
                ) : (
                  "→"
                )}
              </span>
            </Fragment>
          ))}
        </div>

        <Eyebrow tone="pink">14-day free trial · No credit card required</Eyebrow>

        <h2 className="font-display mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Your next move
          <br />
          <span className="text-[#ff9fc9]">is already waiting.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
          KoraSpace learns from every post you publish. Start now, and every
          decision after this one is better informed than the last.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <LandingButton
            href="/signup"
            className="min-h-11 bg-[#ff0a8a] px-7 text-sm text-white shadow-[0_8px_32px_rgba(255,10,138,0.45)] hover:bg-[#ff299b]"
          >
            <span>Start Growing</span>
            <ArrowRight className="h-4 w-4" />
          </LandingButton>
          <LandingButton
            href="/login"
            className="min-h-11 border border-white/[0.10] bg-white/[0.03] px-6 text-sm text-white/80 hover:bg-white/[0.06] hover:text-white"
          >
            <span>Sign in</span>
          </LandingButton>
        </div>
      </motion.div>
    </section>
  );
}

export default FinalCTA;
