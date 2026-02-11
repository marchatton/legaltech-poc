# Spike-resolution dossier: 0009 User Journey V2 parity (SP-0009-01..06)

This dossier is grounded in the planning docs + cut lines, and the *live* backend/UI contracts you pasted (notably current chat stream shape, report run scoping, missing runs list endpoint, missing run timestamps in `/runs/:id`, and the current safe error envelope fields).

## Executive decisions (what I’d lock now)

| Spike | Status | Recommendation (v1 parity cut) | Why this is the right cut |
|---|---:|---|---|
| **SP-0009-01** Run scoping fallback in chat | Open (P0) | **Soft fallback** to a deterministic “effective run” + **always disclose mismatch** in stream metadata | Keeps chat usable while preserving trust posture via explicit mismatch banner (L1 scope) |
| **SP-0009-02** Anchor coverage + jump-to-evidence | Open (P0) | **Anchor-only clickability** (strict), with friendly disabled copy when missing; measure coverage to tune default affordance | Matches confirmed cut (no fuzzy recovery), preserves trust, avoids broken navigation |
| **SP-0009-03** Setup readiness taxonomy | Resolved (P0) | **Keep canonical folder/doc states only** (`empty/ingesting/indexed/ready/failed` + parse/ocr enums) | Already locked in `0009a` PRD JSON, aligns with “no pipeline internals” |
| **SP-0009-04** Support escalation ownership | Resolved (P1) | **Config-driven mailto** escalation + fallback instructions when unset | Already locked in `0009f` PRD JSON, avoids new ticketing backend |
| **SP-0009-05** Checklist elapsed timing | Open (P1) | **Expose run timestamps** on run APIs + compute coarse minutes in UI (no seconds) | Small backend addition, satisfies W‑C11 cut, survives refreshes |
| **SP-0009-06** Mandatory polish checks | Open (P1) | **Small mandatory checklist (3 items)** enforced everywhere + guardrail checks for exclusions | Prevents “polish sprawl” while locking the highest-trust UX baselines |

---

## Dependency ordering (what must happen first, what can run in parallel)

### Must-land first (unblocks multiple slices)
1. **`GET /api/folders/:id/runs` (N7)**  
   Needed for run selector in **exports (0009c)** and **chat (0009d)**. Right now `/folders/[id]/runs` is POST-only.
2. **SP-0009-01 decision lock** (selected vs effective run semantics)  
   Needed before anyone implements run picker UX or chat stream metadata, otherwise you’ll ship two interpretations.
3. **Stream metadata contract for chat** (N11)  
   Add selected/effective run fields early in stream so mismatch banners can render whilst tokens stream.

### Can run in parallel (once the above is stable)
- **0009a** setup shell work can proceed (SP‑0009‑03 already locked).
- **0009f** error banner + envelope extension can proceed mostly independently (SP‑0009‑04 locked).
- **SP‑0009‑05** run timestamps can be added alongside runs list endpoint work.
- **SP‑0009‑02** anchor coverage measurement + schema proposal can proceed, but the “chat citation persistence vs page-only jump” decision must be made before implementing click behaviour.
- **0009b** report drawer + viewer improvements can proceed, but source-jump wiring will depend on the SP‑0009‑02 contract.

### Leave until late (but decide early)
- **SP‑0009‑06** polish checklist should be decided soon so PRs don’t drift, but most execution belongs in wave 4 (**0009g**).

---

## SP-0009-01: selected_run_id vs effective_run_id fallback (chat run scope)

### What’s true in live code today
- `POST /folders/[id]/chat` **accepts only `{ message }`**, no `run_id`.  
- It always retrieves against **`folders.latest_index_version`**, not a run’s `index_version`.  
- Stream emits only: `meta(trace_id)`, `token`, `sources[{document_id,page_number}]`, `done`, `error`. No run metadata.

This spike is basically: *when a user “selects” a run, what do we do if it’s missing/stale/unusable, and how do we make that behaviour visible?*

### Options (at least 2)

