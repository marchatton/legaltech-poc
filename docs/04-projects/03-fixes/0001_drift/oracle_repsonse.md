Here’s what I’d do with this drift report, assuming the goal is to get from “fixture-backed PoC” to “contracts you can’t accidentally violate”.

## The 3 drifts that will bite you first

### 1) **Render URL contract vs pdf.js reality**

Right now `/documents/:id/render` hands back a `render_url`, but the auth material lives in **headers**, and the PDF bytes endpoint enforces those headers. Your viewer loads pdf.js with `{ url }` only, so the browser never sends the required headers on the Range fetches. Net effect: viewer is either broken or will tempt someone to weaken `/pdf` auth.

**Pick one and make it a hard contract:**

* **Option A (recommended): query-signed render_url**
  `/render` returns a URL that already contains `expires` + `sig` (and whatever else `/pdf` needs). pdf.js just fetches it.
  Trade-off: signatures in URLs can leak via logs/referrers if you’re sloppy.
* **Option B: header-signed, but the viewer *must* pass `httpHeaders` into pdf.js**
  `/render` returns `{ render_url, headers: { ... } }` and the client uses `getDocument({ url, httpHeaders })`.
  Trade-off: you’re betting pdf.js + your fetch path behaves consistently for Range and CORS.

**Acceptance criteria**

* Fresh browser session, no dev tools hacks: pdf.js loads a PDF page and can seek around (Range 206s) without 401/403.
* Curl with no signature material gets rejected consistently.

---

### 2) **`citations.document_id` is lying**

Your `/citations/:id` shape is “locked”, but `document_id` is actually `document_filename`. That breaks joinability and makes every downstream invariant fuzzy (viewer routing, export provenance, trace stitching).

**Fix**

* Make fixtures store both `document_id` (actual DB id) **and** `document_filename` (display-only).
* Or if you want to keep filename-only in fixtures, then do *not* call it `document_id`. Call it `document_ref` and stop pretending it’s FK-able.

**Acceptance criteria**

* Citation payload can be joined to `documents.id` without hacks.
* Viewer can load a citation by id and then resolve the right PDF via document id, not filename guesswork.

---

### 3) **Trust spine exists in docs/PRDs, but not in DB**

Architecture expects first-class `runs / report_rows / citations / artefacts` with invariants. Implementation only persists folders/documents/pages/chunks, and recomputes “truth” ad hoc inside endpoints.

**Minimum viable move**

* Add the missing tables incrementally and keep the “derived state wins” principle by:

  * Persisting *evidence* (citations, snippet, snippet_hash, polygons, provenance inputs)
  * Recomputing verification via `packages/core` (single source) whenever evidence changes, and storing the result on the row for fast gating.

**Acceptance criteria**

* Export gating and trace export work off persisted rows/runs, not fixture snapshots.
* Verifier output is consistent across endpoints because there’s one path.

---

## Concrete next steps (smallest-first, keeps you shipping)

### Step 1: Make viewer + render contract actually work

* Decide Option A vs B above.
* Add an integration test that fetches `/render`, then loads `/pdf` with a Range request using the chosen auth mechanism.

### Step 2: Fix citation identity

* Rename fields or migrate fixture schema so `document_id` is truly a doc id.
* Add a contract test for `/citations/:id` that asserts `document_id` matches `/folders/:id/documents` ids.

### Step 3: Normalise “fail closed” at the edges

* Create a tiny helper that *always* attaches `traceId` and uses `safeErrorEnvelope` consistently across APIs.
* Standardise status codes for “verification failed” vs “missing input” vs “not found”.

### Step 4: Lay down the trust-spine tables (no UI change needed)

* Add `runs`, `report_rows`, `citations`, `artefacts` to schema.
* Seed/migrate existing fixture packs into DB as read-only “locked” rows/citations.

### Step 5: Wire missing-doc detection into `missing_input`

* When a row is `missing_input`, store the checklist structure (from `packages/core/missing-docs`) in provenance.
* UI can stay basic, but the data contract becomes real.

---

## A couple of quick “paper cut” fixes worth doing while you’re in there

* Folder `empty` semantics: either align implementation to spec (“zero documents”), or update the spec. But don’t leave it ambiguous.
* Feature flags at API boundaries: trace export is gated, other endpoints aren’t. Decide if that’s intentional. If not, centralise it so you don’t forget one route.

If you want, I can turn this into a set of GitHub issues with titles, scope notes, and crisp acceptance criteria (including the render signing decision as an explicit ADR-style ticket).
