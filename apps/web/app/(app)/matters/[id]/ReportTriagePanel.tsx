"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { NormPolygons } from "@orbital-poc/core";
import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { InlineStatus } from "../../../ui/InlineStatus";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";
import { cn } from "../../../ui/cn";
import { CitationViewerClient } from "../viewer/CitationViewerClient";

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

type ViewerEvidenceData = {
  citationId: string;
  documentId: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
  snippetHash: string;
  computedSnippetHash: string;
  errorCode: string | null;
  pdfUrl: string;
  docVersion: string | null;
  verifiedAt: string | null;
  loadedState: string | null;
};

type ViewerPanelState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: string; message: string }
  | { kind: "ready"; data: ViewerEvidenceData };

type TrustMetadata = {
  docVersion: string | null;
  verifiedAt: string | null;
  loadedState: string | null;
};

const TRUST_METADATA_FALLBACK = "Unavailable from payload";

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

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function trustMetadataFromRecord(record: Record<string, unknown> | null): TrustMetadata {
  if (!record) {
    return {
      docVersion: null,
      verifiedAt: null,
      loadedState: null,
    };
  }
  return {
    docVersion: nonEmptyString(record.doc_version),
    verifiedAt: nonEmptyString(record.verified_at),
    loadedState: nonEmptyString(record.loaded_state),
  };
}

function trustMetadataFromProvenance(provenance: unknown): TrustMetadata {
  return isRecord(provenance) ? trustMetadataFromRecord(provenance) : trustMetadataFromRecord(null);
}

function formatTrustTimestamp(raw: string | null): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

