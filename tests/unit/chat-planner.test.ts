import { describe, it, expect } from "vitest";
import { ChatPlanner } from "@/lib/ai/agents/chat/planner";

describe("ChatPlanner (Intent & Decomposition Engine)", () => {
  it("should decompose competitor research into scrape_url and analyze_competitor", () => {
    const plan = ChatPlanner.plan([
      { role: "user", content: "Can you analyze our competitor https://rival.com and see where they are winning?" },
    ]);

    expect(plan.intent).toBe("competitor_analysis");
    expect(plan.requiredTools).toContain("analyze_competitor");
    expect(plan.requiredTools).toContain("scrape_url");
    expect(plan.isComplex).toBe(true);
  });

  it("should detect virality evaluation intent", () => {
    const plan = ChatPlanner.plan([
      { role: "user", content: "Can you score my post and see if the hook is strong enough to go viral?" },
    ]);

    expect(plan.intent).toBe("virality_evaluation");
    expect(plan.requiredTools).toContain("evaluate_virality");
    expect(plan.isComplex).toBe(true);
  });

  it("should detect fact verification intent", () => {
    const plan = ChatPlanner.plan([
      { role: "user", content: "Please verify if the claim that Apple acquired Tesla is true." },
    ]);

    expect(plan.intent).toBe("fact_verification");
    expect(plan.requiredTools).toContain("verify_claim");
  });

  it("should detect temporal intent", () => {
    const plan = ChatPlanner.plan([
      { role: "user", content: "What is the current time in UTC?" },
    ]);

    expect(plan.intent).toBe("temporal_lookup");
    expect(plan.requiredTools).toContain("get_current_time");
  });

  it("should detect content repurposing intent", () => {
    const plan = ChatPlanner.plan([
      { role: "user", content: "Please repurpose this newsletter into a Twitter thread." },
    ]);

    expect(plan.intent).toBe("content_repurposing");
    expect(plan.requiredTools).toContain("repurpose_longform");
  });
});
