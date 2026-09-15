"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  SectionHead,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/**
 * Section 3 — sell the outcome, not the feature list.
 *
 * Three outcomes, three deliberately different visual treatments: tiles
 * collapsing into one surface, a real recommendation card, and signal bars
 * accumulating. Three identical cards would have undercut the claim that these
 * are different kinds of relief.
 *
 * The layout is asymmetric on purpose — LESS GUESSING is the argument the rest
 * of the page builds on, so it gets the space, and the other two sit beside it
 * rather than competing.
 */

const shell =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7 backdrop-blur-sm";

const label = "text-[11px] font-bold uppercase tracking-[0.2em]";

/* ── A. LESS WORK — the tool-hopping collapses into one surface ──────── */

const TOOLS = ["Notes", "Canva", "Buffer", "Sheets", "Analytics"];

function LessWork({ reduce }: { reduce: boolean | null }) {
  return (
    <div className={shell}>
      <span className={`${label} text-white/40`}>Less work</span>
      <p className="mt-2.5 text-[15px] leading-relaxed text-white/75">
        Stop spending your day moving between marketing tools.
      </p>

      <div className="mt-6">
        {/* the scatter you have now */}
        <div className="flex flex-wrap gap-1.5">
          {TOOLS.map((t, i) => (
            <motion.span
              key={t}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-white/35 line-through decoration-white/20"
            >
              {t}
            </motion.span>
          ))}
        </div>

        {/* collapsing into one */}
        <div className="my-3 flex justify-center">
          <span className="h-5 w-px bg-gradient-to-b from-transparent to-[#ff9fc9]/60" />
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scaleX: 0.85 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-lg border border-[#ff0a8a]/35 bg-[#ff0a8a]/[0.07] px-4 py-3 text-center"
        >
          <span className="text-[13px] font-semibold text-white">
            One workspace
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ── B. LESS GUESSING — an actual Kora Intelligence recommendation ───── */

function LessGuessing() {
  return (
    <div
      className={`${shell} relative flex h-full flex-col overflow-hidden border-white/[0.14]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 0% 0%, rgba(255,10,138,0.12) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex flex-1 flex-col">
        <span className={`${label} text-white/40`}>Less guessing</span>
        <p className="mt-2.5 text-[15px] leading-relaxed text-white/75">
          Know what to do next instead of interpreting numbers yourself.
        </p>

        {/* the recommendation itself — the thing the whole page is claiming */}
        <div className="mt-6 rounded-xl border border-white/[0.14] bg-[#0e0a1c]/80 p-5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#ff9fc9]" />
            <span className={`${label} text-[#ff9fc9]`}>Kora intelligence</span>
          </div>

          <p className="mt-4 text-[15px] font-semibold text-white">
            We noticed something.
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">
            Your audience is engaging more with practical educational content.
          </p>

          <div className="mt-4 rounded-lg border border-white/[0.09] bg-white/[0.03] p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Next move
            </span>
            <p className="mt-1.5 text-[14px] leading-relaxed text-white/85">
              Turn your best-performing topic into a 3-part series.
            </p>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#ff0a8a] px-4 py-2 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#ff2e7a]"
          >
            Generate
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── C. MORE LEARNING — signal accumulating, post after post ─────────── */

const BARS = [22, 34, 30, 48, 44, 62, 58, 76, 84];

function MoreLearning({ reduce }: { reduce: boolean | null }) {
  return (
    <div className={shell}>
      <span className={`${label} text-white/40`}>More learning</span>
      <p className="mt-2.5 text-[15px] leading-relaxed text-white/75">
        Every post gives KoraSpace another signal about your brand and audience.
      </p>

      <div className="mt-6 flex h-[84px] items-end gap-1.5">
        {BARS.map((h, i) => (
          <motion.span
            key={i}
            initial={reduce ? false : { height: 4, opacity: 0.3 }}
            whileInView={{ height: `${h}%`, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.06 * i,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ height: `${h}%` }}
            className="flex-1 rounded-sm bg-gradient-to-t from-[#5a3cff]/40 to-[#ff9fc9]"
          />
        ))}
      </div>

      <p className="mt-3 text-[12px] text-white/35">
        Signal per post, over time
      </p>
    </div>
  );
}

export function OutcomesSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <SectionHead
        eyebrow="What you get back"
        title="What would you do with the time your marketing gives back?"
        sub="Not more features to learn. Less of the work you never wanted to be doing."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-5"
      >
        <motion.div variants={itemFadeUp} className="lg:col-span-3 lg:row-span-2">
          <LessGuessing />
        </motion.div>

        <motion.div variants={itemFadeUp} className="lg:col-span-2">
          <LessWork reduce={reduce} />
        </motion.div>

        <motion.div variants={itemFadeUp} className="lg:col-span-2">
          <MoreLearning reduce={reduce} />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default OutcomesSection;
