import { describe, it, expect } from "vitest";
import { DatasetRegistry } from "@/lib/ai/evaluations/dataset-versioning";

describe("Dataset Versioning & Benchmark Pinning", () => {
  it("should have registered core benchmark versions with checksums", () => {
    const v10 = DatasetRegistry.getVersion("v1.0-golden");
    expect(v10).toBeDefined();
    expect(v10?.checksum).toBeDefined();
    expect(v10?.scenarioCount).toBeGreaterThan(0);
  });

  it("should reject direct comparisons between mismatched dataset versions", () => {
    const comparison = DatasetRegistry.isComparable("v1.0-golden", "v1.1-extended");
    expect(comparison.comparable).toBe(false);
    expect(comparison.reason).toContain("Mismatched benchmark versions");
  });

  it("should validate comparisons when dataset versions match identically", () => {
    const comparison = DatasetRegistry.isComparable("v1.0-golden", "v1.0-golden");
    expect(comparison.comparable).toBe(true);
  });
});
