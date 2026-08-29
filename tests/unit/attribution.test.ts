import { describe, it, expect } from "vitest";
import { ContentAttributionMatrix, type AttributedPostRecord } from "@/lib/ai/content/attribution";

describe("Content Attribution Matrix Suite", () => {
  const sampleData: AttributedPostRecord[] = [
    {
      id: "post_101",
      platform: "linkedin",
      topic: "Engineering Culture",
      hookType: "contrarian",
      ctaType: "discussion",
      characterLength: 350,
      postingDay: "tuesday",
      postingHour: 9,
      engagementRate: 5.2,
      likes: 450,
      comments: 72,
      shares: 30,
    },
    {
      id: "post_102",
      platform: "linkedin",
      topic: "Developer Velocity",
      hookType: "contrarian",
      ctaType: "discussion",
      characterLength: 400,
      postingDay: "tuesday",
      postingHour: 10,
      engagementRate: 4.9,
      likes: 380,
      comments: 60,
      shares: 22,
    },
    {
      id: "post_103",
      platform: "x",
      topic: "Tech Trends",
      hookType: "question",
      ctaType: "direct_link",
      characterLength: 200,
      postingDay: "friday",
      postingHour: 15,
      engagementRate: 2.1,
      likes: 90,
      comments: 10,
      shares: 5,
    },
  ];

  it("should calculate highest-performing platform & hook combinations", () => {
    const result = ContentAttributionMatrix.computeAttributions(sampleData);

    expect(result.bestPlatformAndHook.length).toBeGreaterThan(0);
    expect(result.bestPlatformAndHook[0].dimensionKey).toBe("linkedin::contrarian");
    expect(result.bestPlatformAndHook[0].avgEngagementRate).toBeGreaterThan(4.5);
  });

  it("should identify winning time-of-day blocks", () => {
    const result = ContentAttributionMatrix.computeAttributions(sampleData);

    expect(result.bestTimeOfDay.length).toBeGreaterThan(0);
    expect(result.bestTimeOfDay[0].dimensionKey).toBe("tuesday::morning");
  });

  it("should extract the overall winning multivariate combination", () => {
    const result = ContentAttributionMatrix.computeAttributions(sampleData);

    expect(result.overallWinningCombination.dimensionKey).toBe("linkedin::contrarian::discussion");
  });
});
