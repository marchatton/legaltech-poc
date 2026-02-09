Full Oracle bundle preserved at: docs/04-projects/02-features/0011_chat_interface/tmp-oracle/oracle-prompt.full.md

<file_contents>
File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/20_state_model.md
```md
# State model

> Note: This document describes the **target** state model. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc defines the state machines and invariants for the PoC. Keep this as the canonical reference and link to it from other docs.

## Principles (why these states exist)
- Prefer monotonic state machines: a state should only move "forward" unless a user explicitly retries/restarts.
- States can be stored for UI convenience, but they must be derivable from persisted facts and remain consistent.
- Fail safe: if we cannot prove an answer is supported by locked evidence, we do not export it (ADR-0002).
- Keep states small and explicit. Avoid "magic" implied meaning in free-form JSON.

## Terminology
- **Folder** is the DB/API name for a workspace container. In the UI we call it a **Matter**.
- A **Run** is one execution of a Quick Start workflow for a folder.
- A **Report row** is the persisted output for a `(run_id, question_id)` pair.
- A **Citation** is an immutable, locked evidence object (snippet + hash + geometry) referenced by `citation_id` (ADR-0001).
- States are stored on rows for convenience, but must remain consistent with the invariants below.
- If stored state and derived state disagree, derived state wins (treat stored state as stale and recompute).

## Version pinning (cross-cutting invariants)
Runs must pin the versions they executed with (see `docs/03-architecture/30_data_model.md`):
- `index_version`: which retrieval substrate (chunks + indices) was used.
- `agent_bundle_version`: prompts + schemas + step logic version (git SHA is fine for PoC).
- `question_set_version`: which question set was used.

Why:
- Replays and evals need to answer: "what code + schema + questions produced this row?"

## Folder state (`folders.state`)
States:
- `empty`
- `ingesting`
- `indexed`
- `ready`
- `failed` (terminal until a new ingest attempt is started)

Invariants (must hold):
- `empty`
  - folder has zero documents
- `ingesting`
  - at least one document is not in terminal ingest state (`parse_status != parsed` OR `ocr_status != done`)
  - OR derived retrieval substrate (chunks/indexes) is not built for `folders.latest_index_version`
- `indexed`
  - all documents are in terminal ingest state (`parse_status = parsed` AND `ocr_status = done`)
  - chunks exist for each document for `folders.latest_index_version`
  - folder is runnable (Quick Start can start), even if some docs are low quality
- `ready`
  - all `indexed` invariants hold
  - AND folder health checks pass (see below)
- `failed`
  - one or more documents have terminal `failed` ingest status OR a folder-level indexing job failed

Folder “ready” health checks (PoC defaults):
- no documents are `parse_status = failed` or `ocr_status = failed`
- for every document: `extraction_quality >= 0.60` (configurable; keep the threshold in eval fixtures)
- for every document: `page_count` is set AND `document_pages` count matches `page_count`

Allowed transitions (monotonic, except for retry):
- `empty` → `ingesting` (first upload starts)
- `ingesting` → `indexed` (all docs ingested + chunked + indexed for latest_index_version)
- `indexed` → `ready` (health checks pass)
- `ingesting|indexed|ready` → `failed` (non-recoverable ingest/index error)
- `failed` → `ingesting` (explicit retry/re-ingest; bumps `latest_index_version`)

Notes:
- Quick Start can start in `indexed` as well as `ready` (the "ready checks" are demo quality gates, not a hard requirement to run).
- `folders.state` should be explainable in the UI. If we introduce a new state, also define:
  - the user-facing label
  - the primary remediation action (retry, re-upload, contact support)

## Document state (`documents.parse_status`, `documents.ocr_status`)
Parse status:
- `queued` → `parsing` → `parsed` | `failed`

OCR status:
- `queued` → `running` → `done` | `failed`

Invariants (must hold):
- If `parse_status` is `parsing|parsed` then `storage_key` must be set and the raw PDF must exist in object storage.
- If `parse_status` is `parsed` then `page_count` must be set (>= 1).
- If `ocr_status` is `done` then `document_pages` must exist for every page with `text` and `layout_json`.
- `extraction_quality` is only meaningful when `ocr_status = done` (else set NULL or 0 and do not use it for decisions).

### extraction_quality (PoC definition)
`documents.extraction_quality` is a normalised 0..1 score derived from extraction output.

Current PoC (pdf.js text extraction):
- chars-per-page heuristic (see `documents.metadata_json.extraction_quality_method`, e.g. `pdfjs_text_chars_per_page_v2`)

Target PoC (OCR/layout provider):
- provider mean line confidence (or equivalent), clamped to [0..1]

Rules:
- Only set when `ocr_status = done`.
- Record `extraction_quality_method` (string) in `documents.metadata_json.extraction_quality_method` so we can re-run and compare scores across changes.
- If the method changes, bump `index_version` (ADR-0015) and treat as a fixture-breaking change.

## Run state
Runs are the execution record for a single Quick Start attempt. Runs must pin the versions they executed with (see `docs/03-architecture/30_data_model.md`).

States:
- `created` (row exists, workflow not started)
- `running` (workflow is active)
- `completed` (workflow finished and wrote a terminal row for every question)
- `partial` (workflow stopped early but wrote at least one row)
- `failed` (workflow stopped early and wrote zero trustworthy rows)
- `cancelled` (optional; user-cancel)

Invariants (must hold):
- `completed`
  - for the question set version used by the run: exactly one `report_rows` record exists per `question_id`
  - every report row is in a terminal status (`needs_review|reviewed|missing_input|citation_failed`)
- `partial`
  - at least one report row exists
  - at least one `question_id` is missing a row (run stopped before finishing)
- `failed`
  - zero report rows exist OR all produced rows are explicitly marked non-exportable (e.g. `citation_failed`)

Allowed transitions:
- `created` → `running`
- `running` → `completed|partial|failed|cancelled`

## Run step state (`run_steps.state`)
Run steps are the durable execution log of side effects (OCR, embed, retrieve, draft, lock, verify, write, export). Steps make retries and resumability observable.

States:
- `queued` (scheduled but not started)
- `running`
- `succeeded` (terminal)
- `failed` (terminal)

Invariants (must hold):
- A step must be idempotent: retries must not duplicate `report_rows` or `citations`.
- A step attempt counter increments on each retry; attempt `1` is the first execution.
- `metrics_json` should be safe and structured (timings, token/cost usage, chunk counts). No raw PDF text.
- `error_json` must be safe to show to a user when needed (no provider payloads; no stack traces).

## Report row state (`report_rows.status`)
Statuses (terminal for the workflow):
- `needs_review` (verification passed; user may review)
- `reviewed` (user confirmed)
- `missing_input` (no supporting evidence in provided docs)
- `citation_failed` (verification failed or citation lock mismatch)

Invariants (must hold):
- Rows are scoped to a run: exactly one row per `(run_id, question_id)`.
- `needs_review|reviewed`
  - row has >= 1 citation
  - every citation is **locked** (stores snippet + hash + geometry) and is associated to this row
- `missing_input`
  - `answer` must be exactly: `Not found in provided documents.`
  - citations list must be empty
  - `notes` (or provenance) must include an actionable missing-doc checklist
- `citation_failed`
  - citations may exist, but the row is non-exportable by default
  - store a safe failure reason code in provenance (e.g. `CITATION_MISMATCH`, `VALIDATION_ERROR`, `NO_CITATIONS`)
  - Note (PoC v1): reason codes are integrity-only (ADR-0017). Entailment codes are reserved for a later, gated version.

User-driven transitions:
- `needs_review` → `reviewed` (only via explicit user action)

Export gating (PoC defaults):
- Exports are only allowed when `runs.state = completed` (PoC default).
- If any row in the selected run is `citation_failed`, export returns `EXPORT_BLOCKED` unless `unsafe_override = true` is provided.
  - Unsafe override is intended to be demo-only. See `docs/03-architecture/50_api_surface.md` for the HTTP contract and guardrails.

Notes:
- Do not invent new `report_rows.status` values. If you need additional per-item classification (eg survey issue `unknown`), store it inside the row payload/provenance, not by adding row statuses.
- The UI must reflect gating truthfully: "blocked" is a first-class state, not an exception.

## Suggested invariant checks (SQL; run in debug/evals)
These are optional, but they make "broken windows" obvious.

1) Report rows are 1:1 per run/question
```sql
select run_id, question_id, count(*) as n
from report_rows
group by run_id, question_id
having count(*) > 1;
```

2) `missing_input` rows have no citations and exact string answer
```sql
select rr.id
from report_rows rr
left join citations c on c.report_row_id = rr.id
where rr.status = 'missing_input'
group by rr.id, rr.answer
having rr.answer <> 'Not found in provided documents.' or count(c.id) > 0;
```

3) Export gating sanity: runs marked `completed` must have only terminal row statuses
```sql
select r.id
from runs r
join report_rows rr on rr.run_id = r.id
where r.state = 'completed'
  and rr.status not in ('needs_review', 'reviewed', 'missing_input', 'citation_failed')
group by r.id;
```

```

File: /Users/marc/Code/personal-projects/orbital-poc/docs/03-architecture/40_rag_and_agents.md
```md
# RAG + agents (Quick Start)

> Note: This document describes the **target** RAG/agent pipeline. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc describes the end-to-end "evidence-first" pipeline for Quick Start. It is intentionally implementation-oriented.

Canonical related docs:
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions and why)
- `docs/03-architecture/20_state_model.md` (statuses + invariants)
- `docs/03-architecture/30_data_model.md` (tables + hashing + immutability rules)
- `docs/03-architecture/60_observability_and_evals.md` (failure taxonomy + eval posture)

## Current PoC status (implemented today)
The repo does not yet implement the end-to-end retrieve/draft/lock pipeline described below.

Current behavior:
- Ingest extracts text via pdf.js (not OCR) and stores per-page text with `has_geometry=false`.
  - Code: `apps/web/lib/ingest/ingestQueue.server.ts`
- Quick Start runs are executed in-process and write placeholder terminal `report_rows` (no retrieval/draft/lock).
  - Code: `apps/web/lib/quickStartRunQueue.server.ts`
- Citations/highlights and trace export are fixture-backed for demos (seed snapshots under `tmp/fixture-seed`).
  - Code: `apps/web/lib/fixtureSeed.server.ts`, `apps/web/app/(api)/citations/[id]/route.ts`

Treat the remainder of this doc as the **target** pipeline to build towards.

## Why RAG exists here
RAG is the mechanism that makes “evidence-first” possible:
- It finds evidence in the uploaded pack.
- It turns evidence into stable references (chunk IDs).
- It enables citation locking and verification (ADR-0001/0002).

## Non-negotiable invariants (PoC defaults)
- Retrieval returns **IDs**, not prose (ADR-0004). Steps pass around `chunk_id`s and `citation_id`s, not paragraphs.
- Drafting produces structured outputs with **candidate citations as chunk IDs** (ADR-0001).
- Citations are **locked** and **immutable** once created (ADR-0001).
- Verification is **fail-closed** (ADR-0002).
- No external web research inside a run (ADR-0007).

## Ingestion (RAG substrate)
Target default: OCR everything for consistent geometry
- store per-page text + polygons (`document_pages.layout_json`)
- chunk into citable units
- index:
  - lexical (tsvector)
  - semantic (pgvector)

Implementation notes:
- OCR/layout is abstracted behind one adapter interface (ADR-0012; accepted).
- Chunking must be deterministic for a given `(document_id, index_version)`; if you change chunking logic, bump the folder `index_version`.

## Chunking (what makes a chunk citable)
Chunking strategy is pinned in ADR-0015. Baseline requirements still apply:
- A chunk must map back to a document page range (`page_start`, `page_end`) and stable evidence geometry.
- A chunk must be retrievable by ID alone (no dependency on an LLM re-run).
- Chunk metadata must be sufficient for filtering/rerank later (doc type, section hints, etc).

PoC defaults (ADR-0015):
- Page-bounded chunks only (`page_start = page_end = page_number`).
- Chunk sizing: `max_lines = 20` OR `max_chars = 1500` (whichever comes first), with `overlap_lines = 4` (within a page only).
- Boundary rules: never split inside an OCR line; prefer splitting on blank lines; treat section headers as hard boundaries.
- Required metadata (store on the chunk row, e.g. `chunks.metadata_json`):
  - `chunker_id` (e.g. `line_window_v1`)
  - `chunk_params` (max_lines/max_chars/overlap_lines + header regex version)
  - `page_number`
  - `line_start` / `line_end` (inclusive line indices in the canonical OCR line list)
  - optional `doc_type`, `section_hint`

## Retrieval (per question)
Contract:
- Input: `{ folder_id, index_version, question_id, question_text, filters? }`
- Output: ordered list of hits `{ chunk_id, score, document_id, page_start, page_end }`

Algorithm (PoC default):
- Hybrid search (tsvector + pgvector) scoped to `index_version`.
- Apply filters (eg doc_type) if present.
- Optional rerank (but preserve the "IDs-only" contract).

Hard rules:
- Return chunk IDs, not prose.
- Include scores for observability/evals (Recall@K and debug).
- Cap K for cost and stability (eg K=10 by default; pin per fixture suite).

## Hydration (IDs -> evidence)
Retrieval produces IDs only. Hydration resolves those IDs into evidence payloads for drafting.

Contract:
- Input: `{ index_version, hits: [{chunk_id, score}] }`
- Output: `evidence: [{ chunk_id, document_id, page_start, page_end, snippet, polygons, snippet_hash? }]`

Hard rules:
- Hydration is read-only and deterministic for a given `index_version`.
- The hydrated `snippet` must come from the canonical chunk store (not an LLM).

## Drafting (from hydrated evidence only)
Contract:
- Input: `{ question_id, question_text, evidence: HydratedEvidence[] }`
- Output: structured row JSON:
  - `answer` (string or structured JSON-as-string; decide per artefact)
  - `notes` (optional)
  - `candidate_citation_chunk_ids: string[]`

Hard rules:
- The draft must be derived from the provided evidence only.
- If the evidence set cannot support an answer, the draft must output the exact string:
  `Not found in provided documents.` (and provide an actionable missing-doc checklist in notes/provenance).

## Citation locking (creates immutable citations)
Locking converts "candidate chunk IDs" into immutable citation records.

Contract:
- Input: `{ index_version, candidate_chunk_ids: string[] }`
- Output:
  - `citations[]` persisted: `{ citation_id, document_id, page_number, polygons, snippet, snippet_hash, index_version, chunk_id? }`
  - mapping `chunk_id -> citation_id` used to rewrite the report row

Hard rules:
- `snippet_hash` must follow the canonical hashing rule in `docs/03-architecture/30_data_model.md`.
- Store enough geometry to render highlights without re-running retrieval.
- Do not persist "signed URLs" or transient provider URLs; only keys and stable metadata.

Failure modes:
- `CITATION_MISMATCH`: chunk resolves to a different snippet than expected, or hash check fails.
- `RETRIEVAL_MISS`: candidate chunk IDs do not exist for this `index_version`.

## Verification (fail-closed)
PoC v1 verification is integrity-only (ADR-0017). No entailment model or runtime verifier is called.

Deterministic integrity checks (runtime):
- row JSON validates against the Zod schema (hard gate)
- every `citation_id` resolves and has polygons + snippet_hash

Output mapping (see `docs/03-architecture/20_state_model.md`):
- `needs_review`: integrity checks pass.
- `missing_input`: answer is exactly `Not found in provided documents.` and there are zero citations.
- `citation_failed`: anything else that fails (hash mismatch, missing polygons, schema fail).

Reason codes should align with the failure taxonomy in `docs/03-architecture/60_observability_and_evals.md`.

## Agent mapping (PoC implementation)
This is the "4 agents" story implemented as a constrained workflow (ADR-0005):
- Orchestrator: WDK workflow controller (`"use workflow"`)
- Retrieval agent: retrieval step(s) (`"use step"`)
- Drafting agent: drafting step (`"use step"`)
- Verification agent: lock + verify steps (`"use step"`)
- Research agent: out-of-scope (no external web; ADR-0007)

## Idempotency and determinism (step-level rules)
Because WDK can replay/retry, each step must be safely repeatable:
- Use a deterministic `step_key` stored in `run_steps` (see `docs/03-architecture/30_data_model.md`).
- Steps must not create duplicate `report_rows` or `citations`.
- Any "randomness" (sampling temperature, top_p) should be pinned/recorded in provenance.

## Open decisions to pin (candidate ADRs)
- Whether rerank is enabled by default and what model it uses.
- What the report row payload schemas are for each artefact type (CSV vs JSON vs hybrid).

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/safe-error.ts
```ts
export type SafeErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    trace_id?: string;
  };
};

