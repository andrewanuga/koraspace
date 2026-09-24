"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Scene, Eyebrow, springTransition } from "@/components/landing/primitives";

/**
 * Section 02 — the problem, stated as disconnection rather than workload.
 *
 * Deliberately radial, not two-column: section 03 is built on left/right
 * scenes, and repeating that rhythm here would make the page feel templated.
 * The six pieces of marketing sit scattered around a KoraSpace core, and the
 * lines between them draw themselves as the section enters — the fragments
 * being pulled into one system is the argument, made visually.
 *
 * The lines live in one inline SVG rather than six ConnectorLine instances:
 * they share a coordinate space and a stagger, so one overlay is both cheaper
 * and easier to keep in register than six stacked ones.
 */

type Fragment = {
  label: string;
  /** Final resting position, % of the stage. */
  x: number;
  y: number;
  /** Where it drifts in FROM — the scattered state. */
  fromX: number;
  fromY: number;
  /** Depth: back pieces are smaller, dimmer, slightly out of focus. */
  back?: boolean;
};

const FRAGMENTS: Fragment[] = [
  { label: "Content", x: 16, y: 14, fromX: -34, fromY: -30 },
  { label: "Audience", x: 74, y: 10, fromX: 32, fromY: -34, back: true },
  { label: "Trends", x: 5, y: 50, fromX: -44, fromY: 0, back: true },
  { label: "Publishing", x: 80, y: 46, fromX: 42, fromY: 6 },
  { label: "Analytics", x: 18, y: 84, fromX: -32, fromY: 30, back: true },
  { label: "Strategy", x: 70, y: 86, fromX: 34, fromY: 32 },
];

/** Fragment centre → core, in the SVG's 100×100 space. */
const LINES = FRAGMENTS.map((f) => `M ${f.x + 5} ${f.y + 4} L 50 50`);

export function FragmentedMarketing() {
  const reduce = useReducedMotion();

  return (
    <Scene numeral="02" numeralSide="left" atmosphere="center">
      {/* ── Layer 2: the claim ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="mx-auto max-w-3xl text-center"
      >
        <Eyebrow tone="white">The problem</Eyebrow>
        <h2 className="font-display mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your marketing isn&rsquo;t one problem.
          <br />
          <span className="text-white/45">
            It&rsquo;s a chain of disconnected decisions.
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/55">
          Six things that should inform each other, living in six places that
          never talk.
        </p>
      </motion.div>

      {/* ── Desktop: the constellation ─────────────────────────────────── */}
      <div className="relative mx-auto mt-20 hidden h-[460px] max-w-3xl sm:block">
        {/* Layer 4a: the connections, drawn on entry */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {LINES.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="#ff9fc9"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.9,
                delay: 0.3 + i * 0.09,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </svg>

        {/* Layer 4b: the fragments, settling inward */}
        {FRAGMENTS.map((f, i) => (
          <motion.div
            key={f.label}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, x: f.fromX, y: f.fromY, filter: "blur(6px)" }
            }
            whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 1.1,
              delay: i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
            className={`absolute rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-2.5 backdrop-blur-sm ${
              f.back ? "z-20 scale-[0.92] opacity-70" : "z-30"
            }`}
          >
            <span className="whitespace-nowrap text-[13px] text-white/70">
              {f.label}
            </span>
          </motion.div>
        ))}

        {/* Layer 3: the core they resolve into */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-1/2 z-40 w-[210px] -translate-x-1/2 -translate-y-1/2"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-2xl blur-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 45%, rgba(255,46,122,0.45) 0%, rgba(90,60,255,0.3) 45%, transparent 75%)",
            }}
          />
          <div className="rounded-2xl border border-white/[0.14] bg-[#0e0a1c]/92 px-5 py-4 text-center shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <span className="font-display text-[15px] font-bold text-white">
              KoraSpace
            </span>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/50">
              One system holding all six
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Mobile: the same argument, recomposed as a converging column ── */}
      <div className="mt-14 sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          {FRAGMENTS.map((f) => (
            <motion.div
              key={f.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xl border border-white/[0.10] bg-white/[0.03] px-3.5 py-2.5 text-center"
            >
              <span className="text-[13px] text-white/70">{f.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center py-5">
          <span className="h-10 w-px bg-gradient-to-b from-white/10 to-[#ff9fc9]/60" />
        </div>

        <div className="rounded-2xl border border-white/[0.14] bg-[#0e0a1c]/92 px-5 py-4 text-center backdrop-blur-xl">
          <span className="font-display text-[15px] font-bold text-white">
            KoraSpace
          </span>
          <p className="mt-1 text-[12px] leading-relaxed text-white/50">
            One system holding all six
          </p>
        </div>
      </div>
    </Scene>
  );
}

export default FragmentedMarketing;
