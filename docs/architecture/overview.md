# Koraspace AI — Unified Architecture Overview

Koraspace AI is an autonomous, multi-tenant social media intelligence and execution platform designed for creators, startups, and marketing teams.

```text
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js UI)                     │
│    App Router • Server Components • Dashboard UI • Forms    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       fetch / API Routes
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    KORASPACE BACKEND                        │
│   Supabase Auth • RBAC • Workspaces • DB • Social Accounts  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    AI Service Contract v1
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  KORASPACE AI SERVICE                       │
│                                                             │
│  ┌───────────────────────┐         ┌──────────────────────┐ │
│  │       ChatAgent       │         │      GhostAgent™     │ │
│  │ (ReAct Multi-Step)    │         │ (Deterministic Policy│ │
│  └───────────┬───────────┘         └───────────┬──────────┘ │
│              │                                 │            │
│              └────────────────┬────────────────┘            │
│                               ▼                             │
│                  Persistent Memory (pgvector)               │
│               (Brand Rules + Empirical Learning)            │
│                               │                             │
│                               ▼                             │
│                  Governed Tool Registry (8 Tools)           │
│                               │                             │
│              ┌────────────────┴────────────────┐            │
│              ▼                                 ▼            │
│     PromptSecurityGuard                 CircuitBreaker      │
│   (Zero-Leakage Defense)              (Resilient Retry)     │
│                               │                             │
│                               ▼                             │
│                     Observability & Cost                    │
│                 (Traces, Latency Percentiles)               │
└─────────────────────────────────────────────────────────────┘
```

## Core Tenets

1. **Autonomy is a Deterministic Policy, Not an LLM Guess**: The model proposes actions; strict deterministic policy engines (`GhostPolicyEngine`) govern whether actions are automatically dispatched, held for human review, or rejected.
2. **Persistent Workspace Memory**: Memory is structured into Brand Intelligence, Semantic Memory, and empirical Social Performance Patterns with deduplication and consolidation.
3. **Strict Multi-Tenant Isolation**: Every memory lookup, tool execution, and database operation enforces `workspace_id = auth.uid()` boundaries.
4. **Governed Tool Ecosystem**: Tools are typed with Zod, validated at runtime, and executed through a centralized `ToolRegistry`.
5. **Clear Service Boundary**: The AI intelligence engine exposes versioned, typed contracts (`/api/v1/ai/...`) consumed seamlessly by the frontend and platform backend.
6. **Empirical Closed-Loop Learning**: Post engagement and metrics feed back into workspace performance memory to continually refine generation quality.
