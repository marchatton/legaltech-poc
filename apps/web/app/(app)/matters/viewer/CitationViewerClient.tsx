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

type Props = {
  packId: string;
  citationId: string;
  pdfUrl: string;
  documentFilename: string;
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

function validateNormPolygons(polygons: NormPolygons): string | null {
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
  const [zoomPercent, setZoomPercent] = useState(125);
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
        return;
      }

      const polyErr = validateNormPolygons(props.polygons);
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
  }, [pdf, pdfjs, props.errorCode, props.pageNumber, props.polygons, userRotation, zoomPercent]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4">
      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1 text-sm text-slate-700">
            <div>
              <span className="font-medium text-slate-900">doc:</span> {props.documentFilename}{" "}
              <span className="ml-2 font-medium text-slate-900">page:</span> {props.pageNumber}{" "}
              {pdfPageCount ? <span className="text-slate-500">(of {pdfPageCount})</span> : null}
            </div>
            <div>
              <span className="font-medium text-slate-900">pack:</span> {props.packId}{" "}
              <span className="ml-2 font-medium text-slate-900">pdfjs:</span>{" "}
              {hud.pdfjsVersion ?? "(loading)"}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Zoom</span>
              <select
                className="rounded border border-slate-300 bg-white p-2"
                value={zoomPercent}
                onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              >
                {[75, 100, 125, 150].map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Rotation</span>
              <select
                className="rounded border border-slate-300 bg-white p-2"
                value={userRotation}
                onChange={(e) => setUserRotation(Number(e.currentTarget.value))}
              >
                {[0, 90, 180, 270].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="text-xs text-slate-600">snippet</div>
          <pre className="overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">{props.snippet}</pre>

          <div className="grid gap-1 text-xs text-slate-700">
            <div>
              <span className="font-medium text-slate-900">snippet_hash:</span>{" "}
              <span className="font-mono">{props.snippetHash}</span>
            </div>
            <div>
              <span className="font-medium text-slate-900">computed:</span>{" "}
              <span className="font-mono">{props.computedSnippetHash}</span>
            </div>
          </div>

          {hud.errorCode ? (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <div className="font-semibold">citation_failed</div>
              <div className="mt-1 text-xs">reason_code: {hud.errorCode}</div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">PDF + highlight overlay</div>
        <div className="relative mt-3 inline-block overflow-auto rounded border border-slate-200 bg-slate-50 p-2">
          <div className="relative">
            <canvas id="citation-canvas" className="block" />

            {hud.errorCode ? (
              <div className="absolute inset-0 grid place-items-center bg-white/80 p-6 text-center">
                <div>
                  <div className="text-sm font-semibold text-slate-900">citation_failed</div>
                  <div className="mt-1 text-xs text-slate-700">reason_code: {hud.errorCode}</div>
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
                    fill="rgba(59, 130, 246, 0.25)"
                    stroke="rgba(37, 99, 235, 0.9)"
                    strokeWidth={2}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        {hud.overlayBbox ? (
          <div className="mt-3 text-xs text-slate-600">
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
