/**
 * Typed AI Tool: scrape_url
 *
 * Scrapes, extracts, and normalizes human-readable text and metadata from web URLs.
 */

import * as cheerio from "cheerio";
import type { AITool, AgentContext, AgentResult } from "../core/types";

export interface ScrapeUrlInput {
  url: string;
  maxCharacters?: number;
}

export interface ScrapeUrlOutput {
  url: string;
  title?: string;
  description?: string;
  content: string;
  characterCount: number;
  truncated: boolean;
}

export const scrapeUrlTool: AITool<
  ScrapeUrlInput,
  ScrapeUrlOutput
> = {
  name: "scrape_url",
  description: "Scrape and extract the main article text, title, and metadata from a given public web URL. Useful for competitor research, fact-checking, and repurposing external content.",
  requiredCapabilities: ["web:search"],
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The full HTTP/HTTPS URL of the webpage to scrape and extract text from",
      },
      maxCharacters: {
        type: "number",
        description: "Maximum character length of the extracted text (defaults to 5000, max 15000)",
      },
    },
    required: ["url"],
  },

  validateInput(raw: unknown): ScrapeUrlInput {
    if (!raw || typeof raw !== "object") {
      throw new Error("Input must be an object containing a 'url' string.");
    }
    const { url, maxCharacters } = raw as Record<string, unknown>;
    if (typeof url !== "string" || !url.trim()) {
      throw new Error("Missing or empty 'url' parameter.");
    }

    const trimmedUrl = url.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      throw new Error("Invalid URL: Must start with http:// or https://");
    }

    return {
      url: trimmedUrl,
      maxCharacters: typeof maxCharacters === "number" ? Math.max(500, Math.min(15000, maxCharacters)) : 5000,
    };
  },

  async execute(
    input: ScrapeUrlInput,
    _context: AgentContext
  ): Promise<AgentResult<ScrapeUrlOutput>> {
    const targetUrl = input.url;
    const limit = input.maxCharacters || 5000;

    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return {
          success: false,
          error: {
            code: "HTTP_ERROR",
            message: `Failed to fetch URL. Web server responded with status: ${res.status}`,
            retryable: res.status >= 500,
          },
        };
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Extract metadata
      const title = $("title").first().text().trim() || $("meta[property='og:title']").attr("content") || undefined;
      const description = $("meta[name='description']").attr("content") || $("meta[property='og:description']").attr("content") || undefined;

      // Remove non-content tags
      $("script, style, nav, footer, header, noscript, iframe, svg, button, form").remove();

      // Extract main text
      let text = $("main, article, #content, .content, body")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (!text) {
        text = $("body").text().replace(/\s+/g, " ").trim();
      }

      const truncated = text.length > limit;
      const cleanContent = truncated ? text.slice(0, limit) + "... (truncated)" : text;

      return {
        success: true,
        data: {
          url: targetUrl,
          title,
          description,
          content: cleanContent || "No readable text found on page.",
          characterCount: cleanContent.length,
          truncated,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: "SCRAPE_FAILED",
          message: err?.message || `Failed to scrape content from "${targetUrl}".`,
          retryable: true,
        },
      };
    }
  },
};
