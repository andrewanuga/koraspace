import { Preloader } from "@/components/landing/Preloader";
import { FloatingNav } from "@/components/landing/FloatingNav";
import { Hero } from "@/components/landing/Hero";
import {
  ProblemSolverSection,
  GrowthLoopSection,
  FeatureSection,
  FeatureShowcase,
  BrainAndAgentsSection,
  AgentTools,
  Integrations,
  RevenueAttributionSection,
  Collaboration,
  FAQ,
  Stories,
  Pricing,
  FinalCTA,
  SiteFooter,
} from "@/components/landing/LowerSections";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#07050d] selection:bg-[#FF2E93]/20 selection:text-[#FF2E93]">
      <Preloader />
      <FloatingNav />
      <main>
        <Hero />
        <ProblemSolverSection />
        <GrowthLoopSection />
        
        {/* Alternating FeatureSection Showcase Rows */}
        <FeatureSection
          badge="AI Composing Pipeline"
          title="Turn your brand voice into ready-to-publish posts"
          description="Executes an 8-step AI pipeline: checks client niche -> reads past posts -> scans active trends -> drafts post & caption -> assigns hashtags -> double web reflection."
          imageUrl="/features/Kora-AI-Composer.jpg"
          imageAlt="AI Composing Pipeline Showcase"
          imageLeft={true}
        />

        <FeatureSection
          badge="Visual Calendar 2.0"
          title="Drag-and-drop your social growth strategy"
          description="Visual planning surface to schedule, organize, and drag-and-drop posts across Instagram, TikTok, LinkedIn, YouTube, X, and Threads effortlessly."
          imageUrl="/features/Visual-Drag-and-Drop Calendar.jpg"
          imageAlt="Visual Content Calendar Showcase"
          imageLeft={false}
        />

        {/* Interactive Showcase Matrix Engine */}
        <FeatureShowcase />

        <BrainAndAgentsSection />

        <FeatureSection
          badge="Social Inbox & CRM"
          title="Classify leads & triage messages automatically"
          description="Unified inbox that detects high-intent buying signals ('How much does this cost?'), tags leads, and logs dollar opportunities straight to CRM."
          imageUrl="/features/social-ecommerce.jpg"
          imageAlt="Social Inbox & CRM Showcase"
          imageLeft={true}
        />

        <FeatureSection
          badge="Agency Workspaces"
          title="Multi-seat team approval & client portals"
          description="Manage multiple client workspaces with strict row-level security. Teammates manage accounts, review drafts, while you control billing."
          imageUrl="/features/manage-multiple-brands.jpg"
          imageAlt="Agency Workspaces Showcase"
          imageLeft={false}
        />

        <AgentTools />
        <Integrations />
        <RevenueAttributionSection />
        <Collaboration />
        <FAQ />
        <Stories />
        <Pricing />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}


