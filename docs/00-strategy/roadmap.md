# Roadmap (PoC)

This is a coarse roadmap shape for the PoC. The initiative docs are the canonical breakdown.

Canonical:
- Initiative map: `docs/00-strategy/initiatives/initiative-overview-001-002-003.md`
- Dependency ordering: `docs/00-strategy/initiatives/001-003_dependency_plan.md`

## Now (trust wedge)
Initiative 001: Trust substrate
- Matter (folder) + upload + viewer baseline
- Locked citations + click-to-highlight evidence
- Fail-closed row statuses + export gating rules
- Failure journeys that are actionable (missing docs, citation mismatch)

## Next (workflow wedge)
Initiative 002: Quick Start engine
- Question set v1 (<=25) + stable IDs + row schema
- Deterministic-ish orchestration (retrieve -> draft -> lock -> verify -> write)
- Pack parsing for fixture packs (commitment + instruments + survey)
- Bias toward `needs_review` over false certainty

## Later (demo reliability)
Initiative 003: Demo-grade outputs and repeatability
- Exports: CSV + one Word memo
- Eval harness: fixture-driven regressions + reports
- Demo mode controls (dev-only), safe reset, operator checklist

## Post-PoC (explicitly out of scope for now)
- Multi-tenant auth/RBAC
- Integrations (DMS)
- Expanded deliverables (objection/cure letters, closing checklists)
