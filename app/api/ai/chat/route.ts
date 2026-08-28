import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { learnPersona, getPersonaTone } from "@/lib/social/persona";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { RECOMMENDED_MODELS } from "@/lib/ai/models";
import { ChatAgent, Attachment, InputMessage } from "@/lib/ai/agents/chat";
import type { AgentContext } from "@/lib/ai/core/types";

/* ── POST /api/ai/chat ────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const {
      messages,
      attachments,
      model,
      stream: wantsStream,
      chatId: inputChatId,
    } = (await req.json()) as {
      messages: InputMessage[];
      attachments?: Attachment[];
      model?: string;
      stream?: boolean;
      chatId?: string;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // ── Per-user AI preferences from profile ───────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, persona, niche, brand_voice, ai_model, ai_unfiltered, ai_temperature")
      .eq("id", workspaceId)
      .single();

    const unfiltered = !!profile?.ai_unfiltered;
    const temperature = Number(profile?.ai_temperature ?? 0.7);
    const userModel = profile?.ai_model || undefined;
    const selectedModel = model || userModel || undefined;

    // ── Personalization: learned writing style ──────────────────
    const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const tone = await getPersonaTone(supabase, workspaceId);
    learnPersona(supabase, workspaceId, lastUserText); // fire-and-forget

    // ── Database persistence: save user message ─────────────────
    let activeChatId = inputChatId;
    if (!activeChatId) {
      const title = lastUserText
        ? lastUserText.slice(0, 40) + (lastUserText.length > 40 ? "..." : "")
        : "New Chat";

      const { data: newChat, error: chatErr } = await supabase
        .from("chats")
        .insert({ workspace_id: workspaceId, title })
        .select("id")
        .single();

      if (!chatErr && newChat) activeChatId = newChat.id;
    }

    if (activeChatId) {
      await supabase.from("chat_messages").insert({
        chat_id: activeChatId,
        role: "user",
        content: lastUserText,
        attachments: attachments || [],
      });
    }

    // ── Inject past chat context ────────────────────────────────
    let pastChatsContext = "";
    if (activeChatId) {
      const { data: pastMsgs } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (pastMsgs && pastMsgs.length > 0) {
        pastMsgs.reverse();
        pastChatsContext =
          "\n\n--- Past Conversation Context ---\n" +
          pastMsgs.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      }
    }

    const attachmentLines: string[] = [];
    if (attachments?.length) {
      for (const a of attachments) {
        if (a.type === "image" && a.dataUrl) {
          attachmentLines.push(`Image: "${a.name}" — visual anchor.`);
        } else if (a.type === "video") {
          attachmentLines.push(`Video: "${a.name}" (${a.mime || "video"}).`);
        } else if (a.type === "file" && a.content) {
          attachmentLines.push(`File "${a.name}" contents:\n${a.content.slice(0, 6000)}`);
        }
      }
    }

    const attachSummary = attachmentLines.length ? attachmentLines.join("\n") : null;

    const systemPrompt =
      buildChatSystemPrompt(
        {
          full_name: profile?.full_name,
          persona: profile?.persona,
          niche: profile?.niche,
          brand_voice: profile?.brand_voice,
          ai_unfiltered: unfiltered,
        },
        tone,
        attachSummary
      ) + pastChatsContext;

    const agentContext: AgentContext = {
      userId: workspaceId,
      workspaceId,
      autonomyMode: "assist",
      supabase,
    };

    // ── Execute Unified ChatAgent ───────────────────────────────
    const agentResult = await ChatAgent.execute(
      {
        messages,
        systemPrompt,
        attachments,
        model: selectedModel,
        temperature,
        maxIterations: 4,
      },
      agentContext
    );

    const finalContent = agentResult.data?.content || "No response generated.";
    const finalModel = agentResult.data?.model || selectedModel;

    // Save assistant message to db
    if (activeChatId) {
      await supabase.from("chat_messages").insert({
        chat_id: activeChatId,
        role: "assistant",
        content: finalContent,
        model: finalModel,
      });
    }

    // ── Return Response ──────────────────────────────────────────
    if (!wantsStream) {
      return NextResponse.json({
        reply: finalContent,
        model: finalModel,
        chatId: activeChatId,
        steps: agentResult.data?.steps,
      });
    }

    // Wrap final text in streaming response for client UI
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
        }, 10);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Id": activeChatId || "",
      },
    });
  } catch (err) {
    console.error("[/api/ai/chat]", err);
    const errorMessage = err instanceof Error ? err.message : "The agent hit a snag. Try again.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
