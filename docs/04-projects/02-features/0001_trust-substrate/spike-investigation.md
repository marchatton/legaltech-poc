# Spike investigation — Trust substrate

> Status: planned only. No spikes executed yet.
> Oracle pass: RH2 highlight overlay reviewed (2026-02-06). See `tmp-oracle/oracle_response_0001.md`.
> Proof artefacts: commit under `spike-proofs/` and link them from the report stubs at the end of this doc.

## Spike plan — PDF viewer performance on noisy scans

### Question
Can pdf.js render and page-jump on scanned/rotated PDFs (e.g. `docs/08-example-data/pack_07_scans_rotated_low_quality/docs/TitleCommitment_SCANNED_ROTATED.pdf`) without UI freezing?

### Context
- Feature / concept: 1.1 Matter + document viewer baseline
- Related requirement(s): R1
- Why now: baseline UX depends on acceptable navigation performance

### Success criteria
Proof looks like:
- PDFs are served with Range support (`Accept-Ranges: bytes` + `206 Partial Content`). Without this, pdf.js perf numbers are invalid.
- Define `totalMs` as: time from "request page N" to `renderTask.promise` resolve (exclude initial PDF load).
- Serial test (N=20, 100% zoom): `p95(totalMs) < 1000ms` and `max(totalMs) < 1500ms`.
- Spam test (N=30 @ 200ms): viewer remains responsive (no visible freezes; max long task < 250ms) and final requested page completes < 1500ms after its request timestamp.

### Timebox
- Start: TBD
- Hard stop: TBD (2–4 hours)

### Scope
Include:
- Minimal viewer page with pdf.js rendering
- Programmatic page-jump test harness

Exclude:
- Highlight overlays, citations, verification

### Approach
- Step 1: Load the scanned PDF in a minimal viewer page
- Step 2: Implement page-jump control + measure render times
- Step 3: Record timing + responsiveness results

### Artefacts
Keep:
- Notes + timing table
- Minimal viewer branch or snippet

Throw away:
- Any UI polish beyond functional test

### Expected outcomes
- If straight shot: proceed with pdf.js viewer baseline
- If tangle: patch by limiting max page size or adding loading skeletons
- If fog: consider alternative viewer or async render strategy

---

## Spike plan — Highlight overlay transform across zoom

### Question
Can we map anchor geometry to the viewer viewport correctly at 50%, 100%, and 150% zoom?

### Context
- Feature / concept: 1.2 Citation chips -> click-to-highlight
- Related requirement(s): R2
- Why now: highlight alignment is core trust affordance

### Success criteria
Proof looks like:
- Highlight aligns on at least one commitment PDF and one survey PDF
- Alignment remains correct at 50%, 100%, 150% zoom

### Timebox
- Start: TBD
- Hard stop: TBD (4–6 hours)

### Scope
Include:
- One PDF with anchors
- Overlay renderer with bbox/polygon support

Exclude:
- Citation chips UI and data model

### Key decisions (pre-spike)
- Canonical polygon spec (fixtures + locked citations): normalised page coordinates in `[0..1]`, origin top-left, relative to the unrotated page `viewBox`.
- Mapping: normalised -> PDF points via `viewBox` -> viewport CSS pixels via `viewport.convertToViewportPoint()`. Overlay is rendered in `viewport.width/height` CSS pixels (never canvas backing store pixels).
- Fail-closed: if any invariants break (doc mismatch, page out of range, invalid polygons, render URL missing), do not draw a “best effort” highlight.

### Approach (fixture-backed mini-eval)
1. Build a dev-only spike harness route:
   - `app/(app)/__spikes/rh2-overlay/page.tsx`
   - Controls: pack selector (`pack_01_clean`, `pack_07_scans_rotated_low_quality`), doc selector, page number (1-indexed), anchor id, zoom 50/100/150, rotation 0/90/180/270.
   - Debug HUD: pack/doc/page/anchor, `scale`, `totalRotation`, `viewport.width/height`, `canvas.width/height` and CSS size, `devicePixelRatio`.

2. Implement the pure mapping util (unit-testable):
   - `xPdf = xMin + xNorm * (xMax - xMin)`
   - `yPdf = yMax - yNorm * (yMax - yMin)` (top-left normalised -> bottom-left PDF)
   - `[xCss, yCss] = viewport.convertToViewportPoint(xPdf, yPdf)`

3. Prove alignment at 100% (pack_01):
   - One commitment page anchor + one survey anchor.
   - Evidence: screenshot at 100% with HUD visible.

