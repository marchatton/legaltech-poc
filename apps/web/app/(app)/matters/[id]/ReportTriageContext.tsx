"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { NormPolygons } from "@orbital-poc/core";
import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import type { BadgeVariant } from "../../../ui/Badge";
import { useKeyboardShortcuts } from "../../../ui/useKeyboardShortcuts";

export type ReportTriageTab = "all" | "needs_review" | "reviewed" | "flagged";
const FLAGGED_ROW_STATUSES = new Set(["citation_failed", "missing_input", "flagged"]);

export type ReportRowForDrawer = {
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

export type ActionFeedback =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; error: SafeErrorDisplay };
export type CopyAction = "answer";

export type ViewerEvidenceData = {
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

export type ViewerPanelState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; code: string; message: string }
  | { kind: "ready"; data: ViewerEvidenceData };

export type CitationGate = {
  disabled: boolean;
  reasonCode: string | null;
  helperText: string | null;
  viewerErrorCode: string | null;
};

export type ReasonPanel = { reasonCode: string; helperText: string } | null;

type ReportTriageContextValue = {
  folderId: string;
  rowTab: ReportTriageTab;
  modelVersion: string | null;
  rows: ReportRowForDrawer[];
  visibleRows: ReportRowForDrawer[];
  selectedRow: ReportRowForDrawer | null;
  selectedRowCitationGate: CitationGate | null;
  selectedRowReasonPanel: ReasonPanel;
  pendingRowId: string | null;
  pendingCopyAction: CopyAction | null;
  feedback: ActionFeedback;
  viewerCitationId: string | null;
  viewerState: ViewerPanelState;
  showDesktopSplitViewer: boolean;
  showMobileSplitViewer: boolean;
  answerExpanded: boolean;
  toggleAnswerExpanded: () => void;
  returnFocusRef: React.MutableRefObject<HTMLButtonElement | null>;
  openRowDrawer: (rowId: string, trigger: HTMLButtonElement) => void;
  closeRowDrawer: () => void;
  closeEvidenceViewer: () => void;
  setViewerCitationId: (id: string | null) => void;
  handleMarkReviewed: (rowId: string) => Promise<void>;
  handleCopyExtractedAnswer: (rowId: string) => Promise<void>;
};

const ReportTriageCtx = createContext<ReportTriageContextValue | null>(null);

export function useReportTriage(): ReportTriageContextValue {
  const ctx = useContext(ReportTriageCtx);
  if (!ctx) throw new Error("useReportTriage must be used within ReportTriageProvider");
  return ctx;
}

// ── Helpers ──

import {
  type QuickStartFailureReasonCode,
  type QuickStartNoEvidenceReasonCode,
  isQuickStartFailureReasonCode,
  isQuickStartNoEvidenceReasonCode,
} from "../../../../lib/quickStartReasonCodes";
import { formatAnswerForDisplay } from "./matterDetailHelpers";

const REASON_CODE_PATTERN = /^[A-Z0-9_]{3,64}$/;
const SOURCE_CHIP_DISABLED_REASON_CODES = new Set([
  "UNRESOLVED_ANCHOR",
  "ANCHOR_NOT_FOUND",
  "ANCHOR_UNRESOLVED",
  "MISSING_ANCHOR",
  "NO_CITATIONS",
]);
const MISSING_INPUT_REASON_COPY: Record<QuickStartNoEvidenceReasonCode, string> = {
  NO_EVIDENCE_NO_READY_DOCUMENTS: "No ready documents are available yet. Upload/parse source files, then re-run this question.",
  NO_EVIDENCE_RETRIEVAL_EMPTY: "No relevant evidence chunks were retrieved for this question from the indexed documents.",
  NO_EVIDENCE_ANCHOR_UNRESOLVED: "Evidence was found but no lockable page anchor was available, so no citation could be locked.",
  NO_EVIDENCE_DRAFT_UNSUPPORTED: "Evidence was retrieved but did not support a grounded answer for this question.",
};
const CITATION_FAILED_REASON_COPY: Record<QuickStartFailureReasonCode, string> = {
  VALIDATION_ERROR: "The row payload failed validation. Re-run this question; if it repeats, treat it as a bug.",
  RETRIEVAL_FAILED: "Retrieval failed while collecting evidence. Re-run this question after indexing is healthy.",
  DRAFT_FAILED: "Drafting failed while producing an evidence-bound answer. Re-run this question.",
  ROW_WRITE_FAILED: "Row persistence failed. Re-run the workflow and check worker/database health.",
  PROGRESS_UPDATE_FAILED: "Row progress update failed. Re-run the workflow and confirm run progress advances.",
};

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

