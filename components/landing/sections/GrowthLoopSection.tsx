"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  SectionHead,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/* ── 3. Growth Loop Section (#how) ────────────────────────────────── */

const LOOP_STAGES = [
  {
    num: "01",
    title: "Understand & Research",
    desc: "Scans your brand guidelines, past viral winners, and real-time social trends across your niche.",
    icon: Search,
    color: "#ff0a8a",
    badge: "Brand Brain",
  },
  {
    num: "02",
    title: "Strategize & Compose",
    desc: "Executes an 8-step AI pipeline with tone-matching, draft scoring, and reflection before final output.",
    icon: Sparkles,
    color: "#ec4899",
    badge: "AI Composer",
  },
  {
    num: "03",
    title: "Publish & Triage",
    desc: "Auto-schedules across 6+ networks and triages incoming comments & DMs with high-intent lead detection.",
    icon: Calendar,
    color: "#3b82f6",
    badge: "Multi-Platform CRM",
  },
  {
    num: "04",
    title: "Measure & Optimize",
    desc: "Attributes social clicks to real pipeline revenue and automatically feeds insights into future strategy.",
    icon: RefreshCw,
    color: "#2563eb",
    badge: "Closed-Loop Growth",
  },
];

export function GrowthLoopSection() {
  return (
    <section id="how" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          eyebrow="The Autonomous Growth Loop"
          tone="white"
          title="Social media marketing that continuously optimizes itself."
          sub="Buffer and Hootsuite make you do everything manually. KoraSpace connects understanding, creation, distribution, and revenue attribution in a single automated loop."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {LOOP_STAGES.map((s) => (
            <motion.div
              key={s.num}
              variants={itemFadeUp}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={cardHoverSpring}
              className="relative flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#171717] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-colors hover:border-white/20 hover:bg-[#1a1a1a]"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="font-mono text-base font-extrabold tracking-wider"
                    style={{ color: s.color }}
                  >
                    #{s.num}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${s.color}18`,
                      border: `1px solid ${s.color}35`,
                      color: s.color,
                    }}
                  >
                    <s.icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-semibold">
                  {s.badge}
                </span>

                <h3 className="font-display mt-3 text-lg font-bold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/55 font-normal">
                  {s.desc}
                </p>
              </div>

              <div
                className="mt-6 flex items-center gap-1.5 text-xs font-bold"
                style={{ color: s.color }}
              >
                <span>Feeds next stage</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
