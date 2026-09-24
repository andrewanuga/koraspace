"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHead } from "@/components/landing/primitives";

/* ── 13. FAQ Accordion (#faq) with Max Spring Animation ───────────── */

const FAQS_DATA = [
  {
    q: "What is the difference between Creator Mode and Marketer Mode?",
    a: "Creator Mode is built for creators, solo founders, and influencers focusing on brand voice learning, AI post composing, multi-format repurposing, and visual drag-and-drop scheduling across 6+ social networks. Marketer Mode is designed for growth operators and marketing agencies who need campaign execution, social CRM lead triage (converting comments & DMs to deals), autonomous agent operators, and closed-loop revenue attribution.",
  },
  {
    q: "How does the Brand Brain ensure posts sound like me?",
    a: "Simply input your website URL, brand guidelines, product briefs, or top past posts. The KoraSpace Brand Brain builds a persistent memory profile with vocabulary rules, tone settings, and custom guardrails so every generated post, carousel, or script sounds authentic.",
  },
  {
    q: "Which social media platforms are supported?",
    a: "KoraSpace connects directly to Instagram, TikTok, LinkedIn, YouTube, X (Twitter), Facebook, Threads, WhatsApp, Telegram, and more via official authorized OAuth 2.0 APIs.",
  },
  {
    q: "How does Ghost Mode™ lead triage work?",
    a: "Ghost Mode™ monitors your comments and direct messages in real time. Using NLP and randomized human-like delays (30s–75s), it detects buying questions (e.g. 'How much does this cost?', 'Can I buy today?') and logs qualified leads directly into your CRM Kanban board.",
  },
  {
    q: "Can I use KoraSpace for multi-client agencies or teams?",
    a: "Yes! The Agency & Teams tier includes dedicated client workspace portals, multi-seat role permissions with row-level security, shareable draft approval links (no login required for clients), and white-label analytics reports.",
  },
  {
    q: "What payment methods are supported in Nigeria and internationally?",
    a: "All plans are billed in Nigerian Naira (NGN) without foreign exchange surprises. We accept all Nigerian debit cards (Mastercard, Visa, Verve), bank transfers, and international cards via Paystack and Flutterwave.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-24">
      <SectionHead
        eyebrow="Frequently Asked Questions"
        tone="pink"
        title="Got questions? We've got answers."
        sub="Everything you need to know about KoraSpace, dual operating modes, AI safety, and pricing."
      />

      <div className="space-y-3">
        {FAQS_DATA.map((faq, i) => {
          const isOpen = openIndex === i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
              className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex justify-between items-center text-left p-5 focus:outline-none select-none cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white pr-4">
                  {faq.q}
                </span>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`text-white/60 shrink-0 ${isOpen ? "text-[#ff0a8a]" : ""}`}
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal border-t border-white/[0.06] pt-3">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
