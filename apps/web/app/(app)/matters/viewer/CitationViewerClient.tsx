"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  bboxFromCssPolygons,
  mapNormPolygonsToViewportCss,
  type CssPolygons,
  type NormPolygons,
  type PdfJsViewportLike,
  type ViewBox,
} from "@orbital-poc/core";
import {
  deriveTextOverlayFromSnippet,
  isFullPageFallbackPolygons,
  overlayHighlightPolygonProps,
} from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Input, Select } from "../../../ui/Input";
import { SectionLabel } from "../../../ui/Page";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";
import { cn } from "../../../ui/cn";

type Props = {
  packId: string | null;
  citationId: string;
  pdfUrl: string;
  documentId: string;
  documentLabel: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
  answerText?: string | null;
  snippetHash: string;
  computedSnippetHash: string;
  errorCode: string | null;
  docVersion: string | null;
  verifiedAt: string | null;
  loadedState: string | null;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel?: () => void;
};

type PdfPageLike = {
  rotate?: number;
  view?: unknown;
  getViewport: (args: { scale: number; rotation: number }) => PdfJsViewportLike;
  getTextContent?: () => Promise<{ items?: unknown[] }>;
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

const TRUST_METADATA_FALLBACK = "Unavailable from payload";
const REASON_CODE_PATTERN = /^[A-Z0-9_]{3,64}$/;
const ZOOM_LEVELS = [75, 100, 125, 150] as const;

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

function nextZoomLevel(current: number, direction: "in" | "out"): number {
  const currentIdx = ZOOM_LEVELS.indexOf(current as (typeof ZOOM_LEVELS)[number]);
  const fallbackIdx = ZOOM_LEVELS.reduce((closestIdx, value, idx) => {
    const closestDistance = Math.abs(ZOOM_LEVELS[closestIdx] - current);
    const nextDistance = Math.abs(value - current);
    return nextDistance < closestDistance ? idx : closestIdx;
  }, 0);
  const activeIdx = currentIdx === -1 ? fallbackIdx : currentIdx;
  if (direction === "in") return ZOOM_LEVELS[Math.min(activeIdx + 1, ZOOM_LEVELS.length - 1)];
  return ZOOM_LEVELS[Math.max(activeIdx - 1, 0)];
}

function deterministicReasonCode(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (REASON_CODE_PATTERN.test(trimmed)) return trimmed;
  return fallback;
}

function recoveryChecklistForReason(reasonCode: string): string[] {
  if (reasonCode === "SNIPPET_HASH_MISMATCH") {
    return [
      "Confirm the snippet text still matches the cited source passage.",
      "Return to the report row and leave the review step open until citation text is corrected.",
      "Use Flag citation wrong below to acknowledge incorrect evidence.",
    ];
  }

  if (reasonCode === "DOC_MISMATCH" || reasonCode === "WRONG_PAGE") {
    return [
      "Confirm the document and page are targeting the expected source.",
      "Re-open evidence from the report row citation chip to reload the anchor target.",
      "Keep the row in flagged status until the citation target resolves.",
    ];
  }

  return [
    "Review citation_failed rows in report triage before continuing.",
    "Reset viewer zoom to 100% and retry loading evidence.",
    "If this citation is incorrect, use Flag citation wrong for acknowledgement.",
  ];
}

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

function nonEmptyString(value: string | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function formatTrustTimestamp(raw: string | null): string | null {
  const normalized = nonEmptyString(raw);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (!Number.isFinite(parsed.getTime())) return normalized;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

function trustValue(value: string | null): string {
  return value ?? TRUST_METADATA_FALLBACK;
}

export function CitationViewerClient(props: Props) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const [userRotation, setUserRotation] = useState(0);
  const [activePage, setActivePage] = useState(props.pageNumber);
  const [pageInputValue, setPageInputValue] = useState(String(props.pageNumber));
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [flagCitationState, setFlagCitationState] = useState<"idle" | "confirm" | "acknowledged">("idle");

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
  const verificationZoom = zoomPercent === 100;
  const showVerificationReset = zoomPercent !== 100;
  const canGoPrevPage = activePage > 1;
  const canGoNextPage = pdfPageCount ? activePage < pdfPageCount : true;
  const snippetHashMatches = props.snippetHash === props.computedSnippetHash;
  const trustDocVersion = trustValue(nonEmptyString(props.docVersion));
  const trustVerifiedAt = trustValue(formatTrustTimestamp(props.verifiedAt));
  const trustLoadedState = trustValue(nonEmptyString(props.loadedState));
  const failureReasonCode = hud.errorCode;
  const hasCitationFailure = failureReasonCode !== null;
  const failureChecklist = useMemo(
    () => (failureReasonCode ? recoveryChecklistForReason(failureReasonCode) : []),
    [failureReasonCode],
  );

  useEffect(() => {
    setActivePage(props.pageNumber);
    setPageInputValue(String(props.pageNumber));
  }, [props.pageNumber]);

  useEffect(() => {
    setFlagCitationState("idle");
  }, [props.citationId]);

  useEffect(() => {
    if (!pdfPageCount) return;
    setActivePage((prev) => Math.min(Math.max(prev, 1), pdfPageCount));
  }, [pdfPageCount]);

  useEffect(() => {
    setPageInputValue(String(activePage));
  }, [activePage]);

  function goToPage(nextPage: number): void {
    const maxPage = pdfPageCount ?? Number.POSITIVE_INFINITY;
    const normalized = Math.min(Math.max(nextPage, 1), maxPage);
    setActivePage(normalized);
    setPageInputValue(String(normalized));
  }

  function commitPageInput(): void {
    const parsed = Number.parseInt(pageInputValue, 10);
    if (!Number.isFinite(parsed)) {
      setPageInputValue(String(activePage));
      return;
    }
    goToPage(parsed);
  }

  const stepZoom = useCallback((direction: "in" | "out"): void => {
    setZoomPercent((prev) => nextZoomLevel(prev, direction));
  }, []);

  const rotateClockwise = useCallback((): void => {
    setUserRotation((prev) => {
      const next = (prev + 90) % 360;
      return next >= 0 ? next : next + 360;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented || isEditableElement(event.target)) return;

      if (event.key === "ArrowLeft" && canGoPrevPage && !isPageLoading) {
        event.preventDefault();
        const next = Math.max(1, activePage - 1);
        setActivePage(next);
        setPageInputValue(String(next));
        return;
      }

      if (event.key === "ArrowRight" && canGoNextPage && !isPageLoading) {
        event.preventDefault();
        const maxPage = pdfPageCount ?? Number.POSITIVE_INFINITY;
        const next = Math.min(maxPage, activePage + 1);
        setActivePage(next);
        setPageInputValue(String(next));
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        setZoomPercent(100);
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        stepZoom("in");
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        stepZoom("out");
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        rotateClockwise();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePage, canGoNextPage, canGoPrevPage, isPageLoading, pdfPageCount, rotateClockwise, stepZoom]);

  // Load pdf.js + PDF
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsPageLoading(true);
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
      setHud((h) => ({ ...h, errorCode: deterministicReasonCode(message, "PDF_LOAD_FAILED") }));
      setIsPageLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [props.errorCode, props.pdfUrl]);

  // Render page + overlay
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsPageLoading(true);
      const canvas = document.getElementById("citation-canvas") as HTMLCanvasElement | null;
      if (!canvas || !pdf || !pdfjs) return;

      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdf.getPage(activePage);
      const pageRotate = Number(page.rotate ?? 0);
      const totalRotation = (pageRotate + userRotation) % 360;

      const scale = zoomPercent / 100;
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
        setIsPageLoading(false);
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
        setIsPageLoading(false);
        return;
      }

      if (!verificationZoom) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: null,
        }));
        setIsPageLoading(false);
        return;
      }

      let resolvedOverlay = mapNormPolygonsToViewportCss({ polygons: props.polygons, viewBox, viewport });
      let resolvedErrorCode: string | null = null;

      if (isFullPageFallbackPolygons(props.polygons)) {
        const textContent =
          typeof page.getTextContent === "function"
            ? await page.getTextContent().catch(() => null)
            : null;
        const fallbackOverlay =
          textContent && Array.isArray(textContent.items)
            ? deriveTextOverlayFromSnippet({
                items: textContent.items,
                snippet: props.snippet,
                focusText: props.answerText ?? null,
                viewport,
              })
            : null;

        if (fallbackOverlay && fallbackOverlay.length > 0) {
          resolvedOverlay = fallbackOverlay;
        } else {
          resolvedOverlay = [];
          resolvedErrorCode = "NO_EVIDENCE_ANCHOR_UNRESOLVED";
        }
      }

      const bbox = bboxFromCssPolygons(resolvedOverlay);
      const overlayBbox =
        bbox && Number.isFinite(bbox.minX)
          ? { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY }
          : null;

      if (!cancelled) {
        setOverlay(resolvedOverlay);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox,
          errorCode: resolvedErrorCode,
        }));
        setIsPageLoading(false);
      }
    }

    run().catch((err) => {
      setOverlay([]);
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: deterministicReasonCode(message, "PDF_RENDER_FAILED"), overlayBbox: null }));
      setIsPageLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    activePage,
    pdf,
    pdfjs,
    polygonError,
    props.errorCode,
    props.polygons,
    props.snippet,
    verificationZoom,
    userRotation,
    zoomPercent,
  ]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4">
      {/* Viewer shell: toolbar + canvas + footer */}
      <div className="rounded-ui-lg border border-border bg-card shadow-ui-sm overflow-hidden flex flex-col" aria-busy={isPageLoading}>
        {/* Toolbar */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-foreground truncate max-w-[200px]">
              {props.documentLabel}
            </span>

            <div className="h-5 w-px bg-border" />

            {/* Page controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(activePage - 1)}
                disabled={!canGoPrevPage || isPageLoading}
                className="p-1 rounded-ui-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <Input
                uiSize="sm"
                inputMode="numeric"
                className="w-12 text-center font-mono tabular-nums"
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.currentTarget.value)}
                onBlur={commitPageInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPageInput();
                  }
                }}
                aria-label="Page number"
              />
              <span className="text-sm text-muted-foreground tabular-nums">
                / {pdfPageCount ?? "—"}
              </span>
              <button
                type="button"
                onClick={() => goToPage(activePage + 1)}
                disabled={!canGoNextPage || isPageLoading}
                className="p-1 rounded-ui-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                aria-label="Next page"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom controls */}
            <div className="flex items-center bg-muted rounded-ui-md p-0.5">
              <button
                type="button"
                onClick={() => stepZoom("out")}
                disabled={zoomPercent <= ZOOM_LEVELS[0] || isPageLoading}
                className="p-1.5 hover:bg-card rounded-ui-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Zoom out"
                aria-keyshortcuts="-"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
              <Select
                value={zoomPercent}
                onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
                className="w-16 text-center text-xs font-mono border-0 bg-transparent h-7"
              >
                {ZOOM_LEVELS.map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => stepZoom("in")}
                disabled={zoomPercent >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1] || isPageLoading}
                className="p-1.5 hover:bg-card rounded-ui-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Zoom in"
                aria-keyshortcuts="+"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-1">
              <Select
                value={userRotation}
                onChange={(e) => setUserRotation(Number(e.currentTarget.value))}
                className="w-16 text-xs font-mono h-7"
              >
                {[0, 90, 180, 270].map((r) => (
                  <option key={r} value={r}>
                    {r}°
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={rotateClockwise}
                disabled={isPageLoading}
                className="p-1.5 rounded-ui-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                aria-label="Rotate clockwise"
                aria-keyshortcuts="R"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M21.34 15.57a10 10 0 1 1-.57-8.38" /></svg>
              </button>
            </div>

            <div className="h-5 w-px bg-border" />

            {/* Verification state */}
            <div role="status" aria-live="polite">
              {showVerificationReset ? (
                <button
                  type="button"
                  onClick={() => setZoomPercent(100)}
                  className="flex items-center text-xs text-orange-600 font-medium hover:bg-orange-500/10 px-2.5 py-1.5 rounded-ui-sm transition-colors"
                  aria-keyshortcuts="0"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M21 21v-5h-5" /></svg>
                  Reset to verify
                </button>
              ) : (
                <span className="flex items-center text-xs text-success font-medium px-2.5 py-1.5">
                  <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Document canvas */}
        <div className="flex-1 overflow-auto p-6 flex justify-center bg-muted/30">
          <div className="relative inline-block">
            <div className="relative bg-background rounded-ui-sm shadow-ui-md">
              <canvas id="citation-canvas" className="block rounded-ui-sm" />

              {isPageLoading ? (
                <div className="absolute inset-0 z-20 rounded-ui-sm border border-border/70 bg-background/95 p-5">
                  <div className="mb-3 text-xs font-medium text-muted-foreground">Loading PDF page...</div>
                  <Skeleton className="h-32 w-full" />
                  <div className="mt-4">
                    <SkeletonLine width="92%" />
                    <SkeletonLine width="76%" />
                    <SkeletonLine width="84%" />
                  </div>
                </div>
              ) : null}

              {hasCitationFailure ? (
                <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center rounded-ui-sm">
                  <div className="max-w-xs rounded-ui-md border border-destructive/20 bg-background/90 px-4 py-3">
                    <div className="text-sm font-semibold text-destructive">Evidence unavailable</div>
                    <div className="mt-1 text-xs text-muted-foreground">Citation verification failed for this source.</div>
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
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
          {hasCitationFailure ? (
            <div className="text-xs text-muted-foreground">Failed citation state. Technical metadata is hidden by default.</div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="font-medium">loaded_state:</span>
                <span className="font-mono">{trustLoadedState}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">doc_version:</span>
                <span className="font-mono">{trustDocVersion}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-medium">verified_at:</span>
                <span className="font-mono">{trustVerifiedAt}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {flagCitationState === "acknowledged" ? (
              <span className="text-xs font-medium text-success">Flagged — thanks</span>
            ) : flagCitationState === "confirm" ? (
              <>
                <span className="text-xs text-destructive font-medium">Confirm flag?</span>
                <button
                  type="button"
                  onClick={() => setFlagCitationState("acknowledged")}
                  className="text-xs px-2.5 py-1 rounded-ui-sm bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors"
                >
                  Yes, flag
                </button>
                <button
                  type="button"
                  onClick={() => setFlagCitationState("idle")}
                  className="text-xs px-2.5 py-1 rounded-ui-sm border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setFlagCitationState("confirm")}
                className="text-xs text-destructive hover:text-destructive font-medium flex items-center hover:bg-destructive/5 px-2.5 py-1.5 rounded-ui-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                Flag citation as wrong
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts legend */}
      <div className="flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground">
        <span>Keyboard:</span>
        <kbd className="rounded-ui-sm border border-border bg-background px-1.5 py-0.5 font-mono">←/→</kbd>
        <span>page</span>
        <kbd className="rounded-ui-sm border border-border bg-background px-1.5 py-0.5 font-mono">+/-</kbd>
        <span>zoom</span>
        <kbd className="rounded-ui-sm border border-border bg-background px-1.5 py-0.5 font-mono">0</kbd>
        <span>verify</span>
        <kbd className="rounded-ui-sm border border-border bg-background px-1.5 py-0.5 font-mono">R</kbd>
        <span>rotate</span>
      </div>

      {/* Diagnostics: snippet verification + error recovery */}
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <SectionLabel>{hasCitationFailure ? "Citation Failure" : "Snippet Verification"}</SectionLabel>
        <div className="mt-3 grid gap-2">
          {hasCitationFailure ? (
            <>
              <div className="rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <div className="font-semibold">Citation could not be verified.</div>
                <div className="mt-1 text-xs text-destructive/90">
                  Keep this row open for review, or use &quot;Flag citation as wrong&quot;.
                </div>
              </div>

              <details className="rounded-ui-md border border-border bg-background/80 p-3 text-xs">
                <summary className="cursor-pointer font-medium text-foreground">Show technical details</summary>
                <div className="mt-3 grid gap-2">
                  <div className="rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <div className="font-semibold">citation_failed</div>
                    <div className="mt-1 text-xs">reason_code: {failureReasonCode}</div>
                    <div className="mt-3 border-t border-destructive/20 pt-3">
                      <div className="text-2xs font-semibold uppercase tracking-wide">Recovery checklist</div>
                      <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
                        {failureChecklist.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

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

                  <div
                    className={cn(
                      "rounded-ui-md border px-3 py-2 text-xs",
                      snippetHashMatches
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-destructive/40 bg-destructive/10 text-destructive",
                    )}
                  >
                    <div className="font-semibold">{snippetHashMatches ? "Snippet hash verified" : "Snippet hash mismatch"}</div>
                    <div className="mt-1 text-2xs">
                      {snippetHashMatches
                        ? "Computed snippet hash matches citation payload."
                        : "Computed snippet hash differs from citation payload. Keep this row open for review until corrected."}
                    </div>
                  </div>
                </div>
              </details>
            </>
          ) : (
            <>
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

              <div
                className={cn(
                  "rounded-ui-md border px-3 py-2 text-xs",
                  snippetHashMatches ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                <div className="font-semibold">{snippetHashMatches ? "Snippet hash verified" : "Snippet hash mismatch"}</div>
                <div className="mt-1 text-2xs">
                  {snippetHashMatches
                    ? "Computed snippet hash matches citation payload."
                    : "Computed snippet hash differs from citation payload. Keep this row open for review until corrected."}
                </div>
              </div>

              {hud.overlayBbox ? (
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <div>
                    Highlight regions: <span className="font-mono">{overlay.length}</span>
                    {overlay.length > 1 ? " (one citation can span multiple lines)" : ""}
                  </div>
                  <div>
                    overlay bbox:{" "}
                    <span className="font-mono">
                      {`{minX:${Math.round(hud.overlayBbox.minX)}, minY:${Math.round(hud.overlayBbox.minY)}, maxX:${Math.round(
                        hud.overlayBbox.maxX,
                      )}, maxY:${Math.round(hud.overlayBbox.maxY)}}`}
                    </span>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
