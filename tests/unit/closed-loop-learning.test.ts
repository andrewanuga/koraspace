import { describe, it, expect } from "vitest";
import { ClosedLoopLearningEngine } from "@/lib/ai/content/learning";
import type { PostPerformanceSummary } from "@/lib/ai/memory/types";

describe("Closed-Loop Learning Engine Suite", () => {
  const samplePosts: PostPerformanceSummary[] = [
    {
      id: "post_1",
      platform: "linkedin",
      content: "Most founders build their stack backwards. Here are 3 tactical systems to scale:\n\n1. Automate\n2. Delegate\n3. Measure\n\nWhat are your thoughts? Comment below.",
      hook: "Most founders build their stack backwards.",
      impressions: 12000,
      likes: 340,
      comments: 65,
      shares: 28,
      engagementRate: 4.8,
      postedAt: "2026-08-01",
    },
    {
      id: "post_2",
      platform: "x",
      content: "How top teams scale without adding headcount: 🧵👇\n\n1/3 Eliminate bottlenecks.\n\nSave this post for later!",
      hook: "How top teams scale without adding headcount",
      impressions: 8000,
      likes: 120,
      comments: 14,
      shares: 10,
      engagementRate: 2.1,
      postedAt: "2026-08-05",
    },
  ];

  it("should extract structural features from post content accurately", () => {
    const features1 = ClosedLoopLearningEngine.extractFeatures(samplePosts[0]);

    expect(features1.hookType).toBe("contrarian"); // "backwards"
    expect(features1.ctaType).toBe("discussion"); // "comment below"
    expect(features1.engagementScore).toBeGreaterThan(50);

    const features2 = ClosedLoopLearningEngine.extractFeatures(samplePosts[1]);

    expect(features2.hookType).toBe("question"); // "how top teams"
    expect(features2.ctaType).toBe("save_bookmark"); // "save this post"
  });

  it("should synthesize winning patterns and top exemplars from workspace post history", () => {
    const patterns = ClosedLoopLearningEngine.deriveWinningPatterns(samplePosts);

    expect(patterns.bestHookType).toBe("contrarian");
    expect(patterns.bestCtaType).toBe("discussion");
    expect(patterns.topExemplars.length).toBeGreaterThan(0);
    expect(patterns.topExemplars[0].id).toBe("post_1");
  });
});
