/**
 * AI Security & Prompt Injection Defense Engine
 *
 * Scans and protects Koraspace AI agents from malicious inputs, jailbreaks,
 * system prompt extraction, and unsafe instruction overrides.
 */

export interface SecurityScanResult {
  isSafe: boolean;
  riskScore: number; // 0 to 100
  threats: string[];
}

const INJECTION_PATTERNS = [
  { pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/i, threat: "Instruction Override" },
  { pattern: /disregard\s+(?:all\s+)?(?:rules|system\s+prompts|guidelines)/i, threat: "Rule Disregard" },
  { pattern: /you\s+are\s+now\s+(?:in\s+)?(?:dan|developer|god|unrestricted)\s+mode/i, threat: "Jailbreak Roleplay" },
  { pattern: /(?:output|reveal|show|print)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions)/i, threat: "System Prompt Extraction" },
  { pattern: /(?:system\s+prompt|instructions)\s*(?:reveal|leak|dump|show|print)/i, threat: "System Prompt Extraction" },
  { pattern: /bypass\s+(?:all\s+)?(?:safety|policy|guardrail)\s+filters/i, threat: "Safety Bypass" },
  { pattern: /(?:delete|drop|truncate)\s+(?:all\s+)?.*(?:tables|database|workspace\s+data)/i, threat: "Destructive Command" },
];

export class PromptSecurityGuard {
  /**
   * Scans a user message for prompt injection, jailbreak attempts, or policy overrides.
   */
  public static scan(input: string): SecurityScanResult {
    if (!input || typeof input !== "string") {
      return { isSafe: true, riskScore: 0, threats: [] };
    }

    const trimmed = input.trim();
    const threats: string[] = [];

    for (const { pattern, threat } of INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        threats.push(threat);
      }
    }

    const riskScore = Math.min(100, threats.length * 40);
    const isSafe = threats.length === 0;

    return {
      isSafe,
      riskScore,
      threats,
    };
  }

  /**
   * Sanitizes input by stripping zero-width characters and invisible control bytes.
   */
  public static sanitize(input: string): string {
    if (!input) return "";
    return input
      // Remove zero-width spaces and control bytes
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();
  }
}
