# Handoff: Demo Setup + Runbook/App Copy

## 1) Scope/status

- Goal: get set up for the demo runbook + operator checklist and remove on-screen “tracer bullet” wording.
- Done:
  - DB started (`docker compose up -d db`) and healthy.
  - Fixture packs seeded into `tmp/fixture-seed/*/snapshot.json`:
    - `pack_01_clean`
    - `pack_02_missing_rea`
    - `pack_07_scans_rotated_low_quality`
    - `pack_09_bad_citation`
  - Dev server started (`pnpm dev`) and demo URLs opened.
  - Copy cleanup: removed “tracer bullet” wording from UI + demo docs.
- Pending (manual demo checks):
  - Click a citation chip and confirm viewer overlay renders at 100% zoom.
  - Confirm bad-citation fixture yields `citation_failed` and no overlay.
  - Confirm `pack_02_missing_rea` shows missing-doc checklist on `missing_input`.

## 2) Working tree

- On `main` (no local commits created).
- `git status -sb` currently shows more changes than just the demo-copy edits. Verify intent before committing anything:

```text
## main...origin/main
 M apps/web/app/(app)/matters/ExportCsvButton.tsx
 M apps/web/app/(app)/matters/ExportTraceButton.tsx
 M apps/web/app/(app)/matters/page.tsx
 M apps/web/app/page.tsx
 M apps/web/app/tokens.css
 M apps/web/app/ui/Button.tsx
 M apps/web/tailwind.preset.ts
 M docs/04-projects/04-refactors/0001_v5-ui-alignment/plan.md
 M docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-operator-checklist.md
 M docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-script.md
?? apps/web/app/ui/Alert.tsx
?? apps/web/app/ui/Chip.tsx
?? apps/web/app/ui/InlineStatus.tsx
?? apps/web/app/ui/Table.tsx
?? docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/walkthrough.md
?? docs/98-tmp/handoffs/handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md
```

- Known-intent edits from this session were only:
  - `apps/web/app/(app)/matters/page.tsx` (copy: “Demo-only UI…”)
  - `apps/web/app/page.tsx` (copy: “Matters: demo UI…”)
  - `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-operator-checklist.md` (copy cleanup)
  - `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-script.md` (copy cleanup)
  - plus this handoff note file.

## 3) Branch/PR

- Branch: `main`
- PR: none
- CI: not run

## 4) Running processes

- tmux: none (`tmux ls` empty)
- DB: `docker compose ps db` shows `orbital-poc-db` healthy, port `5432` mapped.
- Dev server:
  - Started via `pnpm dev` (reachable at `http://localhost:3000`).
  - Note: port `3000` shows a `sprite proxy` listener in `lsof`; avoid fighting it. If the app isn’t responding, just restart `pnpm dev`.

Quick smoke commands:

```bash
curl -I "http://localhost:3000/matters?pack=pack_01_clean"
curl -I "http://localhost:3000/matters?pack=pack_02_missing_rea"
```

## 5) Tests/checks

- Ran:
  - `docker compose up -d db`
  - `pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite`
  - `pnpm dev`
  - `curl -I` checks on the `/matters` pages
- Not run: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`

## 6) Next steps

1. Decide what to do with the unrelated working-tree changes:
   - `apps/web/app/tokens.css`
   - `docs/04-projects/04-refactors/0001_v5-ui-alignment/plan.md`
2. If committing demo copy cleanup: stage and commit the 4 demo-related files only.
3. Run the operator checklist at `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-operator-checklist.md` end-to-end and confirm the 3 manual checks above.

## 7) Risks/gotchas

- Demo toolbar (pack loader) is gated behind `DEMO_MODE=1` (dev-only). Without it, use the fixture-seeded `/matters?pack=...` pages.
- Export “unsafe override” is intentionally hard-gated (requires `DEMO_MODE=1`, `ALLOW_UNSAFE_EXPORTS=1`, `ORBITAL_ADMIN_TOKEN`).
- “Chat with documents” is not implemented in the app and is explicitly cut from 0001/0002; don’t promise ChatGPT-style chat in the demo.
