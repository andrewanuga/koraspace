/**
 * Multi-Dimensional Content Attribution Matrix
 *
 * Correlates multi-variate post features (platform, topic, hook type, CTA style,
 * posting hour/day) with historical engagement outcomes:
 * - Computes multi-variate attribution matrices
 * - Uncovers top-converting combinations (e.g. LinkedIn + Contrarian + Discussion CTA + Tuesday 09:00)
 * - Feeds data-driven priors directly into ContentIntelligenceEngine
 */

export interface AttributedPostRecord {
  id: string;
  platform: "linkedin" | "x" | "instagram" | "youtube" | "telegram";
  topic: string;
  hookType: "contrarian" | "question" | "listicle" | "story" | "direct";
  ctaType: "discussion" | "save_bookmark" | "direct_link" | "none";
  characterLength: number;
  postingDay: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  postingHour: number; // 0 to 23
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface WinningCombinationSummary {
  dimensionKey: string;
  sampleCount: number;
  avgEngagementRate: number;
  compositeScore: number;
}

export class ContentAttributionMatrix {
  /**
   * Computes the highest-performing multivariate combinations across a post dataset.
   */
  public static computeAttributions(posts: AttributedPostRecord[]): {
    bestPlatformAndHook: WinningCombinationSummary[];
    bestTimeOfDay: WinningCombinationSummary[];
    overallWinningCombination: WinningCombinationSummary;
  } {
    if (!posts || posts.length === 0) {
      return {
        bestPlatformAndHook: [],
        bestTimeOfDay: [],
        overallWinningCombination: {
          dimensionKey: "linkedin::contrarian::discussion",
          sampleCount: 0,
          avgEngagementRate: 0,
          compositeScore: 0,
        },
      };
    }

    const platformHookMap = new Map<string, { totalRate: number; count: number }>();
    const timeOfDayMap = new Map<string, { totalRate: number; count: number }>();
    const fullCombinationMap = new Map<string, { totalRate: number; count: number }>();

    for (const post of posts) {
      // 1. Platform + Hook
      const phKey = `${post.platform}::${post.hookType}`;
      const phCur = platformHookMap.get(phKey) || { totalRate: 0, count: 0 };
      platformHookMap.set(phKey, { totalRate: phCur.totalRate + post.engagementRate, count: phCur.count + 1 });

      // 2. Day + Hour block (e.g. tuesday::morning)
      const timeBlock = post.postingHour < 12 ? "morning" : post.postingHour < 17 ? "afternoon" : "evening";
      const todKey = `${post.postingDay}::${timeBlock}`;
      const todCur = timeOfDayMap.get(todKey) || { totalRate: 0, count: 0 };
      timeOfDayMap.set(todKey, { totalRate: todCur.totalRate + post.engagementRate, count: todCur.count + 1 });

      // 3. Full Multivariate Key (platform::hook::cta)
      const fullKey = `${post.platform}::${post.hookType}::${post.ctaType}`;
      const fullCur = fullCombinationMap.get(fullKey) || { totalRate: 0, count: 0 };
      fullCombinationMap.set(fullKey, { totalRate: fullCur.totalRate + post.engagementRate, count: fullCur.count + 1 });
    }

    const formatRanked = (map: Map<string, { totalRate: number; count: number }>): WinningCombinationSummary[] => {
      return Array.from(map.entries())
        .map(([key, val]) => {
          const avgRate = Number((val.totalRate / val.count).toFixed(2));
          return {
            dimensionKey: key,
            sampleCount: val.count,
            avgEngagementRate: avgRate,
            compositeScore: Number((avgRate * Math.log2(val.count + 1)).toFixed(2)),
          };
        })
        .sort((a, b) => b.compositeScore - a.compositeScore);
    };

    const rankedPlatformHook = formatRanked(platformHookMap);
    const rankedTimeOfDay = formatRanked(timeOfDayMap);
    const rankedFull = formatRanked(fullCombinationMap);

    return {
      bestPlatformAndHook: rankedPlatformHook,
      bestTimeOfDay: rankedTimeOfDay,
      overallWinningCombination: rankedFull[0] || {
        dimensionKey: "linkedin::contrarian::discussion",
        sampleCount: 0,
        avgEngagementRate: 0,
        compositeScore: 0,
      },
    };
  }
}
