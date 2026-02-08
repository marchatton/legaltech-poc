# ADR-0007: No external web research inside PoC runs

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
A PoC run is only persuasive if someone can audit it end to end and see that every claim came from the diligence pack they provided. If the agent can browse the web mid-run, the answer might be "right", but you can no longer prove where it came from, whether it was current, or whether it was safe to use.

Think of a PoC run as a closed-world reasoning loop:
- Inputs: user question, uploaded diligence pack (the only evidence base).
- Outputs: answer grounded in that pack (with citations), or `missing_input` when the pack does not contain the needed facts.
- Core constraint: retrieval and reasoning must use only the uploaded pack. No external web research inside the run.

Trade-off summary:
- You give up breadth (the web) to gain provenance, reproducibility, and a simpler security posture.
- Some questions will correctly fail with `missing_input` instead of being guessed.

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: a courtroom argument where only admitted evidence is allowed.

Mapping:
- Uploaded pack: admitted evidence (the record).
- PoC run: the argument being made in court.
- Citations: exhibit labels that point to the record.
- External web research: unadmitted evidence/hearsay introduced mid-trial.
- `missing_input`: "we cannot answer without additional evidence; please provide X".

Where it breaks:
- Real courts can admit new evidence via process; PoC runs intentionally do not, because quick start needs tight provenance.
- A model still has prior knowledge; the rule is not "forget everything", it is "do not introduce new factual claims that are not supported by the pack".

## Visual explanation (small ASCII diagram)
```text
[User question]
      |
      v
+-----------------------+
| PoC run (no web)      |
| retrieve + reason     |
+-----------------------+
   |                \
   | uses             \ blocked
   v                  v
[Uploaded pack]    [External web]
   |
   v
[Answer + citations]
or
[`missing_input` + request for needed docs]
```

## Step-by-step breakdown
1. Ingest the uploaded diligence pack and treat it as the only allowed knowledge base for the run.
2. Build retrieval over the pack (search/vector/keyword) so questions can be answered by pulling relevant passages.
3. For a question, retrieve the best matching passages from the pack.
4. Reason using only those passages plus general logic (definitions, arithmetic, structuring), not new outside facts.
5. Produce an answer with explicit citations back into the pack so an auditor can trace every key claim.
6. If the pack does not contain what is required, return `missing_input` and specify exactly what document/section/data would unblock the answer.

Failure modes to watch for:
- Accidental web access contaminates provenance.
- "Model prior" leakage fills gaps with remembered facts that are not in the pack.
- Silent incompleteness answers anyway instead of emitting `missing_input`.
- Prompt injection via web. Pack-only reduces this attack surface.

Why this design vs alternatives:
- Allow live web research and "just cite URLs": content changes, sources are unvetted, and provenance is fragile.
- Allowlist a few domains: still changes over time, adds attack surface, and complicates the posture.
- Pack-only inside PoC runs with `missing_input` for gaps keeps the run defensible.

## Common misunderstandings
- "No web research means the system is less useful." Sometimes less broad, but more trustworthy because every claim is traceable to provided materials.
- "If the model already knows it, it is fine to say it." Not for PoC claims. If the pack does not support it, it should be `missing_input` (or framed as a non-factual suggestion).
- "We can browse in the background as long as we do not quote it." That still contaminates reasoning and breaks the audit trail.
- "`missing_input` is a failure." It is a correct output that protects the user from fabricated or untraceable answers.

## Check understanding (teach-back question)
If a user asks, "What is the market share of Vendor X in 2025?" and the uploaded pack does not include that data, what should the PoC run output, and what specific follow-up input should it request?

