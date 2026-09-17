import { createClient } from "@/lib/supabase/server";

export interface SocialPost {
  id: string;
  user_id: string;
  platform: string | null;
  content: string | null;
  impressions: number | null;
  engagement: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  created_at: string | null;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string | null;
  platform: string | null;
  status: string | null;
  spend: number | null;
  conversions: number | null;
  roas: number | null;
}

export interface SocialAccount {
  id: string;
  platform: string | null;
  username: string | null;
  status: string | null;
}

export interface DiscoveryTopic {
  id?: string;
  name: string;
  growth: number;
  category: string;
  mentions?: number;
  sentiment?: string;
}

export interface DiscoveryOpportunity {
  id?: string;
  title: string;
  category: string;
  secondary: string;
  growth: string;
  iconName: "bot" | "eye" | "users" | "zap" | "trending";
}

export interface DiscoveryCompetitor {
  name: string;
  content: number;
  engagement: string;
  growth: string;
  logo: string;
}

export interface DiscoveryRecommendation {
  title: string;
  description: string;
  action: string;
}

export interface DiscoveryData {
  topics: DiscoveryTopic[];
  opportunities: DiscoveryOpportunity[];
  competitors: DiscoveryCompetitor[];
  recommendations: DiscoveryRecommendation[];
  listeningScore: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export function extractTopicKeywords(posts: SocialPost[]): [string, number][] {
  const stopWords = new Set([
    "the", "and", "for", "with", "this", "that", "your", "you", "are",
    "from", "into", "how", "what", "why", "about", "have", "has", "will",
    "our", "their", "they", "just", "more", "than", "business", "marketing",
    "content", "brand", "social", "when", "been", "over", "some", "here",
  ]);

  const counts = new Map<string, number>();

  posts.forEach((post) => {
    const words =
      post.content
        ?.toLowerCase()
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[^\w\s#-]/g, "")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length >= 4 &&
            !stopWords.has(word) &&
            !/^\d+$/.test(word)
        ) || [];

    words.forEach((word) => {
      const clean = word.replace(/^#/, "");
      if (!clean) return;
      counts.set(clean, (counts.get(clean) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

export async function getDiscoveryData(
  userId: string,
  posts: SocialPost[],
  campaigns: Campaign[]
): Promise<DiscoveryData> {
  const topicKeywords = extractTopicKeywords(posts);

  const defaultTopics: DiscoveryTopic[] = [
    { name: "AI in Marketing", growth: 245, category: "Technology" },
    { name: "Social Commerce", growth: 189, category: "Commerce" },
    { name: "Sustainable Business", growth: 156, category: "Business" },
    { name: "Creator Economy", growth: 142, category: "Creators" },
    { name: "Short-Form Video", growth: 128, category: "Content" },
  ];

  const topics: DiscoveryTopic[] = defaultTopics.map((item, index) => {
    const internal = topicKeywords[index];
    return {
      ...item,
      name: internal ? `#${internal[0]}` : item.name,
      growth: internal ? Math.min(350, item.growth + internal[1] * 12) : item.growth,
      mentions: internal ? internal[1] * 15 : 120,
    };
  });

  const opportunities: DiscoveryOpportunity[] = [
    {
      title: "AI Tools for Small Businesses",
      category: "High Potential",
      secondary: "Technology",
      growth: "+342%",
      iconName: "bot",
    },
    {
      title: "Behind the Scenes Content",
      category: "High Potential",
      secondary: "Lifestyle",
      growth: "+278%",
      iconName: "eye",
    },
    {
      title: "Customer Success Stories",
      category: "Medium Potential",
      secondary: "B2B",
      growth: "+196%",
      iconName: "users",
    },
    {
      title: "Productivity Tips",
      category: "Medium Potential",
      secondary: "Education",
      growth: "+164%",
      iconName: "zap",
    },
    {
      title: "Industry Predictions",
      category: "Medium Potential",
      secondary: "Business",
      growth: "+142%",
      iconName: "trending",
    },
  ];

  const competitors: DiscoveryCompetitor[] = [
    { name: "Nike", content: 12, engagement: "4.8%", growth: "+12%", logo: "N" },
    { name: "Apple", content: 8, engagement: "3.2%", growth: "+8%", logo: "A" },
    { name: "Adobe", content: 15, engagement: "6.7%", growth: "+18%", logo: "A" },
    { name: "Spotify", content: 10, engagement: "4.1%", growth: "+11%", logo: "S" },
    { name: "Canva", content: 9, engagement: "5.3%", growth: "+14%", logo: "C" },
  ];

  const recommendations: DiscoveryRecommendation[] = [
    {
      title: "Create content around AI tools",
      description:
        "Your target audience is showing increasing engagement in AI automations. Create educational carousels and breakdowns.",
      action: "Create Content",
    },
    {
      title: "Engage with competitor audiences",
      description:
        "Competitor posts in your niche are yielding high engagement. Consider publishing counter-opinion thought leadership.",
      action: "View Opportunities",
    },
    {
      title: "Scale short-form video output",
      description:
        "Short-form video is experiencing accelerated distribution. Repurpose your top-performing ideas into Reels and TikToks.",
      action: "Explore Content Ideas",
    },
  ];

  const totalEngagement = posts.reduce(
    (sum, post) =>
      sum +
      Number(post.engagement || 0) +
      Number(post.likes || 0) +
      Number(post.comments || 0) +
      Number(post.shares || 0),
    0
  );

  const totalImpressions = posts.reduce(
    (sum, post) => sum + Number(post.impressions || 0),
    0
  );

  const avgEngagement = posts.length ? totalEngagement / posts.length : 0;
  const listeningScore = Math.min(
    100,
    Math.round(
      posts.length
        ? (avgEngagement / Math.max(totalImpressions / posts.length, 1)) * 1000
        : 74
    )
  );

  return {
    topics,
    opportunities,
    competitors,
    recommendations,
    listeningScore: listeningScore || 74,
    sentiment: {
      positive: 68,
      neutral: 24,
      negative: 8,
    },
  };
}
