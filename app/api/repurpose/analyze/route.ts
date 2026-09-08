import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/openrouter";
import { buildAnalysisPrompt } from "@/lib/repurpose/prompts";
import type { ContentAnalysis } from "@/lib/repurpose/types";

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
    const { sourceContent, projectId } = body;

    if (!sourceContent || typeof sourceContent !== "string") {
      return NextResponse.json(
        { error: "Source content is required for analysis" },
        { status: 400 }
      );
    }

    const prompt = buildAnalysisPrompt(sourceContent.slice(0, 8000));

    let analysis: ContentAnalysis;

    try {
      const aiResponse = await callAI(
        [
          {
            role: "system",
            content: "You are the KoraSpace Content Intelligence engine. Respond ONLY with valid raw JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        {
          agent: "generate",
          temperature: 0.4,
          jsonMode: true,
        }
      );

      const cleaned = aiResponse.content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
      analysis = JSON.parse(cleaned);
    } catch (aiErr) {
      // Fallback structured intelligence
      const words = sourceContent.split(/\s+/).filter(Boolean);
      analysis = {
        summary: sourceContent.slice(0, 200) + "...",
        key_points: [
          "Core strategic insight from the creator source.",
          "Actionable takeaway applicable across social channels.",
          "High-engagement narrative hook.",
        ],
        topics: ["Growth", "Content Strategy", "Creator Economy"],
        tone: "Insightful & Direct",
        target_audience: "Digital Creators & Entrepreneurs",
        hooks: [
          `Stop scrolling if you care about your audience retention.`,
          `The biggest mistake people make with this topic in 2026:`,
          `Here's how to turn one insight into massive engagement:`,
        ],
        angles: [
          {
            id: "angle_contrarian",
            title: "Contrarian / Unpopular Truth",
            hook: "Most people get this completely backwards.",
            angle_type: "contrarian",
            description: "Takes a bold counter-intuitive stand.",
          },
          {
            id: "angle_educational",
            title: "Step-by-Step Breakdown",
            hook: "3 simple rules to master this immediately:",
            angle_type: "educational",
            description: "Translates abstract ideas into tactical steps.",
          },
          {
            id: "angle_story",
            title: "Story Arc & Insight",
            hook: "The moment everything clicked for me:",
            angle_type: "storytelling",
            description: "Personal and engaging narrative hook.",
          },
        ],
        suggested_platforms: ["x", "linkedin", "instagram", "tiktok"],
        word_count: words.length,
      };
    }

    // Update project in Supabase if projectId was provided
    if (projectId) {
      await supabase
        .from("repurpose_projects")
        .update({
          ai_analysis: analysis,
          status: "ready",
        })
        .eq("id", projectId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Repurpose analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
