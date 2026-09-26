"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Loader2,
} from "lucide-react";

export interface ChatSessionItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  lastMessage?: string;
}

interface ChatHistorySidebarProps {
  sessions: ChatSessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  isOpen,
  onToggle,
  isLoading = false,
}: ChatHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.lastMessage && s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartRename = (e: React.MouseEvent, session: ChatSessionItem) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = async (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editTitle.trim()) return;
    await onRenameSession(id, editTitle.trim());
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDeleteSession(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) {
    return (
      <div className="hidden lg:flex flex-col items-center py-4 px-2 border-r border-[var(--stroke)] bg-[var(--panel-fill)] shrink-0">
        <button
          onClick={onToggle}
          title="Expand Chat History"
          className="p-2 rounded-xl text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onNewChat}
          title="New Chat"
          className="mt-3 p-2 rounded-xl bg-[var(--brand-primary)] text-white hover:brightness-110 transition-all"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-full lg:w-[280px] xl:w-[310px] shrink-0 flex flex-col border-r border-[var(--stroke)] bg-[var(--panel-fill)] h-full overflow-hidden transition-all duration-200">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[var(--stroke)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-semibold text-[var(--fg)]">Chat History</span>
        </div>
        <button
          onClick={onToggle}
          title="Collapse Sidebar"
          className="p-1.5 rounded-lg text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-sm"
          style={{ boxShadow: "var(--brand-primary-shadow)" }}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--fg-4)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--app-bg)] text-[11.5px] text-[var(--fg)] placeholder:text-[var(--fg-4)] outline-none focus:border-[var(--brand-primary)]"
          />
        </div>
      </div>

      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-none">
        {isLoading && sessions.length === 0 ? (
          <div className="p-6 text-center text-[12px] text-[var(--fg-4)] flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" />
            Loading history...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-6 text-center text-[11.5px] text-[var(--fg-4)]">
            {searchQuery ? "No matching chats found." : "No previous conversations yet. Start a new chat!"}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            const isEditing = editingId === session.id;
            const isDeleting = deletingId === session.id;

            return (
              <div
                key={session.id}
                onClick={() => !isEditing && onSelectSession(session.id)}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12px] transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)] font-medium border border-[var(--brand-primary-border)]"
                    : "text-[var(--fg-2)] hover:bg-[var(--hover)] hover:text-[var(--fg)] border border-transparent"
                }`}
              >
                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveRename(e, session.id)}
                    className="flex items-center gap-1.5 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded-md border border-[var(--brand-primary)] bg-[var(--app-bg)] text-[11.5px] text-[var(--fg)] outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 rounded text-[var(--success)] hover:bg-[var(--hover)]"
                      title="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRename}
                      className="p-1 rounded text-[var(--fg-4)] hover:text-[var(--danger)] hover:bg-[var(--hover)]"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <MessageSquare
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-[var(--brand-primary)]" : "text-[var(--fg-4)] group-hover:text-[var(--fg-2)]"
                        }`}
                      />
                      <div className="truncate">
                        <p className="truncate text-[12px] leading-tight">{session.title}</p>
                        {session.lastMessage && (
                          <p className="truncate text-[10px] text-[var(--fg-4)] mt-0.5">
                            {session.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => handleStartRename(e, session)}
                        title="Rename chat"
                        className="p-1 rounded text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        disabled={isDeleting}
                        title="Delete chat"
                        className="p-1 rounded text-[var(--fg-4)] hover:text-[var(--danger)] hover:bg-[var(--hover)] transition-colors"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin text-[var(--danger)]" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status */}
      <div className="p-3 border-t border-[var(--stroke)] bg-[var(--panel-fill-2)]">
        <div className="flex items-center justify-between text-[10.5px] text-[var(--fg-4)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            Kora AI Engine Active
          </span>
          <span>{sessions.length} chats</span>
        </div>
      </div>
    </aside>
  );
}
