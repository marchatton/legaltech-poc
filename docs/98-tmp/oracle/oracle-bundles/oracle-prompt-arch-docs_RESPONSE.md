Below is a docs-first review of `docs/03-architecture/` with a sanity check against the code you’ve included (hashing, polygon mapping, verifier, missing-docs, safe error envelope, fixture tooling, and the dev-only CSV export route). I’m assuming anything not in the provided context (WDK workflows, most HTTP endpoints) is still to be built.

I’ve grouped findings by file. Within each file, most severe first. For each: why it matters, and concrete edits (often with suggested text).

---

## `docs/03-architecture/40_rag_and_agents.md`

### 1) Verification section contradicts ADR-0017 and the “trust substrate” slice

**What’s off**

* This doc still describes “Verification” as a 2-layer thing including semantic entailment (it literally spells out an entailment judgement step and uses it to set `ENTAILMENT_FAIL`).
* ADR-0017 explicitly says verification v1 is integrity-only and no entailment model.
* And your current core verifier (`packages/core/src/verify/verifier.ts`) supports entailment mode, but the PoC baseline is clearly meant to run `deterministic-only`. Right now the doc reads like entailment is baseline.

**Why it matters**

* It changes the product promise. “We verify” reads as “we semantically check”, which you’ve explicitly cut for v1.
* It also changes failure expectations. Your fixture and UX will look “broken” if people expect entailment blocking.

**Concrete proposed edits**
Replace the current “Verification (fail-closed)” section with something that matches ADR-0017 and your code.

Suggested replacement:

```md
## Verification (fail-closed, v1 = integrity-only)

Verification v1 is **integrity-only** (ADR-0017). It does not use an entailment model.

Deterministic checks (hard gates):
1) Schema validity (Zod)
   - Row payload validates against the pinned schema.
2) Missing-input invariants
   - If `answer` is exactly `Not found in provided documents.`, citations must be empty.
   - If `answer` is anything else, citations must be non-empty.
3) Citation integrity
   - Every citation’s `snippet_hash` matches `hashSnippet(snippet)` using the canonical rule.
   - Every citation has valid `polygons` (non-empty; points in `[0..1]`; page_number is valid).
4) Export gating invariants
   - Row statuses are terminal, and non-exportable statuses are explicit (see state model).

Output mapping (v1):
- `needs_review`: deterministic checks pass
- `missing_input`: exact missing-input answer string + zero citations
- `citation_failed`: anything else that fails deterministic verification (store a reason_code)

Note: semantic correctness is a reviewer responsibility in v1. If/when we add entailment later, it must be fixture-eval’d and gated behind flags (ADR-0017).
```

And then remove or reframe any mention of entailment verdicts as runtime behaviour. If you want to keep entailment in the doc, park it under an explicit “Future: entailment mode” subsection with a big “not used in v1” warning.

---

### 2) Retrieval “returns IDs only” but drafting contract assumes snippets without stating the hydrate step

**What’s off**

* The doc says retrieval returns chunk IDs (good).
* Then the drafting contract takes `evidence: [{chunk_id, snippet, ...}]`. That implies another step loads the chunk text by ID, but the doc doesn’t make that explicit.

**Why it matters**

* This is a common drift point. Someone will “just return snippets from retrieval” and you lose the IDs-only contract you’ve been careful about (ADR-0004/ADR-0001).

**Concrete proposed edits**
Add one explicit step between retrieve and draft:

```md
Runtime (per question)
1) Retrieve: hybrid search returns chunk IDs + scores (IDs-only contract)
2) Hydrate: fetch canonical chunk text + geometry metadata by chunk ID (DB read)
3) Draft: generate row JSON from hydrated evidence only
4) Lock: chunk IDs -> locked citations (citation IDs)
5) Verify: deterministic integrity checks (v1)
6) Write: persist row + citations + status
```

And in “Drafting” update the input to reference “hydrated evidence”.

---

### 3) Failure codes and “reason_code” language is drifting from the actual code + fixture tooling

**What’s off**

