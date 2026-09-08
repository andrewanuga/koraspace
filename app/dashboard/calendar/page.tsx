"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

import {
  PageHeader,
  GlassCard,
  Pill,
  PrimaryButton,
} from "@/components/dashboard/ui";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import imageCompression from "browser-image-compression";

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

const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const PLATFORM_FILTERS = [
  "All",
  "Instagram",
  "TikTok",
  "X",
  "LinkedIn",
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatEventTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getPlatformColor(platform: string) {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return "bg-pink-500";
    case "linkedin":
      return "bg-blue-500";
    case "x":
    case "twitter":
      return "bg-sky-400";
    case "tiktok":
      return "bg-cyan-400";
    case "youtube":
      return "bg-red-500";
    default:
      return "bg-[var(--kora-pink)]";
  }
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
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <Camera className={`${className} text-pink-500`} />;

    case "linkedin":
      return <Briefcase className={`${className} text-blue-500`} />;

    case "x":
    case "twitter":
      return <AtSign className={`${className} text-sky-400`} />;

    case "tiktok":
      return <Music2 className={`${className} text-cyan-400`} />;

    default:
      return <Bot className={`${className} text-[var(--kora-pink)]`} />;
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
      className="
        absolute
        top-full
        left-0
        mt-3
        z-50
        w-[290px]
        rounded-2xl
        overflow-hidden
        border
        border-[var(--stroke)]
        bg-[var(--panel-fill)]
        shadow-[0_25px_70px_rgba(0,0,0,0.6)]
      "
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--stroke)]">
        <button
          onClick={() => setPickerYear((y) => y - 1)}
          className="
            w-8 h-8
            rounded-lg
            flex items-center justify-center
            text-[var(--fg-4)]
            hover:text-[var(--fg)]
            hover:bg-[var(--hover)]
            transition-all
          "
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm font-bold text-[var(--fg)]">
          {pickerYear}
        </span>

        <button
          onClick={() => setPickerYear((y) => y + 1)}
          className="
            w-8 h-8
            rounded-lg
            flex items-center justify-center
            text-[var(--fg-4)]
            hover:text-[var(--fg)]
            hover:bg-[var(--hover)]
            transition-all
          "
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-3">
        {MONTHS_SHORT.map((month, index) => {
          const isSelected =
            index === currentMonth &&
            pickerYear === currentYear;

          const isCurrent =
            index === now.getMonth() &&
            pickerYear === now.getFullYear();

          return (
            <button
              key={month}
              onClick={() => {
                onSelect(index, pickerYear);
                onClose();
              }}
              className={`
                py-2.5
                rounded-xl
                text-xs
                font-semibold
                transition-all

                ${
                  isSelected
                    ? `
                      bg-[var(--kora-pink)]
                      text-[var(--fg)]
                      shadow-lg
                      shadow-pink-500/20
                    `
                    : isCurrent
                    ? `
                      border
                      border-[var(--kora-pink-border)]
                      text-[var(--kora-pink)]
                      hover:bg-[var(--kora-pink-soft)]
                    `
                    : `
                      text-[var(--fg-4)]
                      hover:bg-[var(--hover)]
                      hover:text-[var(--fg)]
                    `
                }
              `}
            >
              {month}
            </button>
          );
        })}
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={() => {
            onSelect(now.getMonth(), now.getFullYear());
            onClose();
          }}
          className="
            w-full
            py-2.5
            rounded-xl
            border
            border-[var(--stroke)]
            text-xs
            font-semibold
            text-[var(--fg-4)]
            hover:text-[var(--fg)]
            hover:bg-[var(--hover)]
            transition-all
          "
        >
          Jump to Today
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               DATE PICKER                                  */
/* -------------------------------------------------------------------------- */

