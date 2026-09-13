"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Brain,
  Palette,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

type Stage = {
  label: string;
  Icon: LucideIcon;
  kicker: string;
  body: string;
  action: string;
};

const stages: Stage[] = [
  {
    label: "Your Brand",
    Icon: Palette,
    kicker: "Brand Brain",
    body: "KoraSpace learns your voice, products, positioning, and brand guidelines.",
    action: "View brand profile",
  },
  {
    label: "AI",
    Icon: Brain,
    kicker: "Intelligence",
    body: "Multiple AI engines turn your brand data into marketing decisions.",
    action: "See the engines",
  },
  {
    label: "Content",
    Icon: PenLine,
    kicker: "Create",
    body: "Generate content tailored to your brand, audience, and platform.",
    action: "Open composer",
  },
  {
    label: "Audience",
    Icon: Users,
    kicker: "Understand",
    body: "Discover what your audience responds to — and why.",
    action: "Explore audience",
  },
  {
    label: "Results",
    Icon: TrendingUp,
    kicker: "Learn",
    body: "Your audience engages 34% more with founder-led content.",
    action: "Opportunity detected",
  },
  {
    label: "Next Move",
    Icon: Sparkles,
    kicker: "Kora Intelligence",
    body: "Turn your best-performing founder post into a 3-part campaign.",
    action: "Generate campaign",
  },
];

const CARD_WIDTH = 300;

export function GrowthRail() {
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const railRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [cardOffset, setCardOffset] = useState(0);
  const [nodeOffset, setNodeOffset] = useState(0);

  // Anchor the card above the hovered node, clamped inside the rail so the
  // first and last nodes can't push it past the edges. The connector tracks
  // the node's own center rather than the card's, so on the clamped edge
  // nodes it still points at the node it describes.
  const focusStage = (i: number) => {
    const rail = railRef.current;
    const node = nodeRefs.current[i];

    if (rail && node) {
      const railBox = rail.getBoundingClientRect();
      const nodeBox = node.getBoundingClientRect();
      const center = nodeBox.left - railBox.left + nodeBox.width / 2;
      const half = CARD_WIDTH / 2;
      const max = Math.max(half, railBox.width - half);

      setNodeOffset(center);
      setCardOffset(Math.min(Math.max(center, half), max));
    }

    setActive(i);
  };

  const activeStage = active === null ? null : stages[active];

  return (
    <div
      onMouseLeave={() => setActive(null)}
      className="relative border-t border-white/10 px-5 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10"
    >
      <p className="text-center text-[10px] font-bold tracking-[0.2em] text-white/40 sm:text-xs">
        THE KORASPACE GROWTH LOOP
      </p>

      <div ref={railRef} className="relative mt-6">
        {/* nodes */}
        <div className="relative flex flex-wrap items-center justify-center gap-2.5 lg:flex-nowrap lg:justify-between lg:gap-3">
          {/* continuous connecting line threading behind the nodes — one
              system, not six separate features. Hidden once they wrap. */}
          <div className="pointer-events-none absolute left-0 top-1/2 hidden w-full -translate-y-1/2 lg:block">
            <div className="relative h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent">
              {!reduceMotion && (
                <motion.span
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#ff9fc9] shadow-[0_0_10px_3px_rgba(255,159,201,0.6)]"
                />
              )}
            </div>
          </div>

          {stages.map((stage, i) => {
            const isActive = active === i;
            const isDimmed = active !== null && !isActive;
            const { Icon } = stage;

            return (
              <motion.button
                key={stage.label}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                type="button"
                onMouseEnter={() => focusStage(i)}
                onFocus={() => focusStage(i)}
                onClick={() => (isActive ? setActive(null) : focusStage(i))}
                animate={{ scale: isActive && !reduceMotion ? 1.06 : 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`relative flex items-center gap-2 rounded-full border px-3.5 py-2 outline-none backdrop-blur-md transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#ff9fc9] sm:px-4 ${
                  isActive
                    ? "border-white/30 bg-white/[0.12] shadow-[0_0_24px_rgba(255,10,138,0.22)]"
                    : isDimmed
                      ? "border-white/[0.07] bg-white/[0.02]"
                      : "border-white/12 bg-white/[0.05]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 transition-colors duration-300 ${
                    isActive
                      ? "text-[#ff9fc9]"
                      : isDimmed
                        ? "text-white/25"
                        : "text-white/50"
                  }`}
                />
                <span
                  className={`whitespace-nowrap text-xs font-semibold transition-colors duration-300 sm:text-sm ${
                    isActive
                      ? "text-white"
                      : isDimmed
                        ? "text-white/35"
                        : "text-white/85"
                  }`}
                >
                  {stage.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

        {/* Zero-height anchor beneath the nodes: the card hangs down into
            the space already below the rail instead of reserving an empty
            block above it (which padded the rail out) or floating up over the
            hero. Absolutely positioned, so still no layout shift on hover. */}
        <div className="pointer-events-none relative hidden h-0 lg:block">
          <AnimatePresence>
            {activeStage && (
              <motion.div
                key="intelligence-card"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : 6, filter: "blur(6px)" }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: CARD_WIDTH, left: cardOffset }}
                className="absolute top-[22px] -translate-x-1/2"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0e0a1c]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                  {/* faint internal gradient */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 100% at 0% 0%, rgba(255,10,138,0.14) 0%, transparent 55%)",
                    }}
                  />

                  <div className="relative">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-white/45">
                      {activeStage.kicker.toUpperCase()}
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-white/85">
                      {activeStage.body}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-[#ff9fc9]">
                      {activeStage.action} →
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* connector up to the node — positioned on the node's own centre,
              independent of the clamped card, so it always points at its node */}
          <AnimatePresence>
            {activeStage && (
              <motion.div
                key="connector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ left: nodeOffset }}
                className="absolute top-0 h-[22px] w-px bg-gradient-to-t from-white/30 to-transparent"
              />
            )}
          </AnimatePresence>
        </div>

      {/* On wrapped layouts the anchored card can't track a node, so the active
          stage's copy reads inline instead. No reserved height — it simply
          isn't there until a stage is tapped, rather than padding the rail
          out with an empty block. */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          {activeStage && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-5 rounded-2xl border border-white/12 bg-[#0e0a1c]/80 p-4 backdrop-blur-xl"
            >
              <span className="text-[10px] font-bold tracking-[0.18em] text-white/45">
                {activeStage.kicker.toUpperCase()}
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                {activeStage.body}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#ff9fc9]">
                {activeStage.action} →
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GrowthRail;
