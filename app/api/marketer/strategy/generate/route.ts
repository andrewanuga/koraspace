import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateStrategy,
  getStrategyContext,
  saveStrategy,
} from "@/lib/marketer/strategy";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const workspaceId =
      typeof body.workspaceId === "string" && body.workspaceId.trim()
        ? body.workspaceId.trim()
        : user.id;

    const context = await getStrategyContext(
      user.id,
      workspaceId
    );

    const strategy = generateStrategy(context);

    const saved = await saveStrategy(
      user.id,
      strategy,
      context.workspaceId
    );

    return NextResponse.json({
      strategy: saved,
      metrics: context.metrics,
      platforms: context.platforms,
    });
  } catch (error) {
    console.error("Strategy generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate strategy.",
      },
      { status: 500 }
    );
  }
}
