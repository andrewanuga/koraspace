import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/openrouter";
import { buildBrandContext } from "@/lib/brand/context";

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
    const action = body.action || "analyze_brand";

    const brandContext = await buildBrandContext(user.id);

    if (action === "analyze_brand") {
      let insights: Array<{
        user_id: string;
        insight_type: string;
        title: string;
        description: string;
        priority: "low" | "medium" | "high";
      }> = [];

      try {
        const prompt = `You are the AI Brand Brain inside KoraSpace, an advanced creator intelligence platform.
Analyze the creator's personal brand details below:
${JSON.stringify(brandContext, null, 2)}

Provide 3 to 6 high-value, actionable strategic brand insights across these categories:
- positioning: Brand positioning opportunities or differentiators
- audience: Target audience resonance and growth angle
- content: Content themes and formats to scale
- voice: Tone, consistency, and style alignment
- strength: Key personal brand superpower

Respond ONLY with a JSON object in this exact schema:
{
  "insights": [
    {
      "insight_type": "positioning" | "audience" | "content" | "voice" | "strength",
      "title": "Short punchy insight title",
      "description": "Clear actionable 1-2 sentence advice",
      "priority": "high" | "medium" | "low"
    }
  ]
}`;

        const aiResponse = await callAI(
          [
            {
              role: "system",
              content:
                "You are KoraSpace's AI Brand Strategist. Always respond with valid raw JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          {
            agent: "generate",
            temperature: 0.5,
            jsonMode: true,
          }
        );

        const cleaned = aiResponse.content
          .trim()
          .replace(/^```json\s*/i, "")
          .replace(/```$/i, "");
        const parsed = JSON.parse(cleaned);

        if (parsed.insights && Array.isArray(parsed.insights)) {
          insights = parsed.insights.map((item: any) => ({
            user_id: user.id,
            insight_type: item.insight_type || "positioning",
            title: item.title || "Brand Strategy Insight",
            description: item.description || "",
            priority: item.priority || "medium",
          }));
        }
      } catch (aiErr) {
        // High quality fallback insights based on available profile info
        const niche = brandContext.profile?.niche || "Content Creation";
        const audience =
          brandContext.profile?.target_audience || "your core audience";

        insights = [
          {
            user_id: user.id,
            insight_type: "positioning",
            title: `Anchor your positioning in ${niche}`,
            description: `Focus your messaging around specific problem-solving workflows that clearly differentiate your expertise for ${audience}.`,
            priority: "high",
          },
          {
            user_id: user.id,
            insight_type: "content",
            title: "Double down on signature frameworks",
            description:
              "Structure your highest performing lessons into recurring multi-part series across your preferred formats.",
            priority: "high",
          },
          {
            user_id: user.id,
            insight_type: "voice",
            title: "Maintain authentic, conversational authority",
            description:
              "Keep paragraphs concise, minimize jargon, and ground technical insights in direct creator experience.",
            priority: "medium",
          },
          {
            user_id: user.id,
            insight_type: "audience",
            title: `Deepen engagement with ${audience}`,
            description:
              "Incorporate open-ended prompts and actionable templates to drive saves and comments.",
            priority: "medium",
          },
        ];
      }

      if (insights.length > 0) {
        await supabase
          .from("brand_ai_insights")
          .delete()
          .eq("user_id", user.id);

        const { data, error } = await supabase
          .from("brand_ai_insights")
          .insert(insights)
          .select();

        if (error) {
          console.error("Error saving brand insights:", error);
        }

        return NextResponse.json({
          success: true,
          insights: data ?? insights,
        });
      }

      return NextResponse.json({ success: true, insights: [] });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Brand AI route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
