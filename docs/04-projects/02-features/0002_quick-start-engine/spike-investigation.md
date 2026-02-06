# Spike investigation — Quick Start Engine (Initiative 002)

This doc captures planned spikes for the rabbit holes in `risk-register.md`.

---

# Spike plan — Practitioner question set review

## Question

Do the 20-25 questions match how a senior associate reads a commitment?

## Context

- Feature / concept: Breadboard 2.1 (question set + schema freeze).
- Related requirement(s): R2.1.1.
- Why now: The entire pipeline depends on this question set being credible.

## Success criteria

Proof looks like:

- Practitioner says "yes, I'd use this table" for the 20-25 questions.
- At least 80% of questions align with their mental model without major rewrites.

## Timebox

- Start: TBD
- Hard stop: TBD (<= 0.5 day)

## Scope

Include:

- One practitioner review pass with written feedback.

Exclude:

- Multiple iterations or consensus-building.

## Approach

- Step 1: Share question set v1 with senior associate.
- Step 2: Collect feedback on coverage and ordering.
- Step 3: Record edits and cut questions to <=25.

## Artefacts

Keep:

- Notes of practitioner feedback.
- Updated question list diff.

Throw away:

- Any proposed new questions beyond v1 scope.

## Expected outcomes

- If straight shot: freeze question set v1.
- If tangle: cut to 15-20 and mark expanded set as later.
- If fog: pause initiative until alignment obtained.

## Oracle notes

- Pending (Oracle pass not run yet).

# Spike report — Practitioner question set review

## Question

Do the 20-25 questions match how a senior associate reads a commitment?

## Result

- Outcome: pending
- Decision: pending

## Proof

- Pending

## Key findings

- Pending

## Updated assumptions

- Before: pending
- After: pending

## Implications for the concept

- Patches: pending
- Cuts: pending
- Out of bounds: pending

## Follow-ups

- Update wiring diagram: pending
- Update parts list: pending
- Update fit check: pending

## Appendix

- Repro steps: pending
- Links: pending

---

# Spike plan — Commitment parsing from noisy scans

## Question

Can we parse B-I/B-II reliably from scanned PDFs?

## Context

- Feature / concept: Breadboard 2.2 (commitment parsing).
- Related requirement(s): R2.2.1, R2.2.2.
- Why now: OCR noise could make the parser brittle.

## Success criteria

Proof looks like:

- `pack_06_noisy_scans_rotated_page` yields correct item counts within +/- 1.
- `pack_01_clean` and `pack_04_multi_parcel_complex` match truth tables on key fields.

## Timebox

- Start: TBD
- Hard stop: TBD (<= 1 day)

## Scope

Include:

- Run parsing on `pack_01_clean` and `pack_06_noisy_scans_rotated_page`.

Exclude:

- Generalization to all title formats.

## Approach

- Step 1: OCR text extraction for the target packs.
- Step 2: Parse B-I/B-II sections and count items.
- Step 3: Compare against truth tables and note drift.

## Artefacts

Keep:

- Item counts + comparison notes.
- Parser heuristics summary.

Throw away:

- Production-ready parser code beyond the spike.

## Expected outcomes

- If straight shot: proceed with parser implementation.
- If tangle: cut scope to clean packs only.
- If fog: consider alternate extraction strategy.

## Oracle notes

- Pending (Oracle pass not run yet).

# Spike report — Commitment parsing from noisy scans

## Question

Can we parse B-I/B-II reliably from scanned PDFs?

## Result

- Outcome: pending
- Decision: pending

## Proof

- Pending

## Key findings

- Pending

## Updated assumptions

- Before: pending
- After: pending

## Implications for the concept

- Patches: pending
- Cuts: pending
- Out of bounds: pending

## Follow-ups

- Update wiring diagram: pending
- Update parts list: pending
- Update fit check: pending

## Appendix

- Repro steps: pending
- Links: pending

---

# Spike plan — Exception to instrument matching heuristics

## Question

What matching rules minimize false matches across the target packs?

## Context

- Feature / concept: Breadboard 2.3 (exception matching + summaries).
- Related requirement(s): R2.3.1, R2.3.2.
- Why now: Silent mismatch undermines trust in the report.

## Success criteria

Proof looks like:

- No false matches across the target packs.
- Ambiguous cases surface as `needs_review`.

## Timebox

- Start: TBD
- Hard stop: TBD (<= 1 day)

## Scope

Include:

- Instrument number + book/page heuristics.

Exclude:

- Deep semantic matching.

## Approach

- Step 1: Build matching rules from instrument number + book/page.
- Step 2: Test across all target packs.
- Step 3: Record ambiguous cases and thresholds.

## Artefacts

Keep:

- Matching rules summary.
- List of ambiguous cases.

Throw away:

- Full production pipeline code.

## Expected outcomes

- If straight shot: proceed with matching service.
- If tangle: add explicit user selection flow and reduce auto-match.
- If fog: cut to basic matching only.

## Oracle notes

- Pending (Oracle pass not run yet).

# Spike report — Exception to instrument matching heuristics

## Question

What matching rules minimize false matches across the target packs?

## Result

- Outcome: pending
- Decision: pending

## Proof

- Pending

## Key findings

- Pending

## Updated assumptions

- Before: pending
- After: pending

## Implications for the concept

- Patches: pending
- Cuts: pending
- Out of bounds: pending

## Follow-ups

