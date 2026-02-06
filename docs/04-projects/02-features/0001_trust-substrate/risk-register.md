# Risk register (rabbit holes)

Treatments must be one of: `Cut` / `Patch` / `Spike` / `Out-of-bounds`.

| ID | Rabbit hole | Category | Packs to prove | Treatment | Mitigation (concrete) | Status |
|---|---|---|---|---|---|---|
| RH1 | pdf.js performance on scanned/rotated PDFs (page jumps, zoom) | technical | `pack_07_scans_rotated_low_quality` | Spike | Build a minimal viewer + page-jump harness; measure render times; patch with skeletons + progressive rendering if needed. | open |
| RH2 | Highlight overlay coordinate transforms across zoom levels | technical | `pack_01_clean`, `pack_07_scans_rotated_low_quality` | Spike | Prototype bbox/polygon overlay with 50/100/150% zoom; if unstable cut to bbox-only or page-level highlight. | open |
| RH3 | Snippet normalisation + stable `snippet_hash` rule works in practice | data | `pack_01_clean` | Spike | Implement canonical `normalise()` per `docs/03-architecture/30_data_model.md`; validate stability on repeated runs with the same source snippet. | open |
| RH4 | Verification avoids false passes at acceptable latency/cost | technical | negative set across `pack_01_clean`, `pack_02_missing_rea` | Spike | Start with code checks; if entailment is required, tune for precision-first (0 false passes target) and accept more `citation_failed`. | open |
| RH5 | Missing-doc detection heuristics are reliable (low false positives) | data | `pack_02_missing_rea` vs `pack_01_clean` | Spike | Heuristics: referenced instrument IDs/filenames → docs present; patch with manual confirm UX if heuristics are noisy. | open |
| RH6 | Provenance/log volume and PII risk | security/design | all | Patch | Keep trace schema minimal, safe, and redacted by default; store opaque IDs + hashes, not raw provider payloads. | open |
| RH7 | Storage access pattern for pdf.js (signed URLs vs proxy) | dependency/security | all | Patch | Decide one contract early; prefer signed render URLs (`GET /documents/:id/render?page=N`) and avoid proxying raw PDFs through the app unless needed. | open |
| RH8 | Client/server boundary mistakes with viewer + APIs (Next.js App Router) | architecture | all | Patch | Enforce `client-only`/`server-only` boundaries; viewer is client; APIs validate with Zod and return safe error envelopes. | open |

## Notes
- Per `docs/00-strategy/initiatives/prd-slicing-rules.md`, PRDs should not be created until Spike items are closed (or explicitly Cut/Out-of-bounds).
- Oracle review is mandatory per Spike (bundle + notes captured in `spike-investigation.md`).
