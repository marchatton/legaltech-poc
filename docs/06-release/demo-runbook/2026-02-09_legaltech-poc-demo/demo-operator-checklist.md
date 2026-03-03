# Demo Operator Checklist (2026-02-14 refresh)

Goal: keep the live demo smooth, honest, and aligned to current runtime + v3 journeys.

## Preflight (10 minutes before)

- [ ] Start Postgres:

```bash
docker compose up -d db
```

- [ ] Seed fixture packs:

```bash
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
```

- [ ] Start app in dev mode:

```bash
pnpm dev
```

- [ ] Open `http://localhost:3000/matters?pack=pack_01_clean`
- [ ] Open `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-runbook.html`
- [ ] Confirm shell context appears correctly (environment badge, breadcrumb, stable IDs)
- [ ] Confirm report triage tabs + row drawer actions work (`mark reviewed`, `flag issue`, copy answer)
- [ ] Confirm citation click opens viewer and highlight verification at 100% zoom
- [ ] Confirm bad-citation row shows `citation_failed` and no overlay
- [ ] Confirm `pack_02_missing_rea` shows `missing_input` + checklist copy
- [ ] Confirm exports blocked state can deep-link back to failed rows
- [ ] Confirm chat run picker shows run scope clearly (selected vs effective if mismatch)

Optional flags:
- [ ] Trace export UI: `FEATURE_TRACE_EXPORT=1` + `ALLOW_ADMIN_BYPASS=1` (dev-only)
- [ ] Spikes CSV export endpoint: `SPIKES_ENABLED=1`

## Non-dev worker note

- In `pnpm dev`, WDK draining runs inline.
- Outside dev, run a worker separately:

```bash
pnpm --filter @legaltech-poc/web worker
```

## If something breaks (quick fixes)

- `/matters` is 404:
  - Run `pnpm dev` (not `pnpm start` for this demo flow).
- "No seeded data" appears:
  - Re-run `pnpm fixture:seed pack_01_clean --overwrite`.
- Viewer cannot load PDF:
  - Check fixture docs under `docs/08-example-data/<pack_id>/docs/`.
- Citation shows `NOT_FOUND` or `ANCHOR_NOT_FOUND`:
  - Re-seed packs and refresh the page.
- Exports route returns 404:
  - Set `SPIKES_ENABLED=1` and restart dev server.
- Trace route blocked:
  - Set `FEATURE_TRACE_EXPORT=1` and admin bypass/token env.
