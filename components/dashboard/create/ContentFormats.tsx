"use client";

import { Music2, MessageCircle, Briefcase, FileText, Video } from "lucide-react";

const FORMATS = [
  { title: "TikTok idea",    subtitle: "Script + hook",         icon: Music2 },
  { title: "X thread",       subtitle: "Multi-post thread",      icon: MessageCircle },
  { title: "LinkedIn post",  subtitle: "Professional format",    icon: Briefcase },
  { title: "Blog post",      subtitle: "Long-form article",      icon: FileText },
  { title: "Video script",   subtitle: "Hook to CTA",            icon: Video },
];

interface ContentFormatsProps {
  onSelect?: (format: string) => void;
}

export function ContentFormats({ onSelect }: ContentFormatsProps) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">
          Create another format
        </h3>
        <p className="mt-1 text-[11px] text-[var(--fg-4)]">
          Turn your ideas into content for every platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {FORMATS.map(({ title, subtitle, icon: Icon }) => (
          <button
            key={title}
            onClick={() => onSelect?.(title)}
            className="
              group rounded-xl border border-[var(--stroke)]
              bg-[var(--panel-fill)] p-4 text-left
              transition-all duration-200
              hover:border-[var(--kora-blue-border)]
              hover:bg-[var(--hover)]
            "
          >
            <div
              className="
                mb-5 flex h-9 w-9 items-center justify-center
                rounded-lg bg-[var(--panel-fill-2)] text-[var(--fg-3)]
                transition-colors
                group-hover:bg-[var(--kora-blue-soft)]
                group-hover:text-[var(--kora-blue)]
              "
            >
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-[12px] font-semibold text-[var(--fg)]">{title}</p>
            <p className="mt-1 text-[10px] text-[var(--fg-4)]">{subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
