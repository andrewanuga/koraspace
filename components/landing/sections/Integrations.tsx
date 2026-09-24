/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import {
  Eyebrow,
  springTransition,
  cardHoverSpring,
  containerVariants,
  scaleIn,
} from "@/components/landing/primitives";

/* ── 8. Platform Integrations Section (#integrations) ─────────────── */

const PLATFORMS = [
  { name: "Instagram", iconPath: "/integrations/insta.png" },
  { name: "TikTok", iconPath: "/integrations/ticktok.png" },
  { name: "LinkedIn", iconPath: "/integrations/linkedin.png" },
  { name: "YouTube", iconPath: "/integrations/yt.png" },
  { name: "Facebook", iconPath: "/integrations/facebook.png" },
  { name: "X (Twitter)", iconPath: "/integrations/twitter.png" },
  { name: "Threads", iconPath: "/integrations/threads.png" },
  { name: "WhatsApp", iconPath: "/integrations/whatsapp.png" },
  { name: "Telegram", iconPath: "/integrations/telegram.png" },
  { name: "Snapchat", iconPath: "/integrations/Snapchat.png" },
  { name: "Discord", iconPath: "/integrations/discord.png" },
  { name: "Messenger", iconPath: "/integrations/messanger.png" },
  { name: "Pinterest", iconPath: "/integrations/pin.png" },
  { name: "Reddit", iconPath: "/integrations/reddit.png" },
];

export function Integrations() {
  return (
    <section id="integrations" className="relative px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={springTransition}
        className="mx-auto mb-10 max-w-2xl text-center"
      >
        <Eyebrow tone="blue">Multi-Platform Ecosystem</Eyebrow>
        <h2 className="font-display mt-3 text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Publish &amp; triage across <span className="text-[#3b82f6]">all your channels</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-white/60">
          Official OAuth 2.0 API integrations for instant scheduling and two-way messaging.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
      >
        {PLATFORMS.map((p) => (
          <motion.div
            key={p.name}
            variants={scaleIn}
            whileHover={{ y: -4, scale: 1.06, borderColor: "rgba(59,130,246,0.4)" }}
            transition={cardHoverSpring}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#171717] px-4 py-2.5 text-xs font-semibold text-white/80 transition-colors hover:bg-[#1c1c1c] hover:text-white cursor-pointer"
          >
            <img
              src={p.iconPath}
              alt={`${p.name} icon`}
              className="h-5 w-5 object-contain rounded select-none shrink-0"
            />
            <span>{p.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