4. Prove zoom invariance (50/100/150):
   - For each case: screenshot at 50/100/150 with HUD visible.
   - Compute overlay bbox (min/max x/y in CSS px) and assert:
     - `bbox50 ~= bbox100 * 0.5` (within ~1–2 CSS px)
     - `bbox150 ~= bbox100 * 1.5` (within ~1–2 CSS px)

5. Prove rotation correctness (pack_07):
   - Ensure page-intrinsic rotation (`page.rotate`) and user rotation are handled consistently.
   - Evidence: screenshots at rotation=0 and rotation=90 (or whatever reproduces the pack_07 orientation).

6. Prove fail-closed:
   - Inject one deliberate bad anchor (out of `[0..1]`) and one wrong page number.
   - Evidence: screenshot of explicit failure UI + logged safe error code.

### Artefacts
Keep:
- Screenshots (50/100/150 + rotation + fail-closed) with HUD visible.
- A small JSON log dump (bbox numbers + HUD values).
- Notes on pitfalls encountered (DPR, rotation, `viewBox` origin, CSS transforms).

Throw away:
- Full citation UI integration

### Evidence capture tooling (options)
- Manual: Chrome DevTools node screenshots (fastest).
- Automated: Playwright (preferred if already wired in repo).
- `browser-use` (CLI, persistent session): good for scripted screenshots with a stable open->state->click/input loop.
  - Workflow: `open` -> `state` -> act by index -> `screenshot` -> re-`state` after any navigation/submit.
  - Sessions: use `--session rh2` so the browser persists across commands.
  - Example (headful):
    ```bash
    browser-use --session rh2 --browser chromium --headed open http://localhost:3000/__spikes/rh2-overlay
    browser-use --session rh2 state
    browser-use --session rh2 screenshot
    ```
  - If `browser-use` is not available locally, follow `.agents/skills/00-utilities/browser-use/SKILL.md` (uvx one-off vs permanent install).
- `agent-browser` (CLI): good for scripted screenshots if installable (snapshot + `@e1` refs). Requires npm install + a Chromium download; can also point at a system Chrome via an executable-path setting. Note: `agent-browser` is not currently installed and npm registry access may be blocked in this environment.

### Expected outcomes
- If straight shot: proceed with overlay layer
- If tangle: cut to “highlight verified at 100% zoom only” (lock zoom while citation is active)
- If fog: patch to “evidence crop card” (render-and-crop bbox instead of live overlay alignment)

### Oracle pass
- Bundle: `tmp-oracle/oracle-bundle_0001_trust-substrate_RH2_highlight-overlay.md`
- Response: `tmp-oracle/oracle_response_0001.md` (coordinate spaces + mapping + spike plan + pitfalls + fallbacks)

---

## Spike plan — Canonical snippet + hash stability

### Question
Does the canonical `normalise()` rule for `snippet_hash` (defined in `docs/03-architecture/30_data_model.md`) produce stable hashes for citations in practice?

### Context
- Feature / concept: 1.3 Citation data model + API
- Related requirement(s): R3
- Why now: hash stability is required for verification and idempotency

### Success criteria
Proof looks like:
- Hash remains stable across two reprocessing runs
- Snippet is human-readable and matches displayed text

### Timebox
- Start: TBD
- Hard stop: TBD (2–4 hours)

### Scope
Include:
- Two PDFs with known snippets
- Implement canonical normalisation once and reuse it everywhere

Exclude:
- LLM verification

### Approach
- Step 1: Extract candidate snippets + normalize
- Step 2: Compute hashes across runs
- Step 3: Compare stability and human readability

### Artefacts
Keep:
- Normalization rules
- Hash stability table

Throw away:
- Any full ingestion pipeline work

### Expected outcomes
- If straight shot: codify normalization + hash util
- If tangle: patch by pinning to anchor_id + snippet_hash (keep both), or by storing chunk_id + index_version as the authoritative reference
- If fog: restrict to anchor JSON only

---

## Spike plan — Verification precision (false passes)

### Question
Can we achieve zero false passes on 20 hand-curated bad examples at acceptable latency?

### Context
- Feature / concept: 1.4 Verification gate
- Related requirement(s): R4
- Why now: trust depends on fail-closed verification

### Success criteria
Proof looks like:
- 0 false passes on curated bad set (N>=20). `UNSURE` counts as `FAIL` (precision-first).
- Latency budget: `p95 <= 8s` per row on dev machine (record p50/p95/max).
- Dataset location: `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json`

