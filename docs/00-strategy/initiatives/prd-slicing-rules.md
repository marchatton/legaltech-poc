# PRD slicing rules for this PoC

## Required order (breadboard -> spikes -> PRDs)
1) Brief + perimeter lock.
2) Breadboard pack (places/affordances/parts).
3) Risk register with mitigations.
4) Spikes for any rabbit holes + oracle pass.
5) Only then: slice PRDs from the breadboard parts list.

## Rules of thumb (thin PRDs)
1) One PRD delivers one user-visible affordance or one backend capability with a measurable observable effect.
2) Every PRD must map to breadboard parts (F#) and key affordances (U#/N#).
3) Each PRD must have measurable acceptance criteria tied to at least one synthetic pack.
4) Keep PRDs vertical-ish: UI + a thin API where needed, but avoid building a full platform layer unless it unlocks the next slice.
5) If a PRD introduces a new failure mode, it must also introduce the UX to surface it (no silent failures).
6) Prefer scaffold then replace: ship UI using anchors/truth first, then swap in OCR/retrieval/LLM behind the same contracts.
7) If any spikes remain open, the PRD is NO-GO and acceptance criteria should be marked TODO (do not pretend certainty).

## Examples (good slices)
- Citation chip opens viewer at cited page and overlays highlight polygon (using anchors)
- Citations API returns snippet + hash + polygons for a citation ID
- Verifier fails rows when snippet_hash mismatch is detected
- Commitment parser extracts B-I requirements list into tracker table

## Examples (bad slices)
- Build ingestion pipeline + OCR + retrieval + drafting + verification + export (too many risks bundled)
- Implement multi-agent Copilot (not PoC scope, and not deterministic)
- Add firm template customisation (non-goal)

## Red flags that a PRD is too fat
- PRD exists without a breadboard pack and risk register
- Touches 3+ major subsystems (viewer, OCR, retrieval, export) in one go
- Needs more than 1–2 new schemas
- Acceptance criteria can’t be tested against the packs
- Contains multiple hard risks (survey parsing + verification + matching all together)

## Minimum PRD structure (what every PRD should include)
- User story
- In/out scope
- Breadboard references (parts F# + affordances U#/N#)
- Acceptance criteria (pack + expected observable behaviour)
- Failure states and UX
- Metrics/logging (at least 1 signal)
- Rollback/disable path (feature flag or safe default)
