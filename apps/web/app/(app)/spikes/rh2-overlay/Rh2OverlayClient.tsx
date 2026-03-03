"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";

import {
  anchorBoxToPolygons,
  bboxFromCssPolygons,
  mapNormPolygonsToViewportCss,
  type CssPolygons,
  type NormPoint,
  type ViewBox,
} from "@legaltech-poc/core";
import { useRouter } from "next/navigation";

import { overlayHighlightPolygonProps } from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Select } from "../../../ui/Input";

type Props = {
  pack: string;
  docKey: "TitleCommitment" | "ALTA_Survey";
  pdfUrl: string;
  pdfFilename: string;
  anchorIds: string[];
  anchors: Record<string, { page: number; bbox: [number, number, number, number] }>;
};

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: any) => { promise: Promise<any> };
};

export function Rh2OverlayClient(props: Props) {
  const router = useRouter();

  const [pack, setPack] = useState(props.pack);
  const [docKey, setDocKey] = useState<Props["docKey"]>(props.docKey);
  const [anchorId, setAnchorId] = useState(props.anchorIds[0] ?? "");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [userRotation, setUserRotation] = useState(0);

  const [injectInvalidPolygon, setInjectInvalidPolygon] = useState(false);
  const [forceWrongPage, setForceWrongPage] = useState(false);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<any>(null);

  const [hud, setHud] = useState<{
    page: number | null;
    pageRotate: number | null;
    totalRotation: number | null;
    viewport: { width: number; height: number } | null;
    canvas: { width: number; height: number; cssWidth: number; cssHeight: number } | null;
    dpr: number | null;
    overlayBbox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    errorCode: string | null;
  }>({
    page: null,
    pageRotate: null,
    totalRotation: null,
    viewport: null,
    canvas: null,
    dpr: null,
    overlayBbox: null,
    errorCode: null,
  });

  const renderTaskRef = useRef<any>(null);

  const selectedAnchor = props.anchors[anchorId] ?? null;
  const selectedPage = selectedAnchor?.page ?? null;

  const effectivePage = useMemo(() => {
    if (!selectedPage) return null;
    if (!forceWrongPage) return selectedPage;
    return selectedPage + 1;
  }, [forceWrongPage, selectedPage]);

  // Keep local state aligned when navigating (back/forward, etc).
  useEffect(() => {
    setPack(props.pack);
    setDocKey(props.docKey);
  }, [props.docKey, props.pack]);

  // Reset anchor selection when pack/doc changes (new anchor set).
  useEffect(() => {
    if (props.anchorIds.includes(anchorId)) return;
    setAnchorId(props.anchorIds[0] ?? "");
  }, [anchorId, props.anchorIds]);

  // Update URL on pack/doc change so the server can re-load anchors.
  useEffect(() => {
    if (pack === props.pack && docKey === props.docKey) return;
    const params = new URLSearchParams({ pack, doc: docKey });
    router.push(`/spikes/rh2-overlay?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, docKey]);

  // Cut: overlay is verified at 100% zoom only. Snap and lock.
  useEffect(() => {
    if (zoomPercent !== 100) setZoomPercent(100);
  }, [zoomPercent]);

  // Load pdf.js + PDF on pdfUrl change
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdf(null);
      setHud((h) => ({ ...h, errorCode: null }));

      const mod: any = await import("pdfjs-dist/build/pdf.mjs");
      const m = mod as PdfJsModule;
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
    }

    run().catch((err) => {
      if (!cancelled) setHud((h) => ({ ...h, errorCode: String(err?.message ?? err) }));
    });

    return () => {
      cancelled = true;
    };
  }, [props.pdfUrl]);

  // Render page + overlay when inputs change
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const canvas = document.getElementById("rh2-canvas") as HTMLCanvasElement | null;
      if (!canvas || !pdf || !pdfjs || !selectedAnchor || !effectivePage) return;

      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdf.getPage(effectivePage);
      const pageRotate = Number(page.rotate ?? 0);
      const totalRotation = (pageRotate + userRotation) % 360;

      const scale = zoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: totalRotation });
      const viewBox = (page.view?.slice?.(0, 4) ?? page.view) as ViewBox;

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

      if (forceWrongPage) {
        // Fail closed (we deliberately render the wrong page).
        setOverlay([]);
        setHud({
          page: effectivePage,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          canvas: { width: canvas.width, height: canvas.height, cssWidth: viewport.width, cssHeight: viewport.height },
          dpr,
          overlayBbox: null,
          errorCode: "WRONG_PAGE",
        });
        return;
      }

      const polygonsBase = anchorBoxToPolygons({ page: selectedAnchor.page, bbox: selectedAnchor.bbox });
      const badPoint: NormPoint = [-0.1, 0.2] as const;
      const polygons = injectInvalidPolygon
        ? [[badPoint, ...polygonsBase[0].slice(1)]]
        : polygonsBase;

      const polyErr = validateNormPolygons(polygons);
      if (polyErr) {
        setOverlay([]);
        setHud({
          page: effectivePage,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          canvas: { width: canvas.width, height: canvas.height, cssWidth: viewport.width, cssHeight: viewport.height },
          dpr,
          overlayBbox: null,
          errorCode: polyErr,
        });
        return;
      }

      const mapped = mapNormPolygonsToViewportCss({ polygons, viewBox, viewport });
      const bbox = bboxFromCssPolygons(mapped);
      const overlayBbox =
        bbox && Number.isFinite(bbox.minX)
          ? { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY }
          : null;

      if (!cancelled) {
        setHud({
          page: effectivePage,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          canvas: { width: canvas.width, height: canvas.height, cssWidth: viewport.width, cssHeight: viewport.height },
          dpr,
          overlayBbox,
          errorCode: null,
        });

        // Store mapped polygons for SVG render.
        setOverlay(mapped);
      }
    }

    run().catch((err) => {
      setOverlay([]);
      setHud((h) => ({ ...h, errorCode: String(err?.message ?? err), overlayBbox: null }));
    });

    return () => {
      cancelled = true;
    };
  }, [effectivePage, forceWrongPage, injectInvalidPolygon, pdf, pdfjs, selectedAnchor, userRotation, zoomPercent]);

  const [overlay, setOverlay] = useState<CssPolygons>([]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4 text-sm">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Pack</span>
            <Select
              value={pack}
              onChange={(e) => setPack(e.currentTarget.value)}
            >
              <option value="pack_01_clean">pack_01_clean</option>
              <option value="pack_07_scans_rotated_low_quality">pack_07_scans_rotated_low_quality</option>
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Doc</span>
            <Select
              value={docKey}
              onChange={(e) => setDocKey(e.currentTarget.value as Props["docKey"])}
            >
              <option value="TitleCommitment">TitleCommitment</option>
              <option value="ALTA_Survey">ALTA_Survey</option>
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Anchor</span>
            <Select
              value={anchorId}
              onChange={(e) => setAnchorId(e.currentTarget.value)}
            >
              {props.anchorIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Zoom</span>
            <Select
              value={zoomPercent}
              disabled
              onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
            >
              {[100].map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </Select>
            <span className="text-xs text-muted-foreground">Locked to 100% for overlay verification</span>
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">User rotation</span>
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

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={injectInvalidPolygon}
              onChange={(e) => setInjectInvalidPolygon(e.currentTarget.checked)}
            />
            injectInvalidPolygon
          </label>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={forceWrongPage}
              onChange={(e) => setForceWrongPage(e.currentTarget.checked)}
            />
            forceWrongPage
          </label>
        </div>

        <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">pdfjsVersion:</span> {pdfjs?.version ?? "(loading)"}
          </div>
          <div>
            <span className="font-medium">pack/doc:</span> {props.pack} / {props.pdfFilename}
          </div>
          <div>
            <span className="font-medium">anchor page:</span> {selectedPage ?? "?"}
          </div>
          <div>
            <span className="font-medium">rendered page:</span> {hud.page ?? "?"}
          </div>
          <div>
            <span className="font-medium">page.rotate:</span> {hud.pageRotate ?? "?"}
          </div>
          <div>
            <span className="font-medium">userRotation:</span> {userRotation}
          </div>
          <div>
            <span className="font-medium">totalRotation:</span> {hud.totalRotation ?? "?"}
          </div>
          <div>
            <span className="font-medium">viewport:</span>{" "}
            {hud.viewport ? `${Math.round(hud.viewport.width)}x${Math.round(hud.viewport.height)}` : "?"}
          </div>
          <div>
            <span className="font-medium">canvas:</span>{" "}
            {hud.canvas ? `${hud.canvas.width}x${hud.canvas.height} (css ${Math.round(hud.canvas.cssWidth)}x${Math.round(hud.canvas.cssHeight)})` : "?"}
          </div>
          <div>
            <span className="font-medium">devicePixelRatio:</span> {hud.dpr ?? "?"}
          </div>
          <div>
            <span className="font-medium">overlay bbox:</span>{" "}
            {hud.overlayBbox
              ? `{minX:${Math.round(hud.overlayBbox.minX)}, minY:${Math.round(hud.overlayBbox.minY)}, maxX:${Math.round(
                  hud.overlayBbox.maxX,
                )}, maxY:${Math.round(hud.overlayBbox.maxY)}}`
              : "(none)"}
          </div>
          <div>
            <span className="font-medium">errorCode:</span> {hud.errorCode ?? "(none)"}
          </div>
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">Canvas + SVG overlay</div>
        <div className="relative mt-3 inline-block overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <div className="relative">
            <canvas id="rh2-canvas" className="block" />
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
      </section>
    </div>
  );
}
