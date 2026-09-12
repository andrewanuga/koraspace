# 🌌 Koraspace AI

<div align="center">

[![Build & Typecheck](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Automated Tests](https://img.shields.io/badge/Tests-160%20Passing-success?style=for-the-badge&logo=vitest)](https://vitest.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20pgvector-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br />

**The Autonomous Social AI Operating System**  
*Engineered for creators, digital agencies, and high-growth marketing teams.*

[Frontend Integration Guide](file:///docs/frontend-integration-guide.md) • [Features](#-core-capabilities) • [Architecture](#-platform-architecture) • [API Quick Reference](#-api-quick-reference-for-frontend) • [Test Pyramid (160 Tests)](#-automated-test-pyramid-160-tests) • [Security & RBAC](#-security--multi-tenant-isolation) • [Quickstart](#-quickstart--deployment)

</div>

---

## 📖 Overview

**Koraspace AI** elevates social media operations from passive automation (scheduled broadcasts) to **true autonomous delegation** (goal-oriented multi-agent reasoning, closed-loop empirical memory learning, deterministic policy safety, live infrastructure validation, and versioned service contract governance). 

Built atop **Next.js 16**, **Supabase with `pgvector`**, and **Google Gemini**, Koraspace empowers teams to orchestrate social growth across LinkedIn, X, Instagram, YouTube, and Telegram with zero brand drift and complete auditability.

---

## 🎨 Frontend Developer Quickstart

For developers working on UI components, pages, and dashboard forms, refer to the **[Complete Frontend Integration Guide](file:///docs/frontend-integration-guide.md)**.

### API Quick Reference for Frontend:

| Feature / UI Flow | Endpoint | Method | Purpose & Payload |
| :--- | :--- | :---: | :--- |
| **AI Assistant Chat** | `/api/v1/ai/chat` | `POST` | ReAct multi-step chat with tools & memory RAG (`{ message, workspaceId }`) |
| **Ghost Mode™ Triage** | `/api/v1/ai/ghost/evaluate` | `POST` | Deterministic triage for inbound comments/DMs (`{ message, senderName, platform, workspaceId }`) |
| **Content Studio Engine** | `/api/v1/ai/content/generate` | `POST` | Multi-platform drafting & repurposing (`{ topic, targetPlatform, workspaceId }`) |
| **Brand Memory (RAG)** | `/api/ai/memory` | `GET/POST` | Search & save brand rules, audience facts, and voice preferences |
| **Post Scheduling** | `/api/posts/schedule` | `GET/POST` | Calendar schedule entries & fetch calendar events (`{ content, platforms, scheduledAt }`) |
| **Social Account Connect** | `/api/social/connect/[platform]`| `GET` | Initiates OAuth 2.0 PKCE flow (LinkedIn, X, Instagram, YouTube) |
| **Social Metric Sync** | `/api/social/sync` | `POST` | Pulls follower analytics & post performance into workspace database |
| **Telemetry & Latency** | `/api/ai/observability` | `GET` | P50/P95/P99 latency percentiles, cost accounting, and trace histories |
| **Health Probes** | `/api/health` & `/api/readiness`| `GET` | Liveness and deep dependency database/AI provider checks |

---

## 🏛️ Platform Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js UI)                    │
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
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Core Capabilities

### 1. 🧠 Autonomous Agents
- **`ChatAgent` (General Reasoning & ReAct)**:
  - Deconstructs complex user prompts into step-by-step reasoning plans.
  - Dynamically selects, executes, and observes tools from the governed `ToolRegistry`.
  - Automatically verifies output against brand guardrails and self-corrects prior to completion.
- **`GhostAgent™` (Social Ingest & Triage)**:
  - Triages incoming social comments and direct messages into `flag_lead`, `escalate_complaint`, `auto_reply`, or `ignore`.
  - Enforces deterministic safety policies (`ALLOW` vs `REQUIRE_APPROVAL` vs `DENY`).
  - High-value sales leads and sensitive complaints **never auto-dispatch without human review**.

### 2. 📚 Persistent Memory & Closed-Loop Learning
- **Brand Intelligence**: Injects brand voice, target audience, content pillars, and strictly forbidden terms into agent prompts.
- **Performance Intelligence**: Learns viral hooks, formats, and high-engagement themes from historical workspace post analytics.
- **Consolidation Engine**: Detects near-duplicate memory entries ($\ge 0.85$ vector/lexical similarity) and consolidates them into canonical records with full provenance tracking (`mergedFrom`, `consolidatedAt`).

### 3. 🛠️ Governed Tool Ecosystem
Every tool is validated at runtime with Zod schemas and executed under timeout protection:
- `scrape_url`: Clean HTML-to-markdown web extraction.
- `analyze_competitor`: Evaluates competitor strategies, hook styles, and positioning.
- `verify_claim`: Cross-checks claims against verified web sources.
- `evaluate_virality`: Empirical virality scoring (0–100) with concrete structural recommendations.
- `repurpose_longform`: Formats long-form transcripts into platform-optimized threads.
- `schedule_post`: Validates posting schedules across connected accounts.
- `fetch_weather` & `get_temporal_context`: Injects real-time context and localized data.

### 4. 🛡️ Enterprise Defense & Resilience
- **Prompt Security**: Scans for system overrides (*"ignore previous instructions"*), jailbreak roleplay (*"you are now DAN"*), and SQL/destructive commands.
- **Zero Secret Leakage**: Recursively sanitizes API keys (`sk-or-v1-`, `sk-proj-`), JWT tokens, and OAuth secrets from logs, traces, and client responses.
- **Circuit Breaker**: Prevents cascading failures during external AI provider or API outages (`CLOSED` $\rightarrow$ `OPEN` $\rightarrow$ `HALF_OPEN`).
- **AI Budget Enforcement**: Multi-tier sliding-window rate limiting ($60\text{ req/min}$, $100\text{k tokens/min}$) and monthly USD budget controls ($0–$70 normal, $70–$90 warning, $90–$100 restricted, $\ge 100\%$ blocked).

---

## 🧪 Automated Test Pyramid (160 Tests)

Koraspace AI enforces a 100% deterministic automated test suite executed on every commit and pull request via CI:

```bash
# Run complete test suite (160 tests passing)
npm test

# Segmented test layers
npm run test:unit         # Unit tests (cost, rate-limit, alerts, brand, policies)
npm run test:contracts    # Zod contracts, API route payloads, and webhooks
npm run test:security     # Injection defense, zero secret audit, and RBAC
npm run test:integration  # Streaming, concurrency, RLS isolation, failure injection
npm run test:e2e          # Complete chat flows, ghost triage, and memory lifecycle
npm run test:eval         # Golden LLM benchmarks, brand adherence, regression gates
npm run test:all          # Comprehensive test run across all 52 test files
```

```text
 ✓ tests/contracts/service-gateway.test.ts (4 tests)
 ✓ tests/integration/failure-injection.test.ts (3 tests)
 ✓ tests/integration/chaos-matrix.test.ts (6 tests)
 ✓ tests/integration/platform-ai-contract.test.ts (3 tests)
 ✓ tests/e2e/memory-lifecycle.test.ts (1 test)
 ✓ tests/unit/memory-consolidation.test.ts (4 tests)
 ✓ tests/e2e/product-journeys.test.ts (4 tests)
 ✓ tests/evaluations/evaluation-history.test.ts (3 tests)
 ✓ tests/unit/resilience.test.ts (3 tests)
 ✓ tests/unit/tools.test.ts (4 tests)
 ✓ tests/integration/streaming.test.ts (2 tests)
 ✓ tests/unit/memory-service.test.ts (5 tests)
 ✓ tests/integration/ghost-agent.test.ts (3 tests)
 ✓ tests/integration/ai-client.test.ts (2 tests)
 ✓ tests/unit/memory-brand.test.ts (3 tests)
 ✓ tests/evaluations/ghost-quality.test.ts (2 tests)
 ✓ tests/contracts/api-routes.test.ts (4 tests)
 ✓ tests/unit/rbac.test.ts (3 tests)
 ✓ tests/e2e/chat-workflow.test.ts (1 test)
 ✓ tests/evaluations/regression-gate.test.ts (2 tests)
 ✓ tests/integration/memory-security.test.ts (5 tests)
 ✓ tests/contracts/v1-routes.test.ts (5 tests)
 ✓ tests/integration/concurrency.test.ts (2 tests)
 ✓ tests/contracts/schemas.test.ts (5 tests)
 ✓ tests/unit/memory-formation.test.ts (6 tests)
 ✓ tests/evaluations/chat-quality.test.ts (2 tests)
 ✓ tests/evaluations/content-intelligence.test.ts (2 tests)
 ✓ tests/observability/telemetry.test.ts (3 tests)
 ✓ tests/e2e/platform-ai-e2e.test.ts (4 tests)
 ✓ tests/integration/telemetry-store.test.ts (2 tests)
 ✓ tests/unit/ghost-policy.test.ts (6 tests)
 ✓ tests/security/prompt-injection.test.ts (3 tests)
 ✓ tests/unit/attribution.test.ts (3 tests)
 ✓ tests/e2e/ghost-workflow.test.ts (1 test)
 ✓ tests/unit/rate-limit.test.ts (4 tests)
 ✓ tests/live/supabase-rls.test.ts (2 tests)
 ✓ tests/contracts/webhooks.test.ts (4 tests)
 ✓ tests/security/secrets-audit.test.ts (2 tests)
 ✓ tests/evaluations/tool-selection.test.ts (2 tests)
 ✓ tests/unit/closed-loop-learning.test.ts (2 tests)
 ✓ tests/evaluations/dataset-versioning.test.ts (3 tests)
 ✓ tests/unit/cost.test.ts (3 tests)
 ✓ tests/live/webhook-verification.test.ts (2 tests)
 ✓ tests/unit/alerts.test.ts (4 tests)
 ✓ tests/evaluations/brand-adherence.test.ts (2 tests)
 ✓ tests/unit/chat-planner.test.ts (5 tests)
 ✓ tests/evaluations/release-gate-governance.test.ts (3 tests)
 ✓ tests/integration/chat-agent.test.ts (2 tests)
 ✓ tests/evaluations/ghost-fail-closed.test.ts (3 tests)
 ✓ tests/live/llm-provider.test.ts (2 tests)
 ✓ tests/integration/database-rls.test.ts (2 tests)
 ✓ tests/integration/disaster-recovery.test.ts (2 tests)

 Test Files  52 passed (52)
      Tests  160 passed (160)
```

---

## 🛡️ Security & Multi-Tenant Isolation

All memory reads, tool executions, and social accounts enforce strict workspace boundaries (`workspace_id = auth.uid()`):

| Resource / Action | Owner | Admin | Member | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **Execute ChatAgent** | ✅ | ✅ | ✅ | ❌ |
| **Read Workspace Memory** | ✅ | ✅ | ✅ | ✅ |
| **Create & Update Memory** | ✅ | ✅ | ✅ | ❌ |
| **Delete Memory (Forget)** | ✅ | ✅ | ❌ | ❌ |
| **Connect Social Accounts** | ✅ | ✅ | ✅ | ❌ |
| **Autonomous Social Auto-Posting** | ✅ | ✅ | ❌ | ❌ |
| **AI Observability Dashboard** | ✅ | ✅ | ❌ | ❌ |
| **Workspace Settings & Billing** | ✅ | ❌ | ❌ | ❌ |

---

## 🏁 Quickstart & Deployment

### 1. Prerequisites
- Node.js `20.x` or higher
- Supabase Project with `pgvector` extension enabled

### 2. Clone & Install
```bash
git clone git@github.com:TheclaOrg/koraspace.ai.git
cd koraspace.ai
npm install
```

### 3. Environment Configuration
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Database Setup
Execute the vector memory schema in your Supabase SQL Editor:
```sql
-- Located in supabase/memory_migration.sql and supabase/social_integration_schema.sql
```

### 5. Launch Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License & Architecture Documentation

- [Frontend Integration Guide](file:///docs/frontend-integration-guide.md)
- [Architecture Overview](file:///docs/architecture/overview.md)
- [Service Boundary & Contracts](file:///docs/architecture/service-boundary.md)
- [ADR 001: Agent Architecture & Deterministic Policies](file:///docs/adr/001-agent-architecture.md)
- [ADR 002: Persistent Memory & Consolidation Engine](file:///docs/adr/002-memory-architecture.md)
- [Production Readiness Checklist](file:///docs/architecture/production-readiness.md)

Distributed under the MIT License. See `LICENSE` for more information.
Distributed under the MIT License. See `LICENSE` for more information.

## 🔐 Milestone 2 — Policy & Authorization (Planned)

**Goal:** Introduce a strict policy layer that enforces permissions, autonomy mode, and risk assessments *before* any execution step. This creates the invariant:

> The AI can reason about an action, but reasoning does **not** grant permission to execute it.

**Proposed Architecture**

```text
                 Plan
                   │
                   ▼
          Policy / Authorization
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
   Permissions  Autonomy      Risk
       │           │           │
       └───────────┼───────────┘
                   ▼
             ALLOW / DENY
                   │
                   ▼
             ExecutionEngine
```

This layer will sit between the **Planner** and **ExecutionEngine**, ensuring that only authorized actions reach the executor. Future work will implement the `PolicyEngine` and extend the `ExecutionEngine` to respect these decisions.

---
