/**
 * Context Engine v2.0 - Brand Intelligence Source Adapter
 *
 * Thin adapter connecting Context Engine to the existing BrandIntelligenceLoader:
 * - Loads workspace brand persona and guardrails from Supabase
 * - Emits mandatory CRITICAL sections for non-negotiable guardrails (forbidden terms)
 * - Emits HIGH priority sections for voice, tone, audience, and content pillars
 * - Fails gracefully with fallback defaults without throwing exceptions
 */

import { BrandIntelligenceLoader } from "../../memory/brand";
import type { BrandIntelligence } from "../../memory/types";
import { estimateTokens } from "../budget";
import {
  ContextPriority,
  type ContextRequest,
  type ContextSection,
  type ContextSource,
  type SourceResult,
} from "../types";

export class BrandSource implements ContextSource {
  public readonly name = "brand";
  public readonly priority = ContextPriority.HIGH;

  /**
   * Fetches brand intelligence for the workspace and converts it into structured context sections.
   */
  public async fetch(
    request: ContextRequest,
    _allocatedBudget?: number
  ): Promise<SourceResult> {
    const startTime = Date.now();
    const { workspaceId, supabase } = request;

    if (!workspaceId) {
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: "Missing workspaceId in ContextRequest",
      };
    }

    try {
      const brand = await BrandIntelligenceLoader.load(workspaceId, supabase);
      const sections: ContextSection[] = [];

      // 1. Mandatory Brand Safety Guardrails & Forbidden Terms
      if (brand.forbiddenTerms && brand.forbiddenTerms.length > 0) {
        const guardrailLines: string[] = [
          "### MANDATORY BRAND GUARDRAILS (NEVER VIOLATE)",
          `Strictly forbidden terms and claims: ${brand.forbiddenTerms.map((t) => `"${t}"`).join(", ")}`,
        ];

        if (brand.brandGuidelines && brand.brandGuidelines.length > 0) {
          guardrailLines.push("Compliance guidelines:");
          for (const rule of brand.brandGuidelines) {
            guardrailLines.push(`• ${rule}`);
          }
        }

        const guardrailContent = guardrailLines.join("\n");
        sections.push({
          id: `brand-guardrails-${workspaceId}`,
          source: this.name,
          title: "Brand Guardrails & Safety Rules",
          content: guardrailContent,
          priority: ContextPriority.CRITICAL,
          relevanceScore: 1.0,
          importanceScore: 5,
          estimatedTokens: estimateTokens(guardrailContent),
          isMandatory: true,
          target: "system_prompt",
          metadata: {
            forbiddenTermsCount: brand.forbiddenTerms.length,
          },
        });
      }

      // 2. Core Brand Voice, Identity & Content Pillars (High Priority)
      const identityLines: string[] = ["### WORKSPACE BRAND INTELLIGENCE"];
      if (brand.brandName) identityLines.push(`- **Brand / Creator:** ${brand.brandName}`);
      if (brand.niche) identityLines.push(`- **Niche / Industry:** ${brand.niche}`);
      if (brand.brandVoice) identityLines.push(`- **Core Voice:** "${brand.brandVoice}"`);
      if (brand.toneSummary) identityLines.push(`- **Tone Profile:** ${brand.toneSummary}`);

      if (brand.targetAudience && brand.targetAudience.length > 0) {
        identityLines.push(`- **Target Audience:** ${brand.targetAudience.join("; ")}`);
      }
      if (brand.contentPillars && brand.contentPillars.length > 0) {
        identityLines.push(`- **Content Pillars:** ${brand.contentPillars.join(", ")}`);
      }
      if (brand.preferredTerms && brand.preferredTerms.length > 0) {
        identityLines.push(`- **Preferred Terms:** ${brand.preferredTerms.join(", ")}`);
      }
      if (brand.ctaPreferences && brand.ctaPreferences.length > 0) {
        identityLines.push(`- **CTA Preferences:** ${brand.ctaPreferences.join("; ")}`);
      }

      const identityContent = identityLines.join("\n");
      sections.push({
        id: `brand-identity-${workspaceId}`,
        source: this.name,
        title: "Brand Identity & Voice",
        content: identityContent,
        priority: ContextPriority.HIGH,
        relevanceScore: 0.90,
        importanceScore: 4,
        estimatedTokens: estimateTokens(identityContent),
        isMandatory: false,
        target: "system_prompt",
        metadata: {
          niche: brand.niche,
          hasAudience: brand.targetAudience.length > 0,
        },
      });

      return {
        source: this.name,
        sections,
        latencyMs: Date.now() - startTime,
        success: true,
        rawData: { brand },
      };
    } catch (err: any) {
      console.warn("[BrandSource] Non-fatal error loading brand intelligence:", err);
      return {
        source: this.name,
        sections: [],
        latencyMs: Date.now() - startTime,
        success: false,
        error: err?.message || "Failed to load brand intelligence",
      };
    }
  }
}
