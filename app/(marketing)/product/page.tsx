import type { Metadata } from "next";
import { PageHero } from "@/components/landing/sections/PageHero";
import { ProductPaths } from "@/components/landing/sections/ProductPaths";
import { ProblemSolverSection } from "@/components/landing/sections/ProblemSolverSection";
import { GrowthLoopSection } from "@/components/landing/sections/GrowthLoopSection";
import { FeatureShowcase } from "@/components/landing/sections/FeatureShowcase";
import { FeatureSection } from "@/components/landing/sections/FeatureSection";
import { AgentTools } from "@/components/landing/sections/AgentTools";
import { Integrations } from "@/components/landing/sections/Integrations";

export const metadata: Metadata = {
  title: "Product — KoraSpace",
  description:
    "KoraSpace learns your brand, understands your audience, creates and distributes content, and turns your results into your next best move.",
};

/**
 * The product hub.
 *
 * Carries the overview plus the categories that do not have a page of their
 * own yet — Manage, Convert, Automate and Integrations live here as anchors,
 * and get promoted to pages once there is enough to say to justify one. The
 * nav's Product menu points its leaves at whichever of the two exists.
 */
export default function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="One system that learns as you market"
        sub="Not a scheduler with AI bolted on. KoraSpace watches what works, remembers it, and uses it to shape what you do next."
      />

      <ProblemSolverSection />
      <GrowthLoopSection />
      <ProductPaths />
      <FeatureShowcase />

      {/* Manage — no page of its own yet; the nav's Manage leaves land here. */}
      <div id="manage" className="scroll-mt-24">
        <FeatureSection
          badge="Visual Calendar 2.0"
          tone="pink"
          title="Drag-and-drop your social growth strategy"
          description="Visual planning surface to schedule, organize, and drag-and-drop posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly."
          imageUrl="/features/Visual-Drag-and-Drop Calendar.jpg"
          imageAlt="Visual Content Calendar Showcase"
          imageLeft={false}
        />
      </div>

      {/* Convert — likewise an anchor until it earns a page. */}
      <div id="convert" className="scroll-mt-24">
        <FeatureSection
          badge="Social Inbox & CRM"
          tone="blue"
          title="Classify leads & triage messages automatically"
          description="Unified inbox that detects high-intent buying signals ('How much does this cost?'), tags leads, and logs dollar opportunities straight to CRM."
          imageUrl="/features/social-ecommerce.jpg"
          imageAlt="Social Inbox & CRM Showcase"
          imageLeft={true}
        />
      </div>

      {/* Automate — AgentTools carries its own id="features" from the homepage
          era; this wrapper is the anchor the nav actually points at. */}
      <div id="automate" className="scroll-mt-24">
        <AgentTools />
      </div>

      <Integrations />

      <FeatureSection
        id="agency-workspaces"
        badge="Agency Workspaces"
        tone="blue"
        title="Multi-seat team approval & client portals"
        description="Manage multiple client workspaces with strict row-level security. Teammates manage accounts, review drafts, while you control billing."
        imageUrl="/features/manage-multiple-brands.jpg"
        imageAlt="Agency Workspaces Showcase"
        imageLeft={false}
      />
    </>
  );
}
