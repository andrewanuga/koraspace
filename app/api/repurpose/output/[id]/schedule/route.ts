import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
      const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scheduledAt, content, platform } = body;

    // Insert into scheduled_posts
    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert({
        user_id: user.id,
        content: content,
        platform: platform || "instagram",
        scheduled_at: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
        status: "scheduled",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert into scheduled_posts:", error);
      return NextResponse.json({ error: error.message || "Failed to schedule post" }, { status: 500 });
    }

    // Update repurpose_output status to scheduled
    await supabase
      .from("repurpose_outputs")
      .update({ status: "scheduled" })
      .eq("id", id)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, post: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
