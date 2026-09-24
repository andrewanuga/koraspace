"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PenLine, Search, TrendingUp } from "lucide-react";
import {
  SectionHead,
  containerVariants,
  itemFadeUp,
  cardHoverSpring,
} from "@/components/landing/primitives";

/**
 * The hub's handoff into the three product pages.
 *
 * The homepage's closing section links to these same three destinations, so a
 * visitor arrives here already primed for the vocabulary — Create, Understand,
 * Grow are the loop's three verbs, not three feature buckets.
 */
const PATHS = [
  {
    href: "/product/create",
    Icon: PenLine,
    title: "Create",
    body: "Draft posts in your brand voice, repurpose what already worked, and keep a full calendar without starting from a blank page.",
  },
  {
    href: "/product/understand",
    Icon: Search,
    title: "Understand",
    body: "KoraSpace reads your brand, your audience and your results, so the next decision is informed by the last one.",
  },
  {
    href: "/product/grow",
    Icon: TrendingUp,
    title: "Grow",
    body: "Turn attention into conversations and conversations into revenue, with the loop feeding what it learns back into the work.",
  },
];

export function ProductPaths() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <SectionHead
        eyebrow="Explore"
        tone="white"
        title="Three ways into the same system"
        sub="Every part of KoraSpace feeds the same loop. Start wherever your problem is loudest."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-3"
      >
        {PATHS.map(({ href, Icon, title, body }) => (
          <motion.div key={href} variants={itemFadeUp}>
            <Link href={href} className="group block h-full">
              <motion.div
                whileHover={{ y: -4 }}
                transition={cardHoverSpring}
                className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors duration-300 hover:border-[#ff0a8a]/40 hover:bg-white/[0.06]"
              >
                <Icon className="h-5 w-5 text-[#ff9fc9]" />
                <h3 className="font-display mt-4 text-xl font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                  {body}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff9fc9]">
                  Explore {title}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default ProductPaths;
