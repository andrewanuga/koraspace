# ADR 001: Unified Agent Architecture & Deterministic Autonomy Policy

## Status
Accepted

## Context
Previous iterations relied on ad-hoc LLM prompting where the model itself decided whether to send replies or take irreversible actions. This led to unpredictable hallucinations and safety risks.

## Decision
1. We separate the AI intelligence into two primary reasoning agents:
   - `ChatAgent`: General-purpose multi-step reasoning, tool orchestration, and content strategy.
   - `GhostAgent`: Inbound social comment triage, lead qualification, and brand-safe replies.
2. Autonomy is strictly decoupled from LLM decisions. The LLM produces a candidate proposal and confidence score; the `GhostPolicyEngine` evaluates the proposal against explicit workspace rules, lead qualification criteria, and risk thresholds to return `ALLOW`, `REQUIRE_APPROVAL`, or `DENY`.

## Consequences
- **Safety**: Sensitive lead inquiries and customer complaints always require human review.
- **Predictability**: Agent behavior is fully testable with standard deterministic unit tests.
