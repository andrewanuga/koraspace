"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import {
  SectionHead,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/**
 * Section 2 — name the pain, then answer it.
 *
 * The argument is carried by the SHAPE of the two columns, not by the copy:
 * the old way is a stack of disconnected chips, each nudged out of alignment
 * and joined by broken dashes, ending in a loop back to zero. The KoraSpace
 * way is the same height of content threaded onto one unbroken line that
 * carries a travelling light and ends by feeding forward.
 *
 * Read with the text stripped out, the left side still looks like scattered
 * work and the right side still looks like a system. That is the job.
 */

const OLD_STEPS = [
  "What should I post?",
  "Research what's working",
  "Open a different tool",
  "Write it",
  "Design it",
  "Open another tool to schedule",
  "Check analytics later",
  "Try to work out what worked",
];

/** Each chip is nudged off-axis so the column never settles into a grid. */
const DRIFT = [0, 18, 6, 26, 10, 30, 4, 20];
const TILT = [-0.6, 0.5, -0.4, 0.8, -0.7, 0.3, -0.5, 0.6];

const KORA_STEPS = [
  "KoraSpace already knows your brand",
  "It finds the opportunity",
  "It helps you create",
  "It publishes",
  "It learns from the results",
  "It recommends your next move",
];

export function WayContrast() {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <SectionHead
        eyebrow="The difference"
        tone="white"
        title="Marketing shouldn't feel like starting from zero every day."
        sub="Same work, two shapes. One resets every morning; the other keeps what it learned."
      />

      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-14">
        {/* ── The old way: scattered, broken, ends where it began ───────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative"
        >
          <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            Every morning, from scratch
          </p>

          <div className="space-y-2.5">
            {OLD_STEPS.map((step, i) => (
              <motion.div
                key={step}
                variants={itemFadeUp}
                style={{
                  marginLeft: `${DRIFT[i]}px`,
                  rotate: `${TILT[i]}deg`,
                }}
                className="relative"
              >
                {/* broken connector — never reaches the next chip */}
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-2.5 left-5 h-2.5 border-l border-dashed border-white/15"
                  />
                )}
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-2.5">
                  <span className="text-[13px] leading-snug text-white/45">
                    {step}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={itemFadeUp}
            className="mt-5 flex items-center gap-2 text-white/30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-[13px] italic">
              Tomorrow, start again from the top.
            </span>
          </motion.div>
        </motion.div>

        {/* ── The KoraSpace way: one line, lit, carrying forward ────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative"
        >
          <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff9fc9]">
            With KoraSpace
          </p>

          <div className="relative pl-7">
            {/* the unbroken spine — the whole point of this column */}
            <div className="absolute bottom-2 left-[9px] top-2 w-px bg-gradient-to-b from-[#ff2e7a] via-[#c13fe8] to-[#5a3cff]">
              {!reduce && (
                <motion.span
                  animate={{ top: ["0%", "100%"] }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute left-1/2 h-8 w-px -translate-x-1/2 bg-white/70 blur-[1px]"
                />
              )}
            </div>

            <div className="space-y-5">
              {KORA_STEPS.map((step) => (
                <motion.div key={step} variants={itemFadeUp} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-7 top-[7px] h-[7px] w-[7px] rounded-full bg-[#ff9fc9] shadow-[0_0_10px_2px_rgba(255,159,201,0.5)]"
                  />
                  <span className="text-[15px] leading-snug text-white/90">
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            variants={itemFadeUp}
            className="mt-6 flex items-center gap-2 pl-7 text-[#ff9fc9]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[13px]">
              Tomorrow, it knows more than it did today.
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default WayContrast;
