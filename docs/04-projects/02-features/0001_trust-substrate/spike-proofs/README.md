# Spike Proofs (Initiative 0001)

This folder is a workspace for spike outputs that make pass/fail measurable and reviewable.

Rules:
- Deterministic artefacts when possible (stable key ordering, stable sorting).
- No secrets, provider payload dumps, or stack traces in committed files.
- Prefer JSON for machine diffs; use Markdown for decisions and short write-ups.

Suggested naming:
- `RH1_pdfjs_perf_pack_07_100_serial.json`
- `RH1_pdfjs_perf_pack_07_100_spam.json`
- `RH2_overlay_pack_01_zoom_50.png`
- `RH2_overlay_pack_01_zoom_100.png`
- `RH2_overlay_pack_01_zoom_150.png`
- `RH2_overlay_fail_closed_wrong_page.png`
- `RH3_snippet_hash_stability_pack_01.json`
- `RH4_verification_negative_set_results.json`
- `RH5_missing_doc_heuristics_pack_01_02.json`
