/**
 * Calendar Best Time to Post & Audience Surge Model
 *
 * Provides deterministic and data-driven optimal posting recommendations
 * across social platforms and days of the week.
 */

export interface OptimalTimeSlot {
  hour: number;
  minute: number;
  ampm: "AM" | "PM";
  formatted: string;
  label: string;
  surgeWindow: string;
  activityScore: number;
  activityLevel: "peak" | "high" | "moderate" | "normal";
}

/**
 * Benchmark peak engagement and audience surge slots by platform and weekday (0 = Sun, 1 = Mon, ..., 6 = Sat).
 */
const PLATFORM_WEEKDAY_PEAKS: Record<
  string,
  Record<number, { hour: number; minute: number; ampm: "AM" | "PM"; label: string; window: string; score: number }>
> = {
  x: {
    0: { hour: 6, minute: 30, ampm: "PM", label: "Sunday Evening Catchup", window: "6:00 PM – 8:00 PM", score: 86 },
    1: { hour: 9, minute: 0, ampm: "AM", label: "Monday Morning Prime", window: "8:30 AM – 10:00 AM", score: 92 },
    2: { hour: 12, minute: 30, ampm: "PM", label: "Tuesday Lunch Surge", window: "12:00 PM – 2:00 PM", score: 95 },
    3: { hour: 9, minute: 0, ampm: "AM", label: "Wednesday Morning Peak", window: "8:30 AM – 10:30 AM", score: 98 },
    4: { hour: 1, minute: 15, ampm: "PM", label: "Thursday Midday Wave", window: "12:30 PM – 2:30 PM", score: 94 },
    5: { hour: 11, minute: 0, ampm: "AM", label: "Friday Wrap-up", window: "10:30 AM – 1:00 PM", score: 89 },
    6: { hour: 10, minute: 0, ampm: "AM", label: "Saturday Weekend Scroll", window: "9:30 AM – 11:30 AM", score: 82 },
  },
  linkedin: {
    0: { hour: 4, minute: 0, ampm: "PM", label: "Sunday Prep Window", window: "3:30 PM – 5:30 PM", score: 78 },
    1: { hour: 8, minute: 30, ampm: "AM", label: "Monday Work Kickoff", window: "8:00 AM – 10:00 AM", score: 91 },
    2: { hour: 10, minute: 15, ampm: "AM", label: "Tuesday Peak Professional", window: "9:30 AM – 11:30 AM", score: 99 },
    3: { hour: 8, minute: 45, ampm: "AM", label: "Wednesday Executive Slot", window: "8:00 AM – 10:30 AM", score: 97 },
    4: { hour: 1, minute: 30, ampm: "PM", label: "Thursday Business Lunch", window: "12:30 PM – 2:30 PM", score: 95 },
    5: { hour: 9, minute: 0, ampm: "AM", label: "Friday Morning Catchup", window: "8:30 AM – 10:30 AM", score: 85 },
    6: { hour: 11, minute: 0, ampm: "AM", label: "Weekend Executive Read", window: "10:00 AM – 12:30 PM", score: 72 },
  },
  instagram: {
    0: { hour: 7, minute: 30, ampm: "PM", label: "Sunday Prime Leisure", window: "6:30 PM – 9:00 PM", score: 93 },
    1: { hour: 11, minute: 30, ampm: "AM", label: "Monday Lunch Scroll", window: "11:00 AM – 1:30 PM", score: 90 },
    2: { hour: 7, minute: 0, ampm: "PM", label: "Tuesday Evening Surge", window: "6:00 PM – 8:30 PM", score: 94 },
    3: { hour: 12, minute: 0, ampm: "PM", label: "Wednesday Lunch Wave", window: "11:30 AM – 1:30 PM", score: 97 },
    4: { hour: 7, minute: 30, ampm: "PM", label: "Thursday Night Buzz", window: "6:30 PM – 9:00 PM", score: 96 },
    5: { hour: 2, minute: 0, ampm: "PM", label: "Friday Afternoon Buzz", window: "1:00 PM – 3:30 PM", score: 92 },
    6: { hour: 11, minute: 0, ampm: "AM", label: "Saturday Brunch Wave", window: "10:00 AM – 1:00 PM", score: 88 },
  },
  tiktok: {
    0: { hour: 8, minute: 0, ampm: "PM", label: "Sunday Night Binge", window: "7:00 PM – 10:00 PM", score: 95 },
    1: { hour: 3, minute: 0, ampm: "PM", label: "Monday Afternoon", window: "2:00 PM – 5:00 PM", score: 88 },
    2: { hour: 7, minute: 30, ampm: "PM", label: "Tuesday Night Stream", window: "6:30 PM – 9:30 PM", score: 96 },
    3: { hour: 4, minute: 0, ampm: "PM", label: "Wednesday Mid-week", window: "3:00 PM – 6:00 PM", score: 92 },
    4: { hour: 7, minute: 0, ampm: "PM", label: "Thursday Prime Wave", window: "6:00 PM – 9:00 PM", score: 98 },
    5: { hour: 5, minute: 0, ampm: "PM", label: "Friday Weekend Launch", window: "4:00 PM – 7:30 PM", score: 97 },
    6: { hour: 8, minute: 30, ampm: "PM", label: "Saturday Night Viral", window: "7:30 PM – 10:30 PM", score: 94 },
  },
  youtube: {
    0: { hour: 3, minute: 0, ampm: "PM", label: "Sunday Longform Prime", window: "2:00 PM – 5:00 PM", score: 96 },
    1: { hour: 2, minute: 0, ampm: "PM", label: "Monday Afternoon", window: "1:00 PM – 4:00 PM", score: 88 },
    2: { hour: 2, minute: 0, ampm: "PM", label: "Tuesday Upload Slot", window: "1:00 PM – 4:00 PM", score: 90 },
    3: { hour: 3, minute: 30, ampm: "PM", label: "Wednesday Mid-week Stream", window: "2:30 PM – 5:30 PM", score: 92 },
    4: { hour: 4, minute: 0, ampm: "PM", label: "Thursday Evening Indexing", window: "3:00 PM – 6:00 PM", score: 95 },
    5: { hour: 3, minute: 0, ampm: "PM", label: "Friday Weekend Prime", window: "2:00 PM – 5:30 PM", score: 98 },
    6: { hour: 10, minute: 30, ampm: "AM", label: "Saturday Morning Watch", window: "9:30 AM – 1:00 PM", score: 94 },
  },
  threads: {
    0: { hour: 7, minute: 0, ampm: "PM", label: "Sunday Conversation", window: "6:00 PM – 8:30 PM", score: 90 },
    1: { hour: 9, minute: 30, ampm: "AM", label: "Monday Morning Ideas", window: "8:30 AM – 11:00 AM", score: 91 },
    2: { hour: 12, minute: 30, ampm: "PM", label: "Tuesday Lunch Dialogue", window: "11:30 AM – 1:30 PM", score: 93 },
    3: { hour: 10, minute: 0, ampm: "AM", label: "Wednesday Morning Peak", window: "9:00 AM – 11:30 AM", score: 96 },
    4: { hour: 3, minute: 0, ampm: "PM", label: "Thursday Discussion", window: "2:00 PM – 4:30 PM", score: 94 },
    5: { hour: 1, minute: 30, ampm: "PM", label: "Friday Afternoon Scroll", window: "12:30 PM – 3:00 PM", score: 89 },
    6: { hour: 11, minute: 0, ampm: "AM", label: "Saturday Morning Share", window: "10:00 AM – 12:30 PM", score: 85 },
  },
};

