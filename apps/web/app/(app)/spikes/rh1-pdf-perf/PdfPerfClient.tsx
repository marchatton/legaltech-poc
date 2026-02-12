"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";

import type { PdfPerfRun } from "@orbital-poc/core";
import { PdfPerfRunSchema } from "@orbital-poc/core";
import { fixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

import { Button } from "../../../ui/Button";
import { Input, Select } from "../../../ui/Input";

type DocRef = { pack: string; filename: string };

type RangePrecondition =
  | { kind: "checking" }
  | { kind: "pass"; acceptRanges: string | null; rangeStatus: number | null; contentRange: string | null }
  | {
      kind: "fail";
      acceptRanges: string | null;
      rangeStatus: number | null;
      contentRange: string | null;
      reason: string;
    };

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

function wrapToMaxPages(seq: number[], maxPages: number): number[] {
  if (maxPages <= 0) return [];
  return seq.map((p) => 1 + ((p - 1) % maxPages));
}

function p50p95max(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (pct: number) => {
    if (!sorted.length) return null;
    // "Nearest rank" method: https://en.wikipedia.org/wiki/Percentile#The_nearest-rank_method
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
    return sorted[idx];
  };
  return { p50: at(50), p95: at(95), max: sorted.length ? sorted[sorted.length - 1] : null };
}

function packShort(packId: string): string {
  const m = /^pack_\d{2}/i.exec(packId);
  return m ? m[0] : packId;
}

function docBase(filename: string): string {
  return filename.replace(/\.pdf$/i, "");
}

function isRenderCancelledError(err: any): boolean {
  const name = typeof err?.name === "string" ? err.name : "";
  const message = typeof err?.message === "string" ? err.message : String(err);
  return name === "RenderingCancelledException" || /render(ing)? cancelled/i.test(message);
}

function rowWasCancelled(row: { error?: string }): boolean {
  return row.error === "RENDER_CANCELLED" || row.error === "REQUEST_SUPERSEDED";
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function PdfPerfClient(props: { initialDoc: DocRef }) {
  const [doc, setDoc] = useState<DocRef>(props.initialDoc);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [pageInput, setPageInput] = useState<number>(1);
  const [spamSimulatedDelayMs, setSpamSimulatedDelayMs] = useState<number>(250);

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

  const [rangePrecondition, setRangePrecondition] = useState<RangePrecondition>({ kind: "checking" });

  const renderTaskRef = useRef<any>(null);
  const requestSeqRef = useRef(0);

  const longTasksRef = useRef({ longTaskCount: 0, maxLongTaskMs: 0, totalLongTaskMs: 0 });
  const resetLongTasks = () => {
    longTasksRef.current = { longTaskCount: 0, maxLongTaskMs: 0, totalLongTaskMs: 0 };
  };

  const documentId = useMemo(() => fixtureDocumentId({ packId: doc.pack, filename: doc.filename }), [doc]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfUrlError, setPdfUrlError] = useState<string | null>(null);

  // Reset harness state when switching documents (before fetching a new signed URL).
  useEffect(() => {
    setPdf(null);
    setPdfPageCount(null);
    setPageRotate(null);
    setLastTimings(null);
    setLastRun(null);
    requestSeqRef.current = 0;
    setBusy(false);
  }, [documentId]);

  // Fetch canonical render_url for this fixture doc (signed, Range-capable).
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdfUrl(null);
      setPdfUrlError(null);
      setRangePrecondition({ kind: "checking" });

      try {
        const res = await fetch(`/documents/${encodeURIComponent(documentId)}/render?page=1`, { cache: "no-store" });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const env = isRecord(json) && isRecord(json.error) ? json.error : null;
          const code = env && typeof env.code === "string" ? env.code : "RENDER_URL_FAILED";
          const message =
            env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
          if (!cancelled) setPdfUrlError(`${code}: ${message}`);
          return;
        }

        const renderUrl = isRecord(json) && typeof json.render_url === "string" ? json.render_url : null;
        if (!renderUrl) {
          if (!cancelled) setPdfUrlError("Missing render_url in response.");
          return;
        }

        if (!cancelled) setPdfUrl(renderUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!cancelled) setPdfUrlError(message);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  // Preconditions: Range support (required for valid perf numbers)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!pdfUrl) {
        setRangePrecondition({
          kind: "fail",
          acceptRanges: null,
          rangeStatus: null,
          contentRange: null,
          reason: pdfUrlError ?? "Missing render_url.",
        });
        return;
      }

      try {
        const res = await fetch(pdfUrl, { headers: { Range: "bytes=0-1023" } });
        const acceptRanges = res.headers.get("accept-ranges");
        const contentRange = res.headers.get("content-range");

        const ok =
          res.status === 206 && typeof acceptRanges === "string" && acceptRanges.toLowerCase().includes("bytes");

        if (cancelled) return;

        if (ok) {
          setRangePrecondition({
            kind: "pass",
            acceptRanges,
            rangeStatus: res.status,
            contentRange,
          });
          return;
        }

        const reasonParts: string[] = [];
        if (res.status !== 206) reasonParts.push(`expected 206, got ${res.status}`);
        if (!acceptRanges) reasonParts.push("missing Accept-Ranges");
        else if (!acceptRanges.toLowerCase().includes("bytes")) reasonParts.push(`Accept-Ranges=${acceptRanges}`);

        setRangePrecondition({
          kind: "fail",
          acceptRanges,
          rangeStatus: res.status,
          contentRange,
          reason: reasonParts.join("; ") || "Range precondition failed.",
        });
      } catch (err: any) {
        if (cancelled) return;
        setRangePrecondition({
          kind: "fail",
          acceptRanges: null,
          rangeStatus: null,
          contentRange: null,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, pdfUrlError]);

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
      if (!pdfUrl) return;

      setBusy(true);
      setPdf(null);
      setPdfPageCount(null);
      setPageRotate(null);
      setLastTimings(null);
      setLastRun(null);
      requestSeqRef.current = 0;

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

  async function renderPage(
    pageNumber: number,
    args?: { simulateDelayMs?: number },
  ): Promise<{
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
    const simulateDelayMs =
      typeof args?.simulateDelayMs === "number" ? Math.max(0, Math.floor(args.simulateDelayMs)) : 0;
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

    const requestSeq = (requestSeqRef.current += 1);
    const t_request = performance.now();
    let t_gotPage: number | null = null;
    let t_renderStart: number | null = null;
    let t_renderEnd: number | null = null;
    let thisTask: any = null;

    try {
      if (simulateDelayMs > 0) {
        await new Promise((r) => window.setTimeout(r, simulateDelayMs));
        if (requestSeq !== requestSeqRef.current) {
          const t_now = performance.now();
          return {
            requestedPage: pageNumber,
            cancelledPrevious,
            t_request,
            t_gotPage: t_now,
            t_renderStart: null,
            t_renderEnd: null,
            getPageMs: t_now - t_request,
            renderMs: null,
            totalMs: null,
            error: "REQUEST_SUPERSEDED",
          };
        }
      }

      const page = await pdf.getPage(pageNumber);
      if (requestSeq !== requestSeqRef.current) {
        const t_now = performance.now();
        return {
          requestedPage: pageNumber,
          cancelledPrevious,
          t_request,
          t_gotPage: t_now,
          t_renderStart: null,
          t_renderEnd: null,
          getPageMs: t_now - t_request,
          renderMs: null,
          totalMs: null,
          error: "REQUEST_SUPERSEDED",
        };
      }
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
      if (requestSeq !== requestSeqRef.current) {
        const t_now = performance.now();
        return {
          requestedPage: pageNumber,
          cancelledPrevious,
          t_request,
          t_gotPage,
          t_renderStart,
          t_renderEnd: t_now,
          getPageMs: t_gotPage - t_request,
          renderMs: null,
          totalMs: null,
          error: "REQUEST_SUPERSEDED",
        };
      }
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
      if (isRenderCancelledError(err)) {
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
          error: "RENDER_CANCELLED",
        };
      }
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
    if (rangePrecondition.kind !== "pass") {
      setLastRun(null);
      return;
    }
    if (!pdf || !pdfPageCount || busy) return;
    setBusy(true);
    resetLongTasks();

    const pageSequence = wrapToMaxPages(DEFAULT_PAGE_SEQUENCE, pdfPageCount);
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
      doc: { ...doc, document_id: documentId },
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
    if (rangePrecondition.kind !== "pass") {
      setLastRun(null);
      return;
    }
    if (!pdf || !pdfPageCount || busy) return;
    setBusy(true);
    resetLongTasks();

    const spamBase = Array.from({ length: 30 }, (_, i) => DEFAULT_PAGE_SEQUENCE[i % DEFAULT_PAGE_SEQUENCE.length] + i);
    const pageSequence = wrapToMaxPages(spamBase, pdfPageCount);
    const rowPromises: Array<Promise<any>> = [];

    const intervalMs = 200;

    for (let i = 0; i < pageSequence.length; i += 1) {
      // Fire requests at a fixed interval; cancellation should keep things responsive.
      rowPromises.push(renderPage(pageSequence[i], { simulateDelayMs: spamSimulatedDelayMs }));
      await new Promise((r) => window.setTimeout(r, intervalMs));
    }

    const rows = await Promise.all(rowPromises);

    const run: PdfPerfRun = {
      createdAt: new Date().toISOString(),
      pdfjsVersion: pdfjs?.version,
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio || 1,
      doc: { ...doc, document_id: documentId },
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

  const lastSummary = useMemo(() => {
    if (!lastRun) return null;
    const totalMs = lastRun.rows.map((r) => r.totalMs ?? 0).filter((n) => n > 0);
    const totalStats = p50p95max(totalMs);

    if (lastRun.test.type === "serial") {
      const reasons: string[] = [];
      const ok =
        rangePrecondition.kind === "pass" &&
        (totalStats.p95 ?? Infinity) < 1000 &&
        (totalStats.max ?? Infinity) < 1500;

      if (rangePrecondition.kind !== "pass") reasons.push("RANGE_UNSUPPORTED");
      if ((totalStats.p95 ?? Infinity) >= 1000) reasons.push("P95_SLOW");
      if ((totalStats.max ?? Infinity) >= 1500) reasons.push("MAX_SLOW");

      return { kind: "serial" as const, totalStats, ok, reasons };
    }

    const intermediate = lastRun.rows.slice(0, -1);
    const cancelledCount = intermediate.filter(rowWasCancelled).length;
    const cancellationRate = intermediate.length ? cancelledCount / intermediate.length : 0;
    const finalRow = lastRun.rows[lastRun.rows.length - 1];
    const finalTotalMs = finalRow?.totalMs ?? null;

    const reasons: string[] = [];
    const ok =
      rangePrecondition.kind === "pass" &&
      longTasksRef.current.maxLongTaskMs < 250 &&
      typeof finalTotalMs === "number" &&
      finalTotalMs < 1500 &&
      cancellationRate >= 0.7;

    if (rangePrecondition.kind !== "pass") reasons.push("RANGE_UNSUPPORTED");
    if (longTasksRef.current.maxLongTaskMs >= 250) reasons.push("LONG_TASKS");
    if (typeof finalTotalMs !== "number") reasons.push("FINAL_PAGE_NO_TIMING");
    else if (finalTotalMs >= 1500) reasons.push("FINAL_PAGE_SLOW");
    if (cancellationRate < 0.7) reasons.push("LOW_CANCELLATION_RATE");

    return {
      kind: "spam" as const,
      totalStats,
      cancellation: { cancelledCount, totalCount: intermediate.length, rate: cancellationRate },
      final: { requestedPage: finalRow?.requestedPage ?? null, totalMs: finalTotalMs },
      ok,
      reasons,
    };
  }, [lastRun, rangePrecondition.kind]);

  function downloadResults() {
    if (!lastRun) return;
    const totalMs = lastRun.rows.map((r) => r.totalMs ?? 0).filter((n) => n > 0);
    const stats = p50p95max(totalMs);

    const goNoGo = lastSummary?.ok ? "GO" : "NO-GO";

    const payload = {
      ...lastRun,
      preconditions: {
        range: rangePrecondition,
      },
      summary: {
        totalMs: stats,
        goNoGo,
        reasons: lastSummary?.reasons ?? [],
        thresholds: {
          serial: { p95LtMs: 1000, maxLtMs: 1500 },
          spam: { maxLongTaskLtMs: 250, finalTotalLtMs: 1500, cancellationRateGte: 0.7 },
        },
        ...(lastSummary?.kind === "spam"
          ? {
              spamSimulatedDelayMs,
              cancellation: lastSummary.cancellation,
              final: lastSummary.final,
            }
          : {}),
        longTasks: { ...longTasksRef.current },
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `RH1_pdfjs_perf_${packShort(doc.pack)}_${docBase(doc.filename)}_${zoomPercent}_${lastRun.test.type}.json`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="grid gap-4 text-sm">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Pack</span>
            <Select
              value={doc.pack}
              onChange={(e) => setDoc((d) => ({ ...d, pack: e.currentTarget.value }))}
              disabled={busy}
            >
              {PACK_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Doc</span>
            <Select
              value={doc.filename}
              onChange={(e) => setDoc((d) => ({ ...d, filename: e.currentTarget.value }))}
              disabled={busy}
            >
              {DOC_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Zoom</span>
            <Select
              value={zoomPercent}
              onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              disabled={busy}
            >
              {[50, 100, 150].map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Page (1-indexed)</span>
            <Input
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
          <Button
            variant="primary"
            onClick={() => void renderPage(pageInput)}
            disabled={busy || !pdf}
          >
            Jump
          </Button>
          <Button
            variant="secondary"
            onClick={() => void runSerialTest()}
            disabled={busy || !pdf || rangePrecondition.kind !== "pass"}
          >
            Run serial test (N=20)
          </Button>
          <Button
            variant="secondary"
            onClick={() => void runSpamTest()}
            disabled={busy || !pdf || rangePrecondition.kind !== "pass"}
          >
            Run spam test (N=30, interval=200ms)
          </Button>
          <Button
            variant="secondary"
            onClick={downloadResults}
            disabled={!lastRun}
          >
            Download results JSON
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Spam simulated delay (ms)</span>
            <Input
              className="w-40"
              type="number"
              min={0}
              step={50}
              value={spamSimulatedDelayMs}
              onChange={(e) => setSpamSimulatedDelayMs(Number(e.currentTarget.value))}
              disabled={busy}
            />
          </label>
          <div className="text-xs text-muted-foreground">
            Adds async delay per request (simulated Range/network latency) to force cancellation behavior.
          </div>
        </div>

        <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Range:</span>{" "}
            {rangePrecondition.kind === "checking"
              ? "checking…"
              : rangePrecondition.kind === "pass"
                ? `PASS (Accept-Ranges=${rangePrecondition.acceptRanges ?? "?"})`
                : `FAIL (${rangePrecondition.reason})`}
          </div>
          {rangePrecondition.kind === "fail" ? (
            <div className="mt-2 rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <div className="font-semibold">RH1 NO-GO</div>
              <div className="mt-1">
                Range requests are required for valid perf numbers. Fix the PDF serving path to return{" "}
                <span className="font-mono">Accept-Ranges: bytes</span> and{" "}
                <span className="font-mono">206 Partial Content</span> for Range requests.
              </div>
            </div>
          ) : null}
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
          {lastSummary ? (
            <div className="mt-2 rounded-ui-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">
                {lastSummary.ok ? "GO" : "NO-GO"}{" "}
                <span className="ml-2 font-normal text-muted-foreground">({lastRun?.test.type})</span>
              </div>
              <div className="mt-1">
                totalMs: p50={lastSummary.totalStats.p50 ? Math.round(lastSummary.totalStats.p50) : "?"}ms, p95=
                {lastSummary.totalStats.p95 ? Math.round(lastSummary.totalStats.p95) : "?"}ms, max=
                {lastSummary.totalStats.max ? Math.round(lastSummary.totalStats.max) : "?"}ms
              </div>
              {lastSummary.kind === "spam" ? (
                <div className="mt-1">
                  cancellation (intermediate): {lastSummary.cancellation.cancelledCount}/{lastSummary.cancellation.totalCount} (
                  {Math.round(lastSummary.cancellation.rate * 100)}%)
                </div>
              ) : null}
              {lastSummary.kind === "spam" && lastSummary.final.requestedPage ? (
                <div className="mt-1">
                  final page {lastSummary.final.requestedPage}: totalMs=
                  {typeof lastSummary.final.totalMs === "number" ? `${Math.round(lastSummary.final.totalMs)}ms` : "?"}
                </div>
              ) : null}
              {lastSummary.reasons.length ? (
                <div className="mt-1 text-muted-foreground">reasons: {lastSummary.reasons.join(", ")}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">
          Canvas (single-page render; cancellation on navigation)
        </div>
        <div className="mt-3 overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <canvas id="pdfperf-canvas" />
        </div>
      </section>

      <section className="text-xs text-muted-foreground">
        <div>
          <span className="font-medium">document_id:</span> <code>{documentId}</code>
        </div>
      </section>
    </div>
  );
}
