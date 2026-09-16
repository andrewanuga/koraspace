import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { RepurposeClient } from "@/components/dashboard/repurpose/RepurposeClient";
import type { ContentLibraryItem, RepurposeProject } from "@/lib/repurpose/types";

export default async function RepurposePage() {
  const session = await auth();
    const user = session?.user;
  const supabase = await createClient();

  if (!user) {
    return null;
  }

  // Fetch recent repurpose projects
  let projects: RepurposeProject[] = [];
  try {
    const { data: projData } = await supabase
      .from("repurpose_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);
    if (projData) projects = projData;
  } catch {
    // Graceful fallback if table is newly created
  }

  // Fetch recent posts for Content Library
  let libraryItems: ContentLibraryItem[] = [];
  try {
    const { data: postsData } = await supabase
      .from("scheduled_posts")
      .select("id, content, platform, scheduled_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);

    if (postsData) {
      libraryItems = postsData.map((p) => ({
        id: p.id,
        title: p.content ? p.content.slice(0, 50) + "..." : "Post",
        content: p.content,
        caption: p.content,
        platform: p.platform || "Post",
        created_at: p.scheduled_at,
      }));
    }
  } catch {
    // Graceful fallback
  }

  // Fetch creator profile brand voice
  let brandVoice: string | null = null;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("brand_voice, niche")
      .eq("id", user.id)
      .single();
    if (profile?.brand_voice) brandVoice = profile.brand_voice;
  } catch {
    // Graceful fallback
  }

  return (
    <RepurposeClient
      initialProjects={projects}
      library={libraryItems}
      brandVoice={brandVoice}
    />
  );
}
