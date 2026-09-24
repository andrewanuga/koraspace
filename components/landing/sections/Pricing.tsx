"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  SectionHead,
  springTransition,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
} from "@/components/landing/primitives";

/* ── 12. Transparent Pricing Section (#pricing) ───────────────────── */

const BASE_PLANS = [
  {
    name: "Starter / Free",
    monthlyPrice: 0,
    period: "/mo",
    desc: "For solo creators getting started",
    posts: "15 scheduled posts / mo",
    features: [
      "50,000 AI tokens / mo",
      "3 social account integrations",
      "Visual content calendar",
      "Basic AI post composer",
      "Community support",
    ],
    cta: "Start Free",
    highlight: false,
    tone: "white" as const,
  },
  {
    name: "Creator Pro",
    monthlyPrice: 15000,
    period: "/mo",
    desc: "For active creators & influencers",
    posts: "150 scheduled posts / mo",
    features: [
      "400,000 AI tokens / mo",
      "6 social account integrations",
      "Full AI Composing Pipeline",
      "Content Repurposer (1->6)",
      "Viral Trend Radar & Brand Brain",
      "Post scoring & engagement prediction",
    ],
    cta: "Start Creator Trial",
    highlight: true,
    badge: "Creator Favorite",
    tone: "pink" as const,
  },
  {
    name: "Marketer Pro",
    monthlyPrice: 35000,
    period: "/mo",
    desc: "For growth operators & businesses",
    posts: "500 scheduled posts / mo",
    features: [
      "1,000,000 AI tokens / mo",
      "10 social account integrations",
      "Marketing Operator Agent",
      "Social CRM & High-Intent Triage",
      "Multi-channel Campaigns & Automations",
      "Full-Funnel Revenue Attribution",
      "Priority WhatsApp & email support",
    ],
    cta: "Start Marketer Trial",
    highlight: false,
    badge: "Marketer Tier",
    tone: "blue" as const,
  },
  {
    name: "Agency / Teams",
    monthlyPrice: 85000,
    period: "/mo",
    desc: "For agencies managing multiple brands",
    posts: "Unlimited scheduled posts",
    features: [
      "3,000,000 AI tokens / mo",
      "Unlimited social integrations",
      "Unlimited client workspace portals",
      "1-Click shareable approval links",
      "Multi-seat role permissions (RLS)",
      "White-label client performance reports",
      "Dedicated account manager",
    ],
    cta: "Get Agency Plan",
    highlight: false,
    badge: "Agency Tier",
    tone: "white" as const,
  },
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getFormattedPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return "₦0";
    const finalPrice = billingPeriod === "yearly" ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
    return `₦${finalPrice.toLocaleString("en-NG")}`;
  };

  return (
    <section id="pricing" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Transparent NGN Pricing"
          tone="pink"
          title={
            <>
              Simple plans.{" "}
              <span className="text-[#ff0a8a]">No USD conversion surprises.</span>
            </>
          }
          sub="Pay locally via Paystack, Flutterwave, or any Nigerian debit card. Every paid plan includes a 14-day free trial."
        />

        {/* Monthly / Yearly Toggle with layoutId sliding pill */}
        <div className="flex justify-center items-center gap-2 mb-12">
          <div className="relative bg-[#171717] p-1.5 rounded-2xl border border-white/[0.08] inline-flex items-center">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer z-10 ${
                billingPeriod === "monthly" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {billingPeriod === "monthly" && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/20 -z-10"
                  transition={springTransition}
                />
              )}
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`relative px-5 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer z-10 ${
                billingPeriod === "yearly" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {billingPeriod === "yearly" && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 rounded-xl bg-[#ff0a8a] shadow-[0_4px_16px_rgba(255,10,138,0.3)] -z-10"
                  transition={springTransition}
                />
              )}
              <span>Annual Billing</span>
              <span className="bg-black/30 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid with Max Springs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 items-stretch mb-12"
        >
          {BASE_PLANS.map((p) => {
            const isPink = p.tone === "pink";
            const isBlue = p.tone === "blue";
            const borderColor = isPink
              ? "border-[#ff0a8a]/40"
              : isBlue
              ? "border-[#3b82f6]/40"
              : "border-white/[0.08]";

            const buttonStyle = isPink
              ? "bg-[#ff0a8a] text-white shadow-[0_4px_18px_rgba(255,10,138,0.25)] hover:bg-[#ff299b]"
              : isBlue
              ? "bg-[#3b82f6] text-white shadow-[0_4px_18px_rgba(59,130,246,0.25)] hover:bg-[#2563eb]"
              : "bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.10]";

            return (
              <motion.div
                key={p.name}
                variants={itemFadeUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={cardHoverSpring}
                className={`relative flex flex-col justify-between rounded-3xl border bg-[#171717] p-6 text-white transition-colors ${borderColor}`}
                style={{
                  boxShadow: p.highlight ? "0 10px 40px rgba(255,10,138,0.15)" : undefined,
                }}
              >
                {p.badge && (
                  <span
                    className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full absolute -top-3 left-6 text-white shadow-sm ${
                      isPink ? "bg-[#ff0a8a]" : isBlue ? "bg-[#3b82f6]" : "bg-white/20"
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-white">
                      {getFormattedPrice(p.monthlyPrice)}
                    </span>
                    <span className="text-xs text-white/45">
                      {billingPeriod === "yearly" ? "/mo (billed annually)" : p.period}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">{p.desc}</p>

                  <div className="mt-4 font-mono text-xs font-semibold text-white/80 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                    {p.posts}
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-white/70">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check
                          className="h-3.5 w-3.5 shrink-0"
                          style={{
                            color: isPink ? "#ff0a8a" : isBlue ? "#3b82f6" : "#ffffff",
                          }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/signup" className="mt-8">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={cardHoverSpring}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer ${buttonStyle}`}
                  >
                    {p.cta}
                  </motion.button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Custom Enterprise Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springTransition}
          className="rounded-2xl border border-white/[0.08] bg-[#161616] p-6 text-white flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 max-w-3xl mx-auto"
        >
          <div>
            <h4 className="font-display font-bold text-base text-white">
              Enterprise &amp; High-Volume Custom Workspaces
            </h4>
            <p className="text-white/60 text-xs mt-1">
              Need custom fine-tuned models, dedicated IPs, SLA guarantees, or 20+ team seats?
            </p>
          </div>
          <Link href="mailto:support@koraspace.ai" className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="border border-white/[0.10] bg-white/[0.04] text-white px-5 py-2 rounded-xl font-semibold text-xs hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Contact Enterprise Sales
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
