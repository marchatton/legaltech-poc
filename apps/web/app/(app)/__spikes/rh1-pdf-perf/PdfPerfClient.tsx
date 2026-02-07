"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PdfPerfRun } from "@orbital-poc/core";
import { PdfPerfRunSchema } from "@orbital-poc/core";

type DocRef = { pack: string; filename: string };

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: any) => { promise: Promise<any> };
};

const PACK_OPTIONS: DocRef["pack"][] = ["pack_07_scans_rotated_low_quality"];
const DOC_OPTIONS: Array<DocRef["filename"]> = [
  "TitleCommitment_SCANNED_ROTATED.pdf",
  "ALTA_Survey_SCANNED_ROTATED.pdf",
];

const DEFAULT_PAGE_SEQUENCE = [
  1, 2, 3, 10, 25, 5, 30, 15, 40, 12, 50, 20, 60, 22, 70, 30, 80, 35, 90, 40,
];

function clampToMaxPages(seq: number[], maxPages: number): number[] {
  return seq.map((p) => Math.max(1, Math.min(maxPages, p)));
}

function p50p95max(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (pct: number) => {
    if (!sorted.length) return null;
    const idx = Math.min(sorted.length - 1, Math.floor((pct / 100) * sorted.length));
    return sorted[idx];
  };
  return { p50: at(50), p95: at(95), max: sorted.length ? sorted[sorted.length - 1] : null };
}