function DatePicker({
  value,
  onChange,
}: {
  value: {
    year: number;
    month: number;
    day: number;
  } | null;

  onChange: (
    value: {
      year: number;
      month: number;
      day: number;
    }
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const [pickerMonth, setPickerMonth] = useState(
    value?.month ?? new Date().getMonth()
  );

  const [pickerYear, setPickerYear] = useState(
    value?.year ?? new Date().getFullYear()
  );

  const now = new Date();

  const daysInMonth = getDaysInMonth(
    pickerYear,
    pickerMonth
  );

  const firstDay = getFirstDayOfMonth(
    pickerYear,
    pickerMonth
  );

  const totalCells =
    Math.ceil(
      (firstDay + daysInMonth) / 7
    ) * 7;

  const isSelectedDay = (day: number) =>
    value &&
    day === value.day &&
    pickerMonth === value.month &&
    pickerYear === value.year;

  const isToday = (day: number) =>
    day === now.getDate() &&
    pickerMonth === now.getMonth() &&
    pickerYear === now.getFullYear();

  const prevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear((y) => y - 1);
    } else {
      setPickerMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear((y) => y + 1);
    } else {
      setPickerMonth((m) => m + 1);
    }
  };

  const handleOpen = () => {
    if (triggerRef.current) {
      setRect(
        triggerRef.current.getBoundingClientRect()
      );
    }

    setOpen((v) => !v);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;

      const portal =
        document.getElementById(
          "date-picker-portal"
        );

      if (portal?.contains(target)) return;

      if (
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    if (open) {
      document.addEventListener(
        "mousedown",
        handleClick
      );
    }

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, [open]);

  const display = value
    ? `${MONTHS_SHORT[value.month]} ${value.day}, ${value.year}`
    : "";

  const dropdown =
    open &&
    rect &&
    createPortal(
      <div
        id="date-picker-portal"
        style={{
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left,
          zIndex: 9999,
          width: "280px",
        }}
        className="
          rounded-2xl
          overflow-hidden
          border
          border-[var(--stroke)]
          bg-[var(--panel-fill)]
          shadow-[0_25px_70px_rgba(0,0,0,0.7)]
        "
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--stroke)]">
          <button
            onClick={prevMonth}
            className="
              w-8 h-8
              rounded-lg
              flex items-center justify-center
              text-[var(--fg-4)]
              hover:bg-[var(--hover)]
              hover:text-[var(--fg)]
            "
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-[var(--fg)]">
            {MONTHS_SHORT[pickerMonth]} {pickerYear}
          </span>

          <button
            onClick={nextMonth}
            className="
              w-8 h-8
              rounded-lg
              flex items-center justify-center
              text-[var(--fg-4)]
              hover:bg-[var(--hover)]
              hover:text-[var(--fg)]
            "
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map(
              (day, index) => (
                <div
                  key={index}
                  className="
                    text-center
                    text-[10px]
                    font-bold
                    text-[var(--fg-4)]
                  "
                >
                  {day}
                </div>
              )
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({
              length: totalCells,
            }).map((_, index) => {
              const dayNum =
                index - firstDay + 1;

              const inMonth =
                dayNum >= 1 &&
                dayNum <= daysInMonth;

              return (
                <button
                  key={index}
                  disabled={!inMonth}
                  onClick={() => {
                    if (!inMonth) return;

                    onChange({
                      year: pickerYear,
                      month: pickerMonth,
                      day: dayNum,
                    });

                    setOpen(false);
                  }}
                  className={`
                    h-8
                    rounded-lg
                    text-[11px]
                    font-semibold
                    transition-all

                    ${
                      !inMonth
                        ? "opacity-0 pointer-events-none"
                        : isSelectedDay(dayNum)
                        ? `
                          bg-[var(--kora-pink)]
                          text-[var(--fg)]
                        `
                        : isToday(dayNum)
                        ? `
                          border
                          border-[var(--kora-pink-border)]/50
                          text-[var(--kora-pink)]
                        `
                        : `
                          text-[var(--fg-4)]
                          hover:bg-[var(--hover)]
                          hover:text-[var(--fg)]
                        `
                    }
                  `}
                >
                  {inMonth ? dayNum : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`
          w-full
          flex items-center justify-between
          rounded-xl
          border
          px-3 py-3
          text-sm
          transition-all

          ${
            open
              ? `
                border-[var(--kora-pink-border)]/60
                bg-[var(--panel-fill-2)]
              `
              : `
                border-[var(--stroke)]
                bg-[var(--panel-fill-2)]
                hover:border-[var(--stroke-strong)]
              `
          }
        `}
      >
        <span
          className={
            value
              ? "text-[var(--fg)] text-xs"
              : "text-[var(--fg-4)] text-xs"
          }
        >
          {display || "Pick a date"}
        </span>

        <CalendarIcon className="w-4 h-4 text-[var(--fg-4)]" />
      </button>

      {dropdown}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TIME PICKER                                  */
/* -------------------------------------------------------------------------- */

function TimePicker({
  value,
  onChange,
}: {
  value: {
    hour: number;
    minute: number;
    ampm: "AM" | "PM";
  } | null;

  onChange: (
    value: {
      hour: number;
      minute: number;
      ampm: "AM" | "PM";
    }
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(
    null
  );

  const triggerRef = useRef<HTMLButtonElement>(null);

  const HOURS = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
  ];

  const MINUTES = [
    0,
    5,
    10,
    15,
    20,
    25,
    30,
    35,
    40,
    45,
    50,
    55,
  ];

  const handleOpen = () => {
    if (triggerRef.current) {
      setRect(
        triggerRef.current.getBoundingClientRect()
      );
    }

    setOpen((v) => !v);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;

      const portal =
        document.getElementById(
          "time-picker-portal"
        );

      if (portal?.contains(target)) return;

      if (
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    if (open) {
      document.addEventListener(
        "mousedown",
        handleClick
      );
    }

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, [open]);

  const display = value
    ? `${value.hour}:${String(
        value.minute
      ).padStart(2, "0")} ${value.ampm}`
    : "";

  const dropdown =
    open &&
    rect &&
    createPortal(
      <div
        id="time-picker-portal"
        style={{
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left,
          zIndex: 9999,
          width: "230px",
        }}
        className="
          rounded-2xl
          overflow-hidden
          border
          border-[var(--stroke)]
          bg-[var(--panel-fill)]
          shadow-[0_25px_70px_rgba(0,0,0,0.7)]
        "
      >
        <div className="p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] mb-2">
            Hour
          </p>

          <div className="grid grid-cols-4 gap-1">
            {HOURS.map((hour) => (
              <button
                key={hour}
                onClick={() =>
                  onChange({
                    hour,
                    minute: value?.minute ?? 0,
                    ampm: value?.ampm ?? "AM",
                  })
                }
                className={`
                  py-2
                  rounded-lg
                  text-xs
                  font-semibold
                  transition-all

                  ${
                    value?.hour === hour
                      ? `
                        bg-[var(--kora-pink)]
                        text-[var(--fg)]
                      `
                      : `
                        text-[var(--fg-4)]
                        hover:bg-[var(--hover)]
                        hover:text-[var(--fg)]
                      `
                  }
                `}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-3 border-t border-[var(--stroke)]" />

        <div className="p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] mb-2">
            Minute
          </p>

          <div className="grid grid-cols-4 gap-1">
            {MINUTES.map((minute) => (
              <button
                key={minute}
                onClick={() =>
                  onChange({
                    hour: value?.hour ?? 12,
                    minute,
                    ampm: value?.ampm ?? "AM",
                  })
                }
                className={`
                  py-2
                  rounded-lg
                  text-xs
                  font-semibold
                  transition-all

                  ${
                    value?.minute === minute
                      ? `
                        bg-[var(--kora-pink)]
                        text-[var(--fg)]
                      `
                      : `
                        text-[var(--fg-4)]
                        hover:bg-[var(--hover)]
                        hover:text-[var(--fg)]
                      `
                  }
                `}
              >
                {String(minute).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-3 border-t border-[var(--stroke)]" />

        <div className="p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] mb-2">
            AM / PM
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(["AM", "PM"] as const).map((ampm) => (
              <button
                key={ampm}
                onClick={() =>
                  onChange({
                    hour: value?.hour ?? 12,
                    minute: value?.minute ?? 0,
                    ampm,
                  })
                }
                className={`
                  py-2.5
                  rounded-xl
                  text-xs
                  font-bold
                  transition-all

                  ${
                    value?.ampm === ampm
                      ? `
                        bg-[var(--kora-pink)]
                        text-[var(--fg)]
                      `
                      : `
                        border
                        border-[var(--stroke)]
                        text-[var(--fg-4)]
                        hover:bg-[var(--hover)]
                        hover:text-[var(--fg)]
                      `
                  }
                `}
              >
                {ampm}
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`
          w-full
          flex items-center justify-between
          rounded-xl
          border
          px-3 py-3
          text-sm
          transition-all

          ${
            open
              ? `
                border-[var(--kora-pink-border)]/60
                bg-[var(--panel-fill-2)]
              `
              : `
                border-[var(--stroke)]
                bg-[var(--panel-fill-2)]
                hover:border-[var(--stroke-strong)]
              `
          }
        `}
      >
        <span
          className={
            value
              ? "text-[var(--fg)] text-xs"
              : "text-[var(--fg-4)] text-xs"
          }
        >
          {display || "Pick a time"}
        </span>

        <Clock className="w-4 h-4 text-[var(--fg-4)]" />
      </button>

      {dropdown}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN PAGE                                    */
/* -------------------------------------------------------------------------- */

export default function CalendarPage() {
  const supabase = createClient();
  const { error: toastError, success: toastSuccess } =
    useToast();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const router = useRouter();

  const now = new Date();

  const [view, setView] = useState<
    "calendar" | "grid"
  >("calendar");

  const [platformFilter, setPlatformFilter] =
    useState("All");

  const [currentMonth, setCurrentMonth] = useState(
    now.getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    now.getFullYear()
  );

  const [showAiModal, setShowAiModal] =
    useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const datePickerRef =
    useRef<HTMLDivElement>(null);

  const [aiTaskTitle, setAiTaskTitle] =
    useState("");

  const [aiTaskPrompt, setAiTaskPrompt] =
    useState("");

  const [aiTaskPlatform, setAiTaskPlatform] =
    useState("");

  const [aiTaskDate, setAiTaskDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  const [aiTaskTime, setAiTaskTime] = useState<{
    hour: number;
    minute: number;
    ampm: "AM" | "PM";
  } | null>(null);

  const [accounts, setAccounts] = useState<
    {
      id: string;
      platform: string;
      handle?: string;
      display_name?: string;
    }[]
  >([]);

  const [mediaFiles, setMediaFiles] = useState<
    {
      file: File;
      previewUrl: string;
      type: "image" | "video";
    }[]
  >([]);

  const [isSaving, setIsSaving] =
    useState(false);

  const [scheduledTasks, setScheduledTasks] =
    useState<any[]>([]);

  /* ---------------------------------------------------------------------- */
  /*                              LOAD DATA                                 */
  /* ---------------------------------------------------------------------- */

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: accountsData } =
      await supabase
        .from("social_accounts")
        .select(
          "id, platform, handle, display_name"
        );

    if (
      accountsData &&
      accountsData.length > 0
    ) {
      setAccounts(accountsData);

      setAiTaskPlatform(
        accountsData[0].platform
      );
    }

    const { data: aiTasksData } =
      await supabase
        .from("scheduled_ai_tasks")
        .select(
          "id, title, platform, trigger_at, status"
        )
        .eq("status", "pending")
        .order("trigger_at", {
          ascending: true,
        });

    const { data: scheduledPostsData } =
      await supabase
        .from("scheduled_posts")
        .select(
          "id, content, platform, scheduled_at, status"
        )
        .in("status", [
          "scheduled",
          "queued",
          "pending",
        ])
        .order("scheduled_at", {
          ascending: true,
        });

    let mergedEvents: any[] = [];

    if (aiTasksData) {
      mergedEvents = [
        ...mergedEvents,
        ...aiTasksData.map((task: any) => ({
          id: task.id,
          title: task.title,
          platform: task.platform,
          trigger_at: task.trigger_at,
          type: "ai_task",
        })),
      ];
    }

    if (scheduledPostsData) {
      mergedEvents = [
        ...mergedEvents,
        ...scheduledPostsData.map((post: any) => ({
          id: post.id,
          title:
            post.content.substring(0, 40) +
            (post.content.length > 40
              ? "..."
              : ""),
          platform: post.platform,
          trigger_at: post.scheduled_at,
          type: "post",
        })),
      ];
    }

    setScheduledTasks(mergedEvents);
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                              NAVIGATION                                */
  /* ---------------------------------------------------------------------- */

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const goToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(
          e.target as Node
        )
      ) {
        setShowDatePicker(false);
      }
    }

    if (showDatePicker) {
      document.addEventListener(
        "mousedown",
        handleClick
      );
    }

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, [showDatePicker]);

  /* ---------------------------------------------------------------------- */
  /*                              MEDIA                                     */
  /* ---------------------------------------------------------------------- */

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    if (
      file.type.startsWith("video/") &&
      file.size > 50 * 1024 * 1024
    ) {
      toastError(
        "File too large",
        "Videos must be under 50MB."
      );

      return;
    }

    let finalFile = file;

    if (file.type.startsWith("image/")) {
      try {
        finalFile = await imageCompression(
          file,
          {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          }
        );
      } catch (error) {
        console.error(
          "Compression error:",
          error
        );
      }
    }

    const previewUrl =
      URL.createObjectURL(finalFile);

    setMediaFiles((prev) => [
      ...prev,
      {
        file: finalFile,
        previewUrl,
        type: finalFile.type.startsWith(
          "video/"
        )
          ? "video"
          : "image",
      },
    ]);

    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const files = [...prev];

      URL.revokeObjectURL(
        files[index].previewUrl
      );

      files.splice(index, 1);

      return files;
    });
  };

  /* ---------------------------------------------------------------------- */
  /*                              SAVE TASK                                 */
  /* ---------------------------------------------------------------------- */

  const handleSaveTask = async () => {
    if (
      !aiTaskTitle ||
      !aiTaskPrompt ||
      !aiTaskDate ||
      !aiTaskTime
    ) {
      toastError(
        "Missing Fields",
        "Please fill in title, instructions, date and time."
      );

      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const uploadedUrls: string[] = [];

      for (const media of mediaFiles) {
        const fileExt =
          media.file.name.split(".").pop();

        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}_${Date.now()}.${fileExt}`;

        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("media")
            .upload(filePath, media.file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("media")
            .getPublicUrl(filePath);

        uploadedUrls.push(
          publicUrlData.publicUrl
        );
      }

      const {
        year,
        month,
        day,
      } = aiTaskDate;

      const {
        hour,
        minute,
        ampm,
      } = aiTaskTime;

      let hour24 = hour;

      if (ampm === "PM" && hour !== 12) {
        hour24 = hour + 12;
      }

      if (ampm === "AM" && hour === 12) {
        hour24 = 0;
      }

      const triggerAt = new Date(
        year,
        month,
        day,
        hour24,
        minute
      ).toISOString();

      const displayTime = new Date(
        year,
        month,
        day,
        hour24,
        minute
      ).toLocaleString();

      const { error: dbError } =
        await supabase
          .from("scheduled_ai_tasks")
          .insert({
            user_id: user.id,
            title: aiTaskTitle,
            prompt: aiTaskPrompt,
            platform: aiTaskPlatform,
            trigger_at: triggerAt,
            media_urls: uploadedUrls,
            status: "pending",
          });

      if (dbError) throw dbError;

      const taskNotes = `
📅 Scheduled AI Task

Platform: ${aiTaskPlatform || "Not set"}

Scheduled: ${displayTime}

Instructions:
${aiTaskPrompt}
      `;

      await supabase.from("tasks").insert({
        user_id: user.id,
        title: `[AI] ${aiTaskTitle}`,
        notes: taskNotes,
        priority: "normal",
        status: "pending",
      });

      toastSuccess(
        "Task Scheduled",
        "Your AI task has been scheduled successfully."
      );

      setShowAiModal(false);

      setAiTaskTitle("");
      setAiTaskPrompt("");
      setAiTaskDate(null);
      setAiTaskTime(null);

      setAiTaskPlatform(
        accounts.length > 0
          ? accounts[0].platform
          : ""
      );

      setMediaFiles([]);

      loadData();
    } catch (error: any) {
      console.error(error);

      toastError(
        "Error",
        error.message ||
          "Failed to schedule task."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              DELETE TASK                               */
  /* ---------------------------------------------------------------------- */

  const handleDeleteTask = async (
    taskId: string,
    type: "ai_task" | "post",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      const table =
        type === "post"
          ? "scheduled_posts"
          : "scheduled_ai_tasks";

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      loadData();

      toastSuccess(
        "Deleted",
        "Scheduled item removed."
      );
    } catch (error: any) {
      console.error(error);

      toastError(
        "Error",
        error.message ||
          "Failed to delete task."
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              CALENDAR DATA                             */
  /* ---------------------------------------------------------------------- */

  const daysInMonth = getDaysInMonth(
    currentYear,
    currentMonth
  );

  const firstDay = getFirstDayOfMonth(
    currentYear,
    currentMonth
  );

  const totalCells =
    Math.ceil(
      (firstDay + daysInMonth) / 7
    ) * 7;

  const upcomingTasks = scheduledTasks
    .filter(
      (task) =>
        new Date(task.trigger_at) >= new Date()
    )
    .slice(0, 4);

  /* ---------------------------------------------------------------------- */
  /*                                RETURN                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[1500px]
        px-4
        lg:px-6
        pb-8
        min-h-[calc(100vh-80px)]
        flex
        flex-col
      "
    >
      {/* ================================================================ */}
      {/* PAGE HEADER */}
      {/* ================================================================ */}

      <PageHeader
        eyebrow="CONTENT PLANNING"
        title="Content Calendar"
        sub="Plan, schedule and manage your content across all platforms."
        actions={
          <div className="flex items-center gap-2">
            {/* VIEW SWITCHER */}

            <div className="hidden md:flex items-center p-1 rounded-xl border border-[var(--stroke)] bg-[var(--panel-fill)]">
              <button
                onClick={() =>
                  setView("calendar")
                }
                className={`
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  text-xs
                  font-semibold
                  transition-all

                  ${
                    view === "calendar"
                      ? `
                        bg-[var(--panel-fill-2)]
                        text-[var(--fg)]
                        shadow-md
                      `
                      : `
                        text-[var(--fg-4)]
                        hover:text-[var(--fg)]
                      `
                  }
                `}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </button>

              <button
                onClick={() =>
                  setView("grid")
                }
                className={`
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  text-xs
                  font-semibold
                  transition-all

                  ${
                    view === "grid"
                      ? `
                        bg-[var(--panel-fill-2)]
                        text-[var(--fg)]
                        shadow-md
                      `
                      : `
                        text-[var(--fg-4)]
                        hover:text-[var(--fg)]
                      `
                  }
                `}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
            </div>

            {/* AI PLAN */}

            <button
              onClick={() =>
                setShowAiModal(true)
              }
              className="
                hidden
                sm:flex
                items-center
                gap-2
                h-10
                px-4
                rounded-xl
                border
                border-[var(--kora-pink-border)]
                bg-[var(--kora-pink-soft)]
                text-[var(--kora-pink)]
                text-xs
                font-semibold
                hover:bg-[var(--kora-pink-soft)]
                hover:border-[var(--kora-pink-border)]/50
                transition-all
              "
            >
              <Sparkles className="w-4 h-4" />
              AI Plan
            </button>

            {/* CREATE POST */}

            <PrimaryButton
              onClick={() =>
                router.push(
                  "/dashboard/compose"
                )
              }
              className="
                h-10
                px-5
                rounded-xl
                shadow-lg
                shadow-pink-500/20
              "
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Post
            </PrimaryButton>
          </div>
        }
      />

      {/* ================================================================ */}
      {/* MAIN CALENDAR */}
      {/* ================================================================ */}

      <GlassCard
        className="
          mt-5
          flex-1
          flex
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-[var(--stroke)]
          bg-[var(--panel-fill)]
          shadow-[0_20px_80px_rgba(0,0,0,0.35)]
        "
      >
        {/* ============================================================ */}
        {/* TOOLBAR */}
        {/* ============================================================ */}

        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-4
            px-5
            py-4
            border-b
            border-[var(--stroke)]
            bg-[var(--panel-fill)]
          "
        >
          {/* LEFT */}

          <div className="flex items-center gap-4">
            {/* MONTH TITLE */}

            <div
              className="relative"
              ref={datePickerRef}
            >
              <button
                onClick={() =>
                  setShowDatePicker((v) => !v)
                }
                className="
                  flex
                  items-center
                  gap-2
                  text-lg
                  font-semibold
                  tracking-tight
                  text-[var(--fg)]
                  hover:text-[var(--kora-pink)]
                  transition-colors
                "
              >
                {MONTHS[currentMonth]} {currentYear}

                <ChevronRight
                  className="
                    w-4 h-4
                    rotate-90
                    text-[var(--fg-4)]
                  "
                />
              </button>

              {showDatePicker && (
                <MiniDatePicker
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  onSelect={(month, year) => {
                    setCurrentMonth(month);
                    setCurrentYear(year);
                  }}
                  onClose={() =>
                    setShowDatePicker(false)
                  }
                />
              )}
            </div>

            {/* NAVIGATION */}

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  border
                  border-[var(--stroke)]
                  bg-[var(--panel-fill-2)]
                  text-[var(--fg-4)]
                  hover:text-[var(--fg)]
                  hover:bg-[var(--hover)]
                  transition-all
                "
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={goToday}
                className="
                  px-3
                  h-8
                  rounded-lg
                  border
                  border-[var(--stroke)]
                  bg-[var(--panel-fill-2)]
                  text-[11px]
                  font-semibold
                  text-[var(--fg-4)]
                  hover:text-[var(--fg)]
                  hover:border-[var(--kora-pink-border)]
                  transition-all
                "
              >
                Today
              </button>

              <button
                onClick={nextMonth}
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  border
                  border-[var(--stroke)]
                  bg-[var(--panel-fill-2)]
                  text-[var(--fg-4)]
                  hover:text-[var(--fg)]
                  hover:bg-[var(--hover)]
                  transition-all
                "
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PLATFORM FILTERS */}

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {PLATFORM_FILTERS.map(
              (platform) => (
                <button
                  key={platform}
                  onClick={() =>
                    setPlatformFilter(platform)
                  }
                  className={`
                    shrink-0
                    h-8
                    px-3
                    rounded-lg
                    text-[11px]
                    font-semibold
                    transition-all

                    ${
                      platformFilter === platform
                        ? `
                          bg-[var(--kora-pink)]
                          text-[var(--fg)]
                          shadow-lg
                          shadow-pink-500/20
                        `
                        : `
                          border
                          border-[var(--stroke)]
                          bg-[var(--panel-fill-2)]
                          text-[var(--fg-4)]
                          hover:text-[var(--fg)]
                          hover:border-[var(--stroke-strong)]
                        `
                    }
                  `}
                >
                  {platform}
                </button>
              )
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CALENDAR VIEW */}
        {/* ============================================================ */}

        {view === "calendar" ? (
          <div className="flex-1 overflow-auto bg-[var(--app-bg)]">
            {/* WEEK HEADERS */}

            <div
              className="
                grid
                grid-cols-7
                sticky
                top-0
                z-10
                border-b
                border-[var(--stroke)]
                bg-[var(--panel-fill-2)]
              "
            >
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="
                    py-3
                    text-center
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-[var(--fg-4)]
                  "
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR GRID */}

            <div
              className="grid grid-cols-7"
              style={{
                gridTemplateRows: `repeat(${
                  totalCells / 7
                }, minmax(145px, 1fr))`,
              }}
            >
              {Array.from({
                length: totalCells,
              }).map((_, index) => {
                const dayNum =
                  index - firstDay + 1;

                const isCurrentMonth =
                  dayNum >= 1 &&
                  dayNum <= daysInMonth;

                const isToday =
                  isCurrentMonth &&
                  dayNum === now.getDate() &&
                  currentMonth ===
                    now.getMonth() &&
                  currentYear ===
                    now.getFullYear();

                const scheduledEvents =
                  scheduledTasks.filter((task) => {
                    if (!task.trigger_at) return false;

                    const date = new Date(
                      task.trigger_at
                    );

                    const correctDate =
                      date.getDate() === dayNum &&
                      date.getMonth() ===
                        currentMonth &&
                      date.getFullYear() ===
                        currentYear;

                    const correctPlatform =
                      platformFilter === "All" ||
                      task.platform ===
                        platformFilter;

                    return (
                      correctDate &&
                      correctPlatform
                    );
                  });

                return (
                  <div
                    key={index}
                    className={`
                      relative
                      border-r
                      border-b
                      border-[var(--stroke)]
                      min-h-[145px]
                      p-2.5
                      transition-all

                      ${
                        isCurrentMonth
                          ? `
                            bg-[var(--panel-fill-2)]/70
                            hover:bg-[var(--hover)]
                          `
                          : `
                            bg-[var(--app-bg)]
                            opacity-30
                          `
                      }
                    `}
                  >
                    {/* DATE */}

                    <div className="flex justify-between mb-2">
                      <span
                        className={`
                          w-7
                          h-7
                          flex
                          items-center
                          justify-center
                          rounded-full
                          text-[11px]
                          font-semibold

                          ${
                            isToday
                              ? `
                                bg-[var(--kora-pink)]
                                text-[var(--fg)]
                                shadow-lg
                                shadow-pink-500/30
                              `
                              : `
                                text-[var(--fg-4)]
                              `
                          }
                        `}
                      >
                        {isCurrentMonth
                          ? dayNum
                          : ""}
                      </span>

                      {scheduledEvents.length > 0 && (
                        <span className="text-[9px] text-[var(--fg-4)]">
                          {scheduledEvents.length}
                        </span>
                      )}
                    </div>

                    {/* EVENTS */}

                    <div className="space-y-1.5">
                      {scheduledEvents
                        .slice(0, 3)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="
                              group
                              relative
                              cursor-pointer
                              overflow-hidden
                              rounded-xl
                              border
                              border-[var(--stroke)]
                              bg-[var(--panel-fill)]
                              from-[#101d2e]
                              to-[var(--panel-fill-2)]
                              px-2.5
                              py-2
                              pl-3
                              hover:border-[var(--kora-pink-border)]
                              hover:-translate-y-[1px]
                              hover:shadow-lg
                              transition-all
                            "
                          >
                            {/* PLATFORM ACCENT */}

                            <div
                              className={`
                                absolute
                                left-0
                                top-2
                                bottom-2
                                w-[2px]
                                rounded-r-full
                                ${getPlatformColor(
                                  event.platform
                                )}
                              `}
                            />

                            <div className="flex items-start gap-2">
                              {/* ICON */}

                              <div
                                className="
                                  mt-0.5
                                  w-6
                                  h-6
                                  shrink-0
                                  rounded-lg
                                  flex
                                  items-center
                                  justify-center
                                  bg-[var(--panel-fill-2)]
                                  border
                                  border-[var(--stroke)]
                                "
                              >
                                <PlatformIcon
                                  platform={
                                    event.platform
                                  }
                                  className="w-3 h-3"
                                />
                              </div>

                              {/* TEXT */}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] uppercase tracking-wider font-bold text-[var(--fg-4)]">
                                    {event.type ===
                                    "post"
                                      ? "Scheduled"
                                      : "AI Task"}
                                  </span>
                                </div>

                                <p className="mt-0.5 text-[10px] font-medium text-[var(--fg-2)] truncate group-hover:text-[var(--fg)]">
                                  {event.title}
                                </p>

                                <div className="flex items-center gap-1.5 mt-1">
                                  <Clock className="w-2.5 h-2.5 text-[var(--fg-4)]" />

                                  <span className="text-[8px] text-[var(--fg-4)]">
                                    {formatEventTime(
                                      event.trigger_at
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* DELETE */}

                            <button
                              onClick={(e) =>
                                handleDeleteTask(
                                  event.id,
                                  event.type,
                                  e
                                )
                              }
                              className="
                                absolute
                                top-1.5
                                right-1.5
                                w-5
                                h-5
                                rounded-md
                                opacity-0
                                group-hover:opacity-100
                                flex
                                items-center
                                justify-center
                                text-[var(--fg-4)]
                                hover:text-red-400
                                hover:bg-red-500/10
                                transition-all
                              "
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}

                      {scheduledEvents.length > 3 && (
                        <div className="text-[9px] text-[var(--kora-pink)] px-1">
                          +{scheduledEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* INSTAGRAM GRID */
          /* ============================================================ */

          <div
            className="
              flex-1
              overflow-auto
              bg-[var(--app-bg)]
              flex
              items-center
              justify-center
              p-8
              gap-16
            "
          >
            <div className="max-w-[320px] space-y-5">
              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-[var(--kora-pink-soft)]
                  border
                  border-[var(--kora-pink-border)]
                  flex
                  items-center
                  justify-center
                "
              >
                <LayoutGrid className="w-6 h-6 text-[var(--kora-pink)]" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[var(--fg)]">
                  Instagram Grid Preview
                </h3>

                <p className="text-sm text-[var(--fg-4)] leading-relaxed mt-3">
                  Preview how your upcoming
                  content will look on your
                  Instagram profile before it
                  goes live.
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-[var(--kora-pink-border)]/15
                  bg-[var(--kora-pink-soft)]
                  p-4
                "
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[var(--kora-pink)]" />

                  <span className="text-xs font-semibold text-[var(--kora-pink)]">
                    Visual Planning
                  </span>
                </div>

                <p className="text-xs text-[var(--fg-4)] leading-relaxed">
                  Rearrange your future
                  content to create a
                  consistent visual identity.
                </p>
              </div>
            </div>

            {/* PHONE */}

            <div
              className="
                w-full
                max-w-[350px]
                h-[700px]
                rounded-[38px]
                overflow-hidden
                border
                border-[var(--stroke-strong)]
                bg-[var(--panel-fill-2)]
                shadow-[0_30px_100px_rgba(0,0,0,0.6)]
                flex
                flex-col
              "
            >
              <div className="h-12 border-b border-[var(--stroke)] flex items-center justify-between px-6">
                <span className="text-sm font-bold text-[var(--fg)]">
                  @Koraspace_hq
                </span>

                <Layout className="w-4 h-4 text-[var(--fg-4)]" />
              </div>

              {/* PROFILE */}

              <div className="p-5 border-b border-[var(--stroke)] flex items-center gap-4">
                <div
                  className="
                    w-16
                    h-16
                    rounded-full
                    bg-[var(--kora-pink)]
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    shadow-pink-500/20
                  "
                >
                  <Sparkles className="w-6 h-6 text-[var(--fg)]" />
                </div>

                <div className="flex gap-5">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--fg)]">
                      124
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">
                      Posts
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--fg)]">
                      12.5K
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">
                      Followers
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--fg)]">
                      45
                    </p>
                    <p className="text-[10px] text-[var(--fg-4)]">
                      Following
                    </p>
                  </div>
                </div>
              </div>

              {/* GRID */}

              <div className="flex-1 bg-[var(--app-bg)] overflow-y-auto">
                <div className="grid grid-cols-3 gap-[2px]">
                  {Array.from({
                    length: 18,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className={`
                        aspect-square
                        relative
                        cursor-grab
                        active:cursor-grabbing

                        ${
                          index < 4
                            ? `
                              bg-[var(--panel-fill-2)]
                              border
                              border-[var(--kora-pink-border)]
                            `
                            : `
                              bg-[var(--hover)]
                            `
                        }
                      `}
                    >
                      {index < 4 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Pill
                            tone="indigo"
                            className="
                              scale-75
                              bg-[var(--kora-pink)]
                              border-[var(--kora-pink-border)]
                              text-[var(--fg)]
                              backdrop-blur-md
                            "
                          >
                            Scheduled
                          </Pill>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ================================================================ */}
      {/* BOTTOM DASHBOARD */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* UPCOMING POSTS */}

        <div
          className="
            rounded-2xl
            border
            border-[var(--stroke)]
            bg-[var(--panel-fill-2)]
            p-4
            shadow-lg
          "
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                Upcoming Posts
              </h3>

              <p className="text-[10px] text-[var(--fg-4)] mt-1">
                Your next scheduled content
              </p>
            </div>

            <span className="text-[10px] text-[var(--kora-pink)] font-medium">
              View all
            </span>
          </div>

          <div className="space-y-1">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="
                    flex
                    items-center
                    gap-3
                    p-2
                    rounded-xl
                    hover:bg-[var(--hover)]/60
                    transition-colors
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      border
                      border-[var(--stroke)]
                      bg-[var(--panel-fill-2)]
                    "
                  >
                    <PlatformIcon
                      platform={task.platform}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--fg-2)] truncate">
                      {task.title}
                    </p>

                    <p className="text-[9px] text-[var(--fg-4)] mt-1">
                      {formatEventDate(
                        task.trigger_at
                      )}{" "}
                      ·{" "}
                      {formatEventTime(
                        task.trigger_at
                      )}
                    </p>
                  </div>

                  <span
                    className="
                      text-[8px]
                      px-2
                      py-1
                      rounded-full
                      bg-emerald-500/10
                      text-emerald-400
                      font-bold
                    "
                  >
                    Scheduled
                  </span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <CalendarIcon className="w-5 h-5 mx-auto text-[var(--fg-4)] mb-2" />

                <p className="text-xs text-[var(--fg-4)]">
                  No upcoming posts
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT QUEUE */}

        <div
          className="
            rounded-2xl
            border
            border-[var(--stroke)]
            bg-[var(--panel-fill-2)]
            p-4
            shadow-lg
          "
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">
                Content Queue
              </h3>

              <p className="text-[10px] text-[var(--fg-4)] mt-1">
                Your publishing pipeline
              </p>
            </div>

            <span className="text-[10px] text-[var(--kora-pink)] font-medium">
              Manage
            </span>
          </div>

          <div className="space-y-2">
            {[
              {
                label: "Drafts",
                count: 12,
                icon: FileText,
                color: "text-[var(--fg-4)]",
              },
              {
                label: "Scheduled",
                count: scheduledTasks.length,
                icon: Clock,
                color: "text-blue-400",
              },
              {
                label: "Publishing",
                count: 3,
                icon: Send,
                color: "text-[var(--kora-pink)]",
              },
              {
                label: "Needs Approval",
                count: 5,
                icon: AlertCircle,
                color: "text-amber-400",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="
                    flex
                    items-center
                    justify-between
                    p-2.5
                    rounded-xl
                    border
                    border-[var(--stroke)]
                    bg-[var(--panel-fill-2)]
                    hover:bg-[var(--hover)]/60
                    transition-all
                  "
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-3.5 h-3.5 ${item.color}`}
                    />

                    <span className="text-xs text-[var(--fg-4)]">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-[var(--fg)]">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI PLANNER */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-[var(--kora-pink-border)]
            bg-[var(--panel-fill)]
            p-5
            shadow-lg
          "
        >
          {/* GLOW */}

          <div
            className="
              absolute
              -top-20
              -right-20
              w-48
              h-48
              rounded-full
              bg-[var(--kora-pink-soft)]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-0
              left-10
              w-32
              h-20
              rounded-full
              bg-pink-500/10
              blur-3xl
            "
          />

          <div className="relative z-10">
            <div
              className="
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                bg-[var(--kora-pink-soft)]
                border
                border-[var(--kora-pink-border)]
                mb-4
              "
            >
              <Sparkles className="w-5 h-5 text-[var(--kora-pink)]" />
            </div>

            <h3 className="text-base font-semibold text-[var(--fg)]">
              Let AI plan your content
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-[var(--fg-4)] max-w-[280px]">
              Generate a personalized content
              strategy based on your audience,
              trends and publishing goals.
            </p>

            <button
              onClick={() =>
                setShowAiModal(true)
              }
              className="
                mt-5
                w-full
                h-10
                rounded-xl
                bg-[var(--kora-pink)]
                text-xs
                font-semibold
                text-[var(--fg)]
                shadow-lg
                shadow-pink-500/20
                hover:scale-[1.01]
                hover:shadow-pink-500/30
                transition-all
              "
            >
              Generate Plan
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* AI MODAL */}
      {/* ================================================================ */}

      {showAiModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-[var(--app-bg)]/80
            backdrop-blur-md
            p-4
          "
        >
          <GlassCard
            className="
              w-full
              max-w-lg
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              border
              border-[var(--stroke)]
              bg-[var(--panel-fill-2)]
              shadow-[0_30px_100px_rgba(0,0,0,0.7)]
              flex
              flex-col
            "
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-[var(--stroke)]">
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-[var(--panel-fill)]
                    from-[var(--kora-pink-soft)]
                    to-pink-500/10
                    border
                    border-[var(--kora-pink-border)]
                  "
                >
                  <Bot className="w-5 h-5 text-[var(--kora-pink)]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--fg)] text-[16px]">
                    Schedule AI Task
                  </h3>

                  <p className="text-[10px] text-[var(--fg-4)] mt-0.5">
                    Automate your next piece of
                    content
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setShowAiModal(false)
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-[var(--fg-4)]
                  hover:text-[var(--fg)]
                  hover:bg-[var(--hover)]
                  transition-all
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FORM */}

            <div className="p-5 space-y-5">
              {/* TITLE */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-4)] block mb-2">
                  Task Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Morning Tech Tweet"
                  value={aiTaskTitle}
                  onChange={(e) =>
                    setAiTaskTitle(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-[var(--stroke)]
                    bg-[var(--panel-fill-2)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--fg)]
                    placeholder:text-[var(--fg-4)]
                    outline-none
                    transition-all
                    hover:border-[var(--stroke-strong)]
                    focus:border-[var(--kora-pink-border)]/60
                    focus:ring-2
                    focus:ring-[var(--kora-pink-soft)]
                  "
                />
              </div>

              {/* AI INSTRUCTIONS */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-4)] block mb-2">
                  AI Instructions
                </label>

                <textarea
                  rows={4}
                  placeholder="Describe what you want AI to create..."
                  value={aiTaskPrompt}
                  onChange={(e) =>
                    setAiTaskPrompt(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-[var(--stroke)]
                    bg-[var(--panel-fill-2)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--fg)]
                    placeholder:text-[var(--fg-4)]
                    outline-none
                    transition-all
                    hover:border-[var(--stroke-strong)]
                    focus:border-[var(--kora-pink-border)]/60
                    focus:ring-2
                    focus:ring-[var(--kora-pink-soft)]
                  "
                />
              </div>

              {/* DATE TIME */}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-4)] block mb-2">
                    Date
                  </label>

                  <DatePicker
                    value={aiTaskDate}
                    onChange={setAiTaskDate}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-4)] block mb-2">
                    Time
                  </label>

                  <TimePicker
                    value={aiTaskTime}
                    onChange={setAiTaskTime}
                  />
                </div>
              </div>

              {/* PLATFORM */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-4)] block mb-2">
                  Platform Account
                </label>

                {accounts.length === 0 ? (
                  <div
                    className="
                      w-full
                      rounded-xl
                      border
                      border-[var(--stroke)]
                      bg-[var(--panel-fill-2)]
                      px-4
                      py-3
                      text-xs
                      text-[var(--fg-4)]
                    "
                  >
                    No accounts connected
                  </div>
                ) : (
                  <Select
                    value={aiTaskPlatform}
                    onValueChange={
                      setAiTaskPlatform
                    }
                  >
                    <SelectTrigger
                      className="
                        w-full
                        h-auto
                        py-3
                        border-[var(--stroke)]
                        bg-[var(--panel-fill-2)]
                      "
                    >
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>

                    <SelectContent>
                      {accounts.map(
                        (account) => (
                          <SelectItem
                            key={account.id}
                            value={
                              account.platform
                            }
                            className="capitalize"
                          >
                            {account.platform} —{" "}
                            {account.handle ||
                              account.display_name ||
                              "Account"}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* MEDIA */}

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fg-4)] block mb-2">
                  Media Attachment
                  <span className="normal-case font-normal text-[var(--fg-4)] ml-1">
                    Optional
                  </span>
                </label>

                {mediaFiles.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mediaFiles.map(
                      (media, index) => (
                        <div
                          key={index}
                          className="
                            relative
                            w-20
                            h-20
                            shrink-0
                            rounded-xl
                            overflow-hidden
                            border
                            border-[var(--stroke)]
                            group
                          "
                        >
                          {media.type ===
                          "image" ? (
                            <img
                              src={
                                media.previewUrl
                              }
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={
                                media.previewUrl
                              }
                              className="w-full h-full object-cover"
                            />
                          )}

                          <button
                            onClick={() =>
                              removeMedia(index)
                            }
                            className="
                              absolute
                              top-1
                              right-1
                              w-6
                              h-6
                              rounded-full
                              bg-black/70
                              text-[var(--fg)]
                              flex
                              items-center
                              justify-center
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                            "
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    )}

                    <button
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="
                        w-20
                        h-20
                        shrink-0
                        rounded-xl
                        border
                        border-dashed
                        border-[var(--stroke-strong)]
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-[var(--fg-4)]
                        hover:text-[var(--kora-pink)]
                        hover:border-[var(--kora-pink-border)]
                        transition-all
                      "
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="
                      w-full
                      h-28
                      rounded-xl
                      border
                      border-dashed
                      border-[var(--stroke-strong)]
                      bg-[var(--panel-fill-2)]/60
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      text-[var(--fg-4)]
                      hover:text-[var(--fg-4)]
                      hover:border-[var(--kora-pink-border)]
                      hover:bg-[var(--panel-fill-2)]
                      transition-all
                    "
                  >
                    <div
                      className="
                        w-9
                        h-9
                        rounded-xl
                        bg-[var(--panel-fill-2)]
                        border
                        border-[var(--stroke)]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <ImageIcon className="w-4 h-4" />
                    </div>

                    <span className="text-[11px] font-medium">
                      Upload image or video
                    </span>
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
            </div>

            {/* MODAL FOOTER */}

            <div
              className="
                p-5
                border-t
                border-[var(--stroke)]
                flex
                justify-end
                gap-3
                bg-[var(--app-bg)]
              "
            >
              <button
                onClick={() =>
                  setShowAiModal(false)
                }
                className="
                  px-4
                  py-2.5
                  rounded-xl
                  text-xs
                  font-semibold
                  text-[var(--fg-4)]
                  hover:text-[var(--fg)]
                  hover:bg-[var(--hover)]
                  transition-all
                "
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTask}
                disabled={isSaving}
                className="
                  min-w-[130px]
                  h-10
                  px-5
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-[var(--kora-pink)]
                  text-xs
                  font-semibold
                  text-[var(--fg)]
                  shadow-lg
                  shadow-pink-500/20
                  hover:shadow-pink-500/30
                  disabled:opacity-60
                  transition-all
                "
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Task
                  </>
                )}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}