import type { Metadata } from "next";
import { PageHero } from "@/components/landing/sections/PageHero";
import { FeatureSection } from "@/components/landing/sections/FeatureSection";

export const metadata: Metadata = {
  title: "Create — KoraSpace",
  description:
    "Draft posts in your brand voice, repurpose what already worked, and keep a full calendar without starting from a blank page.",
};

export default function ProductCreatePage() {
  return (
    <>
      <PageHero
        eyebrow="Create"
        title="Never start from a blank page again"
        sub="KoraSpace already knows your voice, your products and what your audience responded to last time. Creating is editing, not inventing."
      />

      <FeatureSection
        id="ai-content"
        badge="AI Content"
        tone="pink"
        title="Turn your brand voice into ready-to-publish posts"
        description="Executes an 8-step AI pipeline: checks client niche -> reads past posts -> scans active trends -> drafts post & caption -> assigns hashtags -> double web reflection."
        imageUrl="/features/Kora-AI-Composer.jpg"
        imageAlt="AI Composing Pipeline Showcase"
        imageLeft={true}
      />

      <FeatureSection
        id="repurposing"
        badge="Content Repurposing"
        tone="pink"
        title="One piece of content becomes six"
        description="Take a long-form video, thread or post and let KoraSpace reshape it for every platform you publish to — each cut written for how that audience actually reads."
        imageUrl="/features/Visual-Drag-and-Drop Calendar.jpg"
        imageAlt="Content repurposing across platforms"
        imageLeft={false}
      />
    </>
  );
}
