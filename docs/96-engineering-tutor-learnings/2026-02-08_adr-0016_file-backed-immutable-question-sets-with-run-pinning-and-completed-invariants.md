# ADR-0016: File-backed, immutable question sets with run pinning and completed invariants

Status: accepted  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
A run should be replayable and comparable later. That only works if we can answer: "What exact questions did this run use?"

So we treat question sets like versioned fixtures:
- Question sets live as JSON files in the repo.
- Each version is immutable. If you change the questions, you create a new version file.
- When a run is created, it pins a specific `question_set_version` and that pointer never changes.

Then we make "completed" unambiguous by enforcing invariants:
- A run can only become `completed` if it has exactly one `report_rows` per `question_id` in the pinned set.
- Every `report_rows.status` must be terminal (`needs_review|reviewed|missing_input|citation_failed`).
- Any mismatch fails closed with `INVARIANT_FAIL`.

## Metaphor/analogy (with mapping + where it breaks)
Think "exam booklet editions".

Mapping:
- Question set JSON version file: a specific printed exam booklet edition.
- `question_set_id`: the exam name.
- `question_set_version`: the edition code printed on the cover.
- `question_id`: question numbers that never change within that edition.
- Run: one student sitting that specific edition.
- `runs.question_set_version`: the edition code recorded when the student starts.
- `report_rows`: the student's answer sheet, one answer per question number.
- Terminal `status`: the answer is in a final state (graded, flagged, failed for a known reason).
- Completed invariants: the proctor's checklist that every question has exactly one final answer recorded.

Where the metaphor breaks: real exams allow missing answers without "failing the sitting". Here, missing/extra/duplicate rows are treated as a trust break and we fail closed because determinism and stable truth comparisons matter more than best-effort completion in v1.

## Visual explanation (small ASCII diagram)
```text
Repo (source of truth, code reviewed)
  qs files (immutable):
    packages/core/question-sets/<id>/qs_<version>.json

Run creation (server selects version for run type)
          |
          v
DB: runs
  id
  question_set_version = "qs:<id>:vN"  (pinned, immutable)

          |
          v
DB: report_rows (derived from pinned questions)
  run_id
  question_id
  status (terminal required to complete)

          |
          v
Completion gate
  if 1 row per question_id AND all statuses terminal -> runs.state = completed
  else -> fail closed: INVARIANT_FAIL
```

## Step-by-step breakdown
1. Create or update a question set by adding a new version file.
Output: a new immutable JSON file in `packages/core/question-sets/<question_set_id>/qs_<version>.json`.
Constraint: do not edit an existing version file. If you need changes, create a new version.

2. Use stable identifiers inside the file.
Required fields: `question_set_id`, `question_set_version`, `created_at`, `questions[]`.
Each question includes a stable `question_id` and the `question` string.
Optional fields: `artefact_kind`, `row_schema_id`.

3. Pin the version at run creation.
Output: `runs.question_set_version` is persisted once.
Constraint: `runs.question_set_version` MUST NOT change after creation.

4. Generate output rows keyed by `question_id`.
Constraint: exactly one `report_rows` per `question_id` in the pinned set.

5. Enforce the completed invariants.
A run can enter `runs.state = completed` only when:
- For the pinned `question_set_version`, there is exactly one `report_rows` per `question_id`.
- Every `report_rows.status` is terminal (`needs_review|reviewed|missing_input|citation_failed`).

Any mismatch (missing question IDs, extra rows, duplicate rows, non-terminal statuses) is a fail-closed run failure: `INVARIANT_FAIL`.

Trade-offs:
- Pro: deterministic replay. "What questions did we run?" is answerable from the run record.
- Pro: fixtures and eval truth files stabilize against explicit `question_id`s.
- Con: no UI-editable question sets in v1 (intentional).

Why this design vs alternatives:
- DB-backed, UI-editable question sets allow in-place edits that cause drift and make "completed" ambiguous.
- DB-backed immutable versions could work, but git already gives history/review/diffs for v1.
- Copying full question lists onto each run duplicates data and still requires stable IDs and invariants.

## Common misunderstandings
- "Completed means everything is reviewed." `needs_review` is terminal. Completion means the workflow finished producing final row states.
- "We can edit an old version file if it is wrong." No. Create a new version file.
- "We can update `runs.question_set_version` to the latest after deploy." No. That breaks replay determinism.
- "Extra rows are fine, we can ignore them." No. Extra/duplicate rows are invariant violations and must fail closed.
- "`question_id` can be generated ad hoc." It must be stable so fixtures and eval truth comparisons keep working.

## Check understanding (teach-back question)
A run is created with `runs.question_set_version = "qs:quick_start_title_survey:v1"`. Later you add a new file for v2 with one extra question. Explain which questions the original run uses on replay, what conditions must be true in `report_rows` before the run can become `completed`, and what the system should do if it finds two rows with the same `question_id`.

