part 1)
--

If you do only three things next, do them in this order:

1. **Pin the trust substrate contracts in ADRs** (chunking + question sets) so the rest of the PoC stops being “hand-wavy” and becomes a buildable system with stable invariants. Without this, you’ll keep re-litigating what a “chunk” is and what “completed” means every time you touch retrieval, runs, or evals.
2. **Ship a tracer-bullet vertical slice** that proves the trust moment: click a citation chip → viewer opens the right doc/page → highlight overlays correctly → and row/export gating follows the state model. Stub OCR/embeddings/draft if you must, but don’t stub locking, hashing, or overlay mapping.
3. **Add a fixture eval harness immediately** with hard gates that reflect your fail-closed posture. This protects the trust spine from regression while the rest of the Quick Start engine is still evolving.

And before you code: there are a few doc-level gaps that will bite you (coordinate system for polygons, `snippet_hash` formatting, and ambiguity around `/documents/:id/render?page=N`). I’ve called them out at the end.

---

## A) ADRs to pin chunking strategy + question set versioning

### Concrete PoC defaults to decide now

#### Chunking

* **Citable unit:** `chunk_id` (retrieval returns chunk IDs, drafting cites chunk IDs, locking resolves chunk IDs to immutable citations).
* **Chunk scope:** **page-bounded** chunks (a chunk never spans multiple pages). This keeps highlight geometry simple and makes “click citation → highlight evidence” reliable early.
* **Chunk sizing defaults (PoC):**

  * Target: **max 20 OCR lines** OR **max 1,500 characters**, whichever comes first.
  * Overlap: **4 lines** overlap between adjacent chunks on the same page.
* **Boundary rules:**

  * Never split inside an OCR “line”.
  * Prefer splitting on blank lines.
  * Treat obvious section headers as hard boundaries (e.g. `SCHEDULE`, `EXHIBIT`, `SCHEDULE B-II`, all-caps lines).
* **Required metadata (stored on chunks):**

  * `chunker_id` (e.g. `line_window_v1`)
  * `chunk_params` (max_lines/max_chars/overlap_lines + header regexes)
  * `page_number` (or `page_start=page_end`)
  * `line_start`, `line_end` (inclusive indices into canonical OCR lines)
  * Optional `doc_type`, `section_hint`
* **Index version bumping:**

  * Any change to **OCR canonicalisation**, **chunker algorithm/params**, **lexical index config**, **embedding model/dimension** must force a new `index_version`.
  * Mechanically: `folders.latest_index_version` bumps only via an explicit re-ingest/re-index action, and the ingestion pipeline must be fail-closed if it detects an attempt to rebuild an existing `index_version` with different chunking params.

#### Question sets

* **Storage:** in-repo, file-backed, immutable per version (no DB edits in v1).
* **Versioning:** new file per version (never edit an existing version file). Question set “version” is a stable string.
* **Run pinning:** `runs.question_set_version` is mandatory at run creation and never changes.
* **Completed invariant mechanics:** `runs.state=completed` means “exactly one terminal report row per `question_id` defined in the pinned question set version”.

### ADR patch for `docs/03-architecture/DECISIONS.md`

Append these two ADRs (as-is) to the end of `docs/03-architecture/DECISIONS.md`.

