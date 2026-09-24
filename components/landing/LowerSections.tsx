/**
 * TEMPORARY re-export barrel.
 *
 * These 14 sections used to live here in one 2042-line client module. They now
 * have a file each under ./sections/ so the homepage and the product pages can
 * import only what they render, instead of every page pulling all of them into
 * the client bundle.
 *
 * This barrel exists purely so app/page.tsx did not have to change in the same
 * commit as the split. Once the pages import from ./sections directly, delete
 * this file — it is scheduled for removal in the final stage of the
 * marketing-site restructure.
 */

export { ProblemSolverSection } from "./sections/ProblemSolverSection";
export { DualModeShowcaseSection } from "./sections/DualModeShowcaseSection";
export { GrowthLoopSection } from "./sections/GrowthLoopSection";
export { FeatureSection } from "./sections/FeatureSection";
export { FeatureShowcase } from "./sections/FeatureShowcase";
export { BrainAndAgentsSection } from "./sections/BrainAndAgentsSection";
export { AgentTools } from "./sections/AgentTools";
export { Integrations } from "./sections/Integrations";
export { RevenueAttributionSection } from "./sections/RevenueAttributionSection";
export { Collaboration } from "./sections/Collaboration";
// Stories is parked in ./_parked/ — its testimonials were invented. Not exported.
export { Pricing } from "./sections/Pricing";
export { FAQ } from "./sections/FAQ";
export { FinalCTA } from "./sections/FinalCTA";
export { SiteFooter } from "./sections/SiteFooter";