export function safeErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
}): SafeErrorEnvelope {
  return {
    error: {
      code: opts.code,
      message: opts.message,
      details: opts.details,
      trace_id: opts.traceId,
    },
  };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/citations/snippet.ts
```ts
import { createHash } from "node:crypto";

export function normaliseSnippet(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

export function hashSnippet(snippet: string): string {
  const normalised = normaliseSnippet(snippet);
  const bytes = new TextEncoder().encode(normalised);
  const hashHex = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hashHex}`;
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/fixtures/fixtureIds.ts
```ts
const PACK_ID_RE = /^pack_\d{2}_[a-z0-9_]+$/i;
const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;
const STEM_RE = /^[A-Za-z0-9_-]+$/;

export function fixtureDocumentId(args: { packId: string; filename: string }): string {
  const packId = args.packId.trim();
  if (!PACK_ID_RE.test(packId)) throw new Error("INVALID_PACK_ID");

  const filename = args.filename.trim();
  if (!PDF_FILENAME_RE.test(filename)) throw new Error("INVALID_PDF_FILENAME");

  const stem = filename.replace(/\.pdf$/i, "");
  if (!STEM_RE.test(stem)) throw new Error("INVALID_PDF_STEM");

  // Fixture docs are addressed via a deterministic id so the viewer can use the
  // canonical /documents/:id/* contract without depending on DB ingestion.
  return `fx_${packId}__${stem}`;
}

export function parseFixtureDocumentId(
  documentId: string,
):
  | { ok: true; packId: string; filename: string; stem: string }
  | { ok: false } {
  if (typeof documentId !== "string") return { ok: false };
  if (!documentId.startsWith("fx_")) return { ok: false };

  const rest = documentId.slice("fx_".length);
  const parts = rest.split("__");
  if (parts.length !== 2) return { ok: false };

  const [packId, stem] = parts;
  if (!packId || !PACK_ID_RE.test(packId)) return { ok: false };
  if (!stem || !STEM_RE.test(stem)) return { ok: false };

  return { ok: true, packId, stem, filename: `${stem}.pdf` };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/geometry/anchors.ts
```ts
import { z } from "zod";

export const AnchorBoxSchema = z.object({
  page: z.number().int().positive(),
  bbox: z.tuple([
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
  ]),
}).superRefine((val, ctx) => {
  const [xMin, yMin, xMax, yMax] = val.bbox;
  if (xMin > xMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox xMin > xMax", path: ["bbox"] });
  if (yMin > yMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox yMin > yMax", path: ["bbox"] });
});

export type AnchorBox = z.infer<typeof AnchorBoxSchema>;

export const AnchorFileSchema = z.record(z.string().min(1), AnchorBoxSchema);
export type AnchorFile = z.infer<typeof AnchorFileSchema>;

export type NormPoint = readonly [xNorm: number, yNorm: number];
export type NormPolygon = readonly NormPoint[];
export type NormPolygons = readonly NormPolygon[];

export function anchorBoxToPolygons(anchor: AnchorBox): NormPolygons {
  const [xMin, yMin, xMax, yMax] = anchor.bbox;

  // Canonical spec: normalised [0..1], origin top-left.
  const polygon: NormPolygon = [
    [xMin, yMin],
    [xMax, yMin],
    [xMax, yMax],
    [xMin, yMax],
  ];

  return [polygon];
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/geometry/mapToViewport.ts
```ts
import type { NormPolygons } from "./anchors";

export type ViewBox = readonly [xMin: number, yMin: number, xMax: number, yMax: number];

export type CssPoint = readonly [x: number, y: number];
export type CssPolygon = readonly CssPoint[];
export type CssPolygons = readonly CssPolygon[];

export interface PdfJsViewportLike {
  readonly width: number;
  readonly height: number;
  convertToViewportPoint(xPdf: number, yPdf: number): [number, number];
}

export function mapNormPointToPdfPoint(point: readonly [number, number], viewBox: ViewBox): [number, number] {
  const [xNorm, yNorm] = point;
  const [xMin, yMin, xMax, yMax] = viewBox;

  const xPdf = xMin + xNorm * (xMax - xMin);
  const yPdf = yMax - yNorm * (yMax - yMin);

  return [xPdf, yPdf];
}

export function mapNormPolygonsToViewportCss(args: {
  polygons: NormPolygons;
  viewBox: ViewBox;
  viewport: PdfJsViewportLike;
}): CssPolygons {
  const { polygons, viewBox, viewport } = args;

  return polygons.map((poly) =>
    poly.map((p) => {
      const [xPdf, yPdf] = mapNormPointToPdfPoint(p, viewBox);
      const [xCss, yCss] = viewport.convertToViewportPoint(xPdf, yPdf);
      return [xCss, yCss] as const;
    }),
  );
}

export function bboxFromCssPolygons(polygons: CssPolygons): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  let points = 0;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      points += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (points === 0) return null;

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/verify/verifier.schemas.ts
```ts
import { z } from "zod";

export const VerifyCitationSchema = z.object({
  document_id: z.string().min(1),
  page_number: z.number().int().positive(),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
});

export type VerifyCitation = z.infer<typeof VerifyCitationSchema>;

export const VerifyInputSchema = z.object({
  case_id: z.string().min(1),
  question_id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string(),
  citations: z.array(VerifyCitationSchema),
});

export type VerifyInput = z.infer<typeof VerifyInputSchema>;

export const VerifyVerdictSchema = z.enum(["pass", "fail"]);

export const VerifyResultSchema = z.object({
  verdict: VerifyVerdictSchema,
  reason_code: z.string().min(1),
  reason: z.string().optional(),
  timings_ms: z
    .object({
      total: z.number().nonnegative(),
      deterministic: z.number().nonnegative(),
      entailment: z.number().nonnegative().optional(),
    })
    .passthrough(),
});

export type VerifyResult = z.infer<typeof VerifyResultSchema>;

```

File: /Users/marc/Code/personal-projects/orbital-poc/packages/core/src/verify/verifier.ts
```ts
import { performance } from "node:perf_hooks";

import { hashSnippet } from "../citations/snippet";
import { VerifyInputSchema, type VerifyInput, type VerifyResult } from "./verifier.schemas";

export type EntailmentVerdict = "PASS" | "FAIL" | "UNSURE";

export type EntailmentVerifier = (input: {
  question: string;
  answer: string;
  citations: Array<{ snippet: string }>;
}) => Promise<{ verdict: EntailmentVerdict; reason?: string }>;

export type VerifierMode = "deterministic-only" | "entailment";

export async function verifyRow(
  input: VerifyInput,
  opts: { mode: VerifierMode; entailment?: EntailmentVerifier },
): Promise<VerifyResult> {
  const t0 = performance.now();

  // Schema validates basic shape; deterministic checks enforce invariants.
  const parsed = VerifyInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      verdict: "fail",
      reason_code: "VALIDATION_ERROR",
      reason: "Input did not match VerifyInput schema.",
      timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
    };
  }

  const tDetStart = performance.now();

  if (parsed.data.answer === "Not found in provided documents." && parsed.data.citations.length !== 0) {
    return {
      verdict: "fail",
      reason_code: "MISSING_INPUT_INVARIANT",
      reason: "missing_input answers must have zero citations.",
      timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
    };
  }

  if (parsed.data.answer !== "Not found in provided documents." && parsed.data.citations.length === 0) {
    return {
      verdict: "fail",
      reason_code: "NO_CITATIONS",
      reason: "Non-missing_input answers must include at least one citation.",
      timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
    };
  }

  for (const cit of parsed.data.citations) {
    const computed = hashSnippet(cit.snippet);
    if (computed !== cit.snippet_hash) {
      return {
        verdict: "fail",
        reason_code: "CITATION_MISMATCH",
        reason: "snippet_hash did not match the canonical hash of snippet.",
        timings_ms: { total: performance.now() - t0, deterministic: performance.now() - t0 },
      };
    }
  }

  const tDetEnd = performance.now();

  if (opts.mode === "deterministic-only") {
    return {
      verdict: "pass",
      reason_code: "DETERMINISTIC_ONLY",
      timings_ms: { total: performance.now() - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  if (!opts.entailment) {
    return {
      verdict: "fail",
      reason_code: "ENTAILMENT_NOT_CONFIGURED",
      reason: "Entailment verifier is required in entailment mode.",
      timings_ms: { total: performance.now() - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  const tEntStart = performance.now();
  const entailment = await opts.entailment({
    question: parsed.data.question,
    answer: parsed.data.answer,
    citations: parsed.data.citations.map((c) => ({ snippet: c.snippet })),
  });
  const tEntEnd = performance.now();

  if (entailment.verdict === "PASS") {
    return {
      verdict: "pass",
      reason_code: "ENTAILMENT_PASS",
      timings_ms: {
        total: performance.now() - t0,
        deterministic: tDetEnd - tDetStart,
        entailment: tEntEnd - tEntStart,
      },
    };
  }

  return {
    verdict: "fail",
    reason_code: entailment.verdict === "FAIL" ? "ENTAILMENT_FAIL" : "ENTAILMENT_UNSURE",
    reason: entailment.reason,
    timings_ms: {
      total: performance.now() - t0,
      deterministic: tDetEnd - tDetStart,
      entailment: tEntEnd - tEntStart,
    },
  };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/AGENTS.md
```md
# Web app (apps/web)
Next.js App Router web application.

## Stack
- Next.js App Router + TypeScript
- Tailwind + v5 design tokens (`app/tokens.css` + `tailwind.preset.ts`)
- Validation: Zod
- PDF rendering: `pdfjs-dist`
- DB client: `postgres`
- Tests: Vitest

## Guardrails (high leverage)
- Server-first: fetch on the server (RSC / route handlers / server actions). Avoid client-side data fetching effects.
- Treat `useEffect` as an escape hatch (imperative interop only) — not for data fetching, derived state, prop→state, or URL sync.
- Never import server-only into client components (use `server-only` / `client-only` boundaries).
- Validate external inputs with Zod and map errors to safe user-facing messages.
- AI SDK flows: use Workflow DevKit (`workflow`) and add `"use workflow"` in async TS fns for durability, reliability, observability.
  - Conventions for `"use workflow"` / steps are defined in `docs/03-architecture/06_frameworks_agents_rag_evals.md`.

## Frontend skills
- `generating-tailwind-brand-config` for brand tokens/config
- `baseline-ui`, `interface-design`, `frontend-design`, and `web-design-guidelines` for UI
- `interaction-design`, `12-principles-of-animation`, and `fixing-motion-performance` for motion
- `fixing-accessibility` and `wcag-audit-patterns` for a11y/UX
- `tailwind-css-patterns`, `composition-patterns`, and `react-best-practices` for styling/structure/perf/critique; `rams` as backup critique

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/db.server.ts
```ts
import "server-only";

import postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;

type GlobalDb = typeof globalThis & {
  __orbitalSql?: Sql;
  __orbitalSchemaReady?: Promise<void>;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Some Sprite environments route `localhost` to an IPv6 host that Postgres
    // does not accept by default. Normalise to IPv4 for local/dev.
    if (process.env.NODE_ENV !== "production" && url.includes("@localhost:")) {
      return url.replace("@localhost:", "@127.0.0.1:");
    }
    return url;
  }

  // PoC default for local dev (matches docker-compose.yml).
  if (process.env.NODE_ENV !== "production") {
    return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
  }

  // Important: Next.js evaluates route modules at build time with
  // `NODE_ENV=production`, even when a database is not available/required.
  // Defer the hard failure until the first DB operation is attempted.
  return "";
}

function createThrowingSql(message: string): Sql {
  const err = new Error(message);
  const fn = (() => {
    throw err;
  }) as unknown as Sql;

  return new Proxy(fn, {
    apply() {
      throw err;
    },
    get(_target, prop) {
      // Ensure even helper calls like `sql.json()` fail loudly and consistently.
      if (prop === "unsafe") return createThrowingSql(message);
      return new Proxy(() => {
        throw err;
      }, {
        apply() {
          throw err;
        },
      });
    },
  });
}

function createSql(): Sql {
  const url = databaseUrl();
  if (!url) {
    return createThrowingSql("DATABASE_URL is required in production.");
  }

  return postgres(url, {
    // Keep the pool small; Next dev reloads modules frequently.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const g = globalThis as GlobalDb;

function getSql(): Sql {
  if (!g.__orbitalSql) g.__orbitalSql = createSql();
  return g.__orbitalSql;
}

// Lazy, build-safe SQL client.
// Next.js may import route modules during `next build` without runtime env vars.
export const sql: Sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_target, _thisArg, argArray) {
    const real = getSql() as unknown as (...args: unknown[]) => unknown;
    return real(...argArray);
  },
  get(_target, prop) {
    const real = getSql() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

async function ensureSchemaInner(): Promise<void> {
  // Folders (Matters)
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('empty','ingesting','indexed','ready','failed')),
      latest_index_version TEXT NOT NULL DEFAULT 'v1',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Documents
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      bytes BIGINT NOT NULL,
      sha256 TEXT NULL,
      storage_key TEXT UNIQUE,
      upload_completed_at TIMESTAMPTZ NULL,
      parse_status TEXT NOT NULL CHECK (parse_status IN ('queued','parsing','parsed','failed')),
      ocr_status TEXT NOT NULL CHECK (ocr_status IN ('queued','running','done','failed')),
      page_count INT NULL,
      extraction_quality REAL NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Per-page OCR/layout output.
  await sql`
    CREATE TABLE IF NOT EXISTS document_pages (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      page_number INT NOT NULL,
      text TEXT NOT NULL,
      layout_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, page_number)
    );
  `;

  // Minimal chunk substrate to satisfy folder state invariants.
  await sql`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      index_version TEXT NOT NULL,
      chunk_index INT NOT NULL,
      page_start INT NULL,
      page_end INT NULL,
      text TEXT NOT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      text_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, index_version, chunk_index)
    );
  `;

  // Runs (Quick Start execution attempts)
  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('created','running','completed','partial','failed','cancelled')),
      index_version TEXT NOT NULL,
      agent_bundle_version TEXT NOT NULL,
      question_set_version TEXT NOT NULL,
      idempotency_key TEXT NULL,
      trace_id TEXT NULL,
      questions_total INT NOT NULL DEFAULT 0,
      questions_done INT NOT NULL DEFAULT 0,
      failure_counts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (folder_id, idempotency_key)
    );
  `;

  // Durable step execution log. Steps are responsible for idempotency via step_key.
  await sql`
    CREATE TABLE IF NOT EXISTS run_steps (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      step_type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('queued','running','succeeded','failed')),
      attempt INT NOT NULL DEFAULT 1,
      step_key TEXT NOT NULL,
      trace_id TEXT NULL,
      question_id TEXT NULL,
      metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, step_key)
    );
  `;

  // Enforce idempotency even if an older dev DB pre-dates the table constraint.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS run_steps_run_step_key_uidx
    ON run_steps(run_id, step_key);
  `;

  // Report rows are the durable, per-question output of a run (terminal statuses only).
  await sql`
    CREATE TABLE IF NOT EXISTS report_rows (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      question_set_version TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('needs_review','reviewed','missing_input','citation_failed')),
      notes TEXT NULL,
      provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      payload_schema_version TEXT NULL,
      payload_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, question_id),
      CHECK (status <> 'missing_input' OR answer = 'Not found in provided documents.')
    );
  `;

  // Enforce row uniqueness even if an older dev DB pre-dates the table constraint.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS report_rows_run_question_uidx
    ON report_rows(run_id, question_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS report_rows_folder_run_idx
    ON report_rows(folder_id, run_id);
  `;

  // Locked citations associated to a report row. In this slice we may emit zero citations.
  await sql`
    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      report_row_id TEXT NOT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
      document_id TEXT NOT NULL,
      page_number INT NOT NULL,
      snippet TEXT NOT NULL,
      snippet_hash TEXT NOT NULL,
      polygons_json JSONB NOT NULL,
      locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS citations_report_row_idx
    ON citations(report_row_id);
  `;

  // Exported artefacts (CSV, docx, etc).
  // Signed download URLs are generated at read-time and are never persisted.
  await sql`
    CREATE TABLE IF NOT EXISTS artefacts (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      kind TEXT NOT NULL,
      filename TEXT NOT NULL,
      storage_key TEXT NOT NULL UNIQUE,
      source_run_id TEXT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS artefacts_folder_created_idx
    ON artefacts(folder_id, created_at);
  `;
}

export async function ensureSchema(): Promise<void> {
  if (!g.__orbitalSchemaReady) {
    g.__orbitalSchemaReady = ensureSchemaInner();
  }
  await g.__orbitalSchemaReady;
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/ids.ts
```ts
import { randomUUID } from "node:crypto";

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/objectStore.server.ts
```ts
import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type GlobalObj = typeof globalThis & {
  __orbitalObjectStoreSecret?: string;
};

const STORAGE_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/documents\/[A-Za-z0-9_-]+\.pdf$/;
const ARTEFACT_CSV_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.csv$/i;
const ARTEFACT_DOCX_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.docx$/i;
const ARTEFACT_META_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.meta\.json$/i;

function objectStoreRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/object-store");
}

export function validateStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!STORAGE_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactCsvStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactDocxStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactMetadataStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_META_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: true };
  if (ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: true };
  return { ok: false, reason: "INVALID_STORAGE_KEY" };
}

function resolveObjectPath(storageKey: string): string {
  const base = objectStoreRoot();
  const candidate = path.resolve(base, storageKey);
  if (!candidate.startsWith(base + path.sep)) throw new Error("PATH_TRAVERSAL");
  return candidate;
}

function secret(): string {
  const fromEnv = process.env.OBJECT_STORE_SIGNING_SECRET;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  // Fail closed unless explicitly allowed in dev.
  const devFallbackAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_OBJECT_STORE_SECRET === "1";
  if (!devFallbackAllowed) {
    throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
  }

  // Dev-only fallback so local upload works out of the box.
  const g = globalThis as GlobalObj;
  if (!g.__orbitalObjectStoreSecret) {
    g.__orbitalObjectStoreSecret = `dev-${randomBytes(32).toString("hex")}`;
  }
  return g.__orbitalObjectStoreSecret;
}

function b64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const SIGNATURE_PAYLOAD_VERSION = "v1";

function sign(args: { purpose: string; storageKey: string; expiresAtMs: number }): string {
  const payload = `${SIGNATURE_PAYLOAD_VERSION}\n${args.purpose}\n${args.storageKey}\n${args.expiresAtMs}`;
  const digest = createHmac("sha256", secret()).update(payload).digest();
  return b64url(digest);
}

export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
  const expiresAtMs = args.expiresAtMs;
  if (!Number.isFinite(expiresAtMs)) return false;

  // Defensive-in-depth: signatures are not valid once expired, even if the HMAC matches.
  const now = Date.now();
  if (expiresAtMs < now) return false;

  // Cap far-future signatures so callers can't accidentally mint "near-permanent" URLs.
  const maxFutureMs = 24 * 60 * 60 * 1000;
  if (expiresAtMs > now + maxFutureMs) return false;

  const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
  const a = Buffer.from(expected);
  const b = Buffer.from(args.sig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function createSignedHeaders(args: {
  purpose: string;
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  const expiresInSeconds = args.expiresInSeconds ?? 10 * 60;
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
  const signature = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs });
  return { expires_at_ms: expiresAtMs, signature };
}

export function createSignedPutHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "put", ...args });
}

export function createSignedGetHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "get", ...args });
}

export function objectExists(storageKey: string): boolean {
  const p = resolveObjectPath(storageKey);
  return fs.existsSync(p);
}

function sha256Digest(bytes: Uint8Array): string {
  const hash = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hash}`;
}

async function writeObjectFile(p: string, bytes: Uint8Array, opts?: { writeOnce?: boolean }): Promise<void> {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (opts?.writeOnce) {
    await fs.promises.writeFile(p, bytes, { flag: "wx" });
    return;
  }
  await fs.promises.writeFile(p, bytes);
}

export async function putObject(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes);
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function putObjectWriteOnce(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes, { writeOnce: true });
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function readObject(storageKey: string): Promise<Uint8Array> {
  const p = resolveObjectPath(storageKey);
  const buf = await fs.promises.readFile(p);
  return new Uint8Array(buf);
}

export async function statObject(storageKey: string): Promise<fs.Stats> {
  const p = resolveObjectPath(storageKey);
  return fs.promises.stat(p);
}

export function createObjectReadStream(
  storageKey: string,
  opts?: { start?: number; end?: number },
): fs.ReadStream {
  const p = resolveObjectPath(storageKey);
  return fs.createReadStream(p, opts);
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/httpRange.server.ts
```ts
import "server-only";

export function parseSingleRangeHeader(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null {
  if (!Number.isSafeInteger(size) || size <= 0) return null;
  if (!rangeHeader.startsWith("bytes=")) return null;
  const range = rangeHeader.slice("bytes=".length).trim();

  // pdf.js typically uses single-range requests. Reject multi-range.
  if (range.includes(",")) return null;

  const firstDash = range.indexOf("-");
  if (firstDash === -1) return null;
  if (range.indexOf("-", firstDash + 1) !== -1) return null;

  const startStr = range.slice(0, firstDash).trim();
  const endStr = range.slice(firstDash + 1).trim();
  const hasStart = startStr !== "";
  const hasEnd = endStr !== "";

  if (!hasStart && !hasEnd) return null;

  function parseNonNegativeInt(val: string): number | null {
    if (!/^[0-9]+$/.test(val)) return null;
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n < 0) return null;
    return n;
  }

  let start: number;
  let end: number;

  if (!hasStart && hasEnd) {
    // suffix bytes: "-500"
    const suffixLen = parseNonNegativeInt(endStr);
    if (suffixLen === null || suffixLen <= 0) return null;
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    const parsedStart = parseNonNegativeInt(startStr);
    if (parsedStart === null) return null;
    start = parsedStart;

    if (!hasEnd) {
      end = size - 1;
    } else {
      const parsedEnd = parseNonNegativeInt(endStr);
      if (parsedEnd === null) return null;
      end = parsedEnd;
    }

    if (start > end) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/safePdfFilename.server.ts
```ts
import "server-only";

const DEFAULT_FILENAME = "document.pdf";

export function safePdfFilename(val: unknown): string {
  if (typeof val !== "string") return DEFAULT_FILENAME;
  const s = val.trim();
  if (!s) return DEFAULT_FILENAME;
  if (s.length > 200) return DEFAULT_FILENAME;
  if (!/^[A-Za-z0-9_.-]+\.pdf$/i.test(s)) return DEFAULT_FILENAME;
  return s;
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/folderState.server.ts
```ts
import "server-only";

import { ensureSchema, sql } from "./db.server";

export type FolderState = "empty" | "ingesting" | "indexed" | "ready" | "failed";

type DocRow = {
  id: string;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
  page_count: number | null;
  extraction_quality: number | null;
};

export async function deriveFolderState(folderId: string): Promise<FolderState> {
  await ensureSchema();

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0];
  if (!folder) throw new Error("FOLDER_NOT_FOUND");

  const docs = await sql<DocRow[]>`
    SELECT id, parse_status, ocr_status, page_count, extraction_quality
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  if (docs.length === 0) return "empty";

  if (docs.some((d) => d.parse_status === "failed" || d.ocr_status === "failed")) return "failed";

  const allTerminalSuccess = docs.every((d) => d.parse_status === "parsed" && d.ocr_status === "done");
  if (!allTerminalSuccess) return "ingesting";

  // All docs ingested; ensure chunks exist for the latest index version.
  const docIds = docs.map((d) => d.id);
  const chunks = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM chunks
    WHERE index_version = ${folder.latest_index_version}
      AND document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const chunked = new Map(chunks.map((r) => [r.document_id, r.n]));
  if (docIds.some((id) => (chunked.get(id) ?? 0) <= 0)) return "ingesting";

  // Health checks for "ready".
  const meetsQuality = docs.every((d) => (d.extraction_quality ?? 0) >= 0.6);
  if (!meetsQuality) return "indexed";

  const pageCounts = new Map(docs.map((d) => [d.id, d.page_count ?? null]));
  if ([...pageCounts.values()].some((n) => typeof n !== "number" || n <= 0)) return "indexed";

  const pageRows = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM document_pages
    WHERE document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const pages = new Map(pageRows.map((r) => [r.document_id, r.n]));
  const pagesMatch = docIds.every((id) => {
    const expected = pageCounts.get(id);
    if (typeof expected !== "number" || expected <= 0) return false;
    return (pages.get(id) ?? 0) === expected;
  });

  return pagesMatch ? "ready" : "indexed";
}

export async function refreshFolderState(folderId: string): Promise<FolderState> {
  const state = await deriveFolderState(folderId);
  await sql`
    UPDATE folders
    SET state = ${state}, updated_at = now()
    WHERE id = ${folderId}
  `;
  return state;
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/trace.server.ts
```ts
import { newId } from "./ids";

export function createTraceContext(): { traceId: string; headers: Headers } {
  const traceId = newId("trc");
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Trace-Id": traceId,
  });
  return { traceId, headers };
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/devOnly.ts
```ts
import { notFound } from "next/navigation";

export function assertDevOnly(): void {
  if (process.env.NODE_ENV !== "development") notFound();
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/devOnlyApi.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@orbital-poc/core";

export function assertDevOnlyApi(traceId: string, headers: Headers): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), {
    status: 404,
    headers,
  });
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/ingest/ingestQueue.server.ts
```ts
import "server-only";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { ensureSchema, sql } from "../db.server";
import { refreshFolderState } from "../folderState.server";
import { newId } from "../ids";
import { readObject } from "../objectStore.server";

type PdfJsTextItem = { str?: string };

type PdfJsPage = {
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>;
};

type PdfJsDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
};

type PdfJsModule = {
  GlobalWorkerOptions?: { workerSrc?: string };
  getDocument: (opts: { data: Uint8Array }) => { promise: Promise<PdfJsDoc> };
};

// Defensive caps: this ingest path runs in-process and writes extracted text into Postgres.
const MAX_PAGES = 200;
const MAX_TEXT_CHARS_PER_PAGE = 50_000;
const MAX_TOTAL_TEXT_CHARS = 2_000_000;

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let pdfjsConfigured = false;

async function loadPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs") as unknown as Promise<PdfJsModule>;
  }
  const pdfjs = await pdfjsPromise;
  if (!pdfjsConfigured) {
    // Next's server bundler relocates pdf.js files into vendor chunks, breaking
    // the default relative worker import ("./pdf.worker.mjs"). Force a package
    // specifier so Node can resolve it from node_modules at runtime.
    if (pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
    }
    pdfjsConfigured = true;
  }
  return pdfjs;
}

type DocForIngest = {
  id: string;
  folder_id: string;
  storage_key: string | null;
  upload_completed_at: string | null;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
};

const queue: string[] = [];
const running = new Set<string>();
let draining = false;

export function enqueueDocumentIngest(documentId: string): void {
  if (running.has(documentId)) return;
  if (queue.includes(documentId)) return;
  queue.push(documentId);
  void drain();
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (queue.length) {
      const next = queue.shift();
      if (!next) continue;
      if (running.has(next)) continue;
      running.add(next);
      try {
        await ingestOne(next);
      } finally {
        running.delete(next);
      }
    }
  } finally {
    draining = false;
  }
}

type SafeErrorJson = { code: string; message: string };

function safeError(code: string, message: string): SafeErrorJson {
  return { code, message };
}

async function failDocument(args: {
  documentId: string;
  folderId: string;
  error: SafeErrorJson;
}): Promise<void> {
  await sql`
    UPDATE documents
    SET parse_status = 'failed',
        ocr_status = 'failed',
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.documentId}
  `;
  await refreshFolderState(args.folderId);
}

async function ingestOne(documentId: string): Promise<void> {
  await ensureSchema();

  const docs = await sql<DocForIngest[]>`
    SELECT id, folder_id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) return;

  // Idempotency: don't restart successful/failed ingests.
  if (doc.parse_status === "parsed" && doc.ocr_status === "done") return;
  if (doc.parse_status === "failed" || doc.ocr_status === "failed") return;

  if (!doc.storage_key) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("MISSING_STORAGE_KEY", "Document is missing storage_key."),
    });
    return;
  }

  if (!doc.upload_completed_at) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_NOT_COMPLETE", "Upload has not completed yet."),
    });
    return;
  }

  await sql`
    UPDATE documents
    SET parse_status = 'parsing',
        ocr_status = 'running',
        error_json = NULL,
        updated_at = now()
    WHERE id = ${documentId}
      AND parse_status = 'queued'
      AND ocr_status = 'queued'
  `;
  await refreshFolderState(doc.folder_id);
  // Yield a tiny window so polling UIs can observe progress states.
  await new Promise((r) => setTimeout(r, 150));

  let bytes: Uint8Array;
  try {
    bytes = await readObject(doc.storage_key);
  } catch {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_MISSING", "Raw PDF not found for storage_key."),
    });
    return;
  }

  const pdfjs = await loadPdfjs();

  let pdf: PdfJsDoc;
  try {
    pdf = await pdfjs.getDocument({ data: bytes }).promise;
  } catch (err) {
    // Server-side only: keep client errors safe, but log detail for debugging.
    // Do not log raw PDF bytes.
    // eslint-disable-next-line no-console
    console.error("pdfjs getDocument failed", {
      documentId,
      message: err instanceof Error ? err.message : String(err),
    });
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PARSE_FAILED", "Unable to parse PDF."),
    });
    return;
  }

  const pageCount = typeof pdf.numPages === "number" && Number.isFinite(pdf.numPages) ? pdf.numPages : 0;
  if (pageCount <= 0) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PAGE_COUNT_INVALID", "Parsed PDF had no pages."),
    });
    return;
  }

  if (pageCount > MAX_PAGES) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("INGEST_TOO_MANY_PAGES", `PDF has too many pages (${pageCount}); max is ${MAX_PAGES}.`),
    });
    return;
  }

  await sql`
    UPDATE documents
    SET parse_status = 'parsed',
        page_count = ${pageCount},
        updated_at = now()
    WHERE id = ${documentId}
  `;
  await refreshFolderState(doc.folder_id);

  type LayoutJson = {
    source: "pdfjs";
    schema_version: "layout_v0";
    has_geometry: boolean;
    item_count: number;
  };

  const pages: Array<{ page_number: number; text: string; layout_json: LayoutJson }> = [];
  let totalChars = 0;
  let remainingChars = MAX_TOTAL_TEXT_CHARS;

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = Array.isArray(content.items) ? content.items : [];
    const rawText = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();
    const perPageCapped =
      rawText.length > MAX_TEXT_CHARS_PER_PAGE ? rawText.slice(0, MAX_TEXT_CHARS_PER_PAGE) : rawText;
    const text = remainingChars <= 0 ? "" : perPageCapped.slice(0, remainingChars);
    remainingChars = Math.max(0, remainingChars - text.length);
    totalChars += text.length;
    const layout_json: LayoutJson = {
      source: "pdfjs",
      schema_version: "layout_v0",
      has_geometry: false,
      item_count: items.length,
    };

    pages.push({
      page_number: pageNumber,
      text,
      layout_json,
    });
  }

  const avgCharsPerPage = totalChars / pageCount;
  // Heuristic PoC score: clean, text-heavy PDFs should typically clear the
  // 0.60 "ready" threshold; scans with little/no text should remain low.
  const extractionQuality = Math.max(0, Math.min(1, avgCharsPerPage / 600));
  const extractionQualityMethod = "pdfjs_text_chars_per_page_v2";
  const extractionMethod = "pdfjs";

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${doc.folder_id}
    LIMIT 1
  `;
  const indexVersion = folders[0]?.latest_index_version ?? "v1";

  try {
    await sql.begin(async (tx) => {
      // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
      const t = tx as unknown as typeof sql;

      await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
      for (const p of pages) {
        await t`
          INSERT INTO document_pages (id, document_id, page_number, text, layout_json, created_at, updated_at)
          VALUES (
            ${newId("pg")},
            ${documentId},
            ${p.page_number},
            ${p.text},
            ${t.json(p.layout_json)},
            now(),
            now()
          )
        `;
      }

      await t`
        UPDATE documents
        SET ocr_status = 'done',
            extraction_quality = ${extractionQuality},
            metadata_json = metadata_json || ${t.json({
              extraction_method: extractionMethod,
              extraction_has_geometry: false,
              extraction_quality_method: extractionQualityMethod,
            })},
            updated_at = now()
        WHERE id = ${documentId}
      `;

      await t`
        DELETE FROM chunks
        WHERE document_id = ${documentId}
          AND index_version = ${indexVersion}
      `;

      // Minimal chunking: one chunk per page.
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]!;
        const textHash = hashSnippet(p.text);
        await t`
          INSERT INTO chunks (
            id,
            document_id,
            index_version,
            chunk_index,
            page_start,
            page_end,
            text,
            metadata_json,
            text_hash,
            created_at
          )
          VALUES (
            ${newId("chk")},
            ${documentId},
            ${indexVersion},
            ${i},
            ${p.page_number},
            ${p.page_number},
            ${p.text},
            ${t.json({ page_number: p.page_number })},
            ${textHash},
            now()
          )
        `;
      }
    });
  } catch {
    await sql`
      UPDATE documents
      SET ocr_status = 'failed',
          error_json = ${sql.json(safeError("INGEST_FAILED", "Ingest failed while writing extracted pages."))},
          updated_at = now()
      WHERE id = ${documentId}
    `;
    await refreshFolderState(doc.folder_id);
    return;
  }

  await refreshFolderState(doc.folder_id);
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/fixtureSeed.server.ts
```ts
import "server-only";

