/**
 * Typed AI Tool: get_weather
 *
 * Fetches and normalizes current weather observations for situational/contextual post ideation.
 */

import type { AITool, AgentContext, AgentResult } from "../core/types";

export interface GetWeatherInput {
  location: string;
}

export interface GetWeatherOutput {
  location: string;
  condition: string;
  temperature: string;
  feelsLike?: string;
  wind?: string;
  summary: string;
}

export const getWeatherTool: AITool<
  GetWeatherInput,
  GetWeatherOutput
> = {
  name: "get_weather",
  description: "Get the current weather and atmospheric conditions for a given city or region. Useful for localized content and weather-related hooks.",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City or region name (e.g. 'Lagos', 'Nairobi', 'London', 'Abuja')",
      },
    },
    required: ["location"],
  },

  validateInput(raw: unknown): GetWeatherInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing a 'location' string.");
    }
    const { location } = raw as Record<string, unknown>;
    if (typeof location !== "string" || !location.trim()) {
      throw new Error("Missing or empty 'location' parameter.");
    }
    return {
      location: location.trim(),
    };
  },

  async execute(
    input: GetWeatherInput,
    _context: AgentContext
  ): Promise<AgentResult<GetWeatherOutput>> {
    const loc = input.location;
    const url = `https://wttr.in/${encodeURIComponent(loc)}?format=%C+%t+feels+like+%f,+wind+%w`;

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "SociallyAI-Agent/1.0" },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) {
        return {
          success: false,
          error: {
            code: "WEATHER_API_UNAVAILABLE",
            message: `Weather provider responded with status ${res.status} for location "${loc}".`,
            retryable: true,
          },
        };
      }

      const rawText = (await res.text()).trim();
      const summary = `Weather in ${loc}: ${rawText}`;

      return {
        success: true,
        data: {
          location: loc,
          condition: rawText.split(" ")[0] || "Unknown",
          temperature: rawText.split(" ")[1] || "",
          summary,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: "WEATHER_FETCH_FAILED",
          message: err?.message || `Failed to connect to weather provider for "${loc}".`,
          retryable: true,
        },
      };
    }
  },
};
