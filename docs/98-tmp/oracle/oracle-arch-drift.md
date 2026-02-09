yo. here’s the wrap-up, based on the doc summaries you gave + the code excerpts (db.server.ts, objectStore.server.ts, ingestQueue.server.ts) and the named modules/flows.

---

# 1) Architecture Drift Report

## Executive drift statement

The docs in `docs/03-architecture/*` describe a **target WDK-style durable orchestration** with hard step boundaries (OCR → embed → retrieve → draft → lock → verify → write → export), immutable evidence, and thin validated APIs.

The actual code is a **smaller PoC scaffold**: **Next.js App Router + in-process in-memory queues**, Postgres schema created at runtime, local filesystem “object store”, pdf.js text extraction (not OCR), and “Quick Start run” writes placeholder rows (no real RAG/agent pipeline yet). That’s not a small drift. It’s a different execution model.

## Drift matrix (docs vs code)

| Area                  | Docs (target)                                                                  | Current implementation                                                                                   | Drift            | Why it matters                                                         |
| --------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------- |
| Orchestration runtime | WDK durable workflows, resumable steps                                         | In-memory queues: `ingestQueue.server.ts`, `quickStartRunQueue.server.ts`                                | **Major**        | Reliability + correctness. Restart loses work, no step-level retry/ids |
| Step contracts        | OCR/embed/retrieve/draft/lock/verify/write/export                              | Only ingest + placeholder “quick start run” rows                                                         | **Major**        | The core product behaviour isn’t there yet, docs read like it is       |
| Evidence plane        | Postgres + object storage, immutable citations w hashing + geometry            | Postgres + local FS object store, citations table exists but ingest has no geometry                      | **Major**        | “Evidence-first” invariant is only partially real                      |
| OCR + layout          | OCR/layout providers, geometry-backed citations                                | pdf.js text extraction, `has_geometry: false`, `polygons_json` required but can’t be real                | **Major**        | Highlights and provenance cannot match docs                            |
| Data model            | Canonical ERD + invariants (snippet_hash rule, index versions, etc.)           | Runtime DDL in app, schema differs (citations uses `polygons_json`, missing fields like `index_version`) | **Major**        | Hard to reason about invariants + migrations                           |
| API surface           | Thin handlers, Zod validation, safe error envelope, admin token, spikes gating | Next route handlers; some gating is `assertDevOnlyApi()` + env flags; Zod coverage unclear               | **Medium/Major** | Access control + consistency drift from docs                           |
| State model           | Explicit state machines + export gating                                        | Folder state derived from DB facts (`folderState.server.ts`), spikes exporter exists                     | **Medium**       | You can accidentally bypass “gated export” rules                       |
| Verification          | PoC v1 integrity-only (per docs)                                               | `verifyRow()` exposes `deterministic-only` **or** `entailment`                                           | **Medium**       | Docs promise deterministic integrity; code hints at LLM mode           |
| Observability/evals   | Traces + redaction expectations + taxonomy                                     | `trace.server.ts` sets traceId; trace export reads seeded snapshots                                      | **Medium**       | Docs imply full discipline; code is “just enough for dev”              |

## Drift by doc file (what to change / what’s missing)

* `10_system_architecture.md`:
  Drift is basically the whole runtime. Replace “WDK durable orchestrator” with “in-process queue scaffold” as **current state**, and keep WDK as **target**.
* `20_state_model.md`:
  Docs say state machines + invariants + export gating. Code currently derives state and has spike exporters. Either enforce gating in code or downgrade docs to “planned”.
* `30_data_model.md`:
  Docs claim canonical ERD + citation immutability and snippet hash rules. Code has citations but schema differs and is created at runtime. Call it out explicitly as v0 schema.
* `40_rag_and_agents.md`:
  Docs describe retrieval/draft/lock/verify contracts. Current code does not implement retrieval/draft/lock at all.
* `50_api_surface.md`:
  Docs mention admin token + spikes gating + error envelope. Code uses dev-only gates and scattered flags. You need one consistent policy.
* `60_observability_and_evals.md`:
  Docs are ahead. Code has a traceId and a dev trace exporter. Needs “redaction and retention are future work” callout.