import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { fixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

const SeedStatusSchema = z.enum(["needs_review", "reviewed", "missing_input", "citation_failed"]);

export const SeedCitationSchema = z.object({
  // Back-compat: older snapshots may not include document_id yet.
  document_id: z.string().min(1).optional(),
  document_filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+\.pdf$/i, "Invalid document filename"),
  page_number: z.number().int().positive(),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
});

export type SeedCitation = z.infer<typeof SeedCitationSchema>;

export type ResolvedSeedCitation = Omit<SeedCitation, "document_id"> & { document_id: string };

export const SeedSnapshotSchema = z.object({
  meta: z
    .object({
      pack_id: z.string().min(1),
    })
    .passthrough(),
  rows: z.array(
    z
      .object({
        question_id: z.string().min(1),
        question: z.string().min(1),
        answer: z.string(),
        status: SeedStatusSchema,
        citation_ids: z.array(z.string().min(1)),
        notes: z.string().nullable().optional(),
      })
      .passthrough(),
  ),
  citations: z.record(z.string().min(1), SeedCitationSchema),
});

export type SeedSnapshot = z.infer<typeof SeedSnapshotSchema>;
export type ResolvedSeedSnapshot = Omit<SeedSnapshot, "citations"> & { citations: Record<string, ResolvedSeedCitation> };

function seedRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/fixture-seed");
}

export function listSeededPackIds(): string[] {
  const root = seedRoot();
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && /^pack_\d{2}_[a-z0-9_]+$/i.test(e.name))
    .map((e) => e.name)
    .sort();
}

export function seedSnapshotPath(packId: string): string {
  return path.join(seedRoot(), packId, "snapshot.json");
}

export function loadSeedSnapshot(packId: string): ResolvedSeedSnapshot | null {
  const filePath = seedSnapshotPath(packId);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = SeedSnapshotSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    // Keep errors explicit in dev; this is a dev-only tracer bullet.
    throw new Error(`Invalid seed snapshot (${filePath}): ${parsed.error.message}`);
  }

  const citations: Record<string, ResolvedSeedCitation> = {};
  for (const [citationId, cit] of Object.entries(parsed.data.citations ?? {})) {
    citations[citationId] = {
      ...cit,
      document_id: cit.document_id ?? fixtureDocumentId({ packId, filename: cit.document_filename }),
    };
  }

  return { ...parsed.data, citations };
}

export function saveSeedSnapshot(packId: string, snapshot: SeedSnapshot): void {
  // Keep this dev-only tracer bullet strict: refuse to persist invalid snapshots.
  const parsed = SeedSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new Error(`Refusing to save invalid seed snapshot (${packId}): ${parsed.error.message}`);
  }

  const filePath = seedSnapshotPath(packId);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  // Best-effort atomic write on POSIX: write temp file then rename.
  const tmpPath = path.join(dir, `.snapshot.tmp.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tmpPath, JSON.stringify(parsed.data, null, 2) + "\n", "utf8");
  fs.renameSync(tmpPath, filePath);
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/overlayHighlight.ts
```ts
import type { SVGProps } from "react";

export const overlayHighlightPolygonProps = {
  fill: "rgb(var(--secondary) / 0.35)",
  stroke: "rgb(var(--secondary) / 0.7)",
  strokeWidth: 2,
} satisfies Pick<SVGProps<SVGPolygonElement>, "fill" | "stroke" | "strokeWidth">;


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/lib/validateNormPolygons.ts
```ts
import type { NormPolygons } from "@orbital-poc/core";

export function validateNormPolygons(polygons: NormPolygons): string | null {
  if (!polygons.length) return "NO_POLYGONS";
  for (const poly of polygons) {
    if (poly.length < 3) return "POLYGON_TOO_SMALL";
    for (const [x, y] of poly) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return "NON_FINITE";
      if (x < 0 || x > 1 || y < 0 || y > 1) return "OUT_OF_RANGE";
    }
  }
  return null;
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../lib/db.server";
import { assertDevOnlyApi } from "../../../lib/devOnlyApi.server";
import { newId } from "../../../lib/ids";
import { createTraceContext } from "../../../lib/trace.server";

export const runtime = "nodejs";

const CreateFolderSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const folders = await sql<
    Array<{
      id: string;
      name: string;
      state: string;
      latest_index_version: string;
      created_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at
    FROM folders
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        state: f.state,
        latest_index_version: f.latest_index_version,
        created_at: f.created_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = CreateFolderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = newId("fld");
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${folderId}, ${parsed.data.name}, 'empty', 'v1', now(), now())
  `;

  return Response.json(
    {
      folder: {
        id: folderId,
        name: parsed.data.name,
        state: "empty",
        latest_index_version: "v1",
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/folders/[id]/documents/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { newId } from "../../../../../lib/ids";
import { createSignedPutHeaders, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const InitUploadSchema = z.object({
  filename: z.string().trim().min(1),
  mime: z.literal("application/pdf"),
  bytes: z.number().int().positive(),
});

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documents = await sql<
    Array<{
      id: string;
      folder_id: string;
      filename: string;
      parse_status: string;
      ocr_status: string;
      extraction_quality: number | null;
      page_count: number | null;
      error_json: unknown | null;
      created_at: Date;
    }>
  >`
    SELECT id, folder_id, filename, parse_status, ocr_status, extraction_quality, page_count, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      documents: documents.map((d) => ({
        id: d.id,
        folder_id: d.folder_id,
        filename: d.filename,
        parse_status: d.parse_status,
        ocr_status: d.ocr_status,
        extraction_quality: d.extraction_quality,
        page_count: d.page_count,
        error_json: d.error_json,
        created_at: d.created_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = InitUploadSchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documentId = newId("doc");
  const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
  const validKey = validateStorageKey(storageKey);
  if (!validKey.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to create storage key.", traceId }), {
      status: 500,
      headers,
    });
  }

  await sql`
    INSERT INTO documents (
      id,
      folder_id,
      filename,
      mime,
      bytes,
      storage_key,
      parse_status,
      ocr_status,
      created_at,
      updated_at
    )
    VALUES (
      ${documentId},
      ${folderId},
      ${parsedBody.data.filename},
      ${parsedBody.data.mime},
      ${parsedBody.data.bytes},
      ${storageKey},
      'queued',
      'queued',
      now(),
      now()
    )
  `;

  const origin = new URL(req.url).origin;
  const signed = createSignedPutHeaders({ storageKey });

  return Response.json(
    {
      document: {
        id: documentId,
        folder_id: folderId,
        filename: parsedBody.data.filename,
        parse_status: "queued",
        ocr_status: "queued",
      },
      upload: {
        storage_key: storageKey,
        url: `${origin}/documents/${documentId}/upload`,
        method: "PUT",
        headers: {
          "Content-Type": parsedBody.data.mime,
          "X-Orbital-Upload-Expires": String(signed.expires_at_ms),
          "X-Orbital-Upload-Signature": signed.signature,
        },
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/upload/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { putObjectWriteOnce, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const ParamsSchema = z.object({
  id: z.string().min(1),
});

function parseExpectedBytes(val: unknown): number | null {
  if (typeof val === "number" && Number.isSafeInteger(val) && val > 0) return val;
  if (typeof val === "bigint") {
    if (val <= 0n) return null;
    if (val > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return Number(val);
  }
  if (typeof val === "string" && /^[0-9]+$/.test(val)) {
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n <= 0) return null;
    return n;
  }
  return null;
}

function hasPdfMagic(bytes: Uint8Array): boolean {
  // "%PDF-" (25 50 44 46 2d)
  return (
    bytes.byteLength >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export async function PUT(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const expiresHeader = req.headers.get("x-orbital-upload-expires");
  const sigHeader = req.headers.get("x-orbital-upload-signature");
  if (!expiresHeader || !sigHeader) {
    return Response.json(
      safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing upload signature headers.", traceId }),
      { status: 403, headers },
    );
  }

  const expiresAtMs = Number(expiresHeader);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid upload expires header.", traceId }),
      { status: 400, headers },
    );
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Upload URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      folder_id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      mime: string;
      bytes: unknown;
    }>
  >`
    SELECT id, folder_id, storage_key, upload_completed_at, mime, bytes
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.mime !== "application/pdf") {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document mime is not application/pdf.", traceId }), {
      status: 409,
      headers,
    });
  }

  const expectedBytes = parseExpectedBytes(doc.bytes);
  if (expectedBytes === null) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Document bytes is invalid.", traceId }), {
      status: 500,
      headers,
    });
  }

  if (expectedBytes > MAX_UPLOAD_BYTES) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload too large.",
        details: { bytes: expectedBytes, max_bytes: MAX_UPLOAD_BYTES },
        traceId,
      }),
      { status: 413, headers },
    );
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "put", storageKey: doc.storage_key, expiresAtMs, sig: sigHeader });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid upload signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await req.arrayBuffer());
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid request body.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload too large.", traceId }),
      { status: 413, headers },
    );
  }

  if (bytes.byteLength !== expectedBytes) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload size did not match document bytes.",
        details: { expected_bytes: expectedBytes, actual_bytes: bytes.byteLength },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!hasPdfMagic(bytes)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload must be a PDF.", traceId }),
      { status: 400, headers },
    );
  }

  let result: { bytesWritten: number; sha256: string };
  try {
    result = await putObjectWriteOnce({ storageKey: doc.storage_key, bytes });
  } catch (err) {
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (code === "EEXIST") {
      return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
        status: 409,
        headers,
      });
    }
    throw err;
  }

  const updated = await sql<{ id: string }[]>`
    UPDATE documents
    SET upload_completed_at = now(),
        sha256 = ${result.sha256},
        updated_at = now()
    WHERE id = ${doc.id}
      AND upload_completed_at IS NULL
    RETURNING id
  `;
  if (!updated[0]) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  await refreshFolderState(doc.folder_id);

  return new Response(null, { status: 200, headers });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/complete/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { enqueueDocumentIngest } from "../../../../../lib/ingest/ingestQueue.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  storage_key: z.string().min(1),
});

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      parse_status: "queued" | "parsing" | "parsed" | "failed";
      ocr_status: "queued" | "running" | "done" | "failed";
    }>
  >`
    SELECT id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key || doc.storage_key !== parsedBody.data.storage_key) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "storage_key did not match document.",
        details: { storage_key: "mismatch" },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.parse_status === "queued" && doc.ocr_status === "queued") {
    enqueueDocumentIngest(documentId);
  }

  return Response.json(
    {
      document: {
        id: doc.id,
        parse_status: doc.parse_status,
        ocr_status: doc.ocr_status,
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/render/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders, objectExists, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().positive(),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;
  const page = parsedQuery.data.page;

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    if (process.env.NODE_ENV !== "development") {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    // Verify the fixture PDF exists so we can fail closed on drift.
    const fs = await import("node:fs");
    const path = await import("node:path");
    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }
    try {
      const stat = fs.statSync(candidate);
      if (!stat.isFile()) throw new Error("NOT_A_FILE");
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const origin = new URL(req.url).origin;
    const signed = createSignedGetHeaders({ storageKey: `fixture:${documentId}` });
    const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
      expires: String(signed.expires_at_ms),
      sig: signed.signature,
    }).toString()}`;

    return Response.json(
      {
        document_id: documentId,
        page,
        render_url: renderUrl,
      },
      { status: 200, headers },
    );
  }

  await ensureSchema();

  const docs = await sql<
    Array<{ id: string; storage_key: string | null; upload_completed_at: Date | null; page_count: number | null }>
  >`
    SELECT id, storage_key, upload_completed_at, page_count
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!objectExists(doc.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Raw PDF not found for storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const pageCount = typeof doc.page_count === "number" && Number.isFinite(doc.page_count) ? doc.page_count : null;
  if (pageCount && page > pageCount) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "page is out of range.",
        details: { page: "out_of_range", page_count: pageCount },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;

  return Response.json(
    {
      document_id: documentId,
      page,
      render_url: renderUrl,
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/documents/[id]/pdf/route.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { parseSingleRangeHeader } from "../../../../../lib/httpRange.server";
import { createObjectReadStream, statObject, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { safePdfFilename } from "../../../../../lib/safePdfFilename.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;

  const url = new URL(req.url);
  const expiresRaw =
    url.searchParams.get("expires") ??
    url.searchParams.get("x_orbital_render_expires") ??
    req.headers.get("x-orbital-render-expires");
  const sigRaw =
    url.searchParams.get("sig") ??
    url.searchParams.get("x_orbital_render_signature") ??
    req.headers.get("x-orbital-render-signature");

  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid render expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Render URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    // Fixture documents are only available in dev.
    if (process.env.NODE_ENV !== "development") {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const sigOk = verifySignature({ purpose: "get", storageKey: `fixture:${documentId}`, expiresAtMs, sig: sigRaw });
    if (!sigOk) {
      return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
        status: 403,
        headers,
      });
    }

    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(candidate);
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }
    if (!stat.isFile()) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const size = stat.size;
    const rangeHeader = req.headers.get("range");
    const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${safePdfFilename(fixture.filename)}"`);

    if (!rangeHeader) {
      headers.set("Content-Length", String(size));
      const nodeStream = fs.createReadStream(candidate);
      return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
    }

    if (!range) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const { start, end } = range;
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));

    const nodeStream = fs.createReadStream(candidate, { start, end });
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
  }

  await ensureSchema();

  const docs = await sql<Array<{ id: string; storage_key: string | null; filename: string }>>`
    SELECT id, storage_key, filename
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "get", storageKey: doc.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(doc.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(doc.filename)}"`);

  if (!rangeHeader) {
    headers.set("Content-Length", String(size));
    const nodeStream = createObjectReadStream(doc.storage_key);
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
  }

  if (!range) {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const { start, end } = range;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));

  const nodeStream = createObjectReadStream(doc.storage_key, { start, end });
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(api)/citations/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  // Keep IDs intentionally constrained so we can safely validate and fail closed.
  // Fixture seed IDs look like: cit_TS-04_1, cit_TB_BAD_1
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^cit_[a-z0-9_-]+$/i, "Invalid citation id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for dev seed data where multiple packs may share ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
});

