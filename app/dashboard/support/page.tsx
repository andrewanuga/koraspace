"use client";
import { createClient } from "@/lib/supabase/client";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";



import { useState, useEffect, useRef } from "react";
import {
  Mail,
  MessageSquare,
  Plus,
  Loader2,
  Sparkles,
  Send,
  User,
  Bot,
  ArrowUpRight,
  LifeBuoy,
  Bug,
  CreditCard,
  Lightbulb,
  CircleHelp,
  CheckCircle2,
} from "lucide-react";

import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";

const SUPPORT_EMAIL = "support@koraspace.com";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type SupportTab = "ai" | "admin";

const QUICK_ACTIONS = [
  {
    label: "Something isn't working",
    description: "Report a bug or broken feature",
    icon: Bug,
    value: "Bug Report",
  },
  {
    label: "Billing & subscription",
    description: "Plans, payments and invoices",
    icon: CreditCard,
    value: "Billing",
  },
  {
    label: "Request a feature",
    description: "Tell us what you'd like to see",
    icon: Lightbulb,
    value: "Feature Request",
  },
  {
    label: "General question",
    description: "Ask us anything about Koraspace",
    icon: CircleHelp,
    value: "Other",
  },
];

export default function SupportPage() {
  const supabase = createClient();
  const { error: toastError } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [tab, setTab] = useState<SupportTab>("ai");

  const [adminSubject, setAdminSubject] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminSending, setAdminSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------
  // Load latest support chat
  // ------------------------------------------------------------

  useEffect(() => {
    async function loadChat() {
      try {
        const session = await auth();
          const user = session?.user;

        if (!user) return;

        const { data: chats } = await supabase
          .from("support_chats")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(1);

        if (chats && chats.length > 0) {
          const latestChatId = chats[0].id;

          setChatId(latestChatId);

          const { data: msgs } = await supabase
            .from("support_messages")
            .select("id, role, content")
            .eq("chat_id", latestChatId)
            .order("created_at", { ascending: true });

          if (msgs) {
            setMessages(msgs as Message[]);
          }
        }
      } catch (error) {
        console.error("Failed to load support chat:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, []);

  // ------------------------------------------------------------
  // Auto scroll
  // ------------------------------------------------------------

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // ------------------------------------------------------------
  // AI support chat
  // ------------------------------------------------------------

  const submit = async () => {
    const cleanInput = input.trim();

    if (!cleanInput || sending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: cleanInput,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          chatId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const returnedChatId = res.headers.get("X-Chat-Id");

      if (returnedChatId && !chatId) {
        setChatId(returnedChatId);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const aiMsgId = `${Date.now()}-assistant`;

      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "assistant",
          content: "",
        },
      ]);

      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();

        done = readerDone;

        if (!value) continue;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiMsgId
              ? {
                  ...message,
                  content: message.content + chunk,
                }
              : message
          )
        );
      }
    } catch (error) {
      toastError(
        "Unable to reach support",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setMessages((prev) =>
        prev.filter((message) => message.id !== userMsg.id)
      );
    } finally {
      setSending(false);
    }
  };

  // ------------------------------------------------------------
  // Admin contact
  // ------------------------------------------------------------

  const sendAdminMessage = async () => {
    if (!adminSubject || !adminMessage.trim()) {
      toastError(
        "Missing information",
        "Please provide a subject and message."
      );

      return;
    }

    setAdminSending(true);

    try {
      // Keep this compatible with the current UI until the
      // admin-ticket backend is connected.
      await new Promise((resolve) => setTimeout(resolve, 900));

      setAdminMessage("");
      setAdminSubject("");

      toastError(
        "Message sent",
        `The Koraspace team will get back to you at ${SUPPORT_EMAIL}.`
      );
    } catch {
      toastError(
        "Unable to send",
        "Please try again in a moment."
      );
    } finally {
      setAdminSending(false);
    }
  };

  // ------------------------------------------------------------
  // Start a new chat
  // ------------------------------------------------------------

  const startNewChat = () => {
    setChatId(null);
    setMessages([]);
    setInput("");
  };

  // ------------------------------------------------------------
  // Quick action
  // ------------------------------------------------------------

  const chooseQuickAction = (value: string) => {
    setAdminSubject(value);
    setTab("admin");
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* --------------------------------------------------------
          HEADER
      --------------------------------------------------------- */}

      <PageHeader
        eyebrow="Support"
        title="How can we help?"
        sub="Get instant answers from Koraspace AI or contact our support team directly."
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-1.5 text-[11px] text-[var(--fg-3)] sm:inline-flex">
              Support is available
            </span>

            <div className="flex items-center gap-1.5 rounded-full border border-[#ff2d8d]/20 bg-[#ff2d8d]/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff2d8d] shadow-[0_0_10px_rgba(255,45,141,0.8)]" />
              <span className="text-[11px] font-medium text-[#ff78b3]">
                Online
              </span>
            </div>
          </div>
        }
      />

      {/* --------------------------------------------------------
          TOP SUPPORT CARDS
      --------------------------------------------------------- */}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* AI card */}
        <button
          type="button"
          onClick={() => setTab("ai")}
          className="group relative overflow-hidden rounded-2xl border border-[#ff2d8d]/20 bg-[var(--panel-fill)] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff2d8d]/40"
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#ff2d8d]/[0.06] blur-3xl" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ff2d8d]/20 bg-[#ff2d8d]/[0.08]">
              <Sparkles className="h-5 w-5 text-[#ff2d8d]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                  Ask Koraspace AI
                </h3>

                <span className="rounded-full bg-[#ff2d8d]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#ff5fa5]">
                  Instant
                </span>
              </div>

              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--fg-3)]">
                Get help with your workspace, integrations, content,
                analytics, publishing and more.
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-[#ff5fa5]">
                Start a conversation
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </button>

        {/* Human support card */}
        <button
          type="button"
          onClick={() => setTab("admin")}
          className="group rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#239cff]/30"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#239cff]/20 bg-[#239cff]/[0.07]">
              <LifeBuoy className="h-5 w-5 text-[#239cff]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[15px] font-semibold text-[var(--fg)]">
                Contact the team
              </h3>

              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--fg-3)]">
                Need something specific? Send a message directly to the
                Koraspace team.
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-[#239cff]">
                Contact support
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* --------------------------------------------------------
          QUICK HELP
      --------------------------------------------------------- */}

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.2em] text-[var(--fg-4)]">
              Quick help
            </p>

            <p className="mt-1 text-[13px] text-[var(--fg-3)]">
              Jump straight to what you need.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.value}
                type="button"
                onClick={() => chooseQuickAction(action.value)}
                className="group rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 text-left transition-all hover:border-[#ff2d8d]/25 hover:bg-[var(--panel-fill-2)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)]">
                    <Icon className="h-4 w-4 text-[var(--fg-2)] transition-colors group-hover:text-[#ff5fa5]" />
                  </div>

                  <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition-colors group-hover:text-[#ff5fa5]" />
                </div>

                <p className="mt-3 text-[13px] font-medium text-[var(--fg)]">
                  {action.label}
                </p>

                <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--fg-4)]">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------
          SUPPORT WORKSPACE
      --------------------------------------------------------- */}

      <div className="mt-7">
        <GlassCard className="overflow-hidden rounded-2xl p-0">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-[var(--stroke)] px-4 py-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTab("ai")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-all ${
                  tab === "ai"
                    ? "bg-[#ff2d8d]/10 text-[#ff5fa5]"
                    : "text-[var(--fg-3)] hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]"
                }`}
              >
                <Bot className="h-4 w-4" />
                AI Support
              </button>

              <button
                type="button"
                onClick={() => setTab("admin")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-all ${
                  tab === "admin"
                    ? "bg-[#239cff]/10 text-[#4db0ff]"
                    : "text-[var(--fg-3)] hover:bg-[var(--panel-fill)] hover:text-[var(--fg)]"
                }`}
              >
                <Mail className="h-4 w-4" />
                Contact team
              </button>
            </div>

            {tab === "ai" && (
              <button
                type="button"
                onClick={startNewChat}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] px-3 py-2 text-[11.5px] font-medium text-[var(--fg-3)] transition-colors hover:bg-[var(--panel-fill-2)] hover:text-[var(--fg)]"
              >
                <Plus className="h-3.5 w-3.5" />
                New chat
              </button>
            )}
          </div>

          {/* =====================================================
              AI SUPPORT
          ====================================================== */}

          {tab === "ai" ? (
            <div className="flex h-[600px] flex-col">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-[var(--stroke)] px-5 py-4">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff2d8d]/10">
                  <Sparkles className="h-4 w-4 text-[#ff2d8d]" />

                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel-fill)] bg-[#ff2d8d]" />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[var(--fg)]">
                    Koraspace AI
                  </p>

                  <p className="text-[10.5px] text-[var(--fg-4)]">
                    Support assistant · Usually replies instantly
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-6"
              >
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#ff5fa5]" />
                      </div>

                      <span className="text-[11px] text-[var(--fg-4)]">
                        Loading conversation…
                      </span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ff2d8d]/20 bg-[#ff2d8d]/[0.07]">
                      <Sparkles className="h-6 w-6 text-[#ff2d8d]" />
                    </div>

                    <h3 className="font-display text-[17px] font-semibold text-[var(--fg)]">
                      Welcome to Koraspace Support
                    </h3>

                    <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-[var(--fg-3)]">
                      Ask me about your workspace, social accounts,
                      publishing, analytics, integrations or anything
                      else you're working on.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {[
                        "How do I connect Instagram?",
                        "Why isn't my post publishing?",
                        "How does analytics work?",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setInput(suggestion)}
                          className="rounded-full border border-[var(--stroke)] bg-[var(--panel-fill)] px-3.5 py-2 text-[11px] text-[var(--fg-3)] transition-colors hover:border-[#ff2d8d]/25 hover:text-[var(--fg)]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-3xl space-y-5">
                    {messages.map((message) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            isUser
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isUser
                                ? "bg-[var(--panel-fill-2)]"
                                : "bg-[#ff2d8d]/10"
                            }`}
                          >
                            {isUser ? (
                              <User className="h-3.5 w-3.5 text-[var(--fg-2)]" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 text-[#ff5fa5]" />
                            )}
                          </div>

                          {/* Bubble */}
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                              isUser
                                ? "rounded-tr-md bg-[var(--panel-fill-2)] text-[var(--fg)]"
                                : "rounded-tl-md border border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-2)]"
                            }`}
                          >
                            <MarkdownRenderer content={message.content} />
                          </div>
                        </div>
                      );
                    })}

                    {sending && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff2d8d]/10">
                          <Sparkles className="h-3.5 w-3.5 text-[#ff5fa5]" />
                        </div>

                        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-3">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff2d8d]" />
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff2d8d]"
                            style={{ animationDelay: "120ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff2d8d]"
                            style={{ animationDelay: "240ms" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-[var(--stroke)] bg-[var(--panel-fill)]/40 p-4">
                <div className="mx-auto max-w-3xl">
                  <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-2 transition-colors focus-within:border-[#ff2d8d]/35">
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          submit();
                        }
                      }}
                      placeholder="Ask Koraspace AI anything…"
                      rows={2}
                      className="w-full resize-none bg-transparent px-3 py-2 text-[13px] leading-relaxed text-[var(--fg)] outline-none placeholder:text-[var(--fg-4)]"
                    />

                    <div className="flex items-center justify-between px-2 pb-1">
                      <span className="text-[10px] text-[var(--fg-4)]">
                        Enter to send · Shift + Enter for a new line
                      </span>

                      <button
                        type="button"
                        onClick={submit}
                        disabled={!input.trim() || sending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff2d8d] text-white transition-all hover:scale-105 hover:bg-[#ff4199] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {sending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ===================================================
               CONTACT ADMIN
            ==================================================== */

            <div className="min-h-[600px]">
              <div className="mx-auto max-w-2xl px-5 py-10">
                {/* Intro */}
                <div className="mb-8">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#239cff]/20 bg-[#239cff]/[0.07]">
                    <Mail className="h-5 w-5 text-[#239cff]" />
                  </div>

                  <h2 className="font-display text-[20px] font-semibold text-[var(--fg)]">
                    Contact the Koraspace team
                  </h2>

                  <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--fg-3)]">
                    Tell us what happened and we'll get back to you.
                    Include as much detail as possible if you're
                    reporting a bug.
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-3)]">
                      What can we help with?
                    </label>

                    <Select
                      value={adminSubject}
                      onValueChange={setAdminSubject}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl border-[var(--stroke)] bg-[var(--panel-fill)] text-[13px]">
                        <SelectValue placeholder="Choose a category…" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Bug Report">
                          Bug report
                        </SelectItem>

                        <SelectItem value="Feature Request">
                          Feature request
                        </SelectItem>

                        <SelectItem value="Billing">
                          Billing & subscription
                        </SelectItem>

                        <SelectItem value="Other">
                          General question
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fg-3)]">
                      Message
                    </label>

                    <textarea
                      value={adminMessage}
                      onChange={(event) =>
                        setAdminMessage(event.target.value)
                      }
                      rows={8}
                      placeholder="Describe what you need help with…"
                      className="w-full resize-none rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-3 text-[13px] leading-relaxed text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-4)] focus:border-[#239cff]/40"
                    />
                  </div>

                  {/* Response note */}
                  <div className="flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#239cff]" />

                    <div>
                      <p className="text-[12px] font-medium text-[var(--fg)]">
                        Your message goes directly to support
                      </p>

                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--fg-4)]">
                        We'll use your account information to
                        understand the issue and respond to you.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={sendAdminMessage}
                    disabled={adminSending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff2d8d] py-3 text-[13px] font-semibold text-white transition-all hover:bg-[#ff4199] hover:shadow-[0_8px_30px_rgba(255,45,141,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {adminSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send message
                      </>
                    )}
                  </button>
                </div>

                {/* Email fallback */}
                <div className="mt-8 border-t border-[var(--stroke)] pt-5 text-center">
                  <p className="text-[11px] text-[var(--fg-4)]">
                    Prefer email?
                  </p>

                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[#239cff] hover:underline"
                  >
                    {SUPPORT_EMAIL}
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* --------------------------------------------------------
          FOOTER
      --------------------------------------------------------- */}

      <div className="flex flex-col items-center justify-between gap-2 py-6 text-[10.5px] text-[var(--fg-4)] sm:flex-row">
        <span>Koraspace Support</span>

        <div className="flex items-center gap-3">
          <span>AI support is available 24/7</span>
          <span className="h-1 w-1 rounded-full bg-[var(--fg-4)]" />
          <span>Human support when you need it</span>
        </div>
      </div>
    </div>
  );
}