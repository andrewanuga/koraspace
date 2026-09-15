"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  Scene,
  FloatingCard,
  ConnectorLine,
  Eyebrow,
  springTransition,
} from "@/components/landing/primitives";
import { BrandBrainPanel } from "@/components/landing/product/BrandBrainPanel";
import { ComposerPanel } from "@/components/landing/product/ComposerPanel";
import { NextMovePanel } from "@/components/landing/product/NextMovePanel";

/**
 * Section 03 — what KoraSpace gives back.
 *
 * The pilot for the layered system: three scenes, each carrying all four
 * layers, and each composed DIFFERENTLY so the section reads as a sequence
 * rather than three rows of the same template.
 *
 *   01  copy left,  product right, numeral bleeding off the left
 *   02  product high and centre, copy beneath it, numeral behind centre
 *   03  copy left,  product right, insight card breaking the right edge
 *
 * Every product panel is real DOM, which is what lets the floating layer
 * genuinely overlap it instead of sitting on top of a flat image.
 */

/* ── shared bits ─────────────────────────────────────────────────────── */

function SceneCopy({
  index,
  title,
  body,
  className = "",
}: {
  index: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={springTransition}
      className={className}
    >
      <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff9fc9]">
        {index}
      </span>
      <h3 className="font-display mt-3 text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h3>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
        {body}
      </p>
    </motion.div>
  );
}

const chipKicker = "text-[10px] font-bold uppercase tracking-[0.18em]";

/* ── the section ─────────────────────────────────────────────────────── */

export function OutcomesSection() {
  return (
    <div className="relative">
      {/* section statement — deliberately large, and the only centred thing
          here, so the scenes below can be asymmetric without feeling loose */}
      <div className="relative px-4 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={springTransition}
          className="mx-auto max-w-3xl text-center"
        >
          <Eyebrow tone="white">What you get back</Eyebrow>
          <h2 className="font-display mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Less marketing busywork.
            <br />
            <span className="text-[#ff9fc9]">
              More knowing what to do next.
            </span>
          </h2>
        </motion.div>
      </div>

      {/* ── Scene 01 — copy left, product right ───────────────────────── */}
      <Scene numeral="01" numeralSide="left" atmosphere="left">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SceneCopy
            index="01"
            title="Stop starting from scratch."
            body="KoraSpace already holds your voice, your audience and everything you have published. The blank page is gone before you reach it."
          />

          <div className="relative">
            <BrandBrainPanel />

            <FloatingCard
              depth="back"
              drift="lift"
              className="sm:-bottom-10 sm:-left-20 sm:w-[200px] lg:-left-24"
            >
              <span className={`${chipKicker} text-white/40`}>Learned</span>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
                From your last 128 posts — not a template.
              </p>
            </FloatingCard>
          </div>
        </div>
      </Scene>

      {/* ── Scene 02 — product high and centre, copy beneath ──────────── */}
      <Scene numeral="02" numeralSide="center" atmosphere="center">
        <div className="relative mx-auto max-w-2xl">
          <ComposerPanel />

          <FloatingCard
            depth="front"
            drift="hover"
            className="sm:-right-20 sm:-top-10 sm:w-[210px] lg:-right-28"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#ff9fc9]" />
              <span className={`${chipKicker} text-[#ff9fc9]`}>
                Opportunity
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
              That thread is still being shared. Worth a follow-up.
            </p>
          </FloatingCard>

          <FloatingCard
            depth="back"
            drift="lift"
            className="sm:-bottom-12 sm:-left-16 sm:w-[185px] lg:-left-24"
          >
            <span className={`${chipKicker} text-white/40`}>Tone check</span>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
              Reads like you. No hype words.
            </p>
          </FloatingCard>

          <ConnectorLine
            d="M 78 8 L 55 30"
            className="inset-0 h-full w-full"
            delay={0.45}
          />
        </div>

        <SceneCopy
          index="02"
          title="Create with context."
          body="Content that sounds like your brand because the system already understands it — not because you explained it again in a prompt."
          className="mx-auto mt-20 max-w-xl text-center sm:mt-24 [&_p]:mx-auto"
        />
      </Scene>

      {/* ── Scene 03 — copy left, insight breaking the right edge ─────── */}
      <Scene numeral="03" numeralSide="right" atmosphere="right">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SceneCopy
            index="03"
            title="Know what to do next."
            body="Results stop being a report you have to interpret. KoraSpace reads them and tells you the move worth making."
          />

          <div className="relative">
            <NextMovePanel />

            <FloatingCard
              depth="front"
              drift="hover"
              className="sm:-right-20 sm:top-8 sm:w-[195px] lg:-right-28"
            >
              <span className={`${chipKicker} text-[#ff9fc9]`}>Signal</span>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/80">
                Third week running. That is a pattern.
              </p>
            </FloatingCard>
          </div>
        </div>
      </Scene>
    </div>
  );
}

export default OutcomesSection;
