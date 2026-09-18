import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { decryptToken } from "@/lib/security/tokenCrypto";
import { dispatchReply } from "@/lib/social/dispatch";

/**
 * POST /api/social/send-dm
 *
 * Dispatches direct messages to customers/users across connected social accounts
 * with support for the Meta Human Agent tag (within 7-day window) and AI ghost replies.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { accountId, platform, recipientId, message, isHumanAgent } = body;

    if (!recipientId || !message) {
      return NextResponse.json(
        { error: "recipientId and message are required" },
        { status: 400 }
      );
    }

    // Tenant isolation: verify the account belongs to the authenticated user
    let account = null;
    if (accountId) {
      account = await prisma.socialAccount.findFirst({
        where: { id: accountId, userId: session.user.id },
      });
    } else if (platform) {
      account = await prisma.socialAccount.findFirst({
        where: { platform, userId: session.user.id, status: "connected" },
      });
    }

    if (!account || !account.accessToken) {
      return NextResponse.json(
        { error: "Connected social account not found or lacks credentials" },
        { status: 404 }
      );
    }

    // Ephemeral in-memory decryption
    const decryptedToken = decryptToken(account.accessToken);

    const success = await dispatchReply({
      platform: account.platform,
      recipientId,
      token: decryptedToken,
      message,
      isHumanAgent: Boolean(isHumanAgent),
    });

    if (!success) {
      return NextResponse.json(
        { error: `Failed to dispatch message to ${account.platform}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      platform: account.platform,
      recipientId,
      deliveredAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[send-dm] Error dispatching DM:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
