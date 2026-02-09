<user_instructions>
<taskname="Arch drift audit"/>

<task>
Produce the requested deliverables:
1) Architecture Drift Report comparing `docs/03-architecture/*` vs actual implementation.
2) Prioritized action plan (Docs updates, Code refactors, Security fixes, Simplifications).
3) Security audit report (threat-model-lite + OWASP-ish scan) with finding IDs, file+line, evidence snippet, impact, exploit sketch, minimal-diff fix.
4) YAGNI/minimalism review using the `## Simplification Analysis` format.

This repo is a PoC; docs describe a target WDK-based architecture. The current code is a smaller in-process queue based scaffold; call drift explicitly.
</task>

<architecture>
Documented target (canonical docs):
- WDK durable orchestration: workflow controller + step boundaries for OCR/embed/retrieve/draft/lock/verify/write/export.
- Postgres + object storage as data plane; citations locked+immutable with snippet hashing and geometry.
- Thin Next.js route handlers validating inputs (Zod) + safe error envelope.

Actual implementation (current code):
- Next.js App Router with Node runtime route handlers under `apps/web/app/(api)/**/route.ts`.
- Durable-ish behavior is implemented via in-memory queues (not WDK):
  - `apps/web/lib/ingest/ingestQueue.server.ts` for ingest.
  - `apps/web/lib/quickStartRunQueue.server.ts` for “Quick Start run” placeholder rows.
- Data plane is Postgres + local filesystem “object store”:
  - Schema is created at runtime in `apps/web/lib/db.server.ts` (tables: folders, documents, document_pages, chunks, runs, run_steps, report_rows, citations, artefacts).
  - Object storage is `../../tmp/object-store` with path traversal protections + HMAC signatures in `apps/web/lib/objectStore.server.ts`.
- Shared core package provides snippet hashing + verifier:
  - `packages/core/src/citations/snippet.ts` defines `normaliseSnippet()` + `hashSnippet()`.
  - `packages/core/src/verify/verifier.ts` exposes `verifyRow()` with modes `deterministic-only` or `entailment` (docs claim PoC v1 is integrity-only; call drift).
</architecture>

<selected_context>
Docs (architecture claims):
- `docs/03-architecture/10_system_architecture.md`: target component map + trust boundaries + key sequences.
- `docs/03-architecture/20_state_model.md`: state machines + invariants, export gating rules.
- `docs/03-architecture/30_data_model.md`: canonical ERD/tables + citation immutability + snippet_hash rule.
- `docs/03-architecture/40_rag_and_agents.md`: retrieval/draft/lock/verify contracts + ADR alignment.
- `docs/03-architecture/50_api_surface.md`: HTTP contract, error envelope, admin token, spikes gating.
- `docs/03-architecture/60_observability_and_evals.md`: taxonomy, trace export redaction expectations.
- `docs/03-architecture/DECISIONS.md`: ADRs that harden “evidence-first” invariants.
- `docs/04-projects/03-fixes/0001_drift/arch_prd_impl_drift.md`: prior drift notes.

Web/API implementation (trust boundary + input validation + auth-ish gates):
- `apps/web/app/(api)/folders/route.ts`, `apps/web/app/(api)/folders/[id]/route.ts`, `apps/web/app/(api)/folders/[id]/documents/route.ts`, `apps/web/app/(api)/folders/[id]/runs/route.ts`, `apps/web/app/(api)/folders/[id]/report/route.ts`, `apps/web/app/(api)/folders/[id]/artefacts/route.ts`.
- Upload/render: `apps/web/app/(api)/documents/[id]/upload/route.ts`, `apps/web/app/(api)/documents/[id]/complete/route.ts`, `apps/web/app/(api)/documents/[id]/render/route.ts`, `apps/web/app/(api)/documents/[id]/pdf/route.ts`.
- Evidence/trace: `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(api)/runs/[id]/route.ts`, `apps/web/app/(api)/runs/[id]/trace/route.ts`.
- Exports: `apps/web/app/(api)/export/csv/route.ts`, `apps/web/app/(api)/export/csv/download/route.ts`, spike exporter `apps/web/app/(api)/spikes/export/csv/route.ts`.
- Demo/spikes: `apps/web/app/(api)/demo/load-pack/route.ts`, `apps/web/app/(api)/spikes/*`.

Server-side runtime modules (data plane, orchestration scaffold):
- `apps/web/lib/db.server.ts`: Postgres client + `ensureSchema()` DDL (note: citations table differs from docs; uses `polygons_json`, missing `index_version`, etc.).
- `apps/web/lib/objectStore.server.ts`: local fs object store; signed header generation + signature verification; strict storage_key regexes.
- `apps/web/lib/ingest/ingestQueue.server.ts`: pdf.js text extraction (not OCR provider), no geometry; chunks 1 per page; heuristic extraction_quality; writes document_pages + chunks.
- `apps/web/lib/quickStartRunQueue.server.ts`: in-memory run queue that currently writes `missing_input` or placeholder `citation_failed` rows (no retrieval/draft/lock pipeline yet).
- `apps/web/lib/folderState.server.ts`: derives folder states from DB facts.
- `apps/web/lib/questionSet.server.ts`: loads question set v1 from disk and hashes to a version string.
- `apps/web/lib/devOnlyApi.server.ts`, `apps/web/lib/demoMode.server.ts`, `apps/web/lib/spikes.server.ts`: gating helpers.
- `apps/web/lib/trace.server.ts`: creates `traceId` + response headers.