function findCitationInSeedSnapshots(args: {
  citationId: string;
  packId?: string;
}):
  | { ok: true; citation: { document_id: string; page_number: number; polygons: unknown; snippet: string; snippet_hash: string } }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{
    pack_id: string;
    citation: {
      document_id: string;
      page_number: number;
      polygons: unknown;
      snippet: string;
      snippet_hash: string;
    };
  }> = [];

  for (const packId of packIds) {
    let snapshot: ReturnType<typeof loadSeedSnapshot> | null;
    try {
      snapshot = loadSeedSnapshot(packId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("loadSeedSnapshot failed", {
        packId,
        message: err instanceof Error ? err.message : String(err),
      });
      return { ok: false, code: "INTERNAL", message: "Failed to load seed snapshot." };
    }
    if (!snapshot) continue;

    const cit = snapshot.citations?.[args.citationId];
    if (!cit) continue;

    hits.push({
      pack_id: packId,
      citation: {
        document_id: cit.document_id,
        page_number: cit.page_number,
        polygons: cit.polygons,
        snippet: cit.snippet,
        snippet_hash: cit.snippet_hash,
      },
    });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Citation not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "Citation id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.pack_id) },
    };
  }

  return { ok: true, citation: hits[0]!.citation };
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const citationId = parsedParams.data.id;

  const found = findCitationInSeedSnapshots({ citationId, packId: parsedQuery.data.pack });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      safeErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId,
      }),
      { status, headers },
    );
  }

  return Response.json(
    {
      citation: {
        id: citationId,
        document_id: found.citation.document_id,
        page_number: found.citation.page_number,
        polygons: found.citation.polygons,
        snippet: found.citation.snippet,
        snippet_hash: found.citation.snippet_hash,
      },
    },
    { status: 200, headers },
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/MattersToolbar.tsx
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Select } from "../../ui/Input";

type Props = {
  packIds: string[];
  selectedPackId: string;
};

