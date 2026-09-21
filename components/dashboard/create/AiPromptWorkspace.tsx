"use client";

import { useRef } from "react";
import {
  Sparkles,
  Bot,
  ChevronDown,
  Loader2,
  Paperclip,
  X,
  Film,
  FileText,
  Eye,
  Check,
} from "lucide-react";

import type { CreateMode, ModelOption, Attachment } from "./types";

const MODE_PLACEHOLDER: Record<CreateMode, string> = {
  post:      "Describe what you want to create...",
  caption:   "What should this caption be about?",
  hashtags:  "Describe your content or niche...",
  repurpose: "Paste or describe the content you want to repurpose...",
  brand:     "Describe the voice or personality you want to build...",
};

const AGENT_TOOLS = [
  { id: "schedule_post",       name: "Schedule Post",      desc: "Push a draft to calendar",         promptSuffix: "schedule the post we just drafted.",                        needsParams: false },
  { id: "fetch_post_analytics",name: "Check Analytics",    desc: "Analyze recent post metrics",       promptSuffix: "fetch my recent post analytics and summarize them.",          needsParams: false },
  { id: "get_viral_formats",   name: "Viral Formats",      desc: "Get proven hook templates",         promptSuffix: "get viral formats and suggest a draft using one of them.",    needsParams: false },
  { id: "fetch_unread_messages",name: "Check Inbox",       desc: "Read recent DMs/comments",          promptSuffix: "fetch my unread messages from [platform/handle].",            needsParams: true  },
  { id: "evaluate_virality",   name: "Evaluate Virality",  desc: "Score a draft's potential",         promptSuffix: "evaluate the virality potential of this draft.",             needsParams: false },
  { id: "analyze_competitor",  name: "Analyze Competitor", desc: "Research a competitor's strategy",  promptSuffix: "analyze the content strategy of [competitor_handle].",       needsParams: true  },
];

interface AiPromptWorkspaceProps {
  mode: CreateMode;
  prompt: string;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  /* model */
  models: ModelOption[];
  selectedModel: string;
  onModelChange: (id: string) => void;
  showModelPicker: boolean;
  onToggleModelPicker: () => void;
  modelPickerRef: React.RefObject<HTMLDivElement | null>;
  /* tools */
  showToolPicker: boolean;
  onToggleToolPicker: () => void;
  toolPickerRef: React.RefObject<HTMLDivElement | null>;
  onToolSelect: (prompt: string, needsInput: boolean) => void;
  /* attachments */
  attachments: Attachment[];
  onFilesAdded: (files: FileList | null) => void;
  onRemoveAttachment: (id: number) => void;
  hasVision: boolean;
}

function modelDisplayName(id: string, models: ModelOption[]) {
  const found = models.find((m) => m.id === id);
  if (found) return found.name;
  const parts = id.split("/");
  return parts[parts.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AiPromptWorkspace({
  mode,
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  models,
  selectedModel,
  onModelChange,
  showModelPicker,
  onToggleModelPicker,
  modelPickerRef,
  showToolPicker,
  onToggleToolPicker,
  toolPickerRef,
  onToolSelect,
  attachments,
  onFilesAdded,
  onRemoveAttachment,
  hasVision,
}: AiPromptWorkspaceProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hasImageAttachments = attachments.some((a) => a.type === "image");

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--fg)]">Kora AI</p>
            <p className="text-[11px] text-[var(--fg-4)]">Powered by your brand intelligence</p>
          </div>
        </div>
      </div>

      {/* ── Editor ── */}
      <div className="p-5">
        <label htmlFor="kora-prompt" className="mb-3 block text-[14px] font-semibold text-[var(--fg)]">
          What would you like to create?
        </label>

        <textarea
          id="kora-prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value.slice(0, 500))}
          placeholder={MODE_PLACEHOLDER[mode]}
          maxLength={500}
          rows={6}
          className="
            w-full resize-none rounded-xl border border-[var(--stroke)]
            bg-[var(--app-bg)] p-4
            text-[13px] leading-relaxed text-[var(--fg)]
            placeholder:text-[var(--fg-4)]
            outline-none transition-all
            focus:border-[var(--brand-primary-border)]
            focus:ring-2 focus:ring-[var(--brand-primary-soft)]
          "
        />

        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div key={a.id} className="group relative flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] py-1.5 pl-1.5 pr-2.5">
                {a.type === "image" && a.preview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.preview} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    {hasVision && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--success)]">
                        <Eye className="h-2 w-2 text-white" />
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--panel-fill-2)]">
                    {a.type === "video" ? <Film className="h-4 w-4 text-[var(--brand-primary)]" /> : <FileText className="h-4 w-4 text-[var(--brand-primary)]" />}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-[12px] text-[var(--fg-2)]">{a.name}</span>
                <button onClick={() => onRemoveAttachment(a.id)} className="text-[var(--fg-4)] hover:text-[var(--danger)]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {hasImageAttachments && hasVision && (
              <span className="flex items-center gap-1 self-center rounded-full bg-[var(--success-soft)] px-2 py-1 text-[10px] font-medium text-[var(--success)]">
                <Eye className="h-3 w-3" /> AI will analyze images
              </span>
            )}
          </div>
        )}

        {/* Footer bar */}
        <div className="mt-4 flex items-center gap-3">
          {/* File attach */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,.txt,.md,.csv,.json,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => onFilesAdded(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            title="Attach file"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--stroke)] text-[var(--fg-4)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Tools */}
          <div className="relative" ref={toolPickerRef}>
            <button
              onClick={onToggleToolPicker}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 text-[11px] text-[var(--fg-3)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--fg)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span className="hidden sm:inline">Tools</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showToolPicker && (
              <div className="absolute bottom-full left-0 z-50 mb-2 w-[220px] overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl" style={{ backdropFilter: "blur(20px)" }}>
                <div className="border-b border-[var(--stroke)] p-3">
                  <p className="text-[12px] font-semibold text-[var(--fg)]">Agent Tools</p>
                  <p className="mt-0.5 text-[10px] text-[var(--fg-4)]">Force the AI to act</p>
                </div>
                <div className="max-h-[280px] overflow-y-auto p-1.5">
                  {AGENT_TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => onToolSelect(`Please use your ${tool.id} tool to ${tool.promptSuffix}`, tool.needsParams)}
                      className="group flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--hover)]"
                    >
                      <span className="text-[12px] font-medium text-[var(--fg)] transition-colors group-hover:text-[var(--brand-primary)]">{tool.name}</span>
                      <span className="text-[10px] text-[var(--fg-4)]">{tool.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="text-[11px] text-[var(--fg-4)]">{prompt.length} / 500</span>

          <button
            onClick={onGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="
              ml-auto flex items-center gap-2 rounded-xl
              bg-[var(--brand-primary)] px-5 py-2.5
              text-[12px] font-semibold text-white
              transition-all duration-200
              hover:brightness-110 active:scale-[0.98]
              disabled:cursor-not-allowed disabled:opacity-40
            "
            style={{
              boxShadow: "var(--brand-primary-shadow)",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