Core shared logic (hashing + verification + schemas):
- `packages/core/src/citations/snippet.ts`, `packages/core/src/verify/verifier.ts`, `packages/core/src/verify/verifier.schemas.ts`, `packages/core/src/safe-error.ts`, `packages/core/src/schemas/list_payload_v0.ts`.

Fixture utilities (used by docs/taxonomy alignment checks):
- `scripts/fixtures/assert_row_invariants.ts`, `scripts/fixtures/assert_citation_integrity.ts`, `scripts/fixtures/lib/*`, `scripts/fixtures/README.md`.

UI touchpoints (to understand end-to-end flows; not exhaustive):
- `apps/web/app/(app)/matters/actions.ts`, `apps/web/app/(app)/matters/QuickStartPanel.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx`, `apps/web/app/(app)/matters/ExportTraceButton.tsx`, `apps/web/app/(app)/matters/ArtefactsList.tsx`.
</selected_context>

<relationships>
- Schema/state backbone: `apps/web/lib/db.server.ts` tables are read/updated by route handlers + queues; folder state derived in `apps/web/lib/folderState.server.ts`.
- Upload flow:
  - init upload and metadata in folder/document routes (see `apps/web/app/(api)/folders/[id]/documents/route.ts`), then bytes PUT to `apps/web/app/(api)/documents/[id]/upload/route.ts` using HMAC signature headers from `apps/web/lib/objectStore.server.ts`.
  - completion triggers ingest queue via `apps/web/app/(api)/documents/[id]/complete/route.ts` -> `apps/web/lib/ingest/ingestQueue.server.ts`.
- Ingest writes `document_pages` + `chunks` (1 chunk per page, `hashSnippet(text)` for `text_hash`) and updates `documents.parse_status/ocr_status`.
- Quick Start run flow:
  - run creation endpoint(s) insert `runs` then enqueue `apps/web/lib/quickStartRunQueue.server.ts`.
  - queue writes `report_rows` + `run_steps` but does not implement retrieval/draft/lock/citations yet.
- Trace export:
  - `apps/web/app/(api)/runs/[id]/trace/route.ts` reads seeded snapshots (dev-only) and uses `packages/core/src/verify/verifier.ts:verifyRow()` in `deterministic-only` mode.
</relationships>

<ambiguities>
- WDK/workflow runtime described in docs does not appear in the selected code; current queues are process-memory only. Treat this as either (a) docs are aspirational/target state, or (b) a missing implementation slice.
- Docs specify OCR/layout providers and geometry-backed citations; current ingest uses pdf.js text extraction with `has_geometry: false` and cannot produce polygon highlights.
- Docs specify spikes gating with `SPIKES_ENABLED=1` and explicit admin token; current code often uses `assertDevOnlyApi()` (404 outside `NODE_ENV=development`) plus optional env flags per endpoint. Call drift and recommend a consistent policy.
</ambiguities>

<notes>
Omitted (not selected to stay under token budget): heavier fixture runner scripts like `scripts/fixtures/eval.ts`, `scripts/fixtures/compare_truth.ts`, `scripts/fixtures/seed.ts`, `scripts/fixtures/export_truth_match.ts` are present in repo but not fully included (some may appear as codemaps only).
</notes>

</user_instructions>


# Code Excerpts (Selected)

These are small, high-signal excerpts from the current implementation to enable more concrete drift/security analysis without pasting the entire repo. If you need more context, ask for additional excerpts by file path.

## apps/web/lib/db.server.ts (citations DDL excerpt, with line numbers)

```ts
   240	  `;
   241	
   242	  // Locked citations associated to a report row. In this slice we may emit zero citations.
   243	  await sql`
   244	    CREATE TABLE IF NOT EXISTS citations (
   245	      id TEXT PRIMARY KEY,
   246	      report_row_id TEXT NOT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
   247	      document_id TEXT NOT NULL,
   248	      page_number INT NOT NULL,
   249	      snippet TEXT NOT NULL,
   250	      snippet_hash TEXT NOT NULL,
   251	      polygons_json JSONB NOT NULL,
   252	      locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
   253	      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   254	    );
   255	  `;
   256	
   257	  await sql`
   258	    CREATE INDEX IF NOT EXISTS citations_report_row_idx
   259	    ON citations(report_row_id);
   260	  `;