#### Option A (recommended): **Soft fallback + explicit mismatch disclosure**
**Behaviour**
- Request accepts optional `run_id` (selected).
- Server computes `effective_run_id` deterministically:
  - If `run_id` is valid + belongs to folder + state is **completed**: use it.
  - Else: fall back to **latest completed run for folder** (if one exists).
  - Else (no completed runs): fall back to **latest index context with no run** (effective_run_id = null, but effective_index_version set to `folders.latest_index_version`).
- Stream emits metadata early: `selected_run_id`, `effective_run_id`, `scope_mismatch`, and a machine-readable `scope_reason`.
- UI must surface mismatch warning when `scope_mismatch=true`.

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Medium. Adds a run lookup + run list endpoint dependency, but still small. |
| Risk | Medium. Risk is *trust confusion*, mitigated by mismatch banner being mandatory. |
| Complexity | Medium. Needs clear state machine for “effective” resolution. |
| UX trust | High *if* mismatch disclosure is impossible to miss. |
| Extensibility | High. Sets up L2 later without committing to it. |

#### Option B: **Hard fail on invalid/unusable run_id**
**Behaviour**
- If `run_id` is missing: pick default (latest completed) or require client to always send.
- If `run_id` is invalid / not found / not completed: return a deterministic error (400/404/409) and do not answer.
- No “effective fallback” concept (or effective is only set when success).

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Medium. Similar backend work, more UI states. |
| Risk | Low trust-risk (no silent fallbacks). |
| Complexity | Medium-high (more error flows, more dead ends). |
| UX trust | Very high, but UX friction is also high. |
| Extensibility | Medium. L1 becomes strict-by-default, which you explicitly said is out-of-scope (L2). |

#### Option C: **Always ignore run_id if unusable and use folder.latest_index_version**
This is basically “keep today’s semantics and just add a run picker UI veneer”.  
I’m including it as a realistic option because it’s tempting, but it’s a trust trap.

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Fast. |
| Risk | High. Users will assume run scoping works when it doesn’t. |
| Complexity | Low. |
| UX trust | Low. |
| Extensibility | Low. It bakes in ambiguity and forces later rework. |

### Recommendation
**Option A. Soft fallback + explicit mismatch disclosure.**

It’s the only one that hits the L1 cut cleanly:
- no strict isolation (L2)  
- no multi-run compare (L3)  
- still avoids “silent wrong context” by forcing disclosure.

### Concrete decision tests (implementation-grade)

#### Contract-level tests (API)
1. **Valid completed run**
   - Given folder F has completed run R1
   - When `POST /api/folders/F/chat` with `{ message, run_id: R1 }`
   - Then stream first emits `scope` (or meta fields) where:
     - `selected_run_id=R1`
     - `effective_run_id=R1`
     - `scope_mismatch=false`
2. **Run belongs to another folder**
   - When `run_id=R_other_folder`
   - Then:
     - `selected_run_id=R_other_folder`
     - `effective_run_id=<latest_completed_in_F or null>`
     - `scope_mismatch=true`
     - `scope_reason="RUN_NOT_IN_FOLDER"`
3. **Run is not completed**
   - When `run_id=R_running`
   - Then mismatch true and reason `"RUN_NOT_COMPLETED"` (or `"RUN_UNAVAILABLE"`, but it must be deterministic)
4. **No completed runs exist**
   - Given folder F has zero completed runs
   - When run_id is omitted or invalid
   - Then:
     - `effective_run_id=null`
     - `effective_index_version` must be present and equal to `folders.latest_index_version`
     - UI can show “Using latest indexed documents” instead of a run id
5. **Run id is syntactically invalid**
   - If body fails schema validation: respond 400 safe envelope (not stream)
   - If body passes schema but run missing: fallback semantics apply (not 400), mismatch true.

#### UX decision tests
- If `scope_mismatch=true`, the mismatch banner is visible without scrolling and survives streaming.
- The banner copy shows both “Selected” and “Used” run identifiers (or “latest docs” when effective_run_id is null).
- Retry replays the last message **with the same selected run**, not silently switching.

