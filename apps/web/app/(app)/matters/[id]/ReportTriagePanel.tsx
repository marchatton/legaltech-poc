"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { NormPolygons } from "@orbital-poc/core";
import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { InlineStatus } from "../../../ui/InlineStatus";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";
import { TableFrame, Table, TH } from "../../../ui/Table";
import { cn } from "../../../ui/cn";
import { CitationViewerClient } from "../viewer/CitationViewerClient";

type ReportTriageTab = "all" | "needs_review" | "reviewed" | "flagged";
const FLAGGED_ROW_STATUSES = new Set(["citation_failed", "missing_input", "flagged"]);

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
type CopyAction = "answer";

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

const REASON_CODE_PATTERN = /^[A-Z0-9_]{3,64}$/;
const SOURCE_CHIP_DISABLED_REASON_CODES = new Set([
  "UNRESOLVED_ANCHOR",
  "ANCHOR_NOT_FOUND",
  "ANCHOR_UNRESOLVED",
  "MISSING_ANCHOR",
  "NO_CITATIONS",
]);

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

function deterministicReasonCode(value: string | null, fallback: string | null): string | null {
  if (!value) return fallback;
  const normalized = value.trim().toUpperCase();
  if (REASON_CODE_PATTERN.test(normalized)) return normalized;
  return fallback;
}