```

## apps/web/lib/objectStore.server.ts (path traversal + signing + verifySignature excerpt, with line numbers)

```ts
    47	function resolveObjectPath(storageKey: string): string {
    48	  const base = objectStoreRoot();
    49	  const candidate = path.resolve(base, storageKey);
    50	  if (!candidate.startsWith(base + path.sep)) throw new Error("PATH_TRAVERSAL");
    51	  return candidate;
    52	}
    53	
    54	function secret(): string {
    55	  const fromEnv = process.env.OBJECT_STORE_SIGNING_SECRET;
    56	  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
    57	
    58	  // Fail closed outside dev: signing must be explicitly configured.
    59	  if (process.env.NODE_ENV !== "development") {
    60	    throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
    61	  }
    62	
    63	  // Dev-only fallback so local upload works out of the box.
    64	  const g = globalThis as GlobalObj;
    65	  if (!g.__orbitalObjectStoreSecret) {
    66	    g.__orbitalObjectStoreSecret = `dev-${randomBytes(32).toString("hex")}`;
    67	  }
    68	  return g.__orbitalObjectStoreSecret;
    69	}
    70	
    71	function b64url(input: Buffer): string {
    72	  return input
    73	    .toString("base64")
    74	    .replace(/=/g, "")
    75	    .replace(/\+/g, "-")
    76	    .replace(/\//g, "_");
    77	}
    78	
    79	const SIGNATURE_PAYLOAD_VERSION = "v1";
    80	
    81	function sign(args: { purpose: string; storageKey: string; expiresAtMs: number }): string {
    82	  const payload = `${SIGNATURE_PAYLOAD_VERSION}\n${args.purpose}\n${args.storageKey}\n${args.expiresAtMs}`;
    83	  const digest = createHmac("sha256", secret()).update(payload).digest();
    84	  return b64url(digest);
    85	}
    86	
    87	export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
    88	  const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
    89	  const a = Buffer.from(expected);
    90	  const b = Buffer.from(args.sig);
    91	  if (a.length !== b.length) return false;
    92	  return timingSafeEqual(a, b);
    93	}
    94	
    95	function createSignedHeaders(args: {
    96	  purpose: string;
    97	  storageKey: string;
    98	  expiresInSeconds?: number;
    99	}): { expires_at_ms: number; signature: string } {
   100	  const expiresInSeconds = args.expiresInSeconds ?? 10 * 60;
   101	  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
   102	  const signature = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs });
   103	  return { expires_at_ms: expiresAtMs, signature };
   104	}

```

## apps/web/lib/ingest/ingestQueue.server.ts (index_version + chunk write + text_hash excerpt, with line numbers)

```ts
   245	    SELECT latest_index_version
   246	    FROM folders
   247	    WHERE id = ${doc.folder_id}
   248	    LIMIT 1
   249	  `;
   250	  const indexVersion = folders[0]?.latest_index_version ?? "v1";
   251	
   252	  try {
   253	    await sql.begin(async (tx) => {
   254	      // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
   255	      const t = tx as unknown as typeof sql;
   256	
   257	      await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
   258	      for (const p of pages) {
   259	        await t`
   260	          INSERT INTO document_pages (id, document_id, page_number, text, layout_json, created_at, updated_at)
   261	          VALUES (
   262	            ${newId("pg")},
   263	            ${documentId},
   264	            ${p.page_number},
   265	            ${p.text},
   266	            ${t.json(p.layout_json)},
   267	            now(),
   268	            now()
   269	          )
   270	        `;
   271	      }
   272	
   273	      await t`
   274	        UPDATE documents
   275	        SET ocr_status = 'done',
   276	            extraction_quality = ${extractionQuality},
   277	            metadata_json = jsonb_set(metadata_json, '{extraction_quality_method}', to_jsonb(${extractionQualityMethod}::text), true),
   278	            updated_at = now()
   279	        WHERE id = ${documentId}
   280	      `;
   281	
   282	      await t`
   283	        DELETE FROM chunks
   284	        WHERE document_id = ${documentId}
   285	          AND index_version = ${indexVersion}
   286	      `;
   287	
   288	      // Minimal chunking: one chunk per page.
   289	      for (let i = 0; i < pages.length; i++) {
   290	        const p = pages[i]!;
   291	        const textHash = hashSnippet(p.text);
   292	        await t`
   293	          INSERT INTO chunks (
   294	            id,
   295	            document_id,
   296	            index_version,
   297	            chunk_index,
   298	            page_start,
   299	            page_end,
   300	            text,
   301	            metadata_json,
   302	            text_hash,
   303	            created_at
   304	          )
   305	          VALUES (
   306	            ${newId("chk")},
   307	            ${documentId},
   308	            ${indexVersion},
   309	            ${i},
   310	            ${p.page_number},
   311	            ${p.page_number},
   312	            ${p.text},
   313	            ${t.json({ page_number: p.page_number })},
   314	            ${textHash},
   315	            now()
   316	          )
   317	        `;
   318	      }
   319	    });
   320	  } catch {
   321	    await sql`
   322	      UPDATE documents
   323	      SET ocr_status = 'failed',
   324	          error_json = ${sql.json(safeError("INGEST_FAILED", "Ingest failed while writing extracted pages."))},
   325	          updated_at = now()
   326	      WHERE id = ${documentId}
   327	    `;
   328	    await refreshFolderState(doc.folder_id);
   329	    return;
   330	  }
   331	
   332	  await refreshFolderState(doc.folder_id);
   333	}

```
