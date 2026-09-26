import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const chat = await prisma.chatSession.findFirst({
      where: {
        id,
        user_id: user.id,
      },
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (err: unknown) {
    console.error("[/api/ai/chats/[id] GET]", err);
    return NextResponse.json({ error: "Failed to fetch chat details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) : "";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updated = await prisma.chatSession.updateMany({
      where: {
        id,
        user_id: user.id,
      },
      data: {
        title,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, title });
  } catch (err: unknown) {
    console.error("[/api/ai/chats/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to rename chat" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deleted = await prisma.chatSession.deleteMany({
      where: {
        id,
        user_id: user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Chat deleted" });
  } catch (err: unknown) {
    console.error("[/api/ai/chats/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