* This doc suggests reason codes like `ENTAILMENT_FAIL`, but your verifier also returns codes like `NO_CITATIONS`, `MISSING_INPUT_INVARIANT`, `VALIDATION_ERROR`, `DETERMINISTIC_ONLY`.
* Your fixture invariant script (`scripts/fixtures/assert_row_invariants.ts`) optionally enforces a different set of “strict” codes (OCR_FAIL etc).

**Why it matters**

* If you don’t define “what taxonomy is for what layer”, dashboards and fixture gating will become noise.

**Concrete proposed edits**
In this file, don’t try to define the global taxonomy. Just:

* say “store a stable reason_code” and
* link to `60_observability_and_evals.md` for the taxonomy tiers (after you fix that doc, see below).

---

## `docs/03-architecture/06_frameworks_agents_rag_evals.md`

### 1) It still states verification includes entailment (contradiction with ADR-0017)

**What’s off**

* Under “Where RAG fits (end-to-end)” it says: `Verify: hash checks + entailment check`.

**Why it matters**

* This is the “why we chose WDK” doc. People will trust it as canonical. Right now it undermines ADR-0017.

**Concrete proposed edits**
Change that line to:

```md
4) Verify: deterministic integrity checks (hash + geometry + invariants). (ADR-0017)
```

And add a small explicit note:

```md
Entailment verification is out of scope for PoC v1. If enabled later, it must be gated + fixture-eval’d; treat UNSURE as FAIL.
```

---

### 2) Verify step claims it can “correct the answer”

**What’s off**

* It says: “Output: pass/fail + corrected answer if needed”.
* Your current verifier API (`verifyRow`) does not return a corrected answer, and ADR-0017 suggests verification is integrity-only anyway.

**Why it matters**

* If verification can rewrite answers, you now have an implicit second drafting step, and you need to re-lock citations. That’s a big workflow complication and a trust risk.

**Concrete proposed edits**
Change verify step description to:

```md
Verification agent (citation QA)
- Implemented as a step: `verify_row_step(row_json, locked_citations)`
- Output (v1): pass/fail + reason_code (+ safe reason text)
- Note: verify does not rewrite answers in v1. Any rewrite belongs in drafting and must re-run lock+verify.
```

---

### 3) Evals section implies entailment judge checks as “recommended” without clarifying it’s eval-only

**Why it matters**

* You’ll confuse runtime vs offline evaluation.

**Concrete proposed edits**
Reframe “Judge checks (optional but recommended)” to:

```md
Judge checks (eval-only, not runtime)
- Conservative rubric: does snippet support claim?
- Used to detect VERIFICATION_FALSE_PASS and retrieval drift
```

---

## `docs/03-architecture/30_data_model.md`

### 1) Citation geometry is treated as mandatory, but core verifier schema makes `polygons` optional

**What’s off**

* Data model + state model imply that locked citations include geometry and must validate fail-closed.
* But `packages/core/src/verify/verifier.schemas.ts` has `polygons` as `.optional()`.
* And `verifyRow()` doesn’t check geometry at all, only snippet hashes and citation presence.

**Why it matters**

* You can end up with a “verified” row that cannot be highlighted. That’s trust leakage in UX terms.
* It also conflicts with your own state model invariant: `needs_review|reviewed` rows require “snippet + hash + geometry”.

**Concrete proposed edits (docs + code-alignment callout)**
Docs edit: make geometry requirement explicit where verification is described (or add a bold line inside the `citations` table section):

```md
Invariant (PoC v1):
- Any citation referenced by an exportable row MUST include `polygons`.
- Verification MUST fail-closed if polygons are missing or invalid.
```

And I’d also update the doc to call out the expected verifier schema:

```md
Implementation note:
- `VerifyCitationSchema.polygons` should be required for v1 integrity verification.
```

And then, separately (not a docs change, but you asked for sanity check): update `VerifyCitationSchema` to make polygons required, and update `verifyRow()` to rely on schema validation for polygon presence. Right now the doc promises something the code does not enforce.

---

