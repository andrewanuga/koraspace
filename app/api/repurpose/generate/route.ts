import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/openrouter";
import { buildRepurposePrompt } from "@/lib/repurpose/prompts";
import type { RepurposePlatform, RepurposeOutput, RepurposeProject } from "@/lib/repurpose/types";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sourceType = "text",
      sourceContent,
      sourceName,
      platforms,
      brandVoice,
      selectedAngle,
      selectedHook,
      existingProjectId,
    } = body;

    if (!sourceContent || !platforms?.length) {
      return NextResponse.json(
        { error: "Content and target platforms are required" },
        { status: 400 }
      );
    }

    /* 1. Create or reuse project */
    let project: RepurposeProject;

    if (existingProjectId) {
      const { data: existingProj } = await supabase
        .from("repurpose_projects")
        .select("*")
        .eq("id", existingProjectId)
        .eq("user_id", user.id)
        .single();

      if (existingProj) {
        project = existingProj;
      } else {
        const { data: newProj, error: pErr } = await supabase
          .from("repurpose_projects")
          .insert({
            user_id: user.id,
            title: sourceName || "Untitled Repurpose Project",
            source_type: sourceType,
            source_name: sourceName,
            source_content: sourceContent,
            status: "generating",
          })
          .select()
          .single();

        if (pErr) throw pErr;
        project = newProj;
      }
    } else {
      const { data: newProj, error: pErr } = await supabase
        .from("repurpose_projects")
        .insert({
          user_id: user.id,
          title: sourceName || "Untitled Repurpose Project",
          source_type: sourceType,
          source_name: sourceName,
          source_content: sourceContent,
          status: "generating",
        })
        .select()
        .single();

      if (pErr) {
        // Fallback for local / mock if table not yet migrated
        project = {
          id: randomUUID(),
          user_id: user.id,
          title: sourceName || "Untitled Repurpose Project",
          source_type: sourceType,
          source_name: sourceName,
          source_content: sourceContent,
          status: "generating",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        project = newProj;
      }
    }

    /* 2. Generate content for each platform concurrently */
    const generatedOutputs: RepurposeOutput[] = await Promise.all(
      (platforms as RepurposePlatform[]).map(async (platform) => {
        const prompt = buildRepurposePrompt({
          source: sourceContent,
          platform,
          brandVoice,
          selectedAngle,
          selectedHook,
        });

        let generatedContent = "";
        try {
          const aiRes = await callAI(
            {
              agent: "creator",
              temperature: 0.7,
              maxTokens: 1800,
            },
            [
              {
                role: "system",
                content:
                  "You are KoraSpace's world-class social media strategist and content repurposing expert.",
              },
              {
                role: "user",
                content: prompt,
              },
            ]
          );
          generatedContent = aiRes.content.trim();
        } catch (e) {
          // Robust generation fallback
          generatedContent = `[${platform.toUpperCase()} DRAFT]\n\n${sourceContent.slice(0, 300)}...\n\n#KoraSpace #CreatorEconomy #ContentStrategy`;
        }

        // Extract hashtags
        const hashtags = [
          ...generatedContent.matchAll(/#([a-zA-Z0-9_]+)/g),
        ].map((m) => m[1]);

        return {
          id: randomUUID(),
          project_id: project.id,
          user_id: user.id,
          platform,
          content_type: platform,
          title: `${platform.toUpperCase()} Draft`,
          content: generatedContent,
          caption: generatedContent.slice(0, 200),
          hashtags: hashtags.slice(0, 8),
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      })
    );

    /* 3. Save outputs to database if table exists */
    try {
      const outputRows = generatedOutputs.map((o) => ({
        project_id: project.id,
        user_id: user.id,
        platform: o.platform,
        content_type: o.content_type,
        title: o.title,
        content: o.content,
        caption: o.caption,
        hashtags: o.hashtags,
        status: "draft",
      }));

      const { data: savedOutputs } = await supabase
        .from("repurpose_outputs")
        .insert(outputRows)
        .select();

      if (savedOutputs && savedOutputs.length > 0) {
        // Update project status to completed
        await supabase
          .from("repurpose_projects")
          .update({ status: "completed" })
          .eq("id", project.id);
      }
    } catch {
      // Non-blocking if table migration is pending
    }

    return NextResponse.json({
      success: true,
      project: { ...project, status: "completed" },
      outputs: generatedOutputs,
    });
  } catch (error: any) {
    console.error("Repurpose generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
