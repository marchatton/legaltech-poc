# Handoff: Clean-Room UI Rebuild — Phase 3 Ready

## 1) Scope / Status

**Task:** Clean-room UI rebuild of `apps/web` to match wireframes at >=90% IA fidelity.

**Completed (Phases 0–2):**
- Phase 0: Parity ledger seeded with 15 surfaces, owner + acceptance IDs, intentional deltas (Documents tab kept, Runs+Alerts unified), wireframe reference list locked (20 files).
- Phase 1: Token audit — all wireframe tokens already in production. Added scrollbar styling to `globals.css`, `xl`+`full` Page width variants.
- Phase 2: Shell + navigation rebuilt:
  - `WorkspaceSidebar.tsx` → client component with collapse/expand (w-64↔w-16), cyan active state, purple ring logo, ChevronsLeft/Right, user profile with logout icon.
  - `WorkspaceShell.tsx` → overflow-hidden frame, h-14 sticky header bg-card.
  - `[id]/layout.tsx` → breadcrumb with Home icon, folder ID next to matter name.

**Pending (Phases 3–8):**
- Phase 3: Matters list + new matter clean rebuild
- Phase 4: Matter detail top-level clean rebuild
- Phase 5: Report table + drawer clean rebuild
- Phase 6: Evidence viewer clean rebuild
- Phase 7: Chat, artefacts, exports clean rebuild
- Phase 8: Verification and closeout

**Blockers:** None.

## 2) Working Tree

```
## refactor/ui-wireframe-cleanroom...origin/refactor/ui-wireframe-cleanroom [ahead 1]
```

1 local commit not yet pushed. Clean working tree (no uncommitted changes).

## 3) Branch / PR

- **Branch:** `refactor/ui-wireframe-cleanroom`
- **PR:** Not yet created. Will create after more phases land.
- **Base:** `main` (snapshot commit `096ef68`)

## 4) Running Processes

None. No dev servers or background tasks running.

## 5) Tests / Checks

- `pnpm -C apps/web typecheck` → PASS
- `pnpm -C apps/web lint` → PASS (2 pre-existing warnings, not in touched files)
- No test suite run yet (Phase 8 verification)

## 6) Next Steps (Phase 3)

1. Read the planning docs:
   - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-detailed-implementation-plan-2026-02-12.md` (Phase 3 section)
   - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-parity-ledger-2026-02-12.md`
2. Read wireframe sources:
   - `orbital-ui-wireframes/src/pages/MattersListPage.tsx`
   - `orbital-ui-wireframes/src/pages/NewMatterPage.tsx`
3. Read production targets:
   - `apps/web/app/(app)/matters/page.tsx`
   - `apps/web/app/(app)/matters/CreateMatterForm.tsx`
   - `apps/web/app/(app)/matters/MattersToolbar.tsx`
   - `apps/web/lib/mattersList.server.ts` (behavior contract — do not change)
4. Rebuild matters list page: header, toolbar, search/filter chips, table (wireframe IA at >=90% fidelity).
5. Rebuild CreateMatterForm presentation from wireframe NewMatterPage.
6. Keep URL query contracts (`?q=`, `?state=`, `?view=`) and `mattersList.server.ts` behavior unchanged.
7. Commit: `refactor(web-ui): rebuild matters list and new matter from wireframe mapping`
8. Update parity ledger rows for "Matters list" and "New matter".
9. Continue to Phase 4 (or hand off again).

## 7) Risks / Gotchas

- **Active state color change:** Sidebar active state switched from `info` (blue) to `cyan` tokens per wireframe. If other components depend on info color for nav active state, they'll need updating.
- **WorkspaceSidebar is now `"use client"`:** Was a server component before. This is intentional for collapse state but means it can't do server-side data fetching (it never did, so this is safe).
- **`WorkspaceContextBar` changed from `<section>` to `<header>`:** Semantic HTML change. Only used in `[id]/layout.tsx`.
- **`mattersList.server.ts`** is a behavior contract — do not modify its query logic or URL param parsing.
- **Pre-existing TS error:** `lib/memoDocx.server.ts` has TS2307 (missing `docx` module). Not related to this work.
- **Decisions locked:** Documents tab keeps existing SetupDocumentsPanel. Runs+Alerts stay unified. Sidebar collapse implemented. New wireframe tokens added to tokens.css.

## Key Files

| Purpose | Path |
|---|---|
| Implementation plan | `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-detailed-implementation-plan-2026-02-12.md` |
| Wireframe mapping | `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-wireframe-mapping-matrix-2026-02-12.md` |
| Parity ledger | `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-parity-ledger-2026-02-12.md` |
| Wireframes root | `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/` |
| Commit sequence | See Phase 4 section of implementation plan |
