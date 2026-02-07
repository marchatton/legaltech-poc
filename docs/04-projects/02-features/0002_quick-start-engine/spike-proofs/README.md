# Spike Proofs (Initiative 0002)

This folder is a workspace for spike outputs that make pass/fail measurable and reviewable.

Rules:
- Deterministic artefacts when possible (stable key ordering, stable sorting).
- No secrets, provider payload dumps, or stack traces in committed files.
- Prefer JSON for machine diffs; use Markdown for decisions and short write-ups.

Suggested naming:
- `SP-2.2A_pack_01_clean.snapshot.json`
- `SP-2.2A_pack_01_clean.diff.json`
- `SP-2.6_idempotency_pack_01.json`

