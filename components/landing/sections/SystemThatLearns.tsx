"use client";

import { motion } from "framer-motion";
import { Scene, Eyebrow, springTransition } from "@/components/landing/primitives";
import { IntelligenceFlow } from "./IntelligenceFlow";
import { GrowthLoopRing } from "./GrowthLoopRing";

/**
 * Section 07 — the conceptual centrepiece.
 *
 * Two narrative stages in one scene, because they are one idea told at two
 * scales: first a single turn (data becomes a decision), then the loop that
 * repeats it. Splitting them into separate sections would explain the same
 * mechanism twice.
 *
 * Replaces DecisionFlow and the interim LearningSystem, and retires
 * GrowthRail in favour of the twelve-stage ring.
 */

function Heading({
  eyebrow,
  title,
  accent,
  sub,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  sub: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={springTransition}
      className="mx-auto max-w-3xl text-center"
    >
      <Eyebrow tone="white">{eyebrow}</Eyebrow>
      <h2 className="font-display mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
        {title}
        <br />
        <span className="text-[#ff9fc9]">{accent}</span>
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/55">
        {sub}
      </p>
    </motion.div>
  );
}

export function SystemThatLearns() {
  return (
    <Scene numeral="07" numeralSide="right" atmosphere="center">
      <Heading
        eyebrow="The KoraSpace difference"
        title="Most tools tell you what happened."
        accent="KoraSpace helps you decide what happens next."
        sub="Everything it knows about your marketing goes in. What comes out is a decision you can act on."
      />

      <div className="mt-16 sm:mt-20">
        <IntelligenceFlow />
      </div>

      <div className="mt-28 sm:mt-36">
        <Heading
          eyebrow="Marketing that learns"
          title="Every post teaches the next one."
          accent="Then the loop runs again."
          sub="Twelve stages, one closed loop. Each pass starts from what the last one learned."
        />
        <div className="mt-14 sm:mt-16">
          <GrowthLoopRing />
        </div>
      </div>
    </Scene>
  );
}

export default SystemThatLearns;
