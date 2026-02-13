import "server-only";

const LOOP_SURFACES = ["list", "detail", "run", "report", "export"] as const;

export type LoopSurface = (typeof LOOP_SURFACES)[number];

export type CanonicalLoopTelemetryTags = Readonly<{
  stage: LoopSurface;
  story_id: string;
  pack_id: string;
  run_id: string;
}>;

export type CrossSurfaceRunContext = Readonly<{
  story_id: string;
  pack_id: string;
  run_id: string;
}>;

export type ReadinessSurfaceSnapshot = Readonly<{
  readiness_state: string;
  readiness_reason_code: string | null;
}>;

export type RunSurfaceSnapshot = Readonly<{
  run_id: string;
}>;

export type ReportSurfaceSnapshot = Readonly<{
  run_id: string;
}>;

export type ExportSurfaceSnapshot = Readonly<{
  run_id: string;
}>;

export type CrossSurfaceParityInput = Readonly<{
  context: CrossSurfaceRunContext;
  surfaces: Readonly<{
    list: ReadinessSurfaceSnapshot;
    detail: ReadinessSurfaceSnapshot;
    run: RunSurfaceSnapshot;
    report: ReportSurfaceSnapshot;
    export: ExportSurfaceSnapshot;
  }>;
}>;

export type CrossSurfaceParityMetric = "readiness_state_mismatch_detected" | "run_context_mismatch_detected";

export type CrossSurfaceParityMismatch = Readonly<{
  metric: CrossSurfaceParityMetric;
  stage: LoopSurface;
  story_id: string;
  pack_id: string;
  run_id: string;
  expected: string;
  actual: string;
  message: string;
}>;

export type CrossSurfaceParityResult = Readonly<{
  telemetry: Readonly<Record<LoopSurface, CanonicalLoopTelemetryTags>>;
  metrics: Readonly<{
    readiness_state_mismatch_detected: number;
    run_context_mismatch_detected: number;
  }>;
  mismatches: CrossSurfaceParityMismatch[];
}>;

function asNonEmpty(value: string, field: "story_id" | "pack_id" | "run_id"): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`PARITY_CONTEXT_INVALID_${field.toUpperCase()}`);
  return normalized;
}

export function buildCanonicalLoopTelemetry(context: CrossSurfaceRunContext): Readonly<Record<LoopSurface, CanonicalLoopTelemetryTags>> {
  const storyId = asNonEmpty(context.story_id, "story_id");
  const packId = asNonEmpty(context.pack_id, "pack_id");
  const runId = asNonEmpty(context.run_id, "run_id");

  return Object.freeze(
    Object.fromEntries(
      LOOP_SURFACES.map((stage) => [
        stage,
        {
          stage,
          story_id: storyId,
          pack_id: packId,
          run_id: runId,
        },
      ]),
    ) as Record<LoopSurface, CanonicalLoopTelemetryTags>,
  );
}

function pushMismatch(
  mismatches: CrossSurfaceParityMismatch[],
  args: Readonly<{
    metric: CrossSurfaceParityMetric;
    stage: LoopSurface;
    telemetry: CanonicalLoopTelemetryTags;
    expected: string;
    actual: string;
    message: string;
  }>,
): void {
  mismatches.push({
    metric: args.metric,
    stage: args.stage,
    story_id: args.telemetry.story_id,
    pack_id: args.telemetry.pack_id,
    run_id: args.telemetry.run_id,
    expected: args.expected,
    actual: args.actual,
    message: args.message,
  });
}

function normalizeReasonCode(value: string | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function evaluateCrossSurfaceParity(input: CrossSurfaceParityInput): CrossSurfaceParityResult {
  const telemetry = buildCanonicalLoopTelemetry(input.context);
  const mismatches: CrossSurfaceParityMismatch[] = [];

  let readinessStateMismatchDetected = 0;
  let runContextMismatchDetected = 0;

  const listReadinessState = input.surfaces.list.readiness_state.trim();
  const detailReadinessState = input.surfaces.detail.readiness_state.trim();
  const listReasonCode = normalizeReasonCode(input.surfaces.list.readiness_reason_code);
  const detailReasonCode = normalizeReasonCode(input.surfaces.detail.readiness_reason_code);

  if (listReadinessState !== detailReadinessState || listReasonCode !== detailReasonCode) {
    readinessStateMismatchDetected += 1;
    pushMismatch(mismatches, {
      metric: "readiness_state_mismatch_detected",
      stage: "detail",
      telemetry: telemetry.detail,
      expected: JSON.stringify({
        readiness_state: listReadinessState,
        readiness_reason_code: listReasonCode || null,
      }),
      actual: JSON.stringify({
        readiness_state: detailReadinessState,
        readiness_reason_code: detailReasonCode || null,
      }),
      message: "Readiness contract mismatch between list and detail surfaces.",
    });
  }

  const expectedRunId = telemetry.run.run_id;
  const runIdBySurface: Array<{ stage: "run" | "report" | "export"; runId: string }> = [
    { stage: "run", runId: input.surfaces.run.run_id },
    { stage: "report", runId: input.surfaces.report.run_id },
    { stage: "export", runId: input.surfaces.export.run_id },
  ];

  for (const item of runIdBySurface) {
    if (item.runId === expectedRunId) continue;
    runContextMismatchDetected += 1;
    pushMismatch(mismatches, {
      metric: "run_context_mismatch_detected",
      stage: item.stage,
      telemetry: telemetry[item.stage],
      expected: expectedRunId,
      actual: item.runId,
      message: `Run context drift on ${item.stage} surface.`,
    });
  }

  return {
    telemetry,
    metrics: {
      readiness_state_mismatch_detected: readinessStateMismatchDetected,
      run_context_mismatch_detected: runContextMismatchDetected,
    },
    mismatches,
  };
}

export function assertSmokeReadinessParity(result: Pick<CrossSurfaceParityResult, "metrics" | "mismatches">): void {
  if (result.metrics.readiness_state_mismatch_detected <= 0) return;

  const mismatch =
    result.mismatches.find((candidate) => candidate.metric === "readiness_state_mismatch_detected") ??
    result.mismatches[0];

  const detail = mismatch
    ? `stage=${mismatch.stage} story_id=${mismatch.story_id} pack_id=${mismatch.pack_id} run_id=${mismatch.run_id}`
    : "stage=unknown story_id=unknown pack_id=unknown run_id=unknown";

  throw new Error(
    `SMOKE_PARITY_FAILED readiness_state_mismatch_detected=${result.metrics.readiness_state_mismatch_detected} ${detail}`,
  );
}
