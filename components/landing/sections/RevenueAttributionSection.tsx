"use client";

import { motion } from "framer-motion";
import { Flame, Award } from "lucide-react";
import { SectionHead, springTransition, cardHoverSpring } from "@/components/landing/primitives";

/* ── 9. Revenue Attribution & Intelligence (#revenue) ─────────────── */

export function RevenueAttributionSection() {
  return (
    <section id="revenue" className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <SectionHead
          eyebrow="Revenue & Conversion Tracking"
          tone="blue"
          title={
            <>
              From social impressions to <span className="text-[#3b82f6]">verifiable pipeline revenue</span>
            </>
          }
          sub="Stop guessing the ROI of your social posts. Track the full journey from views to profile visits, CRM leads, and closed revenue."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
          {/* Revenue Attribution Funnel Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={springTransition}
            className="lg:col-span-7 rounded-3xl border border-[#3b82f6]/25 bg-[#171717] p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Social-to-Revenue Funnel</h3>
                  <p className="text-xs text-white/50">Real-time attribution powered by UTM tracking</p>
                </div>
                <span className="font-mono text-xs text-[#3b82f6] bg-[#3b82f6]/15 border border-[#3b82f6]/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { label: "50,000 Social Impressions", val: "Top of Funnel", tone: "text-white/50", ml: "" },
                  { label: "1,420 Profile Visits", val: "2.84% Conv.", tone: "text-[#ff0a8a]", ml: "ml-2 sm:ml-4" },
                  { label: "310 Website Clicks", val: "UTM Verified", tone: "text-[#3b82f6]", ml: "ml-4 sm:ml-8" },
                  { label: "48 Qualified Leads", val: "Social CRM Pipeline", tone: "text-[#34d399]", ml: "ml-6 sm:ml-12" },
                ].map((row, idx) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * idx, duration: 0.4 }}
                    className={`flex justify-between items-center bg-[#141414] p-3 rounded-xl border border-white/[0.06] ${row.ml}`}
                  >
                    <span className="text-white">{row.label}</span>
                    <span className={row.tone}>{row.val}</span>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="flex justify-between items-center bg-[#3b82f6]/15 border border-[#3b82f6]/30 p-3.5 rounded-xl font-bold ml-8 sm:ml-16 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                >
                  <span>14 Customers Closed</span>
                  <span className="text-[#3b82f6] font-extrabold text-sm">₦1,450,000 Revenue</span>
                </motion.div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.07] flex items-center justify-between text-xs text-white/50">
              <span>Attribution Model: Multi-Touch</span>
              <span className="text-white/80 font-medium">ROAS: 4.2x</span>
            </div>
          </motion.div>

          {/* KoraScore & Opportunity Radar */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/50 font-bold">
                  Account Health Score
                </span>
                <Award className="h-5 w-5 text-[#ff0a8a]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-white">KoraScore: 88</span>
                <span className="text-xs text-white/40">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-[#34d399] font-medium leading-relaxed">
                &quot;Top 5% posting consistency this week. Schedule 2 more short videos to hit peak reach.&quot;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4 }}
              transition={cardHoverSpring}
              className="rounded-3xl border border-white/[0.08] bg-[#171717] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white/50 font-bold">
                  Lead Opportunity Radar
                </span>
                <Flame className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <h4 className="font-display mt-2 text-base font-bold text-white">
                4 Hot Niche Opportunities Detected
              </h4>
              <p className="mt-1 text-xs text-white/55 leading-relaxed font-normal">
                3 high-intent lead questions in Instagram DMs + 1 trending competitor breakout format in your industry.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