const DEFAULT_GLOBAL_PEAKS: Record<number, { hour: number; minute: number; ampm: "AM" | "PM"; label: string; window: string; score: number }> = {
  0: { hour: 7, minute: 0, ampm: "PM", label: "Sunday Prime", window: "6:00 PM – 8:30 PM", score: 90 },
  1: { hour: 9, minute: 0, ampm: "AM", label: "Monday Morning", window: "8:30 AM – 10:30 AM", score: 92 },
  2: { hour: 12, minute: 30, ampm: "PM", label: "Tuesday Midday", window: "11:30 AM – 1:30 PM", score: 95 },
  3: { hour: 10, minute: 0, ampm: "AM", label: "Wednesday Peak", window: "9:00 AM – 11:30 AM", score: 98 },
  4: { hour: 2, minute: 0, ampm: "PM", label: "Thursday Prime", window: "1:00 PM – 3:30 PM", score: 95 },
  5: { hour: 3, minute: 0, ampm: "PM", label: "Friday Afternoon", window: "2:00 PM – 5:00 PM", score: 94 },
  6: { hour: 11, minute: 0, ampm: "AM", label: "Saturday Morning", window: "10:00 AM – 1:00 PM", score: 86 },
};

/**
 * Calculates optimal posting slot for a given date and optional platform.
 */
