export type RepurposePlatform =
  | "instagram"
  | "instagram-carousel"
  | "tiktok"
  | "youtube"
  | "x"
  | "linkedin"
  | "blog"
  | "newsletter";

export type RepurposeProjectStatus =
  | "draft"
  | "analyzing"
  | "ready"
  | "generating"
  | "completed"
  | "failed";

export type SourceType = "upload" | "library" | "text" | "url";

export interface ContentAngle {
  id: string;
  title: string;
  hook: string;
  angle_type: "contrarian" | "educational" | "storytelling" | "step_by_step" | "takeaway";
  description: string;
}

export interface ContentAnalysis {
  summary?: string;
  key_points?: string[];
  topics?: string[];
  tone?: string;
  target_audience?: string;
  hooks?: string[];
  angles?: ContentAngle[];
  suggested_platforms?: RepurposePlatform[];
  transcript?: string;
  estimated_duration?: number;
  word_count?: number;
}

export interface RepurposeProject {
  id: string;
  user_id: string;
  workspace_id?: string | null;
  title: string;
  source_type: SourceType;
  source_name?: string | null;
  source_url?: string | null;
  source_content?: string | null;
  source_metadata?: Record<string, unknown>;
  transcript?: string | null;
  transcript_status?: "none" | "processing" | "completed" | "failed";
  status: RepurposeProjectStatus;
  ai_analysis?: ContentAnalysis | null;
  created_at: string;
  updated_at: string;
}

export interface RepurposeOutput {
  id: string;
  project_id: string;
  user_id: string;
  platform: RepurposePlatform;
  content_type: string;
  title?: string | null;
  content?: string | null;
  caption?: string | null;
  hashtags?: string[];
  metadata?: Record<string, unknown>;
  status: "draft" | "saved" | "scheduled" | "published";
  created_at: string;
  updated_at: string;
}

export interface ContentLibraryItem {
  id: string;
  title?: string;
  content?: string;
  caption?: string;
  platform?: string;
  thumbnail_url?: string;
  created_at?: string;
}
