# Demo Operator Checklist (0007 Demo Reliability)

Keep this checklist aligned with the actual UI flow:
- `apps/web/app/DemoToolbar.tsx`
- `apps/web/app/(api)/demo/load-pack/route.ts`
- `apps/web/app/(app)/matters/[id]/page.tsx`
- `apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx`

## Preflight

- [ ] Start the app in dev mode with demo mode enabled:

```bash
DEMO_MODE=1 pnpm dev
```

- [ ] Confirm the **DEMO MODE** toolbar is visible at the top of the page.
- [ ] Confirm fixture packs exist on disk:
  - [ ] `docs/08-example-data/pack_01_clean/docs/*.pdf`
  - [ ] `docs/08-example-data/pack_02_missing_rea/docs/*.pdf`
  - [ ] `docs/08-example-data/pack_09_bad_citation/docs/*.pdf`

## Demo: `pack_01_clean` (happy path)

- [ ] In the toolbar: set Pack to `pack_01_clean` and click **Load demo pack**.
- [ ] On the Matter page:
  - [ ] Confirm the matter name starts with `DEMO: pack_01_clean`.
  - [ ] Refresh until the matter state is `indexed` or `ready` and **Run analysis** is enabled.
  - [ ] Open at least one seeded PDF via **Open PDF** (sanity check: object storage + signed URLs).
- [ ] Click **Run analysis**.
- [ ] Confirm a run is created and **Report JSON** opens.

## Demo: `pack_02_missing_rea` (missing-doc journey)

- [ ] Repeat the steps above with `pack_02_missing_rea`.
- [ ] In **Report JSON**, confirm at least one row has:
  - [ ] `status: "missing_input"`
  - [ ] `citation_ids: []`

## Demo: `pack_09_bad_citation` (export-blocked trust journey)

- [ ] Repeat load + run with `pack_09_bad_citation`.
- [ ] In **Report JSON**, confirm at least one row has:
  - [ ] `status: "citation_failed"`
- [ ] Attempt CSV export without unsafe override.
- [ ] Confirm API returns `EXPORT_BLOCKED`.

## Repeatability (run twice, no cleanup)

- [ ] Load the same pack again from the toolbar.
- [ ] Confirm you land on a different matter id (fresh matter, no delete/reset endpoint).
- [ ] Note: **Analysis only runs once per matter**. To rerun: **load the pack again to create a fresh matter**.

## Fast Troubleshooting

- Demo toolbar missing:
  - Ensure `NODE_ENV=development` (use `pnpm dev`, not `pnpm start`) and `DEMO_MODE=1`.
- `NOT_FOUND: Pack docs not found.` when loading:
  - Confirm PDFs exist under `docs/08-example-data/<pack_id>/docs/` (and are non-empty).
- Run analysis disabled (`indexed/ready`):
  - Refresh; ingest/index runs in the background.
