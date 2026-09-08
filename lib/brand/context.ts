import { createClient } from "@/lib/supabase/server";
import type {
  BrandProfile,
  BrandContentPreference,
  BrandWritingStyle,
  BrandMemory,
  BrandKnowledgeItem,
  BrandContext,
} from "./types";

/**
 * Builds unified brand context for AI agents across KoraSpace
 * (Create, Ideas, Repurpose, Ghost, Chat).
 */
export async function buildBrandContext(userId: string): Promise<BrandContext> {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: preferences },
    { data: styles },
    { data: memories },
    { data: knowledge },
  ] = await Promise.all([
    supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("brand_content_preferences")
      .select("label")
      .eq("user_id", userId),

    supabase
      .from("brand_writing_styles")
      .select("label")
      .eq("user_id", userId),

    supabase
      .from("brand_memories")
      .select("title, content")
      .eq("user_id", userId)
      .eq("enabled", true)
      .order("importance", { ascending: false }),

    supabase
      .from("brand_knowledge_items")
      .select("title, content, type")
      .eq("user_id", userId)
      .limit(30),
  ]);

  return {
    profile: (profile as BrandProfile | null) ?? null,
    preferences: (preferences?.map((p) => p.label) ?? []) as string[],
    styles: (styles?.map((s) => s.label) ?? []) as string[],
    memories: (memories ?? []) as Array<{ title: string; content: string | null }>,
    knowledge: (knowledge ?? []) as Array<{
      title: string;
      content: string | null;
      type: string;
    }>,
  };
}