### PRD patches implied
- **`0009d`**: lock wording for mismatch banner and define `scope_reason` enum (even if UI only uses it for copy mapping).
- **`0009c`**: run selector must default to “latest completed run” and never silently keep stale state in URL without echo.
- **`0009c` open question** (“include non-completed runs?”): for parity v1, answer should be **no**. Show only completed in picker.

---

## SP-0009-02: anchor coverage for jump-to-evidence (and the threshold)

### What’s true in live code today
- Report rows return `citation_ids` (except `missing_input`, forced empty).
- Chat stream sources do **not** include citation IDs or anchors. Only `{document_id,page_number}`.
- Chat UI source chips are visual-only (no click-through contract).
- Evidence viewer highlight overlay exists, so there is a notion of “jump target”, but chat has no way to reference it yet.

So the *real* decision hidden in this spike is: **what is the minimum source payload required to support click-to-evidence, and what do we do when it’s missing?**

### Options

#### Option A (recommended): **Strict anchor-only jump**
**Behaviour**
- A source chip is clickable **only when** it includes a resolvable anchor reference.
- “Anchor reference” in parity v1 should mean **a `citation_id`** that the viewer can load.
- If no anchor exists, the chip is disabled with friendly explanation (confirmed in findings).

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Medium. Requires producing citation ids for chat sources (or mapping to existing ones). |
| Risk | Low. No broken jumps, no false sense of verification. |
| Complexity | Medium. Requires a clear `ChatSource` schema extension. |
| UX trust | Very high. You never imply a verification jump when you can’t do it. |
| Extensibility | High. Later you can add optional fallbacks without breaking trust. |

#### Option B: **Page-only fallback jump (no highlight)**
**Behaviour**
- If citation anchor missing, still allow “open document at page N”.
- Viewer opens PDF at that page, but shows a banner: “Highlight unavailable for this source.”

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Fast-ish if viewer can already open by doc+page. |
| Risk | Medium. Users may still interpret page-open as “verified”, unless the UI is very explicit. |
| Complexity | Medium. Needs viewer route to accept doc+page deep link and a distinct “unverified” state. |
| UX trust | Medium-high if the banner is strong; low if subtle. |
| Extensibility | Medium. You may later need to unwind behaviours if users treat it as proof. |

#### Option C: **Fuzzy anchor recovery**
Search within PDF / derive coordinates from text / heuristics.  
This is explicitly out-of-scope per your cut line (“defer fuzzy recovery heuristics”).

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Slow. |
| Risk | High. False positives are lethal to trust posture. |
| Complexity | High. |
| UX trust | Risky. |
| Extensibility | High technically, but wrong for parity v1. |

### Recommendation
**Option A. Strict anchor-only jump.**

And then optionally, if you want more utility without breaking trust, you can add Option B later behind a flag. But don’t mix them during parity v1 unless you have extremely clear verification language.

### Concrete decision tests

#### Data/coverage measurement (spike method)
Define coverage as:
- **Report anchor coverage** = % of non-`missing_input` report rows where each `citation_id` resolves to a viewer-loadable citation with required anchor fields (whatever the viewer needs).
- **Chat anchor coverage** = % of chat sources that include `citation_id` (and that citation loads successfully).

Minimum measurement you need before enabling “click by default”:
- Sample recent folders with completed runs (and demo packs).
- For each citation, attempt a “viewer load simulation”:
  - `GET /api/citations/:id` returns 200
  - the payload contains whatever the viewer requires to render highlight, or explicitly indicates failure state.

Even if you don’t automate this fully right now, define the rubric so the number means something.

#### Contract tests (chat sources)
1. When chat returns sources, each source includes:
   - `document_id`
   - `page_number`
   - `citation_id` **optional**
   - `anchor_state: "ready" | "missing" | "failed"` (or similar)
2. UI rule test:
   - `anchor_state !== "ready"` ⇒ chip is disabled, tooltip/copy matches standard string.
3. For `anchor_state="ready"`, clicking chip navigates to viewer with `citation_id`.

