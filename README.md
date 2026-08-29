# Koraspace AI

> **Your Autonomous Social AI Operating System** — engineered for creators, startups, and growth marketing teams.

**Koraspace AI** shifts social media management from passive automation to true intelligent delegation. Powered by multi-agent reasoning (`ChatAgent` + `GhostAgent`), deterministic autonomy policies, persistent workspace memory (`pgvector`), governed intelligence tools, and production-grade observability.

---

## 🏛️ AI Platform Architecture

```text
                                    KORASPACE AI
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
             ChatAgent               GhostAgent            Memory Service
          (Multi-Step ReAct       (Social Triage &      (Brand Guardrails &
          Reasoning & Tools)      Autonomy Policies)    Performance Exemplars)
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         ▼
                                   Tool Registry
                       (8 Governed Intelligence Tools)
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
         PromptSecurityGuard      CircuitBreaker          AIRateLimiter
        (Zero-Leakage & Defense)  (Resilient Retries)    (Throttling & Budgets)
                                         │
                                         ▼
                               AIObservabilityEngine
                            (Traces, Cost & Alerts)
                                         │
                                         ▼
                       Automated CI & Evaluation Suite
```

---

## 🚀 Core Capabilities

| Subsystem | Architecture & Features |
| :--- | :--- |
| **ChatAgent** | Multi-step ReAct reasoning loop with planning, intent classification, autonomous tool execution, and deterministic self-correction. |
| **GhostAgent™** | Deterministic policy-gated triage engine. Classifies incoming social interactions (leads, complaints, questions, fluff) with strict human approval gates (`ALLOW` / `REQUIRE_APPROVAL` / `DENY`). |
| **Persistent Memory** | Brand voice guardrails, audience facts, style preferences, and empirical viral post performance patterns stored with `pgvector` embeddings and deduplication consolidation. |
| **Tool Registry** | Governed, Zod-typed intelligence tools: `scrape_url`, `analyze_competitor`, `verify_claim`, `evaluate_virality`, `repurpose_longform`, `fetch_weather`, `get_temporal_context`, `schedule_post`. |
| **Security & Defense** | Real-time prompt injection scanning, instruction override blocking, zero-width byte stripping, and zero secret leakage. |
| **Resilience & Reliability** | Exponential backoff retry loops, state-machine `CircuitBreaker`, sliding-window rate limiting, and workspace monthly AI budget controls. |
| **Observability & Cost** | Real-time execution tracing, latency percentiles (P50/P95/P99), token accounting, USD model cost tracking, and automated SLA alerts. |

---

## 🧪 Comprehensive Test Pyramid

Koraspace AI features an automated test architecture covering all system boundaries:

```bash
# Run standard fast unit, contract, and security test suite (100% mocked & deterministic)
npm test

# Run individual test layers
npm run test:unit         # Unit tests (policies, memory formation, cost tracker, rate limiter)
npm run test:contracts    # Zod contracts, API schemas, and error normalization
npm run test:security     # Prompt injection defenses, zero secret leakage, RBAC
npm run test:integration  # RLS multi-tenant isolation, failure injection, circuit breaker
npm run test:e2e          # End-to-end chat reasoning, social triage, memory lifecycle
npm run test:eval         # Golden LLM benchmarks, brand adherence, CI regression gates
npm run test:all          # Comprehensive test run across all 27 test files
```

---

## 🛡️ Security & Multi-Tenant Isolation

All memory access, tool execution, and social accounts enforce strict workspace boundaries (`workspace_id = auth.uid()`):

| Resource | Owner | Admin | Member | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **ChatAgent Execution** | ✅ | ✅ | ✅ | ❌ |
| **AI Memory Read** | ✅ | ✅ | ✅ | ✅ |
| **AI Memory Create/Edit** | ✅ | ✅ | ✅ | ❌ |
| **AI Memory Delete** | ✅ | ✅ | ❌ | ❌ |
| **Social Auto-Posting** | ✅ | ✅ | ❌ | ❌ |
| **Observability Dashboard** | ✅ | ✅ | ❌ | ❌ |
| **Workspace & Billing** | ✅ | ❌ | ❌ | ❌ |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) · React 19 · TypeScript
- **Styling & UI**: Tailwind CSS v4, CSS variables (dark & light themes), Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL + `pgvector`, Row-Level Security)
- **AI Models**: OpenRouter (200+ models: GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, Gemma, Llama 3.3)
- **Testing & CI**: Vitest, `@vitest/coverage-v8`, GitHub Actions CI
- **Payments**: Paystack / Flutterwave

---

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone git@github.com:TheclaOrg/koraspace.ai.git
cd koraspace.ai
npm install
```

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and configure your credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENROUTER_API_KEY=your-openrouter-key
```

### 3. Database Migration
Apply the memory and vector search schema:
```sql
-- Run supabase/memory_migration.sql in your Supabase SQL Editor
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📄 License & Architecture ADRs

- [Architecture Overview](file:///docs/architecture/overview.md)
- [ADR 001: Agent Architecture](file:///docs/adr/001-agent-architecture.md)
- [ADR 002: Memory & Consolidation](file:///docs/adr/002-memory-architecture.md)
- [Production Readiness Checklist](file:///docs/architecture/production-readiness.md)
