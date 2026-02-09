import { z } from "zod";

import { ListPayloadV0Schema, MissingDocCandidateSchema } from "@orbital-poc/core";

import { assertDevOnly } from "../../../lib/devOnly";
import { listSeededPackIds, loadSeedSnapshot } from "../../../lib/fixtureSeed.server";

import { ExportCsvButton } from "./ExportCsvButton";
import { ExportTraceButton } from "./ExportTraceButton";
import { MattersToolbar } from "./MattersToolbar";
import { ArtefactsList } from "./ArtefactsList";
import { markRowReviewed } from "./actions";

import { AccordionItem } from "../../ui/Accordion";
import { Alert } from "../../ui/Alert";
import { Badge, type BadgeVariant } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Chip } from "../../ui/Chip";
import { MonoId } from "../../ui/MonoId";
import { Page, PageHeader, PageSection } from "../../ui/Page";

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
    <Card variant="muted" className="mt-4 p-3">
      <div className="text-sm font-semibold text-foreground">Exceptions table</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Click an item to see its matched instrument PDF and the locked citations used as evidence.
      </p>

      <div className="mt-3 grid gap-2">
        {items.map((it) => (
          <AccordionItem
            key={it.item_id}
            className="rounded-ui-md border border-border bg-card p-3 [&>summary]:px-0 [&>summary]:py-0 [&>div]:px-0 [&>div]:pb-0"
            trigger={
              <div className="flex flex-wrap items-center gap-2">
                <MonoId>{it.item_id}</MonoId>
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
            }
          >
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
          </AccordionItem>
        ))}
      </div>
    </Card>
  );
}

function MissingDocsChecklist(props: { provenance: unknown }) {
  const parsed = MissingDocsProvenanceSchema.safeParse(props.provenance);
  if (!parsed.success) return null;

  const highConfidence = (parsed.data.missing_docs_checklist ?? []).filter((c) => c.confidence >= 0.8);
  const lowConfidence = (parsed.data.missing_docs_candidates_low_confidence ?? []).filter((c) => c.confidence < 0.8);

  if (!highConfidence.length && !lowConfidence.length) return null;

  return (
    <Card variant="muted" className="mt-3 p-3">
      <div className="text-sm font-semibold text-foreground">Missing document checklist</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Use the evidence signals below to request the exact PDF(s), verify the filename, then re-run the workflow.
      </p>

      {highConfidence.length ? (
        <ul className="mt-3 grid gap-2">
          {highConfidence.map((cand) => (
            <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <MonoId>{cand.label}</MonoId>
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
        <AccordionItem
          className="mt-3"
          trigger={
            <span className="text-xs font-medium text-muted-foreground">
              Show low-confidence candidates ({lowConfidence.length})
            </span>
          }
        >
          <ul className="mt-2 grid gap-2">
            {lowConfidence.map((cand) => (
              <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MonoId>{cand.label}</MonoId>
                  <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
                </div>
              </li>
            ))}
          </ul>
        </AccordionItem>
      ) : null}
    </Card>
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
    <Page>
      <PageHeader
        title="Matters"
        subtitle="Demo-only UI: rows with citation chips that open a PDF viewer + highlight overlay (fail-closed on invalid citations)."
      />

      <PageSection>
        <MattersToolbar packIds={seeded} selectedPackId={packId} />
      </PageSection>

      {reviewErrorCode && !reviewErrorQid ? (
        <PageSection>
          <Alert variant="destructive" title="Review not saved">
            {reviewErrorMessage(reviewErrorCode)}
          </Alert>
        </PageSection>
      ) : null}

      {!snapshot ? (
        <Card className="mt-8 p-4">
          <div className="text-sm font-medium text-foreground">No seeded data for {packId}</div>
          <p className="mt-2 text-sm text-muted-foreground">Seed it locally, then refresh this page:</p>
          <pre className="mt-3 overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {`pnpm fixture:seed ${packId}`}
          </pre>
        </Card>
      ) : (
        <>
          <Card className="mt-8 flex flex-wrap items-center gap-3 p-4">
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
          </Card>

          {artefactsListEnabled ? (
            <div className="mt-8">
              <ArtefactsList folderId={packId} />
            </div>
          ) : null}

          <section className="mt-8 grid gap-4">
            {snapshot.rows.map((row) => (
              <Card key={row.question_id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <MonoId>{row.question_id}</MonoId>
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
                  <Alert variant="destructive" title="Review not saved" className="mt-3">
                    {reviewErrorMessage(reviewErrorCode)}
                  </Alert>
                ) : reviewedQid === row.question_id && row.status === "reviewed" ? (
                  <Alert variant="success" title="Saved" className="mt-3">
                    Marked as reviewed.
                  </Alert>
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
              </Card>
            ))}
          </section>
        </>
      )}
    </Page>
  );
}
