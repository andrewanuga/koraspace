"use client";

import { motion } from "framer-motion";
import {
  SectionHead,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/* ── 11. Customer Stories (Testimonials) (#stories) ────────────────── */

const STORIES = [
  {
    name: "Adaeze Okonkwo",
    role: "Fintech Founder, Lagos",
    avatar: "AO",
    text: "I replaced Buffer and a freelance manager with KoraSpace. The AI operator handles our comment triage and schedules weekly content while I close enterprise deals.",
    highlight: "Saved 15 hrs / week",
    tone: "pink" as const,
  },
  {
    name: "Chukwuemeka Dike",
    role: "Digital Agency Lead, Abuja",
    avatar: "CD",
    text: "Managing 8 client accounts used to require three junior managers. Now it is just me and KoraSpace. The client approval links make signoffs effortless.",
    highlight: "Manages 8 brands solo",
    tone: "blue" as const,
  },
  {
    name: "Fatima Al-Hassan",
    role: "E-Commerce Founder, Kano",
    avatar: "FA",
    text: "The Social CRM detected high-intent buyer questions in our Instagram comments and generated ₦480,000 in sales within 2 weeks of switching.",
    highlight: "₦480,000 direct revenue",
    tone: "blue" as const,
  },
  {
    name: "Tunde Fashola",
    role: "Executive Brand Coach, Lagos",
    avatar: "TF",
    text: "Trend-to-Draft is like having a ghostwriter that never sleeps. It catches breaking news cycles and prepares three multi-format drafts before I wake up.",
    highlight: "Always on trend",
    tone: "pink" as const,
  },
  {
    name: "Ngozi Eze",
    role: "Fashion Brand Director, PH",
    avatar: "NE",
    text: "I was skeptical about AI capturing my brand voice. The Brand Brain learned our tone from past top posts so well that my followers could not tell the difference.",
    highlight: "Authentic voice matching",
    tone: "pink" as const,
  },
  {
    name: "Biodun Afolabi",
    role: "B2B SaaS Growth Marketer",
    avatar: "BA",
    text: "Transparent NGN pricing and seamless Paystack billing made adoption a no-brainer for our team. The multi-channel attribution is top notch.",
    highlight: "Predictable NGN billing",
    tone: "blue" as const,
  },
];

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
