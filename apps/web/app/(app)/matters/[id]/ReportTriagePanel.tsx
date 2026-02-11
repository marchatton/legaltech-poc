"use client";

import { useMemo, useState } from "react";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { InlineStatus } from "../../../ui/InlineStatus";
import { cn } from "../../../ui/cn";

type ReportTriageTab = "all" | "needs_review" | "reviewed" | "flagged";

type ReportRowForDrawer = {
  id: string;
  question_id: string;
  question: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
  updated_at: string;
  citation_count: number;
  citation_ids: string[];
};

type Props = {
  folderId: string;
  rowTab: ReportTriageTab;
  rows: ReportRowForDrawer[];
  modelVersion: string | null;
};

type ActionFeedback =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; error: SafeErrorDisplay };

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

function statusPresentation(status: string): { label: string; variant: BadgeVariant } {
  if (status === "reviewed") return { label: "Reviewed", variant: "success" };
  if (status === "needs_review") return { label: "Needs Review", variant: "warning" };
  if (status === "citation_failed") return { label: "Citation Failed", variant: "destructive" };
  if (status === "missing_input") return { label: "Missing Input", variant: "destructive" };
  return { label: status, variant: "muted" };
}

function reasonCodeFromProvenance(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const reasonCode = (provenance as { reason_code?: unknown }).reason_code;
  return typeof reasonCode === "string" && reasonCode.trim().length > 0 ? reasonCode : null;
}

function formatTimestamp(raw: string): string {
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

function rowMatchesTab(args: { status: string; rowTab: ReportTriageTab }): boolean {
  if (args.rowTab === "all") return true;
  if (args.rowTab === "flagged") return args.status === "citation_failed" || args.status === "missing_input";
  return args.status === args.rowTab;
}

function inferDataType(row: ReportRowForDrawer): string {
  if (row.payload_schema_version) return row.payload_schema_version;
  if (typeof row.payload_json === "string") return "string";
  if (typeof row.payload_json === "number") return "number";
  if (typeof row.payload_json === "boolean") return "boolean";
  if (Array.isArray(row.payload_json)) return "array";
  if (row.payload_json && typeof row.payload_json === "object") return "object";
  return "text";
}

function payloadKind(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const kind = payload.kind;
  return typeof kind === "string" && kind.trim().length > 0 ? kind.trim() : null;
}

function stringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? "null";
  } catch {
    return String(value);
  }
}

function toSafeError(err: unknown, fallbackMessage: string): SafeErrorDisplay {
  if (isRecord(err)) {
    const code = typeof err.code === "string" && err.code.trim() ? err.code.trim() : null;
    const message = typeof err.message === "string" && err.message.trim() ? err.message.trim() : null;
    if (code && message) {
      return {
        code,
        message,
        retryable: typeof err.retryable === "boolean" ? err.retryable : undefined,
        traceId: typeof err.traceId === "string" ? err.traceId : undefined,
      };
    }
  }
  if (err instanceof Error && err.message.trim().length > 0) {
    return { code: "NETWORK_ERROR", message: err.message, retryable: true };
  }
  return { code: "UNKNOWN_ERROR", message: fallbackMessage, retryable: true };
}

