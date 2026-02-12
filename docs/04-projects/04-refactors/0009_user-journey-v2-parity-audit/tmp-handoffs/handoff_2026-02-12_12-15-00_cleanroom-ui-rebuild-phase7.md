# Handoff: Clean-Room UI Rebuild — Phases 6–7 Complete

**Date:** 2026-02-12 12:15
**Branch:** `refactor/ui-wireframe-cleanroom`
**Dossier:** `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/`

## Scope & Status

### Done (this session: Phases 6–7)

- **Phase 6 — Evidence viewer:**
  - Reframed `CitationViewerClient.tsx` from stacked diagnostic sections to wireframe-style viewer shell
  - Toolbar bar: doc label + page nav (chevron icons) + zoom pill group + rotation + verification badge
  - Canvas stage: centered with bg-muted/30, paper-frame wrapper (shadow-ui-md)
  - Footer bar: trust metadata inline + flag citation confirm flow
  - Snippet verification + error recovery moved to separate diagnostics section below
  - Removed unused Button import
  - 6 intentional deltas logged

- **Phase 7 — Chat, Artefacts, Exports tabs:**
  - ChatPanel: shell container (bg-card border rounded-ui-lg), header bar (cyan bg), scrollable messages, rounded-2xl bubbles, footer input
  - ArtefactsList: compact pill-shaped filter bar, smaller labels, pill buttons
  - ExportsPanel: card wrappers for run selector + export options with section label
  - 8 intentional deltas logged
  - All behavior preserved across all three components

### Done (prior sessions: Phases 0–5)
- Phase 0: Ledger + planning docs
- Phase 1: Token audit + responsive spacing
- Phase 2: Shell + sidebar
- Phase 3: Matters list + new matter
- Phase 4: Detail frame + tabs
- Phase 5: Report triage table + row drawer

### Pending (Phase 8)
- Phase 8: Tables + filters fidelity checkpoints (cross-surface validation)
- Also pending: Demo toolbar/history/checklist, Error + status primitives, Tokens completion

## Working Tree

```
clean — all changes committed
```

- 4 local commits ahead of origin (phases 2, 3-5, 6, 7)

## Branch / PR

- Branch: `refactor/ui-wireframe-cleanroom`
- No PR created yet — work is local-only
- Upstream: `origin/refactor/ui-wireframe-cleanroom` (4 commits behind local)

## Tests / Checks

- `tsc --noEmit`: PASS (all phases)
- `next lint`: PASS (all phases, pre-existing warnings in unrelated files only)
- No runtime/browser tests run yet

## Commits (this session)

```
a4899d9 refactor(viewer): reframe evidence viewer to toolbar+canvas+footer shell (phase 6)
e2aee1e refactor(ui): restyle chat, artefacts, exports tabs for wireframe parity (phase 7)
```

## Next Steps

1. **Phase 8**: Tables + filters fidelity checkpoints
   - Cross-validate matters list table, report triage table, artefacts table
   - Verify sticky headers, hover states, column structure match wireframe
   - Check filter pills/forms work with URL params
2. **Remaining parity surfaces** (lower priority):
   - Demo toolbar/history/checklist (Phase 4 planned)
   - Error + status primitives (Phase 1 planned)
   - Tokens + responsive spacing completion (Phase 1 in_progress)
3. **Browser test** all rebuilt surfaces
4. **Push branch + create PR** when all phases validated

## Parity Ledger Stats

- **Total intentional deltas logged:** 29 (15 from phases 3-5, 6 from phase 6, 8 from phase 7)
- **Surfaces marked done:** 8 of 14
- **Surfaces planned:** 6 of 14

## Key Files Modified (this session)

| File | Change |
|---|---|
| `CitationViewerClient.tsx` | Layout reframed to toolbar+canvas+footer (Phase 6) |
| `ChatPanel.tsx` | Shell container, header, scrollable messages (Phase 7) |
| `ArtefactsList.tsx` | Compact pill filter bar (Phase 7) |
| `ExportsPanel.tsx` | Card wrappers + section label (Phase 7) |
| `ui-rebuild-cleanroom-parity-ledger-2026-02-12.md` | Updated with Phase 6-7 evidence + 14 intentional deltas |

## Risks / Gotchas

- `ChatPanel.tsx` header bar uses a hex glyph (⬡) instead of Lucide Bot icon — no icon imports added
- `ArtefactsList.tsx` is a server component — filter changes are form-based, not client-side
- Evidence viewer close/back navigation stays in PageHeader (server page), not inside client component
- Pre-existing TS2307 on `docx` module (unrelated to this refactor)
