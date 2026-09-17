# Canonical Authorization & Capability Model

## Overview

Koraspace AI uses a **domain-oriented capability model** for authorization across all agent execution paths.
This model cleanly separates **what** an actor is authorized to do from **how** specific tools or services are implemented.

```text
Authenticated User
       │
       ▼
Workspace Membership
       │
       ▼
Workspace Role (owner | admin | member | viewer)
       │
       ▼
Capability Set (Capability[])
       │
       ▼
AgentContext.capabilities
       │
       ▼
Policy Engine (decidePlan / decideInvocation)
       │
       ▼
Tool.requiredCapabilities
       │
       ▼
Governed Executor (ChatExecutor)
       │
       ▼
Tool Registry (defaultToolRegistry)
```

---

## Canonical Capabilities

All capabilities represent business and domain boundaries, not tool-name strings:

| Capability | Description | Default Risk Metadata |
| :--- | :--- | :--- |
| `content:generate` | Generate new content (e.g., hashtags, captions, repurposing) | `low` |
| `content:score` | Score, evaluate, or critique content virality | `low` |
| `social:read` | Read social media analytics, posts, and competitor data | `low` |
| `social:schedule` | Schedule social posts for future publishing | `medium` |
| `social:publish` | Publish content directly to connected social channels | `high` |
| `inbox:read` | Read inbound messages, notifications, and interactions | `low` |
| `inbox:reply` | Send automated or assisted replies to inbound messages | `medium` |
| `web:search` | Perform external web scraping or fact verification | `medium` |

---

## Role-Based Capability Mapping

Roles map deterministically to capability sets via `ROLE_CAPABILITIES` in `lib/ai/core/rbac.ts`:

- **Owner & Admin**: All capabilities (`content:generate`, `content:score`, `social:read`, `social:schedule`, `social:publish`, `inbox:read`, `inbox:reply`, `web:search`).
- **Member**: Core creative capabilities (`content:generate`, `social:read`, `web:search`).
- **Viewer**: Read-only observation (`social:read`, `inbox:read`).

---

## Tool Governance & Declaration

Tools declare required capabilities via the `requiredCapabilities` property on `AITool`:

```typescript
export const generateHashtagsTool: AITool<GenerateHashtagsInput, GenerateHashtagsOutput> = {
  name: "generate_hashtags",
  description: "...",
  requiredCapabilities: ["content:generate"],
  ...
};
```

- **Protected Tools**: Must declare the exact capabilities required for safe execution.
- **Utility Tools**: Pure utilities (e.g. `get_current_time`, `get_weather`) omit `requiredCapabilities` or leave it empty, allowing safe execution without specific permissions.

---

## Legacy Permission Adapter Boundary

To migrate away from legacy permission vocabularies without unsafe semantic coercions:
- The adapter `adaptLegacyPermissions` starts **empty**.
- It only accepts genuine 1:1 mappings.
- Any unmapped legacy permission fails closed with a clear `Error` requiring explicit migration.
- `AgentContext.capabilities` is the sole canonical authorization carrier. Legacy `context.permissions` has been deprecated and removed.

---

## Multi-Tenant Isolation

Authorization is scoped strictly to the active workspace context:
- An authenticated user (`userId`) resolves their workspace role (`role`) for the active `workspaceId`.
- The capability set is derived from that active workspace membership.
- Permissions or capabilities do not leak across workspace boundaries.
