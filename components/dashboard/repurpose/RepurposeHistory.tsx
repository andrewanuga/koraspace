"use client";

import { Clock, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/dashboard/ui";
import type { RepurposeProject } from "@/lib/repurpose/types";

export function RepurposeHistory({
  projects,
  onSelectProject,
}: {
  projects: RepurposeProject[];
  onSelectProject?: (project: RepurposeProject) => void;
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--fg)]">
            Recent projects
          </h3>
          <p className="mt-1 text-xs text-[var(--fg-4)]">
            Your latest repurposing work.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="py-6 text-center">
          <Clock className="mx-auto mb-2 h-6 w-6 text-[var(--fg-4)]" />
          <p className="text-xs text-[var(--fg-4)]">No projects yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.slice(0, 6).map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject?.(project)}
              className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[var(--hover)]"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--panel-fill-2)" }}
              >
                {project.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                ) : project.status === "failed" ? (
                  <AlertCircle className="h-4 w-4 text-[var(--danger)]" />
                ) : (
                  <Clock className="h-4 w-4 text-[var(--fg-3)]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[var(--fg)] group-hover:text-[var(--kora-pink)]">
                  {project.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--fg-4)]">
                  <span className="capitalize">{project.source_type}</span>
                  <span>�</span>
                  <span>
                    {new Date(project.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <ArrowUpRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