* `DECISIONS.md`:
  Evidence-first is partially implemented (snippet hashing exists). But immutability + geometry + durable steps are not there. Also “integrity-only” vs `entailment` mode is drift.

## Bottom line

Right now the docs read like **the product already has WDK durability + full evidence pipeline**. The repo is a PoC with scaffolding. You should either:

1. **Re-scope docs to “target architecture” and add a “current PoC architecture” chapter**, or
2. **Implement the missing slices** (durability + step boundaries + evidence immutability) so docs are true.

---

# 2) Prioritised action plan

### P0 (this week): make behaviour safe + docs honest

**Docs updates (P0)**

* Add a banner at top of `docs/03-architecture/*`: “Target architecture. Current PoC differs.” Then link to a new `docs/03-architecture/05_current_poc_architecture.md`.
* In `40_rag_and_agents.md`, explicitly mark retrieve/draft/lock as **not implemented** and list current behaviour (placeholder run rows).
* In `50_api_surface.md`, document the real gating policy used today (dev-only vs env flags), even if ugly.

**Security fixes (P0)**

* Make signature verification enforce expiry (or make it impossible to forget). See SEC-OBJ-001 below.
* Put hard limits on ingest (pages, bytes, runtime) to reduce trivial DoS. See SEC-ING-001.

**Code correctness (P0)**

* Stop calling pdf.js extraction “OCR done” unless you really mean it. Rename status or store “extraction method”.

### P1 (next): align contracts without building the whole WDK

**Code refactors (P1)**

* Replace in-memory queues with a minimal durable job model:

  * Option A: Postgres-backed jobs table + poller worker.
  * Option B: a real workflow runtime later, but start by making jobs durable now.
* Introduce a “step boundary” abstraction even if it all runs in one worker. This makes the WDK transition possible.

**Data plane alignment (P1)**

* Bring citations closer to doc invariants:

  * add FK on `document_id`
  * allow `polygons_json` to be empty array and validate it’s an array
  * add “immutable once locked” guard (trigger or update ban)
  * consider adding `index_version` to citations so it matches chunks/runs

**API surface (P1)**

* Enforce Zod validation consistently in route handlers.
* Standardise the safe error envelope everywhere (including upload/object-store failures).

### P2 (later): finish the story

* Implement real retrieval/draft/lock pipeline (even minimal “retrieve + draft + lock citations”).
* Observability: trace redaction, structured logs, eval taxonomy alignment.

---

# 3) Security audit report (threat-model-lite + OWASP-ish)

## Threat model lite

**Assets**

* Uploaded PDFs and extracted text (confidential)
* Report rows + citations (integrity-critical)
* Trace exports (often leak-prone)
* Object store files (can be exfil / overwrite target)

**Trust boundaries**

* Browser/client → Next.js route handlers
* Route handlers → Postgres
* Route handlers → local object store filesystem
* In-process queues (same trust domain, but reliability boundary)

**Main attacker stories**

* Unauthorised access to exports/artefacts/trace endpoints (Broken Access Control)
* Replay or misuse of signed upload headers (Insecure Design / Broken AuthZ)
* Resource exhaustion via large PDFs (DoS)
* Evidence tampering if DB/API paths allow updates (Data integrity)

## Findings (confirmed from provided excerpts)

### SEC-OBJ-001: Signature verification does not enforce expiry (footgun)

* **Category:** OWASP A04 Insecure Design / A01 Broken Access Control (depending on caller usage)
* **Severity:** High if any route forgets to check expiry, otherwise Medium
* **File+line:** `apps/web/lib/objectStore.server.ts:87-93`
* **Evidence snippet:**

  ```ts
  87 export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
  88   const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
  89   const a = Buffer.from(expected);
  90   const b = Buffer.from(args.sig);
  91   if (a.length !== b.length) return false;
  92   return timingSafeEqual(a, b);
  93 }
  ```
