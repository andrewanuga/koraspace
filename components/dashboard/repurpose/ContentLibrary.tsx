"use client";

import { FileText, Play, Check } from "lucide-react";
import type { ContentLibraryItem } from "@/lib/repurpose/types";

export function ContentLibrary({
  library,
  selected,
  onSelect,
}: {
  library: ContentLibraryItem[];
  selected?: string;
  onSelect: (item: ContentLibraryItem) => void;
}) {
  if (!library || library.length === 0) {
    return (
      <div className="flex min-h-[330px] flex-col items-center justify-center p-10 text-center">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "var(--panel-fill-2)" }}
        >
          <FileText className="h-6 w-6 text-[var(--fg-4)]" />
        </div>
        <p className="font-semibold text-[var(--fg)]">
          Your content library is empty
        </p>
        <p className="mt-1 max-w-xs text-xs text-[var(--fg-4)]">
          Create, schedule, or publish posts across KoraSpace to select them here for instant repurposing.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-6 sm:grid-cols-2">
      {library.map((item) => {
        const active = selected === item.id;
        const preview = item.content || item.caption || "";

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
              active
                ? "border-[var(--kora-pink-border)] bg-[var(--kora-pink-soft)]"
                : "border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--stroke-strong)] hover:bg-[var(--hover)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-md bg-[var(--panel-fill)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--fg-3)]">
                  {item.platform || "Post"}
                </span>
                <p className="mt-2 line-clamp-2 text-xs font-semibold text-[var(--fg)]">
                  {item.title || preview.slice(0, 60) || "Untitled Content"}
                </p>
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[var(--fg-4)]">
                  {preview}
                </p>
              </div>

              {active ? (
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--kora-pink)" }}
                >
                  <Check className="h-3 w-3 text-white" />
                </div>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
