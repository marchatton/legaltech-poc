# RH-2.16 Cut Note (Human-in-the-Loop Disambiguation)

Decision (v1 cut):
- Initiative 0002 does not include a user flow that persists "choose correct doc" / ambiguity resolution.
- The UI may show candidates when an exception match is ambiguous, but the row remains `needs_review` with guidance.

Rationale:
- Persisted user selection implies either mutating immutable citations or defining a re-run mechanism (new run or targeted re-run) with re-verification.
- That run semantics and UX are out of scope for v1 and are easy to get wrong.

Deferred follow-up (optional later spike):
- Define an explicit mechanism for user resolution that does not mutate existing citations, e.g.:
  - create a new run (repair run) that re-drafts + locks + verifies for a single `question_id`, or
  - re-run a single question as a workflow step with a new row revision.

Refs:
- `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` RH-2.16
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` (ambiguity UI shows candidates; no selection in v1)

