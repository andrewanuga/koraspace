"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  PanelLeft,
  PanelRight,
  Plus,
  Target,
  Pencil,
  Check,
  X,
} from "lucide-react";

import { ChatHistorySidebar, type ChatSessionItem } from "@/components/dashboard/create/ChatHistorySidebar";
import { ChatMessageList, type ChatMessageItem } from "@/components/dashboard/create/ChatMessageList";
import { ChatInputBox } from "@/components/dashboard/create/ChatInputBox";
import { ScheduleModal } from "@/components/dashboard/create/ScheduleModal";
import { BrandIntelligence } from "@/components/dashboard/create/BrandIntelligence";

import type { CreateMode, Attachment } from "@/components/dashboard/create/types";
import type { ScoreResponse } from "@/app/api/ai/score/route";

const MAX_MB = 25;

export default function CreatePage() {
  const { error: toastError, success: toastSuccess } = useToast();

  /* ── Sidebar states ── */
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);

  /* ── Chat history & active session ── */
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionTitle, setActiveSessionTitle] = useState("New Chat");
  const [isEditingHeaderTitle, setIsEditingHeaderTitle] = useState(false);
  const [headerTitleInput, setHeaderTitleInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  /* ── Conversation messages ── */
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── Input & format states ── */
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<CreateMode>("post");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const attIdRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  /* ── Tools dropdown ── */
  const [showToolPicker, setShowToolPicker] = useState(false);
  const toolPickerRef = useRef<HTMLDivElement>(null);

  /* ── Schedule modal ── */
  const [scheduleModalContent, setScheduleModalContent] = useState<string | null>(null);
  const [scheduleModalScore, setScheduleModalScore] = useState<ScoreResponse | null>(null);

  /* ── Latest score for Brand Brain card ── */
  const [latestScoreData, setLatestScoreData] = useState<ScoreResponse | null>(null);

  /* ── Load chat sessions on mount ── */
  const loadSessions = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/ai/chats");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.chats || []);
      }
    } catch {
      /* offline */
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /* ── Load chat messages when activeSessionId changes ── */
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/ai/chats/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setActiveSessionTitle(data.chat.title || "Untitled Chat");
          setMessages(
            (data.chat.messages || []).map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              attachments: m.attachments,
              score_data: m.score_data,
              created_at: m.created_at,
            }))
          );
        }
      }
    } catch {
      toastError("Failed to load chat", "Could not fetch conversation history.");
    }
  }, [toastError]);

  const handleSelectSession = (sessionId: string) => {
    if (isGenerating) return;
    setActiveSessionId(sessionId);
    loadSessionMessages(sessionId);
  };

  /* ── New Chat ── */
  const handleNewChat = () => {
    if (isGenerating) return;
    setActiveSessionId(null);
    setActiveSessionTitle("New Chat");
    setMessages([]);
    setPrompt("");
    setAttachments([]);
  };

  /* ── Rename Session ── */
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/ai/chats/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Rename failed");

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      );
      if (activeSessionId === sessionId) {
        setActiveSessionTitle(newTitle);
      }
      toastSuccess("Renamed", "Conversation title updated.");
    } catch {
      toastError("Rename failed", "Unable to rename chat.");
    }
  };

  /* ── Delete Session ── */
  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/ai/chats/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
      toastSuccess("Deleted", "Chat removed from your history.");
    } catch {
      toastError("Delete failed", "Unable to delete conversation.");
    }
  };

  /* ── Close tool picker on outside click ── */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (toolPickerRef.current && !toolPickerRef.current.contains(e.target as Node)) {
        setShowToolPicker(false);
      }
    };
    if (showToolPicker) {
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }
  }, [showToolPicker]);

  /* ── File Upload Helpers ── */
  const readFile = (file: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const readText = (file: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsText(file);
    });

  const onFilesAdded = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        toastError("File too large", `${file.name} exceeds ${MAX_MB}MB.`);
        continue;
      }
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isText = file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);

      const att: Attachment = {
        id: attIdRef.current++,
        type: isImage ? "image" : isVideo ? "video" : "file",
        name: file.name,
        mime: file.type || "application/octet-stream",
      };

      try {
        if (isImage) {
          att.preview = URL.createObjectURL(file);
          att.dataUrl = await readFile(file);
        } else if (isVideo) {
          att.preview = URL.createObjectURL(file);
        } else if (isText) {
          att.content = await readText(file);
        }
      } catch {
        /* ignore */
      }
      setAttachments((prev) => [...prev, att]);
    }
  };

  /* ── Score draft helper ── */
  const evaluateScore = async (text: string): Promise<ScoreResponse | null> => {
    if (!text || text.length < 25) return null;
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, platform: "x" }),
      });
      if (res.ok) {
        const data = await res.json();
        setLatestScoreData(data);
        return data;
      }
    } catch {
      /* silent */
    }
    return null;
  };

  /* ── Send Message ── */
  const handleSend = useCallback(async (customPrompt?: string) => {
    const textToSend = (customPrompt || prompt).trim();
    if ((!textToSend && attachments.length === 0) || isGenerating) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `asst-${Date.now()}`;

    const newUserMessage: ChatMessageItem = {
      id: userMessageId,
      role: "user",
      content: textToSend,
      attachments: [...attachments],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setPrompt("");
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsGenerating(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let modifiedPrompt = textToSend;
    if (mode === "hashtags") {
      modifiedPrompt = `Generate an optimized viral hashtag strategy for: ${textToSend}`;
    } else if (mode === "caption") {
      modifiedPrompt = `Write an engaging, scroll-stopping social caption for: ${textToSend}`;
    } else if (mode === "repurpose") {
      modifiedPrompt = `Repurpose this into a multi-platform bundle (X thread, LinkedIn, Reel script): ${textToSend}`;
    } else if (mode === "brand") {
      modifiedPrompt = `Draft a personalized brand voice style guide for: ${textToSend}`;
    }

    try {
      // Build conversation history to send
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      historyPayload.push({ role: "user", content: modifiedPrompt });

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          attachments: currentAttachments.map((a) => ({
            type: a.type,
            name: a.name,
            mime: a.mime,
            content: a.content,
            dataUrl: a.dataUrl,
          })),
          chatId: activeSessionId || undefined,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || "Generation failed");
      }

      // Check if new chat was created
      const returnedChatId = res.headers.get("X-Chat-Id");
      if (returnedChatId && (!activeSessionId || activeSessionId !== returnedChatId)) {
        setActiveSessionId(returnedChatId);
        loadSessions();
      }

      const contentType = res.headers.get("content-type") || "";
      let fullAssistantText = "";

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      if (contentType.includes("text/plain")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullAssistantText += decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId ? { ...m, content: fullAssistantText } : m
              )
            );
          }
        }
      } else {
        const data = await res.json();
        fullAssistantText = data.reply || "Something went wrong.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: fullAssistantText } : m
          )
        );
      }

      // Automatically evaluate KoraScore for the response
      if (fullAssistantText && fullAssistantText.length > 25) {
        const score = await evaluateScore(fullAssistantText);
        if (score) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId ? { ...m, score_data: score } : m
            )
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      toastError("Generation failed", err instanceof Error ? err.message : "Try again.");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [prompt, attachments, isGenerating, mode, messages, activeSessionId, toastError, loadSessions]);

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setIsGenerating(false);
    }
  };

  /* ── Follow-up quick actions ── */
  const handleImprove = (content: string) => {
    handleSend(`Please improve the hook and enhance engagement for this post:\n\n${content}`);
  };

  const handleGenerateVariations = (content: string) => {
    handleSend(`Generate 3 distinct A/B test angles (Contrarian, Story, and Question-based) for this post:\n\n${content}`);
  };

  const handleToolSelect = (toolPrompt: string) => {
    setShowToolPicker(false);
    handleSend(toolPrompt);
  };

  const handleSaveHeaderTitle = async () => {
    if (!headerTitleInput.trim() || !activeSessionId) {
      setIsEditingHeaderTitle(false);
      return;
    }
    await handleRenameSession(activeSessionId, headerTitleInput.trim());
    setIsEditingHeaderTitle(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--app-bg)] shadow-2xl">
      {/* ── Left Sidebar (Chat History) ── */}
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((v) => !v)}
        isLoading={isLoadingHistory}
      />

      {/* ── Main Chat Area ── */}
      <main className="flex flex-1 flex-col overflow-hidden bg-[var(--panel-fill-2)]">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--stroke)] bg-[var(--panel-fill)] px-4">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
                title="Open Chat History"
              >
                <PanelLeft className="h-4.5 w-4.5" />
              </button>
            )}

            {/* Title / Click to rename */}
            {isEditingHeaderTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={headerTitleInput}
                  onChange={(e) => setHeaderTitleInput(e.target.value)}
                  autoFocus
                  className="px-2 py-1 rounded-md border border-[var(--brand-primary)] bg-[var(--app-bg)] text-[13px] text-[var(--fg)] outline-none"
                />
                <button
                  onClick={handleSaveHeaderTitle}
                  className="p-1 text-[var(--success)] hover:bg-[var(--hover)] rounded"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingHeaderTitle(false)}
                  className="p-1 text-[var(--fg-4)] hover:bg-[var(--hover)] rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-[14px] font-semibold text-[var(--fg)] max-w-[220px] sm:max-w-[360px] truncate">
                  {activeSessionTitle}
                </h1>
                {activeSessionId && (
                  <button
                    onClick={() => {
                      setHeaderTitleInput(activeSessionTitle);
                      setIsEditingHeaderTitle(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--fg-4)] hover:text-[var(--fg)] transition-opacity"
                    title="Rename chat"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Kora AI Engine Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-1 text-[11px] font-medium text-[var(--fg-2)] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
              <span>Kora AI</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              title="New Chat"
              className="flex items-center gap-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Brand Brain Drawer Toggle */}
            <button
              onClick={() => setIsBrandDrawerOpen((v) => !v)}
              title="Brand Intelligence"
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors ${
                isBrandDrawerOpen
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
                  : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Brand Brain</span>
            </button>
          </div>
        </header>

        {/* Conversation Stream */}
        <ChatMessageList
          messages={messages}
          isGenerating={isGenerating}
          onQuickPrompt={(starter) => handleSend(starter)}
          onSchedulePost={(content, score) => {
            setScheduleModalContent(content);
            setScheduleModalScore(score || null);
          }}
          onImprove={handleImprove}
          onGenerateVariations={handleGenerateVariations}
        />

        {/* Bottom Pinned Input Box */}
        <ChatInputBox
          prompt={prompt}
          onPromptChange={setPrompt}
          onSend={() => handleSend()}
          onStop={handleStop}
          isGenerating={isGenerating}
          mode={mode}
          onModeChange={setMode}
          attachments={attachments}
          onFilesAdded={onFilesAdded}
          onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
          showToolPicker={showToolPicker}
          onToggleToolPicker={() => setShowToolPicker((v) => !v)}
          toolPickerRef={toolPickerRef}
          onToolSelect={handleToolSelect}
        />
      </main>

      {/* ── Brand Intelligence Side Drawer ── */}
      {isBrandDrawerOpen && (
        <aside className="w-[320px] shrink-0 border-l border-[var(--stroke)] bg-[var(--panel-fill)] p-4 overflow-y-auto transition-all animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-[var(--fg)]">Brand Intelligence</h3>
            <button
              onClick={() => setIsBrandDrawerOpen(false)}
              className="p-1 rounded-lg text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <BrandIntelligence
            currentScore={latestScoreData?.score}
            scoreBreakdown={latestScoreData}
          />
        </aside>
      )}

      {/* ── Schedule Modal ── */}
      <ScheduleModal
        isOpen={!!scheduleModalContent}
        content={scheduleModalContent || ""}
        scoreData={scheduleModalScore}
        onClose={() => setScheduleModalContent(null)}
        onSuccess={() => {
          toastSuccess("Post Scheduled", "Queued directly to your content calendar.");
        }}
      />
    </div>
  );
}
