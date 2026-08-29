# Koraspace AI — Service Boundary & API Interface Contract

## 1. Architectural Role

The **Koraspace AI Service** operates as a self-contained, typed intelligence micro-layer consumed by the Core Web Application and Background Job Queues.

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
│  ├── /api/ai/chat              (ReAct Agent & Tool loop)   │
│  ├── /api/ai/ghost             (Social Triage & Policy)     │
│  ├── /api/ai/content/generate  (Multi-Platform Engine)      │
│  ├── /api/ai/memory            (Vector Search & Formation)  │
│  ├── /api/ai/observability     (Telemetry & Cost Traces)    │
│  └── /api/health & /readiness  (SRE Liveness & Probes)      │
└─────────────────────────────────────────────────────────────┘
```

## 2. Interface Contracts

| Endpoint | Method | Purpose | Key Guarantees |
| :--- | :---: | :--- | :--- |
| `/api/ai/chat` | `POST` | ReAct reasoning & tool execution | Memory RAG, circuit breaker, retry, token cost |
| `/api/ai/ghost` | `POST` | Social comment triage & response | Deterministic policy, human approval for leads |
| `/api/ai/content/generate` | `POST` | Multi-platform drafting & repurposing | Pre-publication brand compliance, hook scoring |
| `/api/ai/memory` | `GET/POST` | Memory vector search & storage | Tenant isolation (`workspace_id`), deduplication |
| `/api/ai/observability` | `GET` | Telemetry & performance metrics | P50/P95 latency percentiles, cost accounting |
| `/api/health` | `GET` | Process liveness probe | Uptime, RSS memory, timestamp |
| `/api/readiness` | `GET` | Dependency readiness probe | Database ping latency, AI provider check |
