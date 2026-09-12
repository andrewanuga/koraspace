"use client";

import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clapperboard,
  FileText,
  Play,
  Layers3,
  Loader2,
  Megaphone,
  MessageCircle,
  PenLine,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  WandSparkles,
  X,
  Briefcase,
} from "lucide-react";

import { useToast } from "@/components/ui/toast";

type IconComponent = ComponentType<{ className?: string; style?: CSSProperties }>;

type Persona = "client" | "creator" | "marketer";

type Goal =
  | "growth"
  | "leads"
  | "sales"
  | "content"
  | "brand"
  | "management"
  | "repurpose"
  | "analytics";

type Platform =
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube"
  | "threads"
  | "facebook";

type ContentFormat =
  | "short_video"
  | "text"
  | "carousel"
  | "image"
  | "long_form"
  | "mixed";

type AutomationLevel =
  | "suggestions"
  | "drafts"
  | "create_schedule"
  | "automate";

const PINK = "#ff0a8a";
const PINK_SOFT = "#ff63b4";
const BLUE = "#3b82f6";
const BLUE_SOFT = "#60a5fa";
const SURFACE = "#171717";

const PERSONAS: {
  id: Persona;
  icon: typeof BriefcaseBusiness;
  title: string;
  blurb: string;
  detail: string;
}[] = [
  {
    id: "client",
    icon: BriefcaseBusiness,
    title: "Business / Brand",
    blurb: "I run a business and want social media to drive qualified leads.",
    detail: "Business growth, leads, sales, and brand presence.",
  },
  {
    id: "creator",
    icon: Sparkles,
    title: "Creator Studio",
    blurb: "I build an audience, publish content, and grow my influence.",
    detail: "Audience growth, signature content, engagement, and repurposing.",
  },
  {
    id: "marketer",
    icon: Megaphone,
    title: "Marketing Operator",
    blurb: "I manage marketing, lead pipelines, and multi-channel campaigns.",
    detail: "Campaigns, CRM lead triage, analytics, and autonomous automation.",
  },
];

const GOALS: {
  id: Goal;
  title: string;
  description: string;
  icon: typeof TrendingUp;
}[] = [
  {
    id: "growth",
    title: "Grow my audience",
    description: "Reach more people and increase visibility.",
    icon: TrendingUp,
  },
  {
    id: "leads",
    title: "Generate leads",
    description: "Turn social attention into qualified prospects.",
    icon: Users,
  },
  {
    id: "sales",
    title: "Increase sales",
    description: "Connect content and campaigns to revenue.",
    icon: Target,
  },
  {
    id: "content",
    title: "Create content faster",
    description: "Spend less time staring at a blank page.",
    icon: PenLine,
  },
  {
    id: "brand",
    title: "Build my brand voice",
    description: "Create a recognizable and consistent presence.",
    icon: Sparkles,
  },
  {
    id: "management",
    title: "Manage multi-channels",
    description: "Bring 6+ social accounts and workflows together.",
    icon: Layers3,
  },
  {
    id: "repurpose",
    title: "Repurpose content",
    description: "Turn one idea into content for multiple channels.",
    icon: Clapperboard,
  },
  {
    id: "analytics",
    title: "Revenue & attribution",
    description: "Know what is working and attribute closed revenue.",
    icon: BarChart3,
  },
];

const PLATFORMS: {
  id: Platform;
  title: string;
  short: string;
  icon: IconComponent;
}[] = [
  {
    id: "instagram",
    title: "Instagram",
    short: "IG",
    icon: Camera,
  },
  {
    id: "tiktok",
    title: "TikTok",
    short: "TK",
    icon: Video,
  },
  {
    id: "x",
    title: "X (Twitter)",
    short: "X",
    icon: X,
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    short: "IN",
    icon: Briefcase,
  },
  {
    id: "youtube",
    title: "YouTube",
    short: "YT",
    icon: Play,
  },
  {
    id: "threads",
    title: "Threads",
    short: "TH",
    icon: MessageCircle,
  },
  {
    id: "facebook",
    title: "Facebook",
    short: "FB",
    icon: Users,
  },
];

