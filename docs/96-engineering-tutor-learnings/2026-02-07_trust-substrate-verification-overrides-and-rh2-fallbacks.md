# Trust Substrate: Verification vs Entailment, Unsafe Overrides, RH2 Regression + Fallbacks

Date: 2026-02-07

Context
- Dossier: `docs/04-projects/02-features/0001_trust-substrate/`
- Canonical ADRs: `docs/03-architecture/DECISIONS.md` (ADR-0001..0016 accepted)
- API contract: `docs/03-architecture/50_api_surface.md`

## Verification v1: "Integrity checks" vs "Semantic checks"

Two different things often get conflated:

1) Integrity / invariants (deterministic, code-enforced)
- Goal: prove the evidence objects we show are real, immutable, and internally consistent.
- Examples:
  - `snippet_hash` matches the canonical-normalised `snippet` (stable hashing rules).
  - `citation_id` exists; `document_id` + `page_number` exist.
  - geometry/polygons are within page bounds; page_number is valid.
  - row status/export invariants hold (fail-closed, no "best effort" export).

2) Semantic entailment (probabilistic, model-enforced)
- Goal: prove the *answer* is actually supported by the evidence.
- This needs a model step ("Does this snippet entail this claim? yes/no/unclear") and a quality gate.
- It can catch "valid citation attached to wrong interpretation", but it introduces false positives/negatives, cost/latency, and a new eval surface.

PoC-friendly stance
- Start with integrity/invariants as the hard gate (ADR-0002 fail-closed).
- Add entailment later only if we can fixture-eval it and trust it.

## Unsafe export override

Why it exists
- Export is a trust boundary: if evidence cannot be verified (eg `citation_failed`), the default should block export (`EXPORT_BLOCKED`).
- A demo sometimes needs "show the shape" even when the run is intentionally broken (fixture failure journeys).

Safer policy
- If we support any override, make it:
  - explicit (caller sets `unsafe_override=true`)
  - restricted (demo/admin-only mode)
  - loudly labelled in the artefact metadata and UI
  - observable (logs/metrics)

## RH2 regression evidence capture (highlight overlay)

What we are trying to "prove"
- A locked citation's geometry is rendered in the viewer in a way that matches the PDF content.
- The mapping stays correct across zoom/rotation and for scan-heavy packs (eg `pack_07_scans_rotated_low_quality`).

Two ways to capture regression evidence
1) Manual (fast to start)
- Fixed checklist of "states" to capture (page, zoom, rotation, viewport size).
- Screenshots + bbox logs (polygons in each coordinate space).
- Stored as spike proofs; used as human-audited regression baseline.

2) Automated harness (more work, more repeatable)
- Browser automation opens the viewer, clicks citation chips, sets zoom/rotation, and captures screenshots.
- Optional: pixel diffs or assertions (eg highlight bbox intersects expected anchor region).
- Better for CI gating later, but heavier upfront.

## RH2 fallbacks when overlay alignment is unreliable

Option A) "Verified at 100% zoom only"
- Only render the overlay at a single canonical zoom where we know mapping is correct.
- At other zooms, hide overlay and show an honest message.

Option B) "Evidence crop card"
- Render a stable canonical view offscreen and crop the cited region.
- Show the cropped image + snippet/hash as the primary "trust moment", with the page jump for context.

Trade-offs
- 100%-only is simpler but more UX friction.
- Crop-card is more implementation work but can be more reliable than a live overlay.

## Open choices to resolve in the PRDs
- Verification v1: integrity-only gate vs add entailment model now.
- Unsafe override: none vs API-only demo mode vs UI affordance.
- RH2 evidence capture: manual vs automated harness.
- RH2 fallback: 100%-only vs crop-card.
