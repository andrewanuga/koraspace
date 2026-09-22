# ADR 002: Persistent Workspace Memory & Consolidation Architecture

## Status
Accepted

## Context
Agents need persistent context regarding brand rules, target audience, style preferences, and past performance. Without structured memory, agents repeat mistakes and drift from brand tone.

## Decision
1. We implement `MemoryService` with strict workspace multi-tenant isolation.
2. We implement `ConsolidationEngine` to detect duplicate and near-duplicate knowledge entries ($\ge 0.85$ similarity threshold) and merge them into canonical records with provenance tracking (`mergedFrom`, `consolidatedAt`).
3. We store vector embeddings in Supabase `ai_message_memory` with pgvector similarity search.

## Consequences
- Fast, relevant prompt injection without context window bloat.
- Workspace owners maintain full visibility and deletion control over AI memories.
