# ADR-0005: Deterministic-ish orchestration via Workflow DevKit steps

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
We want Quick Start to feel like a reliable pipeline, not a wandering agent.

Instead of letting an "agent loop" decide what to do next, we run a fixed sequence of workflow steps: `retrieve -> draft -> lock -> verify -> write`. Each step has a clear boundary for side effects (DB writes, API calls, etc). That makes it easier to resume, retry, and show progress one row at a time.

Assumptions (so this stays short): you already know what Quick Start does at a high level, and you care about resumability, retries, and observability more than "maximum agent autonomy".

Simplification: this explainer focuses on the behavior and contracts of steps, not the exact WDK API surface.

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: an assembly line with quality checkpoints.

Mapping:
- Workflow: the conveyor belt and schedule.
- Step: a station with a specific job.
- Inputs: the parts that arrive at a station (pack, questions, chunk IDs, draft rows).
- Outputs: the labeled parts leaving the station (chunk IDs, draft rows, locked citation IDs, verified statuses, final report).
- "use workflow" / "use step" directives: the rule that work only happens at stations, not in the hallway. This is how you spot and contain side effects.

Where it breaks:
- Real assembly lines can be deterministic. Here, `draft` can involve LLM calls and other non-deterministic dependencies, so outputs can vary.
- Retries are normal in software, so we must design stations to be idempotent or safely repeatable.

## Visual explanation (small ASCII diagram)
```text
Inputs (pack + questions)
        |
        v
  [retrieve]  -> chunk_ids
        |
        v
   [draft]    -> rows + candidate_chunk_ids
        |
        v
    [lock]    -> citation_ids (immutable)
        |
        v
   [verify]   -> per-row status (ok | citation_failed | missing_input | error)
        |
        v
   [write]    -> persisted report/export + progress
```

## Step-by-step breakdown
1. Retrieve
Inputs: uploaded pack content (already ingested) and the question/schema for each row.
Outputs: chunk IDs (with scores) that downstream steps can refer to by ID.
Side-effect boundary: reads from the index/storage; should not mutate report state except recording "what was retrieved" for observability.

2. Draft
Inputs: chunk IDs plus the row prompt/schema.
Outputs: a structured draft per row, including candidate citation references (still chunk IDs).
Side-effect boundary: external model calls live here (and are the main source of non-determinism).
Constraint: drafts must be shaped so later steps can lock and verify without free-text guessing.

3. Lock
Inputs: draft rows and their candidate chunk IDs (and any geometry/snippets needed by your citation system).
Outputs: immutable citation records and stable `citation_id` references attached to rows.
Side-effect boundary: durable writes to the database (or whatever store is the source of truth).
Failure mode to avoid: creating duplicate locks on retry. Mitigation: idempotency keys and unique constraints so lock is safe to repeat.

4. Verify
Inputs: rows + locked `citation_id`s.
Outputs: per-row verification results, fail-closed when evidence does not match (e.g. `citation_failed`).
Side-effect boundary: may read citation store and compute hashes; should write only explicit verification results.

5. Write
Inputs: verified rows and workflow progress.
Outputs: persisted final report/export and any downstream artifacts.
Side-effect boundary: final durable writes and exports, done after verification so incomplete evidence does not leak.

Constraints (the non-negotiables this ADR is optimizing for):
- Resumability: continue after crashes without restarting the whole run.
- Retries: steps will re-run, so side effects must be isolated and safe to repeat.
- Row-by-row progress: show partial completion and support per-row failure states.
- Predictability: orchestration is a known path, not open-ended tool use.

Trade-offs:
- More upfront structure and boilerplate (step contracts and data shapes).
- Less flexibility than agent loops (intentionally constrained behavior).
- "Deterministic-ish", not deterministic: the workflow path is fixed, but some step outputs can still vary.

Failure modes:
- Duplicate side effects on retry (double-lock, double-write, duplicate exports).
- Partial progress not visible (if work happens outside steps, you lose resumability and observability).
- Hidden coupling to WDK (if domain logic lives inside workflow glue, it becomes hard to test and reuse).
- Step contract drift (downstream silently mis-handles rows unless validated).

Why this design vs alternatives:
- Agent loops blur side effects across the loop body and are harder to resume and debug.
- A single monolithic job makes retries and partial progress painful.
- Ad hoc queue workers can work, but WDK gives a clear step model while keeping domain logic in `packages/core`.

## Common misunderstandings
- "Deterministic-ish means outputs are the same every run." The goal is deterministic orchestration and repeatable side effects, not identical LLM text.
- "Retries are free." Retries are only safe if each step is idempotent or guarded by unique constraints and idempotency keys.
- "We can just do a tiny DB write in the middle of draft." That is how you lose clear replay semantics and make failures hard to diagnose.
- "WDK owns the business logic." The ADR prefers thin WDK integration; domain logic lives in `packages/core`.

## Check understanding (teach-back question)
If `lock` succeeds, `verify` fails, and the workflow retries from a crash, what must be true about your `lock` and `write` steps so you do not create duplicates or leak unverified output, and where would you record row-by-row progress so a UI can show what happened?

