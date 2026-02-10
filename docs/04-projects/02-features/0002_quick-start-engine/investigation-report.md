# Investigation: 0002 Quick Start Engine "Stuck Extract"

Date: 2026-02-10

## Summary
The 0002 dossier is intentionally in a NO-GO state: all implementation stories are blocked on closing a set of gating spikes with fixture-verifiable proof artefacts. The immediate gap appears to be that the spike execution harnesses and/or proof outputs have not been produced/committed, leaving risks and GO checklist items open.

## Symptoms
- `prd.json` is `Draft (NO-GO until key spikes close)` and all stories `US-001..US-006` are `open`.
- Multiple gating spikes (SP-2.1, SP-2.2A, SP-2.3A, SP-2.4A, SP-2.5, SP-2.6, SP-2.8, SP-2.11) are required before moving to implementation work.
- The dossier asserts required fixture-verifiable proof artefacts (snapshots/diffs/results) are not yet committed under `spike-proofs/`.

Evidence: `docs/04-projects/04-refactors/0004_quick-start-to-wdk/stuck-extract.md`.

## Investigation Log

### 2026-02-10 - Phase 1 - Initial Assessment (Docs)
**Hypothesis:** This is primarily a process/verification gap (spikes not executed / proofs not produced), not an implementation bug.
**Findings:** `stuck-extract.md` enumerates explicit spike gates as NO-GO blockers and lists exact expected proof filenames under `spike-proofs/`.
**Evidence:** `docs/04-projects/04-refactors/0004_quick-start-to-wdk/stuck-extract.md`.
**Conclusion:** Needs system-level context: verify whether spike harness code exists, whether example packs exist, and what concrete missing pieces prevent producing the proofs.

### 2026-02-10 - Phase 2 - Systematic Exploration (Context Builder)
**Hypothesis:** The repo has comparator/validator tooling but lacks an “engine producer” that can emit the required spike snapshot/result/diff artefacts from real extraction logic.
**Findings:** The repo has strong fixture tooling (`scripts/fixtures/*`) and a Quick Start runtime path, but the runtime “write row v0” logic is placeholder and the fixture snapshot generator is truth-driven (seed), not a real extractor.
**Evidence:**
- Required proof artefact names are explicitly specified for spikes like SP-2.2A and SP-2.6. (`docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md:144`, `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md:170`)
- The WDK step writes only `missing_input` or `citation_failed`, and list rows get an empty `list_payload_v0`. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:41`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:71`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:93`)
- Fixture eval prefers `produced/snapshot.json` but otherwise calls the seed script. (`scripts/fixtures/eval.ts:171`)
**Conclusion:** Likely root cause is missing “producer layer” for spikes: a deterministic extractor that emits spike snapshots under `spike-proofs/` to then run comparators and commit `.result.json`/`.diff.json`.

### 2026-02-10 - Phase 4 - Evidence Gathering (Code + Filesystem)
**Hypothesis:** The current Quick Start run path cannot produce the spike proof artefacts because it does not generate locked citations or populated payload items, and there is no script that writes the required proof filenames into `spike-proofs/`.
**Findings:**
- The WDK step `quickStartWriteRowV0Step` chooses between `missing_input` and `citation_failed` based on whether the folder has parsed+OCR’d documents, and it does not emit `needs_review` rows. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:207`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:217`)
- For list payload questions, it attaches `payload_schema_version = list_payload_v0` and uses `emptyListPayloadV0(kind)` which emits `{ kind, items: [] }`. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:93`, `packages/core/src/schemas/list_payload_v0.ts:101`)
- `scripts/fixtures/eval.ts` uses `docs/08-example-data/<pack>/produced/snapshot.json` when present, otherwise it runs `scripts/fixtures/seed.ts` (overwriting) and evaluates the seeded snapshot. (`scripts/fixtures/eval.ts:171`)
- `scripts/fixtures/seed.ts` generates list payload rows by reading truth CSVs (not by parsing commitment/survey content), e.g. TS-03 reads `truth/expected_requirements_tracker.csv` and materializes payload items with citations. (`scripts/fixtures/seed.ts:493`)
- As of 2026-02-10, `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/` contains only doc notes (README + RH/SP md/txt files) and no `SP-2.*.snapshot.json`/`.result.json`/`.diff.json` artefacts. (Directory listing)
- Only `docs/08-example-data/pack_09_bad_citation/produced/snapshot.json` exists; packs 01/02/03 do not have produced snapshots. (Filesystem search)
- Spec drift exists between the list payload doc and the Zod schema:
  - Doc contract excludes `survey_certification_parties` kind. (`docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md:16`)
  - Code includes `survey_certification_parties` kind and defines exception item `item_status` as `needs_review|missing_input`, which the doc does not include. (`packages/core/src/schemas/list_payload_v0.ts:5`, `packages/core/src/schemas/list_payload_v0.ts:44`)
