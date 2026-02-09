# Demo Operator Checklist (2026-02-09)

Goal: keep the live demo smooth and honest. The UI shown is a dev-only demo slice proving the trust substrate.

## Preflight (10 minutes before)

- [ ] Start Postgres (local Docker):

```bash
docker compose up -d db
```

- [ ] Seed fixture packs:

```bash
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
```

- [ ] Start the app in dev mode (required):

```bash
pnpm dev
```

- [ ] Open `http://localhost:3000/matters?pack=pack_01_clean`
- [ ] Open `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-runbook.html` in a browser tab.
- [ ] Confirm at least one citation chip opens the viewer and renders an overlay (at 100% zoom).
- [ ] Confirm the bad-citation fixture shows `citation_failed` and renders no overlay.
- [ ] Confirm `pack_02_missing_rea` shows a missing-doc checklist on the `missing_input` row.

Optional:
- [ ] Enable CSV export endpoint (so it returns `EXPORT_BLOCKED` vs `404`): set `SPIKES_ENABLED=1` and restart `pnpm dev`.
- [ ] Enable trace export (dev-only): set `FEATURE_TRACE_EXPORT=1` and `ALLOW_ADMIN_BYPASS=1`, then restart `pnpm dev`.

## If something breaks (quick fixes)

- `/matters` is 404:
  - You are not running dev mode. Use `pnpm dev` (not `pnpm start`).
- "No seeded data" banner appears:
  - Rerun `pnpm fixture:seed pack_01_clean --overwrite`.
- Viewer cannot find a PDF:
  - Confirm fixture pack files exist under `docs/08-example-data/<pack_id>/docs/`.
- Citation is `NOT_FOUND`:
  - Seed snapshots may be stale. Rerun `pnpm fixture:seed ... --overwrite`.
- Export CSV shows `NOT_FOUND` / request is 404:
  - The export endpoint is gated. Set `SPIKES_ENABLED=1` and restart `pnpm dev`.
- Export CSV always blocked:
  - That is expected if any row fails verification. Use it as the trust posture moment.
