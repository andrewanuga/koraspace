import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chatSession.findMany({
      where: { user_id: user.id },
      orderBy: { updated_at: "desc" },
      include: {
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { content: true, created_at: true },
        },
      },
    });

    const formatted = chats.map((c) => ({
      id: c.id,
      title: c.title,
      created_at: c.created_at,
      updated_at: c.updated_at,
      lastMessage: c.messages[0]?.content?.slice(0, 80) || "",
    }));

    return NextResponse.json({ chats: formatted });
  } catch (err: unknown) {
    console.error("[/api/ai/chats GET]", err);
    return NextResponse.json({ error: "Failed to fetch chats", chats: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 80) : "New Chat";

    const newChat = await prisma.chatSession.create({
      data: {
        user_id: user.id,
        title,
      },
    });

    return NextResponse.json({ chat: newChat });
  } catch (err: unknown) {
    console.error("[/api/ai/chats POST]", err);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