function citationChipGateForRow(row: ReportRowForDrawer): {
  disabled: boolean;
  reasonCode: string | null;
  helperText: string | null;
  viewerErrorCode: string | null;
} {
  if (row.status !== "citation_failed") {
    return {
      disabled: false,
      reasonCode: null,
      helperText: null,
      viewerErrorCode: null,
    };
  }

  const reasonCode = deterministicReasonCode(reasonCodeFromProvenance(row.provenance_json), "VALIDATION_ERROR");
  if (reasonCode && SOURCE_CHIP_DISABLED_REASON_CODES.has(reasonCode)) {
    return {
      disabled: true,
      reasonCode,
      helperText: "Source chip disabled: unresolved anchor target. Re-run verification to relock evidence.",
      viewerErrorCode: null,
    };
  }

  return {
    disabled: false,
    reasonCode,
    helperText: "Source chip opens in fail-closed mode for this citation_failed row.",
    viewerErrorCode: reasonCode,
  };
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatTimestamp(raw: string): string {
  const parsed = new Date(raw);
  if (!Number.isFinite(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

function rowMatchesTab(args: { status: string; rowTab: ReportTriageTab }): boolean {
  if (args.rowTab === "all") return true;
  if (args.rowTab === "flagged") return FLAGGED_ROW_STATUSES.has(args.status);
  return args.status === args.rowTab;
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

async function writeClipboardText(value: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
    throw {
      code: "CLIPBOARD_UNAVAILABLE",
      message: "Clipboard is unavailable in this browser.",
      retryable: false,
    } satisfies SafeErrorDisplay;
  }
  await navigator.clipboard.writeText(value);
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

function parseRenderResponse(json: unknown): { pdfUrl: string; documentId: string; pageNumber: number } | null {
  if (!isRecord(json)) return null;
  const pdfUrl = typeof json.render_url === "string" ? json.render_url : null;
  const documentId = typeof json.document_id === "string" ? json.document_id : null;
  const pageNumber = typeof json.page === "number" && Number.isInteger(json.page) ? json.page : null;
  if (!pdfUrl || !documentId || !pageNumber) return null;
  return { pdfUrl, documentId, pageNumber };
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

function normalizeSnippetText(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

async function computeCitationSnippetHash(snippet: string): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null;
  const bytes = new TextEncoder().encode(normalizeSnippetText(snippet));
  const digest = await subtle.digest("SHA-256", bytes);
  const hashHex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${hashHex}`;
}

function viewerErrorCodeFromEvidence(args: {
  chipGateErrorCode: string | null;
  citation: { documentId: string; pageNumber: number; snippetHash: string };
  render: { documentId: string; pageNumber: number };
  computedSnippetHash: string | null;
}): string | null {
  if (args.chipGateErrorCode) return args.chipGateErrorCode;
  if (args.render.documentId !== args.citation.documentId) return "DOC_MISMATCH";
  if (args.render.pageNumber !== args.citation.pageNumber) return "WRONG_PAGE";
  if (!args.computedSnippetHash) return "SNIPPET_HASH_UNVERIFIED";
  if (args.computedSnippetHash !== args.citation.snippetHash) return "SNIPPET_HASH_MISMATCH";
  return null;
}

export function ReportTriagePanel(props: Props) {
  const [rows, setRows] = useState<ReportRowForDrawer[]>(props.rows);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [pendingCopyAction, setPendingCopyAction] = useState<CopyAction | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback>({ kind: "idle" });
  const [splitViewLocked, setSplitViewLocked] = useState(false);
  const [splitViewPreferenceLoaded, setSplitViewPreferenceLoaded] = useState(false);
  const [viewerCitationId, setViewerCitationId] = useState<string | null>(null);
  const [viewerState, setViewerState] = useState<ViewerPanelState>({ kind: "idle" });
  const [isDesktopSplit, setIsDesktopSplit] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const rowReturnFocusRef = useRef<HTMLButtonElement | null>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => rowMatchesTab({ status: row.status, rowTab: props.rowTab })),
    [rows, props.rowTab],
  );

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedRowId) ?? null,
    [rows, selectedRowId],
  );
  const selectedRowCitationGate = useMemo(
    () => (selectedRow ? citationChipGateForRow(selectedRow) : null),
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

  const closeRowDrawer = useCallback(() => {
    setViewerCitationId(null);
    setViewerState({ kind: "idle" });
    setSelectedRowId(null);
    if (typeof window === "undefined") return;
    const target = rowReturnFocusRef.current;
    rowReturnFocusRef.current = null;
    if (!target || !document.contains(target)) return;
    window.requestAnimationFrame(() => target.focus());
  }, []);

  const openRowDrawer = useCallback((rowId: string, trigger: HTMLButtonElement) => {
    rowReturnFocusRef.current = trigger;
    setSelectedRowId(rowId);
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

  useEffect(() => {
    if (!selectedRow) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape" || viewerCitationId) return;
      event.preventDefault();
      closeRowDrawer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeRowDrawer, selectedRow, viewerCitationId]);

  useEffect(() => {
    const activeCitationId = viewerCitationId;
    const activeRow = selectedRow;
    if (!activeCitationId || !splitViewLocked || !activeRow) {
      setViewerState({ kind: "idle" });
      return;
    }
    const citationId = activeCitationId;
    const chipGate = citationChipGateForRow(activeRow);

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

      const computedSnippetHash = await computeCitationSnippetHash(citation.snippet);
      const viewerErrorCode = viewerErrorCodeFromEvidence({
        chipGateErrorCode: chipGate.viewerErrorCode,
        citation,
        render,
        computedSnippetHash,
      });

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
            computedSnippetHash: computedSnippetHash ?? "sha256:unavailable",
            errorCode: viewerErrorCode,
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
  }, [selectedRow, splitViewLocked, viewerCitationId]);

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

  const handleCopyExtractedAnswer = useCallback(
    async (rowId: string): Promise<void> => {
      const existing = rows.find((row) => row.id === rowId);
      if (!existing) return;

      setPendingCopyAction("answer");
      setFeedback({ kind: "idle" });
      try {
        await writeClipboardText(existing.answer);
        setFeedback({
          kind: "success",
          message: `Copied extracted answer for ${existing.question_id}.`,
        });
      } catch (err) {
        setFeedback({
          kind: "error",
          error: toSafeError(err, "Copy extracted answer failed."),
        });
      } finally {
        setPendingCopyAction(null);
      }
    },
    [rows],
  );

  return (
    <>
      <div
        className={cn(
          "mt-4",
          showDesktopSplitViewer ? "pr-0 xl:pr-[70rem]" : selectedRow ? "pr-0 xl:pr-[42rem]" : null,
        )}
      >
        <TableFrame className="max-h-[34rem] shadow-ui-sm">
          <Table className="min-w-[640px] text-xs">
            <thead>
              <tr>
                <TH className="sticky top-0 z-10 w-16">ID</TH>
                <TH className="sticky top-0 z-10 w-1/3">Question</TH>
                <TH className="sticky top-0 z-10">Answer Preview</TH>
                <TH className="sticky top-0 z-10 w-32">Status</TH>
                <TH className="sticky top-0 z-10 w-10" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                    No rows match <span className="font-mono">{props.rowTab}</span>.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const status = statusPresentation(row.status);
                  const selected = selectedRow?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest("button")) return;
                        const btn = event.currentTarget.querySelector<HTMLButtonElement>("[data-row-trigger]");
                        if (btn) btn.click();
                      }}
                      className={cn(
                        "group cursor-pointer border-b border-border/60 align-top transition-colors hover:bg-muted/30",
                        selected ? "bg-muted/30" : null,
                      )}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-mono text-2xs text-muted-foreground">{row.question_id}</span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-sm font-medium leading-relaxed text-foreground line-clamp-2">{row.question}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {row.answer.trim().length > 0 ? row.answer : "\u2014"}
                        </p>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          data-row-trigger
                          aria-label={`Open row drawer for ${row.question_id}`}
                          onClick={(event) => openRowDrawer(row.id, event.currentTarget)}
                          className="inline-flex items-center justify-center rounded-ui-md p-1.5 text-muted-foreground opacity-0 transition-all duration-micro ease-brand-standard hover:bg-muted hover:text-foreground group-hover:opacity-100"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableFrame>
      </div>

      {selectedRow ? (
        <>
          <div
            className="fixed inset-0 z-30 bg-background/45 backdrop-blur-[1px]"
            aria-hidden="true"
            onClick={closeRowDrawer}
          />
          <div className="fixed right-0 bottom-0 top-[var(--app-topbar-height,3rem)] z-40 flex max-w-full">
          {showDesktopSplitViewer ? (
            <aside
              className="hidden xl:flex h-full w-[min(56vw,56rem)] min-w-[30rem] border-l border-border bg-background shadow-ui-lg"
              role="region"
              aria-label="Evidence viewer panel"
            >
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

          <aside
            className="h-full w-full max-w-[42rem] border-l border-border bg-card shadow-ui-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`row-drawer-title-${selectedRow.id}`}
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-border bg-muted/30 px-6 py-4">
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
                    <h2 id={`row-drawer-title-${selectedRow.id}`} className="font-serif text-lg font-medium leading-tight text-foreground line-clamp-2">
                      {selectedRow.question}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeRowDrawer}
                    aria-keyshortcuts="Escape"
                    className="shrink-0 rounded-ui-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                  </button>
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
                <div aria-live="polite">
                  <InlineStatus kind={feedback.kind === "success" ? "success" : "idle"}>
                    {feedback.kind === "success" ? feedback.message : null}
                  </InlineStatus>
                </div>

                <section>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extracted answer</h3>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleCopyExtractedAnswer(selectedRow.id)}
                      loading={pendingCopyAction === "answer"}
                      loadingLabel="Copying"
                    >
                      Copy answer
                    </Button>
                  </div>
                  <div className="mt-2 rounded-ui-md border border-border bg-background p-3 text-sm leading-relaxed text-foreground">
                    {selectedRow.answer.trim().length > 0 ? selectedRow.answer : "Not provided."}
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
                            const isCitationChipDisabled = selectedRowCitationGate?.disabled ?? false;
                            const disabledTitle = isCitationChipDisabled ? selectedRowCitationGate?.helperText ?? undefined : undefined;
                            return (
                              <button
                                key={citationId}
                                ref={isViewerOpen ? returnFocusRef : null}
                                type="button"
                                disabled={isCitationChipDisabled}
                                title={disabledTitle}
                                onClick={(event) => {
                                  if (isCitationChipDisabled) return;
                                  returnFocusRef.current = event.currentTarget;
                                  setViewerCitationId(citationId);
                                }}
                                aria-pressed={isViewerOpen}
                                aria-disabled={isCitationChipDisabled ? "true" : undefined}
                                aria-label={isCitationChipDisabled ? `Evidence unavailable for ${citationId}` : `Open evidence for ${citationId}`}
                                className={cn(
                                  "rounded-ui-sm px-1.5 py-0.5 font-mono text-2xs ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                  isCitationChipDisabled ? "cursor-not-allowed bg-muted/60 text-muted-foreground ring-border/50 opacity-70" : null,
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
                        {selectedRowCitationGate?.helperText ? (
                          <div className="rounded-ui-sm border border-border/70 bg-muted/40 px-2 py-1 text-2xs text-muted-foreground">
                            {selectedRowCitationGate.helperText}
                          </div>
                        ) : null}
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
                    {selectedRowCitationGate?.reasonCode ? (
                      <div className="flex items-center justify-between gap-2">
                        <span>reason_code</span>
                        <span className="font-mono text-foreground">{selectedRowCitationGate.reasonCode}</span>
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
                  <Button type="button" variant="secondary" size="sm" onClick={closeRowDrawer}>
                    Back to table
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
        </>
      ) : null}
    </>
  );
}