#### Enable/disable threshold decision test
Pick a threshold now so behaviour doesn’t drift:
- **If chat anchor coverage ≥ 80%** in the measured sample, enable clickable chips by default (with disabled ones still present).
- **If < 80%**, still show chips but consider making the “click to evidence” affordance secondary (for example, show a “View evidence (when available)” affordance or keep disabled state prominent).  
This avoids shipping a UI that feels “mostly broken” in early parity.

### Unresolved ambiguity you must decide before implementation
**How do chat sources get `citation_id`?** There are two realistic paths:

1. **Persist chat messages + citations** (moderate backend)
   - On chat response, write a chat_message row + citation rows associated to `chat_message_id`.
   - Stream includes `citation_id`s for those citations.
   - Pros: reuses existing citations model and viewer.
   - Cons: introduces DB writes and lifecycle (retention, ordering, pagination) you haven’t otherwise built yet.

2. **Do not persist, but create “ephemeral citation” payloads** (viewer changes)
   - Stream includes enough anchor data for viewer directly.
   - Pros: avoids DB writes.
   - Cons: you are inventing a parallel citation model, which is a long-term maintenance tax.

Given your existing “citation one-of constraint” and viewer trust posture, I’d pick **(1)** unless you explicitly want chat to be non-persistent forever.

### PRD patches implied
- **`0009d`**: explicitly add the “how chat produces citation_id” decision to the open questions, and lock the `ChatSource` fields (`citation_id?`, `anchor_state`, maybe `source_run_id`).
- **`0009b`**: define the viewer deep-link contract for chat sources (citation id route is simplest).
- **`findings.md`**: anchor coverage metric definition should be written down once so everyone measures the same thing.

---

## SP-0009-03: setup readiness taxonomy (already resolved)

This one is already locked in `0009a` PRD JSON, but here’s the decision record in “spike dossier” format anyway.

### Options

#### Option A (recommended and already locked): Canonical, minimal readiness taxonomy
- Folder states: `empty | ingesting | indexed | ready | failed`
- Document states: parse `queued/parsing/parsed/failed`, OCR `queued/running/done/failed`
- Setup UX shows only these, plus quality/page consistency signals already derivable.

#### Option B: Expose pipeline internals as setup steps
- Break ingestion into extra steps (chunking, embedding, indexing phases)
- Show detailed counters and internal telemetry

This violates your guardrails (no pipeline internals, no hardcoded ingest stats) and increases surface area for drift.

### Recommendation
Stick with **Option A** (already locked).

### Decision tests
- Setup page must be renderable entirely from:
  - `GET /api/folders/:id/documents` fields (parse_status, ocr_status, quality, page_count, errors)
  - derived folder state (`empty/ingesting/indexed/ready/failed`)
- No UI text claims like “securely loaded”, “verified” unless backed by actual payload fields (W‑C7).
- No hardcoded document counts or “all ready” banners not backed by state (W‑C4).

### PRD patches
None required, but you should keep a single “state mapping table” in `0009a` so UI copy doesn’t drift.

---

## SP-0009-04: support escalation ownership (already resolved)

### Options

#### Option A (recommended and locked): Config-driven mailto escalation
- Error banner shows “Need help?” that opens a configured mailto: link with prefilled safe context:
  - `code`
  - `trace_id`
  - route/action context
- If no mailto configured, show fallback instructions and make identifiers copyable.

#### Option B: In-app support route (no backend ticketing)
- “Need help?” opens `/support` with prefilled context.
- Still needs ownership, routing, and a place to send it.

#### Option C: Backend ticket endpoint
- Fully out-of-scope for parity v1 and adds operational surface area.

### Recommendation
Option A (already locked in `0009f`).

### Decision tests
- Support link must never include raw `details` or stack/provider payload.
- When mailto target is unset:
  - Support CTA is disabled or replaced with deterministic text instructions.
  - Code + trace id remain visible.
- Works from at least two surfaces (exports + chat) with consistent formatting.

