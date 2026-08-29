# Koraspace AI — Unified Architecture Overview

Koraspace AI is an autonomous, multi-tenant social media intelligence and execution platform designed for creators, startups, and marketing teams.

```text
                                 KORASPACE AI
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
          ChatAgent               GhostAgent            Memory Service
       (General Reasoning       (Social Triage &      (Brand & Performance
       + Tool Orchestration)    Policy Automation)         Knowledge)
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
                                Tool Registry
                    (8 Governed Intelligence Tools)
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      PromptSecurityGuard      CircuitBreaker          AITelemetry
    (Injection Defense)       (Resilient Retries)   (Latency, Cost, Traces)
                                      │
                                      ▼
                           Test & Evaluation Layer
```

## Core Tenets

1. **Autonomy is a Deterministic Policy, Not an LLM Guess**: The model proposes actions; strict deterministic policy engines (`GhostPolicyEngine`) govern whether actions are automatically dispatched, held for human review, or rejected.
2. **Persistent Workspace Memory**: Memory is structured into Brand Intelligence, Semantic Memory, and empirical Social Performance Patterns with deduplication and consolidation.
3. **Strict Multi-Tenant Isolation**: Every memory lookup, tool execution, and database operation enforces `workspace_id = auth.uid()` boundaries.
4. **Governed Tool Ecosystem**: Tools are typed with Zod, validated at runtime, and executed through a centralized `ToolRegistry`.
