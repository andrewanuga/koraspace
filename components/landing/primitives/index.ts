/**
 * Shared substrate for the marketing pages. Every section imports its
 * chrome from here so the homepage and the deeper product pages cannot
 * drift apart visually.
 */

// The layered-scene system. A section built from these reads as a composition
// with depth rather than a rectangle in a column.
export { Scene } from "./Scene";
export { Surface } from "./Surface";
export { SceneNumeral } from "./SceneNumeral";
export { FloatingCard } from "./FloatingCard";
export { ConnectorLine } from "./ConnectorLine";
export { SectionThread } from "./SectionThread";
export { useParallax, type ParallaxDepth } from "./useParallax";

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
