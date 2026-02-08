import { z } from "zod";

import { MissingDocCandidateSchema } from "@orbital-poc/core";

import { assertDevOnly } from "../../../lib/devOnly";
import { listSeededPackIds, loadSeedSnapshot } from "../../../lib/fixtureSeed.server";

import { ExportCsvButton } from "./ExportCsvButton";
import { MattersToolbar } from "./MattersToolbar";
import { markRowReviewed } from "./actions";

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

function statusClass(status: string): string {
  if (status === "reviewed") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (status === "needs_review") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (status === "missing_input") return "bg-slate-100 text-slate-800 ring-slate-200";
  if (status === "citation_failed") return "bg-red-50 text-red-800 ring-red-200";
  return "bg-slate-100 text-slate-800 ring-slate-200";
}

function reviewErrorMessage(code: string): string {
  if (code === "NO_LOCKED_CITATIONS") return "Cannot mark reviewed: row has no locked citations.";
  if (code === "NOT_NEEDS_REVIEW") return "Cannot mark reviewed: only needs_review rows can be reviewed.";
  if (code === "ROW_NOT_FOUND") return "Cannot mark reviewed: row not found.";
  if (code === "SNAPSHOT_NOT_FOUND") return "Cannot mark reviewed: seed snapshot not found.";
  if (code === "INVALID_REQUEST") return "Cannot mark reviewed: invalid request.";
  return "Cannot mark reviewed.";
}

const MissingDocsProvenanceSchema = z
  .object({
    missing_docs_checklist: z.array(MissingDocCandidateSchema).optional(),
    missing_docs_candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
  })
  .passthrough();

function MissingDocsChecklist(props: { provenance: unknown }) {
  const parsed = MissingDocsProvenanceSchema.safeParse(props.provenance);
  if (!parsed.success) return null;

  const highConfidence = (parsed.data.missing_docs_checklist ?? []).filter((c) => c.confidence >= 0.8);
  const lowConfidence = (parsed.data.missing_docs_candidates_low_confidence ?? []).filter((c) => c.confidence < 0.8);

  if (!highConfidence.length && !lowConfidence.length) return null;

  return (
    <section className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
      <div className="text-sm font-semibold text-slate-900">Missing document checklist</div>
      <p className="mt-1 text-xs text-slate-600">Upload the missing PDF(s), then re-run the workflow for this row.</p>

      {highConfidence.length ? (
        <ul className="mt-3 grid gap-2">
          {highConfidence.map((cand) => (
            <li key={cand.label} className="rounded border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">{cand.label}</div>
                <div className="text-xs text-slate-600">confidence: {Math.round(cand.confidence * 100)}%</div>
              </div>
              {cand.signals.length ? (
                <div className="mt-2 text-xs text-slate-700">
                  <div className="font-medium text-slate-800">Evidence signals</div>
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
            </li>
          ))}
        </ul>
      ) : null}

      {lowConfidence.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-slate-700">
            Show low-confidence candidates ({lowConfidence.length})
          </summary>
          <ul className="mt-2 grid gap-2">
            {lowConfidence.map((cand) => (
              <li key={cand.label} className="rounded border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">{cand.label}</div>
                  <div className="text-xs text-slate-600">confidence: {Math.round(cand.confidence * 100)}%</div>
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

  const reviewedQid = parsed.success ? parsed.data.reviewed : undefined;
  const reviewErrorCode = parsed.success ? parsed.data.review_error : undefined;
  const reviewErrorQid = parsed.success ? parsed.data.qid : undefined;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Matters</h1>
      <p className="mt-2 text-slate-700">
        Tracer-bullet UI: rows with citation chips that open a PDF viewer + highlight overlay (fail-closed on invalid
        citations).
      </p>

      <div className="mt-6">
        <MattersToolbar packIds={seeded} selectedPackId={packId} />
      </div>

      {reviewErrorCode && !reviewErrorQid ? (
        <section className="mt-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-semibold">Review not saved</div>
          <div className="mt-1 text-xs">{reviewErrorMessage(reviewErrorCode)}</div>
        </section>
      ) : null}

      {!snapshot ? (
        <section className="mt-6 rounded border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-900">No seeded data for {packId}</div>
          <p className="mt-2 text-sm text-slate-700">Seed it locally, then refresh this page:</p>
          <pre className="mt-3 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {`pnpm fixture:seed ${packId}`}
          </pre>
        </section>
      ) : (
        <>
          <section className="mt-6 flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">pack_id:</span> {snapshot.meta.pack_id}
            </div>
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">run_id:</span> {String(snapshot.meta.run_id ?? "(none)")}
            </div>
            <div className="ml-auto">
              <ExportCsvButton packId={packId} />
            </div>
          </section>

          <section className="mt-6 grid gap-4">
            {snapshot.rows.map((row) => (
              <div key={row.question_id} className="rounded border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">
                    {row.question_id}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{row.question}</div>
                  <div
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </div>

                  {row.status === "needs_review" ? (
                    <div className="ml-auto flex items-center gap-2">
                      <form action={markRowReviewed}>
                        <input type="hidden" name="pack" value={packId} />
                        <input type="hidden" name="question_id" value={row.question_id} />
                        <button
                          className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          type="submit"
                        >
                          Mark reviewed
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>

                {reviewErrorCode && reviewErrorQid === row.question_id ? (
                  <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <div className="font-semibold">Review not saved</div>
                    <div className="mt-1 text-xs">{reviewErrorMessage(reviewErrorCode)}</div>
                  </div>
                ) : reviewedQid === row.question_id && row.status === "reviewed" ? (
                  <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    <div className="font-semibold">Saved</div>
                    <div className="mt-1 text-xs">Marked as reviewed.</div>
                  </div>
                ) : null}

                <div className="mt-2 text-sm text-slate-700">{row.answer}</div>

                {row.status === "missing_input" ? (
                  <MissingDocsChecklist provenance={(row as { provenance_json?: unknown }).provenance_json} />
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {row.citation_ids.length ? (
                    row.citation_ids.map((cid) => {
                      const cit = snapshot.citations?.[cid];
                      const params = new URLSearchParams({ pack: packId, citation: cid });
                      if (cit) {
                        params.set("document_id", cit.document_filename);
                        params.set("page", String(cit.page_number));
                      }

                      return (
                        <a
                          key={cid}
                          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                          href={`/matters/viewer?${params.toString()}`}
                        >
                          {cid}
                        </a>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-500">(no citations)</div>
                  )}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