### 2) Storing full extracted text in Postgres is a major privacy/security assumption and it’s not called out as such

**What’s off**

* The doc says “Avoid logging full extracted document text” (good), but the data model explicitly stores canonical text in `document_pages.text` and chunk text in `chunks.text`.
* That is totally fine for the product, but it changes the security posture: Postgres now holds the document content, not just metadata.

**Why it matters**

* For CRE diligence packs, this can include privileged information, personal data, signatures, financial terms.
* Any “single VM PoC” posture needs an explicit statement about encryption at rest, backups, and who can access DB dumps.

**Concrete proposed edits**
Add a dedicated “Data sensitivity” subsection near the top (Design rules) or in the `document_pages` section.

Suggested text:

```md
## Data sensitivity (explicit)

This system stores extracted document text in Postgres (`document_pages.text`, `chunks.text`) and raw PDFs in object storage.
Treat both as confidential customer data.

Minimum PoC posture (even single-tenant):
- Encrypt storage and database volumes at rest where possible.
- Backups are sensitive (DB dumps contain full extracted text).
- Do not log raw extracted text or raw PDF bytes.
- Provider calls (OCR/LLM/embeddings) may transmit document content externally; this must be disclosed and gated by config.
```

---

### 3) Hashing rule is consistent with `hashSnippet()`, but the doc should explicitly state encoding and that newlines collapse to spaces

**Why it matters**

* You will use this hash in invariants and “citation drift” detection. Tiny ambiguity causes surprise failures.

**Concrete proposed edits**
Tiny tweak to the hashing rule section:

```md
- Hash input is UTF-8 encoded.
- `normalise()` collapses all whitespace runs (including newlines and tabs) to a single space.
```

(That matches your `normaliseSnippet()` implementation.)

---

## `docs/03-architecture/20_state_model.md`

### 1) Verification semantics are mixed: state model hints at entailment-driven failures, but ADR-0017 says integrity-only

**What’s off**

* Under `citation_failed`, examples include `ENTAILMENT_FAIL`.
* That’s not wrong as a future code, but as written it reads like baseline.

**Why it matters**

* Teams will implement extra logic early “because the state model says so”.

**Concrete proposed edits**
Add a single line to anchor v1:

```md
Note (PoC v1): `citation_failed` reason codes are integrity-only (ADR-0017). Entailment codes are reserved for a later, gated version.
```

---

### 2) “Extraction quality” is used as a hard threshold for `ready`, but not defined anywhere

**What’s off**

* `ready` requires `extraction_quality >= 0.60`.
* But what is `extraction_quality`? OCR mean confidence? A heuristic? Provider-specific?

**Why it matters**

* You’ll get non-determinism and debate: “why did this folder never reach ready?”
* Fixture evals will drift if the definition changes.

**Concrete proposed edits**
Add a definition:

```md
### extraction_quality (PoC definition)
`documents.extraction_quality` is a normalised 0..1 score derived from OCR/layout output.
PoC default: provider mean line confidence (or equivalent), clamped to [0..1].

Rules:
- Only set when `ocr_status = done`.
- Record `extraction_quality_method` (string) in `documents.error_json` or metadata so we can version it.
- If the method changes, bump `index_version` (ADR-0015) and treat as a fixture-breaking change.
```

If you don’t want to decide method yet, be explicit: “placeholder score, not yet stable” and don’t make it a `ready` gate.

---

### 3) State derivation vs stored state could be clearer

**Why it matters**

* You’ll have drift if you store `folders.state` but don’t define reconciliation.

**Concrete proposed edits**
Add a short note:

```md
Implementation note:
- `folders.state` is stored for UI convenience, but must be derivable from facts.
- Add a debug endpoint or admin script that recomputes derived state and reports inconsistencies (fail loudly internally).
```

---

## `docs/03-architecture/10_system_architecture.md`

### 1) It still labels several ADRs as “proposed” even though they’re marked accepted in `DECISIONS.md`

**What’s off**

* Example: deployment posture and storage ADRs are referenced as “proposed” in some places, but `DECISIONS.md` shows them as accepted.

