/**
 * Brand Intelligence Loader & Compliance Guardrails
 *
 * Loads, normalizes, and enforces workspace brand identity:
 * - Extracts brand persona from profiles and ai_persona
 * - Generates structured system-prompt context for ChatAgent & GhostAgent
 * - Provides deterministic compliance checks against forbidden terms & guardrails
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BrandComplianceReport,
  BrandIntelligence,
  StyleTraits,
} from "./types";

export class BrandIntelligenceLoader {
  /**
   * Loads the complete BrandIntelligence profile for a workspace.
   */
  public static async load(
    workspaceId: string,
    supabase?: SupabaseClient
  ): Promise<BrandIntelligence> {
    const defaultTraits: StyleTraits = {
      formality: "balanced",
      emojiUse: "occasional",
      sentenceLength: "medium",
      exclaimRate: 0,
      avgWordsPerSentence: 14,
    };

    if (!supabase) {
      return this.createDefaultBrand(workspaceId, defaultTraits);
    }

    try {
      // 1. Fetch Profile Data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, brand_website, brand_voice, niche, persona, business_type, scaling_goal")
        .eq("id", workspaceId)
        .single();

      // 2. Fetch AI Persona Data
      const { data: persona } = await supabase
        .from("ai_persona")
        .select("*")
        .eq("user_id", workspaceId)
        .single();

      const styleTraits: StyleTraits = persona?.style_traits
        ? {
            formality: persona.style_traits.formality || defaultTraits.formality,
            emojiUse: persona.style_traits.emoji || persona.style_traits.emojiUse || defaultTraits.emojiUse,
            sentenceLength: persona.style_traits.sentence_length || persona.style_traits.sentenceLength || defaultTraits.sentenceLength,
            exclaimRate: Number(persona.style_traits.exclaim_rate ?? defaultTraits.exclaimRate),
            avgWordsPerSentence: Number(persona.style_traits.avg_words ?? defaultTraits.avgWordsPerSentence),
          }
        : defaultTraits;

      const targetAudience: string[] = [];
      if (persona?.target_audience) {
        targetAudience.push(persona.target_audience);
      } else if (profile?.persona === "creator") {
        targetAudience.push("Content consumers, loyal community, and niche followers");
      } else if (profile?.persona === "marketer") {
        targetAudience.push("Prospective B2B/B2C buyers, qualified leads, and decision-makers");
      } else {
        targetAudience.push("General engaged audience and social followers");
      }

      const contentPillars: string[] = Array.isArray(persona?.content_pillars)
        ? persona.content_pillars
        : profile?.niche
        ? [profile.niche, "Industry Insights", "Actionable Tactics", "Product Updates"]
        : ["Industry Insights", "Educational Breakdowns", "Behind the Scenes"];

      const preferredTerms: string[] = Array.isArray(persona?.preferred_terms)
        ? persona.preferred_terms
        : [];

      const forbiddenTerms: string[] = Array.isArray(persona?.forbidden_terms)
        ? persona.forbidden_terms
        : ["guaranteed overnight success", "get rich quick", "100% risk free"];

      const ctaPreferences: string[] = Array.isArray(persona?.cta_preferences)
        ? persona.cta_preferences
        : ["Ask an engaging question at the end", "Invite constructive thoughts in the replies"];

      const brandGuidelines: string[] = Array.isArray(persona?.brand_guidelines)
        ? persona.brand_guidelines
        : ["Be authentic, concise, and deliver immediate value in the first 2 lines."];

      return {
        workspaceId,
        brandName: profile?.full_name || undefined,
        brandWebsite: profile?.brand_website || undefined,
        niche: profile?.niche || undefined,
        brandVoice: profile?.brand_voice || persona?.tone_summary || "Professional, concise, and high-signal",
        toneSummary: persona?.tone_summary || `${styleTraits.formality}, ${styleTraits.sentenceLength} sentences, ${styleTraits.emojiUse} emoji use`,
        targetAudience,
        contentPillars,
        preferredTerms,
        forbiddenTerms,
        ctaPreferences,
        brandGuidelines,
        styleTraits,
        sampleCount: persona?.sample_count ?? 0,
        lastUpdated: persona?.updated_at || undefined,
      };
    } catch (err) {
      console.warn("[BrandIntelligenceLoader] Error loading brand profile, using defaults:", err);
      return this.createDefaultBrand(workspaceId, defaultTraits);
    }
  }

  /**
   * Formats the BrandIntelligence into structured Markdown for agent system prompts.
   */
  public static formatPromptSection(brand: BrandIntelligence): string {
    const lines: string[] = [];

    lines.push("### WORKSPACE BRAND INTELLIGENCE");
    if (brand.brandName) lines.push(`- **Brand / Creator:** ${brand.brandName}`);
    if (brand.niche) lines.push(`- **Niche / Industry:** ${brand.niche}`);
    if (brand.brandVoice) lines.push(`- **Core Voice:** "${brand.brandVoice}"`);
    if (brand.toneSummary) lines.push(`- **Tone Profile:** ${brand.toneSummary}`);

    if (brand.targetAudience.length > 0) {
      lines.push(`- **Target Audience:** ${brand.targetAudience.join("; ")}`);
    }

    if (brand.contentPillars.length > 0) {
      lines.push(`- **Content Pillars:** ${brand.contentPillars.join(", ")}`);
    }

    if (brand.preferredTerms.length > 0) {
      lines.push(`- **Preferred Vocabulary:** ${brand.preferredTerms.join(", ")}`);
    }

    if (brand.forbiddenTerms.length > 0) {
      lines.push(`- **Forbidden Guardrails (NEVER USE):** ${brand.forbiddenTerms.map((t) => `"${t}"`).join(", ")}`);
    }

    if (brand.ctaPreferences.length > 0) {
      lines.push(`- **CTA Preferences:** ${brand.ctaPreferences.join("; ")}`);
    }

    return lines.join("\n");
  }

  /**
   * Performs deterministic compliance checks on generated content against brand guardrails.
   */
  public static checkCompliance(
    content: string,
    brand: BrandIntelligence
  ): BrandComplianceReport {
    const lower = content.toLowerCase();
    const violations: string[] = [];
    const suggestions: string[] = [];

    // Check forbidden terms
    for (const term of brand.forbiddenTerms) {
      if (lower.includes(term.toLowerCase())) {
        violations.push(`Contains forbidden term or claim: "${term}"`);
        suggestions.push(`Remove or rephrase references to "${term}" with verified facts.`);
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      suggestions,
    };
  }

  private static createDefaultBrand(
    workspaceId: string,
    defaultTraits: StyleTraits
  ): BrandIntelligence {
    return {
      workspaceId,
      brandVoice: "Professional, authoritative, and concise",
      toneSummary: "balanced, medium sentences, occasional emoji use",
      targetAudience: ["Social followers and engaged community members"],
      contentPillars: ["Industry Insights", "Educational Content", "Updates"],
      preferredTerms: [],
      forbiddenTerms: ["guaranteed overnight success", "100% risk free", "get rich quick"],
      ctaPreferences: ["Ask a discussion question at the end"],
      brandGuidelines: ["Provide high-signal insights without fluff."],
      styleTraits: defaultTraits,
      sampleCount: 0,
    };
  }
}
