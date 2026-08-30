# Frontend Developer Integration Guide — Backend & AI Service

This guide provides everything frontend engineers need to connect Next.js UI components, dashboard pages, and forms to the **Koraspace Backend** and **AI Intelligence Service**.

---

## 🧭 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js UI)                     │
│  React Server Components • Client Components • Tailwind/CSS │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      fetch / API Routes
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    KORASPACE BACKEND                        │
│  Supabase Auth • RBAC • Workspaces • DB • Social Accounts   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                 Internal Typed AI Contracts
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  KORASPACE AI SERVICE                       │
│  ReAct Chat • Ghost Mode • Content Engine • Memory (RAG)    │
│  Safety Gate • Circuit Breaker • Observability & Telemetry  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 1. Authentication & Workspace Context

All backend and AI routes are automatically scoped to the active user's workspace session.

* **Client Components**: standard browser `fetch` automatically forwards Supabase auth cookies.
* **Server Components / Server Actions**: Use `createClient()` from `@/lib/supabase/server` to query data directly.
* **Tenant Isolation**: Handled automatically on the server via `getActiveWorkspace(supabase)` (`workspace_id = auth.uid()`).

---

## 📡 2. Complete API Reference for Frontend

### A. AI Chat & Agent Reasoning (`/api/v1/ai/chat` & `/api/ai/chat`)

Use for multi-turn assistant chat, autonomous reasoning, tool execution, and strategic content planning.

#### Endpoint
`POST /api/v1/ai/chat` (or `POST /api/ai/chat`)

#### Request Body
```typescript
interface ChatRequestBody {
  message: string;             // User's message (Required)
  workspaceId: string;         // Workspace UUID (Required)
  conversationId?: string;     // Existing thread ID or omit to create new
  model?: string;              // Optional override (default: OpenRouter primary model)
  enableTools?: boolean;       // Enable search/virality/repurpose tools (default: true)
  idempotencyKey?: string;     // Optional unique key to prevent duplicate turns
  stream?: boolean;            // Enable Server-Sent Events streaming (default: false)
}
```

#### Non-Streaming Response (`200 OK`)
```json
{
  "reply": "Here is the optimized LinkedIn post breakdown...",
  "toolCallsExecuted": ["evaluate_virality", "repurpose_longform"],
  "memoryItemsUsed": 2,
  "selfCorrections": 0,
  "costUsd": 0.00124
}
```

#### Frontend Example (React Hook)
```tsx
"use client";
import { useState } from "react";

export function useAIChat(workspaceId: string) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const sendMessage = async (text: string) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          workspaceId,
          enableTools: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to generate AI response");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
```

---

### B. Ghost Mode™ Social Ingest & Triage (`/api/v1/ai/ghost/evaluate`)

Use for triaging incoming DMs, comments, and mentions with deterministic safety policies.

#### Endpoint
`POST /api/v1/ai/ghost/evaluate` (or `POST /api/ai/ghost`)

#### Request Body
```typescript
interface GhostEvaluateRequest {
  message: string;             // Inbound comment or DM text (Required)
  senderName: string;          // Author name/handle (Required)
  platform: "x" | "instagram" | "linkedin" | "youtube" | "telegram";
  workspaceId: string;         // Workspace UUID (Required)
  autonomyMode?: "assist" | "auto"; // "assist" requires manual approve; "auto" applies policy
}
```

#### Response (`200 OK`)
```json
{
  "decision": "REQUIRE_APPROVAL", // "ALLOW" | "REQUIRE_APPROVAL" | "DENY"
  "action": "flag_lead",          // "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore"
  "proposedReply": "Thanks for your interest! Our team will reach out with details.",
  "confidence": 0.94,
  "isLead": true,
  "riskLevel": "low",            // "low" | "medium" | "high" | "critical"
  "reasons": ["Detected purchase intent inquiry for enterprise tier"]
}
```

---

### C. Multi-Platform Content Generation (`/api/v1/ai/content/generate`)

Use in content creation/compose screens for drafting platform-native posts and repurposing long-form content.

#### Endpoint
`POST /api/v1/ai/content/generate` (or `POST /api/ai/content/generate`)

#### Request Body
```typescript
interface ContentGenerateRequest {
  topic: string;               // Core topic or draft brief (min 3 chars)
  targetPlatform: "linkedin" | "x" | "instagram" | "youtube" | "telegram" | "threads";
  workspaceId: string;
  repurposeTargets?: Array<"linkedin" | "x" | "instagram" | "youtube" | "telegram" | "threads">;
  objective?: "thought_leadership" | "lead_generation" | "engagement" | "product_announcement";
  customInstructions?: string;
}
```

#### Response (`200 OK`)
```json
{
  "primary": {
    "platform": "linkedin",
    "content": "Why multi-agent systems are transforming social automation:\n\n1. Deterministic safety...\n\n#AI #Automation",
    "hookScore": 92,
    "estimatedReadingTimeSec": 45
  },
  "repurposed": [
    {
      "platform": "x",
      "content": "Multi-agent AI isn't just about faster posting—it's about deterministic safety.\n\nHere's why: 🧵👇",
      "hookScore": 88
    }
  ]
}
```