export function ReportTriagePanel(props: Props) {
  const [rows, setRows] = useState<ReportRowForDrawer[]>(props.rows);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback>({ kind: "idle" });

  const visibleRows = useMemo(
    () => rows.filter((row) => rowMatchesTab({ status: row.status, rowTab: props.rowTab })),
    [rows, props.rowTab],
  );

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRowId) ?? null,
    [rows, selectedRowId],
  );

  async function handleMarkReviewed(rowId: string): Promise<void> {
    const existing = rows.find((row) => row.id === rowId);
    if (!existing || existing.status === "reviewed") return;

    const optimisticRow: ReportRowForDrawer = {
      ...existing,
      status: "reviewed",
      updated_at: new Date().toISOString(),
    };

    setRows((prev) => prev.map((row) => (row.id === rowId ? optimisticRow : row)));
    setPendingRowId(rowId);
    setFeedback({ kind: "idle" });

    try {
      const res = await fetch(`/report-rows/${encodeURIComponent(rowId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_reviewed" }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const envelope =
          parseSafeErrorEnvelope(json) ??
          ({
            code: `HTTP_${res.status}`,
            message: `Mark reviewed failed (${res.status}).`,
            retryable: res.status >= 500,
          } satisfies SafeErrorDisplay);
        throw envelope;
      }

      const nextRow = isRecord(json) && isRecord(json.row) ? json.row : null;
      const status = typeof nextRow?.status === "string" && nextRow.status.trim() ? nextRow.status.trim() : "reviewed";
      const updatedAt =
        typeof nextRow?.updated_at === "string" && nextRow.updated_at.trim()
          ? nextRow.updated_at.trim()
          : optimisticRow.updated_at;

      setRows((prev) =>
        prev.map((row) =>
          row.id === rowId
            ? {
                ...row,
                status,
                updated_at: updatedAt,
              }
            : row,
        ),
      );

      setFeedback({
        kind: "success",
        message: `Marked ${existing.question_id} reviewed.`,
      });
    } catch (err) {
      setRows((prev) => prev.map((row) => (row.id === rowId ? existing : row)));
      setFeedback({
        kind: "error",
        error: toSafeError(err, "Mark reviewed failed unexpectedly."),
      });
    } finally {
      setPendingRowId(null);
    }
  }

  return (
    <>
      <div className={cn("mt-4", selectedRow ? "pr-0 xl:pr-[34rem]" : null)}>
        <div className="max-h-[34rem] overflow-auto rounded-ui-md border border-border">
          <table className="w-full min-w-[1080px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
              <tr>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  QID
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Question
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Answer
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Citations
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Provenance
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Updated
                </th>
                <th className="border-b border-border px-3 py-2 font-mono text-2xs uppercase tracking-wide text-muted-foreground">
                  Review
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={8}>
                    No rows match <span className="font-mono">{props.rowTab}</span>.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const status = statusPresentation(row.status);
                  const reasonCode = reasonCodeFromProvenance(row.provenance_json);
                  const selected = selectedRow?.id === row.id;
                  return (
                    <tr key={row.id} className={cn("border-b border-border/60 align-top hover:bg-muted/30", selected ? "bg-muted/30" : null)}>
                      <td className="px-3 py-2">
                        <span className="font-mono text-2xs text-muted-foreground">{row.question_id}</span>
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        <div className="max-w-sm leading-relaxed">{row.question}</div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <div className="max-w-xl whitespace-pre-wrap break-words leading-relaxed">
                          {row.answer.trim().length > 0 ? row.answer : "Not provided."}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-2xs text-muted-foreground">{row.citation_count}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <div className="max-w-52 break-words">
                          {reasonCode ? (
                            <span className="font-mono text-2xs">{reasonCode}</span>
                          ) : row.notes?.trim() ? (
                            row.notes
                          ) : (
                            "None"
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-2xs text-muted-foreground">{formatTimestamp(row.updated_at)}</td>
                      <td className="px-3 py-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedRowId(row.id)}>
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow ? (
        <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-[34rem] border-l border-border bg-card shadow-ui-lg">
          <div className="flex h-full flex-col">
            <div className="border-b border-border bg-muted/40 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-ui-sm bg-card px-2 py-0.5 font-mono text-2xs text-muted-foreground ring-1 ring-inset ring-border/70">
                      {selectedRow.question_id}
                    </span>
                    <Badge variant={statusPresentation(selectedRow.status).variant} size="sm">
                      {statusPresentation(selectedRow.status).label}
                    </Badge>
                  </div>
                  <h2 className="line-clamp-2 text-base font-semibold text-foreground">{selectedRow.question}</h2>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRowId(null)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {feedback.kind === "error" ? (
                <ErrorBanner
                  title="Row action failed"
                  code={feedback.error.code}
                  message={feedback.error.message}
                  traceId={feedback.error.traceId}
                  retryable={feedback.error.retryable}
                  showSupportAction={false}
                />
              ) : null}
              <InlineStatus kind={feedback.kind === "success" ? "success" : "idle"}>
                {feedback.kind === "success" ? feedback.message : null}
              </InlineStatus>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extracted answer</h3>
                <div className="mt-2 rounded-ui-md border border-border bg-background p-3 text-sm leading-relaxed text-foreground">
                  {selectedRow.answer.trim().length > 0 ? selectedRow.answer : "Not provided."}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Structured payload</h3>
                <div className="mt-2 space-y-2 rounded-ui-md border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>schema</span>
                    <span className="font-mono text-foreground">{selectedRow.payload_schema_version ?? "none"}</span>
                  </div>
                  {payloadKind(selectedRow.payload_json) ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>kind</span>
                      <span className="font-mono text-foreground">{payloadKind(selectedRow.payload_json)}</span>
                    </div>
                  ) : null}
                  {selectedRow.payload_json !== null && selectedRow.payload_json !== undefined ? (
                    <pre className="max-h-56 overflow-auto rounded-ui-sm bg-foreground p-3 font-mono text-2xs text-background">
                      {stringifyJson(selectedRow.payload_json)}
                    </pre>
                  ) : (
                    <div className="text-xs text-muted-foreground">No structured payload available for this row.</div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Citation summary</h3>
                <div className="mt-2 space-y-2 rounded-ui-md border border-border bg-background p-3 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <span>locked citations</span>
                    <span className="font-mono text-foreground">{selectedRow.citation_count}</span>
                  </div>
                  {selectedRow.citation_ids.length ? (
                    <div className="grid gap-1">
                      <div className="text-muted-foreground">citation ids</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedRow.citation_ids.slice(0, 8).map((citationId) => (
                          <span
                            key={citationId}
                            className="rounded-ui-sm bg-muted px-1.5 py-0.5 font-mono text-2xs text-muted-foreground ring-1 ring-inset ring-border/60"
                          >
                            {citationId}
                          </span>
                        ))}
                        {selectedRow.citation_ids.length > 8 ? (
                          <span className="rounded-ui-sm bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground ring-1 ring-inset ring-border/60">
                            +{selectedRow.citation_ids.length - 8} more
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div>No locked citation ids linked to this row.</div>
                  )}
                  {reasonCodeFromProvenance(selectedRow.provenance_json) ? (
                    <div className="flex items-center justify-between gap-2">
                      <span>reason_code</span>
                      <span className="font-mono text-foreground">{reasonCodeFromProvenance(selectedRow.provenance_json)}</span>
                    </div>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Metadata</h3>
                <div className="mt-2 space-y-2 rounded-ui-md border border-border bg-background p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">schema field</span>
                    <span className="font-mono text-foreground">{selectedRow.question_id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">data type</span>
                    <span className="font-mono text-foreground">{inferDataType(selectedRow)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">model/version</span>
                    <span className="font-mono text-foreground">{props.modelVersion ?? "unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">updated</span>
                    <span className="font-mono text-foreground">{formatTimestamp(selectedRow.updated_at)}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={() => void handleMarkReviewed(selectedRow.id)}
                  disabled={selectedRow.status === "reviewed"}
                  loading={pendingRowId === selectedRow.id}
                  loadingLabel="Marking"
                >
                  Mark reviewed
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedRowId(null)}>
                  Back to table
                </Button>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
