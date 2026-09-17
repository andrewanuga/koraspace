"use client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";



import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";

import { CreateTypeTabs }    from "@/components/dashboard/create/CreateTypeTabs";
import { AiPromptWorkspace } from "@/components/dashboard/create/AiPromptWorkspace";
import { QuickPrompts }      from "@/components/dashboard/create/QuickPrompts";
import { AiDraftCard }       from "@/components/dashboard/create/AiDraftCard";
import { BrandIntelligence } from "@/components/dashboard/create/BrandIntelligence";
import { ContentFormats }    from "@/components/dashboard/create/ContentFormats";

import type { CreateMode, Attachment, ModelOption } from "@/components/dashboard/create/types";
import type { ScoreResponse } from "@/app/api/ai/score/route";

const MAX_MB = 25;

<<<<<<< HEAD
const SUGGESTIONS = [
  "Draft an X thread about our launch",
  "Turn this blog into a LinkedIn post",
  "3 hooks for a Reel on productivity",
  "Reply to a tough customer comment",
  "Write a bio that stops the scroll",
  "5 content ideas for this week",
];

const GREETING: Msg = {
  id: 0,
  role: "assistant",
  content:
    "Hey — I'm your Koraspace agent. Tell me what you're working on and I'll draft it in your voice.\n\nAttach images or documents for context, pick your AI model below, and I'll handle the rest. ✨",
};

/* ── Model display name helper ────────────────────────────────── */

