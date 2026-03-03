# Demo Setup (2026-02-14 refresh)

## Quick path (recommended)

1. Start Postgres via Docker Compose:

```bash
docker compose up -d db
```

2. Install dependencies (repo root):

```bash
pnpm install
```

3. Seed demo fixture packs:

```bash
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
```

4. Start app in dev mode:

```bash
pnpm dev
```

5. Open:
- `http://localhost:3000/matters?pack=pack_01_clean`
- `docs/06-release/demo-runbook/2026-02-09_legaltech-poc-demo/demo-runbook.html`

## Optional flags

- Trace export demo: `FEATURE_TRACE_EXPORT=1` and `ALLOW_ADMIN_BYPASS=1`
- Spikes CSV export route: `SPIKES_ENABLED=1`

## Worker note

- In `pnpm dev`, WDK draining is inline.
- If running outside dev, run worker separately:

```bash
pnpm --filter @legaltech-poc/web worker
```
