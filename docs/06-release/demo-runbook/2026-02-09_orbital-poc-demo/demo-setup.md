
  1. Start local Postgres (Postgres.app or Homebrew service).
  2. Create DB + user once:

  psql postgres <<'SQL'
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'orbital') THEN
      CREATE ROLE orbital LOGIN PASSWORD 'orbital';
    END IF;
  END
  $$;
  CREATE DATABASE orbital OWNER orbital;
  SQL

  3. Install deps from repo root:

  pnpm install

  4. Start app in dev mode:

  DATABASE_URL=postgresql://orbital:orbital@127.0.0.1:5432/orbital \
  DEMO_MODE=1 \
  ALLOW_DEV_OBJECT_STORE_SECRET=1 \
  EVIDENCE_BACKEND=db_only \
  pnpm dev

  5. Open http://localhost:3000/matters.
  6. Load pack_01_clean from Operator Controls.
  7. Run Quick Start and continue the flow.

  If you already have a local Postgres DB/user, just skip step 2 and use your own
  DATABASE_URL.
