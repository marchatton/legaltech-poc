# Handoff: Clean-Room UI Rebuild — Phases 3–5 Complete

**Date:** 2026-02-12 10:53
**Branch:** `refactor/ui-wireframe-cleanroom`
**Dossier:** `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/`

## Scope & Status

### Done (this session: Phases 3–5)

- **Phase 3 — Matters list + new matter:**
  - Rebuilt `apps/web/app/(app)/matters/page.tsx` from wireframe IA
  - Deleted `MattersToolbar.tsx` (dead code, never imported)
  - Kept `CreateMatterForm.tsx` unchanged (inline form, intentional delta vs wireframe's separate page)
  - 5 intentional deltas logged

- **Phase 4 — Detail frame + tabs:**
  - Rebuilt `apps/web/app/ui/WorkspaceTabs.tsx` (border-b-2 tabs, no card wrapper)
  - Edited `apps/web/app/(app)/matters/[id]/page.tsx` (header: name + status badge inline, progress cluster, compact fixture context)
  - 3 intentional deltas logged

- **Phase 5 — Report triage table + row drawer:**
  - Edited `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`
  - Table: 8 → 5 columns (ID, Question, Answer Preview, Status, chevron action)
  - Rows clickable (tr onClick → data-row-trigger button for focus management)
  - Drawer header: serif title, X close button, removed timestamp chips
  - All behavior preserved: mark_reviewed, split-view lock, citation loading, evidence viewer, keyboard/escape, focus management
  - 7 intentional deltas logged

### Done (prior sessions: Phases 0–2)
- Phase 0: Ledger + planning docs
- Phase 1: Token audit + responsive spacing
- Phase 2: Shell + sidebar (WorkspaceShell, WorkspaceSidebar)

### Pending (Phases 6–8)
- Phase 6: Evidence viewer (`CitationViewerClient.tsx`, viewer page)
- Phase 7: Chat tab, Artefacts tab, Exports tab
- Phase 8: Tables + filters fidelity checkpoints

## Working Tree

```
## refactor/ui-wireframe-cleanroom...origin/refactor/ui-wireframe-cleanroom [ahead 1]
 D apps/web/app/(app)/matters/MattersToolbar.tsx
 M apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
 M apps/web/app/(app)/matters/[id]/page.tsx
 M apps/web/app/(app)/matters/page.tsx
 M apps/web/app/ui/WorkspaceTabs.tsx
 M docs/.../ui-rebuild-cleanroom-parity-ledger-2026-02-12.md
?? docs/.../tmp-handoffs/handoff_2026-02-12_10-20-38_cleanroom-ui-rebuild-phase3.md
?? docs/.../tmp-handoffs/handoff_2026-02-12_10-53-30_cleanroom-ui-rebuild-phase5.md
```

- 1 local commit ahead (Phase 2 shell work)
- 5 modified files + 1 deleted file (uncommitted, Phases 3–5 work)

## Branch / PR

- Branch: `refactor/ui-wireframe-cleanroom`
- No PR created yet — work is local-only
- Upstream: `origin/refactor/ui-wireframe-cleanroom` (1 commit behind local)

## Tests / Checks

- `tsc --noEmit`: PASS (all phases)
- `next lint`: PASS (all phases)
- No runtime/browser tests run yet

## Next Steps

1. **Commit Phases 3–5 work** (5 modified + 1 deleted file, see working tree above)
2. **Phase 6**: Evidence viewer rebuild (`CitationViewerClient.tsx`, `viewer/page.tsx`, `evidence/[id]/page.tsx`)
   - Wireframe: `components/matter/EvidenceViewer.tsx`
   - Acceptance: zoom/rotate/page nav, verification overlay, keyboard shortcuts
3. **Phase 7**: Chat tab, Artefacts tab, Exports tab (3 surfaces)
4. **Phase 8**: Tables + filters fidelity checkpoints (cross-surface validation)
5. **Browser test** all rebuilt surfaces before marking phases done

## Risks / Gotchas

- `ReportTriagePanel.tsx` is 920+ lines — large client component. Table columns reduced but all behavior intact. Test evidence viewer split-view + mark_reviewed flows before shipping.
- `lib/memoDocx.server.ts` TS2307 (missing `docx` module) is pre-existing and unrelated to this refactor.
- Confidence column data (`ReportRowForDrawer.confidence`) doesn't exist — logged as intentional delta. Will need backend work if needed later.
- No "Flag Issue" backend action exists — drawer footer keeps "Back to table" instead of wireframe's "Flag Issue".

## Key Files

| File | Change |
|---|---|
| `apps/web/app/(app)/matters/page.tsx` | Rewritten (Phase 3) |
| `apps/web/app/(app)/matters/MattersToolbar.tsx` | Deleted (dead code) |
| `apps/web/app/ui/WorkspaceTabs.tsx` | Rewritten (Phase 4) |
| `apps/web/app/(app)/matters/[id]/page.tsx` | Header + fixture context edits (Phase 4) |
| `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | Table + drawer header edits (Phase 5) |
| `docs/.../ui-rebuild-cleanroom-parity-ledger-2026-02-12.md` | Updated with Phase 3–5 evidence + 15 intentional deltas |
