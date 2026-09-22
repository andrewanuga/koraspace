import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BrandClient } from "./BrandClient";
import type {
  BrandProfile,
  BrandContentPreference,
  BrandWritingStyle,
  BrandMemory,
  BrandKnowledgeItem,
  BrandAIInsight,
} from "@/lib/brand/types";

export default async function BrandPage() {
  const session = await auth();
    const user = session?.user;
  const supabase = await createClient();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { data: contentPreferences },
    { data: writingStyles },
    { data: memories },
    { data: knowledge },
    { data: insights },
  ] = await Promise.all([
    supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("brand_content_preferences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("brand_writing_styles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("brand_memories")
      .select("*")
      .eq("user_id", user.id)
      .order("importance", { ascending: false }),

    supabase
      .from("brand_knowledge_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("brand_ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <BrandClient
      profile={(profile as BrandProfile | null) ?? null}
      contentPreferences={
        (contentPreferences ?? []) as BrandContentPreference[]
      }
      writingStyles={(writingStyles ?? []) as BrandWritingStyle[]}
      memories={(memories ?? []) as BrandMemory[]}
      knowledge={(knowledge ?? []) as BrandKnowledgeItem[]}
      insights={(insights ?? []) as BrandAIInsight[]}
      userId={user.id}
    />
  );
}
