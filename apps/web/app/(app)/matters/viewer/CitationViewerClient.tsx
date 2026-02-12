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
import { overlayHighlightPolygonProps } from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Button } from "../../../ui/Button";
import { Input, Select } from "../../../ui/Input";
import { SectionLabel } from "../../../ui/Page";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";
import { cn } from "../../../ui/cn";

type Props = {
  packId: string | null;
  citationId: string;
  pdfUrl: string;
  documentId: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
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
      "Return to the report row and keep it in needs-review until citation text is corrected.",
      "Use Flag citation wrong below to acknowledge incorrect evidence.",
    ];
  }

  if (reasonCode === "DOC_MISMATCH" || reasonCode === "WRONG_PAGE") {
    return [
      "Confirm document_id and page are targeting the expected source.",
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
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <SectionLabel>Evidence Context</SectionLabel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">document_id:</span> {props.documentId}{" "}
              <span className="ml-2 font-medium text-foreground">page:</span> {activePage}{" "}
              {pdfPageCount ? <span className="text-muted-foreground">(of {pdfPageCount})</span> : null}
            </div>
            <div>
              {props.packId ? (
                <>
                  <span className="font-medium text-foreground">pack:</span> {props.packId}{" "}
                  <span className="ml-2 font-medium text-foreground">pdfjs:</span> {hud.pdfjsVersion ?? "(loading)"}
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">pdfjs:</span> {hud.pdfjsVersion ?? "(loading)"}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Page</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => goToPage(activePage - 1)}
                  disabled={!canGoPrevPage || isPageLoading}
                >
                  Prev
                </Button>
                <Input
                  uiSize="sm"
                  inputMode="numeric"
                  className="w-16 text-center font-mono"
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
                <span className="min-w-[2.5rem] text-center text-xs text-muted-foreground">
                  / {pdfPageCount ?? "?"}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => goToPage(activePage + 1)}
                  disabled={!canGoNextPage || isPageLoading}
                >
                  Next
                </Button>
              </div>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Zoom</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => stepZoom("out")}
                  disabled={zoomPercent <= ZOOM_LEVELS[0] || isPageLoading}
                  aria-label="Zoom out"
                  aria-keyshortcuts="-"
                >
                  -
                </Button>
                <Select value={zoomPercent} onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}>
                  {ZOOM_LEVELS.map((z) => (
                    <option key={z} value={z}>
                      {z}%
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => stepZoom("in")}
                  disabled={zoomPercent >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1] || isPageLoading}
                  aria-label="Zoom in"
                  aria-keyshortcuts="+"
                >
                  +
                </Button>
              </div>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Rotation</span>
              <div className="flex items-center gap-1">
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
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={rotateClockwise}
                  disabled={isPageLoading}
                  aria-label="Rotate clockwise"
                  aria-keyshortcuts="R"
                >
                  +90°
                </Button>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-3 rounded-ui-md border border-border bg-muted/40 px-3 py-2" role="status" aria-live="polite">
          {showVerificationReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Verification is paused at {zoomPercent}% zoom.</span>
              <Button variant="secondary" size="sm" aria-keyshortcuts="0" onClick={() => setZoomPercent(100)}>
                Reset to 100% to verify
              </Button>
            </div>
          ) : (
            <div className="text-xs text-success">Overlay active at 100% zoom</div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground">
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
                : "Computed snippet hash differs from citation payload. Keep this row in needs-review until corrected."}
            </div>
          </div>

          {hud.errorCode ? (
            <div className="rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="font-semibold">citation_failed</div>
              <div className="mt-1 text-xs">reason_code: {hud.errorCode}</div>
              <div className="mt-3 border-t border-destructive/20 pt-3">
                <div className="text-2xs font-semibold uppercase tracking-wide">Recovery checklist</div>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
                  {failureChecklist.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm" aria-busy={isPageLoading}>
        <SectionLabel>PDF + Overlay</SectionLabel>
        <div className="relative mt-3 inline-block overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <div className="relative">
            <canvas id="citation-canvas" className="block" />

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

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <SectionLabel>Trust footer</SectionLabel>
        <div className="mt-3 grid gap-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">doc_version</span>
            <span className="font-mono text-foreground">{trustDocVersion}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">verified_at</span>
            <span className="font-mono text-foreground">{trustVerifiedAt}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">loaded_state</span>
            <span className="font-mono text-foreground">{trustLoadedState}</span>
          </div>
        </div>

        <div className="mt-4 rounded-ui-md border border-border bg-background p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Citation feedback</div>
          {flagCitationState === "acknowledged" ? (
            <div className="mt-2 text-xs font-medium text-success">
              Thanks, we&apos;ll investigate.
              <span className="block text-2xs font-normal text-muted-foreground">
                This acknowledgement is local to this session only.
              </span>
            </div>
          ) : null}

          {flagCitationState === "confirm" ? (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-foreground">Confirm this citation is incorrect?</div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="destructive" size="sm" onClick={() => setFlagCitationState("acknowledged")}>
                  Yes, flag citation wrong
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setFlagCitationState("idle")}>
                  Cancel
                </Button>
              </div>
              <div className="text-2xs text-muted-foreground">No backend request is sent in parity v1.</div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setFlagCitationState("confirm")}>
                Flag citation wrong
              </Button>
              <span className="text-2xs text-muted-foreground">UI acknowledgement only in parity v1.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
