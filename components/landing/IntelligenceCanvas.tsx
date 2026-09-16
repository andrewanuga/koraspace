"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  canvasStates,
  STATE_DURATION_MS,
  type CanvasCard,
  type CanvasStateKey,
} from "@/components/landing/canvas-states";

/** Organic, slightly asymmetric radius — a boundary, not a photo frame. */
const FRAME_RADIUS = "58% 42% 52% 48% / 44% 48% 52% 56%";

const cardSurface =
  "rounded-2xl border border-white/[0.12] bg-[#0e0a1c]/92 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.5)]";

const depthStyles: Record<CanvasCard["depth"], string> = {
  front: "z-30 scale-100 opacity-100",
  back: "z-20 scale-[0.9] opacity-70 blur-[1px]",
};

/** Card placement around the portrait. */
/**
 * All card slots hug the left so they orbit the subject's shoulder/torso
 * rather than their face — the portrait is right-aligned, so anything wider
 * than ~215px here would start covering the head.
 */
const slotStyles: Record<CanvasCard["slot"], string> = {
  top: "left-0 top-0 w-[215px]",
  left: "left-0 top-[52%] w-[190px]",
  bottom: "bottom-1 left-0 w-[215px]",
};

/* ------------------------------------------------------ micro-animations */

/** Types itself out, then leaves the caret blinking briefly. ~32ms/char. */
function Typewriter({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);

  // No reset needed: this remounts with each state, so `typed` starts at 0.
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= text.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 32);
    return () => window.clearInterval(id);
  }, [text, reduce]);

  const count = reduce ? text.length : typed;
  const done = count >= text.length;

  return (
    <span className="text-[12.5px] leading-relaxed text-white/80">
      {text.slice(0, count)}
      {!reduce && !done && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="ml-px inline-block h-[13px] w-[1.5px] translate-y-[2px] bg-[#ff9fc9]"
        />
      )}
    </span>
  );
}

/**
 * Ticks 0 → value so the figure lands rather than appears.
 *
 * Timer-driven rather than requestAnimationFrame on purpose: rAF is suspended
 * entirely while the document is hidden, which makes the count silently never
 * start (and made this impossible to verify). A ~60fps interval is
 * indistinguishable over 1.2s and keeps working regardless.
 */
function CountUp({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const DURATION = 1200;
    const STEP = 16;
    let elapsed = 0;

    const id = window.setInterval(() => {
      elapsed += STEP;
      const t = Math.min(elapsed / DURATION, 1);
      // easeOut so it decelerates into the final figure
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) window.clearInterval(id);
    }, STEP);

    return () => window.clearInterval(id);
  }, [to, reduce]);

  return <>{reduce ? to : n}</>;
}

function CursorGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 2l9.5 5.5-4.2 1-2.1 4.2L3 2z"
        fill="#fff"
        stroke="#0e0a1c"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ card */

/**
 * CREATE's beat, as an explicit state machine: type → rows land → cursor
 * picks a row → action fires.
 *
 * Timer-driven rather than a chain of framer delays so the sequence is
 * deterministic and inspectable; framer is left to interpolate the cursor's
 * path, which is the one part that actually needs smooth motion.
 */
function useSequence(enabled: boolean, promptFirst: boolean) {
  const [step, setStep] = useState(enabled ? 0 : 4);

  useEffect(() => {
    if (!enabled) return;
    const base = promptFirst ? 1750 : 100;
    const marks: [number, number][] = [
      [1, base],
      [2, base + 750],
      [3, base + 1300],
      [4, base + 2150],
    ];
    const ids = marks.map(([s, at]) => window.setTimeout(() => setStep(s), at));
    return () => ids.forEach(window.clearTimeout);
  }, [enabled, promptFirst]);

  return step;
}

function IntelligenceCard({ card }: { card: CanvasCard }) {
  const reduce = useReducedMotion();

  const hasSequence = !!card.items && !reduce;
  const step = useSequence(hasSequence, !!card.prompt);

  return (
    <div className={`relative ${cardSurface} px-4 py-3.5`}>
      {card.kicker && (
        <span className="block text-[10px] font-bold tracking-[0.16em] text-[#ff9fc9]">
          {card.kicker.toUpperCase()}
        </span>
      )}

      {card.prompt && (
        <div className="mt-2 rounded-lg border border-white/[0.10] bg-white/[0.04] px-2.5 py-2">
          <Typewriter text={card.prompt} />
        </div>
      )}

      {card.metric && (
        <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          {card.metric.prefix}
          {card.metric.countUp ? <CountUp to={card.metric.value} /> : card.metric.value}
          {card.metric.suffix}
        </p>
      )}

      {card.items && (
        <div className="mt-2.5">
          {card.items.map((item, i) => {
            const rowsIn = !hasSequence || step >= 1;
            const picked = hasSequence && card.highlightIndex === i && step >= 3;

            return (
              <div
                key={item}
                className={`relative rounded-md px-2 py-1.5 text-[12.5px] text-white/80 transition-all duration-300 ${
                  rowsIn ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                }`}
                style={{ transitionDelay: rowsIn && hasSequence ? `${i * 90}ms` : "0ms" }}
              >
                {/* the row the cursor settles on */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-md border border-[#ff9fc9]/30 bg-[#ff0a8a]/15 transition-opacity duration-300 ${
                    picked ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="relative">{item}</span>
              </div>
            );
          })}
        </div>
      )}

      {card.body && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">{card.body}</p>
      )}

      {card.action && (
        <span
          data-fired={hasSequence ? step >= 4 : undefined}
          className={`mt-2.5 inline-flex origin-left items-center gap-1.5 text-[12.5px] font-semibold text-[#ff9fc9] transition-transform duration-300 ${
            hasSequence && step >= 4 ? "scale-[1.06]" : "scale-100"
          }`}
        >
          {card.action}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}

      {/* Ghost cursor — framer handles the path here because this is the one
          piece that genuinely needs smooth interpolation. */}
      {hasSequence && step >= 2 && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, x: 196, y: 40 }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            x: [196, 120, 120, 78, 78],
            y: [40, 96, 96, 150, 150],
          }}
          transition={{
            duration: 2.3,
            ease: "easeInOut",
            times: [0, 0.3, 0.45, 0.8, 1],
          }}
          className="pointer-events-none absolute left-0 top-0 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        >
          <CursorGlyph />
        </motion.div>
      )}
    </div>
  );
}

