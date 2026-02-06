# Spike investigation — Demo-grade outputs and repeatability

> Status: planned only. No spikes executed yet. Oracle pass pending for each spike.

## Spike plan — CSV export format usability

### Question
Is the CSV export format usable for a paralegal who needs to paste into an existing tracker?

### Context
- Feature / concept: 3.1 CSV export
- Related requirement(s): R1
- Why now: Export usability is the core promise for demo-grade outputs

### Success criteria
Proof looks like:
- A paralegal says they can paste the CSV into their tracker with minimal cleanup
- Column names and ordering are judged acceptable

### Timebox
- Start: TBD
- Hard stop: TBD (1-2 hours)

### Scope
Include:
- Sample CSVs for requirements, exceptions, and survey issues
- Citations and statuses included

Exclude:
- Any Excel formatting or template customization

### Approach
- Step 1: Generate sample CSVs from pack_01_clean
- Step 2: Hand to a practitioner for quick review
- Step 3: Capture feedback and required changes

### Artefacts
Keep:
- Feedback notes and required column changes

Throw away:
- Any prototype formatting beyond CSV

### Expected outcomes
- If straight shot: lock column schema
- If tangle: patch column map and re-test
- If fog: reduce to minimal columns required for import

---

## Spike plan — Minimal eval metrics

### Question
What minimal metrics are predictive enough for demo readiness without becoming a time sink?

### Context
- Feature / concept: 3.3 Eval harness
- Related requirement(s): R3
- Why now: Need regression safety with minimal overhead

### Success criteria
Proof looks like:
- 3 to 5 metrics correlate with a practitioner review of at least one pack
- Metrics can be computed without heavy model calls

### Timebox
- Start: TBD
- Hard stop: TBD (2-4 hours)

### Scope
Include:
- coverage, citation validity rate, missing_input correctness
- one negative test pack

Exclude:
- Complex scoring models
- Large-scale sampling

### Approach
- Step 1: Run metrics on pack_01_clean and pack_02_missing_rea
- Step 2: Compare to a quick practitioner review
- Step 3: Adjust metric set if mismatch

### Artefacts
Keep:
- Metrics table + rationale

Throw away:
- Extra metrics that do not correlate

### Expected outcomes
- If straight shot: lock metric set
- If tangle: add one targeted metric only
- If fog: reduce to coverage + citation validity only
