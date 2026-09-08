"use client";

import {
  Lightbulb,
  PenLine,
  Hash,
  RefreshCcw,
  LayoutTemplate,
  CalendarDays,
} from "lucide-react";

const QUICK_PROMPTS = [
  { label: "Content ideas",    prompt: "Give me 10 content ideas based on my niche and audience.",     icon: Lightbulb },
  { label: "Write a caption",  prompt: "Write an engaging social media caption about ",                 icon: PenLine },
  { label: "Generate hashtags",prompt: "Generate relevant hashtags for ",                              icon: Hash },
  { label: "Rewrite content",  prompt: "Rewrite this content to make it more engaging: ",              icon: RefreshCcw },
  { label: "Create a carousel",prompt: "Create a 7-slide Instagram carousel about ",                   icon: LayoutTemplate },
  { label: "Plan my week",     prompt: "Create a one-week content plan for ",                          icon: CalendarDays },
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <section>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-4)]">
        Try starting with
      </p>

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => onSelect(item.prompt)}
              className="
                flex items-center gap-2 rounded-xl
                border border-[var(--stroke)]
                bg-[var(--panel-fill)]
                px-3.5 py-2.5
                text-[11.5px] font-medium text-[var(--fg-3)]
                transition-all duration-200
                hover:border-[var(--kora-pink-border)]
                hover:bg-[var(--kora-pink-soft)]
                hover:text-[var(--kora-pink)]
              "
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