export function getOptimalPostTimeForDay(date: Date, platform?: string): OptimalTimeSlot {
  const dayOfWeek = date.getDay();
  const cleanPlatform = (platform || "").toLowerCase();

  const platformPeak = PLATFORM_WEEKDAY_PEAKS[cleanPlatform]?.[dayOfWeek];
  const peak = platformPeak || DEFAULT_GLOBAL_PEAKS[dayOfWeek];

  const formattedMin = peak.minute < 10 ? `0${peak.minute}` : `${peak.minute}`;
  const formatted = `${peak.hour}:${formattedMin} ${peak.ampm}`;

  let activityLevel: OptimalTimeSlot["activityLevel"] = "normal";
  if (peak.score >= 95) activityLevel = "peak";
  else if (peak.score >= 90) activityLevel = "high";
  else if (peak.score >= 80) activityLevel = "moderate";

  return {
    hour: peak.hour,
    minute: peak.minute,
    ampm: peak.ampm,
    formatted,
    label: peak.label,
    surgeWindow: peak.window,
    activityScore: peak.score,
    activityLevel,
  };
}

/**
 * Platform character limits and configurations.
 */
export const PLATFORM_CONFIGS: Record<
  string,
  {
    name: string;
    maxChars: number;
    color: string;
    bgBadge: string;
    supportsVideo: boolean;
    supportsMultiImage: boolean;
  }
> = {
  x: {
    name: "X (Twitter)",
    maxChars: 280,
    color: "#1DA1F2",
    bgBadge: "rgba(29, 161, 242, 0.12)",
    supportsVideo: true,
    supportsMultiImage: true,
  },
  twitter: {
    name: "X (Twitter)",
    maxChars: 280,
    color: "#1DA1F2",
    bgBadge: "rgba(29, 161, 242, 0.12)",
    supportsVideo: true,
    supportsMultiImage: true,
  },
  linkedin: {
    name: "LinkedIn",
    maxChars: 3000,
    color: "#0A66C2",
    bgBadge: "rgba(10, 102, 194, 0.12)",
    supportsVideo: true,
    supportsMultiImage: true,
  },
  instagram: {
    name: "Instagram",
    maxChars: 2200,
    color: "#E1306C",
    bgBadge: "rgba(225, 48, 108, 0.12)",
    supportsVideo: true,
    supportsMultiImage: true,
  },
  tiktok: {
    name: "TikTok",
    maxChars: 2200,
    color: "#00F2FE",
    bgBadge: "rgba(0, 242, 254, 0.12)",
    supportsVideo: true,
    supportsMultiImage: false,
  },
  youtube: {
    name: "YouTube",
    maxChars: 5000,
    color: "#FF0000",
    bgBadge: "rgba(255, 0, 0, 0.12)",
    supportsVideo: true,
    supportsMultiImage: false,
  },
  threads: {
    name: "Threads",
    maxChars: 500,
    color: "#888888",
    bgBadge: "rgba(136, 136, 136, 0.12)",
    supportsVideo: true,
    supportsMultiImage: true,
  },
  facebook: {
    name: "Facebook",
    maxChars: 63206,
    color: "#1877F2",
    bgBadge: "rgba(24, 119, 242, 0.12)",
    supportsVideo: true,
    supportsMultiImage: true,
  },
};
