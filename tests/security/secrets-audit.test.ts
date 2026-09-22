import { describe, it, expect } from "vitest";
import { AITelemetry } from "@/lib/ai/core/telemetry";

describe("Production Secrets Audit (Zero Leakage)", () => {
  const secretPayloads = [
    { text: "My key is sk-or-v1-abcdef1234567890abcdef1234567890", expected: "[REDACTED_API_KEY]" },
    { text: "OpenAI Key: sk-proj-1234567890abcdef1234567890abcdef", expected: "[REDACTED_API_KEY]" },
    { text: "Auth: Bearer secret_access_token_123456789", expected: "Bearer [REDACTED_TOKEN]" },
    { text: "Supabase JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abcdef1234567890", expected: "[REDACTED_JWT]" },
  ];

  it("should sanitize and mask all API keys and bearer tokens from strings", () => {
    for (const { text, expected } of secretPayloads) {
      const sanitized = AITelemetry.sanitize(text);
      expect(sanitized).toContain(expected);
      expect(sanitized).not.toContain("sk-or-v1-");
      expect(sanitized).not.toContain("sk-proj-");
      expect(sanitized).not.toContain("secret_access_token_");
    }
  });

  it("should recursively sanitize complex nested JSON error and log objects", () => {
    const rawErrorObj = {
      message: "Authentication failed",
      config: {
        apiKey: "sk-or-v1-privatekey1234567890",
        headers: {
          authorization: "Bearer my_super_secret_token_12345",
        },
      },
    };

    const sanitized = AITelemetry.sanitize(rawErrorObj);

    expect(sanitized.config.apiKey).toContain("[REDACTED");
    expect(sanitized.config.headers.authorization).toContain("[REDACTED");
    expect(JSON.stringify(sanitized)).not.toContain("privatekey1234567890");
  });
});
