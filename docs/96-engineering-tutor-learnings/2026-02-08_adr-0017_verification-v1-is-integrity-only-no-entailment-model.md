# ADR-0017: Verification v1 is integrity-only (no entailment model)

Status: accepted  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
In v1, "verification" means: can we prove the output is wired to the exact evidence we locked, and that the run is internally consistent? It does not mean: does the evidence actually prove the claim?

This is a deliberate scope cut. We want verification to be deterministic, cheap, and debuggable so we can safely fail closed on trust breaks. Semantic verification (an entailment model that judges whether evidence supports a claim) is postponed because it adds a probabilistic failure surface without fixture-eval confidence.

## Metaphor/analogy (with mapping + where it breaks)
Think of verification v1 like checking citations in an academic paper with a librarian's checklist.

Mapping:
- Citation lock integrity: every footnote points to a real source, and the archived excerpt matches what was cited.
- Geometry sanity: the highlighted passage is actually on that page and the highlight bounds make sense.
- Row/run invariants for export gating: there is exactly one answer per required question and all sections are in a final state.
- An entailment model would be asking a subject-matter expert: "Given this passage, does it truly support the conclusion?"

Where it breaks:
- A perfectly valid citation can still be used to make a wrong inference. Integrity checks cannot catch "valid evidence, wrong interpretation".
- Some claims require synthesis across passages. Integrity-only verification cannot judge whether the synthesis is logically justified.
- Geometry and hashes can be correct even when evidence is incomplete or cherry-picked.

## Visual explanation (small ASCII diagram)
```text
           Inputs
  report_rows (claims + citation_id refs)
  citations (locked snippet + snippet_hash + geometry)
  document_pages (page identity + bounds)

                 |
                 v
        +-------------------+
        | Integrity Verifier|
        | (deterministic)   |
        +-------------------+
          |             |
          | PASS        | FAIL (any mismatch)
          v             v
    exportable      citation_failed
   (by default)     (fail closed)

   (No entailment / NLI model in v1)
```

## Step-by-step breakdown
Inputs:
- `report_rows` that reference locked `citation_id`s.
- `citations` records that store immutable evidence (`snippet`, `snippet_hash`, `geometry`).
- Page/layout data needed to validate geometry and page identity.

Outputs:
- A pass/fail result for verification that gates export.
- On failure, rows are marked `citation_failed` and are non-exportable by default.

What verification v1 checks:
1. Citation lock integrity.
2. Geometry sanity (page bounds, normalized polygon ranges, correct page identity).
3. Row/run invariants required for export gating.

Constraints (what we are optimizing for):
- Deterministic behavior: same inputs yield the same verification result.
- Cheap to run.
- Clear debug paths: failures point to a concrete mismatch.
- Fail-closed posture: if trust cannot be established, block export rather than guessing.

Trade-offs:
- Pro: predictable, fast checks with clear debug stories.
- Pro: fewer moving parts early reduces silent trust regressions.
- Con: does not catch semantic errors ("evidence exists, but the claim is not supported").
- Con: human review remains the semantic backstop until entailment is introduced.

Failure modes:
- False confidence: verification passes, but the row is still wrong due to misinterpretation.
- Over-blocking due to data drift: hashes/geometry no longer match after upstream processing changes.
- Highlight/render issues: invalid geometry breaks evidence display and blocks exports.

Why this design vs alternatives:
- Adding an entailment model now expands the failure surface (false blocks and false passes) and makes debugging harder without fixture-eval measurement.
- If entailment is added later, it must be fixture-eval'd and introduced behind explicit gates.

## Common misunderstandings
- "If verification passes, the claim is true." Verification v1 asserts integrity/invariants, not semantic correctness.
- "Integrity-only verification is pointless." It enforces a hard baseline: outputs cannot claim evidence they cannot prove they used.
- "We will never use entailment." The decision is "not in v1"; it can be added later with eval coverage.

## Check understanding (teach-back question)
Explain the difference between integrity verification and entailment verification, then give one concrete example of an error that integrity verification would catch and one that it would not catch.