**Why it matters**

* This is supposed to be the “canonical high-level map”. If ADR status is wrong here, people stop trusting the docs.

**Concrete proposed edits**
Search and replace “proposed” qualifiers that are no longer true (ADR-0009, ADR-0010, ADR-0011, ADR-0012, ADR-0013, ADR-0014). Either:

* remove the “proposed” adjective entirely, or
* add a one-line ADR status note that is kept accurate.

Example edit:

```md
### Single VM (Hetzner-first; ADR-0009)
```

(not “proposed”)

---

### 2) “Open questions to pin” section is out of date (chunking + question sets are now pinned)

**What’s off**

* It lists chunking strategy and question set storage as open.
* ADR-0015 and ADR-0016 now pin both.

**Why it matters**

* New contributors will waste cycles re-litigating decisions that are already in the ADR log.

**Concrete proposed edits**
Update that list to only include truly open items (likely auth posture, embeddings model/dimension, rerank default, retention policy).

Suggested replacement:

```md
## Open questions to pin (candidate ADRs)
- Embeddings default: model + dimension + index params (fixture-breaking).
- Auth posture for the PoC (demo deployments especially).
- Data handling posture: retention, provider data policies, telemetry redaction defaults.
```

---

### 3) Missing “data flow / trust boundary” diagram

**Why it matters**

* Your architecture is fundamentally “trust UX”. The diagram should show the sensitive data boundaries, not just components.

**Concrete proposed edits**
Add a small mermaid diagram (one screenful) that shows where raw PDFs and extracted text move, and what leaves your system to providers.

Example:

````md
## Data flow and trust boundaries (PoC)

```mermaid
flowchart LR
  U[User uploads PDFs] --> OBJ[Object storage: raw PDFs]
  OBJ --> OCRP[OCR provider]
  OCRP --> PG[Postgres: document_pages.text + layout_json]
  PG --> CH[Chunking/Indexing]
  CH --> PG
  PG --> LLM[LLM/Embeddings providers]
  LLM --> PG
  PG --> UI[UI: citations + viewer]
````

````

And then add 3 bullets of safety rules (no raw provider payloads, no logging raw text, signed URL TTL).

---

## `docs/03-architecture/50_api_surface.md`

### 1) It reads like “implemented contract”, but current repo has a dev-only `/export/csv` with a different body shape
**What’s off**
- The doc is “canonical HTTP contract”.
- But the actual code includes a dev-only `/export/csv` route that takes `{ pack_id }` and returns CSV bytes directly (no artefact record, no run state).
- That’s fine as a tracer bullet, but the doc doesn’t warn you there’s already a conflicting stub endpoint.

**Why it matters**
- Someone will build a client against the stub or merge the stub into “real”, and the contract will become muddled.
- This is one of those avoidable “we broke the API before we even shipped it” moments.

**Concrete proposed edits**
At the top of the doc, add a blunt note:

```md
> Note: This document describes the target PoC API surface.
> The repo currently contains dev-only spike endpoints (e.g. fixture export) that do not match this contract and must not be treated as stable.
````

And add a short “Dev-only spike endpoints” appendix with a rule:

