import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { evaluateIncomingMessage } from "@/lib/ai/engine";
import { dispatchReply } from "@/lib/social/dispatch";
import { startBotTask, finishBotTask } from "@/lib/ai/bot_tasks";
import { decryptToken } from "@/lib/security/tokenCrypto";

/**
 * GET /api/social/webhook/[platform]
 * Handles Meta & WhatsApp webhook verification challenges (hub.challenge)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  if (platform === "instagram" || platform === "facebook" || platform === "whatsapp") {
    const mode = req.nextUrl.searchParams.get("hub.mode");
    const token = req.nextUrl.searchParams.get("hub.verify_token");
    const challenge = req.nextUrl.searchParams.get("hub.challenge");

    if (mode === "subscribe" && challenge) {
      return new NextResponse(challenge, { status: 200 });
    }
  }
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/social/webhook/[platform]
 * Ingests incoming social events (DMs, comments, WhatsApp messages) and triggers Ghost Mode AI agents.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const body = await req.json();

  try {
    // ── 1. Telegram Webhooks ────────────────────────────────────────────────
    if (platform === "telegram") {
      if (!body.message || !body.message.text) return NextResponse.json({ ok: true });

      const text = body.message.text;
      const senderId = body.message.from.id.toString();
      const senderName = body.message.from.first_name || "User";

      const accounts = await prisma.socialAccount.findMany({
        where: { platform: "telegram", status: "connected" },
        take: 10,
      });

      for (const account of accounts) {
        if (!account.accessToken) continue;
        const token = decryptToken(account.accessToken);

        const bot = await prisma.socialBot.findFirst({
          where: { userId: account.userId, status: "active" },
        });

        if (bot) {
          const rules = (bot.config as any)?.rules || [];
          const taskId = await startBotTask(
            account.userId,
            bot.id,
            `Ghost Mode: Processing Telegram DM from ${senderName}`,
            `Applying ${rules.filter((r: any) => r.enabled).length} active rules with role: ${bot.role || "general"}`
          );

          const evalRes = await evaluateIncomingMessage(
            text,
            "Telegram",
            senderName,
            rules,
            false,
            bot.role || "general"
          );

          if (evalRes.action === "auto_reply" && evalRes.reply) {
            await dispatchReply({
              platform: "telegram",
              recipientId: senderId,
              token,
              message: evalRes.reply,
            });
          }

          if (evalRes.action !== "ignore" || (evalRes.lead_score ?? 0) >= 70) {
            await prisma.agentAction.create({
              data: {
                botId: bot.id,
                action: evalRes.action,
                comment: evalRes.comment,
                reply: evalRes.reply || null,
                platform: "Telegram",
                reason: "Incoming message rule match",
              },
            });
          }

          if ((evalRes.lead_score ?? 0) >= 70) {
            await prisma.socialInbox.create({
              data: {
                accountId: account.id,
                userId: account.userId,
                platform: "telegram",
                externalMsgId: `telegram_${senderId}_${Date.now()}`,
                senderId,
                senderName,
                content: text,
                category: "lead",
                status: "unread",
                isComment: false,
              },
            });
          }

          if (taskId) await finishBotTask(taskId);
          break;
        }
      }
    }

    // ── 2. WhatsApp Cloud API Webhooks ──────────────────────────────────────
    if (platform === "whatsapp") {
      if (body.object === "whatsapp_business_account") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === "messages" && change.value?.messages) {
              for (const msg of change.value.messages) {
                if (msg.type === "text" && msg.text?.body) {
                  const senderPhone = msg.from;
                  const text = msg.text.body;
                  const contact = change.value.contacts?.find((c: any) => c.wa_id === senderPhone);
                  const senderName = contact?.profile?.name || senderPhone;
                  const phoneId = change.value.metadata?.phone_number_id;

                  await handleWhatsAppInteraction(phoneId, senderPhone, senderName, text, msg.id);
                }
              }
            }
          }
        }
      }
    }

    // ── 3. Instagram & Facebook Meta Webhooks ──────────────────────────────
    if (platform === "instagram" || platform === "facebook") {
      if (body.object === "instagram" || body.object === "page") {
        for (const entry of body.entry || []) {
          const accountId = entry.id;

          // Direct Messages
          if (entry.messaging) {
            for (const msg of entry.messaging) {
              if (msg.message && msg.message.text && !msg.message.is_echo) {
                await handleMetaInteraction(accountId, msg.sender.id, "User", msg.message.text, false, platform);
              }
            }
          }

          // Feed Comments
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === "comments" && change.value) {
                const text = change.value.text;
                const commentId = change.value.id;
                const senderName = change.value.from?.username || change.value.from?.name || "User";

                if (change.value.from?.id === accountId) continue;

                await handleMetaInteraction(
                  accountId,
                  change.value.from?.id,
                  senderName,
                  text,
                  true,
                  platform,
                  commentId
                );
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook Error]:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function handleWhatsAppInteraction(
  phoneId: string | undefined,
  senderPhone: string,
  senderName: string,
  text: string,
  msgId: string
) {
  // Find connected WhatsApp account
  const account = await prisma.socialAccount.findFirst({
    where: {
      platform: "whatsapp",
      status: "connected",
      ...(phoneId ? { externalId: phoneId } : {}),
    },
  });

  if (!account || !account.accessToken) return;
  const token = decryptToken(account.accessToken);

  const bot = await prisma.socialBot.findFirst({
    where: { userId: account.userId, status: "active" },
  });

  if (!bot) return;

  const rules = (bot.config as any)?.rules || [];
  const taskId = await startBotTask(
    account.userId,
    bot.id,
    `Ghost Mode: Processing WhatsApp message from ${senderName}`,
    `Applying ${rules.filter((r: any) => r.enabled).length} active rules with role: ${bot.role || "general"}`
  );

  const evalRes = await evaluateIncomingMessage(
    text,
    "WhatsApp",
    senderName,
    rules,
    false,
    bot.role || "general"
  );

  if (evalRes.action === "auto_reply" && evalRes.reply) {
    await dispatchReply({
      platform: "whatsapp",
      recipientId: senderPhone,
      token,
      message: evalRes.reply,
    });
  }

  if (evalRes.action !== "ignore" || (evalRes.lead_score ?? 0) >= 70) {
    await prisma.agentAction.create({
      data: {
        botId: bot.id,
        action: evalRes.action,
        comment: evalRes.comment,
        reply: evalRes.reply || null,
        platform: "WhatsApp",
        reason: "Incoming WhatsApp message rule match",
      },
    });
  }

  if ((evalRes.lead_score ?? 0) >= 70) {
    await prisma.socialInbox.create({
      data: {
        accountId: account.id,
        userId: account.userId,
        platform: "whatsapp",
        externalMsgId: msgId || `wa_${senderPhone}_${Date.now()}`,
        senderId: senderPhone,
        senderName,
        content: text,
        category: "lead",
        status: "unread",
        isComment: false,
      },
    });
  }

  if (taskId) await finishBotTask(taskId);
}

async function handleMetaInteraction(
  accountId: string,
  senderId: string,
  senderName: string,
  text: string,
  isComment: boolean,
  platform: string,
  commentId?: string
) {
  const account = await prisma.socialAccount.findFirst({
    where: { externalId: accountId },
  });

  if (!account || !account.accessToken) return;
  const token = decryptToken(account.accessToken);

  const bot = await prisma.socialBot.findFirst({
    where: { userId: account.userId, status: "active" },
  });

  if (!bot) return;

  const rules = (bot.config as any)?.rules || [];
  const taskId = await startBotTask(
    account.userId,
    bot.id,
    `Ghost Mode: Processing ${platform} ${isComment ? "comment" : "DM"} from ${senderName}`,
    `Applying ${rules.filter((r: any) => r.enabled).length} active rules`
  );

  const evalRes = await evaluateIncomingMessage(text, platform, senderName, rules, isComment);

  if (evalRes.action === "auto_reply" && evalRes.reply) {
    await dispatchReply({
      platform,
      recipientId: senderId,
      token,
      message: evalRes.reply,
      isComment,
      commentId,
    });
  }

  if (evalRes.action !== "ignore" || (evalRes.lead_score ?? 0) >= 70) {
    await prisma.agentAction.create({
      data: {
        botId: bot.id,
        action: evalRes.action,
        comment: evalRes.comment,
        reply: evalRes.reply || null,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        reason: `Incoming ${isComment ? "comment" : "DM"} rule match`,
      },
    });
  }

  if ((evalRes.lead_score ?? 0) >= 70) {
    await prisma.socialInbox.create({
      data: {
        accountId: account.id,
        userId: account.userId,
        platform,
        externalMsgId: commentId || `${platform}_${senderId}_${Date.now()}`,
        senderId,
        senderName,
        content: text,
        category: "lead",
        status: "unread",
        isComment,
      },
    });
  }

  if (taskId) await finishBotTask(taskId);
}
