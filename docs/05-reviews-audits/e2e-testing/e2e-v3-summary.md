# E2E V3 Journey-Decomposed Summary

Date: 2026-02-11

Canonical decomposition:
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json`

## Decomposition Shape

4 core journeys, 14 total stories, one story per Ralph iteration.

| Journey | Story IDs | Coverage | Source Slices |
|---|---|---|---|
| J1: Entry + Setup | US-001..US-003 | F1, F2 | `0001`, `0002` |
| J2: Run + Review Decisions | US-004..US-006 | F3, F4 | `0003`, `0004` |
| J3: Trust + Export + Provenance | US-007..US-011 | F5, F6, F7 | `0005`, `0006`, `0007` |
| J4: Chat + Demo + Resilience | US-012..US-014 | F8, F9, F10 | `0008`, `0009`, `0010` |

## Ralph Run Pattern

```bash
ralph build 1 --agent=codex --prd docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json --no-commit
```

Run once per completed story (14 iterations for full pass).

## Story Order

1. US-001 Shell wayfinding baseline
2. US-002 Matter discovery/filtering
3. US-003 Matter creation/upload/readiness guidance
4. US-004 Quick Start readiness gate
5. US-005 Run triage tab contracts
6. US-006 Drawer-first decisions and mutation feedback
7. US-007 Valid citation trust viewer verification
8. US-008 Invalid citation fail-closed behavior
9. US-009 Safe run-scoped exports
10. US-010 Blocked export recovery deep-link
11. US-011 Artefact provenance retrieval and download safety
12. US-012 L1 run-scoped chat contract
13. US-013 Demo operator pack load/reload loop
14. US-014 Cross-surface error/retry/support contract

## File Reference Inventory (All Files In Folder)

- `docs/05-reviews-audits/e2e-testing/0001_shell-wayfinding-baseline/prd.md`
- `docs/05-reviews-audits/e2e-testing/0001_shell-wayfinding-baseline/prd.json`
- `docs/05-reviews-audits/e2e-testing/0002_matter-discovery-setup-lane/prd.md`
- `docs/05-reviews-audits/e2e-testing/0002_matter-discovery-setup-lane/prd.json`
- `docs/05-reviews-audits/e2e-testing/0003_run-readiness-triage-core/prd.md`
- `docs/05-reviews-audits/e2e-testing/0003_run-readiness-triage-core/prd.json`
- `docs/05-reviews-audits/e2e-testing/0004_drawer-first-review-decisions/prd.md`
- `docs/05-reviews-audits/e2e-testing/0004_drawer-first-review-decisions/prd.json`
- `docs/05-reviews-audits/e2e-testing/0005_trust-viewer-loop/prd.md`
- `docs/05-reviews-audits/e2e-testing/0005_trust-viewer-loop/prd.json`
- `docs/05-reviews-audits/e2e-testing/0006_run-scoped-export-loop/prd.md`
- `docs/05-reviews-audits/e2e-testing/0006_run-scoped-export-loop/prd.json`
- `docs/05-reviews-audits/e2e-testing/0007_artefact-provenance-retrieval/prd.md`
- `docs/05-reviews-audits/e2e-testing/0007_artefact-provenance-retrieval/prd.json`
- `docs/05-reviews-audits/e2e-testing/0008_l1-run-scoped-chat/prd.md`
- `docs/05-reviews-audits/e2e-testing/0008_l1-run-scoped-chat/prd.json`
- `docs/05-reviews-audits/e2e-testing/0009_demo-operator-loop/prd.md`
- `docs/05-reviews-audits/e2e-testing/0009_demo-operator-loop/prd.json`
- `docs/05-reviews-audits/e2e-testing/0010_cross-surface-error-contract/prd.md`
- `docs/05-reviews-audits/e2e-testing/0010_cross-surface-error-contract/prd.json`
- `docs/05-reviews-audits/e2e-testing/e2e-v3-summary.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json`
- `docs/05-reviews-audits/e2e-testing/ralph-loop-note.md`
