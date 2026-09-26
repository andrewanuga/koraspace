"use client";

import { useRef, useEffect } from "react";
import {
  Sparkles,
  Paperclip,
  ArrowUp,
  X,
  Eye,
  Film,
  FileText,
  ChevronDown,
  Square,
} from "lucide-react";
import type { CreateMode, Attachment } from "./types";

const CREATE_MODES = [
  { id: "post", label: "Post" },
  { id: "caption", label: "Caption" },
  { id: "hashtags", label: "Hashtags" },
  { id: "repurpose", label: "Repurpose" },
  { id: "brand", label: "Brand Voice" },
] as const;

const AGENT_TOOLS = [
  { id: "schedule_post", name: "Schedule Post", desc: "Push a draft to calendar", promptSuffix: "schedule the post we just drafted." },
  { id: "get_viral_formats", name: "Viral Formats", desc: "Get proven hook templates", promptSuffix: "suggest 3 viral formats based on my brand niche." },
  { id: "evaluate_virality", name: "Evaluate Virality", desc: "Score a draft's potential", promptSuffix: "evaluate the virality potential of our last post." },
  { id: "analyze_competitor", name: "Analyze Competitor", desc: "Research competitor strategy", promptSuffix: "analyze the content strategy of [competitor_handle]." },
];

interface ChatInputBoxProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isGenerating: boolean;
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
  attachments: Attachment[];
  onFilesAdded: (files: FileList | null) => void;
  onRemoveAttachment: (id: number) => void;
  showToolPicker: boolean;
  onToggleToolPicker: () => void;
  toolPickerRef: React.RefObject<HTMLDivElement | null>;
  onToolSelect: (toolPrompt: string) => void;
}

export function ChatInputBox({
  prompt,
  onPromptChange,
  onSend,
  onStop,
  isGenerating,
  mode,
  onModeChange,
  attachments,
  onFilesAdded,
  onRemoveAttachment,
  showToolPicker,
  onToggleToolPicker,
  toolPickerRef,
  onToolSelect,
}: ChatInputBoxProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (prompt.trim() || attachments.length > 0)) {
        onSend();
      }
    }
  };

  const hasImage = attachments.some((a) => a.type === "image");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Format Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {CREATE_MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                active
                  ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] border border-[var(--brand-primary-border)]"
                  : "bg-[var(--panel-fill)] text-[var(--fg-3)] border border-[var(--stroke)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
              }`}
            >
              {m.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-1.5 text-[10.5px] text-[var(--fg-4)] shrink-0 pl-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          <span>Kora AI</span>
        </div>
      </div>

      {/* Main Input Card */}
      <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 shadow-xl transition-all focus-within:border-[var(--brand-primary-border)] focus-within:ring-2 focus-within:ring-[var(--brand-primary-soft)]">
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--app-bg)] py-1 pl-1.5 pr-2.5 text-[11px] text-[var(--fg-2)]"
              >
                {a.type === "image" && a.preview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.preview}
                      alt=""
                      className="h-6 w-6 rounded-md object-cover"
                    />
                    <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--success)]">
                      <Eye className="h-1.5 w-1.5 text-white" />
                    </span>
                  </div>
                ) : (
                  <FileText className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                )}
                <span className="max-w-[120px] truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(a.id)}
                  className="text-[var(--fg-4)] hover:text-[var(--danger)] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {hasImage && (
              <span className="flex items-center gap-1 self-center rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[9.5px] font-medium text-[var(--success)]">
                <Eye className="h-2.5 w-2.5" /> Vision Enabled
              </span>
            )}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kora AI to write, brainstorm, evaluate, or improve content... (Shift+Enter for newline)"
          rows={2}
          className="w-full resize-none bg-transparent text-[13.5px] leading-relaxed text-[var(--fg)] placeholder:text-[var(--fg-4)] outline-none"
        />

        {/* Bottom Toolbar */}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--stroke)] pt-2.5">
          <div className="flex items-center gap-1.5">
            {/* Attach button */}
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,.txt,.md,.csv,.json,.pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => onFilesAdded(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Attach media or documents"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--fg-4)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-colors"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolPickerRef}>
              <button
                type="button"
                onClick={onToggleToolPicker}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--panel-fill-2)] px-2.5 text-[11px] font-medium text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
                <span>Agent Tools</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showToolPicker && (
                <div
                  className="absolute bottom-full left-0 z-50 mb-2 w-[240px] overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl"
                  style={{ backdropFilter: "blur(20px)" }}
                >
                  <div className="border-b border-[var(--stroke)] p-2.5">
                    <p className="text-[11.5px] font-semibold text-[var(--fg)]">Agent Actions</p>
                    <p className="text-[9.5px] text-[var(--fg-4)]">Execute autonomous task</p>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto p-1">
                    {AGENT_TOOLS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onToolSelect(`Please execute: ${t.promptSuffix}`)}
                        className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-[var(--hover)] transition-colors"
                      >
                        <span className="text-[11.5px] font-medium text-[var(--fg)]">{t.name}</span>
                        <span className="text-[9.5px] text-[var(--fg-4)]">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10.5px] text-[var(--fg-4)] hidden sm:inline">
              {prompt.length} chars
            </span>

            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--danger)] text-white hover:brightness-110 active:scale-95 transition-all shadow-sm"
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSend}
                disabled={!prompt.trim() && attachments.length === 0}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                style={{ boxShadow: "var(--brand-primary-shadow)" }}
                title="Send message (Enter)"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