### PRD patches implied
- **`0009f`** should explicitly define the mailto env var name and the safe subject/body template format (still without leaking sensitive info).

---

## SP-0009-05: run timestamps for coarse elapsed checklist timing

### What’s true in live code today
- `GET /api/runs/:id` returns progress + failure_counts, but **no timestamps**.
- The matter detail page can display created/updated timestamps for the latest run server-side, but that’s not a reusable API contract.
- You have an explicit exclusion: **no second-level timers** (W‑C11).

So the core question is: *can we get a stable minute-level elapsed time that survives refresh and doesn’t require new telemetry infrastructure?*

### Options

#### Option A (recommended): Add timestamps to run APIs, compute elapsed in UI
- Extend `GET /api/runs/:id` response to include `created_at` and `updated_at` (and `started_at` if it exists, otherwise define `created_at` as start for parity v1).
- Optionally include same fields in `GET /api/folders/:id/runs` so the checklist can avoid extra calls.
- UI computes `elapsed_minutes = floor((now - started_at)/60s)` and renders as `7m`, `1h 12m`, etc. No seconds.

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Fast. One SQL select extension + UI formatting. |
| Risk | Low. Uses existing DB timestamps. |
| Complexity | Low. |
| UX trust | High. Stable across refresh. |
| Extensibility | High. Later can add derived durations or richer telemetry. |

#### Option B: Server computes elapsed_minutes and returns it
- API returns `elapsed_minutes` precomputed.
- UI just renders.

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Fast. |
| Risk | Low. |
| Complexity | Low-medium (time source-of-truth and caching). |
| UX trust | High. |
| Extensibility | Medium. Might need changes for different contexts. |

#### Option C: Client-side stopwatch from “Run started” click
- No backend work.
- Breaks on refresh and multi-operator reality.

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Fast. |
| Risk | Medium-high. Inaccurate, loses trust. |
| Complexity | Low. |
| UX trust | Low. |
| Extensibility | Low. |

### Recommendation
**Option A**.

And keep it dead simple:
- For parity v1, define elapsed start as `runs.created_at` unless you already have a dedicated `started_at`.
- Show minute-level only.
- If timestamps missing, show “Elapsed unavailable” rather than guessing.

### Concrete acceptance tests
1. `GET /api/runs/:id` includes:
   - `created_at: ISO string`
   - `updated_at: ISO string`
2. Demo checklist card:
   - renders `elapsed` as whole minutes only (never seconds)
   - refresh page: elapsed remains consistent (continues from backend timestamps)
3. Edge states:
   - run state `cancelled/failed/partial` still shows elapsed since created_at but labels state clearly.
   - no run exists: checklist shows “Not started” and no elapsed value.

### PRD patches implied
- **`0009e`**: lock the start timestamp definition (created_at vs started_at) so nobody “helpfully” changes it mid-implementation.
- **`0009c` / `N7`**: if run selector needs timestamps anyway, include them once in runs list shape.

---

## SP-0009-06: mandatory polish checks (what is required vs nice-to-have)

This spike is about stopping polish from becoming vibes. You need a short, enforceable checklist that:
- improves trust and usability everywhere
- doesn’t reintroduce excluded wireframe items
- doesn’t block delivery with endless micro-tweaks

### Options

#### Option A (recommended): “3 mandatory checks” + explicit exclusion re-check
Pick three things that must pass on **every** surface touched by 0009 work:

1. **State clarity**  
   Every async surface must have: loading, empty, blocked, and success states with deterministic next action guidance.
2. **ErrorBanner consistency**  
   Deterministic code + trace id visible; retry only when retryable; support action only when configured.
3. **Interaction accessibility**  
   No hover-only essential actions; keyboard focus return is correct (viewer/drawers); one primary CTA per context.

Plus a **guardrail audit**:
- no hardcoded IDs/stats/dates
- no unsupported capability promises
- no trust claims without source fields
- no second-level timers

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | High. Easy to enforce. |
| Risk | Low. |
| Complexity | Low. |
| UX trust | High (hits biggest trust points). |
| Extensibility | High. You can add more later. |

