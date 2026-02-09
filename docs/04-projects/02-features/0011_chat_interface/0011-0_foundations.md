# PR0 (Mini PRD): Shared Foundations for Hybrid Retrieval + Matter Chat

Canonical PR0 mini-PRD (source of truth): `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md`.

Implementation plan (step-by-step): `docs/04-projects/02-features/0011_chat_interface/plan.md`.

## Definition of Done (PR0)

- Code compiles.
- `ensureSchema()` remains idempotent.
- PRD A can add retrieval schema/logic without editing `apps/web/lib/db.server.ts`.
- PRD B can add chat schema/logic without editing `apps/web/lib/db.server.ts`.
