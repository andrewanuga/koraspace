"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CanvasStateKey } from "@/components/landing/canvas-states";
import {
  Brain,
  Palette,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { TranslationDictionary } from "@/lib/i18n/types";

type Stage = {
  label: string;
  canvasKey: CanvasStateKey;
  Icon: LucideIcon;
  kicker: string;
  body: string;
  action: string;
};

const STAGE_META: { canvasKey: CanvasStateKey; Icon: LucideIcon }[] = [
  { canvasKey: "understand", Icon: Palette },
  { canvasKey: "understand", Icon: Brain },
  { canvasKey: "create", Icon: PenLine },
  { canvasKey: "publish", Icon: Users },
  { canvasKey: "learn", Icon: TrendingUp },
  { canvasKey: "next-move", Icon: Sparkles },
];

function getGrowthRailStages(t: TranslationDictionary): Stage[] {
  return t.heroLoop.stages.map((stg, i) => ({
    label: stg.label,
    canvasKey: STAGE_META[i]?.canvasKey || "understand",
    Icon: STAGE_META[i]?.Icon || Sparkles,
    kicker: stg.kicker,
    body: stg.body,
    action: stg.action,
  }));
}

const CARD_WIDTH = 300;

type GrowthRailProps = {
  onFocusStage?: (key: CanvasStateKey | null) => void;
};

export function GrowthRail({ onFocusStage }: GrowthRailProps) {
  const { t } = useLanguage();
  const stages = getGrowthRailStages(t);
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const railRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [cardOffset, setCardOffset] = useState(0);
  const [nodeOffset, setNodeOffset] = useState(0);

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
    onFocusStage?.(stages[i].canvasKey);
  };

  const clearStage = () => {
    setActive(null);
    onFocusStage?.(null);
  };

  const activeStage = active === null ? null : stages[active];

  return (
    <div
      onMouseLeave={clearStage}
      className="relative border-t border-white/10 px-5 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10"
    >
      <p className="text-center text-[10px] font-bold tracking-[0.2em] text-white/40 sm:text-xs">
        {t.heroLoop.badge}
      </p>

      <div ref={railRef} className="relative mt-6">
        <div className="relative flex flex-wrap items-center justify-center gap-2.5 lg:flex-nowrap lg:justify-between lg:gap-3">
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
                onClick={() => (isActive ? clearStage() : focusStage(i))}
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
