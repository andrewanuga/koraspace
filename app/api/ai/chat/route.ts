import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { callAI, isConfigured, buildMultimodalContent } from "@/lib/ai/gemini";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { buildBrandContext } from "@/lib/brand/context";
import type { ChatMessage as GeminiChatMessage } from "@/lib/ai/gemini";
import { AI_TOOLS, executeTool } from "@/lib/ai/tools";
import { checkRequest, requestKey } from "@/lib/security/ratelimit";
import { scanForPromptInjection } from "@/lib/security/enforcement";

/* ── Types ────────────────────────────────────────────────────── */

type InputMessage = { role: "user" | "assistant" | "system"; content: string };
type Attachment = {
  type: "image" | "video" | "file";
  name: string;
  mime?: string;
  content?: string;   // extracted text
  dataUrl?: string;   // base64 image data
};

/* ── POST /api/ai/chat ────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) return new Response("Unauthorized", { status: 401 });
    const workspaceId = user.id;

    // Rate limit: 40 requests/min per user.
    const guard = await checkRequest(req, requestKey(req, workspaceId), 40);
    if (guard) return guard;

    const { messages, attachments, stream: wantsStream, chatId: inputChatId } = (await req.json()) as {
      messages: InputMessage[];
      attachments?: Attachment[];
      stream?: boolean;
      chatId?: string;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // Zero-Trust Defense Against Prompt Injection & Evasion
    for (const m of messages) {
      if (m.role === "user" && m.content) {
        const check = scanForPromptInjection(m.content, "Chat User Prompt");
        if (!check.safe) {
          return NextResponse.json(
            { error: "Security Alert: Input flagged for prompt injection or policy evasion attempt.", reason: check.reason },
            { status: 400 }
          );
        }
      }
    }

    // ── Load User Profile & Brand Intelligence ───────────────────
    const [profile, brandContext] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: workspaceId },
        select: {
          full_name: true,
          persona: true,
          niche: true,
          brand_voice: true,
          ai_temperature: true,
        },
      }).catch(() => null),
      buildBrandContext(workspaceId).catch(() => null),
    ]);

    const temperature = Number(profile?.ai_temperature ?? 0.7);
    const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // ── Chat Session Persistence ────────────────────────────────
    let currentChatSessionId = inputChatId;
    if (currentChatSessionId) {
      const existing = await prisma.chatSession.findFirst({
        where: { id: currentChatSessionId, user_id: workspaceId },
      }).catch(() => null);

      if (!existing) {
        currentChatSessionId = undefined;
      }
    }

    if (!currentChatSessionId) {
      const autoTitle = lastUserText
        ? lastUserText.replace(/[\n\r]+/g, " ").trim().slice(0, 42) + (lastUserText.length > 42 ? "..." : "")
        : "New Chat";

      const created = await prisma.chatSession.create({
        data: {
          user_id: workspaceId,
          title: autoTitle,
        },
      }).catch(() => null);

      if (created) currentChatSessionId = created.id;
    }

    // Save user message to database
    if (currentChatSessionId && lastUserText) {
      await prisma.chatMessage.create({
        data: {
          session_id: currentChatSessionId,
          role: "user",
          content: lastUserText,
          attachments: attachments && attachments.length > 0 ? (attachments as any) : undefined,
        },
      }).catch(() => null);

      // Update session timestamp & title if initial
      await prisma.chatSession.updateMany({
        where: { id: currentChatSessionId, user_id: workspaceId },
        data: { updated_at: new Date() },
      }).catch(() => null);
    }

    // ── Build attachment context ────────────────────────────────
    const imageDataUrls: string[] = [];
    const attachmentLines: string[] = [];

    if (attachments?.length) {
      for (const a of attachments) {
        if (a.type === "image" && a.dataUrl) {
          imageDataUrls.push(a.dataUrl);
          attachmentLines.push(`Image: "${a.name}" — use it as the visual anchor for content.`);
        } else if (a.type === "video") {
          attachmentLines.push(`Video: "${a.name}" (${a.mime || "video"}) — this is the asset the post promotes.`);
        } else if (a.type === "file" && a.content) {
          attachmentLines.push(`File "${a.name}" contents:\n${a.content.slice(0, 6000)}`);
        } else {
          attachmentLines.push(`Attachment: "${a.name}".`);
        }
      }
    }

    const attachSummary = attachmentLines.length ? attachmentLines.join("\n") : null;

    const systemPrompt = buildChatSystemPrompt(
      {
        full_name: profile?.full_name,
        persona: profile?.persona,
        niche: profile?.niche,
        brand_voice: profile?.brand_voice || brandContext?.profile?.voice_summary || undefined,
        ai_unfiltered: false,
      },
      null,
      attachSummary,
      brandContext,
    );

    // ── Build conversation array for Gemini ─────────────────────
    const aiMessages: GeminiChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    // ── Inject multimodal images into the last user message ─────
    if (imageDataUrls.length > 0) {
      const lastUserMsg = [...aiMessages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const textContent = typeof lastUserMsg.content === "string"
          ? lastUserMsg.content
          : lastUserMsg.content.map((p) => (p.type === "text" ? p.text : "")).join("");

        const nonImageAttachments = attachmentLines.filter((l) => !l.startsWith("Image:"));
        const fullText = nonImageAttachments.length
          ? `${textContent}\n\n--- Attached Files ---\n${nonImageAttachments.join("\n")}`
          : textContent;

        lastUserMsg.content = buildMultimodalContent(fullText, imageDataUrls);
      }
    } else if (attachmentLines.length > 0) {
      const lastUserMsg = [...aiMessages].reverse().find((m) => m.role === "user");
      if (lastUserMsg && typeof lastUserMsg.content === "string") {
        lastUserMsg.content = `${lastUserMsg.content}\n\n--- Attached Files ---\n${attachmentLines.join("\n")}`;
      }
    }

    // ── Dev mock fallback if no GEMINI_API_KEY ──────────────────
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 600));
      const reply = mockReply(lastUserText, attachments ?? []);
      
      if (currentChatSessionId) {
        await prisma.chatMessage.create({
          data: {
            session_id: currentChatSessionId,
            role: "assistant",
            content: reply,
          },
        }).catch(() => null);
      }

      return NextResponse.json({ reply, model: "Kora AI", chatId: currentChatSessionId });
    }

    // ── Agentic Tool Calling Loop with Kora AI ──────────────────
    let loopCount = 0;
    const MAX_LOOPS = 4;
    let finalContent = "";

    while (loopCount < MAX_LOOPS) {
      loopCount++;
      const res = await callAI(aiMessages, {
        agent: "chat",
        temperature,
        tools: AI_TOOLS,
      });

      if (res.tool_calls && res.tool_calls.length > 0) {
        const toolCall = res.tool_calls[0];
        const name = toolCall.function?.name;
        const args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};
        
        aiMessages.push({ role: "assistant", content: `[Invoking tool: ${name}]` });
        const toolResult = await executeTool(name, args, { workspaceId });
        aiMessages.push({ role: "system", content: `Tool '${name}' response: ${toolResult}` });
      } else {
        finalContent = res.content;
        break;
      }
    }

    if (!finalContent && loopCount >= MAX_LOOPS) {
      finalContent = "I analyzed your request with full brand intelligence. How would you like me to refine this?";
    }

    // Save assistant response to DB
    if (currentChatSessionId && finalContent) {
      await prisma.chatMessage.create({
        data: {
          session_id: currentChatSessionId,
          role: "assistant",
          content: finalContent,
        },
      }).catch(() => null);
    }

    // ── Return Response ──────────────────────────────────────────
    if (!wantsStream) {
      return NextResponse.json({ reply: finalContent, model: "Kora AI", chatId: currentChatSessionId });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = finalContent.split(" ");
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i] + " "));
            i++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 8);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Id": currentChatSessionId || "",
      },
    });

  } catch (err: unknown) {
    console.error("[/api/ai/chat]", err);

    if (!isConfigured()) {
      return NextResponse.json({ reply: mockReply("", []) });
    }

    const errorMessage = err instanceof Error ? err.message : "Kora AI encountered a snag. Please try again.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/* ── Mock fallback for dev without API key ────────────────────── */

function mockReply(lastUser: string, attachments: Attachment[]): string {
  const topic = (lastUser.split("--- Attached")[0]).slice(0, 80).trim() || "your topic";
  const attachNote = attachments.length
    ? [
        "",
        `I've analyzed your ${attachments.map((a) => a.type).join(", ")} (${attachments.map((a) => `"${a.name}"`).join(", ")}).`,
      ].join("\n")
    : "";

  return [
    `Here is a high-converting draft on "${topic}" powered by Kora AI:${attachNote}`,
    "",
    "Most creators post without a proven hook. Here is the scroll-stopping version tailored to your brand:",
    "",
    `"The biggest mistake in ${topic} is doing what worked 3 years ago. Here is the 2026 playbook:"`,
    "",
    "1. Hook: Break the pattern with an unexpected metric or insight",
    "2. Body: 3 tactical, punchy steps your audience can immediately execute",
    "3. CTA: Direct conversion prompt asking for opinion or direct message",
    "",
    "Would you like me to refine the hook, generate 3 A/B test angles, or queue this directly to your calendar?",
  ].join("\n");
}