```md
Dev-only spike routes MUST live under a clearly non-production prefix (e.g. `/__spikes/*`) or be hard 404 outside development.
```

(You already 404 outside dev. The missing bit is path separation, so you don’t collide with the real endpoint names later.)

---

### 2) Auth posture is “open decision”, but the doc should explicitly state the minimum for any non-local deployment

**What’s off**

* It says environments may run without auth (fine for local).
* It also adds admin-token-gated endpoints (good).
* But it doesn’t explicitly say: “Do not expose document render URLs publicly.”

**Why it matters**

* Signed URLs + no auth becomes “anyone with link can fetch the PDF”. That’s not acceptable outside local, even for a PoC.

**Concrete proposed edits**
Under “Auth (PoC)” add:

```md
Non-negotiable for any shared/demo environment:
- Do not expose PDFs or extracted text without authentication.
- Signed render URLs must be short-lived and only issued to authenticated users.
- Never log auth tokens or signed URLs.
```

---

### 3) Error envelope: add a clear “internal vs external” rule

**Why it matters**

* You already have the right intent (“no provider payloads, no stack traces”). Codify the rule to avoid future drift.

**Concrete proposed edits**
After the envelope JSON example:

```md
Rule:
- Client responses never include stack traces or raw provider payloads.
- Server logs (internal) MUST include full error + stack trace + trace_id for debugging.
```

This keeps “fail loudly internally” explicit.

---

### 4) Define HTTP status mapping for key error codes (small but high leverage)

**Why it matters**

* Without it, different route handlers will pick random statuses and clients become brittle.

**Concrete proposed edits**
Add a short mapping section:

```md
### Status code mapping (PoC)
- 400: VALIDATION_ERROR
- 401: UNAUTHENTICATED
- 403: UNAUTHORISED
- 404: NOT_FOUND
- 409: CONFLICT, EXPORT_BLOCKED
- 429: RATE_LIMITED
- 500: INTERNAL
```

(Your current dev-only export uses 409 for EXPORT_BLOCKED, which matches this.)

---

## `docs/03-architecture/60_observability_and_evals.md`

### 1) Taxonomy mixes layers and doesn’t match current verifier reason codes

**What’s off**

* The baseline taxonomy list is mostly system/step failures (OCR_FAIL, CHUNKING_FAIL, etc).
* But your verifier produces row-level reason codes like `NO_CITATIONS`, `MISSING_INPUT_INVARIANT`, `VALIDATION_ERROR`.
* And your fixture invariant tool optionally enforces a strict list that currently does not include those row-level codes.

**Why it matters**

* You will end up with either meaningless dashboards or constant taxonomy churn.
* And fixture gating will be a footgun.

**Concrete proposed edits**
Add a “taxonomy tiers” section and make it explicit there are at least two fields:

```md
## Taxonomy tiers (keep them separate)

1) `failure_code` (system/step-level)
- Used in `run_steps.error_json`, run summaries, infra dashboards.
- Examples: OCR_FAIL, CHUNKING_FAIL, RETRIEVAL_MISS, EXPORT_FAIL

2) `reason_code` (row verification-level)
- Used when a row ends as `citation_failed`.
- Examples (v1): VALIDATION_ERROR, NO_CITATIONS, MISSING_INPUT_INVARIANT, CITATION_MISMATCH
- Entailment codes are reserved for later (ADR-0017).
```

And then update the “Baseline codes” list accordingly, or split it into two lists.

Also update the “structured log shape” example to include both when appropriate.

---

### 2) Telemetry redaction defaults should be explicit (AI SDK + provider calls)

**What’s off**

* You mention “avoid logging full extracted document text” (good).
* But you also show AI SDK telemetry usage in other docs, and don’t clearly define default redaction posture.

**Why it matters**

* It’s easy to accidentally record prompts and doc text in third party logs.

**Concrete proposed edits**
Add a small section:

```md
## Telemetry redaction defaults (PoC)
Default posture:
- Do not record LLM inputs/outputs in telemetry in shared environments.
- Prefer hashes + IDs: {run_id, step_key, chunk_ids, citation_ids, snippet_hash}.

If enabling detailed telemetry in local dev:
- Gate behind an env flag (e.g. `TELEMETRY_DEBUG=1`).
- Never include raw PDFs or full extracted text.
```

---

### 3) Trace export safety: define what “safe by default” actually means

**Why it matters**

* You already have ADR-0018. Make the doc specify the exact redaction rules so the endpoint doesn’t drift into leaking text.

**Concrete proposed edits**
Add:

```md
Trace export redaction rules:
- Never include raw PDF bytes.
- Avoid full extracted text. If needed, include only snippet hashes and short snippets (bounded length).
- Never include provider request/response payloads.
- Never include secrets, tokens, signed URLs.
```

---

## `docs/03-architecture/05_tech_stack_and_dev_workflow.md`

### 1) Multiple places call ADRs “proposed” but ADR log marks them accepted

**Why it matters**

* This is the doc people read to know what’s settled.

**Concrete proposed edits**
Go through and remove “proposed” qualifiers where ADR status is accepted (0009–0014 in your ADR log).

---

### 2) The “Core commands” section doesn’t match actual repo scripts yet

**What’s off**

* This doc suggests commands like `pnpm fixture:ingest` / `pnpm fixture:run` / `pnpm fixture:eval`.
* The repo currently has `pnpm fixture:seed`, plus the verify scripts and pack-name checks.

**Why it matters**

* New devs will copy-paste and hit dead ends.

**Concrete proposed edits**
Replace that section with what exists today, and then add “planned” commands separately.

Suggested text:

```md
### Current (implemented) fixture commands
- `pnpm fixture:seed pack_01_clean`
- `pnpm fixture:seed pack_02_missing_rea` (when available)
- `pnpm verify` (runs pack-name sanity + lint/test/build)

### Planned (once WDK + ingest/run is wired)
- `pnpm fixture:ingest <pack_id>`
- `pnpm fixture:run <pack_id>`
- `pnpm fixture:eval <pack_id>`
```

---

### 3) Add one paragraph about pdf.js needs (Range requests + caching)

**Why it matters**

* Viewer perf and correctness depend on it. You already have RH1/RH2 framing elsewhere.

**Concrete proposed edits**
Add:

```md
PDF rendering requirements (pdf.js)
- Serve PDFs with Range request support.
- Signed URLs must allow Range headers and have short TTL.
- Prefer `Cache-Control: private, no-store` (or a deliberate caching strategy) for sensitive documents.
```

---

## `docs/03-architecture/00_overview.md`

### 1) “Open decisions” list is out of date (chunking + question sets are now decided)

**What’s off**

* It lists chunking and question set storage as open.
* ADR-0015 and ADR-0016 now pin both.

**Why it matters**

* It makes the overview feel stale, even though the ADRs are strong.

**Concrete proposed edits**
Update that section to:

```md
## Open decisions to pin (before implementation)
- Embeddings: default model + dimension + index params (fixture-breaking).
- Auth posture for non-local PoC deployments.
- Data handling posture: retention, provider data policies, telemetry redaction defaults.
```

And add “Chunking” and “Question sets” under “Key architectural decisions” with explicit ADR links.

---

### 2) Missing explicit security/privacy statement (given you process diligence packs)

**Why it matters**

* You’re handling customer-confidential docs. The overview should say what leaves the system (providers) and what is stored (DB text).

**Concrete proposed edits**
Add a short “Security and data handling” section (even if it’s PoC):

```md
## Security and data handling (PoC, explicit)
- Raw PDFs are stored in object storage; extracted text + geometry are stored in Postgres.
- OCR/LLM/embeddings calls may transmit document content to third party providers.
- Client responses never include provider payloads or stack traces (safe error envelope).
- Internal logs must include trace_id and full stack traces for unexpected failures, but must not include raw PDFs or full extracted text.
```

---

## `docs/03-architecture/DECISIONS.md`

### 1) ADRs are strong, but the rest of the docs have not been updated to reflect ADR-0015/0016/0017/0020

**Why it matters**

* Your ADR log is effectively more accurate than your “canonical” docs right now. That’s upside-down.

**Concrete proposed edits**
No change needed inside ADRs themselves, but I’d add a tiny “Doc sync rule” at the top:

```md
Rule: when an ADR is accepted, update the canonical docs (00_overview, 10_system_architecture, 40_rag_and_agents) within the same PR.
```

---

### 2) Security/privacy/data handling deserves its own ADR (currently implied, not explicit)

**Why it matters**

* You repeatedly say “no payload leaks”, but you don’t pin a retention/telemetry/provider posture anywhere as a decision.

**Concrete proposed addition**
Add ADR-0021 along the lines of:

* Status: proposed/accepted
* Decision: “PoC data handling posture” covering:

  * what’s stored where (PDFs in object store, extracted text in PG)
  * provider data handling requirements (no training where possible, configuration flags)
  * telemetry defaults (redacted in shared env)
  * signed URL TTLs and not logging them
  * admin token handling (never log; rotate; local only)

This ADR would prevent “security by vibes”.

---

## `docs/03-architecture/01_onboarding_checklist.md`

### 1) It still implies the repo may be docs-only, but you now have a runnable tracer bullet

**Why it matters**

* Onboarding should get someone to the “trust moment” fast, not ask them to guess if code exists.

**Concrete proposed edits**
Replace “Repo reality check” with a direct quickstart, and keep “docs-first” as historical context.

Suggested new section near the top:

```md
## Fast local smoke test (current repo)
- `pnpm install`
- `docker compose up -d`
- `pnpm fixture:seed pack_01_clean`
- `pnpm dev`
- Open `http://localhost:3000/matters`
- Click a citation chip and confirm viewer + overlay works (100% zoom posture per ADR-0020)
```

And then keep the rest.

Also update any “ADR-00xx proposed” phrasing to match current ADR statuses.

---

## `docs/03-architecture/AGENTS.md`

### 1) It’s a bit too generic given how specific your trust posture is

**Why it matters**

* This file is meant to be “boundary rules + security posture. Keep stable.” But it doesn’t mention the most important safety constraints you repeat elsewhere: safe error envelope, no provider payloads, no raw extracted text in logs, token handling.

**Concrete proposed edits**
Add a “Non-negotiable security/data handling” subsection:

```md
## Security and data handling (non-negotiable)
- Never return provider payloads or stack traces to clients (safe error envelope only).
- Never log secrets, admin tokens, signed URLs, or raw PDFs.
- Avoid logging full extracted document text. Prefer IDs + hashes.
- Any endpoint that returns a render URL or download URL must be authenticated in shared environments and use short-lived signed URLs.
```

And add one line about trace_id propagation (since `50_api_surface.md` defines it).

---

# Explicit security/privacy/data-handling assumptions to make concrete (currently scattered)

If you only do one docs pass, do this: make the following explicit in one place (overview or a new `70_security_and_privacy.md`, plus an ADR):

1. **What data is stored where**

* Raw PDFs in object storage.
* Extracted text and chunks stored in Postgres (sensitive).
* Citations store snippets (sensitive) plus hashes and polygons.

2. **What data leaves your system**

* OCR/layout provider gets PDF content.
* Embeddings + LLM providers get text (chunks/snippets/questions).
* And you need a stated posture: do you require “no training / zero retention” provider modes? If not, be honest and flag it as a PoC risk.

3. **Signed URL posture**

* TTL, scope, never persist, never log.
* Auth required in any shared environment.

4. **Telemetry/logging posture**

* Default: no prompts/document text in telemetry in shared env.
* Always: no provider payload dumps in DB or in client-visible errors.
* Internal logs: include trace_id + stack traces (you said “fail loudly internally”, so codify it).

5. **Admin token posture**

* Never logged.
* Header name is stable.
* Rotation story (even if manual).
* Reminder: don’t ever ship it to the browser.

---

# Quick “docs vs code reality” sanity-check highlights (so you can fix drift fast)

* ✅ Snippet hashing rule in `30_data_model.md` matches `packages/core/src/citations/snippet.ts`.
* ✅ Polygon coordinate mapping in `30_data_model.md` matches `packages/core/src/geometry/mapToViewport.ts`.
* ⚠️ Docs say verification includes geometry sanity; current `verifyRow()` checks snippet hashes but does not require polygons and does not validate them.
* ⚠️ Multiple docs describe entailment verification as baseline; ADR-0017 says no entailment in v1.
* ⚠️ `50_api_surface.md` defines `/export/csv` as “real export”, but repo currently uses `/export/csv` as a dev-only fixture export with `{ pack_id }`. That’s a naming collision waiting to happen.

If you want a single, surgical docs PR: fix entailment mentions (06 + 40), update “open decisions” (00 + 10), and add a short “security/data handling” section (00 or new file). That gets you back to a coherent, internally consistent story.
