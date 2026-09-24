import type { TranslationDictionary } from "@/lib/i18n/types";

export type CardSlot = "top" | "left" | "bottom";

export type CanvasCard = {
  id: string;
  kicker?: string;
  body?: string;
  prompt?: string;
  items?: string[];
  highlightIndex?: number;
  action?: string;
  metric?: {
    value: number;
    prefix?: string;
    suffix?: string;
    countUp?: boolean;
  };
  slot: CardSlot;
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
  durationMs?: number;
};

export function getCanvasStates(t: TranslationDictionary): CanvasState[] {
  const c = t.heroLoop.canvas;
  const stages = c.stageLabels;

  return [
    {
      key: "understand",
      stage: stages[0] || "Understand",
      cards: [
        {
          id: "brand-understood",
          kicker: c.understandKicker,
          body: c.understandBody,
          slot: "top",
          depth: "front",
        },
      ],
    },
    {
      key: "create",
      stage: stages[1] || "Create",
      durationMs: 6500,
      cards: [
        {
          id: "opportunities",
          kicker: c.createKicker,
          prompt: c.createPrompt,
          items: c.createItems,
          highlightIndex: 0,
          action: c.createAction,
          slot: "top",
          depth: "front",
        },
        {
          id: "recent-performance",
          body: c.createPerformance,
          slot: "left",
          depth: "back",
        },
      ],
    },
    {
      key: "publish",
      stage: stages[2] || "Publish",
      cards: [
        {
          id: "campaign-ready",
          kicker: c.publishKicker,
          body: c.publishBody,
          slot: "top",
          depth: "front",
        },
      ],
    },
    {
      key: "learn",
      stage: stages[3] || "Learn",
      cards: [
        {
          id: "engagement",
          kicker: c.learnKicker,
          metric: { value: 34, prefix: "↑ ", suffix: "%", countUp: true },
          body: c.learnBody,
          slot: "top",
          depth: "front",
        },
        {
          id: "audience-signal",
          kicker: c.learnSignalKicker,
          body: c.learnSignalBody,
          slot: "left",
          depth: "back",
        },
      ],
    },
    {
      key: "next-move",
      stage: stages[4] || "Next Move",
      cards: [
        {
          id: "next-opportunity",
          kicker: c.nextMoveKicker,
          body: c.nextMoveBody,
          action: c.nextMoveAction,
          slot: "bottom",
          depth: "front",
        },
      ],
    },
  ];
}

export const STATE_DURATION_MS = 5000;