* **Impact:** A caller can “successfully verify” an already-expired signature if they don’t separately compare `expiresAtMs` with `Date.now()`. That turns “expiring signed headers” into “bearer tokens with undefined lifetime”.
* **Exploit sketch:** Capture `expires_at_ms` + `signature` (from logs, browser devtools, proxy). Replay upload later. If route only calls `verifySignature`, it passes.
* **Minimal-diff fix (make expiry non-optional):**

  ```ts
  export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
    const now = Date.now();
    if (!Number.isFinite(args.expiresAtMs)) return false;
    if (args.expiresAtMs < now) return false;               // expired
    if (args.expiresAtMs > now + 24 * 60 * 60 * 1000) return false; // cap future window

    const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
    const a = Buffer.from(expected);
    const b = Buffer.from(args.sig);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
  ```

  And then routes don’t need to remember an extra expiry check.

---

### SEC-OBJ-002: Path traversal blocked, but symlink escape not explicitly handled (defence-in-depth)

* **Category:** OWASP A01 Broken Access Control / A04 Insecure Design
* **Severity:** Medium (depends if attacker can create symlinks in store)
* **File+line:** `apps/web/lib/objectStore.server.ts:47-52`
* **Evidence snippet:**

  ```ts
  47 function resolveObjectPath(storageKey: string): string {
  48   const base = objectStoreRoot();
  49   const candidate = path.resolve(base, storageKey);
  50   if (!candidate.startsWith(base + path.sep)) throw new Error("PATH_TRAVERSAL");
  51   return candidate;
  52 }
  ```
* **Impact:** If an attacker can introduce a symlink under `base`, later reads/writes can land outside the object-store root even though the path prefix check passes.
* **Exploit sketch:** Create `tmp/object-store/x` as symlink to `/etc/…` then upload/read `x/whatever`. (Whether this is doable depends on your write primitives.)
* **Minimal-diff fix:** When opening files, use `O_NOFOLLOW` and/or `lstat` checks on the final path.

  * Example (Linux-friendly):

    ```ts
    const fd = await fs.promises.open(candidate, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_NOFOLLOW);
    ```
  * Also consider `realpath` on base and candidate before the startsWith check.

---

### SEC-OBJ-003: Dev secret fallback is convenient but is also a misconfiguration trap

* **Category:** OWASP A05 Security Misconfiguration
* **Severity:** Low security, Medium operational risk
* **File+line:** `apps/web/lib/objectStore.server.ts:54-69`
* **Evidence snippet:**

  ```ts
  54 function secret(): string {
  55   const fromEnv = process.env.OBJECT_STORE_SIGNING_SECRET;
  56   if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  58   if (process.env.NODE_ENV !== "development") {
  59     throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
  60   }
  63   const g = globalThis as GlobalObj;
  65   if (!g.__orbitalObjectStoreSecret) {
  66     g.__orbitalObjectStoreSecret = `dev-${randomBytes(32).toString("hex")}`;
  67   }
  68   return g.__orbitalObjectStoreSecret;
  69 }
  ```
* **Impact:** If prod ever runs with `NODE_ENV=development`, it silently enables “random per-process secret” mode. That’s not a direct bypass, but it weakens guarantees and makes behaviour unpredictable.
* **Exploit sketch:** Not a classic exploit. This is more “you accidentally ship with dev flags and your auth model changes”.
* **Minimal-diff fix:** Require explicit opt-in for the fallback:

  ```ts
  if (process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_OBJECT_STORE_SECRET === "1") { ... }
  else throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
  ```

---

### SEC-DB-001: Runtime DDL in the web process implies elevated DB privileges

* **Category:** OWASP A05 Security Misconfiguration / A04 Insecure Design
* **Severity:** Medium
* **File+line:** `apps/web/lib/db.server.ts:243-255` (shows app-owned DDL)
* **Evidence snippet:**

  ```ts
  243 await sql`
  244   CREATE TABLE IF NOT EXISTS citations (
  245     id TEXT PRIMARY KEY,
  ...
  253     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  254   );
  255 `;
  ```
* **Impact:** The runtime DB user must be allowed to create/alter schema. If the app is compromised, blast radius increases (DDL abuse, dropping/altering tables).
* **Exploit sketch:** Any app-level injection or RCE becomes “attacker can rewrite schema / disable constraints”.
* **Minimal-diff fix:** Split roles:

  * Migration role runs `ensureSchema()` out of band.
  * Runtime role has only CRUD on tables, no CREATE/ALTER.