```md
## ADR-0015: Deterministic page-bounded chunking (line window v1) + index_version bump rules
- Status: proposed
- Date: 2026-02-07

Context
- Retrieval returns chunk IDs (ADR-0004) and drafting cites candidate chunk IDs (ADR-0001).
- Click-to-highlight UX requires that chunks map cleanly to page geometry (ADR-0003).
- Without a pinned chunking strategy, “what is a citable unit?” and “when do we bump index_version?” will drift and break evals.

Decision
- Citable unit:
  - Retrieval returns `chunk_id`s only.
  - Drafting outputs `candidate_citation_chunk_ids: string[]` only.
  - Citation locking resolves `chunk_id` -> immutable `citation_id` (ADR-0001).
- Chunk scope (PoC default):
  - Chunks are **page-bounded**: `page_start = page_end = page_number`.
  - A chunk never spans multiple pages.
- Chunk sizing defaults (PoC):
  - Build chunks from OCR/layout “lines” in `document_pages.layout_json`.
  - Hard limits:
    - `max_lines = 20`
    - `max_chars = 1500`
    - `overlap_lines = 4` (overlap is within a page only)
- Boundary rules:
  - Never split inside an OCR line.
  - Prefer splitting on blank lines.
  - Treat section headers as hard boundaries (e.g. lines matching: `/^(SCHEDULE|EXHIBIT|SECTION)\b/i`, or ALL-CAPS lines above a minimum length).
- Chunk metadata (required fields in `chunks.metadata_json`):
  - `chunker_id`: `line_window_v1`
  - `chunk_params`: `{ max_lines, max_chars, overlap_lines, header_regexes_version }`
  - `page_number`
  - `line_start` / `line_end` (inclusive line indices in the canonical OCR line list)
  - Optional: `doc_type`, `section_hint`
- Index version bumping:
  - `index_version` identifies the retrieval substrate for a folder (chunks + indices).
  - We MUST bump `folders.latest_index_version` when ANY of the following changes:
    - OCR canonicalisation schema or adapter version (ADR-0012)
    - chunker_id or chunk_params
    - lexical indexing config (tsvector build rules)
    - embedding model ID or embedding dimension
  - Fail-closed safety:
    - Each chunk row stores the `chunker_id` + `chunk_params` used to build it.
    - The ingestion/indexing pipeline must refuse to write chunks for an existing `index_version` if the current chunker_id/params do not match the stored metadata (failure code: `CHUNKING_FAIL`).

Consequences
- Highlight overlays become straightforward because a citation’s polygons are always on a single page.
- Chunk IDs remain stable within an `index_version`, and drift is handled by versioning rather than mutation.
- Trade-off: cross-page clauses require retrieving multiple chunks; we accept this for PoC simplicity.

Links
- PR:
- Related docs:
  - `docs/03-architecture/40_rag_and_agents.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/20_state_model.md`


## ADR-0016: File-backed, immutable question sets with run pinning and completed invariants
- Status: proposed
- Date: 2026-02-07

Context
- Runs must pin `question_set_version` so we can replay and evaluate outputs deterministically (`docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`).
- If question sets are editable in-place, “completed” becomes ambiguous and fixture truth comparisons drift.
- PoC constraint: single-tenant, minimal infra. We want determinism and code review over dynamic configurability.

Decision
- Storage (v1):
  - Question sets live in-repo as JSON files (source of truth), not in the database.
  - Each version is an immutable file. Do not edit an existing version file; create a new version file.
  - Suggested location:
    - `packages/core/question-sets/<question_set_id>/qs_<version>.json`
- File schema (required fields):
  - `question_set_id` (e.g. `quick_start_title_survey`)
  - `question_set_version` (e.g. `qs:quick_start_title_survey:v1`)
  - `created_at` (ISO date)
  - `questions[]` with:
    - `question_id` (stable identifier, e.g. `BII-01`)
    - `question` (string)
    - optional `artefact_kind` (`requirements_tracker|exceptions_table|survey_issues`)
    - optional `row_schema_id` (pins the row payload schema)
- Run pinning:
  - At run creation, the server selects a question set version for the run type and persists:
    - `runs.question_set_version` = the selected version string
  - `runs.question_set_version` MUST NOT change after creation.
- Completed invariants (mechanics):
  - A run can only enter `runs.state = completed` when:
    - For the pinned `question_set_version`, there is exactly one `report_rows` record per `question_id` in that set.
    - Every `report_rows.status` is terminal (`needs_review|reviewed|missing_input|citation_failed`).
  - Any mismatch (missing question IDs, extra rows, or duplicate rows) is a fail-closed run failure (failure code: `INVARIANT_FAIL`).

Consequences
- Deterministic replays: “what questions did we run?” is answerable from the run record.
- Fixtures and eval truth files can stabilise against explicit question IDs.
- Trade-off: no UI-editable question sets in v1. That is intentional.

Links
- PR:
- Related docs:
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/50_api_surface.md`
```

### Small doc patches worth doing alongside the ADRs (low-effort, high-leverage)

These aren’t new ADRs, just clean-ups that unblock coding without ambiguity:

1. **Define citation polygon coordinate system explicitly** (missing today).

* Patch suggestion (add to `docs/03-architecture/30_data_model.md` under `citations`):

  * Polygons are normalised floats `[0..1]` relative to page width/height, origin top-left, clockwise points.

2. **Make `snippet_hash` string formatting unambiguous** (currently implied but inconsistent).

* Patch suggestion (add to `docs/03-architecture/30_data_model.md` “Hashing rule”):

  * Store as `sha256:<lowercase hex>` everywhere (chunks, citations, provenance).

3. **Clarify `/documents/:id/render?page=N` semantics** (today it reads like “page bytes”, but pdf.js typically loads a PDF URL).

* Patch suggestion (add a note in `docs/03-architecture/50_api_surface.md` under that endpoint):

  * `render_url` points to the raw PDF (whole file). `page` is the viewer’s initial page (1-indexed), not a server-side page extraction.

---

## B) Tracer-bullet runnable scaffold (ADR-0014) proving viewer + citation locking end-to-end

### Goal (what the tracer bullet must prove)

Smallest runnable slice that demonstrates, end-to-end:

* **Trust moment:** click citation chip → viewer opens correct document + page → highlight overlay renders from locked citation polygons → snippet + `snippet_hash` visible.
* **Fail-closed UI:** if citation invariants fail, viewer shows explicit error state and renders **no** best-effort overlay.
* **State invariants:** report rows obey `needs_review|reviewed|missing_input|citation_failed` invariants, and export is blocked when any row is `citation_failed` (per state model + API surface).

### Smallest pnpm workspace scaffold (files to create)

Keep it intentionally boring and minimal:

**Root**

* `pnpm-workspace.yaml` (include `apps/*`, `packages/*`)
* `package.json` (scripts: `dev`, `worker`, `lint`, `test`, `typecheck`, `fixture:seed`, `fixture:eval`)
* `tsconfig.base.json`
* `docker-compose.yml` (Postgres + pgvector extension)
* `scripts/verify.sh` (calls `pnpm lint && pnpm test && pnpm build` once wired)

**`packages/core`**

* `packages/core/package.json`
* `packages/core/src/schemas/` (Zod)

  * `errorEnvelope.ts`
  * `citation.ts` (including polygon validation)
  * `reportRow.ts` (status invariants)
  * `questionSet.ts`
  * `evalReport.ts`
* `packages/core/src/citations/`

  * `normaliseSnippet.ts`
  * `hashSnippet.ts` (single canonical implementation used everywhere)
* `packages/core/question-sets/quick_start_title_survey/qs_v1.json` (a tiny v1 set for tracer bullet, even if it’s 3–5 questions only)

**`apps/web` (Next.js)**

* `apps/web/package.json`
* `apps/web/app/(app)/matters/page.tsx` (list)
* `apps/web/app/(app)/matters/[folderId]/page.tsx` (detail: docs list + report table)
* `apps/web/app/(app)/viewer/[documentId]/page.tsx` (server fetch render_url + citation payload)
* `apps/web/app/api/folders/route.ts`
* `apps/web/app/api/folders/[id]/report/route.ts` (or `GET /folders/:id/report`)
* `apps/web/app/api/runs/route.ts` (or `POST /folders/:id/runs` in folder router)
* `apps/web/app/api/citations/[id]/route.ts`
* `apps/web/app/api/documents/[id]/render/route.ts`
* `apps/web/viewer/PdfViewerClient.tsx` (client)
* `apps/web/viewer/HighlightOverlaySvg.tsx` (client, pure mapping)
* `apps/web/workflows/quickStart.workflow.ts` (`"use workflow"`)
* `apps/web/steps/lockCitations.step.ts` (`"use step"`)
* `apps/web/steps/verifyRow.step.ts` (`"use step"`, code checks only for tracer bullet)
* `apps/web/steps/writeRow.step.ts` (`"use step"`)

And one minimal DB/migrations location:

* `apps/web/db/migrations/001_init.sql` (or root `db/migrations` if you prefer)

### Minimal end-to-end slice plan (milestones)

#### Milestone 1: Trust substrate contracts in code (no UI yet)

* Implement in `packages/core`:

  * `normalise(snippet)` and `hashSnippet(snippet)` exactly as in `docs/03-architecture/30_data_model.md`.
  * `CitationSchema` with polygon validation (non-empty polygons, points within `[0..1]`).
  * `ReportRowSchema` + `assertRowInvariants(row)`:

    * `missing_input` must have exact answer string and zero citations.
    * `needs_review|reviewed` must have >=1 citation.
* Add unit tests for:

  * `hashSnippet` normalisation (CRLF/LF/whitespace collapse).
  * polygon validation edge cases.
  * row invariants (good + bad cases).

#### Milestone 2: Viewer + citation fetch (the trust moment)

* Implement `GET /documents/:id/render?page=N` returning a URL to the stored PDF.
* Implement `GET /citations/:id` returning `{document_id, page_number, polygons, snippet, snippet_hash}`.
* Implement viewer page:

  * Opens the doc.
  * Sets initial page from `searchParams.page` (1-indexed).
  * If `citation` query param present, fetch citation server-side and pass to client.
* Implement `HighlightOverlaySvg` that maps normalised polygons to viewport pixels and renders an overlay.
* Fail-closed viewer behaviour:

  * If citation doc mismatch or polygons invalid, show an explicit “citation_failed” UI state and render no overlay.

#### Milestone 3: “Real” citation locking (even if retrieval/draft are stubbed)

* Seed **chunks** in DB from fixtures (anchors-first is fine).

  * Each seed chunk has: `document_id`, `index_version`, `page_number`, `text`, `metadata_json.polygons`.
* Implement `lockCitations.step.ts` that:

  * Accepts `{run_id, row_id, index_version, candidate_chunk_ids[]}`
  * For each chunk:

    * Loads chunk text + polygons.
    * Computes `snippet_hash = sha256(normalise(text))` using the shared core util.
    * Inserts `citations` rows (idempotent per `(report_row_id, chunk_id)` or with a step_key + short-circuit).
  * Returns `locked_citation_ids[]`.
* This is the key: **hashing and polygons must be real**, not mocked.

#### Milestone 4: Row statuses and export gating are observable

* Implement a minimal report table that shows:

  * status badge
  * citation chips (link to viewer with `?citation=cit_123&page=12`)
* Implement `POST /export/csv` as a stub that only enforces gating for now:

  * if run not completed → `409 CONFLICT`
  * if any `citation_failed` row → non-2xx with `EXPORT_BLOCKED`
  * return dummy artefact payload on success (real CSV later)

#### Milestone 5: Wire WDK-style boundaries (even if workflow runner is local-only at first)

* Implement `quickStart.workflow.ts` (`"use workflow"`) that:

  * Loads question set v1.
  * Loops question IDs.
  * Calls steps in order: `retrieve_stub` → `draft_stub` → `lock_citations` → `verify_row` → `write_row`.
* Steps (`"use step"`) are idempotent via deterministic `step_key`, e.g.:

  * `quick_start:${run_id}:${question_id}:lock`
* Route handler stays thin:

  * validates input
  * creates run record
  * triggers workflow start (however WDK starts it)
  * returns run metadata

### Tracer bullet data seeding (what to stub vs what must be real)

**OK to stub (initially)**

* OCR/layout provider calls (replace with fixture anchors as “layout”)
* embeddings and pgvector indexes
* retrieval scoring (return fixture-determined chunk IDs)
* drafting (return fixture-determined answers + candidate chunk IDs)

**Must be real and testable**

* Citation locking (chunk_id -> citation row)
* Snippet normalisation + hashing
* Polygon coordinate mapping and highlight overlay rendering
* State model invariants (row statuses + export gating)

---

## C) Fixture-driven eval harness (early, fixture-first, CI-friendly)

### Where fixtures should live (and what’s missing today)

You already reference `docs/08-example-data/` as the canonical fixture location. Keep that. But add one missing piece: a **pack manifest** so the loader does not guess.

**Proposal**

* `docs/08-example-data/<pack_id>/manifest.json` (new, required)

  * pack id
  * list of PDFs to load
  * expected question_set_version
  * optional: which run type to execute
  * optional: golden questions file path
* Keep existing structure:

  * `/docs` (PDFs)
  * `/truth` (expected CSVs / expected outputs)
  * `/layout` (anchors, if you’re using them)

This makes `fixture:seed` deterministic and stops “it worked on my machine” drift.

### Scripts to add (expected command shape)

Add scripts at the root `package.json` (as already hinted in docs):

* `pnpm fixture:seed <pack_id>`

  * Seeds DB + storage with the pack docs and any anchor-derived chunks needed for the tracer bullet.
* `pnpm fixture:run <pack_id>`

  * Starts a run for the seeded folder and waits/polls until terminal (local only, CI optional).
* `pnpm fixture:eval <pack_id>`

  * Produces an eval report JSON + Markdown summary.
* `pnpm fixture:eval:all`

  * Runs eval across a list of packs (start with 2 packs only).
* `pnpm demo:smoke`

  * `seed + run + eval` for `pack_01_clean` and `pack_02_missing_rea`, prints a summary.

### First hard gates and metrics (v0)

Align exactly to your `docs/03-architecture/60_observability_and_evals.md` posture.

**Hard gates (must be 100% pass)**

1. **Schema validity**

   * Every produced `report_row` validates against Zod schema.
2. **Citation integrity**

   * For every citation referenced by `needs_review|reviewed` rows:

     * page exists
     * polygons exist and validate (`[0..1]`)
     * `snippet_hash` matches `sha256(normalise(snippet))`
3. **Failure journeys**

   * Packs designed to fail do so with the expected terminal status:

     * missing docs → `missing_input` with exact answer string and checklist
     * deliberate bad citation → `citation_failed` and export blocked

**Report-only (track but don’t gate yet)**

* Retrieval Recall@K on golden questions (when real retrieval exists)
* Extraction quality distribution (when OCR exists)
* Run duration + token/cost (when LLM calls exist)

### Eval report JSON shape (lock early with a Zod schema)

Use the suggested shape in `docs/03-architecture/60_observability_and_evals.md` and lock it with Zod so CI tooling can consume it:

* `pack_id`
* `versions: { index_version, agent_bundle_version, question_set_version }`
* `hard_gates: { schema_validity, citation_integrity, failure_journeys }`
* `metrics: { retrieval_recall_at_k?, run_duration_ms?, tokens_total? }`
* `taxonomy_counts`

Also: write reports to a predictable artefact location, e.g.:

* `artifacts/evals/<pack_id>/report.json`
* `artifacts/evals/<pack_id>/summary.md`

So CI can upload them without custom logic.

### CI readiness (once code exists)

The harness can be CI-friendly from day one if you keep it provider-free:

* Use Docker Postgres in CI.
* Use fixture PDFs from repo.
* For the tracer bullet stage:

  * seed anchor-derived chunks
  * stub draft/retrieve
  * run lock/verify/write for real
  * evaluate citation integrity and row invariants

This means CI can gate on “trust spine correctness” before you ever pay for OCR/LLM calls in CI.

---

## Contradictions / missing pieces to resolve before coding

These are the ones I’d fix in docs immediately because they’ll cause rework:

1. **Polygon coordinate system is not explicitly defined**
   API examples and breadboards imply normalised `[0..1]` coords with origin top-left, but the data model never states it. Without this, your overlay maths will drift between anchors, OCR providers, and viewer rendering.

2. **`snippet_hash` formatting is inconsistent / underspecified**
   Data model defines the algorithm, but examples show `sha256:…` prefixes. Pick one canonical representation (I’d standardise on `sha256:<hex>` everywhere) and document it so your verifier and eval harness aren’t subtly incompatible.

3. **`chunks.snippet_hash` vs `citations.snippet_hash` ambiguity**
   `chunks` has a `snippet_hash` column, but citations also do. If chunk text == citation snippet in v1, that’s fine. But if later you add span-level citation extraction, this naming becomes misleading. Either:

   * rename chunk’s to `text_hash`, or
   * explicitly state v1: citation snippet == chunk text.

4. **`GET /documents/:id/render?page=N` semantics need a clarifying note**
   It currently reads like the server returns page bytes, but the suggested UI uses pdf.js which expects a PDF URL and renders pages client-side. Clarify that `render_url` is the PDF URL, and `page` is only initial viewer state (1-indexed).

5. **Fixture pack schema isn’t pinned**
   Multiple docs reference `/layout/*.anchors.json` and `golden_questions.json`, but there’s no declared schema or manifest. Add `manifest.json` per pack so loaders and evals don’t guess.

If you want only one extra thing beyond the three asks: standardise those five points now, because they unblock the tracer bullet and keep the future OCR swap clean.

--

part 2)

--

Here’s what I’d lock down for each gap, plus why it matters, plus the smallest doc patches so the repo stops being ambiguous.

## 1) Polygon coordinate system not explicitly defined

### Suggestion (decision)

Define **one canonical polygon coordinate space** for the whole PoC:

* `citations.polygons` are **normalised** points in `[0..1]`.
* Origin is **top-left** of the PDF page’s **viewBox**.
* Points are ordered clockwise (not required for rendering, but makes debugging consistent).
* Mapping to the viewer is done via pdf.js using the page `viewBox` and `viewport.convertToViewportPoint()`:

  * Convert `[0..1]` → PDF points using `viewBox`
  * Invert Y (because PDF space is bottom-left origin)
  * Then convert to viewport pixels via pdf.js (so rotation/scale is handled consistently)

So the canonical meaning becomes: “this polygon is in page space, independent of zoom, and it will land in the right place when pdf.js renders the page”.

### Why

* Without a single definition, you will 100% get drift between:

  * fixture anchors (`*.anchors.json`),
  * OCR provider geometry (each provider has different conventions),
  * and viewer mapping (pdf.js is PDF-space-first).
* And if your coordinate space isn’t explicit, your fail-closed posture breaks because you can’t reliably validate polygons (out-of-range, wrong basis, wrong page).
* This also makes your overlay code testable: “given viewBox + viewport, do we land in expected pixels”.

### Patch snippet (docs)

Add this to **`docs/03-architecture/30_data_model.md`** under `citations` (and optionally reference it from `50_api_surface.md` too):

```md
### Citation polygon coordinate system (polygons)
`citations.polygons` is a list of polygons. Each polygon is a list of points `[x, y]`.

Canonical coordinate space (PoC v1):
- Points are **normalised floats** in the range `[0..1]`.
- Origin is **top-left** of the PDF page’s **viewBox**.
- `x` increases to the right, `y` increases down.
- This coordinate space is independent of zoom. Rendering applies the current pdf.js viewport transform.

Viewer mapping (pdf.js):
- Let `viewBox = [xMin, yMin, xMax, yMax]` from the pdf.js page.
- Convert a point `[xNorm, yNorm]` to PDF points:
  - `xPdf = xMin + xNorm * (xMax - xMin)`
  - `yPdf = yMax - yNorm * (yMax - yMin)`  (invert Y because yNorm is top-left origin)
- Convert to viewport pixels:
  - `[xPx, yPx] = viewport.convertToViewportPoint(xPdf, yPdf)`

Validation (fail-closed):
- Every point must be within `[0..1]`.
- Polygons must be non-empty.
- If any validation fails, treat the citation as invalid and fail closed (`citation_failed`).
```

And fix a subtle contradiction in **`docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`** (it currently mixes “normalised” and “convertToViewportPoint” without specifying the intermediate PDF-point step). Replace the highlight renderer note with:

```md
N7 | Highlight renderer | anchor polygons → viewport CSS pixels | call | Maps normalised anchors (`[0..1]`, origin top-left of page viewBox) → PDF points using `viewBox` (invert Y), then uses `viewport.convertToViewportPoint()` to get CSS px.
```

## 2) `snippet_hash` formatting inconsistent / underspecified

### Suggestion (decision)

Standardise on a single wire format everywhere (DB + API + provenance):

* Store and return: **`"sha256:<lowercase_hex>"`**
* And implement exactly one function in `packages/core` that produces it:

  * `hashSnippet(snippet: string) => "sha256:..."`

### Why

* This is the kind of tiny inconsistency that causes silent “verification failed” churn:

  * one place compares raw hex,
  * another compares prefixed strings,
  * eval harness counts it as mismatch,
  * and suddenly you’re debugging nothing.
* Prefix also future-proofs the value if you ever change hashing algorithm (you can keep `sha256:` for old data and introduce `blake3:` etc later without ambiguity).

### Patch snippet (docs)

Update **`docs/03-architecture/30_data_model.md`** hashing rule:

```md
## Hashing rule (snippet_hash)
We use `snippet_hash` to detect citation drift.

Canonical PoC v1 rule:
- `snippet_hash = "sha256:" + sha256_hex(normalise(snippet))`
- `sha256_hex(...)` is lower-case hex.
- `normalise()` must:
  - trim leading/trailing whitespace
  - convert CRLF → LF
  - collapse all whitespace runs to a single space

This rule must be implemented once (e.g. in `packages/core/citations`) and reused everywhere.
```

And update examples in `50_api_surface.md` only if any show raw hex (right now they already show `sha256:…`, which is good, but it should be stated as the rule).

## 3) `chunks.snippet_hash` vs `citations.snippet_hash` ambiguity

### Suggestion (decision)

Do one of these now, while it’s docs-first:

**Option A (my preference): rename chunk field**

* Rename `chunks.snippet_hash` → `chunks.text_hash`
* Define: `text_hash` is the hash of `chunks.text` using the same canonical normalisation + `sha256:` prefix.

**Option B (acceptable if you really want minimal churn): keep the name but define it**

* Explicitly state: in PoC v1, `chunks.snippet_hash` is the hash of `chunks.text` and citation locking uses chunk text as the citation snippet.
* And add a note: “if we introduce span-level citations later, we will rename this to `text_hash`”.

### Why

* Right now the name implies “this is the hash of a snippet”, but a chunk is not really a snippet, it’s the retrieval unit’s full text.
* You’ll want both concepts later:

  * **chunk text hash** (for substrate drift / debugging),
  * **citation snippet hash** (locked evidence shown to user, potentially a subset span).
* If you don’t separate them, you’ll either block span-level citations later, or you’ll do a breaking rename when you finally have data in the DB.

### Patch snippet (docs)

Change the `chunks` table section in **`docs/03-architecture/30_data_model.md`**:

```md
### `chunks`
- `id`, `document_id`
- `index_version`
- `page_start`, `page_end`, `chunk_index`
- `text`, `metadata_json`, `tsv`, `embedding`
- `text_hash` (hash of `chunks.text` using the canonical hashing rule)

Notes:
- In PoC v1, citation locking uses `chunks.text` as the citation snippet by default, so `citations.snippet_hash` will usually equal `chunks.text_hash`.
- Future: if we support span-level citations, `citations.snippet` may be a subset of `chunks.text`.
```

And in `citations` section add:

```md
- `snippet_hash` is the hash of `citations.snippet` (not the chunk).
```

## 4) `GET /documents/:id/render?page=N` semantics unclear

### Suggestion (decision)

Clarify (and keep it boring):

* `render_url` is a signed URL to the **entire raw PDF** (what pdf.js loads).
* `page` query param is:

  * validated server-side (optional but recommended),
  * and used as the viewer’s **initial page** (1-indexed),
  * it does **not** mean “server renders page N”.

If later you want server-rendered images, add a separate endpoint, don’t overload this one.

### Why

* If someone misreads this and implements per-page rasterisation, you’ve just created:

  * a bunch of extra infra,
  * performance costs,
  * and a different coordinate mapping problem.
* And it violates your “thin route handlers” intent, because rasterisation is a side effect and should be step-driven if it exists at all.

### Patch snippet (docs)

Add a note directly under that endpoint in **`docs/03-architecture/50_api_surface.md`**:

```md
### GET /documents/:id/render?page=N
Note (PoC v1 semantics):
- `render_url` is a signed URL to the **whole PDF** (what pdf.js loads).
- The `page` query param is **1-indexed** and is used for:
  - validating that the requested initial page is in range
  - returning the initial page value to the client
- This endpoint does not rasterise pages server-side.
- If we ever add server-rendered images, introduce a new endpoint (e.g. `/documents/:id/pages/:n.png`) rather than changing this contract.
```

## 5) Fixture pack schema isn’t pinned

### Suggestion (decision)

Pin the fixture pack structure with two things:

1. A required `manifest.json` per pack
2. Zod schemas in `packages/core` for:

   * manifest
   * anchors
   * golden questions

And treat fixture schema as “API”, meaning: **breaking changes require an explicit version bump**.

### Why

* Fixtures are your regression backbone (ADR-0006). If the harness has to “guess” file names and shapes, CI will be flaky and devs will add one-off exceptions.
* A manifest is also what lets you scale from “two packs for smoke” to “pack suite” without writing pack-specific code.

### Patch snippet (docs)

Create or update a file like **`docs/08-example-data/README.md`** (or patch whatever summary doc you already have) with:

````md
# Fixture packs (schema v1)

Each pack lives at:
`docs/08-example-data/<pack_id>/`

Required files:
- `manifest.json` (required)
- `/docs/*.pdf` (one or more)
- `/truth/*` (expected outputs, pack-specific)
- `/layout/*.anchors.json` (optional early, used for overlay spikes)
- `golden_questions.json` (optional early, used for retrieval evals later)

## manifest.json (schema v1)
Example:
```json
{
  "pack_id": "pack_01_clean",
  "schema_version": "fixture_pack_v1",
  "default_run_type": "quick_start_title_survey",
  "expected_question_set_version": "qs:quick_start_title_survey:v1",
  "documents": [
    { "filename": "Title Commitment.pdf", "role": "title_commitment" },
    { "filename": "Survey.pdf", "role": "survey" }
  ],
  "layout": {
    "anchors_file": "layout/pack_01_clean.anchors.json",
    "polygon_space": "page_viewbox_norm_v1"
  },
  "truth": {
    "requirements_tracker_csv": "truth/expected_requirements_tracker.csv",
    "exceptions_table_csv": "truth/expected_exceptions_table.csv",
    "survey_issues_csv": "truth/expected_survey_issues.csv"
  }
}
````

## Anchors

* Anchor polygons use the same coordinate system as citations:

  * normalised `[0..1]`
  * origin top-left of PDF page viewBox
  * mapping defined in `docs/03-architecture/30_data_model.md`

```

And add a one-liner to **`docs/03-architecture/60_observability_and_evals.md`** saying eval runners must read manifests, not infer.

---

If you want my blunt prioritisation: lock (1) and (2) first, because they’re the fastest way to prevent “it highlights on my machine” regressions. Then (4) because it keeps the API and viewer aligned. Then (5) because it makes the harness sane. And (3) is the only one that’s technically optional short-term, but it’s cheap to fix now and expensive later.
```