const CONTENT_FORMATS: {
  id: ContentFormat;
  title: string;
  description: string;
  icon: IconComponent;
}[] = [
  {
    id: "short_video",
    title: "Short-form video",
    description: "Reels, TikToks, Shorts",
    icon: Video,
  },
  {
    id: "text",
    title: "Text & Threads",
    description: "Posts, threads, opinions",
    icon: FileText,
  },
  {
    id: "carousel",
    title: "Carousels",
    description: "Educational swipe content",
    icon: Layers3,
  },
  {
    id: "image",
    title: "Images & Visuals",
    description: "Photos, graphics, visuals",
    icon: Camera,
  },
  {
    id: "long_form",
    title: "Long-form",
    description: "Articles, newsletters, scripts",
    icon: Play,
  },
  {
    id: "mixed",
    title: "A mix of everything",
    description: "I use multiple formats",
    icon: Sparkles,
  },
];

const CADENCE = [
  {
    value: 2,
    title: "1–2 / week",
    description: "Testing the waters",
  },
  {
    value: 5,
    title: "3–5 / week",
    description: "Staying consistent",
  },
  {
    value: 10,
    title: "6–10 / week",
    description: "Building momentum",
  },
  {
    value: 14,
    title: "Daily+",
    description: "High-volume publishing",
  },
];

const AUTOMATION_LEVELS: {
  id: AutomationLevel;
  title: string;
  description: string;
  icon: IconComponent;
}[] = [
  {
    id: "suggestions",
    title: "Suggestions & Ideas",
    description: "Give me ideas and recommendations. I'll craft the rest.",
    icon: Search,
  },
  {
    id: "drafts",
    title: "AI Pipeline Drafts",
    description: "Turn recommendations into ready-to-edit 8-step drafts.",
    icon: PenLine,
  },
  {
    id: "create_schedule",
    title: "Create & Auto-Schedule",
    description: "Generate drafts and place them onto the visual calendar.",
    icon: Calendar,
  },
  {
    id: "automate",
    title: "Autonomous Operator",
    description: "Let Koraspace triage leads and optimize campaigns continuously.",
    icon: WandSparkles,
  },
];

function ChoiceCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  compact = false,
  accentColor = PINK,
  accentSoft = PINK_SOFT,
}: {
  active: boolean;
  onClick: () => void;
  icon?: IconComponent;
  title: string;
  description?: string;
  compact?: boolean;
  accentColor?: string;
  accentSoft?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
        compact ? "p-3.5" : "p-4"
      }`}
      style={{
        borderColor: active
          ? `${accentColor}80`
          : "rgba(255,255,255,0.08)",
        background: active
          ? `${accentColor}12`
          : "rgba(255,255,255,0.025)",
      }}
    >
      {Icon && (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
          style={{
            borderColor: active
              ? `${accentColor}35`
              : "rgba(255,255,255,0.07)",
            background: active
              ? `${accentColor}20`
              : "rgba(255,255,255,0.025)",
          }}
        >
          <Icon
            className="h-4.5 w-4.5"
            style={{
              color: active ? accentSoft : "rgba(255,255,255,0.4)",
            }}
          />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white/90">
          {title}
        </span>

        {description && (
          <span className="mt-0.5 block text-[11px] leading-5 text-white/35">
            {description}
          </span>
        )}
      </span>

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
          active
            ? "border-transparent"
            : "border-white/15 bg-transparent"
        }`}
        style={{
          background: active ? accentColor : undefined,
        }}
      >
        {active && <Check className="h-3 w-3 text-white" />}
      </span>
    </button>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/35">
      {children}
    </div>
  );
}

