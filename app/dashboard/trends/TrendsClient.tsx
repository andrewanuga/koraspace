"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  Compass,
  ExternalLink,
  Flame,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Camera,
  Briefcase,
  AtSign,
  MessageCircle,
  Eye,
  Filter,
  Target,
  WandSparkles,
} from "lucide-react";

import { GlassCard, PageHeader } from "@/components/dashboard/ui";
import { useToast } from "@/components/ui/toast";

import type {
  SocialTrend,
  SocialAccount,
} from "@/lib/social/types";

type Acct = Pick<
  SocialAccount,
  "id" | "platform" | "handle" | "display_name"
>;

type TrendTab =
  | "trending"
  | "ideas"
  | "competitors"
  | "audience"
  | "saved";

const TABS: {
  id: TrendTab;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "trending",
    label: "Trending Now",
    icon: Flame,
  },
  {
    id: "ideas",
    label: "Content Ideas",
    icon: Lightbulb,
  },
  {
    id: "competitors",
    label: "Competitor Insights",
    icon: Target,
  },
  {
    id: "audience",
    label: "Audience Interests",
    icon: Users,
  },
  {
    id: "saved",
    label: "Saved",
    icon: Bookmark,
  },
];

function getMomentumConfig(momentum: string | null) {
  if (momentum === "Accelerating") {
    return {
      color: "#34d399",
      label: "Accelerating",
    };
  }

  if (momentum === "Building") {
    return {
      color: "#60a5fa",
      label: "Building",
    };
  }

  return {
    color: "var(--fg-3)",
    label: momentum || "Stable",
  };
}

function getPlatformIcon(platform?: string | null) {
  const value = platform?.toLowerCase();

  if (value?.includes("instagram")) {
    return Camera;
  }

  if (value?.includes("linkedin")) {
    return Briefcase;
  }

  return AtSign;
}

