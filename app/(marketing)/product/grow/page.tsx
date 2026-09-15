import type { Metadata } from "next";
import { PageHero } from "@/components/landing/sections/PageHero";
import { RevenueAttributionSection } from "@/components/landing/sections/RevenueAttributionSection";

export const metadata: Metadata = {
  title: "Grow — KoraSpace",
  description:
    "Turn attention into conversations and conversations into revenue, with the loop feeding what it learns back into the work.",
};

export default function ProductGrowPage() {
  return (
    <>
      <PageHero
        eyebrow="Grow"
        title="Attention is only the first step"
        sub="KoraSpace follows the thread from a post, to a conversation, to a customer — and feeds what it learns back into what you publish next."
      />

      <RevenueAttributionSection />
    </>
  );
}
