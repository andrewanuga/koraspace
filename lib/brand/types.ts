export interface BrandProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  niche: string | null;
  target_audience: string | null;
  location: string | null;
  bio: string | null;
  mission: string | null;
  voice_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandContentPreference {
  id: string;
  user_id: string;
  label: string;
  created_at: string;
}

export interface BrandWritingStyle {
  id: string;
  user_id: string;
  label: string;
  created_at: string;
}

export interface BrandMemory {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string;
  enabled: boolean;
  importance: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface BrandKnowledgeItem {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: "note" | "document" | "link" | "guideline" | string;
  source_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrandAIInsight {
  id: string;
  user_id: string;
  insight_type: "positioning" | "audience" | "content" | "voice" | "strength" | string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BrandContext {
  profile: BrandProfile | null;
  preferences: string[];
  styles: string[];
  memories: Array<{ title: string; content: string | null }>;
  knowledge: Array<{ title: string; content: string | null; type: string }>;
  siteAnalytics?: {
    connected_sites: number;
    top_pages?: Array<{ path: string; views: number }>;
    total_events?: number;
    summary?: string;
  } | null;
}
