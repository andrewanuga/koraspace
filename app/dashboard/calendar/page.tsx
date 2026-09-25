"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  AtSign,
  Building2,
  Layout,
  Sparkles,
  Bot,
  X,
  Loader2,
  Image as ImageIcon,
  Clock,
  FileText,
  CheckCircle2,
  Send,
  AlertCircle,
  Briefcase,
  Music2,
  Zap,
  Trash2,
  RefreshCw,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Check,
  Globe,
  Radio,
  Tv,
  Smartphone,
  Monitor,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Eye,
  Edit3,
  Lightbulb,
  Copy,
  CheckCheck,
  Wand2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  PageHeader,
  GlassCard,
  Pill,
  PrimaryButton,
  StatTile,
} from "@/components/dashboard/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import imageCompression from "browser-image-compression";
import {
  getOptimalPostTimeForDay,
  PLATFORM_CONFIGS,
  type OptimalTimeSlot,
} from "@/lib/calendar/bestTime";
import { platformLabel } from "@/lib/dashboard/helpers";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  x: "#1DA1F2",
  twitter: "#1DA1F2",
  tiktok: "#00F2FE",
  youtube: "#FF0000",
  threads: "#9CA3AF",
  facebook: "#1877F2",
};

const PLATFORM_IMAGE_MAP: Record<string, string> = {
  youtube: "/integrations/yt.png",
  instagram: "/integrations/insta.png",
  facebook: "/integrations/facebook.png",
  x: "/integrations/twitter.png",
  twitter: "/integrations/twitter.png",
  threads: "/integrations/threads.png",
  telegram: "/integrations/telegram.png",
  tiktok: "/integrations/ticktok.png",
  whatsapp: "/integrations/whatsapp.png",
  linkedin: "/integrations/linkedin.png",
  snapchat: "/integrations/Snapchat.png",
  reddit: "/integrations/reddit.png",
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatEventTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatEventDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function isVideoUrl(url?: string) {
  if (!url) return false;
  return /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(url) || url.includes("video");
}

function RenderSmartPreviewMedia({
  mediaUrls,
  content,
  aspectRatio = "aspect-square",
  className = "",
}: {
  mediaUrls?: string[];
  content?: string;
  aspectRatio?: string;
  className?: string;
}) {
  if (mediaUrls && mediaUrls.length > 0) {
    const isVideo = isVideoUrl(mediaUrls[0]);
    return (
      <div className={`relative w-full ${aspectRatio} overflow-hidden bg-black/90 flex items-center justify-center ${className}`}>
        {isVideo ? (
          <video
            src={mediaUrls[0]}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={mediaUrls[0]}
            alt="Media Attachment"
            className="w-full h-full object-cover"
          />
        )}

        {/* Media Type / Count Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
          {isVideo ? (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-semibold flex items-center gap-1 shadow-sm">
              <Tv className="w-2.5 h-2.5 text-white" />
              Video
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-semibold flex items-center gap-1 shadow-sm">
              <ImageIcon className="w-2.5 h-2.5 text-white" />
              Image
            </span>
          )}
        </div>

        {mediaUrls.length > 1 && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white text-[9px] font-semibold font-mono shadow-sm z-10 pointer-events-none">
            1 / {mediaUrls.length}
          </span>
        )}
      </div>
    );
  }

  // Fallback visual canvas when no media uploaded
  return (
    <div className={`w-full ${aspectRatio} p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[var(--panel-fill-2)] via-[var(--panel-fill)] to-[var(--panel-fill-2)] relative overflow-hidden ${className}`}>
      <div className="w-11 h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-2.5 shadow-md">
        <Sparkles className="w-5 h-5" />
      </div>
      <p className="text-xs sm:text-sm font-semibold text-[var(--fg)] max-w-[280px] line-clamp-4 leading-relaxed">
        {content || "Visual Post Content"}
      </p>
      <span className="text-[9.5px] text-[var(--fg-4)] font-mono mt-2.5 uppercase tracking-wider">
        Visual Feed Asset
      </span>
    </div>
  );
}

function getAiRecommendations(event: CalendarEventItem, platform: string) {
  const content = (event.content || event.title || "").trim();
  const len = content.length;
  const p = platform.toLowerCase();
  const hasMedia = Boolean(event.media_urls && event.media_urls.length > 0);

  const recommendations: Array<{
    category: string;
    title: string;
    advice: string;
    scoreBoost: string;
    badge: string;
  }> = [];

  // 1. Hook Optimization
  if (!content.includes("?") && !content.includes("!") && len > 40) {
    recommendations.push({
      category: "Hook & Intrigue",
      title: "Add Curiosity Question in Opening",
      advice: "Opening with an intriguing question (e.g. 'What if...') increases feed dwell time by up to 38%.",
      scoreBoost: "+15% Read-Through",
      badge: "High Impact",
    });
  } else {
    recommendations.push({
      category: "Hook & Intrigue",
      title: "Strong Scroll-Stopping Hook",
      advice: "Your opening statement clearly establishes context and attracts attention quickly.",
      scoreBoost: "+20% Hook Rate",
      badge: "Optimized",
    });
  }

  // 2. Platform Nuance & Formatting
  if (p === "x" || p === "twitter") {
    if (len > 240) {
      recommendations.push({
        category: "Platform Fit",
        title: "Trim for Quote-Tweets",
        advice: "Shortening by ~30 chars leaves ample space for audience commentary when retweeted.",
        scoreBoost: "+24% Reposts",
        badge: "X Growth",
      });
    } else {
      recommendations.push({
        category: "Platform Fit",
        title: "Punchy Feed Density",
        advice: "Format is crisp and readable on mobile timelines without truncation.",
        scoreBoost: "+18% Engagement",
        badge: "Optimal",
      });
    }
  } else if (p === "linkedin") {
    if (!content.includes("\n\n")) {
      recommendations.push({
        category: "Platform Fit",
        title: "Add Line Breaks for Mobile Readers",
        advice: "Separate main thoughts into 1-2 sentence micro-paragraphs to maximize LinkedIn mobile readability.",
        scoreBoost: "+30% Dwell Time",
        badge: "Format Tip",
      });
    } else {
      recommendations.push({
        category: "Platform Fit",
        title: "Clean White Space Hierarchy",
        advice: "Paragraph pacing creates an inviting reading rhythm for professional feeds.",
        scoreBoost: "+22% Dwell Time",
        badge: "Optimal",
      });
    }
  } else if (p === "instagram") {
    if (!content.includes("#")) {
      recommendations.push({
        category: "Discovery",
        title: "Include 3–5 Targeted Hashtags",
        advice: "Add specific niche community tags (#aistrategy, #buildinpublic) in caption footer to index on Explore.",
        scoreBoost: "+25% Discovery",
        badge: "SEO",
      });
    }
    if (!hasMedia) {
      recommendations.push({
        category: "Media",
        title: "Attach Visual Carousel or Clip",
        advice: "Instagram algorithm heavily indexes visual carousels and reels over plain text.",
        scoreBoost: "+40% Reach",
        badge: "Media Alert",
      });
    }
  } else if (p === "tiktok") {
    recommendations.push({
      category: "Retention",
      title: "Sync Audio & Kinetic Text",
      advice: "Combine spoken hook with on-screen kinetic subtitle animations in the first 3 seconds.",
      scoreBoost: "+35% Completion",
      badge: "Watch-Time",
    });
  }

  // 3. Call to Action / Discussion Spark
  if (!/(comment|link|below|share|save|drop|follow|thoughts|opinion)/i.test(content)) {
    recommendations.push({
      category: "Call to Action",
      title: "Add Conversational Discussion CTA",
      advice: "Conclude with an engaging prompt like 'What's your take on this?' to initiate active comment threads.",
      scoreBoost: "+28% Comments",
      badge: "Conversion",
    });
  }

  return recommendations;
}

function generateEnhancedCopy(content: string, platform: string) {
  const p = platform.toLowerCase();
  const trimmed = content.trim();
  if (!trimmed) return "";

  if (p === "x" || p === "twitter") {
    return `⚡ ${trimmed}\n\nWhat's your take on this? Repost if you found this valuable.`;
  }
  if (p === "linkedin") {
    return `💡 Strategic Insight:\n\n${trimmed}\n\n---\nKey Takeaway: High-signal execution and consistency compound.\n\n👇 What has your experience been with this? Let's discuss below.`;
  }
  if (p === "instagram") {
    return `${trimmed}\n\n.\n.\n💬 Double tap if you agree & save this for later!\n#growth #contentstrategy #buildinpublic #productivity`;
  }
  if (p === "tiktok") {
    return `🔥 ${trimmed}\n\nDrop a comment below with your thoughts! 👇 #fyp #growthtips #creator`;
  }
  return `${trimmed}\n\n👉 Let us know your thoughts in the comments below!`;
}

/* -------------------------------------------------------------------------- */
/*                              PLATFORM ICON                                 */
/* -------------------------------------------------------------------------- */

function PlatformIcon({
  platform,
  className = "w-3.5 h-3.5",
}: {
  platform: string;
  className?: string;
}) {
  const p = platform?.toLowerCase() || "";
  const imgSrc = PLATFORM_IMAGE_MAP[p];

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={platform}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  switch (p) {
    case "instagram":
      return <Camera className={`${className} text-[var(--fg)] dark:text-white`} />;
    case "linkedin":
      return <Briefcase className={`${className} text-[var(--fg)] dark:text-white`} />;
    case "x":
    case "twitter":
      return <AtSign className={`${className} text-[var(--fg)] dark:text-white`} />;
    case "tiktok":
      return <Music2 className={`${className} text-[var(--fg)] dark:text-white`} />;
    case "youtube":
      return <Tv className={`${className} text-[var(--fg)] dark:text-white`} />;
    case "threads":
      return <AtSign className={`${className} text-[var(--fg)] dark:text-white`} />;
    case "facebook":
      return <Globe className={`${className} text-[var(--fg)] dark:text-white`} />;
    default:
      return <Bot className={`${className} text-[var(--fg)] dark:text-white`} />;
  }
}

/* -------------------------------------------------------------------------- */
/*                            MINI MONTH PICKER                               */
/* -------------------------------------------------------------------------- */

function MiniDatePicker({
  currentMonth,
  currentYear,
  onSelect,
  onClose,
}: {
  currentMonth: number;
  currentYear: number;
  onSelect: (month: number, year: number) => void;
  onClose: () => void;
}) {
  const [pickerYear, setPickerYear] = useState(currentYear);
  const now = new Date();

  return (
    <div
      className="absolute top-full left-0 mt-3 z-50 w-[290px] rounded-2xl overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--stroke)]">
        <button
          type="button"
          onClick={() => setPickerYear((y) => y - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-bold text-[var(--fg)]">{pickerYear}</span>

        <button
          type="button"
          onClick={() => setPickerYear((y) => y + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-3">
        {MONTHS_SHORT.map((month, index) => {
          const isSelected =
            index === currentMonth && pickerYear === currentYear;
          const isCurrent =
            index === now.getMonth() && pickerYear === now.getFullYear();

          return (
            <button
              type="button"
              key={month}
              onClick={() => {
                onSelect(index, pickerYear);
                onClose();
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-[var(--brand-primary)] text-white shadow-md"
                  : isCurrent
                  ? "border border-[var(--brand-primary-border)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)]"
                  : "text-[var(--fg-4)] hover:bg-[var(--hover)] hover:text-[var(--fg)]"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            onSelect(now.getMonth(), now.getFullYear());
            onClose();
          }}
          className="w-full py-2.5 rounded-xl border border-[var(--stroke)] text-xs font-semibold text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
        >
          Jump to Today
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            TYPES & INTERFACES                              */
/* -------------------------------------------------------------------------- */

interface SocialAccountOption {
  id: string;
  platform: string;
  handle?: string;
  display_name?: string;
  avatar_url?: string;
}

interface CalendarEventItem {
  id: string;
  title: string;
  platform: string;
  trigger_at: string;
  type: "post" | "ai_task";
  status?: string;
  content?: string;
  media_urls?: string[];
  raw?: any;
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function CalendarPage() {
  const supabase = createClient();
  const { error: toastError, success: toastSuccess } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const now = new Date();

  // Navigation & Views
  const [view, setView] = useState<"calendar" | "grid">("calendar");
  const [previewDevice, setPreviewDevice] = useState<"phone" | "desktop">("phone");
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [platformFilter, setPlatformFilter] = useState("All");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Authenticated State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<SocialAccountOption[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Composer Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"post" | "ai_task" | "ai_batch">("post");
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number }>({
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  });
  const [selectedTime, setSelectedTime] = useState<{ hour: number; minute: number; ampm: "AM" | "PM" }>({
    hour: 10,
    minute: 0,
    ampm: "AM",
  });
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [postContent, setPostContent] = useState("");
  const [aiTaskTitle, setAiTaskTitle] = useState("");
  const [aiTaskPrompt, setAiTaskPrompt] = useState("");
  const [batchTopic, setBatchTopic] = useState("");
  const [batchIdeas, setBatchIdeas] = useState<Array<{ dayOffset: number; idea: string; timeStr: string }>>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ file: File; previewUrl: string; type: "image" | "video" }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Event Detail / Reschedule Popover
  const [selectedEventDetail, setSelectedEventDetail] = useState<CalendarEventItem | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Smart Multi-Platform Content Preview State
  const [smartPreviewEvent, setSmartPreviewEvent] = useState<CalendarEventItem | null>(null);
  const [smartPreviewPlatform, setSmartPreviewPlatform] = useState<string>("instagram");
  const [copiedEnhanced, setCopiedEnhanced] = useState(false);

  // Day Selection Modal (when multiple contents exist on a single day)
  const [daySelectionModal, setDaySelectionModal] = useState<{
    date: Date;
    dayNum: number;
    events: CalendarEventItem[];
  } | null>(null);

  const openSmartPreview = (event: CalendarEventItem) => {
    setSmartPreviewEvent(event);
    const p = event.platform?.toLowerCase() || "instagram";
    setSmartPreviewPlatform(p === "all" ? "instagram" : p);
  };

  /* ---------------------------------------------------------------------- */
  /*                              LOAD DATA                                 */
  /* ---------------------------------------------------------------------- */

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
      }

      // 2. Load connected social accounts
      const { data: accountsData } = await supabase
        .from("social_accounts")
        .select("id, platform, handle, display_name, avatar_url")
        .eq("status", "connected");

      const connectedAccounts = (accountsData || []) as SocialAccountOption[];
      setAccounts(connectedAccounts);

      if (connectedAccounts.length > 0 && !selectedPlatform) {
        setSelectedPlatform(connectedAccounts[0].platform);
      }

      // 3. Load scheduled AI tasks
      const { data: aiTasksData } = await supabase
        .from("scheduled_ai_tasks")
        .select("id, title, platform, trigger_at, status, prompt, media_urls")
        .in("status", ["pending", "scheduled"])
        .order("trigger_at", { ascending: true });

      // 4. Load scheduled direct posts
      const { data: scheduledPostsData } = await supabase
        .from("scheduled_posts")
        .select("id, content, platform, scheduled_at, status, error_message")
        .in("status", ["scheduled", "queued", "pending"])
        .order("scheduled_at", { ascending: true });

      let merged: CalendarEventItem[] = [];

      if (aiTasksData) {
        merged = [
          ...merged,
          ...aiTasksData.map((task: any) => ({
            id: task.id,
            title: task.title,
            platform: task.platform || "all",
            trigger_at: task.trigger_at,
            type: "ai_task" as const,
            status: task.status,
            content: task.prompt,
            media_urls: task.media_urls || [],
            raw: task,
          })),
        ];
      }

      if (scheduledPostsData) {
        merged = [
          ...merged,
          ...scheduledPostsData.map((post: any) => ({
            id: post.id,
            title:
              post.content?.substring(0, 45) +
              (post.content?.length > 45 ? "..." : ""),
            platform: post.platform,
            trigger_at: post.scheduled_at,
            type: "post" as const,
            status: post.status,
            content: post.content,
            raw: post,
          })),
        ];
      }

      setScheduledEvents(merged);
    } catch (err: any) {
      console.error("[Calendar] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                         CONNECTED ACCOUNTS FILTERS                     */
  /* ---------------------------------------------------------------------- */

  const connectedAccountFilters = useMemo(() => {
    const list: Array<{
      id: string;
      platform: string;
      label: string;
      platformName: string;
      handle?: string;
      avatar_url?: string;
    }> = [
      {
        id: "All",
        platform: "all",
        label: "All Accounts",
        platformName: "All Accounts",
      },
    ];

    accounts.forEach((acc) => {
      const p = (acc.platform || "").toLowerCase();
      const displayName = acc.handle
        ? `@${acc.handle.replace(/^@/, "")}`
        : acc.display_name || platformLabel(acc.platform);

      list.push({
        id: acc.id || p,
        platform: p,
        label: displayName,
        platformName: platformLabel(acc.platform),
        handle: acc.handle,
        avatar_url: acc.avatar_url,
      });
    });

    return list;
  }, [accounts]);

  const dynamicPlatformFilters = useMemo(() => {
    const set = new Set<string>(["All"]);
    accounts.forEach((acc) => {
      if (acc.platform) set.add(platformLabel(acc.platform));
    });
    return Array.from(set);
  }, [accounts]);

  const getPlatformCount = (platformKey: string) => {
    if (platformKey === "All" || platformKey === "all") return scheduledEvents.length;
    return scheduledEvents.filter((e) => {
      const p = (e.platform || "").toLowerCase();
      const target = platformKey.toLowerCase();
      return p === target || platformLabel(e.platform).toLowerCase() === target;
    }).length;
  };

  /* ---------------------------------------------------------------------- */
  /*                         BEST TIME COMPUTATION                          */
  /* ---------------------------------------------------------------------- */

  const activeOptimalSlot = useMemo<OptimalTimeSlot>(() => {
    const targetDate = new Date(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day
    );
    return getOptimalPostTimeForDay(targetDate, selectedPlatform);
  }, [selectedDate, selectedPlatform]);

  const applyBestTime = () => {
    setSelectedTime({
      hour: activeOptimalSlot.hour,
      minute: activeOptimalSlot.minute,
      ampm: activeOptimalSlot.ampm,
    });
    toastSuccess(
      "Optimal Time Applied",
      `Set to ${activeOptimalSlot.formatted} (${activeOptimalSlot.surgeWindow})`
    );
  };

  /* ---------------------------------------------------------------------- */
  /*                              NAVIGATION                                */
  /* ---------------------------------------------------------------------- */

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  // Close mini date picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setShowDatePicker(false);
      }
    }
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDatePicker]);

  /* ---------------------------------------------------------------------- */
  /*                         SLOT OPEN COMPOSER                             */
  /* ---------------------------------------------------------------------- */

  const handleOpenComposerForDay = (day: number) => {
    const targetDate = new Date(currentYear, currentMonth, day);
    const optimal = getOptimalPostTimeForDay(targetDate, selectedPlatform || accounts[0]?.platform);

    setSelectedDate({ year: currentYear, month: currentMonth, day });
    setSelectedTime({
      hour: optimal.hour,
      minute: optimal.minute,
      ampm: optimal.ampm,
    });
    setModalMode("post");
    setShowModal(true);
  };

  /* ---------------------------------------------------------------------- */
  /*                              MEDIA UPLOAD                              */
  /* ---------------------------------------------------------------------- */

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
      toastError("File too large", "Videos must be under 50MB.");
      return;
    }

    let finalFile = file;
    if (file.type.startsWith("image/")) {
      try {
        finalFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      } catch (error) {
        console.error("Compression error:", error);
      }
    }

    const previewUrl = URL.createObjectURL(finalFile);
    setMediaFiles((prev) => [
      ...prev,
      {
        file: finalFile,
        previewUrl,
        type: finalFile.type.startsWith("video/") ? "video" : "image",
      },
    ]);
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const files = [...prev];
      URL.revokeObjectURL(files[index].previewUrl);
      files.splice(index, 1);
      return files;
    });
  };

  /* ---------------------------------------------------------------------- */
  /*                         SCHEDULE ACTIONS                               */
  /* ---------------------------------------------------------------------- */

  const buildIsoScheduledAt = (
    date: { year: number; month: number; day: number },
    time: { hour: number; minute: number; ampm: "AM" | "PM" }
  ) => {
    let hour24 = time.hour;
    if (time.ampm === "PM" && time.hour !== 12) hour24 = time.hour + 12;
    if (time.ampm === "AM" && time.hour === 12) hour24 = 0;
    return new Date(date.year, date.month, date.day, hour24, time.minute).toISOString();
  };

  const handleSave = async () => {
    const platform = selectedPlatform || accounts[0]?.platform || "x";
    const scheduledAt = buildIsoScheduledAt(selectedDate, selectedTime);

    if (modalMode === "post") {
      if (!postContent.trim()) {
        toastError("Missing Content", "Please write your post content before scheduling.");
        return;
      }

      setIsSaving(true);
      try {
        const res = await fetch("/api/posts/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: postContent.trim(),
            platforms: [platform],
            scheduledAt,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to schedule post");

        toastSuccess("Post Scheduled", `Queued for ${formatEventDate(scheduledAt)} at ${formatEventTime(scheduledAt)}`);
        setShowModal(false);
        setPostContent("");
        setMediaFiles([]);
        loadData();
      } catch (err: any) {
        toastError("Scheduling Error", err.message || "Failed to schedule post");
      } finally {
        setIsSaving(false);
      }
    } else if (modalMode === "ai_task") {
      if (!aiTaskTitle.trim() || !aiTaskPrompt.trim()) {
        toastError("Missing Fields", "Please provide a task title and instructions.");
        return;
      }

      setIsSaving(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const userId = user?.id || currentUserId;
        if (!userId) throw new Error("Authentication required to schedule AI tasks.");

        const uploadedUrls: string[] = [];
        for (const media of mediaFiles) {
          const fileExt = media.file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("media")
            .upload(filePath, media.file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("media")
              .getPublicUrl(filePath);
            uploadedUrls.push(publicUrlData.publicUrl);
          }
        }

        const { error: dbError } = await supabase.from("scheduled_ai_tasks").insert({
          user_id: userId,
          title: aiTaskTitle.trim(),
          prompt: aiTaskPrompt.trim(),
          platform,
          trigger_at: scheduledAt,
          media_urls: uploadedUrls,
          status: "pending",
        });

        if (dbError) throw dbError;

        await supabase.from("tasks").insert({
          user_id: userId,
          title: `[AI] ${aiTaskTitle.trim()}`,
          notes: `Platform: ${platformLabel(platform)}\nScheduled: ${new Date(scheduledAt).toLocaleString()}\nPrompt: ${aiTaskPrompt}`,
          priority: "normal",
          status: "pending",
        });

        toastSuccess("AI Task Scheduled", `AI agent scheduled to execute on ${formatEventDate(scheduledAt)}`);
        setShowModal(false);
        setAiTaskTitle("");
        setAiTaskPrompt("");
        setMediaFiles([]);
        loadData();
      } catch (err: any) {
        toastError("Error", err.message || "Failed to schedule AI task");
      } finally {
        setIsSaving(false);
      }
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                      BATCH AI WEEK PLANNER                             */
  /* ---------------------------------------------------------------------- */

  const handleGenerateBatchIdeas = async () => {
    if (!batchTopic.trim()) {
      toastError("Topic required", "Please enter a topic or focus for the week.");
      return;
    }

    setIsGeneratingBatch(true);
    try {
      // Upload any reference images to pass to Gemini Vision
      const uploadedUrls: string[] = [];
      if (mediaFiles.length > 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || currentUserId;

        if (userId) {
          for (const media of mediaFiles) {
            const fileExt = media.file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("media")
              .upload(filePath, media.file);

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from("media")
                .getPublicUrl(filePath);
              uploadedUrls.push(publicUrlData.publicUrl);
            }
          }
        }
      }

      const res = await fetch("/api/ideas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: batchTopic.trim(),
          imageUrls: uploadedUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate ideas");

      const ideasList: string[] = data.ideas || [];
      const generated = ideasList.slice(0, 5).map((idea, index) => {
        const dayOffset = index + 1;
        const targetDate = new Date(selectedDate.year, selectedDate.month, selectedDate.day + dayOffset);
        const slot = getOptimalPostTimeForDay(targetDate, selectedPlatform);
        return {
          dayOffset,
          idea,
          timeStr: `${slot.formatted} (${slot.label})`,
        };
      });

      setBatchIdeas(generated);
    } catch (err: any) {
      toastError("AI Generation Failed", err.message || "Failed to generate plan");
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleScheduleAllBatchIdeas = async () => {
    if (batchIdeas.length === 0) return;

    setIsSaving(true);
    try {
      const platform = selectedPlatform || accounts[0]?.platform || "x";

      // Upload reference media if any
      const uploadedUrls: string[] = [];
      if (mediaFiles.length > 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id || currentUserId;

        if (userId) {
          for (const media of mediaFiles) {
            const fileExt = media.file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from("media")
              .upload(filePath, media.file);

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from("media")
                .getPublicUrl(filePath);
              uploadedUrls.push(publicUrlData.publicUrl);
            }
          }
        }
      }

      for (const item of batchIdeas) {
        const targetDate = new Date(selectedDate.year, selectedDate.month, selectedDate.day + item.dayOffset);
        const slot = getOptimalPostTimeForDay(targetDate, platform);
        const scheduledAt = buildIsoScheduledAt(
          {
            year: targetDate.getFullYear(),
            month: targetDate.getMonth(),
            day: targetDate.getDate(),
          },
          { hour: slot.hour, minute: slot.minute, ampm: slot.ampm }
        );

        await fetch("/api/posts/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: item.idea,
            platforms: [platform],
            scheduledAt,
            mediaUrls: uploadedUrls,
          }),
        });
      }

      toastSuccess("Week Scheduled!", `Successfully scheduled ${batchIdeas.length} posts across optimal peak times.`);
      setShowModal(false);
      setBatchIdeas([]);
      setBatchTopic("");
      setMediaFiles([]);
      loadData();
    } catch (err: any) {
      toastError("Batch Error", err.message || "Failed to schedule batch posts");
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                         RESCHEDULE & DELETE                            */
  /* ---------------------------------------------------------------------- */

  const handleDeleteEvent = async (event: CalendarEventItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      if (event.type === "post") {
        const res = await fetch(`/api/posts/schedule?id=${event.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const { error } = await supabase.from("scheduled_posts").delete().eq("id", event.id);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from("scheduled_ai_tasks").delete().eq("id", event.id);
        if (error) throw error;
      }

      setScheduledEvents((prev) => prev.filter((item) => item.id !== event.id));
      setSelectedEventDetail(null);
      toastSuccess("Deleted", "Scheduled item removed from calendar.");
    } catch (err: any) {
      toastError("Delete Failed", err.message || "Failed to remove event");
    }
  };

  const handleShiftDay = async (event: CalendarEventItem, daysDelta: number) => {
    setIsRescheduling(true);
    try {
      const current = new Date(event.trigger_at);
      current.setDate(current.getDate() + daysDelta);
      const newIso = current.toISOString();

      if (event.type === "post") {
        const res = await fetch("/api/posts/schedule", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: event.id, scheduled_at: newIso }),
        });
        if (!res.ok) {
          await supabase.from("scheduled_posts").update({ scheduled_at: newIso }).eq("id", event.id);
        }
      } else {
        await supabase.from("scheduled_ai_tasks").update({ trigger_at: newIso }).eq("id", event.id);
      }

      setScheduledEvents((prev) =>
        prev.map((item) => (item.id === event.id ? { ...item, trigger_at: newIso } : item))
      );

      if (selectedEventDetail?.id === event.id) {
        setSelectedEventDetail({ ...selectedEventDetail, trigger_at: newIso });
      }

      toastSuccess("Rescheduled", `Shifted to ${formatEventDate(newIso)} at ${formatEventTime(newIso)}`);
    } catch (err: any) {
      toastError("Reschedule Failed", err.message);
    } finally {
      setIsRescheduling(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                         CALENDAR GRID CELLS                            */
  /* ---------------------------------------------------------------------- */

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const upcomingTasks = scheduledEvents
    .filter((task) => new Date(task.trigger_at) >= new Date())
    .sort((a, b) => +new Date(a.trigger_at) - +new Date(b.trigger_at))
    .slice(0, 4);

  const charLimit = PLATFORM_CONFIGS[selectedPlatform?.toLowerCase()]?.maxChars || 2200;

  /* ---------------------------------------------------------------------- */
  /*                                RENDER                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 lg:px-6 pb-8 min-h-[calc(100vh-80px)] flex flex-col">
      {/* ================================================================ */}
      {/* PAGE HEADER                                                      */}
      {/* ================================================================ */}

      <PageHeader
        eyebrow="CONTENT PLANNING & AUDIENCE TIMING"
        title="Content Calendar"
        sub="Plan, schedule, and optimize posts with live Best-Time-To-Post audience intelligence."
        actions={
          <div className="flex items-center gap-2">
            {/* VIEW SWITCHER */}
            <div className="hidden md:flex items-center p-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]">
              <button
                type="button"
                onClick={() => setView("calendar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  view === "calendar"
                    ? "bg-[var(--panel-fill-2)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[var(--fg)] dark:text-white" />
                Calendar
              </button>

              <button
                type="button"
                onClick={() => setView("grid")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  view === "grid"
                    ? "bg-[var(--panel-fill-2)] text-[var(--fg)] shadow-sm"
                    : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[var(--fg)] dark:text-white" />
                Grid Preview
              </button>
            </div>

            {/* AI BATCH PLAN */}
            <button
              type="button"
              onClick={() => {
                setModalMode("ai_batch");
                setShowModal(true);
              }}
              className="flex items-center justify-center h-10 px-4 rounded-xl bg-white text-slate-900 border border-[var(--stroke)] shadow-sm hover:bg-slate-50 dark:bg-white dark:text-black dark:border-transparent dark:hover:bg-neutral-100 text-xs font-semibold transition-all"
            >
              <span>AI Week Plan</span>
            </button>

            {/* CREATE POST */}
            <PrimaryButton
              onClick={() => {
                setModalMode("post");
                setShowModal(true);
              }}
              className="h-10 px-4 rounded-xl shadow-md text-white"
            >
              <Plus className="w-4 h-4 mr-1 text-white" />
              Schedule Post
            </PrimaryButton>
          </div>
        }
      />

      {/* ================================================================ */}
      {/* CONNECTED ACCOUNTS FILTER BAR                                    */}
      {/* ================================================================ */}
      <div className="mt-4 mb-1 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {connectedAccountFilters.map((opt) => {
          const isActive =
            (opt.id === "All" && (platformFilter === "All" || platformFilter === "all")) ||
            platformFilter.toLowerCase() === opt.platform.toLowerCase() ||
            platformFilter.toLowerCase() === opt.id.toLowerCase() ||
            platformFilter.toLowerCase() === opt.label.toLowerCase() ||
            platformFilter.toLowerCase() === opt.platformName.toLowerCase();
          const count = getPlatformCount(opt.platform || opt.id);

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPlatformFilter(opt.platform === "all" ? "All" : opt.platform)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isActive
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs"
                  : "border-[var(--stroke)] bg-[var(--panel-fill)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--panel-fill-2)] hover:border-[var(--stroke-strong)]"
              }`}
            >
              {opt.id === "All" ? (
                <LayoutGrid
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-white dark:text-black" : "text-[var(--fg)] dark:text-white"
                  }`}
                />
              ) : opt.avatar_url ? (
                <img
                  src={opt.avatar_url}
                  alt={opt.label}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              ) : (
                <PlatformIcon platform={opt.platform} className="w-3.5 h-3.5" />
              )}
              <span className="truncate max-w-[150px]">{opt.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/15 dark:text-black"
                      : "bg-[var(--panel-fill-2)] text-[var(--fg-4)] border border-[var(--stroke)]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {accounts.length === 0 && (
          <Link
            href="/dashboard/integrations"
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-dashed border-[var(--stroke-strong)] text-[var(--fg-4)] hover:text-[var(--fg)] hover:border-[var(--brand-primary-border)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Connect Channel</span>
          </Link>
        )}
      </div>

      {/* ================================================================ */}
      {/* METRICS & QUICK SUMMARY                                          */}
      {/* ================================================================ */}

      <div className="mt-3 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Scheduled Posts"
          value={String(scheduledEvents.filter((e) => e.type === "post").length)}
          icon={CalendarIcon}
        />
        <StatTile
          label="AI Automations"
          value={String(scheduledEvents.filter((e) => e.type === "ai_task").length)}
          icon={Bot}
        />
        <StatTile
          label="This Week Queue"
          value={String(upcomingTasks.length)}
          icon={Clock}
        />
        <StatTile
          label="Connected Channels"
          value={String(accounts.length)}
          icon={CheckCircle2}
        />
      </div>

      {/* ================================================================ */}
      {/* MAIN CALENDAR CARD                                               */}
      {/* ================================================================ */}

      <GlassCard className="flex-1 flex flex-col overflow-hidden rounded-3xl border border-[#ec4899]/30 bg-[var(--panel-fill)] shadow-lg">
        {/* TOOLBAR */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 px-5 py-4 border-b border-[#ec4899]/30 bg-[var(--panel-fill)]">
          {/* LEFT: MONTH NAVIGATOR */}
          <div className="flex items-center gap-4">
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setShowDatePicker((v) => !v)}
                className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--fg)] hover:text-[var(--brand-primary)] transition-colors group"
              >
                {MONTHS[currentMonth]} {currentYear}
                <ChevronRight className="w-4 h-4 rotate-90 text-[var(--fg-4)] group-hover:text-[var(--fg)] transition-colors" />
              </button>

              {showDatePicker && (
                <MiniDatePicker
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  onSelect={(month, year) => {
                    setCurrentMonth(month);
                    setCurrentYear(year);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--fg)] dark:text-white" />
              </button>

              <button
                type="button"
                onClick={goToday}
                className="px-3 h-8 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[11px] font-semibold text-[var(--fg-4)] hover:text-[var(--fg)] hover:border-[var(--brand-primary-border)] transition-all"
              >
                Today
              </button>

              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
              >
                <ChevronRight className="w-4 h-4 text-[var(--fg)] dark:text-white" />
              </button>
            </div>
          </div>

          {/* RIGHT: DYNAMIC CONNECTED CHANNELS FILTER */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
            {dynamicPlatformFilters.map((platform) => (
              <button
                type="button"
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                className={`shrink-0 h-8 px-3 rounded-lg text-[11px] font-semibold transition-all ${
                  platformFilter.toLowerCase() === platform.toLowerCase() ||
                  (platform === "All" && (platformFilter === "All" || platformFilter === "all"))
                    ? "bg-[var(--brand-primary)] text-white shadow-md"
                    : "border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-4)] hover:text-[var(--fg)] hover:border-[var(--stroke-strong)]"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CALENDAR VIEW                                                */}
        {/* ============================================================ */}

        {view === "calendar" ? (
          <div className="flex-1 overflow-auto bg-[var(--app-bg)]">
            {/* WEEK HEADERS */}
            <div className="grid grid-cols-7 sticky top-0 z-10 border-b border-[#ec4899]/30 bg-[var(--panel-fill-2)] divide-x divide-[#ec4899]/20">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fg-4)]"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}
            <div
              className="grid grid-cols-7"
              style={{
                gridTemplateRows: `repeat(${totalCells / 7}, minmax(140px, 1fr))`,
              }}
            >
              {Array.from({ length: totalCells }).map((_, index) => {
                const dayNum = index - firstDay + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;

                const isToday =
                  isCurrentMonth &&
                  dayNum === now.getDate() &&
                  currentMonth === now.getMonth() &&
                  currentYear === now.getFullYear();

                const cellDate = new Date(currentYear, currentMonth, dayNum);
                const optimalSlot = isCurrentMonth
                  ? getOptimalPostTimeForDay(cellDate, platformFilter !== "All" ? platformFilter : undefined)
                  : null;

                const dayEvents = isCurrentMonth
                  ? scheduledEvents.filter((event) => {
                      if (!event.trigger_at) return false;
                      const date = new Date(event.trigger_at);
                      const isSameDay =
                        date.getDate() === dayNum &&
                        date.getMonth() === currentMonth &&
                        date.getFullYear() === currentYear;

                      const isSamePlatform =
                        platformFilter === "All" ||
                        event.platform.toLowerCase() === platformFilter.toLowerCase() ||
                        platformLabel(event.platform).toLowerCase() === platformFilter.toLowerCase();

                      return isSameDay && isSamePlatform;
                    })
                  : [];

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isCurrentMonth) {
                        if (dayEvents.length === 0) {
                          handleOpenComposerForDay(dayNum);
                        } else if (dayEvents.length === 1) {
                          openSmartPreview(dayEvents[0]);
                        } else {
                          setDaySelectionModal({
                            date: cellDate,
                            dayNum,
                            events: dayEvents,
                          });
                        }
                      }
                    }}
                    className={`group/cell relative border-r border-b border-[#ec4899]/30 min-h-[140px] p-2.5 transition-all cursor-pointer ${
                      isCurrentMonth
                        ? "bg-[var(--panel-fill-2)]/70 hover:bg-[var(--hover)]"
                        : "bg-[var(--app-bg)] opacity-30 cursor-default"
                    }`}
                  >
                    {/* CELL HEADER: DATE + OPTIMAL SURGE TIME */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-semibold ${
                          isToday
                            ? "bg-[var(--brand-primary)] text-white shadow-md font-bold"
                            : "text-[var(--fg-3)]"
                        }`}
                      >
                        {isCurrentMonth ? dayNum : ""}
                      </span>

                      {isCurrentMonth && optimalSlot && (
                        <div
                          title={`Peak audience activity slot: ${optimalSlot.formatted} (${optimalSlot.surgeWindow})`}
                          className="flex items-center gap-1 text-[9px] font-semibold text-black dark:text-white"
                        >
                          <Zap className="w-2.5 h-2.5 text-black dark:text-white" />
                          <span>{optimalSlot.formatted}</span>
                        </div>
                      )}
                    </div>

                    {/* EVENTS LIST */}
                    <div className="space-y-1.5">
                      {dayEvents.slice(0, 3).map((event) => {
                        const platformColor =
                          PLATFORM_COLORS[event.platform.toLowerCase()] || "var(--brand-primary)";

                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSmartPreview(event);
                            }}
                            className="group/event relative cursor-pointer overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-2 pl-2.5 hover:border-black/50 dark:hover:border-white/20 hover:shadow-sm transition-all"
                            title="Click for Smart Multi-Platform Content Preview"
                          >
                            {/* Left Platform Accent */}
                            <div
                              className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-r-full"
                              style={{ background: platformColor }}
                            />

                            <div className="flex items-start gap-1.5">
                              <div className="mt-0.5 shrink-0">
                                <PlatformIcon platform={event.platform} className="w-3.5 h-3.5 text-[var(--fg)] dark:text-white" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium text-[var(--fg)] truncate">
                                  {event.title}
                                </p>

                                <div className="flex items-center gap-1 mt-0.5 text-[8.5px] text-black dark:text-white/80">
                                  <Clock className="w-2.5 h-2.5 text-black dark:text-white" />
                                  <span className="font-medium text-black dark:text-white">{formatEventTime(event.trigger_at)}</span>
                                  <span className="capitalize text-[8px] opacity-75 text-[var(--fg-4)]">
                                    • {event.type === "post" ? "Post" : "AI Task"}
                                  </span>
                                </div>
                              </div>

                              {/* Quick Delete */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteEvent(event, e)}
                                title="Remove scheduled event"
                                className="opacity-0 group-hover/event:opacity-100 p-1 text-[var(--fg-4)] hover:text-red-500 rounded transition-opacity"
                              >
                                <X className="w-3 h-3 text-[var(--fg-4)] hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setDaySelectionModal({
                              date: cellDate,
                              dayNum,
                              events: dayEvents,
                            });
                          }}
                          className="text-[9px] text-[var(--fg)] px-1 font-semibold hover:underline cursor-pointer"
                        >
                          +{dayEvents.length - 3} more scheduled
                        </div>
                      )}
                    </div>

                    {/* HOVER ADD BUTTON */}
                    {isCurrentMonth && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenComposerForDay(dayNum);
                        }}
                        className="absolute bottom-1.5 right-1.5 opacity-0 group-hover/cell:opacity-100 flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--panel-fill)] border border-[var(--stroke)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-black/40 dark:hover:border-white/20 transition-all shadow-sm"
                        title="Schedule post on this day"
                      >
                        <Plus className="w-3.5 h-3.5 text-[var(--fg)] dark:text-white" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* VISUAL GRID PREVIEW                                          */
          /* ============================================================ */
          <div className="flex-1 overflow-auto bg-[var(--app-bg)] flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 gap-8 lg:gap-12">
            <div className="max-w-[320px] w-full space-y-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-black border border-black text-white dark:bg-white/[0.06] dark:border-white/10 dark:text-white flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--fg)]">
                  Feed Grid Preview
                </h3>
                <p className="text-sm text-[var(--fg-4)] leading-relaxed mt-1">
                  Preview how your scheduled media and captions will look on your feed before publishing.
                </p>
              </div>

              {/* DEVICE SCREEN SWITCHER */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block">
                  Device Screen View
                </label>
                <div className="flex items-center gap-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("phone")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewDevice === "phone"
                        ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                        : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      previewDevice === "desktop"
                        ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                        : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3.5">
                <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-[var(--fg)]">
                  <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                  <span>Visual Consistency</span>
                </div>
                <p className="text-xs text-[var(--fg-4)]">
                  Arrange drafts and media posts to maintain a polished visual brand identity.
                </p>
              </div>
            </div>

            {/* PREVIEW FRAME */}
            {previewDevice === "phone" ? (
              /* PHONE FRAME */
              <div className="w-full max-w-[340px] h-[640px] rounded-[36px] overflow-hidden border border-[var(--stroke-strong)] bg-[var(--panel-fill-2)] shadow-2xl flex flex-col transition-all">
                <div className="h-11 border-b border-[var(--stroke)] flex items-center justify-between px-5 bg-[var(--panel-fill)]">
                  <span className="text-xs font-bold text-[var(--fg)]">
                    @{accounts[0]?.handle || accounts[0]?.display_name || "koraspace"}
                  </span>
                  <Layout className="w-3.5 h-3.5 text-[var(--fg-4)]" />
                </div>

                <div className="p-4 border-b border-[var(--stroke)] flex items-center gap-3 bg-[var(--panel-fill)]">
                  <div className="w-12 h-12 rounded-full bg-black text-white dark:bg-white/10 flex items-center justify-center font-bold shadow-md shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-4 text-center flex-1 justify-around">
                    <div>
                      <p className="text-xs font-bold text-[var(--fg)]">{scheduledEvents.length + 24}</p>
                      <p className="text-[9px] text-[var(--fg-4)]">Posts</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--fg)]">14.8K</p>
                      <p className="text-[9px] text-[var(--fg-4)]">Audience</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--fg)]">340</p>
                      <p className="text-[9px] text-[var(--fg-4)]">Following</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-[var(--app-bg)] overflow-y-auto p-1.5">
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: 15 }).map((_, index) => {
                      const post = scheduledEvents[index];
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (post) {
                              setSmartPreviewEvent(post);
                              setSmartPreviewPlatform(post.platform?.toLowerCase() || "instagram");
                            }
                          }}
                          className={`aspect-square relative rounded-lg overflow-hidden border flex items-center justify-center p-1 text-center transition-all ${
                            post
                              ? "border-[var(--stroke-strong)] bg-[var(--panel-fill-2)] cursor-pointer hover:border-black/60 dark:hover:border-white/40 hover:scale-[1.02] shadow-xs group/post"
                              : "border-[var(--stroke)] bg-[var(--panel-fill)]/40"
                          }`}
                          title={post ? "Click for Smart Multi-Platform Content Preview" : undefined}
                        >
                          {post ? (
                            <div className="relative w-full h-full flex flex-col justify-between p-1">
                              <div className="text-[8.5px] font-medium text-[var(--fg-3)] line-clamp-3 text-left">
                                {post.title}
                              </div>
                              <div className="flex items-center justify-between text-[7px] text-[var(--fg-4)] font-mono pt-1">
                                <PlatformIcon platform={post.platform} className="w-2.5 h-2.5" />
                                <span>{formatEventTime(post.trigger_at)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-[var(--stroke)]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* DESKTOP SCREEN FRAME */
              <div className="w-full max-w-[660px] h-[640px] rounded-2xl overflow-hidden border border-[var(--stroke-strong)] bg-[var(--panel-fill-2)] shadow-2xl flex flex-col transition-all">
                {/* Browser Bar */}
                <div className="h-10 border-b border-[var(--stroke)] flex items-center justify-between px-4 bg-[var(--panel-fill)] shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-[var(--panel-fill-2)] border border-[var(--stroke)] text-[10px] text-[var(--fg-4)] font-mono max-w-[280px] w-full justify-center">
                    <span className="truncate">koraspace.com/@{accounts[0]?.handle || accounts[0]?.display_name || "koraspace"}</span>
                  </div>
                  <div className="w-8 flex justify-end">
                    <Layout className="w-3.5 h-3.5 text-[var(--fg-4)]" />
                  </div>
                </div>

                {/* Desktop Header */}
                <div className="p-5 border-b border-[var(--stroke)] bg-[var(--panel-fill)] shrink-0">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-black text-white dark:bg-white/10 flex items-center justify-center font-bold shadow-lg shrink-0">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--fg)] truncate">
                            {accounts[0]?.display_name || "Koraspace Creator"}
                          </h4>
                          <p className="text-[11px] text-[var(--fg-4)]">
                            @{accounts[0]?.handle || accounts[0]?.display_name || "koraspace"}
                          </p>
                        </div>
                        <span className="text-[9.5px] px-2.5 py-0.5 rounded-md border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] font-semibold">
                          Desktop View
                        </span>
                      </div>
                      <div className="flex gap-6 text-left pt-1">
                        <div>
                          <span className="text-xs font-bold text-[var(--fg)] mr-1">{scheduledEvents.length + 24}</span>
                          <span className="text-[10px] text-[var(--fg-4)]">posts</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--fg)] mr-1">14.8K</span>
                          <span className="text-[10px] text-[var(--fg-4)]">followers</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[var(--fg)] mr-1">340</span>
                          <span className="text-[10px] text-[var(--fg-4)]">following</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Grid Content */}
                <div className="flex-1 bg-[var(--app-bg)] overflow-y-auto p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 12 }).map((_, index) => {
                      const post = scheduledEvents[index];
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (post) {
                              setSmartPreviewEvent(post);
                              setSmartPreviewPlatform(post.platform?.toLowerCase() || "instagram");
                            }
                          }}
                          className={`aspect-square relative rounded-xl overflow-hidden border flex items-center justify-center p-3 text-center transition-all hover:border-[var(--stroke-strong)] ${
                            post
                              ? "border-[var(--stroke)] bg-[var(--panel-fill-2)] shadow-xs cursor-pointer hover:border-black/60 dark:hover:border-white/40 hover:scale-[1.02] group/dpost"
                              : "border-[var(--stroke)] bg-[var(--panel-fill)]/40"
                          }`}
                          title={post ? "Click for Smart Multi-Platform Content Preview" : undefined}
                        >
                          {post ? (
                            <div className="space-y-1.5 p-1 w-full h-full flex flex-col justify-between">
                              <div className="text-[10px] font-semibold text-[var(--fg)] line-clamp-3 text-left">
                                {post.title}
                              </div>
                              <div className="flex items-center justify-between pt-1 border-t border-[var(--stroke)]">
                                <div className="flex items-center gap-1 text-[8.5px] text-[var(--fg-3)]">
                                  <PlatformIcon platform={post.platform} className="w-3 h-3" />
                                  <span className="capitalize">{platformLabel(post.platform)}</span>
                                </div>
                                <span className="inline-block text-[8px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--fg-3)] font-mono">
                                  {formatEventTime(post.trigger_at)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--stroke)]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* ================================================================ */}
      {/* BOTTOM PIPELINE / UPCOMING QUEUE                                 */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* UPCOMING POSTS */}
        <div className="rounded-2xl border border-[#ec4899]/30 bg-[var(--panel-fill-2)] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">Upcoming Posts</h3>
              <p className="text-[10px] text-[var(--fg-4)]">Next scheduled in your queue</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => openSmartPreview(task)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--hover)] transition-colors cursor-pointer border border-transparent hover:border-[var(--stroke)]"
                  title="Click for Smart Multi-Platform Content Preview"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--stroke)] bg-[var(--panel-fill)] shrink-0">
                    <PlatformIcon platform={task.platform} className="w-3.5 h-3.5 text-[var(--fg)] dark:text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--fg)] truncate">{task.title}</p>
                    <p className="text-[9.5px] text-black dark:text-white/80 mt-0.5 font-medium">
                      {formatEventDate(task.trigger_at)} · {formatEventTime(task.trigger_at)}
                    </p>
                  </div>

                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                    Scheduled
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[var(--fg-4)]">
                No upcoming scheduled posts yet
              </div>
            )}
          </div>
        </div>

        {/* CONTENT QUEUE OVERVIEW */}
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">Publishing Pipeline</h3>
              <p className="text-[10px] text-[var(--fg-4)]">Live status breakdown</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              {
                label: "Scheduled Posts",
                count: scheduledEvents.filter((e) => e.type === "post").length,
                icon: Clock,
              },
              {
                label: "AI Generation Tasks",
                count: scheduledEvents.filter((e) => e.type === "ai_task").length,
                icon: Bot,
              },
              {
                label: "Optimal Surge Windows Active",
                count: accounts.length > 0 ? accounts.length * 7 : 7,
                icon: Zap,
              },
              {
                label: "Connected Channels",
                count: accounts.length,
                icon: CheckCircle2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span className="text-xs text-[var(--fg-3)]">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--fg)]">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI AUTO STRATEGY CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-[#ec4899]/30 bg-[var(--panel-fill)] p-4 shadow-md flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-black border border-black text-white dark:bg-white/[0.06] dark:border-white/10 dark:text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">AI Batch Strategy</h3>
            </div>
            <p className="text-xs text-[var(--fg-4)] leading-relaxed">
              Auto-generate 5 tailored posts slotted into this week&apos;s peak audience hours.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setModalMode("ai_batch");
              setShowModal(true);
            }}
            className="mt-4 w-full h-9 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-semibold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Generate Strategy</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* UNIFIED COMPOSER / SCHEDULING MODAL                              */}
      {/* ================================================================ */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] shadow-2xl flex flex-col">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--stroke)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black border border-black text-white dark:bg-white/[0.06] dark:border-white/10 dark:text-white">
                  {modalMode === "post" ? (
                    <CalendarIcon className="w-4 h-4 text-white" />
                  ) : modalMode === "ai_task" ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--fg)] text-sm">
                    {modalMode === "post"
                      ? "Schedule Social Post"
                      : modalMode === "ai_task"
                      ? "Schedule AI Content Task"
                      : "Batch AI Week Planner"}
                  </h3>
                  <p className="text-[10px] text-[var(--fg-4)]">
                    Target: {MONTHS[selectedDate.month]} {selectedDate.day}, {selectedDate.year}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
              >
                <X className="w-4 h-4 text-[var(--fg-4)] hover:text-[var(--fg)]" />
              </button>
            </div>

            {/* MODE SWITCHER TABS */}
            <div className="flex border-b border-[var(--stroke)] bg-[var(--panel-fill)] p-1.5 gap-1">
              <button
                type="button"
                onClick={() => setModalMode("post")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modalMode === "post"
                    ? "bg-[var(--panel-fill-2)] text-[var(--fg)] shadow-xs"
                    : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                Direct Post
              </button>
              <button
                type="button"
                onClick={() => setModalMode("ai_task")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modalMode === "ai_task"
                    ? "bg-[var(--panel-fill-2)] text-[var(--fg)] shadow-xs"
                    : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                AI Auto Task
              </button>
              <button
                type="button"
                onClick={() => setModalMode("ai_batch")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  modalMode === "ai_batch"
                    ? "bg-[var(--panel-fill-2)] text-[var(--fg)] shadow-xs"
                    : "text-[var(--fg-4)] hover:text-[var(--fg)]"
                }`}
              >
                AI Week Plan
              </button>
            </div>

            {/* FORM BODY */}
            <div className="p-4 space-y-4">
              {/* TARGET CHANNEL ACCOUNT */}
              <div>
                <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block mb-1.5">
                  Target Social Channel
                </label>
                {accounts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--stroke)] p-3 text-xs text-[var(--fg-4)] flex items-center justify-between">
                    <span>No connected accounts found.</span>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/integrations")}
                      className="text-[var(--brand-primary)] font-semibold underline"
                    >
                      Connect in Integrations
                    </button>
                  </div>
                ) : (
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-full bg-[var(--panel-fill-2)] border-[var(--stroke)]">
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.platform}>
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={account.platform} className="w-3.5 h-3.5 text-[var(--fg)] dark:text-white" />
                            <span>
                              {platformLabel(account.platform)} — {account.handle || account.display_name || "Active Profile"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* MODE 1: DIRECT POST */}
              {modalMode === "post" && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)]">
                        Post Content / Caption
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          postContent.length > charLimit ? "text-red-400 font-bold" : "text-[var(--fg-4)]"
                        }`}
                      >
                        {postContent.length} / {charLimit}
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your caption, hook, and call to action..."
                      className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] outline-none focus:border-[var(--brand-primary-border)] transition-all resize-none"
                    />
                  </div>

                  {/* MEDIA ATTACHMENTS */}
                  <div>
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block mb-1.5">
                      Media Attachments (Optional)
                    </label>

                    {mediaFiles.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {mediaFiles.map((media, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[var(--stroke)] group"
                          >
                            {media.type === "image" ? (
                              <img src={media.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <video src={media.previewUrl} className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 shrink-0 rounded-xl border border-dashed border-[var(--stroke-strong)] flex flex-col items-center justify-center text-[var(--fg-4)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary-border)] transition-all"
                        >
                          <Plus className="w-4 h-4 text-[var(--fg-4)] hover:text-[var(--fg)]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-20 rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--panel-fill-2)]/50 flex flex-col items-center justify-center gap-1 text-[var(--fg-4)] hover:border-[var(--brand-primary-border)] hover:bg-[var(--panel-fill-2)] transition-all"
                      >
                        <ImageIcon className="w-4 h-4 text-[var(--fg-4)] dark:text-white" />
                        <span className="text-[11px]">Upload image or video</span>
                      </button>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}

              {/* MODE 2: AI CONTENT TASK */}
              {modalMode === "ai_task" && (
                <>
                  <div>
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block mb-1.5">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={aiTaskTitle}
                      onChange={(e) => setAiTaskTitle(e.target.value)}
                      placeholder="e.g. Morning Industry Insight Hook"
                      className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3.5 py-2.5 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] outline-none focus:border-[var(--brand-primary-border)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block mb-1.5">
                      AI Generation Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={aiTaskPrompt}
                      onChange={(e) => setAiTaskPrompt(e.target.value)}
                      placeholder="Describe what specific hook, format, or insight the AI should draft..."
                      className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-3 text-xs text-[var(--fg)] placeholder:text-[var(--fg-4)] outline-none focus:border-[var(--brand-primary-border)] transition-all resize-none"
                    />
                  </div>

                  {/* VISUAL CONTEXT & REFERENCE IMAGES (GEMINI VISION) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[var(--brand-primary)]" />
                        <span>Visual Context & Reference Images (Optional)</span>
                      </label>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
                        Gemini Vision
                      </span>
                    </div>

                    <p className="text-[10px] text-[var(--fg-4)] mb-2">
                      Upload screenshots, infographics, product mockups, or diagrams so Gemini Vision analyzes the visual aesthetics to write sharper content.
                    </p>

                    {mediaFiles.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {mediaFiles.map((media, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[var(--stroke)] group"
                          >
                            {media.type === "image" ? (
                              <img src={media.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <video src={media.previewUrl} className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 shrink-0 rounded-xl border border-dashed border-[var(--stroke-strong)] flex flex-col items-center justify-center text-[var(--fg-4)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary-border)] transition-all"
                        >
                          <Plus className="w-4 h-4 text-[var(--fg-4)] hover:text-[var(--fg)]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-16 rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--panel-fill-2)]/50 flex items-center justify-center gap-2 text-[var(--fg-4)] hover:border-[var(--brand-primary-border)] hover:bg-[var(--panel-fill-2)] transition-all"
                      >
                        <ImageIcon className="w-4 h-4 text-[var(--fg-4)] dark:text-white" />
                        <span className="text-[11px]">Upload reference image for AI visual understanding</span>
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* MODE 3: BATCH AI WEEK PLANNER */}
              {modalMode === "ai_batch" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block mb-1.5">
                      Weekly Focus / Niche Topic
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={batchTopic}
                        onChange={(e) => setBatchTopic(e.target.value)}
                        placeholder="e.g. AI Workflow Productivity, Fintech Scaling..."
                        className="flex-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2 text-xs text-[var(--fg)] outline-none focus:border-[var(--brand-primary-border)]"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateBatchIdeas}
                        disabled={isGeneratingBatch}
                        className="px-3.5 py-2 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 disabled:opacity-60 transition-all"
                      >
                        {isGeneratingBatch ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* CAMPAIGN VISUAL REFERENCES (GEMINI MULTIMODAL) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[var(--brand-primary)]" />
                        <span>Campaign Moodboard & Visual Assets (Optional)</span>
                      </label>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
                        Multimodal Plan
                      </span>
                    </div>

                    <p className="text-[10px] text-[var(--fg-4)] mb-2">
                      Attach product images, moodboard graphics, or brand themes so Gemini structures your 5-day week plan around your visual assets.
                    </p>

                    {mediaFiles.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {mediaFiles.map((media, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[var(--stroke)] group"
                          >
                            <img src={media.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 shrink-0 rounded-xl border border-dashed border-[var(--stroke-strong)] flex flex-col items-center justify-center text-[var(--fg-4)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary-border)] transition-all"
                        >
                          <Plus className="w-4 h-4 text-[var(--fg-4)] hover:text-[var(--fg)]" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-16 rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--panel-fill-2)]/50 flex items-center justify-center gap-2 text-[var(--fg-4)] hover:border-[var(--brand-primary-border)] hover:bg-[var(--panel-fill-2)] transition-all"
                      >
                        <ImageIcon className="w-4 h-4 text-[var(--fg-4)] dark:text-white" />
                        <span className="text-[11px]">Upload campaign or moodboard images</span>
                      </button>
                    )}
                  </div>

                  {batchIdeas.length > 0 && (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {batchIdeas.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-2.5 flex items-start gap-2"
                        >
                          <div className="w-5 h-5 rounded-md bg-black/10 text-black dark:bg-white/10 dark:text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                            +{item.dayOffset}d
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-[var(--fg)] leading-snug">{item.idea}</p>
                            <p className="text-[9px] text-[var(--fg-4)] mt-1 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 text-black dark:text-white" />
                              Optimal Slot: {item.timeStr}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DATE & TIME (FOR DIRECT POST & AI TASK) */}
              {modalMode !== "ai_batch" && (
                <div className="space-y-3 pt-2 border-t border-[var(--stroke)]">
                  {/* BEST TIME RECOMMENDATION CALLOUT */}
                  <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white/10 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-semibold text-[var(--fg)]">
                          Audience Surge Slot: <span className="font-bold text-[var(--fg)]">{activeOptimalSlot.formatted}</span>
                        </p>
                        <p className="text-[9.5px] text-[var(--fg-4)]">
                          {activeOptimalSlot.label} · {activeOptimalSlot.surgeWindow}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={applyBestTime}
                      className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-[10px] font-semibold hover:opacity-90 transition-all shadow-xs"
                    >
                      Apply Best Time
                    </button>
                  </div>

                  {/* TIME SELECTORS */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--fg-4)] block mb-1">Hour</label>
                      <select
                        value={selectedTime.hour}
                        onChange={(e) => setSelectedTime({ ...selectedTime, hour: Number(e.target.value) })}
                        className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2 text-xs text-[var(--fg)] outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[var(--fg-4)] block mb-1">Minute</label>
                      <select
                        value={selectedTime.minute}
                        onChange={(e) => setSelectedTime({ ...selectedTime, minute: Number(e.target.value) })}
                        className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2 text-xs text-[var(--fg)] outline-none"
                      >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                          <option key={m} value={m}>
                            {m < 10 ? `0${m}` : m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[var(--fg-4)] block mb-1">AM / PM</label>
                      <select
                        value={selectedTime.ampm}
                        onChange={(e) => setSelectedTime({ ...selectedTime, ampm: e.target.value as "AM" | "PM" })}
                        className="w-full rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] px-3 py-2 text-xs text-[var(--fg)] outline-none"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL ACTIONS */}
            <div className="p-4 border-t border-[var(--stroke)] flex justify-end gap-2.5 bg-[var(--panel-fill)]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--fg-4)] hover:bg-[var(--hover)] hover:text-[var(--fg)] transition-all"
              >
                Cancel
              </button>

              {modalMode === "ai_batch" ? (
                <button
                  type="button"
                  onClick={handleScheduleAllBatchIdeas}
                  disabled={isSaving || batchIdeas.length === 0}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white dark:text-black" /> : <Check className="w-3.5 h-3.5 text-white dark:text-black" />}
                  Schedule All {batchIdeas.length} Posts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white dark:text-black" /> : <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-black" />}
                  Confirm Schedule
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ================================================================ */}
      {/* EVENT DETAIL & QUICK RESCHEDULE MODAL                            */}
      {/* ================================================================ */}

      {selectedEventDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <GlassCard className="w-full max-w-md rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] pb-3">
              <div className="flex items-center gap-2">
                <PlatformIcon platform={selectedEventDetail.platform} className="w-4 h-4 text-[var(--fg)] dark:text-white" />
                <span className="text-xs font-bold uppercase text-[var(--fg)]">
                  {platformLabel(selectedEventDetail.platform)} · {selectedEventDetail.type === "post" ? "Scheduled Post" : "AI Task"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEventDetail(null)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg)]"
              >
                <X className="w-4 h-4 text-[var(--fg-4)] hover:text-[var(--fg)]" />
              </button>
            </div>

            {/* CONTENT PREVIEW */}
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 space-y-2">
              <p className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap">
                {selectedEventDetail.content || selectedEventDetail.title}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--stroke)] text-[10px] text-[var(--fg-4)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--fg-4)] dark:text-white" />
                  {formatEventDate(selectedEventDetail.trigger_at)} at {formatEventTime(selectedEventDetail.trigger_at)}
                </span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                  {selectedEventDetail.status || "Scheduled"}
                </span>
              </div>
            </div>

            {/* QUICK RESCHEDULE SHIFTERS */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-4)] block mb-1.5">
                Quick Reschedule
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={isRescheduling}
                  onClick={() => handleShiftDay(selectedEventDetail, -1)}
                  className="py-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
                >
                  -1 Day
                </button>
                <button
                  type="button"
                  disabled={isRescheduling}
                  onClick={() => handleShiftDay(selectedEventDetail, 1)}
                  className="py-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
                >
                  +1 Day
                </button>
                <button
                  type="button"
                  disabled={isRescheduling}
                  onClick={() => handleShiftDay(selectedEventDetail, 7)}
                  className="py-1.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
                >
                  +1 Week
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--stroke)]">
              <button
                type="button"
                onClick={() => handleDeleteEvent(selectedEventDetail)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                Remove Event
              </button>

              <button
                type="button"
                onClick={() => setSelectedEventDetail(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-xs font-semibold text-[var(--fg)] hover:bg-[var(--hover)]"
              >
                Close
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ================================================================ */}
      {/* SMART MULTI-PLATFORM CONTENT PREVIEW MODAL                       */}
      {/* ================================================================ */}

      {smartPreviewEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl flex flex-col my-auto">
            {/* TOP HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--stroke)] bg-[var(--panel-fill-2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black border border-black text-white dark:bg-white/[0.08] dark:border-white/15 dark:text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--fg)]">
                      Smart Content Multi-Platform Preview
                    </h3>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[var(--fg)] border border-[var(--stroke)]">
                      Target: {platformLabel(smartPreviewEvent.platform)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fg-4)]">
                    Simulate how this scheduled content formats and appears across each social network
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSmartPreviewEvent(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
              >
                <X className="w-5 h-5 text-[var(--fg-4)] hover:text-[var(--fg)]" />
              </button>
            </div>

            {/* PLATFORM SWITCHER BAR */}
            <div className="px-6 py-3 border-b border-[var(--stroke)] bg-[var(--panel-fill)] flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { id: "instagram", label: "Instagram" },
                { id: "x", label: "X (Twitter)" },
                { id: "linkedin", label: "LinkedIn" },
                { id: "tiktok", label: "TikTok" },
                { id: "threads", label: "Threads" },
                { id: "facebook", label: "Facebook" },
                { id: "youtube", label: "YouTube" },
              ].map((p) => {
                const isSelected = smartPreviewPlatform.toLowerCase() === p.id.toLowerCase();
                const isTarget = smartPreviewEvent.platform?.toLowerCase() === p.id.toLowerCase();

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSmartPreviewPlatform(p.id)}
                    className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs"
                        : "border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]"
                    }`}
                  >
                    <PlatformIcon platform={p.id} className="w-3.5 h-3.5" />
                    <span>{p.label}</span>
                    {isTarget && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected
                            ? "bg-white/20 text-white dark:bg-black/15 dark:text-black"
                            : "bg-black/10 text-black dark:bg-white/10 dark:text-white"
                        }`}
                      >
                        Target
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* MODAL BODY (TWO COLUMNS) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[var(--app-bg)]">
              {/* LEFT COLUMN: VISUAL SIMULATOR CANVAS (7 COLS) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                <div className="w-full max-w-[420px]">
                  {/* INSTAGRAM MOCKUP */}
                  {smartPreviewPlatform === "instagram" && (
                    <div className="rounded-3xl overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-xl transition-all">
                      {/* IG Post Header */}
                      <div className="flex items-center justify-between p-3.5 border-b border-[var(--stroke)]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                            <div className="w-full h-full rounded-full bg-[var(--panel-fill)] p-[1px]">
                              {accounts[0]?.avatar_url ? (
                                <img src={accounts[0].avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <div className="w-full h-full rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-bold">
                                  {(accounts[0]?.handle || "K").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--fg)]">
                              {accounts[0]?.handle?.replace(/^@/, "") || "koraspace_creator"}
                            </p>
                            <p className="text-[9.5px] text-[var(--fg-4)]">Peak Audience Window</p>
                          </div>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-[var(--fg-4)]" />
                      </div>

                      {/* IG Media Area */}
                      <RenderSmartPreviewMedia
                        mediaUrls={smartPreviewEvent.media_urls}
                        content={smartPreviewEvent.content || smartPreviewEvent.title}
                        aspectRatio="aspect-square"
                        className="border-b border-[var(--stroke)]"
                      />

                      {/* IG Actions */}
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <Heart className="w-5 h-5 text-[var(--fg)] hover:text-red-500 transition-colors cursor-pointer" />
                            <MessageCircle className="w-5 h-5 text-[var(--fg)] hover:opacity-75 transition-opacity cursor-pointer" />
                            <Send className="w-5 h-5 text-[var(--fg)] hover:opacity-75 transition-opacity cursor-pointer" />
                          </div>
                          <Bookmark className="w-5 h-5 text-[var(--fg)] cursor-pointer" />
                        </div>

                        <p className="text-[11px] font-bold text-[var(--fg)]">
                          1,482 likes
                        </p>

                        {/* IG Caption */}
                        <div className="text-xs text-[var(--fg)] leading-relaxed space-y-1">
                          <p>
                            <span className="font-bold mr-1.5">
                              {accounts[0]?.handle?.replace(/^@/, "") || "koraspace_creator"}
                            </span>
                            <span className="whitespace-pre-wrap">
                              {smartPreviewEvent.content || smartPreviewEvent.title}
                            </span>
                          </p>
                        </div>

                        <p className="text-[10px] text-[var(--fg-4)] cursor-pointer hover:underline pt-0.5">
                          View all 34 comments
                        </p>
                        <p className="text-[9px] text-[var(--fg-4)] uppercase tracking-wider">
                          Scheduled: {formatEventDate(smartPreviewEvent.trigger_at)} at {formatEventTime(smartPreviewEvent.trigger_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* X (TWITTER) MOCKUP */}
                  {(smartPreviewPlatform === "x" || smartPreviewPlatform === "twitter") && (
                    <div className="rounded-3xl overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 shadow-xl transition-all space-y-3">
                      {/* Tweet Author Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          {accounts[0]?.avatar_url ? (
                            <img src={accounts[0].avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                              {(accounts[0]?.display_name || "K").charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-[var(--fg)]">
                                {accounts[0]?.display_name || "Koraspace Creator"}
                              </span>
                              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-bold">
                                ✓
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--fg-4)]">
                              @{accounts[0]?.handle?.replace(/^@/, "") || "koraspace"}
                            </p>
                          </div>
                        </div>
                        <AtSign className="w-4 h-4 text-[var(--fg-4)]" />
                      </div>

                      {/* Tweet Content */}
                      <div className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                        {smartPreviewEvent.content || smartPreviewEvent.title}
                      </div>

                      {/* Tweet Media */}
                      {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border border-[var(--stroke)]">
                          <RenderSmartPreviewMedia
                            mediaUrls={smartPreviewEvent.media_urls}
                            content={smartPreviewEvent.content || smartPreviewEvent.title}
                            aspectRatio="aspect-[16/9]"
                          />
                        </div>
                      )}

                      {/* Tweet Timestamp & Analytics */}
                      <div className="py-2 border-y border-[var(--stroke)] flex items-center justify-between text-[10px] text-[var(--fg-4)]">
                        <span>{formatEventTime(smartPreviewEvent.trigger_at)} · {formatEventDate(smartPreviewEvent.trigger_at)}</span>
                        <span className="font-semibold text-[var(--fg)]">18.4K Views</span>
                      </div>

                      {/* Tweet Actions */}
                      <div className="flex items-center justify-between text-[var(--fg-4)] px-2 pt-1 text-xs">
                        <div className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-[10px]">28</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                          <Repeat2 className="w-4 h-4" />
                          <span className="text-[10px]">94</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-pink-500 cursor-pointer">
                          <Heart className="w-4 h-4" />
                          <span className="text-[10px]">482</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer">
                          <Bookmark className="w-4 h-4" />
                          <span className="text-[10px]">63</span>
                        </div>
                        <Share2 className="w-4 h-4 hover:text-[var(--fg)] cursor-pointer" />
                      </div>
                    </div>
                  )}

                  {/* LINKEDIN MOCKUP */}
                  {smartPreviewPlatform === "linkedin" && (
                    <div className="rounded-3xl overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 shadow-xl transition-all space-y-3">
                      {/* LinkedIn Author Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          {accounts[0]?.avatar_url ? (
                            <img src={accounts[0].avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                              {(accounts[0]?.display_name || "K").charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-[var(--fg)]">
                              {accounts[0]?.display_name || "Koraspace Creator"}
                            </p>
                            <p className="text-[10px] text-[var(--fg-4)] truncate max-w-[220px]">
                              Content Strategist & AI Architecture
                            </p>
                            <p className="text-[9px] text-[var(--fg-4)] flex items-center gap-1 mt-0.5">
                              <span>Scheduled for {formatEventDate(smartPreviewEvent.trigger_at)}</span>
                              <span>• 🌐</span>
                            </p>
                          </div>
                        </div>
                        <Briefcase className="w-4 h-4 text-[var(--fg-4)]" />
                      </div>

                      {/* LinkedIn Content */}
                      <div className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap pt-1 font-sans">
                        {smartPreviewEvent.content || smartPreviewEvent.title}
                      </div>

                      {/* LinkedIn Media */}
                      {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border border-[var(--stroke)]">
                          <RenderSmartPreviewMedia
                            mediaUrls={smartPreviewEvent.media_urls}
                            content={smartPreviewEvent.content || smartPreviewEvent.title}
                            aspectRatio="aspect-[1.91/1]"
                          />
                        </div>
                      )}

                      {/* LinkedIn Reaction Stats */}
                      <div className="pt-2 border-t border-[var(--stroke)] flex items-center justify-between text-[10px] text-[var(--fg-4)]">
                        <span className="flex items-center gap-1 font-medium text-[var(--fg)]">
                          <span>👍 💡 ❤️</span>
                          <span>164 reactions</span>
                        </span>
                        <span>24 comments · 9 reposts</span>
                      </div>

                      {/* LinkedIn Actions */}
                      <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[var(--stroke)] text-[var(--fg-4)]">
                        <button type="button" className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--fg)] text-[10px] font-semibold transition-all">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Like</span>
                        </button>
                        <button type="button" className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--fg)] text-[10px] font-semibold transition-all">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Comment</span>
                        </button>
                        <button type="button" className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--fg)] text-[10px] font-semibold transition-all">
                          <Repeat2 className="w-3.5 h-3.5" />
                          <span>Repost</span>
                        </button>
                        <button type="button" className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-[var(--hover)] hover:text-[var(--fg)] text-[10px] font-semibold transition-all">
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TIKTOK / SHORTS MOCKUP */}
                  {smartPreviewPlatform === "tiktok" && (
                    <div className="rounded-[32px] overflow-hidden border border-[var(--stroke-strong)] bg-neutral-950 text-white p-4 shadow-2xl transition-all h-[520px] flex flex-col justify-between relative">
                      {/* Media Background Canvas */}
                      <div className="absolute inset-0 z-0">
                        {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0 ? (
                          <RenderSmartPreviewMedia
                            mediaUrls={smartPreviewEvent.media_urls}
                            content={smartPreviewEvent.content || smartPreviewEvent.title}
                            aspectRatio="h-full w-full"
                            className="h-full w-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center p-8 text-center opacity-80">
                            <Music2 className="w-12 h-12 text-pink-500 mb-3 animate-pulse" />
                            <p className="text-xs font-semibold text-white/80 line-clamp-3">
                              {smartPreviewEvent.content || smartPreviewEvent.title}
                            </p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
                      </div>

                      {/* Top Header */}
                      <div className="flex items-center justify-between text-xs text-white/80 z-10">
                        <span className="font-bold tracking-wider">TikTok Feed View</span>
                        <Music2 className="w-4 h-4 animate-spin text-white/60" />
                      </div>

                      {/* Floating Right Actions */}
                      <div className="absolute right-3.5 bottom-16 flex flex-col items-center gap-3.5 z-10">
                        <div className="w-9 h-9 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shadow-md">
                          {(accounts[0]?.handle || "K").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-center">
                          <Heart className="w-6 h-6 text-white" />
                          <span className="text-[9px] font-bold">24.1K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                          <span className="text-[9px] font-bold">842</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Bookmark className="w-6 h-6 text-white" />
                          <span className="text-[9px] font-bold">3.2K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Share2 className="w-6 h-6 text-white" />
                          <span className="text-[9px] font-bold">940</span>
                        </div>
                      </div>

                      {/* Bottom Caption Overlay */}
                      <div className="z-10 space-y-2 pr-14">
                        <p className="text-xs font-bold">
                          @{accounts[0]?.handle?.replace(/^@/, "") || "koraspace_official"}
                        </p>
                        <p className="text-[11px] text-white/90 leading-snug line-clamp-3">
                          {smartPreviewEvent.content || smartPreviewEvent.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-white/75">
                          <Music2 className="w-3 h-3" />
                          <span className="truncate">Original Sound • Audience Surge Audio</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* THREADS MOCKUP */}
                  {smartPreviewPlatform === "threads" && (
                    <div className="rounded-3xl overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 shadow-xl transition-all space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                            {(accounts[0]?.handle || "T").charAt(0).toUpperCase()}
                          </div>
                          <div className="w-[1.5px] h-16 bg-[var(--stroke-strong)]" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--fg)]">
                              {accounts[0]?.handle?.replace(/^@/, "") || "koraspace"}
                            </span>
                            <span className="text-[10px] text-[var(--fg-4)]">1m</span>
                          </div>
                          <p className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap">
                            {smartPreviewEvent.content || smartPreviewEvent.title}
                          </p>
                          {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0 && (
                            <div className="rounded-2xl overflow-hidden border border-[var(--stroke)] mt-2">
                              <RenderSmartPreviewMedia
                                mediaUrls={smartPreviewEvent.media_urls}
                                content={smartPreviewEvent.content || smartPreviewEvent.title}
                                aspectRatio="aspect-video"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-[var(--fg-4)] pt-2">
                            <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                            <MessageCircle className="w-4 h-4 hover:text-[var(--fg)] cursor-pointer" />
                            <Repeat2 className="w-4 h-4 hover:text-emerald-400 cursor-pointer" />
                            <Send className="w-4 h-4 hover:text-[var(--fg)] cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FACEBOOK & OTHER FALLBACK MOCKUP */}
                  {(smartPreviewPlatform === "facebook" || smartPreviewPlatform === "youtube") && (
                    <div className="rounded-3xl overflow-hidden border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 shadow-xl transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {(accounts[0]?.display_name || "F").charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--fg)]">
                              {accounts[0]?.display_name || "Koraspace Publishing"}
                            </p>
                            <p className="text-[9.5px] text-[var(--fg-4)] flex items-center gap-1">
                              <span>Scheduled for {formatEventDate(smartPreviewEvent.trigger_at)}</span>
                              <span>• 🌍</span>
                            </p>
                          </div>
                        </div>
                        <PlatformIcon platform={smartPreviewPlatform} className="w-4 h-4" />
                      </div>

                      <div className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-wrap">
                        {smartPreviewEvent.content || smartPreviewEvent.title}
                      </div>

                      {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0 && (
                        <div className="rounded-2xl overflow-hidden border border-[var(--stroke)]">
                          <RenderSmartPreviewMedia
                            mediaUrls={smartPreviewEvent.media_urls}
                            content={smartPreviewEvent.content || smartPreviewEvent.title}
                            aspectRatio="aspect-video"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--stroke)] text-[10px] text-[var(--fg-4)]">
                        <span>👍 82 Reactions</span>
                        <span>12 Comments · 4 Shares</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: SMART INTELLIGENCE & ACTION METRICS (5 COLS) */}
              <div className="lg:col-span-5 space-y-4">
                {/* CHARACTER & FORMATTING HEALTH */}
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                      Platform Formatting Health
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">
                      Live Assessment
                    </span>
                  </div>

                  {/* Character limit gauge */}
                  <div>
                    {(() => {
                      const maxChar = PLATFORM_CONFIGS[smartPreviewPlatform]?.maxChars || 2200;
                      const currentLen = (smartPreviewEvent.content || smartPreviewEvent.title || "").length;
                      const pct = Math.min(100, Math.round((currentLen / maxChar) * 100));
                      const isOver = currentLen > maxChar;

                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--fg-4)]">Character Usage:</span>
                            <span className={`font-mono font-bold ${isOver ? "text-red-400" : "text-[var(--fg)]"}`}>
                              {currentLen} / {maxChar} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--stroke)] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOver ? "bg-red-500" : pct > 85 ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--stroke)]">
                    <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-2.5">
                      <p className="text-[9.5px] text-[var(--fg-4)] uppercase font-semibold">Hook Strength</p>
                      <p className="text-sm font-bold text-[var(--fg)] mt-0.5">94 / 100</p>
                    </div>
                    <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-2.5">
                      <p className="text-[9.5px] text-[var(--fg-4)] uppercase font-semibold">Readability</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">Optimal</p>
                    </div>
                  </div>
                </div>

                {/* MEDIA SPECS & FORMATTING HEALTH */}
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white/10 flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                        Media & Layout Specs
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--panel-fill)] border border-[var(--stroke)] text-[var(--fg-3)] font-mono">
                      {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0
                        ? `${smartPreviewEvent.media_urls.length} Attached`
                        : "Text Post"}
                    </span>
                  </div>

                  {smartPreviewEvent.media_urls && smartPreviewEvent.media_urls.length > 0 ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--fg-4)]">Format Detected:</span>
                        <span className="font-semibold text-[var(--fg)] font-mono">
                          {isVideoUrl(smartPreviewEvent.media_urls[0]) ? "MP4/WebM Video (Playable)" : "High-Res Image (JPG/PNG)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--fg-4)]">Target Aspect Ratio:</span>
                        <span className="font-bold text-[var(--fg)]">
                          {smartPreviewPlatform === "instagram"
                            ? "1:1 Square / 4:5 Portrait"
                            : smartPreviewPlatform === "tiktok"
                            ? "9:16 Full Vertical (1080x1920)"
                            : "16:9 Landscape (1200x675)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--fg-4)]">Encoding & Fit:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span>✓</span> Platform Optimized
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--fg-4)] leading-relaxed">
                      No media attached. Post will render with dynamic typography styling and brand palette on {platformLabel(smartPreviewPlatform)}.
                    </p>
                  )}
                </div>

                {/* AI RECOMMENDATIONS & CONTENT IMPROVEMENTS */}
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                        AI Recommendations & Improvements
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold border border-[var(--brand-primary)]/20">
                      Live AI Analysis
                    </span>
                  </div>

                  {/* Recommendations list */}
                  {(() => {
                    const recs = getAiRecommendations(smartPreviewEvent, smartPreviewPlatform);
                    const enhancedCopy = generateEnhancedCopy(
                      smartPreviewEvent.content || smartPreviewEvent.title || "",
                      smartPreviewPlatform
                    );

                    return (
                      <div className="space-y-2.5">
                        <div className="space-y-2">
                          {recs.map((rec, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-2.5 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Lightbulb className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
                                  <span className="text-[11px] font-bold text-[var(--fg)]">
                                    {rec.title}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                                  {rec.scoreBoost}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-[var(--fg-4)] leading-relaxed pl-5">
                                {rec.advice}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* AI Optimized Variation Callout */}
                        {enhancedCopy && (
                          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Wand2 className="w-3.5 h-3.5 text-black dark:text-white" />
                                <span className="text-[11px] font-bold text-[var(--fg)]">
                                  AI Enhanced Copy for {platformLabel(smartPreviewPlatform)}
                                </span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--fg-3)] font-mono">
                                High Signal
                              </span>
                            </div>

                            <p className="text-[11px] text-[var(--fg-3)] font-sans italic whitespace-pre-wrap bg-[var(--panel-fill-2)] p-2.5 rounded-lg border border-[var(--stroke)] leading-relaxed">
                              {enhancedCopy}
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(enhancedCopy);
                                  setCopiedEnhanced(true);
                                  setTimeout(() => setCopiedEnhanced(false), 2000);
                                }}
                                className="flex-1 py-1.5 px-2.5 rounded-lg border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-[10px] font-semibold text-[var(--fg)] hover:bg-[var(--hover)] flex items-center justify-center gap-1.5 transition-all"
                              >
                                {copiedEnhanced ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied to Clipboard!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[var(--fg-4)]" />
                                    <span>Copy Enhanced Text</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const eventToEdit = smartPreviewEvent;
                                  setSmartPreviewEvent(null);
                                  setSelectedPlatform(smartPreviewPlatform);
                                  setPostContent(enhancedCopy);
                                  const d = new Date(eventToEdit.trigger_at);
                                  setSelectedDate({
                                    year: d.getFullYear(),
                                    month: d.getMonth(),
                                    day: d.getDate(),
                                  });
                                  setModalMode("post");
                                  setShowModal(true);
                                }}
                                className="py-1.5 px-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-semibold hover:opacity-90 flex items-center gap-1 transition-all"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Apply to Composer</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* AUDIENCE TIMING & SURGE SLOT */}
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-black text-white dark:bg-white/10 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                      Audience Surge Window
                    </h4>
                  </div>

                  {(() => {
                    const eventDate = new Date(smartPreviewEvent.trigger_at);
                    const optimalSlot = getOptimalPostTimeForDay(eventDate, smartPreviewPlatform);

                    return (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--fg-4)]">Scheduled Time:</span>
                          <span className="font-semibold text-[var(--fg)]">
                            {formatEventDate(smartPreviewEvent.trigger_at)} at {formatEventTime(smartPreviewEvent.trigger_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--fg-4)]">Peak Slot for {platformLabel(smartPreviewPlatform)}:</span>
                          <span className="font-bold text-[var(--fg)]">
                            {optimalSlot.formatted}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--fg-4)] pt-1 border-t border-[var(--stroke)]">
                          {optimalSlot.label} · {optimalSlot.surgeWindow}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* QUICK EVENT ACTIONS */}
                <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                    Quick Actions
                  </h4>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isRescheduling}
                      onClick={() => handleShiftDay(smartPreviewEvent, -1)}
                      className="py-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
                    >
                      -1 Day
                    </button>
                    <button
                      type="button"
                      disabled={isRescheduling}
                      onClick={() => handleShiftDay(smartPreviewEvent, 1)}
                      className="py-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
                    >
                      +1 Day
                    </button>
                    <button
                      type="button"
                      disabled={isRescheduling}
                      onClick={() => handleShiftDay(smartPreviewEvent, 7)}
                      className="py-2 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)] text-[10px] font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
                    >
                      +1 Week
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--stroke)]">
                    <button
                      type="button"
                      onClick={() => {
                        const eventToEdit = smartPreviewEvent;
                        setSmartPreviewEvent(null);
                        setSelectedPlatform(eventToEdit.platform);
                        setPostContent(eventToEdit.content || eventToEdit.title);
                        const d = new Date(eventToEdit.trigger_at);
                        setSelectedDate({
                          year: d.getFullYear(),
                          month: d.getMonth(),
                          day: d.getDate(),
                        });
                        setModalMode(eventToEdit.type === "ai_task" ? "ai_task" : "post");
                        setShowModal(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit in Composer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteEvent(smartPreviewEvent);
                        setSmartPreviewEvent(null);
                      }}
                      className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      title="Remove post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ================================================================ */}
      {/* SELECT CONTENT TO PREVIEW (MULTIPLE CONTENTS ON A DAY MODAL)      */}
      {/* ================================================================ */}

      {daySelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <GlassCard className="w-full max-w-lg rounded-3xl border border-[var(--stroke)] bg-[var(--panel-fill)] shadow-2xl flex flex-col my-auto overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--stroke)] bg-[var(--panel-fill-2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black border border-black text-white dark:bg-white/[0.08] dark:border-white/15 dark:text-white flex items-center justify-center shadow-sm">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--fg)]">
                    {daySelectionModal.date.toLocaleDateString([], {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-[var(--fg-4)]">
                    {daySelectionModal.events.length} scheduled contents on this day · Select to preview
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDaySelectionModal(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-4)] hover:text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
              >
                <X className="w-4 h-4 text-[var(--fg-4)] hover:text-[var(--fg)]" />
              </button>
            </div>

            {/* ITEMS LIST */}
            <div className="p-5 space-y-2.5 max-h-[420px] overflow-y-auto bg-[var(--app-bg)]">
              {daySelectionModal.events.map((event) => {
                const isVideo = isVideoUrl(event.media_urls?.[0]);
                const hasMedia = Boolean(event.media_urls && event.media_urls.length > 0);

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      const targetEvent = event;
                      setDaySelectionModal(null);
                      openSmartPreview(targetEvent);
                    }}
                    className="group/item relative rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-3.5 hover:border-black/50 dark:hover:border-white/30 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5"
                  >
                    {/* Left Platform Icon */}
                    <div className="w-9 h-9 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] flex items-center justify-center shrink-0 group-hover/item:border-black/30 dark:group-hover/item:border-white/20 transition-colors">
                      <PlatformIcon platform={event.platform} className="w-4 h-4 text-[var(--fg)] dark:text-white" />
                    </div>

                    {/* Content & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[var(--fg)]">
                            {platformLabel(event.platform)}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-[var(--panel-fill-2)] border border-[var(--stroke)] text-[var(--fg-4)] uppercase font-semibold">
                            {event.type === "post" ? "Post" : "AI Task"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--fg-3)]">
                          <Clock className="w-3 h-3 text-[var(--fg-4)]" />
                          <span>{formatEventTime(event.trigger_at)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--fg-3)] line-clamp-2 leading-relaxed">
                        {event.content || event.title}
                      </p>

                      {/* Media and Preview Indicator */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--stroke)]">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--fg-4)]">
                          {hasMedia ? (
                            <span className="flex items-center gap-1 font-semibold text-emerald-400">
                              {isVideo ? <Tv className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                              <span>{isVideo ? "Video Attached" : `${event.media_urls?.length} Image${event.media_urls?.length === 1 ? "" : "s"}`}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>Text Post</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--fg)] group-hover/item:text-[var(--brand-primary)] transition-colors">
                          <Sparkles className="w-3 h-3" />
                          <span>Open Smart Preview</span>
                          <ArrowRight className="w-3 h-3 group-hover/item:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="px-6 py-3.5 border-t border-[var(--stroke)] bg-[var(--panel-fill)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const day = daySelectionModal.dayNum;
                  setDaySelectionModal(null);
                  handleOpenComposerForDay(day);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[var(--stroke-strong)] text-xs font-semibold text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-black/50 dark:hover:border-white/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Another on this Day</span>
              </button>

              <button
                type="button"
                onClick={() => setDaySelectionModal(null)}
                className="px-4 py-1.5 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill-2)] text-xs font-semibold text-[var(--fg)] hover:bg-[var(--hover)] transition-all"
              >
                Done
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}