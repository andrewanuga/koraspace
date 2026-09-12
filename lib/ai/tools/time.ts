/**
 * Typed AI Tool: get_current_time
 *
 * Provides structured date, time, and timezone information for agent planning and scheduling.
 */

import type { AITool, AgentContext, AgentResult } from "../core/types";

export interface GetCurrentTimeInput {
  timeZone?: string;
}

export interface GetCurrentTimeOutput {
  iso: string;
  formatted: string;
  timeZone: string;
  dayOfWeek: string;
  date: string;
  time: string;
  year: number;
}

export const getCurrentTimeTool: AITool<
  GetCurrentTimeInput,
  GetCurrentTimeOutput
> = {
  name: "get_current_time",
  description: "Get the current date, local time, and day of week. Useful for temporal reasoning and post scheduling.",
  parameters: {
    type: "object",
    properties: {
      timeZone: {
        type: "string",
        description: "Optional IANA timezone identifier (e.g. 'Africa/Lagos', 'UTC', 'America/New_York'). Defaults to system/local timezone.",
      },
    },
    required: [],
  },

  validateInput(raw: unknown): GetCurrentTimeInput {
    if (!raw || typeof raw !== "object") {
      return {};
    }
    const { timeZone } = raw as Record<string, unknown>;
    return {
      timeZone: typeof timeZone === "string" ? timeZone.trim() : undefined,
    };
  },

  async execute(
    input: GetCurrentTimeInput,
    _context: AgentContext
  ): Promise<AgentResult<GetCurrentTimeOutput>> {
    const now = new Date();
    const tz = input.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    let formatted: string;
    let dayOfWeek: string;
    let dateStr: string;
    let timeStr: string;

    try {
      formatted = now.toLocaleString("en-US", { timeZone: tz, timeZoneName: "short" });
      dayOfWeek = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" }).format(now);
      dateStr = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "long", day: "numeric" }).format(now);
      timeStr = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", second: "numeric" }).format(now);
    } catch {
      // Fallback if timezone string is invalid
      formatted = now.toLocaleString("en-US", { timeZoneName: "short" });
      dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
      dateStr = now.toDateString();
      timeStr = now.toTimeString();
    }

    return {
      success: true,
      data: {
        iso: now.toISOString(),
        formatted,
        timeZone: tz,
        dayOfWeek,
        date: dateStr,
        time: timeStr,
        year: now.getFullYear(),
      },
    };
  },
};