### Timebox
- Start: TBD
- Hard stop: TBD (1–2 days)

### Scope
Include:
- Small curated dataset across packs
- One verification prompt + rubric

Exclude:
- Full UI integration

### Approach
- Step 1: Build curated set (good vs bad)
- Step 2: Run verifier and record outcomes
- Step 3: Adjust rubric/prompt for precision

### Artefacts
Keep:
- Curated dataset list
- Prompt + rubric
- Results summary

Throw away:
- Any production infrastructure

### Expected outcomes
- If straight shot: proceed with verifier + gate
- If tangle: patch to stricter heuristic checks before LLM
- If fog: cut verification to code-based checks only

---

## Spike plan — Missing-doc detection heuristics

### Question
Can we reliably detect “referenced but missing” docs in `pack_02_missing_rea` without false flags on `pack_01_clean`?

### Context
- Feature / concept: 1.5 Failure journeys
- Related requirement(s): R5
- Why now: missing-doc UX depends on accurate detection

### Success criteria
Proof looks like:
- Missing docs identified in `pack_02_missing_rea`
- No false missing-doc flags in `pack_01_clean`
 - Heuristic output includes: `{label, confidence, signals[]}` (signals are concrete, showable evidence).
 - Evaluation criteria: FP=0 on `pack_01_clean`; FN=0 for `REA.pdf` on `pack_02_missing_rea` (confidence >= 0.8 to mark missing).

### Timebox
- Start: TBD
- Hard stop: TBD (4–6 hours)

### Scope
Include:
- Simple doc matching heuristics
- Two packs for evaluation

Exclude:
- Full ingestion + retrieval

### Approach
- Step 1: Define matching heuristics (title/filename/token match)
- Step 2: Evaluate against both packs
- Step 3: Record false positives/negatives

### Artefacts
Keep:
- Heuristic definitions + results table

Throw away:
- Production ingestion changes

### Expected outcomes
- If straight shot: implement missing-doc checklist
- If tangle: patch to manual user-confirmed missing docs
- If fog: cut missing-doc detection to admin-only

---

## Spike reports (pending)

No spike reports yet (spikes not executed). After each spike:
- Commit proof artefacts under `spike-proofs/`.
- Fill in the corresponding report stub below.
- Update `risk-register.md` RH status (`closed` / Cut / Patch / Out-of-bounds) with a link to proof.

### RH1 report — pdf.js performance on scanned/rotated PDFs (page jumps, zoom)
- Date:
- Outcome: PASS / FAIL / Cut / Patch
- Environment: browser + OS + machine notes
- Proof (files under `spike-proofs/`):
- Key numbers: p50 / p95 / max totalMs; max long task; notes
- Decision: proceed with slice(s) / cut / patch
- Follow-ups (docs to update):

### RH2 report — highlight overlay coordinate transforms across zoom levels
- Date:
- Outcome: PASS / FAIL / Cut / Patch
- Proof (screenshots + JSON log under `spike-proofs/`):
- Decision: proceed / lock-to-100%-zoom cut / evidence-card patch
- Follow-ups (docs to update):

### RH3 report — snippet normalisation + stable `snippet_hash`
- Date:
- Outcome: PASS / FAIL / Cut / Patch
- Proof (stability table / harness output under `spike-proofs/`):
- Decision:
- Follow-ups (docs to update):

### RH4 report — verification avoids false passes at acceptable latency
- Date:
- Outcome: PASS / FAIL / Cut / Patch
- Proof (results JSON under `spike-proofs/`):
- Key numbers: FP=0 check; p50/p95/max latency; notes
- Decision:
- Follow-ups (docs to update):

### RH5 report — missing-doc detection heuristics reliability
- Date:
- Outcome: PASS / FAIL / Cut / Patch
- Proof (heuristics results under `spike-proofs/`):
- Key numbers: FP/FN table; confidence thresholds; notes
- Decision:
- Follow-ups (docs to update):

## Oracle bundles
Keep oracle bundles/notes in `tmp-oracle/` so they are git-tracked and easy to re-run/review.

- RH1-RH5 closure bundle: `tmp-oracle/oracle-bundle_0001_trust-substrate_RH1-RH5_spike-closure.md`
- RH1-RH5 closure response: `tmp-oracle/oracle-bundle_0001_trust-substrate_RH1-RH5_spike-closure_RESPONSE.md`
- RH2 bundle: `tmp-oracle/oracle-bundle_0001_trust-substrate_RH2_highlight-overlay.md`
- RH2 response: `tmp-oracle/oracle_response_0001.md`