type IntelligenceCanvasProps = {
  /**
   * Lets an external control hold the canvas on a named state instead of
   * auto-advancing. Its original caller, the GrowthRail under the hero, has
   * been retired, so nothing passes this today; it stays as an optional hook.
   */
  focusedKey?: CanvasStateKey | null;
};

export function IntelligenceCanvas({
  focusedKey = null,
}: IntelligenceCanvasProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<number | null>(null);

  // Derived, not pushed into state, so the canvas answers the rail on the same
  // render as the hover — no frame of lag and nothing to keep in sync.
  const focusedIndex = focusedKey
    ? canvasStates.findIndex((s) => s.key === focusedKey)
    : -1;
  const activeIndex = focusedIndex >= 0 ? focusedIndex : index;
  const state = canvasStates[activeIndex];

  useEffect(() => {
    if (focusedIndex >= 0) {
      // The rail is driving: hold this stage, no auto-advance. Adopting it as
      // the new base means releasing the rail carries on from the stage you
      // were just looking at instead of snapping back. Deferred by a tick
      // rather than set synchronously here, which would be a setState in an
      // effect body.
      if (focusedIndex === index) return;
      timer.current = window.setTimeout(() => setIndex(focusedIndex), 0);
    } else if (!paused) {
      timer.current = window.setTimeout(
        () => setIndex((i) => (i + 1) % canvasStates.length),
        state.durationMs ?? STATE_DURATION_MS
      );
    }
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [index, focusedIndex, paused, state.durationMs]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto w-full max-w-[440px]"
    >
      {/* fixed height so advancing never shifts the hero */}
      <div className="relative h-[430px] sm:h-[460px]">
        {/* ── the intelligence boundary + portrait ──
             Right-aligned rather than centred so the taller cards in the left
             slots clear the subject's head instead of covering it. */}
        <div className="absolute bottom-0 right-0 h-[340px] w-[230px] sm:h-[370px] sm:w-[250px]">
          {/* soft glow behind the subject */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 blur-2xl"
            style={{
              borderRadius: FRAME_RADIUS,
              background:
                "radial-gradient(60% 60% at 50% 45%, rgba(255,46,122,0.45) 0%, rgba(90,60,255,0.3) 45%, transparent 75%)",
            }}
          />

          {/* portrait, masked into the organic shape */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: FRAME_RADIUS }}
          >
            <Image
              src="/landing-img/founder-portrait.png"
              alt="A KoraSpace founder"
              fill
              priority
              sizes="(min-width: 640px) 300px, 280px"
              className="object-cover object-top"
            />
          </div>

          {/* the boundary itself — a light travels it as the loop advances */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -inset-[3px] h-[calc(100%+6px)] w-[calc(100%+6px)]"
          >
            <defs>
              <linearGradient id="kora-frame" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff2e7a" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#c13fe8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#5a3cff" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* resting boundary */}
            <rect
              x="0.6"
              y="0.6"
              width="98.8"
              height="98.8"
              rx="46"
              ry="48"
              fill="none"
              stroke="url(#kora-frame)"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
            />

            {/* the travelling signal — re-runs on every state change */}
            {!reduce && (
              <motion.rect
                key={state.key}
                x="0.6"
                y="0.6"
                width="98.8"
                height="98.8"
                rx="46"
                ry="48"
                fill="none"
                stroke="#ff9fc9"
                strokeWidth="1.4"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="0.18 0.82"
                initial={{ strokeDashoffset: 1, opacity: 0 }}
                animate={{ strokeDashoffset: -1, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.4, ease: "easeInOut", times: undefined }}
              />
            )}
          </svg>
        </div>

        {/* ── cards orbiting the portrait ── */}
        {state.cards.map((card, i) => (
          <motion.div
            key={`${state.key}-${card.id}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.45,
              delay: reduce ? 0 : i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`absolute ${slotStyles[card.slot]} ${depthStyles[card.depth]}`}
          >
            <IntelligenceCard card={card} />
          </motion.div>
        ))}
      </div>

      {/* Stage rail — deliberately not pagination dots: this reads as one
          continuous system rather than a set of slides. */}
      <div className="mt-6 flex items-center gap-1.5">
        {canvasStates.map((s, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.stage}`}
              aria-current={active}
              className="group flex flex-1 flex-col gap-1.5 outline-none"
            >
              <span className="relative h-px w-full overflow-hidden bg-white/15">
                {active && (
                  <motion.span
                    layoutId="canvas-stage-progress"
                    className="absolute inset-0 bg-[#ff9fc9]"
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}
              </span>
              <span
                className={`text-left text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  active ? "text-white" : "text-white/30 group-hover:text-white/60"
                }`}
              >
                {s.stage}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default IntelligenceCanvas;
