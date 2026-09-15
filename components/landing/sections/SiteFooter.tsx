/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  Zap,
  Globe,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { containerVariants, itemFadeUp } from "@/components/landing/primitives";

/* ── 15. Upgraded Footer ──────────────────────────────────────────── */

const FOOTER_LINKS = {
  Product: [
    { label: "AI Composing Pipeline", href: "#engines" },
    { label: "Visual Calendar 2.0", href: "#engines" },
    { label: "Brand Brain", href: "#brain" },
    { label: "Autonomous Growth Loop", href: "#how" },
    { label: "Pricing & Plans", href: "#pricing" },
  ],
  Platform: [
    { label: "Instagram Integration", href: "#integrations" },
    { label: "TikTok Auto-Scheduler", href: "#integrations" },
    { label: "LinkedIn & X Publisher", href: "#integrations" },
    { label: "YouTube Repurposer", href: "#integrations" },
    { label: "WhatsApp & Telegram CRM", href: "#integrations" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Nigeria Data Protection (NDPA)", href: "/privacy" },
    { label: "Cookie Policy", href: "/privacy" },
  ],
  Support: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "System Status", href: "#" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.10] bg-[#070d24] py-14 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={itemFadeUp} className="lg:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 p-[1px] border border-white/20">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0a1233]">
                  <img src="/logo.png" alt="KoraSpace Logo" className="h-4 w-4 object-contain" />
                </div>
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Kora<span className="text-[#3b82f6]">Space</span>
              </span>
            </Link>

            <p className="text-xs text-white/60 leading-relaxed font-normal">
              Autonomous AI marketing operating system built for modern creators, startups, and marketing agencies.
            </p>

            <div className="flex gap-2 pt-2">
              {[Globe, Send, Zap, MessageCircle].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center text-white hover:text-white hover:border-white/40 hover:bg-white/15 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-white stroke-white" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <motion.div key={category} variants={itemFadeUp}>
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white/70 mb-3.5">
                {category}
              </h4>
              <ul className="space-y-2 text-xs">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Support Column */}
          <motion.div variants={itemFadeUp} className="space-y-3">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-white/80 mb-3.5">
              Direct Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-white shrink-0 mt-0.5" />
                <a
                  href="mailto:support@koraspace.ai"
                  className="hover:text-white transition-colors break-all"
                >
                  support@koraspace.ai
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-white shrink-0 mt-0.5" />
                <span>+234 701 313 4821</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-white shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Credits Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} KoraSpace by Techla. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-white/60">🇳🇬 Built in Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
