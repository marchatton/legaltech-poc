# List Verification Policy v1 (Initiative 0002)

This doc pins the *intended* verification semantics for list-shaped artefact rows (B-I/B-II/issues).
It should be validated and refined by SP-2.11.

Constraints:
- Fail-closed posture (ADR-0002): unsupported claims must not survive.
- Immutable locked citations (ADR-0001): once a `citation_id` exists, it is not mutated.
- Row status invariants remain unchanged (`docs/03-architecture/20_state_model.md`).

## Unit of verification

Verify at the **item + field** level:
- Any non-empty scalar field that represents a material claim must be supported by at least one locked citation for that item.
- "Display-only" fields (e.g. `notes`) may be excluded from verification.

## Partial failures (decision pending SP-2.11)

Two viable policies:

1. **Strict policy (simplest):** any failed item/field entailment => entire row becomes `citation_failed`.
2. **Repair policy (preferred if safe):** verifier is allowed to downgrade or remove unsupported fields/items (e.g. set `item_classification="unknown"`, drop `instrument_no` if unsupported) and re-verify, so the row can remain verifiable without fabricating claims.

SP-2.11 should choose one policy explicitly and record:
- what counts as a "material claim"
- how downgrades are represented in `payload_json`
- how provenance records downgrade/repair actions (safe reason codes)

## Required provenance (minimum)

When verification runs, provenance must include (safe):
- verifier model + prompt hash
- verdict (`pass|fail`)
- reason code on failure (`ENTAILMENT_FAIL`, `CITATION_MISMATCH`, etc)
- optional downgrade/repair actions taken (if policy 2 is chosen)

