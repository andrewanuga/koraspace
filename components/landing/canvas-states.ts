/**
 * The five states of the Intelligence Canvas — the hero's visual rendering of
 * the Autonomous Growth Loop.
 *
 * The portrait stays fixed inside its "intelligence boundary" while these
 * cards orbit and change around it, so the system reads as observing the
 * person rather than sitting beside them.
 */

export type CardSlot = "top" | "left" | "bottom";

export type CanvasCard = {
  id: string;
  /** Small accent label above the body. */
  kicker?: string;
  body?: string;
  /** Typed out character by character before the rest of the card resolves. */
  prompt?: string;
  /** Rendered as individual rows — one gets picked out by the ghost cursor. */
  items?: string[];
  /** Index of the row the cursor lands on and highlights. */
  highlightIndex?: number;
  /** Rendered as a pink action line with an arrow. */
  action?: string;
  /** Big figure shown before the body (LEARN's headline metric). */
  metric?: {
    value: number;
    prefix?: string;
    suffix?: string;
    /** Ticks up from zero on entry. */
    countUp?: boolean;
  };
  /** Where it sits relative to the portrait frame. */
  slot: CardSlot;
  /** Drives scale, blur and opacity so cards sit at different depths. */
  depth: "front" | "back";
};

/**
 * Stable ids for the five states, so an external control can select one by
 * name rather than by index (see IntelligenceCanvas's `focusedKey`).
 */
export type CanvasStateKey =
  | "understand"
  | "create"
  | "publish"
  | "learn"
  | "next-move";

export type CanvasState = {
  key: CanvasStateKey;
  stage: string;
  cards: CanvasCard[];
  /** Defaults to STATE_DURATION_MS. CREATE needs longer once it animates. */
  durationMs?: number;
};

export const canvasStates: CanvasState[] = [
  {
    key: "understand",
    stage: "Understand",
    cards: [
      {
        id: "brand-understood",
        kicker: "Brand understood",
        body: "Your audience responds best to practical founder-led content.",
        slot: "top",
        depth: "front",
      },
    ],
  },
  {
    key: "create",
    stage: "Create",
    durationMs: 6500,
    cards: [
      {
        id: "opportunities",
        kicker: "3 opportunities found",
        prompt: "Draft a founder story",
        items: ["Founder story", "Product breakdown", "Customer problem"],
        highlightIndex: 0,
        action: "Generate content",
        slot: "top",
        depth: "front",
      },
      {
        id: "recent-performance",
        body: "Based on your recent performance",
        slot: "left",
        depth: "back",
      },
    ],
  },
  {
    key: "publish",
    stage: "Publish",
    cards: [
      {
        id: "campaign-ready",
        kicker: "Campaign ready",
        body: "Scheduled across Instagram, LinkedIn and TikTok for peak audience time.",
        slot: "top",
        depth: "front",
      },
    ],
  },
  {
    key: "learn",
    stage: "Learn",
    cards: [
      {
        id: "engagement",
        kicker: "Engagement",
        metric: { value: 34, prefix: "↑ ", suffix: "%", countUp: true },
        body: "This format is outperforming your average.",
        slot: "top",
        depth: "front",
      },
      {
        id: "audience-signal",
        kicker: "Audience signal detected",
        body: "Educational posts outperform promotional posts",
        slot: "left",
        depth: "back",
      },
    ],
  },
  {
    key: "next-move",
    stage: "Next Move",
    cards: [
      {
        id: "next-opportunity",
        kicker: "Next move",
        body: "Turn your best-performing post into a 3-part campaign.",
        action: "Generate",
        slot: "bottom",
        depth: "front",
      },
    ],
  },
];

export const STATE_DURATION_MS = 5000;