---

### D. Persistent Workspace Memory (`/api/ai/memory`)

Use to display and manage the brand knowledge base, target audience facts, tone rules, and style preferences.

#### 1. Search / List Memories
* **Method**: `GET /api/ai/memory?q=brand_voice&type=brand_rule&limit=10`
* **Response**:
```json
{
  "memories": [
    {
      "id": "mem_123",
      "category": "brand_rule",
      "content": "Never use hyperbole like 'revolutionize' or 'magical'",
      "importance": "high",
      "confidence": 0.98,
      "updatedAt": "2026-08-30T12:00:00Z"
    }
  ],
  "stats": {
    "total": 14,
    "byCategory": { "brand_rule": 8, "audience_fact": 4, "exemplar": 2 }
  }
}
```

#### 2. Create Memory
* **Method**: `POST /api/ai/memory`
* **Request Body**:
```json
{
  "content": "Our target audience consists of B2B SaaS marketing leaders.",
  "category": "audience_fact",
  "importance": "high"
}
```

#### 3. Update & Delete Memory
* **Update**: `PATCH /api/ai/memory/[id]` (`{ "content": "...", "importance": "critical" }`)
* **Delete**: `DELETE /api/ai/memory/[id]`

---

### E. Social Accounts & Integrations (`/api/social/...`)

#### 1. Connect Account (OAuth Initiation)
* **Navigate user**: Redirect browser to `/api/social/connect/[platform]` (e.g. `/api/social/connect/linkedin`, `/api/social/connect/x`, `/api/social/connect/instagram`).

#### 2. Synchronize Account Metrics
* **Method**: `POST /api/social/sync`
* **Response**: `{ "accounts": 3, "synced": 42 }`

---

### F. Post Scheduling & Calendar (`/api/posts/schedule`)

#### 1. Schedule a Post
* **Method**: `POST /api/posts/schedule`
* **Request Body**:
```json
{
  "content": "Exciting product update launching next Tuesday! 🚀",
  "platforms": ["linkedin", "x"],
  "scheduledAt": "2026-09-02T15:00:00Z",
  "score": 94
}
```

#### 2. Fetch Scheduled Posts for Calendar
* **Method**: `GET /api/posts/schedule?month=9&year=2026`
* **Response**:
```json
{
  "posts": [
    {
      "id": "post_789",
      "platform": "linkedin",
      "content": "Exciting product update...",
      "scheduled_at": "2026-09-02T15:00:00Z",
      "status": "scheduled",
      "socially_score": 94
    }
  ]
}
```

---

### G. AI Telemetry & Observability (`/api/ai/observability`)

Use in the Admin and Analytics dashboards for latency, token usage, cost tracking, and SLA health.

* **Method**: `GET /api/ai/observability`
* **Response**:
```json
{
  "totalRequests": 1240,
  "p50LatencyMs": 320,
  "p95LatencyMs": 950,
  "p99LatencyMs": 1400,
  "totalCostUsd": 4.12,
  "recentTraces": [
    {
      "traceId": "trc_99a81",
      "route": "/api/v1/ai/chat",
      "durationMs": 410,
      "status": "success",
      "costUsd": 0.0008
    }
  ]
}
```

---

### H. Health & Readiness Probes (`/api/health`, `/api/readiness`)

* `GET /api/health` — Returns `{ "status": "ok", "uptime": 12430 }` (Liveness).
* `GET /api/readiness` — Returns `{ "status": "ready", "database": "healthy", "aiProvider": "healthy" }` (Readiness).

---

## ⚠️ 3. Standardized Error Handling

All AI and backend API routes return structured error payloads:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "AI budget limit reached for current billing cycle.",
    "retryable": false,
    "traceId": "trc_88f92a"
  }
}
```

### Common HTTP Status Codes:
* `400 Bad Request` — Zod schema validation failure.
* `401 Unauthorized` — No active Supabase session.
* `403 Forbidden` — Workspace RBAC permission denied.
* `429 Too Many Requests` — Rate limit or budget exceeded.
* `500 Internal Server Error` — Safe, sanitized error envelope (sensitive stack traces and API keys are redacted).

---

## 💡 4. Best Practices for Frontend Components

1. **Optimistic UI with Fallbacks**: Always display optimistic loading skeletons for AI reasoning tasks.
2. **Displaying Warnings**: If `GhostEvaluateResponse.decision === "REQUIRE_APPROVAL"`, render an "Approval Needed" badge with the specific `reasons`.
3. **Copy-to-Clipboard & Edit**: AI-generated content should allow inline editing before pushing to `/api/posts/schedule`.
4. **Tool Visualizers**: When `toolCallsExecuted` is returned in chat, show subtle chips (e.g. `⚡ Verified claim with web search`) to increase transparency and user trust.