function trustValue(value: string | null): string {
  return value ?? TRUST_METADATA_FALLBACK;
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

const SPLIT_VIEW_LOCK_STORAGE_KEY = "orbital.report.split_view_lock";

function parseCitationResponse(json: unknown): {
  citationId: string;
  documentId: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
  snippetHash: string;
  docVersion: string | null;
  verifiedAt: string | null;
  loadedState: string | null;
} | null {
  if (!isRecord(json) || !isRecord(json.citation)) return null;
  const citation = json.citation;
  const citationId = typeof citation.id === "string" ? citation.id : null;
  const documentId = typeof citation.document_id === "string" ? citation.document_id : null;
  const pageNumber = typeof citation.page_number === "number" && Number.isInteger(citation.page_number) ? citation.page_number : null;
  const snippet = typeof citation.snippet === "string" ? citation.snippet : null;
  const snippetHash = typeof citation.snippet_hash === "string" ? citation.snippet_hash : null;
  if (!citationId || !documentId || !pageNumber || !snippet || !snippetHash) return null;

  const polygons = Array.isArray(citation.polygons) ? (citation.polygons as NormPolygons) : ([] as NormPolygons);
  return {
    citationId,
    documentId,
    pageNumber,
    polygons,
    snippet,
    snippetHash,
    docVersion: nonEmptyString(citation.doc_version),
    verifiedAt: nonEmptyString(citation.verified_at),
    loadedState: nonEmptyString(citation.loaded_state),
  };
}

function parseRenderResponse(json: unknown): { pdfUrl: string } | null {
  if (!isRecord(json)) return null;
  const pdfUrl = typeof json.render_url === "string" ? json.render_url : null;
  if (!pdfUrl) return null;
  return { pdfUrl };
}

function toViewerPanelError(err: unknown, fallbackCode: string, fallbackMessage: string): { code: string; message: string } {
  if (isRecord(err)) {
    const code = typeof err.code === "string" && err.code.trim() ? err.code.trim() : fallbackCode;
    const message = typeof err.message === "string" && err.message.trim() ? err.message.trim() : fallbackMessage;
    return { code, message };
  }
  if (err instanceof Error && err.message.trim()) {
    return { code: fallbackCode, message: err.message };
  }
  return { code: fallbackCode, message: fallbackMessage };
}

export function ReportTriagePanel(props: Props) {
  const [rows, setRows] = useState<ReportRowForDrawer[]>(props.rows);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback>({ kind: "idle" });
  const [splitViewLocked, setSplitViewLocked] = useState(false);
  const [splitViewPreferenceLoaded, setSplitViewPreferenceLoaded] = useState(false);
  const [viewerCitationId, setViewerCitationId] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ViewerPanelState>({ kind: "idle" });
  const [isDesktopSplit, setIsDesktopSplit] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => rowMatchesTab({ status: row.status, rowTab: props.rowTab })),
    [rows, props.rowTab],
  );

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRowId) ?? null,
    [rows, selectedRowId],
  );
  const selectedRowTrustMetadata = useMemo(
    () => trustMetadataFromProvenance(selectedRow?.provenance_json),
    [selectedRow],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const update = () => setIsDesktopSplit(mediaQuery.matches);
    update();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SPLIT_VIEW_LOCK_STORAGE_KEY);
    if (stored === "1") setSplitViewLocked(true);
    if (stored === "0") setSplitViewLocked(false);
    setSplitViewPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!splitViewPreferenceLoaded || typeof window === "undefined") return;
    window.localStorage.setItem(SPLIT_VIEW_LOCK_STORAGE_KEY, splitViewLocked ? "1" : "0");
  }, [splitViewLocked, splitViewPreferenceLoaded]);

  useEffect(() => {
    if (!selectedRow) {
      setViewerCitationId(null);
      setViewerState({ kind: "idle" });
      returnFocusRef.current = null;
    }
  }, [selectedRow]);

  useEffect(() => {
    if (!viewerCitationId || splitViewLocked || !selectedRow) return;
    if (!selectedRow.citation_ids.includes(viewerCitationId)) {
      setViewerCitationId(null);
    }
  }, [selectedRow, splitViewLocked, viewerCitationId]);

  const closeEvidenceViewer = useCallback(() => {
    setViewerCitationId(null);
    setViewerState({ kind: "idle" });
    if (typeof window === "undefined") return;
    const target = returnFocusRef.current;
    if (!target || !document.contains(target)) return;
    window.requestAnimationFrame(() => target.focus());
  }, []);

  useEffect(() => {
    if (!viewerCitationId) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeEvidenceViewer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeEvidenceViewer, viewerCitationId]);

  function handleCloseRowDrawer(): void {
    setViewerCitationId(null);
    setViewerState({ kind: "idle" });
    setSelectedRowId(null);
  }

  useEffect(() => {
    const activeCitationId = viewerCitationId;
    if (!activeCitationId || !splitViewLocked) {
      setViewerState({ kind: "idle" });
      return;
    }
    const citationId = activeCitationId;

    const controller = new AbortController();
    let cancelled = false;

    async function loadEvidenceViewerData(): Promise<void> {
      setViewerState({ kind: "loading" });

      const citationRes = await fetch(`/citations/${encodeURIComponent(citationId)}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const citationJson: unknown = await citationRes.json().catch(() => null);
      if (!citationRes.ok) {
        const envelope = parseSafeErrorEnvelope(citationJson);
        throw envelope ?? { code: `HTTP_${citationRes.status}`, message: `Citation load failed (${citationRes.status}).` };
      }

      const citation = parseCitationResponse(citationJson);
      if (!citation) {
        throw { code: "INVALID_CITATION_PAYLOAD", message: "Citation payload was invalid." };
      }

      const renderRes = await fetch(
        `/documents/${encodeURIComponent(citation.documentId)}/render?${new URLSearchParams({
          page: String(citation.pageNumber),
        }).toString()}`,
        {
          cache: "no-store",
          signal: controller.signal,
        },
      );
      const renderJson: unknown = await renderRes.json().catch(() => null);
      if (!renderRes.ok) {
        const envelope = parseSafeErrorEnvelope(renderJson);
        throw envelope ?? { code: `HTTP_${renderRes.status}`, message: `Render URL load failed (${renderRes.status}).` };
      }

      const render = parseRenderResponse(renderJson);
      if (!render) {
        throw { code: "INVALID_RENDER_PAYLOAD", message: "Render URL payload was invalid." };
      }

      if (!cancelled) {
        setViewerState({
          kind: "ready",
          data: {
            citationId: citation.citationId,
            documentId: citation.documentId,
            pageNumber: citation.pageNumber,
            polygons: citation.polygons,
            snippet: citation.snippet,
            snippetHash: citation.snippetHash,
            computedSnippetHash: citation.snippetHash,
            errorCode: null,
            pdfUrl: render.pdfUrl,
            docVersion: citation.docVersion,
            verifiedAt: citation.verifiedAt,
            loadedState: citation.loadedState,
          },
        });
      }
    }

    loadEvidenceViewerData().catch((err) => {
      if (cancelled || controller.signal.aborted) return;
      const parsed = toViewerPanelError(err, "EVIDENCE_VIEWER_LOAD_FAILED", "Evidence viewer failed to load.");
      setViewerState({ kind: "error", code: parsed.code, message: parsed.message });
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [splitViewLocked, viewerCitationId]);

  const splitViewerVisible = Boolean(selectedRow && splitViewLocked && viewerCitationId);
  const showDesktopSplitViewer = splitViewerVisible && isDesktopSplit;
  const showMobileSplitViewer = splitViewerVisible && !isDesktopSplit;

  function renderEvidenceViewerPanel() {
    if (viewerState.kind === "loading") {
      return (
        <div className="space-y-3 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Loading evidence</div>
          <Skeleton className="h-40 w-full" />
          <SkeletonLine width="88%" />
          <SkeletonLine width="74%" />
          <SkeletonLine width="92%" />
        </div>
      );
    }

    if (viewerState.kind === "error") {
      return (
        <div className="p-4">
          <ErrorBanner
            title="Evidence viewer failed"
            code={viewerState.code}
            message={viewerState.message}
            showSupportAction={false}
          />
        </div>
      );
    }

    if (viewerState.kind === "ready") {
      return (
        <div className="overflow-y-auto p-4">
          <CitationViewerClient
            packId={null}
            citationId={viewerState.data.citationId}
            pdfUrl={viewerState.data.pdfUrl}
            documentId={viewerState.data.documentId}
            pageNumber={viewerState.data.pageNumber}
            polygons={viewerState.data.polygons}
            snippet={viewerState.data.snippet}
            snippetHash={viewerState.data.snippetHash}
            computedSnippetHash={viewerState.data.computedSnippetHash}
            errorCode={viewerState.data.errorCode}
            docVersion={viewerState.data.docVersion}
            verifiedAt={viewerState.data.verifiedAt}
            loadedState={viewerState.data.loadedState}
          />
        </div>
      );
    }

    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a citation id to load evidence in split view.
      </div>
    );
  }

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
      <div
        className={cn(
          "mt-4",
          showDesktopSplitViewer ? "pr-0 xl:pr-[70rem]" : selectedRow ? "pr-0 xl:pr-[34rem]" : null,
        )}
      >
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
        <div className="fixed inset-y-0 right-0 z-40 flex max-w-full">
          {showDesktopSplitViewer ? (
            <aside className="hidden xl:flex h-full w-[min(56vw,56rem)] min-w-[30rem] border-l border-border bg-background shadow-ui-lg">
              <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Evidence viewer</div>
                    <div className="truncate font-mono text-sm text-foreground">{viewerCitationId}</div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={closeEvidenceViewer}>
                    Close viewer
                  </Button>
                </div>
                <div className="flex-1 bg-background">{renderEvidenceViewerPanel()}</div>
              </div>
            </aside>
          ) : null}

          <aside className="h-full w-full max-w-[34rem] border-l border-border bg-card shadow-ui-lg">
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
                  <Button type="button" variant="ghost" size="sm" onClick={handleCloseRowDrawer}>
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span>locked citations</span>
                        <span className="font-mono text-foreground">{selectedRow.citation_count}</span>
                      </div>
                      <Button
                        type="button"
                        variant={splitViewLocked ? "success" : "secondary"}
                        size="sm"
                        onClick={() => setSplitViewLocked((prev) => !prev)}
                        aria-pressed={splitViewLocked}
                      >
                        Split-view lock {splitViewLocked ? "on" : "off"}
                      </Button>
                    </div>
                    <div className="text-2xs text-muted-foreground">Lock state is saved in local browser storage.</div>
                    {selectedRow.citation_ids.length ? (
                      <div className="grid gap-1">
                        <div className="text-muted-foreground">citation ids</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedRow.citation_ids.slice(0, 8).map((citationId) => {
                            const isViewerOpen = viewerCitationId === citationId;
                            return (
                              <button
                                key={citationId}
                                ref={isViewerOpen ? returnFocusRef : null}
                                type="button"
                                onClick={(event) => {
                                  returnFocusRef.current = event.currentTarget;
                                  setViewerCitationId(citationId);
                                }}
                                aria-pressed={isViewerOpen}
                                aria-label={`Open evidence for ${citationId}`}
                                className={cn(
                                  "rounded-ui-sm px-1.5 py-0.5 font-mono text-2xs ring-1 ring-inset",
                                  isViewerOpen
                                    ? "bg-primary text-primary-foreground ring-primary/50"
                                    : "bg-muted text-muted-foreground ring-border/60 hover:bg-muted/80",
                                )}
                              >
                                {citationId}
                              </button>
                            );
                          })}
                          {selectedRow.citation_ids.length > 8 ? (
                            <span className="rounded-ui-sm bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground ring-1 ring-inset ring-border/60">
                              +{selectedRow.citation_ids.length - 8} more
                            </span>
                          ) : null}
                        </div>
                        {viewerCitationId ? (
                          <div className="pt-1">
                            <Button type="button" variant="secondary" size="sm" onClick={closeEvidenceViewer}>
                              Close viewer
                            </Button>
                          </div>
                        ) : null}
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

                {showMobileSplitViewer ? (
                  <section className="xl:hidden">
                    <div className="rounded-ui-md border border-border bg-background p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence viewer</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={closeEvidenceViewer}>
                          Close
                        </Button>
                      </div>
                      <div className="mt-3 rounded-ui-sm border border-border bg-background">
                        {renderEvidenceViewerPanel()}
                      </div>
                    </div>
                  </section>
                ) : null}

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
                      <span className="text-muted-foreground">doc_version</span>
                      <span className="font-mono text-foreground">{trustValue(selectedRowTrustMetadata.docVersion)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">verified_at</span>
                      <span className="font-mono text-foreground">
                        {trustValue(formatTrustTimestamp(selectedRowTrustMetadata.verifiedAt))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">loaded_state</span>
                      <span className="font-mono text-foreground">{trustValue(selectedRowTrustMetadata.loadedState)}</span>
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
                  <Button type="button" variant="secondary" size="sm" onClick={handleCloseRowDrawer}>
                    Back to table
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
