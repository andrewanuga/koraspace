"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Data → Kora intelligence → insight → next move.
 *
 * A left-to-right pipeline rather than a radial scatter: section 02 already
 * uses the scattered constellation to show the problem, and this is the
 * answer to it, so it reads as ordered and directional.
 *
 * Desktop layout is absolute on purpose. Columns sit at fixed percentages of
 * a fixed-height stage, which lets one SVG overlay (preserveAspectRatio none)
 * draw every connector in the same coordinate space and stay in register at
 * any width. Grid columns with gaps would move the anchor points per
 * breakpoint.
 *
 * It must not read as an analytics dashboard: no charts, no metrics. The
 * transformation itself is the content.
 */

// Inputs the PRD documents: brand context, past content, audience analytics,
// live trends, per-post performance, competitor analysis, and stated goals.
const INPUTS = [
  "Brand data",
  "Content history",
  "Audience",
  "Trends",
  "Performance",
  "Competitors",
  "Goals",
];

/** Vertical centre of input row i, as % of the stage. */
const rowY = (i: number) => ((i + 0.5) / INPUTS.length) * 100;

// Column geometry, % of the stage width — shared by the DOM and the SVG.
const INPUT_RIGHT = 25;
const CORE_LEFT = 39;
const CORE_RIGHT = 61;
const OUTPUT_LEFT = 70;
const INSIGHT_Y = 29;
const MOVE_Y = 72;

export function IntelligenceFlow() {
  const reduce = useReducedMotion();

  const inLines = INPUTS.map(
    (_, i) => `M ${INPUT_RIGHT} ${rowY(i)} C 33 ${rowY(i)}, 33 50, ${CORE_LEFT} 50`
  );
  const outLines = [INSIGHT_Y, MOVE_Y].map(
    (y) => `M ${CORE_RIGHT} 50 C 66 50, 66 ${y}, ${OUTPUT_LEFT} ${y}`
  );

  const draw = (i: number) => ({
    initial: reduce ? { pathLength: 1 } : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.8, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] as const },
  });

  const insight = (
    <div className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-4 backdrop-blur-sm">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        Insight
      </span>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/80">
        The same three questions keep coming up in your comments and messages.
      </p>
    </div>
  );

  const nextMove = (
    <div className="rounded-2xl border border-[#ff0a8a]/30 bg-[#ff0a8a]/[0.07] p-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff9fc9]">
        Next move
      </span>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/90">
        Answer all three as short videos this week, before someone else does.
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ff0a8a] px-3 py-1.5 text-[11.5px] font-bold text-white">
        Generate
        <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  );

  const core = (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-2xl blur-2xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(255,46,122,0.5) 0%, rgba(90,60,255,0.32) 45%, transparent 75%)",
        }}
      />
      <div className="rounded-2xl border border-white/[0.16] bg-[#0e0a1c]/92 px-4 py-5 text-center shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <Sparkles className="mx-auto h-4 w-4 text-[#ff9fc9]" />
        <p className="font-display mt-2 text-[15px] font-bold text-white">
          Kora intelligence
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-white/50">
          Connects what it knows and finds the pattern
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: the pipeline ─────────────────────────────────────── */}
      <div className="relative mx-auto hidden h-[460px] max-w-5xl md:block">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {inLines.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.14"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              {...draw(i)}
            />
          ))}
          {outLines.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="#ff9fc9"
              strokeOpacity="0.45"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              {...draw(INPUTS.length + i)}
            />
          ))}
        </svg>

        {/* inputs */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${INPUT_RIGHT}%` }}
        >
          {INPUTS.map((label, i) => (
            <motion.div
              key={label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ top: `${rowY(i)}%` }}
              className="absolute right-0 -translate-y-1/2 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-1.5"
            >
              <span className="whitespace-nowrap text-[12.5px] text-white/65">
                {label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* core */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${CORE_LEFT}%`, width: `${CORE_RIGHT - CORE_LEFT}%` }}
        >
          {core}
        </motion.div>

        {/* outputs */}
        {[
          { node: insight, y: INSIGHT_Y, delay: 0.8 },
          { node: nextMove, y: MOVE_Y, delay: 0.95 },
        ].map(({ node, y, delay }) => (
          <motion.div
            key={y}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 -translate-y-1/2"
            style={{ left: `${OUTPUT_LEFT}%`, top: `${y}%` }}
          >
            {node}
          </motion.div>
        ))}
      </div>

      {/* ── Mobile: the same flow, top to bottom ──────────────────────── */}
      <div className="md:hidden">
        <div className="flex flex-wrap justify-center gap-1.5">
          {INPUTS.map((label) => (
            <span
              key={label}
              className="rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white/65"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex justify-center py-4">
          <span className="h-8 w-px bg-gradient-to-b from-white/10 to-[#ff9fc9]/60" />
        </div>
        {core}
        <div className="flex justify-center py-4">
          <span className="h-8 w-px bg-gradient-to-b from-[#ff9fc9]/60 to-white/10" />
        </div>
        <div className="space-y-3">
          {insight}
          {nextMove}
        </div>
      </div>
    </>
  );
}

export default IntelligenceFlow;