export function PdfPerfClient(props: { initialDoc: DocRef }) {
  const [doc, setDoc] = useState<DocRef>(props.initialDoc);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [pageInput, setPageInput] = useState<number>(1);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pageRotate, setPageRotate] = useState<number | null>(null);

  const [lastTimings, setLastTimings] = useState<{
    getPageMs: number | null;
    renderMs: number | null;
    totalMs: number | null;
  } | null>(null);

  const [lastRun, setLastRun] = useState<PdfPerfRun | null>(null);
  const [busy, setBusy] = useState(false);

  const renderTaskRef = useRef<any>(null);

  const longTasksRef = useRef({ longTaskCount: 0, maxLongTaskMs: 0, totalLongTaskMs: 0 });
  const resetLongTasks = () => {
    longTasksRef.current = { longTaskCount: 0, maxLongTaskMs: 0, totalLongTaskMs: 0 };
  };

  const pdfUrl = useMemo(() => {
    const params = new URLSearchParams({ pack: doc.pack, filename: doc.filename });
    return `/__spikes/local-pdf?${params.toString()}`;
  }, [doc]);

  // Long-task / stall monitor
  useEffect(() => {
    resetLongTasks();

    let obs: PerformanceObserver | null = null;
    let stopped = false;
    let isMounted = true;

    const installLongTaskObserver = () => {
      if (typeof PerformanceObserver === "undefined") return false;
      try {
        obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            const dur = Number(entry.duration ?? 0);
            longTasksRef.current.longTaskCount += 1;
            longTasksRef.current.totalLongTaskMs += dur;
            longTasksRef.current.maxLongTaskMs = Math.max(longTasksRef.current.maxLongTaskMs, dur);
          }
        });
        // TS doesn't always know "longtask".
        obs.observe({ entryTypes: ["longtask"] as any });
        return true;
      } catch {
        return false;
      }
    };

    const installStallMonitor = () => {
      const intervalMs = 50;
      const stallThresholdMs = 100;

      const tick = () => {
        if (stopped) return;
        const expected = performance.now() + intervalMs;
        window.setTimeout(() => {
          if (!isMounted) return;
          const drift = performance.now() - expected;
          if (drift > stallThresholdMs) {
            longTasksRef.current.longTaskCount += 1;
            longTasksRef.current.totalLongTaskMs += drift;
            longTasksRef.current.maxLongTaskMs = Math.max(longTasksRef.current.maxLongTaskMs, drift);
          }
          tick();
        }, intervalMs);
      };

      tick();
    };

    const ok = installLongTaskObserver();
    if (!ok) installStallMonitor();

    return () => {
      isMounted = false;
      stopped = true;
      obs?.disconnect();
    };
  }, []);

  // Load pdf.js + PDF on doc change
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setBusy(true);
      setPdf(null);
      setPdfPageCount(null);
      setPageRotate(null);
      setLastTimings(null);
      setLastRun(null);

      const mod: any = await import("pdfjs-dist/build/pdf.mjs");
      const m = mod as PdfJsModule;

      // Worker wiring: allow pdf.js to run parsing/renders off the main thread.
      if (m.GlobalWorkerOptions) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const loadingTask = m.getDocument({ url: pdfUrl });
      const loadedPdf = await loadingTask.promise;

      if (cancelled) return;

      setPdfjs(m);
      setPdf(loadedPdf);
      setPdfPageCount(Number(loadedPdf.numPages ?? null));
      setPageInput(1);
    }

    run().finally(() => {
      if (!cancelled) setBusy(false);
    });

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  async function renderPage(pageNumber: number): Promise<{
    requestedPage: number;
    cancelledPrevious: boolean;
    t_request: number;
    t_gotPage: number | null;
    t_renderStart: number | null;
    t_renderEnd: number | null;
    getPageMs: number | null;
    renderMs: number | null;
    totalMs: number | null;
    error?: string;
    viewport?: { width: number; height: number };
    canvas?: { width: number; height: number; cssWidth: number; cssHeight: number };
    pageRotate?: number;
  }> {
    const canvas = document.getElementById("pdfperf-canvas") as HTMLCanvasElement | null;
    if (!pdf || !pdfjs || !canvas) {
      return {
        requestedPage: pageNumber,
        cancelledPrevious: false,
        t_request: performance.now(),
        t_gotPage: null,
        t_renderStart: null,
        t_renderEnd: null,
        getPageMs: null,
        renderMs: null,
        totalMs: null,
        error: "NOT_READY",
      };
    }

    const prevTask = renderTaskRef.current;
    const cancelledPrevious = Boolean(prevTask);
    try {
      prevTask?.cancel?.();
    } catch {
      // ignore
    }

    const t_request = performance.now();
    let t_gotPage: number | null = null;
    let t_renderStart: number | null = null;
    let t_renderEnd: number | null = null;
    let thisTask: any = null;

    try {
      const page = await pdf.getPage(pageNumber);
      t_gotPage = performance.now();

      const pageRotate = Number(page.rotate ?? 0);
      setPageRotate(pageRotate);

      const scale = zoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: pageRotate });

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("NO_2D_CONTEXT");

      const transform = dpr !== 1 ? ([dpr, 0, 0, dpr, 0, 0] as const) : undefined;

      t_renderStart = performance.now();
      const renderTask = page.render({ canvasContext: ctx, viewport, transform });
      thisTask = renderTask;
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      t_renderEnd = performance.now();

      const getPageMs = t_gotPage - t_request;
      const renderMs = t_renderEnd - t_renderStart;
      const totalMs = t_renderEnd - t_request;

      setLastTimings({ getPageMs, renderMs, totalMs });

      return {
        requestedPage: pageNumber,
        cancelledPrevious,
        t_request,
        t_gotPage,
        t_renderStart,
        t_renderEnd,
        getPageMs,
        renderMs,
        totalMs,
        viewport: { width: viewport.width, height: viewport.height },
        canvas: {
          width: canvas.width,
          height: canvas.height,
          cssWidth: viewport.width,
          cssHeight: viewport.height,
        },
        pageRotate,
      };
    } catch (err: any) {
      return {
        requestedPage: pageNumber,
        cancelledPrevious,
        t_request,
        t_gotPage,
        t_renderStart,
        t_renderEnd,
        getPageMs: t_gotPage ? t_gotPage - t_request : null,
        renderMs: t_renderEnd && t_renderStart ? t_renderEnd - t_renderStart : null,
        totalMs: t_renderEnd ? t_renderEnd - t_request : null,
        error: String(err?.message ?? err),
      };
    } finally {
      // Only clear if we still own the ref (spam mode replaces it).
      if (renderTaskRef.current === thisTask) renderTaskRef.current = null;
    }
  }

  async function runSerialTest() {
    if (!pdf || !pdfPageCount || busy) return;
    setBusy(true);
    resetLongTasks();

    const pageSequence = clampToMaxPages(DEFAULT_PAGE_SEQUENCE, pdfPageCount);
    const rows = [];
    let lastViewport: { width: number; height: number } | undefined;
    let lastCanvas: { width: number; height: number; cssWidth: number; cssHeight: number } | undefined;
    let lastRotate: number | undefined;

    for (const p of pageSequence) {
      const row = await renderPage(p);
      rows.push(row);
      if (row.viewport) lastViewport = row.viewport;
      if (row.canvas) lastCanvas = row.canvas;
      if (typeof row.pageRotate === "number") lastRotate = row.pageRotate;
    }

    const run: PdfPerfRun = {
      createdAt: new Date().toISOString(),
      pdfjsVersion: pdfjs?.version,
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio || 1,
      doc: { ...doc, url: pdfUrl },
      zoomPercent,
      pageRotate: lastRotate,
      viewport: lastViewport,
      canvas: lastCanvas,
      test: { type: "serial", n: pageSequence.length, pageSequence },
      rows: rows.map((r) => ({
        requestedPage: r.requestedPage,
        cancelledPrevious: r.cancelledPrevious,
        t_request: r.t_request,
        t_gotPage: r.t_gotPage,
        t_renderStart: r.t_renderStart,
        t_renderEnd: r.t_renderEnd,
        getPageMs: r.getPageMs,
        renderMs: r.renderMs,
        totalMs: r.totalMs,
        ...(r.error ? { error: r.error } : {}),
      })),
      longTasks: { ...longTasksRef.current },
    };

    // Validate shape so the downloaded artefact stays stable.
    const parsed = PdfPerfRunSchema.safeParse(run);
    setLastRun(parsed.success ? parsed.data : run);

    setBusy(false);
  }

  async function runSpamTest() {
    if (!pdf || !pdfPageCount || busy) return;
    setBusy(true);
    resetLongTasks();

    const pageSequence = clampToMaxPages(DEFAULT_PAGE_SEQUENCE.slice(0, 30), pdfPageCount);
    const rowPromises: Array<Promise<any>> = [];

    const intervalMs = 200;

    for (let i = 0; i < pageSequence.length; i += 1) {
      // Fire requests at a fixed interval; cancellation should keep things responsive.
      rowPromises.push(renderPage(pageSequence[i]));
      await new Promise((r) => window.setTimeout(r, intervalMs));
    }

    const rows = await Promise.all(rowPromises);

    const run: PdfPerfRun = {
      createdAt: new Date().toISOString(),
      pdfjsVersion: pdfjs?.version,
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio || 1,
      doc: { ...doc, url: pdfUrl },
      zoomPercent,
      pageRotate: pageRotate ?? undefined,
      test: { type: "spam", n: pageSequence.length, intervalMs, pageSequence },
      rows: rows.map((r) => ({
        requestedPage: r.requestedPage,
        cancelledPrevious: r.cancelledPrevious,
        t_request: r.t_request,
        t_gotPage: r.t_gotPage,
        t_renderStart: r.t_renderStart,
        t_renderEnd: r.t_renderEnd,
        getPageMs: r.getPageMs,
        renderMs: r.renderMs,
        totalMs: r.totalMs,
        ...(r.error ? { error: r.error } : {}),
      })),
      longTasks: { ...longTasksRef.current },
    };

    const parsed = PdfPerfRunSchema.safeParse(run);
    setLastRun(parsed.success ? parsed.data : run);

    setBusy(false);
  }

  function downloadResults() {
    if (!lastRun) return;
    const totalMs = lastRun.rows.map((r) => r.totalMs ?? 0).filter((n) => n > 0);
    const stats = p50p95max(totalMs);

    const payload = {
      ...lastRun,
      summary: { totalMs: stats },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `rh1_${doc.filename.replace(/\\.pdf$/i, "")}_${zoomPercent}_${lastRun.test.type}.json`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Pack</span>
            <select
              className="rounded border border-slate-300 bg-white p-2"
              value={doc.pack}
              onChange={(e) => setDoc((d) => ({ ...d, pack: e.currentTarget.value }))}
              disabled={busy}
            >
              {PACK_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Doc</span>
            <select
              className="rounded border border-slate-300 bg-white p-2"
              value={doc.filename}
              onChange={(e) => setDoc((d) => ({ ...d, filename: e.currentTarget.value }))}
              disabled={busy}
            >
              {DOC_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Zoom</span>
            <select
              className="rounded border border-slate-300 bg-white p-2"
              value={zoomPercent}
              onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              disabled={busy}
            >
              {[50, 100, 150].map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Page (1-indexed)</span>
            <input
              className="rounded border border-slate-300 bg-white p-2"
              type="number"
              min={1}
              max={pdfPageCount ?? undefined}
              value={pageInput}
              onChange={(e) => setPageInput(Number(e.currentTarget.value))}
              disabled={busy}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void renderPage(pageInput)}
            disabled={busy || !pdf}
          >
            Jump
          </button>
          <button
            className="rounded bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void runSerialTest()}
            disabled={busy || !pdf}
          >
            Run serial test (N=20)
          </button>
          <button
            className="rounded bg-slate-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={() => void runSpamTest()}
            disabled={busy || !pdf}
          >
            Run spam test (N=30, interval=200ms)
          </button>
          <button
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
            onClick={downloadResults}
            disabled={!lastRun}
          >
            Download results JSON
          </button>
        </div>

        <div className="mt-4 grid gap-1 text-sm text-slate-700">
          <div>
            <span className="font-medium">pdfjsVersion:</span> {pdfjs?.version ?? "(loading)"}
          </div>
          <div>
            <span className="font-medium">doc:</span> {doc.filename} ({pdfPageCount ?? "?"} pages)
          </div>
          <div>
            <span className="font-medium">page.rotate:</span> {pageRotate ?? "?"}
          </div>
          <div>
            <span className="font-medium">devicePixelRatio:</span> {typeof window !== "undefined" ? window.devicePixelRatio : "?"}
          </div>
          <div>
            <span className="font-medium">last timings:</span>{" "}
            {lastTimings
              ? `getPage=${Math.round(lastTimings.getPageMs ?? 0)}ms, render=${Math.round(
                  lastTimings.renderMs ?? 0,
                )}ms, total=${Math.round(lastTimings.totalMs ?? 0)}ms`
              : "(none)"}
          </div>
          <div>
            <span className="font-medium">long tasks:</span>{" "}
            count={longTasksRef.current.longTaskCount}, max={Math.round(longTasksRef.current.maxLongTaskMs)}ms
          </div>
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="text-sm text-slate-600">
          Canvas (single-page render; cancellation on navigation)
        </div>
        <div className="mt-3 overflow-auto rounded border border-slate-200 bg-slate-50 p-2">
          <canvas id="pdfperf-canvas" />
        </div>
      </section>

      <section className="text-xs text-slate-600">
        <div>
          <span className="font-medium">PDF URL:</span> <code>{pdfUrl}</code>
        </div>
      </section>
    </div>
  );
}
