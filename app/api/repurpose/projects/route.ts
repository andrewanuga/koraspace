import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
      const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: projects, error } = await supabase
      .from("repurpose_projects")
      .select("*, repurpose_outputs(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ projects: [] });
    }

    return NextResponse.json({ projects: projects ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
