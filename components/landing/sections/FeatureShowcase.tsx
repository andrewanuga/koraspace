"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Users,
  RefreshCw,
} from "lucide-react";
import { Eyebrow, springTransition } from "@/components/landing/primitives";

/* ── 5. Interactive FeatureShowcase (#engines) ────────────────────── */

interface FeatureNode {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tone: "pink" | "blue";
  icon: React.ComponentType<{ className?: string }>;
  screenPath: string;
}

const FEATURE_SET_DATA: FeatureNode[] = [
  {
    id: "ai-composer",
    title: "AI Composing Pipeline",
    tagline: "Multi-Step Reflection Engine",
    description:
      "Executes an 8-step AI workflow: checks brand voice guidelines -> analyzes past viral posts -> scans real-time niche trends -> drafts post & caption -> assigns hashtag clusters -> double web reflections.",
    tone: "pink",
    icon: Sparkles,
    screenPath: "/features/Kora-AI-Composer.jpg",
  },
  {
    id: "visual-calendar",
    title: "Visual Drag-and-Drop Calendar",
    tagline: "Multi-Platform Scheduling",
    description:
      "A fast, unified planning board to schedule, rearrange, and manage scheduled posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly.",
    tone: "pink",
    icon: Calendar,
    screenPath: "/features/Visual-Drag-and-Drop Calendar.jpg",
  },
  {
    id: "repurposer",
    title: "Content Repurposer",
    tagline: "1 Asset to 6 Formats",
    description:
      "Transform a single YouTube video, podcast transcript, or article into LinkedIn carousels, X threads, Instagram captions, TikTok scripts, and newsletters with one click.",
    tone: "pink",
    icon: RefreshCw,
    screenPath: "/features/social-media-concept-with-device.jpg",
  },
  {
    id: "inbox-crm",
    title: "Social CRM & Lead Triage",
    tagline: "High-Intent Signal Detection",
    description:
      "Unified social inbox that classifies comments and DMs into Leads, Support, or Inquiries. Automatically flags buying questions ('How much is this?') and creates CRM opportunities.",
    tone: "blue",
    icon: DollarSign,
    screenPath: "/features/social-ecommerce.jpg",
  },
  {
    id: "agency-workspaces",
    title: "Agency Workspaces & Client Portals",
    tagline: "Multi-Seat Collaboration",
    description:
      "Built for marketing agencies and growth teams. Manage multiple client workspaces with strict RLS permissions, shareable approval links, and white-label reporting.",
    tone: "blue",
    icon: Users,
    screenPath: "/features/manage-multiple-brands.jpg",
  },
  {
    id: "growth-marketing",
    title: "Revenue & ROAS Attribution",
    tagline: "Full-Funnel Analytics",
    description:
      "Track the journey from social impressions to website visits, qualified CRM leads, and closed revenue. Identify high-ROI campaigns with verifiable Naira / dollar conversion data.",
    tone: "blue",
    icon: TrendingUp,
    screenPath: "/features/social-media-marketing.jpg",
  },
];

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeature = FEATURE_SET_DATA[activeIndex];

  return (
    <section id="engines" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={springTransition}
        className="rounded-3xl border border-white/[0.08] bg-[#161616] p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header Text with Smooth AnimatePresence */}
        <div className="text-center max-w-3xl mx-auto mb-8 min-h-[140px] flex flex-col justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <Eyebrow tone={activeFeature.tone}>
                {activeFeature.tagline}
              </Eyebrow>

              <h3 className="font-display mt-3 text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {activeFeature.title}
              </h3>

              <p className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl mx-auto">
                {activeFeature.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Display Mockup Frame with Smooth Crossfade */}
        <div className="relative w-full max-w-4xl mx-auto aspect-16/10 rounded-2xl overflow-hidden border border-white/[0.10] bg-black shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeFeature.screenPath}
              src={activeFeature.screenPath}
              alt={activeFeature.title}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-cover object-top"
            />
          </AnimatePresence>
        </div>

        {/* Tab Navigation Matrix with Sliding layoutId Pill */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {FEATURE_SET_DATA.map((feat, idx) => {
            const Icon = feat.icon;
            const isSelected = idx === activeIndex;
            const featColor = feat.tone === "blue" ? "#3b82f6" : "#ff0a8a";

            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-white/20 text-white shadow-sm"
                    : "border-white/[0.06] text-white/50 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="feature-active-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/25 -z-0"
                    transition={springTransition}
                  />
                )}

                <div
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg mb-2 transition-colors"
                  style={{
                    background: isSelected ? `${featColor}20` : "rgba(255,255,255,0.05)",
                    color: isSelected ? featColor : "inherit",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="relative z-10 text-xs font-semibold tracking-tight truncate w-full">
                  {feat.title}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
