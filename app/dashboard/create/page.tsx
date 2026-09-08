"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

import { CreateTypeTabs }    from "@/components/dashboard/create/CreateTypeTabs";
import { AiPromptWorkspace } from "@/components/dashboard/create/AiPromptWorkspace";
import { QuickPrompts }      from "@/components/dashboard/create/QuickPrompts";
import { AiDraftCard }       from "@/components/dashboard/create/AiDraftCard";
import { BrandIntelligence } from "@/components/dashboard/create/BrandIntelligence";
import { ContentFormats }    from "@/components/dashboard/create/ContentFormats";

import type { CreateMode, Attachment, ModelOption } from "@/components/dashboard/create/types";

const MAX_MB = 25;

export default function CreatePage() {
  const { error: toastError } = useToast();

  /* ── Mode ── */
  const [mode, setMode] = useState<CreateMode>("post");
  const [prompt, setPrompt] = useState("");

  /* ── Generation state ── */
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [draftHashtags, setDraftHashtags] = useState<string[]>([]);

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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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

  /* ── Generate / send ── */
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setDraft(null);
    setDraftHashtags([]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
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

      if (contentType.includes("text/plain")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            full += decoder.decode(value, { stream: true });
            /* stream into draft live */
            setDraft(full);
          }
        }
        setDraft(full || "No response received.");
      } else {
        const data = await res.json();
        setDraft(data.reply || data.error || "Something went wrong.");
      }

      /* Extract hashtags from the final draft */
      setDraft((prev) => {
        if (!prev) return prev;
        const tags = [...prev.matchAll(/#(\w+)/g)].map((m) => m[1]);
        if (tags.length) setDraftHashtags(tags);
        return prev;
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      toastError("Generation failed", e instanceof Error ? e.message : "Try again.");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [prompt, attachments, selectedModel, isGenerating, toastError]);

  /* ── Quick prompts ── */
  const handleQuickPrompt = (selected: string) => setPrompt(selected);

  /* ── Draft actions ── */
  const handleImprove = () => {
    if (!draft) return;
    setPrompt(`Improve this content and make it more engaging:\n\n${draft}`);
  };
  const handleUse = () => {
    /* Placeholder — connect to scheduler/calendar */
  };

  /* ── Format select ── */
  const handleFormatSelect = (format: string) => {
    setPrompt(`Create a ${format} based on my content niche.`);
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

      {/* ── Page header ── */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--kora-pink)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--kora-pink)]">
              Creator workspace
            </span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[var(--fg)] sm:text-[32px]">
            Create content
          </h1>
          <p className="mt-2 text-[13px] text-[var(--fg-3)]">
            Turn your ideas into content your audience wants to engage with.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--fg-4)]">
          <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
          Kora AI ready
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AiDraftCard
          content={draft ?? undefined}
          hashtags={draftHashtags}
          isGenerating={isGenerating}
          onImprove={handleImprove}
          onEdit={() => setPrompt(draft ?? "")}
          onUse={handleUse}
        />

        <aside>
          <BrandIntelligence />
        </aside>
      </div>

      {/* ── More formats ── */}
      <ContentFormats onSelect={handleFormatSelect} />
    </div>
  );
}