- Update wiring diagram: pending
- Update parts list: pending
- Update fit check: pending

## Appendix

- Repro steps: pending
- Links: pending

---

# Spike plan — Survey extraction from scans

## Question

Can we extract certification parties and at least 3 callouts reliably?

## Context

- Feature / concept: Breadboard 2.4 (survey parsing).
- Related requirement(s): R2.4.1, R2.4.2, R2.4.3.
- Why now: Surveys are visual and OCR can be messy.

## Success criteria

Proof looks like:

- Extraction works on `pack_01_clean` and `pack_06_noisy_scans_rotated_page`.
- Missing certification party is flagged for `pack_03_mismatch_and_cert_gap`.

## Timebox

- Start: TBD
- Hard stop: TBD (<= 1 day)

## Scope

Include:

- Text callouts, labels, and certification blocks.

Exclude:

- Graphic interpretation of plotted easements.

## Approach

- Step 1: OCR and text extraction.
- Step 2: Identify certification block and callouts.
- Step 3: Compare against expected survey issues.

## Artefacts

Keep:

- Extraction notes and success/failure examples.

Throw away:

- Production-ready parser beyond the spike.

## Expected outcomes

- If straight shot: proceed with survey parser.
- If tangle: tighten scope to a smaller set of callouts.
- If fog: cut survey parsing from v1.

## Oracle notes

- Pending (Oracle pass not run yet).

# Spike report — Survey extraction from scans

## Question

Can we extract certification parties and at least 3 callouts reliably?

## Result

- Outcome: pending
- Decision: pending

## Proof

- Pending

## Key findings

- Pending

## Updated assumptions

- Before: pending
- After: pending

## Implications for the concept

- Patches: pending
- Cuts: pending
- Out of bounds: pending

## Follow-ups

- Update wiring diagram: pending
- Update parts list: pending
- Update fit check: pending

## Appendix

- Repro steps: pending
- Links: pending

---

# Spike plan — Reconciliation "unknown" handling

## Question

Can we keep reconciliation honest by emitting "unknown" instead of incorrect "not shown"?

## Context

- Feature / concept: Breadboard 2.5 (reconciliation).
- Related requirement(s): R2.5.1, R2.5.2, R2.5.3.
- Why now: False positives are worse than incomplete output.

## Success criteria

Proof looks like:

- When survey signal is weak, output is "unknown" not "not shown".
- Clear guidance copy for why a row is unknown.

## Timebox

- Start: TBD
- Hard stop: TBD (<= 0.5 day)

## Scope

Include:

- A small ruleset that detects weak evidence.

Exclude:

- Full semantic reasoning.

## Approach

- Step 1: Define evidence thresholds for "depicted" vs "unknown".
- Step 2: Run against sample cases.
- Step 3: Capture examples for UI copy.

## Artefacts

Keep:

- Threshold rules and example rows.

Throw away:

- Full reconciliation engine beyond the spike.

## Expected outcomes

- If straight shot: proceed with rules engine.
- If tangle: bias to "unknown" in v1.
- If fog: cut reconciliation from v1.

## Oracle notes

- Pending (Oracle pass not run yet).

# Spike report — Reconciliation "unknown" handling

## Question

Can we keep reconciliation honest by emitting "unknown" instead of incorrect "not shown"?

## Result

- Outcome: pending
- Decision: pending

## Proof

- Pending

## Key findings

- Pending

## Updated assumptions

- Before: pending
- After: pending

## Implications for the concept

- Patches: pending
- Cuts: pending
- Out of bounds: pending

## Follow-ups

- Update wiring diagram: pending
- Update parts list: pending
- Update fit check: pending

## Appendix

- Repro steps: pending
- Links: pending

---

# Spike plan — Idempotent run restarts

## Question

Can we restart runs without duplicating rows or changing stable snippet hashes?

## Context

- Feature / concept: Breadboard 2.6 (run orchestration).
- Related requirement(s): R2.6.3.
- Why now: Non-idempotent runs create duplicate or drifting data.

## Success criteria

Proof looks like:

- Restarting a run does not duplicate rows.
- Snippet hashes remain stable for unchanged inputs.

## Timebox

- Start: TBD
- Hard stop: TBD (<= 0.5 day)

## Scope

Include:

- Row upsert keyed by `question_id` + run_id.

Exclude:

- Full backfill or migration logic.

## Approach

- Step 1: Define idempotent upsert strategy.
- Step 2: Simulate run restart with identical inputs.
- Step 3: Validate no duplication.

## Artefacts

Keep:

- Upsert strategy notes.
- Example before/after row states.

Throw away:

- Production-ready code beyond the spike.

## Expected outcomes

- If straight shot: proceed with step machine design.
- If tangle: reduce to a single-run v1 with no restarts.
- If fog: cut incremental updates and run as batch.

## Oracle notes

- Pending (Oracle pass not run yet).

# Spike report — Idempotent run restarts

## Question

Can we restart runs without duplicating rows or changing stable snippet hashes?

## Result

- Outcome: pending
- Decision: pending

## Proof

- Pending

## Key findings

- Pending

## Updated assumptions

- Before: pending
- After: pending

## Implications for the concept

- Patches: pending
- Cuts: pending
- Out of bounds: pending

## Follow-ups

- Update wiring diagram: pending
- Update parts list: pending
- Update fit check: pending

## Appendix

- Repro steps: pending
- Links: pending
