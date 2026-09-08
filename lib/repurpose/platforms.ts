import React from "react";
import {
  Camera,
  Music2,
  Youtube,
  Briefcase,
  Mail,
  FileText,
  MessageSquare,
} from "lucide-react";
import type { RepurposePlatform } from "./types";

export interface PlatformConfig {
  id: RepurposePlatform;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description: string;
  badge?: string;
}

export const REPURPOSE_PLATFORMS: PlatformConfig[] = [
  {
    id: "instagram",
    label: "Instagram",
    subtitle: "Post + Caption",
    icon: Camera,
    description: "A high-performing Instagram post with strong hook & hashtags.",
  },
  {
    id: "instagram-carousel",
    label: "Carousel",
    subtitle: "Swipe format",
    icon: Camera,
    description: "A multi-slide educational carousel (Hook + 5-7 slides + CTA).",
  },
  {
    id: "tiktok",
    label: "TikTok",
    subtitle: "Video Script",
    icon: Music2,
    description: "Short-form video script optimized for 3s hook and viewer retention.",
  },
  {
    id: "youtube",
    label: "YouTube",
    subtitle: "Short / Video",
    icon: Youtube,
    description: "YouTube content concept, opening hook, outline and description.",
  },
  {
    id: "x",
    label: "X (Twitter)",
    subtitle: "Thread",
    icon: MessageSquare,
    description: "A concise viral-style thread with punchy numbered tweets.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    subtitle: "Professional post",
    icon: Briefcase,
    description: "A thought-leadership post formatted for readability and high dwell time.",
  },
  {
    id: "blog",
    label: "Blog",
    subtitle: "Article",
    icon: FileText,
    description: "Long-form SEO-friendly article with headings and takeaways.",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    subtitle: "Email",
    icon: Mail,
    description: "A personal and engaging email newsletter with subject line & preview.",
  },
];