---

### SEC-DB-002: Citation immutability and shape constraints are mostly “by convention”

* **Category:** OWASP A08 Software and Data Integrity Failures
* **Severity:** Medium (integrity is core to your product promise)
* **File+line:** `apps/web/lib/db.server.ts:244-254`
* **Evidence snippet:**

  ```ts
  244 CREATE TABLE IF NOT EXISTS citations (
  246   report_row_id TEXT NOT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
  247   document_id TEXT NOT NULL,
  249   snippet TEXT NOT NULL,
  250   snippet_hash TEXT NOT NULL,
  251   polygons_json JSONB NOT NULL,
  252   locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ```
* **Impact:** Nothing here prevents:

  * `document_id` pointing to a non-existent document (no FK)
  * `polygons_json` being non-array junk
  * updates after lock (no update ban)
* **Exploit sketch:** If any API path allows updating citations (even accidentally), attacker can mutate evidence after “lock”.
* **Minimal-diff fix (DDL hardening):**

  * Add FK + polygons shape + default:

    ```sql
    ALTER TABLE citations
      ADD CONSTRAINT citations_document_fk FOREIGN KEY (document_id) REFERENCES documents(id);

    ALTER TABLE citations
      ALTER COLUMN polygons_json SET DEFAULT '[]'::jsonb;

    ALTER TABLE citations
      ADD CONSTRAINT citations_polygons_is_array CHECK (jsonb_typeof(polygons_json) = 'array');
    ```
  * And block updates after creation (trigger):

    ```sql
    CREATE OR REPLACE FUNCTION forbid_citation_update() RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'CITATION_IMMUTABLE';
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS citations_no_update ON citations;
    CREATE TRIGGER citations_no_update
      BEFORE UPDATE ON citations
      FOR EACH ROW EXECUTE FUNCTION forbid_citation_update();
    ```

---

### SEC-ING-001: Ingest is vulnerable to resource exhaustion (and it’s in-process)

