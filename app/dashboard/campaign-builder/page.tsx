"use client";

import { useState } from "react";
import {
  Link2,
  Sparkles,
  Send,
  AtSign,
  Building2,
  Camera,
  LayoutTemplate,
  Layers,
  Copy,
  Check,
  Calendar,
  Share2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { PageHeader, GlassCard, PrimaryButton } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";
import { MarkdownRenderer } from "@/components/dashboard/MarkdownRenderer";
import Link from "next/link";

interface CampaignData {
  twitter: string[];
  linkedin: string;
  instagram: string;
}

export default function CampaignBuilderPage() {
  const { error: toastError, success: toastSuccess } = useToast();
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);

  const handleGenerate = async () => {
    if (!url.trim() && !topic.trim()) {
      toastError("Input required", "Please provide a URL or topic description to generate a campaign.");
      return;
    }

    setIsGenerating(true);
    try {
      const promptText = `Act as an elite multi-platform growth marketer for Koraspace. Generate a cohesive, high-converting social media campaign based on:
${url ? `Source URL: ${url}` : ""}
${topic ? `Topic / Goal: ${topic}` : ""}
Tone: ${tone}

Output format strictly as three distinct sections:
### TWITTER_THREAD
1/ [First tweet hook]
2/ [Second tweet body/proof]
3/ [Third tweet call to action]

### LINKEDIN_POST
[Complete high-authority LinkedIn post with headline, spaced linebreaks, bullet takeaways, and call to action]

### INSTAGRAM_POST
[High-engagement Instagram caption with storytelling hook, value points, call to action, and 8 relevant hashtags]`;

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          platform: "all",
          type: "thread",
          tone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate campaign");
      }

      const data = await res.json();
      const rawText = data.text || data.content || "";

      // Parse output into 3 platform components
      let twitterTweets: string[] = [];
      let linkedinContent = "";
      let instagramContent = "";

      if (rawText.includes("### TWITTER_THREAD") && rawText.includes("### LINKEDIN_POST")) {
        const parts = rawText.split("### ");
        parts.forEach((p: string) => {
          if (p.startsWith("TWITTER_THREAD")) {
            const body = p.replace("TWITTER_THREAD", "").trim();
            twitterTweets = body
              .split(/\n(?=\d+\/)/)
              .map((t: string) => t.trim())
              .filter(Boolean);
            if (twitterTweets.length === 0) {
              twitterTweets = body.split("\n\n").filter(Boolean);
            }
          } else if (p.startsWith("LINKEDIN_POST")) {
            linkedinContent = p.replace("LINKEDIN_POST", "").trim();
          } else if (p.startsWith("INSTAGRAM_POST")) {
            instagramContent = p.replace("INSTAGRAM_POST", "").trim();
          }
        });
      }

      // Fallbacks if parsing was loose
      if (twitterTweets.length === 0) {
        twitterTweets = [
          `1/ We just transformed how you execute campaigns on ${topic || "this topic"}.`,
          `2/ By orchestrating real-time AI context with cross-channel distribution, results multiply exponentially.`,
          `3/ Ready to scale with Koraspace? Discover more today.`,
        ];
      }
      if (!linkedinContent) {
        linkedinContent = rawText.slice(0, 500) || `Excited to announce our latest strategic focus around ${topic || "modern growth"}. Seamless cross-platform execution changes everything.\n\nDiscover more on Koraspace.`;
      }
      if (!instagramContent) {
        instagramContent = `The future of omnichannel social orchestration is here. 🚀 Scaling ${topic || "your brand"} has never been easier.\n\nLink in bio for full access! #growth #koraspace #marketing`;
      }

      setCampaign({
        twitter: twitterTweets,
        linkedin: linkedinContent,
        instagram: instagramContent,
      });

      toastSuccess("Campaign Generated", "Cross-platform campaign assets are ready for review.");
    } catch (e: any) {
      toastError("Generation failed", e?.message || "Please check your network connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toastSuccess("Copied to clipboard");
    setTimeout(() => {
      setCopiedKey((cur) => (cur === key ? null : cur));
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <PageHeader
        eyebrow="AI Orchestration Studio"
        title="Omnichannel Campaign Builder"
        sub="Provide a source URL or core topic. Our multi-agent AI engine generates a synchronized, high-converting campaign across X, LinkedIn, and Instagram in seconds."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-display text-[15px] font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Source Material
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Source URL / Article / Landing Page
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourbrand.com/new-product"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.02] pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Topic / Strategic Angle / Offer
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Announcing our new AI-assisted CRM pipeline that automatically detects high-intent leads..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Brand Voice / Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#12131a] px-3 text-xs text-white font-medium focus:border-blue-500 outline-none"
                >
                  <option value="Professional">Professional &amp; Authoritative</option>
                  <option value="Casual">Casual &amp; Authentic</option>
                  <option value="Inspirational">Inspirational &amp; Visionary</option>
                  <option value="Witty">Witty &amp; Punchy</option>
                  <option value="Direct Response">Direct Response &amp; Urgent</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!url.trim() && !topic.trim())}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Campaign...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Omnichannel Campaign</span>
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Output Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {!campaign && !isGenerating && (
            <GlassCard className="flex flex-col items-center justify-center p-12 text-center min-h-[380px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-display text-base font-bold text-white">
                Ready to Build Campaign
              </h4>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-white/50">
                Provide your landing page URL or campaign concept on the left. The AI orchestrator will generate platform-adapted copy for X, LinkedIn, and Instagram.
              </p>
            </GlassCard>
          )}

          {isGenerating && (
            <GlassCard className="flex flex-col items-center justify-center p-12 text-center min-h-[380px] space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Synthesizing Creative Strategy...</p>
                <p className="text-xs text-white/40">Adapting character constraints, hashtags, and curiosity hooks per network.</p>
              </div>
            </GlassCard>
          )}

          {campaign && !isGenerating && (
            <div className="space-y-5">
              {/* X / Twitter Thread */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white font-bold text-xs">
                      X
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">X / Twitter Thread</h4>
                      <p className="text-[11px] text-white/40">{campaign.twitter.length} tweets crafted</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(campaign.twitter.join("\n\n"), "twitter")}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-xs text-white/70 hover:text-white transition"
                    >
                      {copiedKey === "twitter" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy Thread</span>
                    </button>
                    <Link
                      href="/dashboard/compose"
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 text-xs font-semibold hover:bg-blue-600/30 transition"
                    >
                      <span>Open in Compose</span>
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  {campaign.twitter.map((tweet, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-xs leading-relaxed text-white/90"
                    >
                      <p className="whitespace-pre-wrap">{tweet}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* LinkedIn Post */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                      in
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">LinkedIn Authority Post</h4>
                      <p className="text-[11px] text-white/40">Long-form narrative with spaced formatting</p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(campaign.linkedin, "linkedin")}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-xs text-white/70 hover:text-white transition"
                  >
                    {copiedKey === "linkedin" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy Post</span>
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-white/90">
                  <p className="whitespace-pre-wrap">{campaign.linkedin}</p>
                </div>
              </GlassCard>

              {/* Instagram Copy */}
              <GlassCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs">
                      IG
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Instagram Carousel Copy</h4>
                      <p className="text-[11px] text-white/40">Engagement caption with hashtags</p>
                    </div>
                  </div>

                  <button
                    onClick={() => copyToClipboard(campaign.instagram, "instagram")}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-xs text-white/70 hover:text-white transition"
                  >
                    {copiedKey === "instagram" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy Caption</span>
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-white/90">
                  <p className="whitespace-pre-wrap">{campaign.instagram}</p>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
