import type { Metadata } from "next";
import { PageHero } from "@/components/landing/sections/PageHero";
import { BrainAndAgentsSection } from "@/components/landing/sections/BrainAndAgentsSection";

export const metadata: Metadata = {
  title: "Understand — KoraSpace",
  description:
    "KoraSpace reads your brand, your audience and your results, so the next decision is informed by the last one.",
};

export default function ProductUnderstandPage() {
  return (
    <>
      <PageHero
        eyebrow="Understand"
        tone="blue"
        title="It remembers what worked, so you don't have to"
        sub="Every post, every reply, every result is a signal. KoraSpace keeps them, connects them, and tells you what they add up to."
      />

      <BrainAndAgentsSection />
    </>
  );
}