* **Category:** OWASP A04 Insecure Design / A10 SSRF not relevant / classic DoS
* **Severity:** High (PoC endpoints are easy to hammer)
* **File+line:** `apps/web/lib/ingest/ingestQueue.server.ts:257-318`
* **Evidence snippet:**

  ```ts
  257 await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
  258 for (const p of pages) {
  259   await t`
  260     INSERT INTO document_pages (..., text, layout_json, ...)
  ...
  288 // Minimal chunking: one chunk per page.
  289 for (let i = 0; i < pages.length; i++) {
  291   const textHash = hashSnippet(p.text);
  292   await t`INSERT INTO chunks (..., text, ..., text_hash, ...) VALUES (..., ${p.text}, ..., ${textHash}, ...)`;
  ```
* **Impact:** A large or malicious PDF can cause big CPU + memory use during extraction, plus huge DB writes. Because queues are in-process, this can stall the whole server.
* **Exploit sketch:** Upload very large PDF, or “nasty” PDFs that trigger worst-case parsing. Repeat.
* **Minimal-diff fix (hard caps + truncation):**

  ```ts
  const MAX_PAGES = 200;
  const MAX_TEXT_CHARS_PER_PAGE = 50_000;

  if (pages.length > MAX_PAGES) throw new Error("INGEST_TOO_MANY_PAGES");

  for (const p of pages) {
    const text = p.text.length > MAX_TEXT_CHARS_PER_PAGE
      ? p.text.slice(0, MAX_TEXT_CHARS_PER_PAGE)
      : p.text;
    // use `text` for inserts + hashing
  }
  ```

  And also enforce upload size limits at the upload route (not in excerpt, but it’s mandatory if this is exposed).

---

### SEC-ING-002: State naming says “OCR done” when it’s pdf.js text extraction

* **Category:** OWASP A04 Insecure Design (trust signalling)
* **Severity:** Medium (integrity/trust issue)
* **File+line:** `apps/web/lib/ingest/ingestQueue.server.ts:273-279`
* **Evidence snippet:**

  ```ts
  273 await t`
  274   UPDATE documents
  275   SET ocr_status = 'done',
  276       extraction_quality = ${extractionQuality},
  ```
* **Impact:** Downstream logic (and humans) can treat this as OCR-quality text with layout/geometry when it’s not. That breaks doc-level invariants and can lead to “false confidence” in evidence.
* **Exploit sketch:** Not a hacker exploit. More a “system lies about its guarantees”.
* **Minimal-diff fix:** Rename to `extraction_status`, or set `ocr_status='skipped'` and `extraction_method='pdfjs'`. And then docs/UI reflect that.

---

## High-likelihood open checks (not evidenced in excerpts)

These are the ones I’d check next because docs explicitly mention them and PoCs usually miss them:

* Broken Access Control on routes (folders/runs/artefacts/export/trace/spikes).
  Files: `apps/web/app/(api)/**/route.ts`
* Spikes gating and admin token consistency.
  Files: `apps/web/lib/devOnlyApi.server.ts`, `apps/web/lib/spikes.server.ts`, `docs/03-architecture/50_api_surface.md`
* Trace export redaction.
  File: `apps/web/app/(api)/runs/[id]/trace/route.ts`

---

# 4) YAGNI / Minimalism review

## Simplification Analysis

### 1) WDK durable orchestration vs in-memory queues

* **Docs want:** WDK durable controller, resumable steps, clear boundaries.
* **Code does:** process-memory queues (`ingestQueue`, `quickStartRunQueue`).
* **YAGNI call:** Full WDK is overkill for PoC, but “in-memory queue” is too flimsy for anything beyond a demo.
* **Simplify to:** Postgres jobs table + a single worker loop. Keep step names but store state durably.
* **Result:** You get durability without buying the whole WDK story yet.

### 2) Full OCR + geometry citations

* **Docs want:** geometry-backed citations, snippet hashing + polygons.
* **Code does:** pdf.js extraction, no geometry, but DB requires `polygons_json`.
* **YAGNI call:** Geometry is expensive. Don’t fake it.
* **Simplify to:** Make polygons optional or default `[]`, and treat `has_geometry=false` as first-class. Update docs to match.
* **Result:** Honest evidence model. No pretend highlights.

### 3) Retrieval/draft/lock pipeline

* **Docs want:** retrieve → draft → lock → verify.
* **Code does:** placeholder rows, no real retrieval/locking.
* **YAGNI call:** Don’t implement agents until the evidence pipeline is real.
* **Simplify to:** Implement just enough: retrieve top-k chunks + draft a row + lock citations with snippet_hash. Skip agents.
* **Result:** Evidence-first becomes real without “agent architecture”.

### 4) Entailment verification mode

* **Docs want:** PoC v1 integrity-only.
* **Code does:** `verifyRow()` supports `entailment`.
* **YAGNI call:** LLM entailment adds non-determinism + prompt injection surface.
* **Simplify to:** Remove `entailment` for PoC or hard-guard behind an explicit env flag + separate codepath.
* **Result:** Docs and behaviour match. Fewer moving parts.

### 5) Runtime schema creation

* **Docs want:** canonical ERD and invariants.
* **Code does:** `ensureSchema()` runs DDL at runtime.
* **YAGNI call:** Fine for a throwaway PoC, but it’s a trap once you have more than one environment.
* **Simplify to:** One migration script, run once. Runtime user is least-privilege.
* **Result:** Less “it works on my machine” drift.

### 6) Spikes/demo endpoints and gating policy

* **Docs want:** admin token + explicit gating.
* **Code does:** mix of dev-only and env flags.
* **YAGNI call:** Multiple gating systems is pure complexity.
* **Simplify to:** One policy:

  * either “dev-only via assertDevOnlyApi()” everywhere for spikes
  * or “admin token” everywhere if it’s meant to be shared
* **Result:** Predictable surface area.

---

If you want one single next move that fixes the most pain: **make jobs durable (even a Postgres jobs table) + make citation locking actually immutable**. And update the docs so they stop implying WDK is already there.