export function MattersToolbar(props: Props) {
  const router = useRouter();
  const [pack, setPack] = useState(props.selectedPackId);

  const hasSeeded = props.packIds.length > 0;
  const options = useMemo(
    () => (hasSeeded ? props.packIds : [props.selectedPackId]),
    [hasSeeded, props.packIds, props.selectedPackId],
  );

  // Keep local state aligned when navigating (back/forward, etc).
  useEffect(() => {
    setPack(props.selectedPackId);
  }, [props.selectedPackId]);

  return (
    <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Seeded pack</span>
          <Select
            className="min-w-64"
            value={pack}
            onChange={(e) => {
              const next = e.currentTarget.value;
              setPack(next);
              router.push(`/matters?${new URLSearchParams({ pack: next }).toString()}`);
            }}
          >
            {options.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Select>
        </label>

        {!hasSeeded ? (
          <div className="text-xs text-muted-foreground">
            No seeded packs found. Run <code className="font-mono">pnpm fixture:seed pack_01_clean</code>.
          </div>
        ) : null}
      </div>
    </section>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/actions.ts
```ts
"use server";

import { z } from "zod";

import { redirect } from "next/navigation";

import { assertDevOnly } from "../../../lib/devOnly";
import { loadSeedSnapshot, saveSeedSnapshot } from "../../../lib/fixtureSeed.server";

const FormSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  question_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/),
});

type ReviewErrorCode =
  | "INVALID_REQUEST"
  | "SNAPSHOT_NOT_FOUND"
  | "ROW_NOT_FOUND"
  | "NOT_NEEDS_REVIEW"
  | "NO_LOCKED_CITATIONS";

function toRedirectUrl(args: { pack?: string; reviewed?: string; error?: { code: ReviewErrorCode; qid?: string } }) {
  const params = new URLSearchParams();
  if (args.pack) params.set("pack", args.pack);
  if (args.reviewed) params.set("reviewed", args.reviewed);
  if (args.error) {
    params.set("review_error", args.error.code);
    if (args.error.qid) params.set("qid", args.error.qid);
  }
  const qs = params.toString();
  return qs ? `/matters?${qs}` : "/matters";
}

function fdString(fd: FormData, key: string): string | undefined {
  const val = fd.get(key);
  return typeof val === "string" ? val : undefined;
}

export async function markRowReviewed(formData: FormData): Promise<void> {
  assertDevOnly();

  const parsed = FormSchema.safeParse({
    pack: fdString(formData, "pack"),
    question_id: fdString(formData, "question_id"),
  });
  if (!parsed.success) {
    redirect(toRedirectUrl({ error: { code: "INVALID_REQUEST" } }));
  }

  const packId = parsed.data.pack;
  const questionId = parsed.data.question_id;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "SNAPSHOT_NOT_FOUND" } }));
  }

  const row = snapshot.rows.find((r) => r.question_id === questionId);
  if (!row) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "ROW_NOT_FOUND", qid: questionId } }));
  }

  if (row.status !== "needs_review") {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NOT_NEEDS_REVIEW", qid: questionId } }));
  }

  const lockedCount = row.citation_ids.filter((cid) => Boolean(snapshot.citations?.[cid])).length;
  if (lockedCount < 1) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NO_LOCKED_CITATIONS", qid: questionId } }));
  }

  row.status = "reviewed";
  saveSeedSnapshot(packId, snapshot);
  redirect(toRedirectUrl({ pack: packId, reviewed: questionId }));
}


```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/page.tsx
```tsx
import { z } from "zod";

import { ListPayloadV0Schema, MissingDocCandidateSchema } from "@orbital-poc/core";

import { assertDevOnly } from "../../../lib/devOnly";
import { listSeededPackIds, loadSeedSnapshot } from "../../../lib/fixtureSeed.server";

import { ExportCsvButton } from "./ExportCsvButton";
import { ExportTraceButton } from "./ExportTraceButton";
import { MattersToolbar } from "./MattersToolbar";
import { ArtefactsList } from "./ArtefactsList";
import { markRowReviewed } from "./actions";

import { Badge, type BadgeVariant } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Chip } from "../../ui/Chip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
  reviewed: z.string().min(1).max(200).optional(),
  review_error: z.string().min(1).max(200).optional(),
  qid: z.string().min(1).max(200).optional(),
});

function statusVariant(status: string): BadgeVariant {
  if (status === "reviewed") return "success";
  if (status === "needs_review") return "warning";
  if (status === "citation_failed") return "destructive";
  return "muted";
}

function reviewErrorMessage(code: string): string {
  if (code === "NO_LOCKED_CITATIONS") return "Cannot mark reviewed: row has no locked citations.";
  if (code === "NOT_NEEDS_REVIEW") return "Cannot mark reviewed: only needs_review rows can be reviewed.";
  if (code === "ROW_NOT_FOUND") return "Cannot mark reviewed: row not found.";
  if (code === "SNAPSHOT_NOT_FOUND") return "Cannot mark reviewed: seed snapshot not found.";
  if (code === "INVALID_REQUEST") return "Cannot mark reviewed: invalid request.";
  return "Cannot mark reviewed.";
}

function matchStatusVariant(status: string): BadgeVariant {
  if (status === "matched") return "success";
  if (status === "ambiguous") return "warning";
  return "muted";
}

const MissingDocsProvenanceSchema = z
  .object({
    missing_docs_checklist: z.array(MissingDocCandidateSchema).optional(),
    missing_docs_candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
  })
  .passthrough();

function CitationChips(props: {
  packId: string;
  citationIds: string[];
  citations: Record<string, { document_id: string; page_number: number }> | undefined;
}) {
  if (!props.citationIds.length) return <div className="text-xs text-muted-foreground">(no citations)</div>;

  return props.citationIds.map((cid) => {
    const cit = props.citations?.[cid];
    const params = new URLSearchParams({ pack: props.packId, citation: cid });
    if (cit) {
      params.set("document_id", cit.document_id);
      params.set("page", String(cit.page_number));
    }

    return (
      <Chip key={cid} variant="citation" as="a" href={`/matters/viewer?${params.toString()}`}>
        {cid}
      </Chip>
    );
  });
}

function ExceptionsPayload(props: {
  packId: string;
  payload: unknown;
  citations: Record<string, { document_id: string; page_number: number }> | undefined;
}) {
  const parsed = ListPayloadV0Schema.safeParse(props.payload);
  if (!parsed.success) return null;
  if (parsed.data.kind !== "exceptions_table") return null;

  const items = parsed.data.items
    .filter((it) => it.kind === "exceptions_table_item")
    .slice()
    .sort((a, b) => a.bii_item - b.bii_item);

  if (!items.length) return null;

  return (
    <section className="mt-4 rounded-ui-lg border border-border bg-muted p-3">
      <div className="text-sm font-semibold text-foreground">Exceptions table</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Click an item to see its matched instrument PDF and the locked citations used as evidence.
      </p>

      <div className="mt-3 grid gap-2">
        {items.map((it) => (
          <details key={it.item_id} className="rounded-ui-md border border-border bg-card p-3">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {it.item_id}
                </div>
                <div className="text-sm font-medium text-foreground">{it.type}</div>
                <Badge variant={matchStatusVariant(it.match_status)}>{it.match_status}</Badge>
                {it.match_status === "matched" && it.doc ? (
                  <div className="text-xs text-muted-foreground">
                    matched: <span className="font-mono">{it.doc}</span>
                  </div>
                ) : null}
                {it.match_status === "ambiguous" && it.candidates?.length ? (
                  <div className="text-xs text-muted-foreground">candidates: {it.candidates.length}</div>
                ) : null}
              </div>
            </summary>

            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="font-medium text-foreground">Instrument</span>:{" "}
                  <span className="font-mono">{it.instrument_no ?? "(none)"}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Recorded</span>:{" "}
                  <span className="font-mono">{it.recorded_date ?? "(none)"}</span>
                </div>
              </div>

              {it.match_status === "missing_doc" ? (
                <section className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="font-medium text-foreground">Missing instrument document</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected filename: <span className="font-mono">{it.doc ?? "(unknown)"}</span>
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    <li>
                      Request{" "}
                      <span className="font-mono">{it.doc ?? "the instrument PDF"}</span>{" "}
                      from the title company/seller.
                    </li>
                    <li>
                      Confirm the PDF is the full recorded instrument (not a summary) and that the instrument number
                      matches <span className="font-mono">{it.instrument_no ?? "(unknown)"}</span>.
                    </li>
                    <li>Add the missing PDF to the diligence pack, then re-run this workflow.</li>
                  </ul>
                </section>
              ) : null}

              {it.match_status === "ambiguous" && it.candidates?.length ? (
                <div>
                  <div className="font-medium text-foreground">Candidates</div>
                  <ul className="mt-1 list-disc pl-5">
                    {it.candidates.map((c) => (
                      <li key={`${c.doc}:${String(c.instrument_no ?? "")}`}>
                        <span className="font-mono">{c.doc}</span>
                        {c.instrument_no ? (
                          <>
                            <span> (</span>
                            <span className="font-mono">{c.instrument_no}</span>
                            <span>)</span>
                          </>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <div className="font-medium text-foreground">Evidence (locked citations)</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CitationChips
                    packId={props.packId}
                    citationIds={it.citation_ids}
                    citations={props.citations}
                  />
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function MissingDocsChecklist(props: { provenance: unknown }) {
  const parsed = MissingDocsProvenanceSchema.safeParse(props.provenance);
  if (!parsed.success) return null;

  const highConfidence = (parsed.data.missing_docs_checklist ?? []).filter((c) => c.confidence >= 0.8);
  const lowConfidence = (parsed.data.missing_docs_candidates_low_confidence ?? []).filter((c) => c.confidence < 0.8);

  if (!highConfidence.length && !lowConfidence.length) return null;

  return (
    <section className="mt-3 rounded-ui-lg border border-border bg-muted p-3">
      <div className="text-sm font-semibold text-foreground">Missing document checklist</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Use the evidence signals below to request the exact PDF(s), verify the filename, then re-run the workflow.
      </p>

      {highConfidence.length ? (
        <ul className="mt-3 grid gap-2">
          {highConfidence.map((cand) => (
            <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {cand.label}
                </div>
                <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
              </div>
              {cand.signals.length ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">Evidence signals</div>
                  <ul className="mt-1 list-disc pl-5">
                    {cand.signals.map((s, idx) => (
                      <li key={`${s.type}:${s.value}:${s.source}:${String(s.page ?? "")}:${idx}`}>
                        <span className="font-medium">{s.source}</span>
                        {s.page ? <span> p.{s.page}</span> : null}
                        <span>: </span>
                        <span className="font-mono">
                          {s.type}={JSON.stringify(s.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">Checklist</div>
                <ul className="mt-1 list-disc pl-5">
                  <li>
                    Request <span className="font-mono">{cand.label}</span> from the title company/seller.
                  </li>
                  <li>
                    Confirm the file name matches <span className="font-mono">{cand.label}</span> (or adjust to match).
                  </li>
                  <li>Add it to the diligence pack and re-run the workflow.</li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {lowConfidence.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
            Show low-confidence candidates ({lowConfidence.length})
          </summary>
          <ul className="mt-2 grid gap-2">
            {lowConfidence.map((cand) => (
              <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {cand.label}
                  </div>
                  <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

export default async function MattersPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const seeded = listSeededPackIds();
  const parsed = SearchSchema.safeParse(searchParams);
  const selected = parsed.success ? parsed.data.pack : undefined;
  const packId = selected ?? seeded[0] ?? "pack_01_clean";

  const snapshot = loadSeedSnapshot(packId);
  const runId =
    snapshot && typeof snapshot.meta.run_id === "string"
      ? snapshot.meta.run_id
      : null;
  const traceExportEnabled = process.env.FEATURE_TRACE_EXPORT === "1";
  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";

  const reviewedQid = parsed.success ? parsed.data.reviewed : undefined;
  const reviewErrorCode = parsed.success ? parsed.data.review_error : undefined;
  const reviewErrorQid = parsed.success ? parsed.data.qid : undefined;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Matters</h1>
      <p className="mt-2 text-muted-foreground">
        Demo-only UI: rows with citation chips that open a PDF viewer + highlight overlay (fail-closed on invalid
        citations).
      </p>

      <div className="mt-6">
        <MattersToolbar packIds={seeded} selectedPackId={packId} />
      </div>

      {reviewErrorCode && !reviewErrorQid ? (
        <section className="mt-6 rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive shadow-ui-sm">
          <div className="font-semibold">Review not saved</div>
          <div className="mt-1 text-xs">{reviewErrorMessage(reviewErrorCode)}</div>
        </section>
      ) : null}

      {!snapshot ? (
        <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
          <div className="text-sm font-medium text-foreground">No seeded data for {packId}</div>
          <p className="mt-2 text-sm text-muted-foreground">Seed it locally, then refresh this page:</p>
          <pre className="mt-3 overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {`pnpm fixture:seed ${packId}`}
          </pre>
        </section>
      ) : (
        <>
          <section className="mt-6 flex flex-wrap items-center gap-3 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">pack_id:</span> {snapshot.meta.pack_id}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">run_id:</span> {String(snapshot.meta.run_id ?? "(none)")}
            </div>
            <div className="ml-auto flex items-start gap-4">
              <div className="flex flex-wrap items-start justify-end gap-2">
                <ExportCsvButton
                  folderId={packId}
                  runId={runId}
                  kind="requirements_tracker"
                  label="Export requirements"
                />
                <ExportCsvButton folderId={packId} runId={runId} kind="exceptions_table" label="Export exceptions" />
                <ExportCsvButton folderId={packId} runId={runId} kind="survey_issues" label="Export survey issues" />
              </div>
              {traceExportEnabled ? <ExportTraceButton folderId={packId} runId={runId} /> : null}
            </div>
          </section>

          {artefactsListEnabled ? (
            <div className="mt-6">
              <ArtefactsList folderId={packId} />
            </div>
          ) : null}

          <section className="mt-6 grid gap-4">
            {snapshot.rows.map((row) => (
              <div key={row.question_id} className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {row.question_id}
                  </div>
                  <div className="text-sm font-semibold text-foreground">{row.question}</div>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>

                  {row.status === "needs_review" ? (
                    <div className="ml-auto flex items-center gap-2">
                      <form action={markRowReviewed}>
                        <input type="hidden" name="pack" value={packId} />
                        <input type="hidden" name="question_id" value={row.question_id} />
                        <Button variant="success" size="sm" type="submit">
                          Mark reviewed
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </div>

                {reviewErrorCode && reviewErrorQid === row.question_id ? (
                  <div className="mt-3 rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <div className="font-semibold">Review not saved</div>
                    <div className="mt-1 text-xs">{reviewErrorMessage(reviewErrorCode)}</div>
                  </div>
                ) : reviewedQid === row.question_id && row.status === "reviewed" ? (
                  <div className="mt-3 rounded-ui-md border border-success/30 bg-success/10 p-3 text-sm text-success">
                    <div className="font-semibold">Saved</div>
                    <div className="mt-1 text-xs">Marked as reviewed.</div>
                  </div>
                ) : null}

                <div className="mt-2 text-sm text-muted-foreground">{row.answer}</div>

                {row.notes ? (
                  <section className="mt-3 rounded-ui-md border border-border bg-muted p-3">
                    <div className="text-xs font-semibold text-foreground">Notes</div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{row.notes}</pre>
                  </section>
                ) : null}

                {row.payload_schema_version === "list_payload_v0" ? (
                  <ExceptionsPayload
                    packId={packId}
                    payload={(row as { payload_json?: unknown }).payload_json}
                    citations={snapshot.citations}
                  />
                ) : null}

                {row.status === "missing_input" ? (
                  <MissingDocsChecklist provenance={(row as { provenance_json?: unknown }).provenance_json} />
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CitationChips packId={packId} citationIds={row.citation_ids} citations={snapshot.citations} />
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/[id]/page.tsx
```tsx
import { z } from "zod";

import Link from "next/link";

import { assertDevOnly } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";

import { ArtefactsList } from "../ArtefactsList";
import { ExportCsvButton } from "../ExportCsvButton";

import { ExportMemoButton } from "./ExportMemoButton";
import { QuickStartPanel } from "./QuickStartPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type FolderRow = {
  id: string;
  name: string;
  state: string;
  latest_index_version: string;
  created_at: Date;
  updated_at: Date;
};

type DocRow = {
  id: string;
  filename: string;
  storage_key: string | null;
  upload_completed_at: Date | null;
  parse_status: string;
  ocr_status: string;
  page_count: number | null;
  extraction_quality: number | null;
  error_json: unknown | null;
  created_at: Date;
};

type RunSummaryRow = {
  id: string;
  state: string;
  questions_total: number;
  questions_done: number;
  created_at: Date;
  updated_at: Date;
};

function renderUrl(doc: DocRow): string | null {
  if (!doc.storage_key || !doc.upload_completed_at) return null;
  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) return null;

  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  return `/documents/${encodeURIComponent(doc.id)}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;
}

export default async function MatterPage(props: { params: Promise<Record<string, string | string[] | undefined>> }) {
  assertDevOnly();

  const rawParams = await props.params;
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Matter</h1>
        <p className="mt-2 text-sm text-destructive">Invalid route params.</p>
      </main>
    );
  }

  await ensureSchema();

  const folderId = parsed.data.id;
  const folders = await sql<FolderRow[]>`
    SELECT id, name, state, latest_index_version, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Matter</h1>
        <p className="mt-2 text-sm text-muted-foreground">Matter not found.</p>
      </main>
    );
  }

  const docs = await sql<DocRow[]>`
    SELECT id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, questions_total, questions_done, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const latestRun = runs[0] ?? null;

  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";
  const completedRunId = latestRun?.state === "completed" ? latestRun.id : null;

  const runnable = folder.state === "indexed" || folder.state === "ready";
  let quickStartDisabledReason: string | null = null;
  if (latestRun) {
    quickStartDisabledReason =
      "Quick Start already started for this matter. Load the pack again to create a fresh matter (no cleanup).";
  } else if (!runnable) {
    quickStartDisabledReason = `Quick Start is disabled until the matter is indexed/ready (current state: ${folder.state}). Refresh in a moment.`;
  }

  const unsafeOverrideEnabled =
    process.env.DEMO_MODE === "1" &&
    process.env.ALLOW_UNSAFE_EXPORTS === "1" &&
    Boolean(process.env.ORBITAL_ADMIN_TOKEN?.trim());

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Matter</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {folder.id}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-foreground">{folder.name}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
              {folder.state}
            </span>
          </div>
        </div>

        <Link className="text-xs font-medium text-muted-foreground underline hover:text-foreground" href="/matters">
          Back to matters
        </Link>
      </div>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm font-semibold text-foreground">Seeded documents</div>
        <p className="mt-1 text-xs text-muted-foreground">
          This matter was created by the demo pack loader. Documents ingest in the background.
        </p>

        {docs.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">No documents.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {docs.map((d) => {
              const url = renderUrl(d);
              const ingest = `${d.parse_status}/${d.ocr_status}`;
              return (
                <div key={d.id} className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-ui-sm bg-foreground px-2 py-0.5 font-mono text-xs text-background">
                        {d.id}
                      </div>
                      <div className="text-sm font-medium text-foreground">{d.filename}</div>
                      <div className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
                        {ingest}
                      </div>
                      {typeof d.extraction_quality === "number" ? (
                        <div className="text-xs text-muted-foreground">
                          quality: {Math.round(d.extraction_quality * 100)}%
                        </div>
                      ) : null}
                      {typeof d.page_count === "number" ? (
                        <div className="text-xs text-muted-foreground">pages: {d.page_count}</div>
                      ) : null}
                    </div>

                    {url ? (
                      <a
                        className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <div className="text-xs text-muted-foreground">PDF not ready</div>
                    )}
                  </div>

                  {d.error_json ? (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                      {JSON.stringify(d.error_json, null, 2)}
                    </pre>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Quick Start</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the Quick Start run for this matter. To run the same demo again, load the pack again to create a
              fresh matter.
            </p>
          </div>

          <QuickStartPanel folderId={folderId} disabledReason={quickStartDisabledReason} />
        </div>

        {latestRun ? (
          <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
            <div>
              latest run: <span className="font-mono">{latestRun.id}</span> ({latestRun.state})
            </div>
            <div>
              progress: {latestRun.questions_done}/{latestRun.questions_total} questions
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="underline hover:text-foreground"
                href={`/runs/${encodeURIComponent(latestRun.id)}`}
                target="_blank"
                rel="noreferrer"
              >
                Run JSON
              </a>
              <a
                className="underline hover:text-foreground"
                href={`/folders/${encodeURIComponent(folderId)}/report?${new URLSearchParams({
                  run_id: latestRun.id,
                }).toString()}`}
                target="_blank"
                rel="noreferrer"
              >
                Report JSON
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              created: {latestRun.created_at.toISOString()} • updated: {latestRun.updated_at.toISOString()}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-muted-foreground">No Quick Start runs yet.</div>
        )}
      </section>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Exports</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Export a Word memo (.docx) and CSV artefacts for the latest completed run. Exports are disabled until a run
              completes.
            </p>
          </div>

          <div className="grid justify-items-end gap-2">
            <ExportMemoButton
              folderId={folderId}
              runId={latestRun?.id ?? null}
              runState={latestRun?.state ?? null}
              unsafeOverrideEnabled={unsafeOverrideEnabled}
            />
            <div className="flex flex-wrap items-start justify-end gap-2">
              <ExportCsvButton
                folderId={folderId}
                runId={completedRunId}
                kind="requirements_tracker"
                label="Export requirements"
              />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="exceptions_table" label="Export exceptions" />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="survey_issues" label="Export survey issues" />
            </div>
          </div>
        </div>
      </section>

      {artefactsListEnabled ? (
        <div className="mt-6">
          <ArtefactsList folderId={folderId} />
        </div>
      ) : null}
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/viewer/page.tsx
```tsx
import { z } from "zod";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";
import { fixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

import { headers } from "next/headers";

import { assertDevOnly } from "../../../../lib/devOnly";
import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";

import { CitationViewerClient } from "./CitationViewerClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  citation: z.string().min(1),
  document_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid document id")
    .optional(),
  page: z.coerce.number().int().positive().optional(),
});

