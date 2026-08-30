# Koraspace AI — Service Boundary & API Interface Contract

## 1. Architectural Role

The **Koraspace AI Service** operates as a self-contained, typed intelligence micro-layer consumed by the Frontend UI, Core Web Application, and Background Job Queues.

```text
┌─────────────────────────────────────────────────────────────┐
│                    CORE WEB APPLICATION                     │
│               (Auth, Billing, Social OAuth)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Authenticated HTTP / RPC Contracts
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    KORASPACE AI SERVICE                     │
│                                                             │
│  ├── /api/v1/ai/chat              (ReAct Agent & Tools)     │
│  ├── /api/v1/ai/ghost/evaluate    (Social Triage & Policy)  │
│  ├── /api/v1/ai/content/generate  (Multi-Platform Engine)   │
│  ├── /api/ai/memory               (Vector Search & RAG)     │
│  ├── /api/ai/observability        (Telemetry & Cost Traces) │
│  └── /api/health & /readiness     (SRE Liveness & Probes)   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Interface Contracts (v1)

Formalized Zod request/response schemas are located in [lib/ai/contracts/v1/index.ts](file:///c:/Users/midef/OneDrive/Desktop/Projects/koraspace.ai/lib/ai/contracts/v1/index.ts).

| Endpoint | Method | Purpose | Key Guarantees |
| :--- | :---: | :--- | :--- |
| `/api/v1/ai/chat` | `POST` | ReAct reasoning & tool execution | Memory RAG, circuit breaker, retry, token cost |
| `/api/v1/ai/ghost/evaluate` | `POST` | Social comment triage & response | Deterministic policy, human approval for leads |
| `/api/v1/ai/content/generate` | `POST` | Multi-platform drafting & repurposing | Pre-publication brand compliance, hook scoring |
| `/api/ai/memory` | `GET/POST` | Memory vector search & storage | Tenant isolation (`workspace_id`), deduplication |
| `/api/ai/observability` | `GET` | Telemetry & performance metrics | P50/P95 latency percentiles, cost accounting |
| `/api/health` | `GET` | Process liveness probe | Uptime, RSS memory, timestamp |
| `/api/readiness` | `GET` | Dependency readiness probe | Database ping latency, AI provider check |

## 3. Frontend Integration Reference

For React hooks, code samples, payload types, and error handling guidelines for UI developers, see the **[Frontend Developer Integration Guide](file:///docs/frontend-integration-guide.md)**.
