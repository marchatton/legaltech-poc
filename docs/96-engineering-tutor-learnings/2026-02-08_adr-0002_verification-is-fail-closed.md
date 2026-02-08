# ADR-0002: Verification is fail-closed

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
Assumptions: you are working on Orbital's report rows pipeline and care about user trust more than "always returning something".

"Fail-closed verification" means: if we cannot prove an answer has valid evidence, we do not let it out of the system.

Why? A plausible-sounding answer with broken evidence is worse than "not found". It trains users to trust the system at the exact moment it is lying (even if accidentally).

## Metaphor/analogy (with mapping + where it breaks)
Think of export like a locked door, and verification like the key check.

If the key does not fit, the door stays locked. We do not "kind of open it anyway" because the lock looks mostly correct.

Mapping:
| Metaphor | In this system |
|---|---|
| Door | Export boundary (what users can download/share/use as output) |
| Key | Locked citation record(s) that represent evidence |
| Key check | Verification (integrity checks that evidence is still valid and consistent) |
| Key does not fit | Citation lock mismatch or verification failure |
| Door stays locked | Row status becomes `citation_failed`, and the row is non-exportable by default |

Where it breaks:
- Real doors often have a human override. Our default posture intentionally avoids casual overrides because the trust moment is the product.
- A key check is usually yes/no and simple. Verification can fail for multiple technical reasons (missing records, hash mismatch, geometry sanity issues, run/row invariants), so debugging needs good traces.

## Visual explanation (small ASCII diagram)
```text
[draft row + citation_ids]
            |
            v
[verify integrity + invariants]
     | PASS            | FAIL
     v                 v
[row status: terminal] [row.status = citation_failed]
[exportable]           [non-exportable by default]
```

## Step-by-step breakdown
1. We produce structured output as rows (each row is an answer record).
2. Rows refer to evidence via citations (by ID, not free-text quotes).
3. Verification runs before export to check the trust chain did not break.
4. If there is any citation lock mismatch or verification failure, we set `row.status = citation_failed`.
5. Rows with `citation_failed` are blocked from export by default.

Inputs:
- A drafted row (the claim/answer payload).
- Citation references (IDs pointing at locked evidence).

Outputs:
- A row status, including `citation_failed` on trust breaks.
- An export eligibility decision (exportable or blocked by default).

Constraints:
- Trust posture: it must be safer to return nothing than to ship unprovable output.
- Determinism: checks should be reproducible and debuggable ("why did it block?" is answerable).

Trade-offs:
- Reduced false trust, but more blocked outputs early.
- Forces investment in retrieval quality and citation integrity rather than polishing untrustworthy exports.

Failure modes:
- False blocks: a bug or edge case in verification blocks legitimately supported rows.
- Evidence drift: citation records or their integrity properties change unexpectedly, causing mismatches.
- UX pressure: stakeholders want "something exportable" even when evidence is broken.

Why this design vs alternatives:
- Fail-open (export anyway) creates attractive, plausible outputs with broken evidence.
- Warn-but-export warnings rarely travel with the artifact.
- Manual review only does not reliably catch silent integrity breaks, and the system still needs a default safety posture.

## Common misunderstandings
- "Fail-closed means the system crashes." No. Export is denied when trust breaks; the system should still be debuggable.
- "`citation_failed` means the answer is false." Not necessarily. It means we cannot prove it with valid locked evidence right now.
- "Verification means semantic truth checking." Not here. This ADR is about what happens when verification fails: block export by default.
- "Non-exportable means never usable." It means blocked by default; any bypass must be explicit and controlled.

## Check understanding (teach-back question)
A row has a citation lock mismatch during verification. Walk through what status the row should end up with, whether it is exportable, and why this is better than exporting with a warning.