- Question set version drift exists between fixture packs and runtime:
  - Manifest expects `qs:quick_start_title_survey:v1`. (`docs/08-example-data/pack_01_clean/manifest.json:5`)
  - Runtime pins `qs:0002:v1.0:sha256:<hash>`. (`apps/web/lib/questionSet.server.ts:70`)
- Quick Start orchestration is WDK-owned (route logs `orchestration: \"wdk\"` and schedules WDK steps); keep “implemented today” docs aligned to prevent drift. (`docs/03-architecture/07_current_poc_runtime.md`, `apps/web/app/(api)/folders/[id]/runs/route.ts:270`)
**Conclusion:** Confirmed. The repo has the comparator/validator layer and a truth-driven seeding layer, but it lacks the extraction producer + spike runner that creates the proof artefacts required to flip the dossier to GO.

## Root Cause
The 0002 dossier is stuck in NO-GO because the required gating spikes cannot be closed with fixture-verifiable proof artefacts given the current code:

1) The current Quick Start “write row v0” runtime is intentionally placeholder: it emits `missing_input` or `citation_failed` rows and attaches empty list payloads (no populated items, no locked citations), so it cannot produce truth-comparable outputs for SP-2.2A/SP-2.3A/SP-2.4A/SP-2.6/SP-2.11. (`apps/web/steps/quickStartWriteRowV0.step.server.ts:41`, `apps/web/steps/quickStartWriteRowV0.step.server.ts:217`)

2) The repo has strong tooling to validate/compare snapshots (`scripts/fixtures/assert_row_invariants.ts`, `scripts/fixtures/compare_truth.ts`, etc.), but it does not have a deterministic “producer layer” that generates spike snapshots from real extraction logic and writes the canonical proof filenames under `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`. (`docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md:170`, directory contents)

3) The fixture snapshot generator that does exist (`scripts/fixtures/seed.ts`) is truth-driven: it reads truth CSVs and materializes payload items, which is useful for harnessing/demos but does not close the “parsing/matching baseline” spikes credibly. (`scripts/fixtures/seed.ts:493`)

Contributing factor: contract drift (list payload schema + question set version formats) increases ambiguity and slows closure, even where tooling exists. (`docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md:16`, `packages/core/src/schemas/list_payload_v0.ts:5`, `docs/08-example-data/pack_01_clean/manifest.json:5`, `apps/web/lib/questionSet.server.ts:70`)

## Recommendations
1. Decide spike closure strategy explicitly (recommended: offline fixture producer first).
2. Add a small spike runner script that writes canonical proof filenames into `.../spike-proofs/` and invokes existing comparator/validator tooling.
3. Eliminate spec drift now (cheap, high leverage):
   - Reconcile `docs/.../specs/list_payload_v0.schema.md` with `packages/core/src/schemas/list_payload_v0.ts` (kinds, exception item fields).
   - Standardize `question_set_version` format between fixture manifests and runtime (pick hashed pinning as canonical).
   - Ensure `docs/03-architecture/07_current_poc_runtime.md` stays aligned with current Quick Start orchestration reality (WDK).
4. For SP-2.8, implement a deterministic Recall@K harness against fixture layout text/anchors (per spike stub) and commit results + misses log.

## Preventive Measures
- Add a “proof artefact presence” check for required spikes so the dossier can’t drift into “docs say required filenames” while nothing generates them.
- Keep a single source of truth for payload schemas: either generate docs from Zod schemas or enforce doc/code consistency via CI.
- When orchestration changes (jobs→WDK), require updating `docs/03-architecture/07_current_poc_runtime.md` in the same PR.
