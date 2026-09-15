/**
 * Shared substrate for the marketing pages. Every section imports its
 * chrome from here so the homepage and the deeper product pages cannot
 * drift apart visually.
 */

export { LandingButton } from "./LandingButton";
export { Eyebrow, type SectionTone } from "./Eyebrow";
export { SectionHead } from "./SectionHead";
export {
  springTransition,
  cardHoverSpring,
  containerVariants,
  itemFadeUp,
  scaleIn,
} from "./motion";