#### Option B: Big mandatory checklist (8–12 items)
Covers everything, but enforcement becomes slow and subjective.

**Tradeoffs**
| Dimension | Impact |
|---|---|
| Delivery speed | Medium-low. |
| Risk | Medium. People will start arguing about polish instead of shipping. |
| Complexity | Medium. |
| UX trust | High if executed perfectly. |
| Extensibility | Medium. Checklist gets ignored over time. |

#### Option C: Per-surface polish rules only
Each slice decides its own “polish”. This is basically how drift happens.

### Recommendation
**Option A. Three mandatory checks + guardrail audit.**

### Concrete decision tests (enforceable)
1. **State clarity test**
   - For each major surface (setup/report/viewer/exports/artefacts/chat/demo):
     - simulate loading: skeleton appears (using v5 preset `.skeleton` is fine)
     - simulate empty: shows explicit “what next” action
     - simulate blocked: shows deterministic reason and the recovery path
2. **ErrorBanner test**
   - Given a deterministic error envelope, the banner always renders:
     - code + trace id
     - retry button only when `retryable=true`
     - support action only when configured
3. **Interaction/accessibility test**
   - Keyboard-only walkthrough:
     - open drawer, open viewer, close viewer (Esc and close button)
     - focus returns to invoking element
     - no critical action requires hover

### PRD patches implied
- **`0009g`**: replace the open question (“which two to three”) with this locked set, and add a PR checklist template snippet that every PR must tick.
- **`0009f`**: ensure the error envelope fields required for banner exist (`retryable`, `support_hint`) and chat stream error events align.

---

## Unresolved ambiguities to decide *before* implementation starts

These are the ones that will cause rework if you “figure it out later”:

1. **Chat scoping when there are zero completed runs**
   - Allowed (use latest index, effective_run_id=null) vs disabled until first run exists.
   - My vote: allowed if folder is `indexed|ready`, because U43 is about missing indexed docs, not missing runs.
2. **Do we persist chat messages + citations?** (SP‑0009‑02)
   - If you want real click-to-evidence with highlight, persistence is the clean path.
3. **Run picker contents**
   - Completed only (recommended for v1) vs include in-progress with warnings.
   - My vote: completed only for parity v1. Less confusion, less mismatch.
4. **Elapsed timing start definition**
   - `created_at` vs `started_at` (if it exists) vs first progress update.
   - My vote: `created_at` unless you already store `started_at` reliably.
5. **Chat stream metadata shape**
   - Add fields to existing `meta` event vs add new `scope` event.
   - My vote: add a new `scope` event emitted immediately after `meta`, because it’s cleaner and keeps trace-only meta stable.

---

## Suggested “implementation start sequence” (practical and parallel)

### Lane 1: Run scoping foundation (unblocks exports + chat)
- Implement **`GET /api/folders/:id/runs`** (N7)
- Implement **SP‑0009‑01** contract in chat API:
  - request accepts optional `run_id`
  - stream emits scope metadata early
  - deterministic fallback rules
- Update exports run selector to use runs list

### Lane 2: Evidence + anchors
- Decide chat citation strategy (persist vs ephemeral)
- Extend chat `sources` schema to include `citation_id?` + `anchor_state`
- Implement disabled/jump behaviour for chips (strict anchor-only)

### Lane 3: Error + support standardisation (can start now)
- Extend safe error envelope fields (`retryable`, `support_hint`)
- Build reusable ErrorBanner and wire it into at least: upload, export, chat failure

### Lane 4: Demo operator telemetry
- Extend `/api/runs/:id` (and/or runs list) to include timestamps
- Implement coarse elapsed formatting in checklist card

### Lane 5: Final polish gate
- Lock the 3 mandatory checks + guardrail audit
- Add PR template checklist and do the sweep in `0009g`

If you want, I can also draft the exact API shapes (request/response JSON + NDJSON event examples) for SP‑0009‑01 and SP‑0009‑02 so teams stop “interpreting” them differently mid-flight.
