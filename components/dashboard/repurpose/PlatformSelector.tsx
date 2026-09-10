"use client";

import { Check } from "lucide-react";
import { REPURPOSE_PLATFORMS } from "@/lib/repurpose/platforms";
import type { RepurposePlatform } from "@/lib/repurpose/types";
import { GlassCard } from "@/components/dashboard/ui";

export function PlatformSelector({
  selected,
  onToggle,
}: {
  selected: RepurposePlatform[];
  onToggle: (platform: RepurposePlatform) => void;
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg)]">
            Repurpose into
          </h3>
          <p className="mt-1 text-xs text-[var(--fg-4)]">
            Select one or multiple formats.
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{
            background: "var(--brand-primary-soft)",
            color: "var(--brand-primary)",
          }}
        >
          {selected.length} selected
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {REPURPOSE_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const active = selected.includes(platform.id);

          return (
            <button
              key={platform.id}
              onClick={() => onToggle(platform.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                active
                  ? "border-[var(--brand-primary-border)] bg-[var(--brand-primary-soft)]"
                  : "border-[var(--stroke)] bg-[var(--panel-fill-2)] hover:border-[var(--stroke-strong)] hover:bg-[var(--hover)]"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--panel-fill)]">
                <Icon
                  className="h-4 w-4"
                  style={{
                    color: active ? "var(--brand-primary)" : "var(--fg-3)",
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--fg)]">
                  {platform.label}
                </p>
                <p className="text-[10px] text-[var(--fg-4)]">
                  {platform.subtitle}
                </p>
              </div>

              {active && (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: "var(--brand-primary)" }}
                >
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
