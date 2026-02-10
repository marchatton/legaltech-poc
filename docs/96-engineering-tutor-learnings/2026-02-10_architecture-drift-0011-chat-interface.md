# Engineering Tutor Learnings (2026-02-10): Architecture Drift in 0011 Chat Interface

Context: This distills the repeated patterns across drift items in `docs/04-projects/02-features/0011_chat_interface/investigation_architecture_drift.md` ("Drift Items (Doc vs Code) + Fix Options") into reusable mental models.

## 1) "Docs say target posture; code is PR0 runtime" is fine, but only if labeled
When docs read like the target is already implemented, engineers will:
- build features against missing substrate (retrieval, citations, geometry),
- ship routes that are blocked by gating layers,
- assume semantic guarantees (steps/idempotency) that do not exist.

Actionable habit: add "current vs target" callouts in any doc that defines a contract (API routes, data model invariants, orchestration semantics).

## 2) Prefer contracts that are stable even when the implementation is immature
Examples:
- Citations: keep the response shape stable; allow coarse geometry (page polygon) when precise geometry is missing.
- Retrieval: keep "IDs-only" stable; evolve scoring/indexing behind that interface.

This reduces rewrite risk and allows downstream features (chat, export, viewer) to progress.

## 3) Explicit state transitions beat implicit ones
Jobs can deliver work, but they do not automatically provide:
- step idempotency,
- resumability,
- durable progress history.

If docs promise step semantics, add a thin step-runtime layer now so "business logic" does not get fused to a one-off worker loop.

## 4) Gating is layered; document the first gate people hit
If middleware allowlisting can block a route, the docs must mention it.

Otherwise engineers will debug the wrong layer (handler code) when the route is not reachable.

## 5) Trust posture must be consistent across surfaces
If export trust rules differ by format (DOCX vs CSV), users will find the bypass.

Before chat adds "answer/copy/export" surfaces, align gating semantics so the evidence-first story stays coherent.

## 6) Scaffold naming can mislead if it implies something exists
A no-op `ensureChatSchema()` looks like "chat tables exist".

If scaffolding is intentional, add comments or docs that say "placeholder; schema not implemented yet" to prevent accidental assumptions and drift.

