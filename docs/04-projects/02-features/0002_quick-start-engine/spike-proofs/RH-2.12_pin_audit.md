# RH-2.12 Pinning Audit (question_set_version)

Goal: ensure run records and API contracts explicitly pin `question_set_version` so comparisons are stable and "completed" invariants are enforceable.

Docs that define/require pinning:
- `docs/03-architecture/20_state_model.md` (run invariants reference question set version)
- `docs/03-architecture/30_data_model.md` (`runs.question_set_version`)
- `docs/03-architecture/50_api_surface.md` (run responses include `question_set_version`)
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` (Runs API pins `question_set_version`; UI shows pinned label per run)
- `docs/04-projects/02-features/0002_quick-start-engine/question_set_v1.json` (version format + pinning notes)
- `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.6 expects pinned versions)

Open implementation items (not covered by this doc patch):
- Persist `question_set_version` on `runs` in the DB migration.
- Ensure `POST /folders/:id/runs` sets it deterministically at run start.
- Ensure `GET /runs/:id` and `GET /folders/:id/report` always return it.

