import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { scanForPromptInjection } from "@/lib/security/enforcement";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit memory creation: 20 per minute
    const guard = await checkRequest(request, requestKey(request, user.id), 20);
    if (guard) return guard;

    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Defend against Brand Brain poisoning / Prompt Injection
    const titleScan = scanForPromptInjection(body.title);
    if (!titleScan.safe) {
      return NextResponse.json(
        { error: `Security violation: ${titleScan.reason || contentScan.reason}` },
        { status: 400 }
      );
    }

    if (body.content) {
      const contentScan = scanForPromptInjection(body.content);
      if (!contentScan.safe) {
        return NextResponse.json(
          { error: `Security violation: ${titleScan.reason || contentScan.reason}` },
          { status: 400 }
        );
      }
    }

    const data = await prisma.brandMemory.create({
      data: {
        user_id: user.id,
        title: body.title.trim(),
        content: body.content?.trim() || null,
        category: body.category || "general",
        enabled: body.enabled !== undefined ? body.enabled : true,
        importance: body.importance || 5,
        source: body.source || "manual",
      }
    });

    return NextResponse.json({ memory: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