export function OnboardingFlow({
  initialName,
  initialUsername,
}: {
  initialName?: string;
  initialUsername?: string;
}) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [persona, setPersona] = useState<Persona | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [username, setUsername] = useState(initialUsername ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contentFormats, setContentFormats] = useState<ContentFormat[]>([]);
  const [niche, setNiche] = useState("");
  const [postingCadence, setPostingCadence] = useState<number | null>(null);
  const [audienceRange, setAudienceRange] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [industry, setIndustry] = useState("");
  const [automationLevel, setAutomationLevel] = useState<AutomationLevel | null>(null);

  const TOTAL_STEPS = 6;
  const firstName = initialName?.trim().split(/\s+/)[0] ?? "";

  const isMarketer = persona === "marketer";
  const accentColor = isMarketer ? BLUE : PINK;
  const accentSoft = isMarketer ? BLUE_SOFT : PINK_SOFT;

  const inputCls = `flex h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-3.5 text-sm text-white placeholder:text-white/25 transition-all duration-200 focus:bg-white/[0.05] focus:outline-none focus:ring-4 ${
    isMarketer
      ? "focus:border-[#3b82f6]/60 focus:ring-[#3b82f6]/10"
      : "focus:border-[#ff0a8a]/60 focus:ring-[#ff0a8a]/10"
  }`;

  const toggleGoal = (goal: Goal) => {
    setGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal]
    );
  };

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  };

  const toggleContentFormat = (format: ContentFormat) => {
    setContentFormats((current) =>
      current.includes(format)
        ? current.filter((item) => item !== format)
        : [...current, format]
    );
  };

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return persona !== null;

      case 1:
        return goals.length > 0;

      case 2:
        return (
          username.trim().length >= 2 &&
          platforms.length > 0
        );

      case 3:
        return (
          niche.trim().length >= 2 &&
          contentFormats.length > 0 &&
          postingCadence !== null
        );

      case 4:
        if (persona === "creator") {
          return (
            audienceRange.trim().length > 0 &&
            targetAudience.trim().length >= 2
          );
        }

        if (persona === "client") {
          return (
            businessType.trim().length > 0 &&
            targetAudience.trim().length >= 2
          );
        }

        if (persona === "marketer") {
          return (
            industry.trim().length > 0 &&
            businessType.trim().length > 0
          );
        }

        return false;

      case 5:
        return automationLevel !== null;

      default:
        return false;
    }
  }, [
    step,
    persona,
    goals,
    username,
    platforms,
    niche,
    contentFormats,
    postingCadence,
    audienceRange,
    businessType,
    targetAudience,
    industry,
    automationLevel,
  ]);

  const next = () => {
    if (!stepValid) return;
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const finish = async () => {
    if (!stepValid || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          username: username.trim(),
          goals,
          platforms,
          contentFormats,
          niche: niche.trim(),
          postingCadence,
          audienceRange,
          targetAudience,
          businessType,
          industry,
          automationLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toastError(
          "Couldn't finish setup",
          data?.error || "Please check your details and try again."
        );
        return;
      }

      toastSuccess(
        "Workspace ready",
        "Your Koraspace experience has been personalized."
      );

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toastError(
        "Something went wrong",
        err?.message || "We couldn't finish your setup. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Your role",
    "Your goals",
    "Your channels",
    "Your content",
    "Your audience",
    "Your workflow",
  ];

  return (
    <div className="w-full max-w-[680px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
            Workspace setup
          </div>

          <div className="mt-1 text-xs text-white/45">
            Step {step + 1} of {TOTAL_STEPS}
            <span className="mx-2 text-white/15">·</span>
            {stepTitles[step]}
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: accentColor }}
          />
          <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-white/25">
            Personalizing Koraspace
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
          const complete = index <= step;

          return (
            <div
              key={index}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: complete ? "100%" : "0%",
                  background: index === step ? accentColor : accentSoft,
                  opacity: index < step ? 0.5 : 1,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <div
        className="overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_30px_100px_-55px_rgba(0,0,0,0.95)]"
        style={{ background: SURFACE }}
      >
        <div className="p-6 sm:p-8 lg:p-9">
          <div key={step} className="sai-step-in">
            {/* STEP 0: Role */}
            {step === 0 && (
              <>
                <StepEyebrow number="01" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[38px]">
                  Let's build your
                  <br />
                  <span className="text-white/40">
                    Koraspace around you.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-white/40">
                  {firstName
                    ? `Nice to meet you, ${firstName}. `
                    : ""}
                  Tell us how you work with social media so we can
                  configure your workspace properly.
                </p>

                <div className="mt-8 space-y-3">
                  {PERSONAS.map((item) => {
                    const Icon = item.icon;
                    const active = persona === item.id;
                    const itemAccent = item.id === "marketer" ? BLUE : PINK;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPersona(item.id)}
                        className="group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer"
                        style={{
                          borderColor: active
                            ? `${itemAccent}80`
                            : "rgba(255,255,255,0.08)",
                          background: active
                            ? `${itemAccent}12`
                            : "rgba(255,255,255,0.025)",
                        }}
                      >
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors"
                          style={{
                            borderColor: active
                              ? `${itemAccent}35`
                              : "rgba(255,255,255,0.07)",
                            background: active
                              ? `${itemAccent}20`
                              : "rgba(255,255,255,0.025)",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: active
                                ? (item.id === "marketer" ? BLUE_SOFT : PINK)
                                : "rgba(255,255,255,0.45)",
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-display text-sm font-semibold text-white">
                            {item.title}
                          </div>

                          <div className="mt-1 text-xs leading-5 text-white/40">
                            {item.blurb}
                          </div>

                          <div className="mt-1 hidden text-[10px] text-white/25 sm:block">
                            {item.detail}
                          </div>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            active
                              ? "border-transparent"
                              : "border-white/15"
                          }`}
                          style={{
                            background: active ? itemAccent : "transparent",
                          }}
                        >
                          {active && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* STEP 1: Goals */}
            {step === 1 && (
              <>
                <StepEyebrow number="02" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[38px]">
                  What should
                  <br />
                  <span className="text-white/40">
                    Koraspace help you achieve?
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-white/40">
                  Pick everything that matters. We'll use these goals
                  to prioritize your dashboard, recommendations and
                  agent.
                </p>

                <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                  {GOALS.map((goal) => (
                    <ChoiceCard
                      key={goal.id}
                      active={goals.includes(goal.id)}
                      onClick={() => toggleGoal(goal.id)}
                      icon={goal.icon}
                      title={goal.title}
                      description={goal.description}
                      accentColor={accentColor}
                      accentSoft={accentSoft}
                    />
                  ))}
                </div>

                <SelectionHint count={goals.length} label="goals selected" accentColor={accentColor} />
              </>
            )}

            {/* STEP 2: Channels & Username */}
            {step === 2 && (
              <>
                <StepEyebrow number="03" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[38px]">
                  Where does your
                  <br />
                  <span className="text-white/40">
                    audience find you?
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-white/40">
                  Select the channels you actively use or plan to
                  grow. You can connect accounts later.
                </p>

                <div className="mt-8">
                  <SectionLabel>Your platforms</SectionLabel>

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {PLATFORMS.map((platform) => (
                      <ChoiceCard
                        key={platform.id}
                        active={platforms.includes(platform.id)}
                        onClick={() => togglePlatform(platform.id)}
                        icon={platform.icon}
                        title={platform.title}
                        compact
                        accentColor={accentColor}
                        accentSoft={accentSoft}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <SectionLabel>Your workspace username</SectionLabel>

                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                    <input
                      value={username}
                      onChange={(event) =>
                        setUsername(
                          event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      placeholder="yourhandle"
                      autoFocus
                      className={`${inputCls} pl-10`}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-white/25">
                    This is your unique Koraspace username. Alphanumeric characters and underscores only.
                  </p>
                </div>

                <SelectionHint
                  count={platforms.length}
                  label="platforms selected"
                  accentColor={accentColor}
                />
              </>
            )}

            {/* STEP 3: Content & Cadence */}
            {step === 3 && (
              <>
                <StepEyebrow number="04" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[38px]">
                  Tell us what
                  <br />
                  <span className="text-white/40">
                    you create.
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-white/40">
                  This gives the content engine context before it
                  starts making recommendations.
                </p>

                <div className="mt-8">
                  <SectionLabel>Your niche or industry topic</SectionLabel>

                  <input
                    value={niche}
                    onChange={(event) =>
                      setNiche(event.target.value)
                    }
                    placeholder="e.g. AI, SaaS, fashion, fitness, real estate, fintech..."
                    autoFocus
                    className={inputCls}
                  />
                </div>

                <div className="mt-7">
                  <SectionLabel>What formats do you use?</SectionLabel>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {CONTENT_FORMATS.map((format) => (
                      <ChoiceCard
                        key={format.id}
                        active={contentFormats.includes(format.id)}
                        onClick={() =>
                          toggleContentFormat(format.id)
                        }
                        icon={format.icon}
                        title={format.title}
                        description={format.description}
                        accentColor={accentColor}
                        accentSoft={accentSoft}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-7">
                  <SectionLabel>
                    How often do you want to publish?
                  </SectionLabel>

                  <div className="grid grid-cols-2 gap-2.5">
                    {CADENCE.map((cadence) => {
                      const active =
                        postingCadence === cadence.value;

                      return (
                        <button
                          key={cadence.value}
                          type="button"
                          onClick={() =>
                            setPostingCadence(cadence.value)
                          }
                          className="rounded-2xl border p-3.5 text-left transition-all cursor-pointer"
                          style={{
                            borderColor: active
                              ? `${accentColor}80`
                              : "rgba(255,255,255,0.08)",
                            background: active
                              ? `${accentColor}12`
                              : "rgba(255,255,255,0.025)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">
                              {cadence.title}
                            </span>

                            {active && (
                              <Check
                                className="h-4 w-4"
                                style={{ color: accentColor }}
                              />
                            )}
                          </div>

                          <div className="mt-1 text-[11px] text-white/30">
                            {cadence.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* STEP 4: Audience Context */}
            {step === 4 && (
              <>
                <StepEyebrow number="05" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[38px]">
                  A little more
                  <br />
                  <span className="text-white/40">
                    context.
                  </span>
                </h1>

                <p className="mt-4 text-sm leading-6 text-white/40">
                  {persona === "creator"
                    ? "Help us understand your audience so recommendations aren't generic."
                    : persona === "client"
                      ? "Tell us about the business you're trying to grow."
                      : "Give us the context you need for better marketing intelligence."}
                </p>

                <div className="mt-8 space-y-6">
                  {persona === "creator" && (
                    <>
                      <div>
                        <SectionLabel>
                          Current audience size
                        </SectionLabel>

                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            "0 – 1K",
                            "1K – 10K",
                            "10K – 100K",
                            "100K+",
                          ].map((range) => (
                            <ChoiceCard
                              key={range}
                              active={audienceRange === range}
                              onClick={() =>
                                setAudienceRange(range)
                              }
                              title={range}
                              compact
                              accentColor={accentColor}
                              accentSoft={accentSoft}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>
                          Who are you trying to reach?
                        </SectionLabel>

                        <input
                          value={targetAudience}
                          onChange={(event) =>
                            setTargetAudience(event.target.value)
                          }
                          placeholder="e.g. founders building AI startups"
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {persona === "client" && (
                    <>
                      <div>
                        <SectionLabel>
                          What type of business?
                        </SectionLabel>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {[
                            "E-commerce",
                            "SaaS",
                            "Agency",
                            "Local business",
                            "Personal brand",
                            "Other",
                          ].map((type) => (
                            <ChoiceCard
                              key={type}
                              active={businessType === type}
                              onClick={() =>
                                setBusinessType(type)
                              }
                              title={type}
                              compact
                              accentColor={accentColor}
                              accentSoft={accentSoft}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionLabel>
                          Who is your ideal customer?
                        </SectionLabel>

                        <input
                          value={targetAudience}
                          onChange={(event) =>
                            setTargetAudience(event.target.value)
                          }
                          placeholder="e.g. small business owners in Lagos"
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {persona === "marketer" && (
                    <>
                      <div>
                        <SectionLabel>
                          What industry do you work in?
                        </SectionLabel>

                        <input
                          value={industry}
                          onChange={(event) =>
                            setIndustry(event.target.value)
                          }
                          placeholder="e.g. SaaS, fintech, e-commerce..."
                          autoFocus
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <SectionLabel>
                          What do you primarily market?
                        </SectionLabel>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                          {[
                            "Products",
                            "Services",
                            "SaaS",
                            "Personal brands",
                            "Agencies",
                            "Multiple brands",
                          ].map((type) => (
                            <ChoiceCard
                              key={type}
                              active={businessType === type}
                              onClick={() =>
                                setBusinessType(type)
                              }
                              title={type}
                              compact
                              accentColor={accentColor}
                              accentSoft={accentSoft}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* STEP 5: Workflow & Automation */}
            {step === 5 && (
              <>
                <StepEyebrow number="06" accentColor={accentColor} accentSoft={accentSoft} />

                <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[38px]">
                  How much should
                  <br />
                  <span className="text-white/40">
                    Koraspace do for you?
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-white/40">
                  You stay in control. This simply tells Koraspace
                  how proactive your workspace should be.
                </p>

                <div className="mt-8 space-y-2.5">
                  {AUTOMATION_LEVELS.map((level) => (
                    <ChoiceCard
                      key={level.id}
                      active={automationLevel === level.id}
                      onClick={() =>
                        setAutomationLevel(level.id)
                      }
                      icon={level.icon}
                      title={level.title}
                      description={level.description}
                      accentColor={accentColor}
                      accentSoft={accentSoft}
                    />
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `${accentColor}18`,
                        color: accentColor,
                      }}
                    >
                      <Settings2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white/70">
                        Your workspace will be configured around
                        your answers.
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <SummaryPill>
                          {persona === "creator"
                            ? "Creator Mode"
                            : persona === "marketer"
                              ? "Marketer Mode"
                              : "Business Mode"}
                        </SummaryPill>

                        <SummaryPill>
                          {platforms.length} platform
                          {platforms.length === 1 ? "" : "s"}
                        </SummaryPill>

                        <SummaryPill>
                          {goals.length} goal
                          {goals.length === 1 ? "" : "s"}
                        </SummaryPill>

                        {niche && (
                          <SummaryPill>
                            {niche}
                          </SummaryPill>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-9 flex items-center justify-between border-t border-white/[0.07] pt-6">
            <div>
              {step > 0 ? (
                <button
                  type="button"
                  onClick={back}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.03] hover:text-white/75 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.13em] text-white/20">
                  <Rocket
                    className="h-3.5 w-3.5"
                    style={{ color: accentColor }}
                  />
                  Let's get you set up
                </div>
              )}
            </div>

            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                disabled={!stepValid}
                onClick={next}
                className="group flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/25 disabled:shadow-none cursor-pointer"
                style={{
                  background: stepValid ? accentColor : undefined,
                  boxShadow: stepValid ? `0 14px 35px -16px ${accentColor}90` : undefined,
                }}
              >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!stepValid || loading}
                onClick={finish}
                className="group flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/25 disabled:shadow-none cursor-pointer"
                style={{
                  background: stepValid && !loading ? accentColor : undefined,
                  boxShadow: stepValid && !loading ? `0 14px 35px -16px ${accentColor}90` : undefined,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Enter your workspace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom reassurance */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.13em] text-white/20">
        <CheckCircle2
          className="h-3.5 w-3.5"
          style={{ color: `${accentColor}80` }}
        />
        You can change these settings anytime in workspace settings
      </div>
    </div>
  );
}

function StepEyebrow({
  number,
  accentColor = PINK,
  accentSoft = PINK_SOFT,
}: {
  number: string;
  accentColor?: string;
  accentSoft?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: accentColor }}
      />

      <span
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: accentSoft }}
      >
        Step {number}
      </span>
    </div>
  );
}

function SelectionHint({
  count,
  label,
  accentColor = PINK,
}: {
  count: number;
  label: string;
  accentColor?: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-2 text-[10px] text-white/20">
      <Check
        className="h-3.5 w-3.5"
        style={{
          color: count > 0 ? accentColor : "rgba(255,255,255,0.2)",
        }}
      />
      {count > 0 ? `${count} ${label}` : "Select at least one"}
    </div>
  );
}

function SummaryPill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-white/40">
      {children}
    </span>
  );
}
