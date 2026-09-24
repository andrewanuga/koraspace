"use client";

/**
 * PARKED — imported nowhere, deliberately.
 *
 * The six testimonials this rendered were invented, including a named person
 * crediting KoraSpace with a specific naira revenue figure. Publishing those
 * would be fabricating customer evidence, so the section came off the homepage
 * rather than being reworded.
 *
 * STORIES is emptied below so this cannot be re-mounted and quietly ship the
 * old quotes. The originals are in git history if the styling is ever wanted.
 * Restore it by filling STORIES with real, attributable quotes — with the
 * subject's permission — and importing it again.
 */

import { motion } from "framer-motion";
import {
  SectionHead,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/* ── 11. Customer Stories (Testimonials) (#stories) ────────────────── */

type Story = {
  tone: string;
  name: string;
  role: string;
  text: string;
  highlight: string;
  avatar: string;
};

const STORIES: Story[] = [];

export function Stories() {
  return (
    <section id="stories" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Success Stories"
          tone="pink"
          title="Loved by creators, founders, &amp; growth teams"
          sub="See how businesses across Nigeria and beyond scale their social presence and revenue with KoraSpace."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {STORIES.map((t) => {
            const isBlue = t.tone === "blue";
            const badgeColor = isBlue ? "#3b82f6" : "#ff0a8a";

            return (
              <motion.div
                key={t.name}
                variants={itemFadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={cardHoverSpring}
                className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6 text-white flex flex-col justify-between transition-colors hover:border-white/20 hover:bg-[#1a1a1a]"
              >
                <p className="text-xs leading-relaxed text-white/70 font-normal">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <span
                    className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border inline-block mb-3"
                    style={{
                      background: `${badgeColor}15`,
                      borderColor: `${badgeColor}30`,
                      color: badgeColor,
                    }}
                  >
                    {t.highlight}
                  </span>

                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{ background: badgeColor }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{t.name}</p>
                      <p className="text-[11px] text-white/45">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
