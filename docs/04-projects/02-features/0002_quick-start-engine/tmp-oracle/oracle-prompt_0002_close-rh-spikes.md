# Oracle prompt: Close RH (spikes) for Initiative 0002

You are reviewing the shaping packet for **Initiative 0002: Quick Start Engine** (Title + Survey -> 3 artefacts).

## Context
- `risk-register.md` lists RH-2.1..RH-2.19 (rabbit holes). Most are treated as **Spikes** with matching spike sections in `spike-investigation.md`.
- `spike-investigation.md` contains the spike plans + report stubs. Assume these spikes have **not** been run yet (reports are mostly empty).
- We also have a PRD spine + thin PRD slices, but the initiative is **NO-GO** until key spikes close.

## Goal
Help us **close the rabbit holes** by making each spike:
- executable (smallest pack set, smallest harness)
- measurable (crisp pass/fail against `/truth`, no “eyeballing”)
- closable (explicit closure criteria + required committed artefacts + required doc updates)

## Constraints (must follow)
- Align with `docs/03-architecture/*` and `docs/03-architecture/DECISIONS.md`:
  - evidence-first + immutable citations (ID-only references)
  - verification is fail-closed (`citation_failed` with reason code taxonomy)
  - WDK boundaries (`"use workflow"` controller, `"use step"` side effects) and deterministic `step_key`
  - report-row status invariants in `docs/03-architecture/20_state_model.md` (do **not** invent new row statuses)
- Fixture pack names are canonical from `docs/08-example-data/packs_summary.md`.
- List-shaped artefacts (B-I / B-II / issues) may have **item-level states** inside payload items, but **must not** add new report-row statuses.
- Keep everything implementable and specific. Avoid generic advice.

## What to produce
1) **Closure table**: for each RH row in `risk-register.md`, output:
   - RH id
   - spike(s) that close it (or Patch/Cut recommendation)
   - *closure criteria* (explicit checkboxes)
   - artefacts to commit (exact file paths)
   - exact doc edits required (file paths; what to change)
2) **Spike edits**: specific edits to `spike-investigation.md` to make each spike runnable:
   - smallest pack set
   - comparator rules (what fields count, what normalisation is allowed)
   - what “proof” to capture (links to diffs, screenshots, scripts, etc.)
3) **Question set v1 proposal**:
   - propose `question_set_v1.json` with `<=25` questions, built from the attached `truth/golden_questions.json` across packs
   - include stable `question_id`s, groupings, and mark which 3 questions are list-shaped artefacts
   - define a concrete `question_set_version` string format and pinning semantics (end-to-end)
4) **SP-2.7 payload representation decision**:
   - pick one option (1-4) and justify it
   - propose a minimal `list_payload_v0` schema (JSON / Zod-ish) that can represent the attached `expected_*.csv` columns
   - include 1 short example payload item for: B-I requirement, B-II exception, survey issue
5) **GO checklist**:
   - update the initiative GO/NO-GO checklist (what must be true to flip to GO and start `wf-plan`)