function formatPlatform(platform?: string | null) {
  if (!platform) return "Social";

  return platform
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function TrendsClient({
  trends: initial,
  accounts,
  userNiche,
  persona,
}: {
  trends: SocialTrend[];
  accounts: Acct[];
  userNiche: string | null;
  persona: string;
}) {
  const { success, error: toastError } = useToast();

  const [trends, setTrends] = useState(initial);
  const [activeTab, setActiveTab] =
    useState<TrendTab>("trending");

  const [search, setSearch] = useState("");

  const [selectedTrend, setSelectedTrend] =
    useState<SocialTrend | null>(null);

  const [busy, setBusy] = useState(false);

  const [ideaPrompt, setIdeaPrompt] = useState("");

  const [savedIds, setSavedIds] = useState<string[]>([]);

  const [generatingIdeas, setGeneratingIdeas] =
    useState(false);

  const [generatedIdeas, setGeneratedIdeas] =
    useState<string[]>([]);

  const refresh = async () => {
    setBusy(true);

    try {
      const res = await fetch(
        "/api/social/trends",
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to refresh trends"
        );
      }

      setTrends(data.trends ?? []);

      success(
        "Trends refreshed",
        data.searched
          ? "Fresh trends were discovered for your niche."
          : "Latest available trend data loaded."
      );
    } catch (error) {
      toastError(
        "Couldn't refresh trends",
        error instanceof Error
          ? error.message
          : undefined
      );
    } finally {
      setBusy(false);
    }
  };

  const generateIdeas = async () => {
    if (!ideaPrompt.trim()) {
      toastError(
        "Tell Kora what you're thinking about",
        "Enter a topic or content direction first."
      );

      return;
    }

    setGeneratingIdeas(true);

    try {
      /**
       * TEMPORARY FRONTEND FALLBACK
       *
       * Replace this with your AI endpoint later.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      setGeneratedIdeas([
        `A controversial take about ${ideaPrompt}`,
        `5 mistakes creators make with ${ideaPrompt}`,
        `How I would start with ${ideaPrompt} from zero`,
        `The future of ${ideaPrompt} in 2026`,
      ]);

      success(
        "Ideas generated",
        "Kora created four directions to explore."
      );
    } catch {
      toastError(
        "Couldn't generate ideas",
        "Please try again."
      );
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const toggleSaved = (id: string) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const filteredTrends = useMemo(() => {
    let result = [...trends];

    if (activeTab === "saved") {
      result = result.filter((trend) =>
        savedIds.includes(trend.id)
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((trend) => {
        return (
          trend.topic?.toLowerCase().includes(query) ||
          trend.summary?.toLowerCase().includes(query) ||
          trend.source_name
            ?.toLowerCase()
            .includes(query)
        );
      });
    }

    return result;
  }, [trends, search, activeTab, savedIds]);

  const popularTopics = useMemo(() => {
    return [...trends]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5);
  }, [trends]);

  const selectedAccount = (id?: string | null) => {
    if (!id) return null;

    return accounts.find(
      (account) => account.id === id
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] pb-10">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <PageHeader
        eyebrow="Trend Intelligence"
        title="Find what's next"
        sub={
          userNiche
            ? `Discover trending topics, content opportunities and inspiration for ${userNiche}.`
            : "Discover trending topics, content opportunities and inspiration for your audience."
        }
        actions={
          <button
            onClick={refresh}
            disabled={busy}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--stroke)]
              bg-[var(--panel-fill)]
              px-4
              py-2
              text-[13px]
              font-medium
              text-[var(--fg)]
              transition-all
              hover:border-[var(--kora-pink)]/40
              hover:bg-[var(--hover)]
              disabled:opacity-60
            "
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Refresh trends
          </button>
        }
      />

      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}

      <div className="mb-5">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          <div className="relative max-w-xl flex-1">

            <Search
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-[var(--fg-4)]
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search trends, topics, or keywords..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-[var(--stroke)]
                bg-[var(--panel-fill)]
                pl-11
                pr-4
                text-[13px]
                text-[var(--fg)]
                outline-none
                transition-all
                placeholder:text-[var(--fg-4)]
                focus:border-[var(--kora-blue)]/60
                focus:ring-4
                focus:ring-[var(--kora-blue)]/10
              "
            />

            <div
              className="
                absolute
                right-3
                top-1/2
                hidden
                -translate-y-1/2
                rounded-md
                border
                border-[var(--stroke)]
                bg-[var(--panel-fill-2)]
                px-2
                py-1
                text-[10px]
                text-[var(--fg-4)]
                sm:block
              "
            >
              ⌘ K
            </div>

          </div>

          <button
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[var(--stroke)]
              bg-[var(--panel-fill)]
              px-4
              text-[13px]
              text-[var(--fg-2)]
              transition-colors
              hover:bg-[var(--hover)]
            "
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

        </div>


        {/* TABS */}

        <div
          className="
            mt-5
            flex
            gap-2
            overflow-x-auto
            pb-1
          "
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-4
                  py-2.5
                  text-[12px]
                  font-medium
                  transition-all

                  ${
                    active
                      ? `
                        border-[var(--kora-pink)]/40
                        bg-[var(--kora-pink)]
                        text-white
                        shadow-[0_8px_24px_rgba(236,72,153,0.18)]
                      `
                      : `
                        border-[var(--stroke)]
                        bg-[var(--panel-fill)]
                        text-[var(--fg-3)]
                        hover:border-[var(--stroke-strong)]
                        hover:text-[var(--fg)]
                      `
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">


        {/* =====================================================
            LEFT CONTENT
        ===================================================== */}

        <div className="space-y-5">


          {/* TRENDING HEADER */}

          <div className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-[var(--kora-pink-soft)]
                    text-[var(--kora-pink)]
                  "
                >
                  <TrendingUp className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--fg)]">
                    {activeTab === "saved"
                      ? "Saved inspiration"
                      : "Trending now"}
                  </h2>

                  <p className="text-[11px] text-[var(--fg-4)]">
                    Live signals from your niche and platforms
                  </p>
                </div>

              </div>
            </div>

            <span className="text-[11px] text-[var(--fg-4)]">
              {filteredTrends.length} topics
            </span>

          </div>


          {/* EMPTY STATE */}

          {filteredTrends.length === 0 && (

            <GlassCard className="flex min-h-[340px] flex-col items-center justify-center p-8 text-center">

              <Compass className="mb-4 h-10 w-10 text-[var(--fg-4)]" />

              <h3 className="text-[15px] font-semibold text-[var(--fg)]">
                No trends found
              </h3>

              <p className="mt-2 max-w-sm text-[13px] text-[var(--fg-4)]">
                Try another search or refresh your trend intelligence.
              </p>

              <button
                onClick={refresh}
                disabled={busy}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[var(--kora-pink)]
                  px-4
                  py-2.5
                  text-[13px]
                  font-semibold
                  text-white
                "
              >
                <RefreshCw className="h-4 w-4" />
                Refresh trends
              </button>

            </GlassCard>

          )}


          {/* TREND CARDS */}

          <div className="grid gap-4 md:grid-cols-2">

            {filteredTrends.map((trend) => {

              const momentum =
                getMomentumConfig(
                  trend.momentum
                );

              const account =
                selectedAccount(
                  trend.suggested_account_id
                );

              const PlatformIcon =
                getPlatformIcon(
                  account?.platform
                );

              const isSaved =
                savedIds.includes(trend.id);

              return (

                <GlassCard
                  key={trend.id}
                  className="
                    group
                    relative
                    flex
                    min-h-[260px]
                    cursor-pointer
                    flex-col
                    overflow-hidden
                    p-5
                    transition-all
                    hover:-translate-y-[2px]
                    hover:border-[var(--kora-pink)]/30
                    hover:shadow-[0_18px_40px_rgba(0,0,0,0.2)]
                  "
                  onClick={() =>
                    setSelectedTrend(trend)
                  }
                >


                  {/* TOP */}

                  <div className="mb-5 flex items-start justify-between">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[var(--stroke)]
                        bg-[var(--panel-fill-2)]
                      "
                    >
                      <Flame
                        className="h-4 w-4"
                        style={{
                          color: momentum.color,
                        }}
                      />
                    </div>


                    <div className="flex items-center gap-2">

                      <div
                        className="
                          rounded-lg
                          border
                          px-2
                          py-1
                          text-[10px]
                          font-semibold
                        "
                        style={{
                          color: momentum.color,
                          borderColor: `${momentum.color}33`,
                          backgroundColor: `${momentum.color}12`,
                        }}
                      >
                        {momentum.label}
                      </div>


                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSaved(trend.id);
                        }}
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-lg
                          text-[var(--fg-4)]
                          transition-colors
                          hover:bg-[var(--hover)]
                          hover:text-[var(--kora-pink)]
                        "
                      >
                        <Bookmark
                          className="h-4 w-4"
                          fill={
                            isSaved
                              ? "currentColor"
                              : "none"
                          }
                          style={
                            isSaved
                              ? {
                                  color:
                                    "var(--kora-pink)",
                                }
                              : undefined
                          }
                        />
                      </button>

                    </div>

                  </div>


                  {/* CONTENT */}

                  <div>

                    <div className="mb-2 flex items-start justify-between gap-3">

                      <h3
                        className="
                          text-[16px]
                          font-semibold
                          leading-snug
                          text-[var(--fg)]
                        "
                      >
                        {trend.topic}
                      </h3>


                      <div
                        className="
                          shrink-0
                          rounded-lg
                          bg-[var(--kora-pink-soft)]
                          px-2
                          py-1
                          text-[12px]
                          font-bold
                          text-[var(--kora-pink)]
                        "
                      >
                        {trend.score ?? "—"}
                      </div>

                    </div>


                    {trend.summary && (

                      <p
                        className="
                          line-clamp-4
                          text-[12.5px]
                          leading-relaxed
                          text-[var(--fg-3)]
                        "
                      >
                        {trend.summary}
                      </p>

                    )}

                  </div>


                  {/* BOTTOM */}

                  <div className="mt-auto pt-5">


                    {account && (

                      <div
                        className="
                          mb-4
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-[var(--kora-blue)]/15
                          bg-[var(--kora-blue-soft)]
                          px-3
                          py-2
                        "
                      >

                        <PlatformIcon
                          className="h-3.5 w-3.5"
                          style={{
                            color:
                              "var(--kora-blue)",
                          }}
                        />

                        <span className="text-[11px] text-[var(--fg-3)]">
                          Opportunity for{" "}
                          <span className="font-medium text-[var(--fg)]">
                            {formatPlatform(
                              account.platform
                            )}
                          </span>

                        </span>

                      </div>

                    )}


                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        {trend.source_name && (

                          <span className="text-[10.5px] text-[var(--fg-4)]">
                            {trend.source_name}
                          </span>

                        )}

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-1
                          text-[11px]
                          font-medium
                          text-[var(--kora-pink)]
                        "
                      >
                        Explore

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

                      </div>

                    </div>

                  </div>

                </GlassCard>

              );
            })}

          </div>


          {/* GENERATED IDEAS */}

          {generatedIdeas.length > 0 && (

            <GlassCard className="p-5">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Sparkles className="h-4 w-4 text-[var(--kora-pink)]" />

                  <div>

                    <h3 className="text-[14px] font-semibold text-[var(--fg)]">
                      Fresh ideas for you
                    </h3>

                    <p className="text-[11px] text-[var(--fg-4)]">
                      Generated from your prompt
                    </p>

                  </div>

                </div>


                <button
                  onClick={() =>
                    setGeneratedIdeas([])
                  }
                  className="
                    text-[11px]
                    text-[var(--fg-4)]
                    hover:text-[var(--fg)]
                  "
                >
                  Clear
                </button>

              </div>


              <div className="space-y-2">

                {generatedIdeas.map(
                  (idea, index) => (

                    <Link
                      key={index}
                      href={`/dashboard/create?idea=${encodeURIComponent(
                        idea
                      )}`}
                      className="
                        flex
                        items-center
                        justify-between
                        rounded-xl
                        border
                        border-[var(--stroke)]
                        bg-[var(--panel-fill)]
                        px-4
                        py-3
                        transition-colors
                        hover:border-[var(--kora-pink)]/30
                        hover:bg-[var(--hover)]
                      "
                    >

                      <div className="flex items-center gap-3">

                        <span
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-lg
                            bg-[var(--kora-pink-soft)]
                            text-[11px]
                            font-semibold
                            text-[var(--kora-pink)]
                          "
                        >
                          {index + 1}
                        </span>

                        <span className="text-[12.5px] text-[var(--fg-2)]">
                          {idea}
                        </span>

                      </div>

                      <ChevronRight className="h-4 w-4 text-[var(--fg-4)]" />

                    </Link>

                  )
                )}

              </div>

            </GlassCard>

          )}

        </div>


        {/* =====================================================
            RIGHT SIDEBAR
        ===================================================== */}

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">


          {/* AI IDEA GENERATOR */}

          <GlassCard className="overflow-hidden">

            <div
              className="
                border-b
                border-[var(--stroke)]
                p-5
              "
            >

              <div className="flex items-center gap-2">

                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-[var(--kora-pink-soft)]
                    text-[var(--kora-pink)]
                  "
                >
                  <WandSparkles className="h-4 w-4" />
                </div>


                <div>

                  <h3 className="text-[14px] font-semibold text-[var(--fg)]">
                    AI Idea Generator
                  </h3>

                  <p className="text-[10.5px] text-[var(--fg-4)]">
                    Never run out of ideas
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5">

              <p className="mb-4 text-[12px] leading-relaxed text-[var(--fg-3)]">
                Tell Kora what you're interested in and
                we'll generate content angles for your
                audience.
              </p>


              <textarea
                value={ideaPrompt}
                onChange={(event) =>
                  setIdeaPrompt(
                    event.target.value
                  )
                }
                placeholder="e.g. AI tools, productivity, creator economy..."
                className="
                  min-h-[100px]
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-[var(--stroke)]
                  bg-[var(--panel-fill-2)]
                  p-3
                  text-[12px]
                  text-[var(--fg)]
                  outline-none
                  placeholder:text-[var(--fg-4)]
                  focus:border-[var(--kora-pink)]/50
                "
              />


              <button
                onClick={generateIdeas}
                disabled={generatingIdeas}
                className="
                  mt-3
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--kora-pink)]
                  text-[12px]
                  font-semibold
                  text-white
                  transition-all
                  hover:brightness-110
                  disabled:opacity-60
                "
              >

                {generatingIdeas ? (

                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>

                ) : (

                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate ideas
                  </>

                )}

              </button>


              {/* QUICK PROMPTS */}

              <div className="mt-4">

                <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--fg-4)]">
                  Try one
                </p>


                <div className="flex flex-wrap gap-2">

                  {[
                    "Content ideas",
                    "Video hooks",
                    "Carousel ideas",
                    "Thought leadership",
                  ].map((prompt) => (

                    <button
                      key={prompt}
                      onClick={() =>
                        setIdeaPrompt(prompt)
                      }
                      className="
                        rounded-lg
                        border
                        border-[var(--stroke)]
                        bg-[var(--panel-fill)]
                        px-2.5
                        py-1.5
                        text-[10.5px]
                        text-[var(--fg-3)]
                        hover:border-[var(--kora-pink)]/30
                        hover:text-[var(--fg)]
                      "
                    >
                      {prompt}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          </GlassCard>


          {/* POPULAR TOPICS */}

          <GlassCard className="p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h3 className="text-[14px] font-semibold text-[var(--fg)]">
                  Popular topics
                </h3>

                <p className="text-[10.5px] text-[var(--fg-4)]">
                  Moving fastest right now
                </p>

              </div>

              <TrendingUp className="h-4 w-4 text-[var(--kora-pink)]" />

            </div>


            <div className="space-y-2">

              {popularTopics.map(
                (trend, index) => (

                  <button
                    key={trend.id}
                    onClick={() =>
                      setSelectedTrend(trend)
                    }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      p-2.5
                      text-left
                      transition-colors
                      hover:bg-[var(--hover)]
                    "
                  >

                    <span
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[var(--panel-fill-2)]
                        text-[10px]
                        font-semibold
                        text-[var(--fg-4)]
                      "
                    >
                      {index + 1}
                    </span>


                    <div className="min-w-0 flex-1">

                      <p className="truncate text-[11.5px] font-medium text-[var(--fg-2)]">
                        {trend.topic}
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#34d399]">
                        ↑ {trend.score ?? 0} score
                      </p>

                    </div>


                    <ChevronRight className="h-3.5 w-3.5 text-[var(--fg-4)] transition-transform group-hover:translate-x-0.5" />

                  </button>

                )
              )}

            </div>

          </GlassCard>


          {/* TODAY'S OPPORTUNITY */}

          <GlassCard
            className="
              border-[var(--kora-blue)]/20
              bg-[var(--panel-fill)]
              p-5
            "
          >

            <div
              className="
                mb-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-[var(--kora-blue-soft)]
                text-[var(--kora-blue)]
              "
            >
              <Lightbulb className="h-4 w-4" />
            </div>


            <h3 className="text-[14px] font-semibold text-[var(--fg)]">
              Today's opportunity
            </h3>


            <p className="mt-2 text-[12px] leading-relaxed text-[var(--fg-3)]">
              {popularTopics[0]
                ? `"${popularTopics[0].topic}" is gaining momentum. Your audience is likely ready for this conversation.`
                : "We're monitoring your niche for the next content opportunity."}
            </p>


            {popularTopics[0] && (

              <Link
                href={`/dashboard/create?idea=${encodeURIComponent(
                  popularTopics[0].topic
                )}`}
                className="
                  mt-4
                  flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--kora-pink)]
                  text-[12px]
                  font-semibold
                  text-white
                  transition-all
                  hover:brightness-110
                "
              >
                Create content

                <ArrowRight className="h-4 w-4" />

              </Link>

            )}

          </GlassCard>

        </aside>

      </div>


      {/* =====================================================
          TREND DETAIL DRAWER / MODAL
      ===================================================== */}

      {selectedTrend && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            justify-end
            bg-black/60
            backdrop-blur-sm
          "
          onClick={() =>
            setSelectedTrend(null)
          }
        >

          <div
            className="
              h-full
              w-full
              max-w-xl
              overflow-y-auto
              border-l
              border-[var(--stroke)]
              bg-[#121212]
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <div className="mb-8 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <Sparkles className="h-4 w-4 text-[var(--kora-pink)]" />

                <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--fg-4)]">
                  Trend intelligence
                </span>

              </div>


              <button
                onClick={() =>
                  setSelectedTrend(null)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-[var(--fg-3)]
                  hover:bg-[var(--hover)]
                "
              >
                <X className="h-4 w-4" />
              </button>

            </div>


            {/* SCORE */}

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>

                <h2 className="text-2xl font-semibold text-[var(--fg)]">
                  {selectedTrend.topic}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-3)]">
                  {selectedTrend.summary}
                </p>

              </div>


              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--kora-pink-soft)]
                  text-lg
                  font-bold
                  text-[var(--kora-pink)]
                "
              >
                {selectedTrend.score ?? "—"}
              </div>

            </div>


            {/* STATS */}

            <div className="mb-6 grid grid-cols-3 gap-3">

              <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">

                <TrendingUp className="mb-2 h-4 w-4 text-[#34d399]" />

                <p className="text-[10px] text-[var(--fg-4)]">
                  Momentum
                </p>

                <p className="mt-1 text-[12px] font-medium text-[var(--fg)]">
                  {selectedTrend.momentum || "Stable"}
                </p>

              </div>


              <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">

                <Eye className="mb-2 h-4 w-4 text-[var(--kora-blue)]" />

                <p className="text-[10px] text-[var(--fg-4)]">
                  Trend score
                </p>

                <p className="mt-1 text-[12px] font-medium text-[var(--fg)]">
                  {selectedTrend.score ?? "—"}
                </p>

              </div>


              <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">

                <MessageCircle className="mb-2 h-4 w-4 text-[var(--kora-pink)]" />

                <p className="text-[10px] text-[var(--fg-4)]">
                  Source
                </p>

                <p className="mt-1 truncate text-[12px] font-medium text-[var(--fg)]">
                  {selectedTrend.source_name || "Web"}
                </p>

              </div>

            </div>


            {/* AI INSIGHT */}

            <div
              className="
                mb-6
                rounded-2xl
                border
                border-[var(--kora-pink)]/20
                bg-[var(--kora-pink-soft)]
                p-5
              "
            >

              <div className="mb-2 flex items-center gap-2">

                <Sparkles className="h-4 w-4 text-[var(--kora-pink)]" />

                <span className="text-[12px] font-semibold text-[var(--fg)]">
                  Kora's take
                </span>

              </div>


              <p className="text-[12.5px] leading-relaxed text-[var(--fg-2)]">

                This trend has enough momentum to be worth
                creating around. Instead of copying the trend
                directly, connect it to your personal
                experience, expertise, or audience problem.

              </p>

            </div>


            {/* ACTIONS */}

            <div className="space-y-3">

              <Link
                href={`/dashboard/create?idea=${encodeURIComponent(
                  selectedTrend.topic
                )}`}
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[var(--kora-pink)]
                  text-[13px]
                  font-semibold
                  text-white
                "
              >
                <Sparkles className="h-4 w-4" />

                Create content from this trend

              </Link>


              <button
                onClick={() =>
                  toggleSaved(selectedTrend.id)
                }
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[var(--stroke)]
                  bg-[var(--panel-fill)]
                  text-[12px]
                  font-medium
                  text-[var(--fg-2)]
                  hover:bg-[var(--hover)]
                "
              >
                <Bookmark className="h-4 w-4" />

                {savedIds.includes(selectedTrend.id)
                  ? "Remove from saved"
                  : "Save trend"}

              </button>


              {selectedTrend.source_url && (

                <a
                  href={selectedTrend.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[var(--stroke)]
                    text-[12px]
                    text-[var(--fg-3)]
                    hover:bg-[var(--hover)]
                  "
                >

                  <ExternalLink className="h-4 w-4" />

                  View original source

                </a>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}