export function statusPresentation(status: string): { label: string; variant: BadgeVariant } {
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

export function citationChipGateForRow(row: ReportRowForDrawer): CitationGate {
  if (row.status !== "citation_failed") {
    return { disabled: false, reasonCode: null, helperText: null, viewerErrorCode: null };
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

export function reasonCodePanelForRow(args: {
  row: ReportRowForDrawer;
  citationGateReasonCode: string | null;
}): ReasonPanel {
  const fallback = args.row.status === "citation_failed" ? "VALIDATION_ERROR" : null;
  const rawReasonCode = args.citationGateReasonCode ?? reasonCodeFromProvenance(args.row.provenance_json);
  const reasonCode = deterministicReasonCode(rawReasonCode, fallback);
  if (!reasonCode) return null;

  if (args.row.status === "missing_input") {
    if (isQuickStartNoEvidenceReasonCode(reasonCode)) {
      return { reasonCode, helperText: MISSING_INPUT_REASON_COPY[reasonCode] };
    }
    return { reasonCode, helperText: "No grounded evidence was available for this answer." };
  }

  if (args.row.status === "citation_failed") {
    if (isQuickStartFailureReasonCode(reasonCode)) {
      return { reasonCode, helperText: CITATION_FAILED_REASON_COPY[reasonCode] };
    }
    return { reasonCode, helperText: "A fail-closed error occurred while writing this row." };
  }

  return null;
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function rowMatchesTab(args: { status: string; rowTab: ReportTriageTab }): boolean {
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

// ── Drawer state reducer ──

type DrawerState = {
  selectedRowId: string | null;
  viewerCitationId: string | null;
  viewerState: ViewerPanelState;
  answerExpanded: boolean;
};

type DrawerAction =
  | { type: "OPEN_DRAWER"; rowId: string }
  | { type: "CLOSE_DRAWER" }
  | { type: "SET_VIEWER_CITATION"; citationId: string | null }
  | { type: "SET_VIEWER_STATE"; viewerState: ViewerPanelState }
  | { type: "CLOSE_VIEWER" }
  | { type: "TOGGLE_ANSWER_EXPANDED" }
  | { type: "RESET_FOR_ROW_CHANGE" };

const drawerInitialState: DrawerState = {
  selectedRowId: null,
  viewerCitationId: null,
  viewerState: { kind: "idle" },
  answerExpanded: false,
};

function drawerReducer(state: DrawerState, action: DrawerAction): DrawerState {
  switch (action.type) {
    case "OPEN_DRAWER":
      return { ...state, selectedRowId: action.rowId };
    case "CLOSE_DRAWER":
      return { ...drawerInitialState };
    case "SET_VIEWER_CITATION":
      return { ...state, viewerCitationId: action.citationId };
    case "SET_VIEWER_STATE":
      return { ...state, viewerState: action.viewerState };
    case "CLOSE_VIEWER":
      return { ...state, viewerCitationId: null, viewerState: { kind: "idle" } };
    case "TOGGLE_ANSWER_EXPANDED":
      return { ...state, answerExpanded: !state.answerExpanded };
    case "RESET_FOR_ROW_CHANGE":
      return { ...state, viewerCitationId: null, viewerState: { kind: "idle" }, answerExpanded: false };
  }
}

// ── Provider ──

type ProviderProps = {
  folderId: string;
  rowTab: ReportTriageTab;
  rows: ReportRowForDrawer[];
  modelVersion: string | null;
  children: React.ReactNode;
};

export function ReportTriageProvider(props: ProviderProps) {
  const router = useRouter();
  const [rows, setRows] = useState<ReportRowForDrawer[]>(props.rows);
  const [drawer, dispatch] = useReducer(drawerReducer, drawerInitialState);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const [pendingCopyAction, setPendingCopyAction] = useState<CopyAction | null>(null);
  const [feedback, setFeedback] = useState<ActionFeedback>({ kind: "idle" });
  const [isDesktopSplit, setIsDesktopSplit] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const rowReturnFocusRef = useRef<HTMLButtonElement | null>(null);

  const { selectedRowId, viewerCitationId, viewerState, answerExpanded } = drawer;

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
  const selectedRowReasonPanel = useMemo(
    () =>
      selectedRow
        ? reasonCodePanelForRow({
            row: selectedRow,
            citationGateReasonCode: selectedRowCitationGate?.reasonCode ?? null,
          })
        : null,
    [selectedRow, selectedRowCitationGate],
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
    if (!selectedRow) {
      returnFocusRef.current = null;
    }
    dispatch({ type: "RESET_FOR_ROW_CHANGE" });
  }, [selectedRow]);

  useEffect(() => {
    if (!viewerCitationId || !selectedRow) return;
    if (!selectedRow.citation_ids.includes(viewerCitationId)) {
      dispatch({ type: "SET_VIEWER_CITATION", citationId: null });
    }
  }, [selectedRow, viewerCitationId]);

  const closeEvidenceViewer = useCallback(() => {
    dispatch({ type: "CLOSE_VIEWER" });
    if (typeof window === "undefined") return;
    const target = returnFocusRef.current;
    if (!target || !document.contains(target)) return;
    window.requestAnimationFrame(() => target.focus());
  }, []);

  const closeRowDrawer = useCallback(() => {
    dispatch({ type: "CLOSE_DRAWER" });
    if (typeof window === "undefined") return;
    const target = rowReturnFocusRef.current;
    rowReturnFocusRef.current = null;
    if (!target || !document.contains(target)) return;
    window.requestAnimationFrame(() => target.focus());
  }, []);

  const openRowDrawer = useCallback((rowId: string, trigger: HTMLButtonElement) => {
    rowReturnFocusRef.current = trigger;
    dispatch({ type: "OPEN_DRAWER", rowId });
  }, []);

  const setViewerCitationId = useCallback((id: string | null) => {
    dispatch({ type: "SET_VIEWER_CITATION", citationId: id });
  }, []);

  const keyboardShortcuts = useMemo(() => ({
    Escape: (event: KeyboardEvent) => {
      if (viewerCitationId) {
        event.preventDefault();
        closeEvidenceViewer();
      } else if (selectedRow) {
        event.preventDefault();
        closeRowDrawer();
      }
    },
  }), [viewerCitationId, selectedRow, closeEvidenceViewer, closeRowDrawer]);

  useKeyboardShortcuts(keyboardShortcuts, Boolean(selectedRow));

  useEffect(() => {
    const activeCitationId = viewerCitationId;
    const activeRow = selectedRow;
    if (!activeCitationId || !activeRow) {
      dispatch({ type: "SET_VIEWER_STATE", viewerState: { kind: "idle" } });
      return;
    }
    const citationId = activeCitationId;
    const chipGate = citationChipGateForRow(activeRow);

    const controller = new AbortController();
    let cancelled = false;

    async function loadEvidenceViewerData(): Promise<void> {
      dispatch({ type: "SET_VIEWER_STATE", viewerState: { kind: "loading" } });

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
        dispatch({ type: "SET_VIEWER_STATE", viewerState: {
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
        }});
      }
    }

    loadEvidenceViewerData().catch((err) => {
      if (cancelled || controller.signal.aborted) return;
      const parsed = toViewerPanelError(err, "EVIDENCE_VIEWER_LOAD_FAILED", "Evidence viewer failed to load.");
      dispatch({ type: "SET_VIEWER_STATE", viewerState: { kind: "error", code: parsed.code, message: parsed.message } });
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedRow, viewerCitationId]);

  const splitViewerVisible = Boolean(selectedRow && viewerCitationId);
  const showDesktopSplitViewer = splitViewerVisible && isDesktopSplit;
  const showMobileSplitViewer = splitViewerVisible && !isDesktopSplit;

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
      router.refresh();
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

  const toggleAnswerExpanded = useCallback(() => {
    dispatch({ type: "TOGGLE_ANSWER_EXPANDED" });
  }, []);

  const handleCopyExtractedAnswer = useCallback(
    async (rowId: string): Promise<void> => {
      const existing = rows.find((row) => row.id === rowId);
      if (!existing) return;

      setPendingCopyAction("answer");
      setFeedback({ kind: "idle" });
      try {
        await writeClipboardText(formatAnswerForDisplay(existing.answer));
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

  const value = useMemo<ReportTriageContextValue>(
    () => ({
      folderId: props.folderId,
      rowTab: props.rowTab,
      modelVersion: props.modelVersion,
      rows,
      visibleRows,
      selectedRow,
      selectedRowCitationGate,
      selectedRowReasonPanel,
      pendingRowId,
      pendingCopyAction,
      feedback,
      viewerCitationId,
      viewerState,
      showDesktopSplitViewer,
      showMobileSplitViewer,
      answerExpanded,
      toggleAnswerExpanded,
      returnFocusRef,
      openRowDrawer,
      closeRowDrawer,
      closeEvidenceViewer,
      setViewerCitationId,
      handleMarkReviewed,
      handleCopyExtractedAnswer,
    }),
    [
      props.folderId,
      props.rowTab,
      props.modelVersion,
      rows,
      visibleRows,
      selectedRow,
      selectedRowCitationGate,
      selectedRowReasonPanel,
      pendingRowId,
      pendingCopyAction,
      feedback,
      viewerCitationId,
      viewerState,
      showDesktopSplitViewer,
      showMobileSplitViewer,
      answerExpanded,
      toggleAnswerExpanded,
      openRowDrawer,
      closeRowDrawer,
      closeEvidenceViewer,
      setViewerCitationId,
      handleMarkReviewed,
      handleCopyExtractedAnswer,
    ],
  );

  return <ReportTriageCtx.Provider value={value}>{props.children}</ReportTriageCtx.Provider>;
}
