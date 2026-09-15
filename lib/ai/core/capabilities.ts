/**
 * Canonical Capability Definitions & Governance Metadata
 *
 * Defines the single, domain-oriented Capability primitive:
 * - Decouples what an actor is authorized to do from tool implementation details
 * - Provides metadata for descriptions and default risk profiles
 * - Provides a strict, fail-closed legacy adapter boundary
 */

export type Capability =
  | "content:generate"
  | "content:score"
  | "social:read"
  | "social:schedule"
  | "social:publish"
  | "inbox:read"
  | "inbox:reply"
  | "web:search";

/** @deprecated Use `Capability` instead. */
export type AgentPermission = Capability;

export interface CapabilityDefinition {
  /** Human-readable description */
  description: string;
  /** Default risk classification (low | medium | high) – metadata only, not an authorization rule */
  defaultRisk?: "low" | "medium" | "high";
}

export const CAPABILITY_DEFINITIONS: Record<Capability, CapabilityDefinition> = {
  "content:generate": {
    description: "Generate new content (e.g., hashtags, captions).",
    defaultRisk: "low",
  },
  "content:score": {
    description: "Score or evaluate existing content.",
    defaultRisk: "low",
  },
  "social:read": {
    description: "Read social media data (posts, analytics).",
    defaultRisk: "low",
  },
  "social:schedule": {
    description: "Schedule social posts for future publishing.",
    defaultRisk: "medium",
  },
  "social:publish": {
    description: "Publish content directly to a social channel.",
    defaultRisk: "high",
  },
  "inbox:read": {
    description: "Read inbound messages or notifications.",
    defaultRisk: "low",
  },
  "inbox:reply": {
    description: "Send replies to inbound messages.",
    defaultRisk: "medium",
  },
  "web:search": {
    description: "Perform external web searches / scrapes.",
    defaultRisk: "medium",
  },
} as const;

/**
 * Strict 1:1 legacy permission to Capability map.
 * Starts completely EMPTY — only genuine 1:1 mappings may be added.
 */
export const LEGACY_EXACT_MAP: Record<string, Capability> = {
  // No mappings at present – fail closed unless a genuine 1:1 match exists.
};

/**
 * Legacy permission adapter.
 * Fails closed (throws) for any unknown legacy permission string.
 */
export function adaptLegacyPermissions(legacy: string[]): Capability[] {
  return legacy.map((p) => {
    const cap = LEGACY_EXACT_MAP[p];
    if (!cap) {
      throw new Error(
        `Legacy permission "${p}" has no direct Capability mapping – migration required.`
      );
    }
    return cap;
  });
}
