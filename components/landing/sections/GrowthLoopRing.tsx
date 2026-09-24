"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCw } from "lucide-react";

/**
 * The KoraSpace growth loop as one closed ring of twelve stages.
 *
 * A ring rather than the old horizontal GrowthRail: twelve stages don't fit
 * legibly in a row, and a straight line has two ends where a loop has none.
 * "Create again" sits beside "Brand data" so the geometry says the cycle
 * restarts, better informed.
 *
 * The centre panel shows what KoraSpace knows at the active stage. It
 * advances on its own so the ring feels alive, and pauses while a visitor
 * hovers or focuses a stage so it never moves under their pointer.
 *
 * Every description maps to a PRD capability — Brand Brain memory, live
 * trend search, drafting in the user's voice, team approval, scheduling,
 * Ghost Mode / Smart Inbox triage, per-post analytics.
 */

type Stage = { name: string; body: string };

const STAGES: Stage[] = [
  { name: "Brand data", body: "Your voice, products and past posts, held in the Brand Brain." },
  { name: "Understand", body: "Works out who your audience is and what they respond to." },
  { name: "Research", body: "Checks live trends in your niche before anything is written." },
  { name: "Strategize", body: "Turns what it knows into a plan for the week ahead." },
  { name: "Create", body: "Drafts posts and captions in your voice, not a template's." },
  { name: "Approve", body: "You or your team sign off before anything goes out." },
  { name: "Publish", body: "Scheduled to each connected account at the right time." },
  { name: "Monitor", body: "Triages replies and messages into leads, questions and complaints." },
  { name: "Analyze", body: "Reads every post's results against your own baseline." },
  { name: "Learn", body: "Keeps what worked, so it shapes the next decision." },
  { name: "Optimize", body: "Adjusts timing, format and angle from what it learned." },
  { name: "Create again", body: "The next move starts smarter than the last one did." },
];

const ADVANCE_MS = 2800;
/** Node distance from the centre, as % of the square stage. */
const RADIUS = 43;

function nodePosition(i: number) {
  // start at 12 o'clock, go clockwise
  const angle = (i / STAGES.length) * Math.PI * 2 - Math.PI / 2;
  // Rounded to a fixed string on purpose. The raw trig output serialises
  // differently on the server ("28.5%") and in the browser
  // ("28.499999999999982%"), which React reports as a hydration mismatch.
  return {
    left: (50 + RADIUS * Math.cos(angle)).toFixed(3),
    top: (50 + RADIUS * Math.sin(angle)).toFixed(3),
  };
}

export function GrowthLoopRing() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Timeout keyed on `active` rather than an interval: each step schedules the
  // next, so pausing simply stops scheduling and nothing needs resetting.
  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % STAGES.length),
      ADVANCE_MS
    );
    return () => window.clearTimeout(id);
  }, [active, paused, reduce]);

  const focus = (i: number) => {
    setActive(i);
    setPaused(true);
  };
  const release = () => setPaused(false);

  const stage = STAGES[active];

  return (
    <>
      {/* ── Desktop: the ring ─────────────────────────────────────────── */}
      <div
        className="relative mx-auto hidden aspect-square w-full max-w-[600px] md:block"
        onMouseLeave={release}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="kora-loop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff2e7a" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#c13fe8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#5a3cff" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* the continuous loop */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="url(#kora-loop)"
            strokeWidth="0.35"
          />

          {/* a light travelling round it */}
          {!reduce && (
            <motion.circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#ff9fc9"
              strokeWidth="0.7"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.06 0.94"
              style={{ rotate: -90, transformOrigin: "50% 50%" }}
              animate={{ strokeDashoffset: [0, -1] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
          )}
        </svg>

        {/* stages */}
        {STAGES.map((s, i) => {
          const { left, top } = nodePosition(i);
          const isActive = i === active;
          return (
            <button
              key={s.name}
              type="button"
              onMouseEnter={() => focus(i)}
              onFocus={() => focus(i)}
              onBlur={release}
              aria-pressed={isActive}
              style={{ left: `${left}%`, top: `${top}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] outline-none backdrop-blur-md transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#ff9fc9] ${
                isActive
                  ? "border-[#ff9fc9]/60 bg-[#ff0a8a]/20 text-white shadow-[0_0_24px_rgba(255,10,138,0.35)]"
                  : "border-white/[0.10] bg-[#0e0a1c]/80 text-white/55 hover:text-white/80"
              }`}
            >
              {s.name}
            </button>
          );
        })}

        {/* centre — what KoraSpace knows at this stage */}
        <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="font-mono text-[11px] tracking-[0.2em] text-white/35">
            {String(active + 1).padStart(2, "0")} / 12
          </span>
          <motion.div
            key={stage.name}
            initial={reduce ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-display mt-2 text-2xl font-bold text-white">
              {stage.name}
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">
              {stage.body}
            </p>
          </motion.div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff9fc9]">
            <RotateCw className="h-3 w-3" />
            Kora intelligence
          </p>
        </div>
      </div>

      {/* ── Mobile: the loop unrolled into steps ──────────────────────── */}
      <div className="relative pl-7 md:hidden">
        <span className="absolute bottom-3 left-[9px] top-3 w-px bg-gradient-to-b from-[#ff2e7a] via-[#c13fe8] to-[#5a3cff]" />
        <ol className="space-y-5">
          {STAGES.map((s, i) => (
            <li key={s.name} className="relative">
              <span className="absolute -left-7 top-[5px] h-[7px] w-[7px] rounded-full bg-[#ff9fc9] shadow-[0_0_10px_2px_rgba(255,159,201,0.45)]" />
              <p className="text-[14px] font-semibold text-white">
                <span className="mr-2 font-mono text-[11px] text-white/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.name}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-white/55">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 inline-flex items-center gap-1.5 text-[12px] text-[#ff9fc9]">
          <RotateCw className="h-3.5 w-3.5" />
          Then back to the start, knowing more than before.
        </p>
      </div>
    </>
  );
}

export default GrowthLoopRing;
