# Brief: 0010 CiteCapsules (Tamper-Evident Evidence Cards)

- Dossier: `docs/04-projects/02-features/0010_cite-capsules/`
- Status: Draft
- Appetite: 2-3 days (PoC slice)
- Owner:

## Context (why this, why now)
Orbital's PoC proves the "trust moment" inside the app: click a citation chip and see the highlighted clause with a locked `snippet_hash`. But real diligence work leaks out of any single UI: partners want an email, a memo, a spreadsheet, a screenshot.

Today, when users copy evidence out of the app, they lose provenance and tamper-evidence. A screenshot can be edited. A quote can be misattributed. A link can break. CiteCapsules make the trust substrate portable.

## Problem
We have trustworthy citations, but we don't have a trustworthy *sharing primitive* for evidence. Users need to share the minimum necessary evidence while preserving:
- what was claimed (`snippet`)
- that the claim hasn't drifted (`snippet_hash`)
- where it came from (doc/page/polygons)
- that the shared artifact itself wasn't altered (`image_hash`, optional signature)

## Goals (what "wow" looks like)
- From the PDF viewer, a user can export a **CiteCapsule** for a citation:
  - a tightly-cropped PNG of the highlighted region
  - a small JSON receipt with the citation metadata + hashes
- A `/capsules/verify` page can validate a capsule (drag-drop files) and show VERIFIED / FAILED.
- Exports are **disabled by default** unless the citation verifies (fail closed).
- Privacy posture: export only the crop, not the full PDF; no padding by default.

## Non-goals (explicit cuts)
- Not a full chain-of-custody system (no user identities, notarization, or audit logs in v1).
- Not a general-purpose PDF redaction tool.
- Not an "unsafe export" by default. Any unsafe override (if needed) must follow existing demo-only, admin-gated patterns.

## Perimeter lock (in scope)
Thin slice (2-3 days):
- Viewer affordance: `Export CiteCapsule` button when highlight is verified.
- Capsule format v1 (stable schema, Zod-validated):
  - `citation_id`, `document_id`, `page_number`, `polygons`, `snippet`, `snippet_hash`
  - `image_hash` (sha256 of PNG bytes)
  - rendering metadata required for determinism (`dpr`, `rotation`, `zoom=100%`, bbox)
- Client-side crop generation:
  - crop from the rendered pdf.js canvas in device-pixel space
  - compute hashes via `crypto.subtle.digest`
- Verification UI route:
  - recompute hashes, compare, show PASS/FAIL, and render the crop only when verified

## Explicit out of scope (for this slice)
- Persisting capsules as server-side artefacts (OK as a follow-on to integrate with existing export/object store).
- Server signing (Ed25519/HMAC). Optional stretch: add a "signed capsule" mode stored as an artefact.
- Bundling multiple capsules into a packet (future).

## Demo script (panel-friendly)
1. Open `pack_01_clean`, click any verified citation to highlight.
2. Click `Export CiteCapsule` and download `cit_<id>.png` + `cit_<id>.json`.
3. Open `/capsules/verify`, drag-drop both files: see **VERIFIED** and the crop.
4. Edit the PNG (1 pixel) or change JSON `snippet`: verify again and see **FAILED**.
5. Open `pack_09_bad_citation` (or a known `citation_failed` row): export button is disabled (fail closed).

## Acceptance signals (fixture-driven)
- `pack_01_clean`: exported capsule verifies; tampering fails deterministically.
- `pack_09_bad_citation`: cannot export a capsule for an invalid citation.
- `pack_07_scans_rotated_low_quality`: capsule export works at 100% zoom (or fails closed with an explicit reason).

## Constraints / guardrails
- Must preserve evidence-first posture and fail-closed verification. See `docs/03-architecture/DECISIONS.md`.
- Highlight overlay posture: verified at 100% zoom only in PoC v1 (ADR-0020). Capsule export must align with that constraint.
- No leaking internal errors/details to clients (safe error envelope). See `packages/core/src/safe-error.ts` and `docs/03-architecture/50_api_surface.md`.

## Geometry constraint (explicit)
Meaningful CiteCapsules require geometry-backed citations (polygons smaller than a full page) to produce a tightly cropped, privacy-preserving PNG.

Until OCR/layout geometry is implemented for real uploads (`document_pages.layout_json.has_geometry=true`):
- v0 CiteCapsules should be treated as **fixture-only** (where we already have meaningful polygons).
- For real uploaded documents, defer CiteCapsules rather than shipping full-page crops (too leaky, too noisy).

## Top risks / unknowns (treatments)
- Crop drift across rotation/dpr: lock export to 100% zoom; include render metadata; crop in device pixels. (Patch.)
- Privacy leakage (nearby text in crop): tight bbox + no padding by default; show preview before export. (Patch.)
- "Unsigned" capsules can be forged by recomputing hashes: label as UNSIGNED in v1; optional server-signed artefact as a follow-on if needed for the story. (Patch later.)

## Open questions
- Do we want a server-signed mode in the PoC (adds wow, adds scope)? If yes, what key management posture is acceptable for demo?
- Should capsules be stored as artefacts (share via signed URL), or remain download-only in v1?

## Shaping decision (GO/NO-GO)
- GO when capsules are deterministic, verifiable, and fail closed on invalid citations without adding meaningful risk to the trust posture.
- NO-GO if cropping proves unreliable on fixture packs or if the capsule format cannot be made stable and safe.
