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

import { Button } from "../../../ui/Button";
import { Input, Select } from "../../../ui/Input";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";

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
  const [activePage, setActivePage] = useState(props.pageNumber);
  const [pageInputValue, setPageInputValue] = useState(String(props.pageNumber));
  const [isPageLoading, setIsPageLoading] = useState(true);

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

  useEffect(() => {
    setActivePage(props.pageNumber);
    setPageInputValue(String(props.pageNumber));
  }, [props.pageNumber]);

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
      setHud((h) => ({ ...h, errorCode: message }));
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
      setHud((h) => ({ ...h, errorCode: message, overlayBbox: null }));
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
              <Select value={zoomPercent} onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}>
                {[75, 100, 125, 150].map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </Select>
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

        <div className="mt-3 rounded-ui-md border border-border bg-muted/40 px-3 py-2">
          {showVerificationReset ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Verification is paused at {zoomPercent}% zoom.</span>
              <Button variant="secondary" size="sm" onClick={() => setZoomPercent(100)}>
                Reset to 100% to verify
              </Button>
            </div>
          ) : (
            <div className="text-xs text-success">Verified at 100% zoom</div>
          )}
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

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm" aria-busy={isPageLoading}>
        <div className="text-sm text-muted-foreground">PDF + highlight overlay</div>
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
    </div>
  );
}