const CitationResponseSchema = z.object({
  citation: z.object({
    id: z.string().min(1),
    document_id: z.string().min(1),
    page_number: z.number().int().positive(),
    polygons: z
      .array(z.array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])).min(3))
      .min(1),
    snippet: z.string(),
    snippet_hash: z.string().min(1),
  }),
});

const RenderResponseSchema = z.object({
  document_id: z.string().min(1),
  page: z.number().int().positive(),
  render_url: z.string().min(1),
});

async function originFromRequestHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  // Best-effort fallback for local dev.
  return "http://localhost:3000";
}

type SafeErr = { code: string; message: string };

function safeErrFromJson(json: unknown, fallback: SafeErr): SafeErr {
  if (!json || typeof json !== "object" || Array.isArray(json)) return fallback;
  const env = (json as { error?: unknown }).error;
  if (!env || typeof env !== "object" || Array.isArray(env)) return fallback;
  const code = (env as { code?: unknown }).code;
  const message = (env as { message?: unknown }).message;
  return {
    code: typeof code === "string" && code.trim() ? code.trim() : fallback.code,
    message: typeof message === "string" && message.trim() ? message.trim() : fallback.message,
  };
}

export default async function MatterViewerPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid query params.</p>
      </main>
    );
  }

  const packId = parsed.data.pack;
  const citationId = parsed.data.citation;
  const requestedDocId = parsed.data.document_id ?? null;
  const requestedPage = parsed.data.page ?? null;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No seeded snapshot for <span className="font-mono">{packId}</span>. Run{" "}
          <code className="font-mono">pnpm fixture:seed {packId}</code>.
        </p>
      </main>
    );
  }

  const origin = await originFromRequestHeaders();

  let citationJson: unknown;
  try {
    const res = await fetch(`${origin}/citations/${encodeURIComponent(citationId)}?${new URLSearchParams({ pack: packId }).toString()}`, {
      cache: "no-store",
    });
    citationJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(citationJson, { code: "CITATION_FETCH_FAILED", message: `Request failed (${res.status}).` });
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold">Viewer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load citation: <span className="font-mono">{citationId}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </main>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load citation: <span className="font-mono">{citationId}</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const parsedCitation = CitationResponseSchema.safeParse(citationJson);
  if (!parsedCitation.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid citation payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const cit = parsedCitation.data.citation;

  if (!cit) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Citation not found: <span className="font-mono">{citationId}</span>
        </p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const computed = hashSnippet(cit.snippet);
  let resolvedDocId = requestedDocId ?? cit.document_id;
  if (requestedDocId && /\.pdf$/i.test(requestedDocId) && !requestedDocId.startsWith("fx_")) {
    try {
      resolvedDocId = fixtureDocumentId({ packId, filename: requestedDocId });
    } catch {
      // Preserve the original string if it doesn't match the fixture id contract.
    }
  }
  const resolvedPage = requestedPage ?? cit.page_number;
  let errorCode: string | null = null;
  if (computed !== cit.snippet_hash) errorCode = "SNIPPET_HASH_MISMATCH";
  else if (resolvedDocId !== cit.document_id) errorCode = "DOC_MISMATCH";
  else if (resolvedPage !== cit.page_number) errorCode = "WRONG_PAGE";

  let renderJson: unknown;
  try {
    const res = await fetch(`${origin}/documents/${encodeURIComponent(resolvedDocId)}/render?page=${resolvedPage}`, {
      cache: "no-store",
    });
    renderJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(renderJson, { code: "RENDER_URL_FAILED", message: `Request failed (${res.status}).` });
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold">Viewer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </main>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const parsedRender = RenderResponseSchema.safeParse(renderJson);
  if (!parsedRender.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid render_url payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const pdfUrl = parsedRender.data.render_url;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
          Back to matters
        </a>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">citation:</span> <span className="font-mono">{citationId}</span>
        </div>
      </div>

      <div className="mt-6">
        <CitationViewerClient
          packId={packId}
          citationId={citationId}
          pdfUrl={pdfUrl}
          documentId={resolvedDocId}
          pageNumber={resolvedPage}
          polygons={cit.polygons}
          snippet={cit.snippet}
          snippetHash={cit.snippet_hash}
          computedSnippetHash={computed}
          errorCode={errorCode}
        />
      </div>
    </main>
  );
}

```

File: /Users/marc/Code/personal-projects/orbital-poc/apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  bboxFromCssPolygons,
  mapNormPolygonsToViewportCss,
  type CssPolygons,
  type NormPolygons,
  type PdfJsViewportLike,
  type ViewBox,
} from "@orbital-poc/core";
import { overlayHighlightPolygonProps } from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Select } from "../../../ui/Input";

type Props = {
  packId: string;
  citationId: string;
  pdfUrl: string;
  documentId: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
  snippetHash: string;
  computedSnippetHash: string;
  errorCode: string | null;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel?: () => void;
};

type PdfPageLike = {
  rotate?: number;
  view?: unknown;
  getViewport: (args: { scale: number; rotation: number }) => PdfJsViewportLike;
  render: (args: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewportLike;
    transform?: readonly [number, number, number, number, number, number];
  }) => PdfRenderTask;
};

type PdfDocLike = {
  numPages?: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
};

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: { url: string }) => { promise: Promise<PdfDocLike> };
};

function coerceViewBox(view: unknown): ViewBox {
  if (Array.isArray(view) && view.length >= 4) {
    const [xMin, yMin, xMax, yMax] = view;
    if (
      typeof xMin === "number" &&
      Number.isFinite(xMin) &&
      typeof yMin === "number" &&
      Number.isFinite(yMin) &&
      typeof xMax === "number" &&
      Number.isFinite(xMax) &&
      typeof yMax === "number" &&
      Number.isFinite(yMax)
    ) {
      return [xMin, yMin, xMax, yMax] as const;
    }
  }
  throw new Error("INVALID_VIEWBOX");
}

export function CitationViewerClient(props: Props) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const [userRotation, setUserRotation] = useState(0);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<PdfDocLike | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);

  const [overlay, setOverlay] = useState<CssPolygons>([]);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);

  const [hud, setHud] = useState<{
    pageRotate: number | null;
    totalRotation: number | null;
    viewport: { width: number; height: number } | null;
    overlayBbox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    errorCode: string | null;
    pdfjsVersion: string | null;
  }>({
    pageRotate: null,
    totalRotation: null,
    viewport: null,
    overlayBbox: null,
    errorCode: props.errorCode,
    pdfjsVersion: null,
  });

  const polygonError = validateNormPolygons(props.polygons);
  const highlightActive = props.errorCode === null && polygonError === null;
  const effectiveZoomPercent = highlightActive ? 100 : zoomPercent;

  // Cut: highlight overlays are verified at 100% only. Snap to 100% and
  // disable zoom while highlight is active to avoid accidental drift.
  useEffect(() => {
    if (!highlightActive) return;
    if (zoomPercent !== 100) setZoomPercent(100);
  }, [highlightActive, zoomPercent]);

  // Load pdf.js + PDF
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdf(null);
      setPdfPageCount(null);
      setOverlay([]);
      setHud((h) => ({ ...h, errorCode: props.errorCode, viewport: null, overlayBbox: null }));

      const m = (await import("pdfjs-dist/build/pdf.mjs")) as unknown as PdfJsModule;
      if (m.GlobalWorkerOptions) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const loadingTask = m.getDocument({ url: props.pdfUrl });
      const loadedPdf = await loadingTask.promise;
      if (cancelled) return;

      setPdfjs(m);
      setPdf(loadedPdf);
      setPdfPageCount(typeof loadedPdf.numPages === "number" ? loadedPdf.numPages : null);
      setHud((h) => ({ ...h, pdfjsVersion: m.version ?? null }));
    }

    run().catch((err) => {
      if (cancelled) return;
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: message }));
    });

    return () => {
      cancelled = true;
    };
  }, [props.errorCode, props.pdfUrl]);

  // Render page + overlay
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const canvas = document.getElementById("citation-canvas") as HTMLCanvasElement | null;
      if (!canvas || !pdf || !pdfjs) return;

      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdf.getPage(props.pageNumber);
      const pageRotate = Number(page.rotate ?? 0);
      const totalRotation = (pageRotate + userRotation) % 360;

      const scale = effectiveZoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: totalRotation });
      const viewBox = coerceViewBox(page.view);

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("NO_2D_CONTEXT");

      const transform = dpr !== 1 ? ([dpr, 0, 0, dpr, 0, 0] as const) : undefined;
      const renderTask = page.render({ canvasContext: ctx, viewport, transform });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (props.errorCode) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: props.errorCode,
        }));
        return;
      }

      const polyErr = polygonError;
      if (polyErr) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: polyErr,
        }));
        return;
      }

      const mapped = mapNormPolygonsToViewportCss({ polygons: props.polygons, viewBox, viewport });
      const bbox = bboxFromCssPolygons(mapped);
      const overlayBbox =
        bbox && Number.isFinite(bbox.minX)
          ? { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY }
          : null;

      if (!cancelled) {
        setOverlay(mapped);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox,
          errorCode: null,
        }));
      }
    }

    run().catch((err) => {
      setOverlay([]);
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: message, overlayBbox: null }));
    });

    return () => {
      cancelled = true;
    };
  }, [
    effectiveZoomPercent,
    pdf,
    pdfjs,
    polygonError,
    props.errorCode,
    props.pageNumber,
    props.polygons,
    userRotation,
  ]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">document_id:</span> {props.documentId}{" "}
              <span className="ml-2 font-medium text-foreground">page:</span> {props.pageNumber}{" "}
              {pdfPageCount ? <span className="text-muted-foreground">(of {pdfPageCount})</span> : null}
            </div>
            <div>
              <span className="font-medium text-foreground">pack:</span> {props.packId}{" "}
              <span className="ml-2 font-medium text-foreground">pdfjs:</span>{" "}
              {hud.pdfjsVersion ?? "(loading)"}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Zoom</span>
              <Select
                value={effectiveZoomPercent}
                disabled={highlightActive}
                onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              >
                {[75, 100, 125, 150].map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </Select>
              {highlightActive ? (
                <span className="text-xs text-muted-foreground">Locked to 100% while highlighting</span>
              ) : null}
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Rotation</span>
              <Select
                value={userRotation}
                onChange={(e) => setUserRotation(Number(e.currentTarget.value))}
              >
                {[0, 90, 180, 270].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="text-xs text-muted-foreground">snippet</div>
          <pre className="overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {props.snippet}
          </pre>

          <div className="grid gap-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">snippet_hash:</span>{" "}
              <span className="font-mono">{props.snippetHash}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">computed:</span>{" "}
              <span className="font-mono">{props.computedSnippetHash}</span>
            </div>
          </div>

          {hud.errorCode ? (
            <div className="rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="font-semibold">citation_failed</div>
              <div className="mt-1 text-xs">reason_code: {hud.errorCode}</div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">PDF + highlight overlay</div>
        <div className="relative mt-3 inline-block overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <div className="relative">
            <canvas id="citation-canvas" className="block" />

            {hud.errorCode ? (
              <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
                <div>
                  <div className="text-sm font-semibold text-foreground">citation_failed</div>
                  <div className="mt-1 text-xs text-muted-foreground">reason_code: {hud.errorCode}</div>
                </div>
              </div>
            ) : (
              <svg
                className="absolute left-0 top-0"
                width={hud.viewport?.width ?? 0}
                height={hud.viewport?.height ?? 0}
                viewBox={`0 0 ${hud.viewport?.width ?? 0} ${hud.viewport?.height ?? 0}`}
              >
                {overlayPath.map((points, idx) => (
                  <polygon
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    points={points}
                    {...overlayHighlightPolygonProps}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        {hud.overlayBbox ? (
          <div className="mt-3 text-xs text-muted-foreground">
            overlay bbox:{" "}
            <span className="font-mono">
              {`{minX:${Math.round(hud.overlayBbox.minX)}, minY:${Math.round(hud.overlayBbox.minY)}, maxX:${Math.round(
                hud.overlayBbox.maxX,
              )}, maxY:${Math.round(hud.overlayBbox.maxY)}}`}
            </span>
          </div>
        ) : null}
      </section>
    </div>
  );
}

```

</file_contents>
<user_instructions>
<taskname=Matter chat slice/>

<task>
Shape a 2–3 dev-day expansion of `orbital-poc` to add per-matter “chat with documents” (retrieval + citations) using Vercel AI SDK with an Anthropic provider, plus a UI that supports multiple Matters under a single Organization (no org switching in the UI for the PoC). Output a shaped packet (brief/PRD/breadboard/risks, in the repo’s wf-shape style) and a coherent implementation approach that fits the existing codebase and architecture docs.
</task>

<architecture>
- Current domain naming:
  - DB/API uses `folders` as the workspace container; UI calls it a “Matter”. See `docs/03-architecture/10_system_architecture.md` + `docs/03-architecture/20_state_model.md`.
- Current implemented PoC (not the target):
  - Next.js App Router (`apps/web`) + Postgres runtime schema (`apps/web/lib/db.server.ts`) + local FS object store (`apps/web/lib/objectStore.server.ts`).
  - Ingest: pdf.js text extraction (not OCR/geometry) writing `document_pages` + `chunks` (currently one chunk per page). `apps/web/lib/ingest/ingestQueue.server.ts`.
  - Evidence-first viewer UX is fixture/seed backed (snapshots under `tmp/fixture-seed`) for the `/matters?pack=...` demo UI and `/citations/:id` API. `apps/web/lib/fixtureSeed.server.ts`, `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(app)/matters/viewer/*`.
- Target architecture docs (aspirational): RAG retrieve→draft→lock→verify pipeline, hybrid retrieval (tsvector+pgvector), AI SDK as the single model interface, durable orchestration via WDK. See `docs/03-architecture/*`.
</architecture>

<selected_context>
- Matter UI (fixture-seeded demo):
  - `apps/web/app/(app)/matters/page.tsx`: seeded pack selector, report rows with citation chips linking to viewer.
  - `apps/web/app/(app)/matters/viewer/page.tsx`, `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`: citation fetch + signed render URL fetch + pdf.js rendering + fail-closed overlay/highlight behavior.
  - `apps/web/app/(app)/matters/actions.ts`, `apps/web/lib/fixtureSeed.server.ts`: seed snapshot loading and “mark reviewed” behavior (dev-only).
- Matter detail (DB-backed):
  - `apps/web/app/(app)/matters/[id]/page.tsx`: reads `folders` and `documents` directly from Postgres and constructs signed PDF links.
- HTTP APIs (existing patterns):
  - `apps/web/app/(api)/folders/route.ts`, `apps/web/app/(api)/folders/[id]/route.ts`, `apps/web/app/(api)/folders/[id]/documents/route.ts`: folder (matter) + docs APIs with Zod validation + `safeErrorEnvelope`.
  - `apps/web/app/(api)/documents/[id]/*`: upload completion + signed render URL + signed PDF serving with Range support.
  - `apps/web/app/(api)/demo/load-pack/route.ts`: seeds a DB folder from fixture PDFs under `docs/08-example-data` (dev-only + demo-mode gated).
- Persistence + trust primitives:
  - `apps/web/lib/db.server.ts`: current runtime DDL for `folders`, `documents`, `document_pages`, `chunks`, and trust-spine tables.
  - `packages/core/src/citations/snippet.ts`, `packages/core/src/verify/*`: canonical snippet hashing + integrity verifier semantics.
- Repo shaping templates + prior shaped initiatives:
  - `docs/04-projects/_templates/*`
  - `docs/04-projects/02-features/0001_trust-substrate/*`, `docs/04-projects/02-features/0002_quick-start-engine/*`
- Fixture pack structure:
  - `docs/08-example-data/README.md`, `docs/08-example-data/packs_summary.md`, `docs/08-example-data/pack_01_clean/manifest.json`
- Demo/copy that currently de-emphasizes chat:
  - `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/walkthrough.md`
  - `docs/98-tmp/handoffs/handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md` (“chat with documents is not implemented…”)
</selected_context>

<relationships>
- `/matters?pack=...` (fixture-seeded) -> citation chips -> `/matters/viewer?pack=...&citation=...` -> `GET /citations/:id` (fixture snapshot) -> `GET /documents/:id/render?page=N` -> `GET /documents/:id/pdf?...`.
- `/matters/[id]` (DB-backed) reads `folders`+`documents` tables directly and uses object-store signing helpers to build `/documents/:id/pdf?...`.
- Ingest (`apps/web/lib/ingest/ingestQueue.server.ts`) populates `document_pages` and `chunks` for uploaded/seeded PDFs; there is not yet an implemented retrieval+draft+lock system over `chunks`.
</relationships>

<ambiguities>
- There are effectively two “Matter” experiences today:
  - fixture-seeded report/citation demo at `/matters?pack=...`
  - DB-backed folder/document detail at `/matters/[id]`
  The new multi-matter + chat UI likely needs to decide whether to build on the DB-backed `/folders` APIs (and/or unify these surfaces) vs keep chat as another dev-only demo slice.
- No Organization concept exists in current DB schema (`apps/web/lib/db.server.ts`) or HTTP APIs; adding Org→Matters will require deciding minimal fields and whether to keep `folders` as “matter” table or introduce `organizations` + FK.
- “Chat with documents” must supply citations; current implemented citations with polygons/snippets are fixture-backed, while DB ingested docs have no geometry (no OCR/layout), so citation UX may need a temporary strategy (page-level citations only, no polygons) or a narrow geometry approach.
</ambiguities>

</user_instructions>