function modelDisplayName(id: string, models: ModelOption[]): string {
  const found = models.find((m) => m.id === id);
  if (found) return found.name;
  const parts = id.split("/");
  return parts[parts.length - 1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Main component ───────────────────────────────────────────── */

=======
>>>>>>> main
export default function CreatePage() {
  const { error: toastError, success: toastSuccess } = useToast();

  /* ── Mode ── */
  const [mode, setMode] = useState<CreateMode>("post");
  const [prompt, setPrompt] = useState("");

  /* ── Generation state ── */
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [draftHashtags, setDraftHashtags] = useState<string[]>([]);
  const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);

  /* ── Models ── */
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showToolPicker, setShowToolPicker] = useState(false);

  /* ── Attachments ── */
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const attIdRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  /* ── Picker refs (for outside-click close) ── */
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const toolPickerRef = useRef<HTMLDivElement>(null);

  /* ── Load user profile & models ── */
  useEffect(() => {
    (async () => {
      try {
        const supabase = await createClient();
  const session = await auth();
          const user = session?.user;
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("ai_model").eq("id", user.id).single();
          if (profile?.ai_model) setSelectedModel(profile.ai_model);
        }
      } catch { /* offline */ }

      try {
        const res = await fetch("/api/ai/models");
        const data = await res.json();
        setModels(
          (data.recommended || []).map((m: ModelOption & Record<string, unknown>) => ({
            id: m.id, name: m.name, provider: m.provider,
            supportsVision: m.supportsVision, tier: m.tier,
          }))
        );
      } catch { /* offline */ }
    })();
  }, []);

  /* ── Close pickers on outside click ── */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) setShowModelPicker(false);
      if (toolPickerRef.current  && !toolPickerRef.current.contains(e.target as Node))  setShowToolPicker(false);
    };
    if (showModelPicker || showToolPicker) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [showModelPicker, showToolPicker]);

  /* ── File helpers ── */
  const readFile = (file: File) =>
    new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
  const readText = (file: File) =>
    new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsText(file); });

  const onFilesAdded = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        toastError("File too large", `${file.name} exceeds ${MAX_MB}MB.`);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isText  = file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);
      const att: Attachment = { id: attIdRef.current++, type: isImage ? "image" : isVideo ? "video" : "file", name: file.name, mime: file.type || "application/octet-stream" };
      try {
        if (isImage)      { att.preview = URL.createObjectURL(file); att.dataUrl = await readFile(file); }
        else if (isVideo) { att.preview = URL.createObjectURL(file); }
        else if (isText)  { att.content = await readText(file); }
      } catch { /* ignore */ }
      setAttachments((prev) => [...prev, att]);
    }
  };

  const currentModelInfo = models.find((m) => m.id === selectedModel);
  const hasVision = currentModelInfo?.supportsVision ?? true;

  /* ── Score content helper ── */
  const evaluateDraftScore = async (text: string) => {
    if (!text || text.length < 20) return;
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, platform: "x" }),
      });
      if (res.ok) {
        const scored = await res.json();
        setScoreData(scored);
      }
    } catch {
      /* silent */
    }
  };

  /* ── Generate / send ── */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setDraft(null);
    setDraftHashtags([]);
    setScoreData(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let promptModifier = prompt;
    if (mode === "hashtags") {
      promptModifier = `Generate an optimized hashtag strategy for: ${prompt}`;
    } else if (mode === "caption") {
      promptModifier = `Write an engaging, scroll-stopping social caption for: ${prompt}`;
    } else if (mode === "repurpose") {
      promptModifier = `Repurpose this content into a multi-platform bundle (X thread, LinkedIn, Reel script): ${prompt}`;
    } else if (mode === "brand") {
      promptModifier = `Draft a personalized brand voice profile and style guide for: ${prompt}`;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptModifier }],
          attachments: attachments.map((a) => ({
            type: a.type, name: a.name, mime: a.mime,
            content: a.content, dataUrl: a.dataUrl,
          })),
          model: selectedModel || undefined,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || "Request failed");
      }

      const contentType = res.headers.get("content-type") || "";
      let fullGeneratedText = "";

      if (contentType.includes("text/plain")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullGeneratedText += decoder.decode(value, { stream: true });
            setDraft(fullGeneratedText);
          }
        }
      } else {
        const data = await res.json();
        fullGeneratedText = data.reply || data.error || "Something went wrong.";
        setDraft(fullGeneratedText);
      }

      /* Extract hashtags from the final draft */
      const tags = [...fullGeneratedText.matchAll(/#(\w+)/g)].map((m) => m[1]);
      if (tags.length) setDraftHashtags(tags);

      // Score the completed draft
      if (fullGeneratedText) {
        evaluateDraftScore(fullGeneratedText);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      toastError("Generation failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [prompt, attachments, selectedModel, isGenerating, mode, toastError]);

  /* ── Generate A/B Variations ── */
  const handleGenerateVariations = async () => {
    if (!draft && !prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || draft,
          type: "variations",
          platform: "x",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate variations");
      setDraft(data.content);
      evaluateDraftScore(data.content);
      toastSuccess("A/B Variations Generated", "Explore 3 distinct angles for your audience.");
    } catch (err: unknown) {
      toastError("Variations failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Quick prompts ── */
  const handleQuickPrompt = (selected: string) => setPrompt(selected);

  /* ── Draft actions ── */
  const handleImprove = () => {
    if (!draft) return;
    setPrompt(`Improve this content and make it more engaging with higher hook retention:\n\n${draft}`);
  };

  /* ── Format select ── */
  const handleFormatSelect = (format: string) => {
    setPrompt(`Create a high-converting ${format} tailored to my brand voice.`);
  };

  /* ── Tool select ── */
  const handleToolSelect = (toolPrompt: string, needsInput: boolean) => {
    if (needsInput) {
      setPrompt((prev) => (prev ? `${prev}\n${toolPrompt}` : toolPrompt));
    } else {
      setPrompt(toolPrompt);
    }
    setShowToolPicker(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-10">

<<<<<<< HEAD
      <div className="flex min-w-0 flex-1 flex-col">
        {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "color-mix(in srgb, var(--sai-indigo) 16%, transparent)" }}
          >
            <Sparkles className="h-5 w-5 text-[var(--sai-indigo)]" />
          </span>
          <div>
            <h1 className="font-display text-[17px] font-semibold text-[var(--fg)]">Create</h1>
            <p className="text-[12px] text-[var(--fg-3)]">Your personal Koraspace agent</p>
=======
      {/* ── Page header ── */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Workspace AI Studio
            </span>
>>>>>>> main
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[var(--fg)] sm:text-[32px]">
            Create content
          </h1>
          <p className="mt-2 text-[13px] text-[var(--fg-3)]">
            Turn your ideas into high-converting content with autonomous Brand Brain intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--fg-4)]">
          <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
          Kora Autonomous Engine ready
        </div>
      </header>

      {/* ── Create type tabs ── */}
      <CreateTypeTabs value={mode} onChange={setMode} />

      {/* ── Prompt workspace ── */}
      <AiPromptWorkspace
        mode={mode}
        prompt={prompt}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        models={models}
        selectedModel={selectedModel}
        onModelChange={(id) => { setSelectedModel(id); setShowModelPicker(false); }}
        showModelPicker={showModelPicker}
        onToggleModelPicker={() => { setShowModelPicker((v) => !v); setShowToolPicker(false); }}
        modelPickerRef={modelPickerRef}
        showToolPicker={showToolPicker}
        onToggleToolPicker={() => { setShowToolPicker((v) => !v); setShowModelPicker(false); }}
        toolPickerRef={toolPickerRef}
        onToolSelect={handleToolSelect}
        attachments={attachments}
        onFilesAdded={onFilesAdded}
        onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        hasVision={hasVision}
      />

      {/* ── Quick prompts ── */}
      <QuickPrompts onSelect={handleQuickPrompt} />

      {/* ── Main content area ── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <AiDraftCard
          content={draft ?? undefined}
          hashtags={draftHashtags}
          isGenerating={isGenerating}
          scoreData={scoreData}
          onImprove={handleImprove}
          onEdit={() => setPrompt(draft ?? "")}
          onGenerateVariations={handleGenerateVariations}
          onScheduleSuccess={() => {
            toastSuccess("Scheduled", "Post scheduled directly into your content calendar.");
          }}
        />

        <aside>
          <BrandIntelligence
            currentScore={scoreData?.score}
            scoreBreakdown={scoreData}
          />
<<<<<<< HEAD
          <button
            onClick={() => fileRef.current?.click()}
            title="Attach image, video, or file"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Model picker */}
          <div className="relative" ref={modelPickerRef}>
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              title="Select AI model"
              className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 text-[11px] text-[var(--fg-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <Bot className="h-3.5 w-3.5 text-[var(--sai-indigo)]" />
              <span className="max-w-[100px] truncate">
                {selectedModel ? modelDisplayName(selectedModel, models) : "Model"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showModelPicker && (
              <div
                className="absolute bottom-full left-0 z-50 mb-2 w-[280px] overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl"
                style={{ backdropFilter: "blur(20px)" }}
              >
                <div className="border-b border-[var(--stroke)] p-3">
                  <p className="text-[12px] font-semibold text-[var(--fg)]">Select Model</p>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">Powered by OpenRouter</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1.5">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelPicker(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--hover)]"
                      style={selectedModel === model.id ? { background: "rgba(99,102,241,0.12)" } : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium text-[var(--fg)]">{model.name}</span>
                          {model.supportsVision && <Eye className="h-2.5 w-2.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-[var(--fg-4)]">{model.provider}</span>
                      </div>
                      {selectedModel === model.id && (
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-[var(--sai-indigo)]" />
                      )}
                    </button>
                  ))}
                  {models.length === 0 && (
                    <div className="flex items-center justify-center gap-2 py-6 text-[12px] text-[var(--fg-3)]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask your agent to draft, refine, or repurpose…"
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] text-[var(--fg)] placeholder:text-[var(--fg-4)] focus:outline-none"
          />

          {/* Send button */}
          <button
            onClick={() => send()}
            disabled={(!input.trim() && attachments.length === 0) || busy}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[var(--fg)] transition-transform hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-center text-[11px] text-[var(--fg-4)]">
          Koraspace can draft and refine — always review before you post.
        </p>
        </div>
=======
        </aside>
>>>>>>> main
      </div>

      {/* ── More formats ── */}
      <ContentFormats onSelect={handleFormatSelect} />
    </div>
  );
}

