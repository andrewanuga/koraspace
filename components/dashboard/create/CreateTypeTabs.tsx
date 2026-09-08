"use client";

import {
  FileText,
  MessageSquareText,
  Hash,
  RefreshCcw,
  Fingerprint,
} from "lucide-react";

import type { CreateMode } from "./types";

const CREATE_TYPES = [
  { id: "post",      label: "Generate post",  icon: FileText },
  { id: "caption",   label: "Caption",         icon: MessageSquareText },
  { id: "hashtags",  label: "Hashtags",         icon: Hash },
  { id: "repurpose", label: "Repurpose",        icon: RefreshCcw },
  { id: "brand",     label: "Brand voice",      icon: Fingerprint },
] as const;

interface CreateTypeTabsProps {
  value: CreateMode;
  onChange: (value: CreateMode) => void;
}

export function CreateTypeTabs({ value, onChange }: CreateTypeTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CREATE_TYPES.map((item) => {
        const Icon = item.icon;
        const active = value === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5
              text-[12px] font-semibold transition-all duration-200
              ${
                active
                  ? "border-[var(--kora-pink-border)] bg-[var(--kora-pink-soft)] text-[var(--kora-pink)]"
                  : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:border-[var(--stroke-strong)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
              }
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
