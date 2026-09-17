import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { scanForPromptInjection } from "@/lib/security/enforcement";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.brandProfile.findUnique({
      where: { user_id: user.id }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit profile updates: 20 per minute
    const guard = await checkRequest(request, requestKey(request, user.id), 20);
    if (guard) return guard;

    const body = await request.json();

    // Defend against prompt injection in brand profile fields used in AI context
    for (const field of ["bio", "mission", "voice_summary"] as const) {
      const val = body[field];
      if (typeof val === "string" && val.trim()) {
        const scan = scanForPromptInjection(val);
        if (!scan.safe) {
          return NextResponse.json(
            { error: `Security violation in ${field}: ${scan.reason}` },
            { status: 400 }
          );
        }
      }
    }

    const payload = {
      display_name: body.display_name || null,
      username: body.username || null,
      avatar_url: body.avatar_url || null,
      role: body.role || "Creator",
      niche: body.niche || null,
      target_audience: body.target_audience || null,
      location: body.location || "Remote",
      bio: body.bio || null,
      mission: body.mission || null,
      voice_summary: body.voice_summary || null,
    };

    const data = await prisma.brandProfile.upsert({
      where: { user_id: user.id },
      update: payload,
      create: {
        user_id: user.id,
        ...payload
      }
    });

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
