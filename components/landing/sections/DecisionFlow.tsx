"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  SectionHead,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/**
 * Section 4 — the positioning moment.
 *
 * The headline claims other tools stop at reporting, so the visual draws that
 * line literally: four stages down a spine, with "most tools stop here" cut
 * across it after the second. Everything above the line is cold and factual;
 * everything below warms into a decision you can act on.
 *
 * The temperature shift IS the argument. Read with the copy removed, the top
 * half still looks like a report and the bottom half like a recommendation —
 * which is why this is not another analytics dashboard.
 */

type Stage = {
  kicker: string;
  body: string;
  /** Cold stages are what every tool already gives you. */
  warm: boolean;
};

const STAGES: Stage[] = [
  {
    kicker: "Post performance",
    body: "Thursday's carousel held attention roughly twice as long as your average post.",
    warm: false,
  },
  {
    kicker: "Audience signal",
    body: "It wasn't the format. The same lift shows up whenever you explain something.",
    warm: false,
  },
  {
    kicker: "Kora intelligence",
    body: "That's a pattern, not a good week. Your audience comes to you to learn.",
    warm: true,
  },
  {
    kicker: "Next move",
    body: "Lead next week with the how-to angle, and publish it on a Thursday.",
    warm: true,
  },
];

export function DecisionFlow() {
  const reduce = useReducedMotion();

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <SectionHead
        eyebrow="The KoraSpace difference"
        title={
          <>
            Most tools tell you what happened.
            <br className="hidden sm:block" />{" "}
            <span className="text-[#ff9fc9]">
              KoraSpace helps you decide what happens next.
            </span>
          </>
        }
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative mx-auto max-w-2xl"
      >
        {STAGES.map((stage, i) => {
          const isLast = i === STAGES.length - 1;

          return (
            <div key={stage.kicker}>
              <motion.div variants={itemFadeUp}>
                <div
                  className={`rounded-xl border p-5 transition-colors duration-300 ${
                    stage.warm
                      ? "border-[#ff0a8a]/30 bg-[#ff0a8a]/[0.06]"
                      : "border-white/[0.09] bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {stage.warm && (
                      <Sparkles className="h-3 w-3 text-[#ff9fc9]" />
                    )}
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                        stage.warm ? "text-[#ff9fc9]" : "text-white/35"
                      }`}
                    >
                      {stage.kicker}
                    </span>
                  </div>
                  <p
                    className={`mt-2.5 text-[15px] leading-relaxed ${
                      stage.warm ? "text-white/90" : "text-white/55"
                    }`}
                  >
                    {stage.body}
                  </p>

                  {isLast && (
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#ff0a8a] px-4 py-2 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#ff2e7a]"
                    >
                      Generate
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* connector, and after stage 2 the line other tools stop at */}
              {!isLast && (
                <motion.div variants={itemFadeUp} className="relative">
                  {i === 1 ? (
                    <div className="py-5">
                      <div className="flex items-center gap-3">
                        <span className="h-px flex-1 border-t border-dashed border-white/15" />
                        <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                          Most tools stop here
                        </span>
                        <span className="h-px flex-1 border-t border-dashed border-white/15" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center py-3">
                      <span
                        className={`relative h-6 w-px ${
                          stage.warm
                            ? "bg-gradient-to-b from-[#ff9fc9]/70 to-[#ff9fc9]/20"
                            : "bg-white/15"
                        }`}
                      >
                        {!reduce && (
                          <motion.span
                            animate={{ top: ["-20%", "120%"], opacity: [0, 1, 0] }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              delay: i * 0.5,
                              ease: "easeInOut",
                            }}
                            className="absolute left-1/2 h-2 w-[3px] -translate-x-1/2 rounded-full bg-[#ff9fc9]"
                          />
                        )}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}

        {/* the crossing itself, stated once */}
        <motion.p
          variants={itemFadeUp}
          className="mt-8 text-center text-[13px] text-white/40"
        >
          Everything above the line is a report. Everything below it is a
          decision.
        </motion.p>
      </motion.div>
    </section>
  );
}

export default DecisionFlow;
