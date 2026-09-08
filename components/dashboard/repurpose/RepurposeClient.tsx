"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Upload,
  FileText,
  Link2,
  Library,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/dashboard/ui";
import type {
  RepurposePlatform,
  RepurposeProject,
  RepurposeOutput,
  SourceType,
  ContentAnalysis,
  ContentLibraryItem,
} from "@/lib/repurpose/types";
import { PlatformSelector } from "./PlatformSelector";
import { ContentLibrary } from "./ContentLibrary";
import { RepurposeResults } from "./RepurposeResults";
import { RepurposeHistory } from "./RepurposeHistory";
import { AnalysisCard } from "./AnalysisCard";
import { useToast } from "@/components/ui/toast";

export function RepurposeClient({
  initialProjects,
  library,
  brandVoice,
}: {
  initialProjects: RepurposeProject[];
  library: ContentLibraryItem[];
  brandVoice: string | null;
}) {
  const { success, error: toastError } = useToast();

  const [sourceMode, setSourceMode] = useState<SourceType>("upload");
  const [selectedPlatforms, setSelectedPlatforms] = useState<RepurposePlatform[]>([
    "instagram",
    "tiktok",
    "x",
    "linkedin",
  ]);

  const [textContent, setTextContent] = useState("");
  const [url, setUrl] = useState("");
  const [selectedLibraryItem, setSelectedLibraryItem] =
    useState<ContentLibraryItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  /* AI State (Phases 1-4) */
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [selectedHook, setSelectedHook] = useState<string>("");
  const [selectedAngle, setSelectedAngle] = useState<string>("");

  const [generating, setGenerating] = useState(false);
  const [outputs, setOutputs] = useState<RepurposeOutput[]>([]);
  const [projects, setProjects] = useState<RepurposeProject[]>(initialProjects);

  /* Validation */
  const canGenerate = useMemo(() => {
    if (!selectedPlatforms.length) return false;
    if (sourceMode === "text") return textContent.trim().length > 10;
    if (sourceMode === "url") return url.trim().length > 5;
    if (sourceMode === "library") return !!selectedLibraryItem;
    if (sourceMode === "upload") return !!file;
    return false;
  }, [
    sourceMode,
    selectedPlatforms,
    textContent,
    url,
    selectedLibraryItem,
    file,
  ]);

  const togglePlatform = (platform: RepurposePlatform) => {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((p) => p !== platform)
        : [...current, platform]
    );
  };

  /* AI Content Analysis (Phase 3) */
  async function handleAnalyze() {
    let rawContent = "";
    if (sourceMode === "text") rawContent = textContent;
    if (sourceMode === "library" && selectedLibraryItem) {
      rawContent = selectedLibraryItem.content || selectedLibraryItem.caption || "";
    }
    if (sourceMode === "url") rawContent = url;
    if (sourceMode === "upload" && file) rawContent = `File: ${file.name}`;

    if (!rawContent.trim()) {
      toastError("Provide source content first", "Enter text, link or file to analyze.");
      return;
    }

    setAnalyzing(true);
    try {
      if (sourceMode === "url") {
        const formData = new FormData();
        formData.append("url", url);
        const upRes = await fetch("/api/repurpose/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (upData.sourceContent) rawContent = upData.sourceContent;
      }

      const res = await fetch("/api/repurpose/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceContent: rawContent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setAnalysis(data.analysis);
      if (data.analysis.suggested_platforms?.length) {
        setSelectedPlatforms(data.analysis.suggested_platforms);
      }
      success("Analysis complete", "Extracted hooks, summary, and strategic angles.");
    } catch (err: any) {
      toastError("Analysis failed", err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  /* Generate Outputs (Phases 1-4) */
  async function handleGenerate() {
    if (!canGenerate || generating) return;

    try {
      setGenerating(true);
      let sourceContent = "";
      let sourceName = "";

      if (sourceMode === "text") {
        sourceContent = textContent;
        sourceName = textContent.slice(0, 40);
      }

      if (sourceMode === "url") {
        sourceName = url;
        const formData = new FormData();
        formData.append("url", url);
        const uploadRes = await fetch("/api/repurpose/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "URL processing failed");
        sourceContent = uploadData.sourceContent || url;
      }

      if (sourceMode === "library" && selectedLibraryItem) {
        sourceContent =
          selectedLibraryItem.content || selectedLibraryItem.caption || "";
        sourceName = selectedLibraryItem.title || "Library content";
      }

      if (sourceMode === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/repurpose/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
        sourceContent = uploadData.transcript || `Uploaded media: ${file.name}`;
        sourceName = file.name;
      }

      const res = await fetch("/api/repurpose/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: sourceMode,
          sourceContent,
          sourceName,
          platforms: selectedPlatforms,
          brandVoice,
          selectedAngle,
          selectedHook,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setOutputs(data.outputs || []);
      if (data.project) {
        setProjects((prev) => [data.project, ...prev.filter((p) => p.id !== data.project.id)]);
      }

      success("Repurposed successfully!", `Created ${data.outputs?.length || 0} platform formats.`);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } catch (error: any) {
      console.error(error);
      toastError("Generation failed", error instanceof Error ? error.message : "Try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-14">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel-fill)] p-8 md:p-10">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-[45%] opacity-20">
          <div
            className="absolute right-10 top-0 h-72 w-72 rounded-full blur-[140px]"
            style={{ background: "var(--kora-pink)" }}
          />
          <div
            className="absolute bottom-0 right-40 h-64 w-64 rounded-full blur-[140px]"
            style={{ background: "var(--kora-blue)" }}
          />
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "var(--kora-pink-soft)" }}
            >
              <Sparkles className="h-4 w-4" style={{ color: "var(--kora-pink)" }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fg-4)]">
              AI Content Repurposing
            </span>
          </div>

          <h1 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-[var(--fg)] md:text-5xl">
            Turn one idea into{" "}
            <span style={{ color: "var(--kora-pink)" }}>
              a content ecosystem.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--fg-3)] md:text-base">
            Upload a video, choose existing content, paste raw text, or drop a link.
            KoraSpace transforms your core insights into platform-ready posts, carousels, scripts, and threads.
          </p>
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT COLUMN: Source + Analysis + Outputs */}
        <div className="space-y-6">
          <GlassCard className="overflow-hidden">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--stroke)] p-4">
              {[
                { id: "upload", label: "Upload File", icon: Upload },
                { id: "library", label: "Content Library", icon: Library },
                { id: "text", label: "Paste Text", icon: FileText },
                { id: "url", label: "From URL", icon: Link2 },
              ].map((item) => {
                const Icon = item.icon;
                const active = sourceMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSourceMode(item.id as SourceType)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                      active
                        ? "text-white"
                        : "text-[var(--fg-3)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
                    }`}
                    style={
                      active ? { background: "var(--kora-pink)" } : undefined
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* UPLOAD */}
            {sourceMode === "upload" && (
              <div className="p-6">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const selected = e.dataTransfer.files?.[0];
                    if (selected) setFile(selected);
                  }}
                  className={`relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center transition-all ${
                    dragging
                      ? "border-[var(--kora-pink-border)] bg-[var(--kora-pink-soft)]"
                      : "border-[var(--stroke)] bg-[var(--panel-fill-2)]"
                  }`}
                >
                  <input
                    type="file"
                    accept="video/*,audio/*,image/*,.pdf,.txt,.md"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) setFile(selected);
                    }}
                  />

                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "var(--kora-pink-soft)" }}
                  >
                    <Upload className="h-6 w-6" style={{ color: "var(--kora-pink)" }} />
                  </div>

                  {file ? (
                    <>
                      <CheckCircle2 className="mb-2 h-6 w-6 text-[var(--success)]" />
                      <p className="font-semibold text-[var(--fg)]">{file.name}</p>
                      <p className="mt-1 text-xs text-[var(--fg-4)]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB - Ready to repurpose
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-[var(--fg)]">
                        Drop your media or documents here
                      </h3>
                      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--fg-4)]">
                        Video, audio, images, PDFs, notes or existing creative assets.
                      </p>
                      <div className="mt-5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] px-4 py-2 text-xs font-medium text-[var(--fg-3)]">
                        Click to browse files
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* LIBRARY */}
            {sourceMode === "library" && (
              <ContentLibrary
                library={library}
                selected={selectedLibraryItem?.id}
                onSelect={setSelectedLibraryItem}
              />
            )}

            {/* TEXT */}
            {sourceMode === "text" && (
              <div className="p-6">
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your source text here...

Examples:
- A podcast transcript or video script
- A blog article or essay
- Notes from a client call
- A rough stream-of-consciousness idea"
                  className="min-h-[320px] w-full resize-y rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-5 text-sm leading-relaxed text-[var(--fg)] outline-none transition-all placeholder:text-[var(--fg-4)] focus:border-[var(--kora-pink-border)]"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--fg-4)]">
                  <span>KoraSpace extracts viral hooks and transforms format structure.</span>
                  <span>{textContent.length} characters</span>
                </div>
              </div>
            )}

            {/* URL */}
            {sourceMode === "url" && (
              <div className="flex min-h-[320px] items-center p-8">
                <div className="mx-auto w-full max-w-xl text-center">
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "var(--kora-blue-soft)" }}
                  >
                    <Link2 className="h-6 w-6" style={{ color: "var(--kora-blue)" }} />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--fg)]">
                    Repurpose from a public link
                  </h3>
                  <p className="mt-1 text-xs text-[var(--fg-4)]">
                    Paste a URL from your blog, article, YouTube video, or podcast page.
                  </p>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourblog.com/post..."
                    className="mt-6 h-12 w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-4 text-sm text-[var(--fg)] outline-none transition-all placeholder:text-[var(--fg-4)] focus:border-[var(--kora-blue-border)]"
                  />
                </div>
              </div>
            )}
          </GlassCard>

          {/* AI Content Intelligence Card */}
          {analysis && (
            <AnalysisCard
              analysis={analysis}
              selectedHook={selectedHook}
              onSelectHook={setSelectedHook}
              selectedAngle={selectedAngle}
              onSelectAngle={setSelectedAngle}
            />
          )}

          {/* Generated Results */}
          {outputs.length > 0 && (
            <RepurposeResults outputs={outputs} onUpdate={setOutputs} />
          )}
        </div>

        {/* RIGHT COLUMN: Platform Selector + Actions + History */}
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <PlatformSelector
            selected={selectedPlatforms}
            onToggle={togglePlatform}
          />

          <GlassCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" style={{ color: "var(--kora-pink)" }} />
                <h3 className="text-sm font-semibold text-[var(--fg)]">
                  Kora Repurpose AI
                </h3>
              </div>
            </div>

            <p className="mb-5 text-xs leading-relaxed text-[var(--fg-4)]">
              Extract core ideas, identify hooks, and tailor format structures natively for each selected channel.
            </p>

            <div className="space-y-2.5">
              {!analysis && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!canGenerate || analyzing}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--kora-blue-border)] bg-[var(--kora-blue-soft)] text-xs font-semibold text-[var(--kora-blue)] transition-all hover:bg-[var(--kora-blue-soft)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analyzing content...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5" />
                      Analyze and Extract Hooks
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                disabled={!canGenerate || generating}
                onClick={handleGenerate}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: "var(--kora-pink)" }}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating {selectedPlatforms.length} formats...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Repurpose Content
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </GlassCard>

          <RepurposeHistory
            projects={projects}
            onSelectProject={(proj) => {
              if (proj.ai_analysis) setAnalysis(proj.ai_analysis);
              if (proj.source_content) {
                setTextContent(proj.source_content);
                setSourceMode("text");
              }
            }}
          />
        </aside>
      </div>
    </div>
  );
}