"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Calendar,
  Layers,
  WandSparkles,
  User,
  Film,
  FileText,
  AlertCircle,
  Eye,
  ArrowRight,
  Send,
  Loader2,
  X,
  Target,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";
import type { Attachment } from "./types";
import type { ScoreResponse } from "@/app/api/ai/score/route";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Attachment[];
  score_data?: ScoreResponse | null;
  created_at?: string;
}

interface ChatMessageListProps {
  messages: ChatMessageItem[];
  isGenerating: boolean;
  onQuickPrompt: (prompt: string) => void;
  onSchedulePost: (content: string, scoreData?: ScoreResponse | null) => void;
  onImprove: (content: string) => void;
  onGenerateVariations: (content: string) => void;
}

const QUICK_STARTERS = [
  {
    title: "Viral Niche Post",
    desc: "Generate a scroll-stopping post with proven retention hooks.",
    prompt: "Create a viral post tailored to my brand niche and target audience with a high-converting hook.",
  },
  {
    title: "7-Slide Carousel",
    desc: "Step-by-step breakdown formatted for Instagram/LinkedIn.",
    prompt: "Write a high-retention 7-slide educational carousel script about my niche with clear slide breakdowns.",
  },
  {
    title: "A/B Hook Variations",
    desc: "Test 3 contrarian, story, and question hooks.",
    prompt: "Give me 3 distinct viral hook angles (Contrarian, Data-driven, Story) for my latest content idea.",
  },
  {
    title: "Weekly Content Matrix",
    desc: "Structured Monday-to-Sunday content strategy.",
    prompt: "Create a 7-day multi-platform content plan tailored to founders and creators.",
  },
];

export function ChatMessageList({
  messages,
  isGenerating,
  onQuickPrompt,
  onSchedulePost,
  onImprove,
  onGenerateVariations,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleCopy = async (id: string, text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  /* Empty state */
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-4xl mx-auto w-full text-center">
        {/* Glowing Hero Icon */}
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-[var(--brand-primary)] to-[#8b5cf6] p-0.5 shadow-xl shadow-[var(--brand-primary-soft)] animate-pulse">
            <div className="h-full w-full bg-[var(--panel-fill)] rounded-[22px] flex items-center justify-center text-[var(--brand-primary)]">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        </div>

        <h2 className="text-[24px] md:text-[28px] font-bold text-[var(--fg)] tracking-tight">
          What would you like Kora AI to create?
        </h2>
        <p className="mt-2 text-[13.5px] text-[var(--fg-3)] max-w-lg leading-relaxed">
          Craft high-converting posts, threads, carousels, and captions powered by your autonomous Brand Brain.
        </p>

        {/* Quick prompt cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
          {QUICK_STARTERS.map((starter) => (
            <button
              key={starter.title}
              onClick={() => onQuickPrompt(starter.prompt)}
              className="p-4 rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] hover:bg-[var(--hover)] hover:border-[var(--brand-primary-border)] transition-all duration-200 group text-left flex flex-col justify-between"
            >
              <div>
                <p className="text-[13px] font-semibold text-[var(--fg)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {starter.title}
                </p>
                <p className="text-[11.5px] text-[var(--fg-4)] mt-1 line-clamp-2">
                  {starter.desc}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                Start prompt <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full scrollbar-none">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const isCopied = copiedId === msg.id;

        return (
          <div
            key={msg.id}
            className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
          >
            {/* Assistant Avatar */}
            {!isUser && (
              <div className="h-8 w-8 rounded-xl bg-[var(--brand-primary-soft)] border border-[var(--brand-primary-border)] flex items-center justify-center text-[var(--brand-primary)] shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
            )}

            {/* Message Body */}
            <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
              <div
                className={`rounded-2xl p-4 sm:p-5 text-[13px] leading-relaxed transition-all ${
                  isUser
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "bg-[var(--panel-fill)] border border-[var(--stroke)] text-[var(--fg-2)] shadow-sm"
                }`}
              >
                {/* User uploaded attachments if any */}
                {isUser && msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {msg.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1 text-[11px] text-white/90"
                      >
                        {att.type === "image" && att.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={att.preview}
                            alt=""
                            className="h-5 w-5 rounded object-cover"
                          />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        <span className="max-w-[120px] truncate">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content */}
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose-custom">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}

                {/* KoraScore Badge if evaluated on assistant reply */}
                {!isUser && msg.score_data && (
                  <div className="mt-4 pt-3 border-t border-[var(--stroke)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-[var(--success)]" />
                      <span className="font-semibold text-[var(--fg)]">
                        KoraScore: <span className="text-[var(--success)] font-bold">{msg.score_data.score}/100</span>
                      </span>
                    </div>
                    {msg.score_data.bestTime && (
                      <span className="text-[10.5px] text-[var(--fg-3)]">
                        🎯 Best Window: <span className="font-medium text-[var(--fg)]">{msg.score_data.bestTime}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Toolbar on Assistant Messages */}
              {!isUser && (
                <div className="flex flex-wrap items-center gap-1.5 pl-1">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 py-1 text-[11px] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-[var(--success)]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onSchedulePost(msg.content, msg.score_data)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--brand-primary)] hover:brightness-110 transition-colors"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Schedule / Queue</span>
                  </button>

                  <button
                    onClick={() => onImprove(msg.content)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 py-1 text-[11px] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
                  >
                    <WandSparkles className="h-3 w-3 text-[var(--brand-primary)]" />
                    <span>Improve Hook</span>
                  </button>

                  <button
                    onClick={() => onGenerateVariations(msg.content)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-2.5 py-1 text-[11px] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
                  >
                    <Layers className="h-3 w-3" />
                    <span>A/B Variations</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="h-8 w-8 rounded-xl bg-[var(--panel-fill-2)] border border-[var(--stroke)] flex items-center justify-center text-[var(--fg-3)] shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Thinking State */}
      {isGenerating && (
        <div className="flex gap-3.5 justify-start">
          <div className="h-8 w-8 rounded-xl bg-[var(--brand-primary-soft)] border border-[var(--brand-primary-border)] flex items-center justify-center text-[var(--brand-primary)] shrink-0 animate-pulse">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 text-[12.5px] text-[var(--fg-3)] flex items-center gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" />
            <span>Kora AI is analyzing brand intelligence and composing...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
