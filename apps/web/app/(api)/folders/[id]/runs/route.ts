import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { newId } from "../../../../../lib/ids";
import { assertJsonContentType } from "../../../../../lib/jsonContentType";
import { loadQuestionSetV1 } from "../../../../../lib/questionSet.server";
import { resolveCanonicalReadiness } from "../../../../../lib/readinessContract.server";
import { transitionRunState } from "../../../../../lib/runLifecycle.server";
import { createTraceContext } from "../../../../../lib/trace.server";
import { kickInlineWdkWorker } from "../../../../../lib/wdk/wdkInlineKick.server";
import { quickStartStepHandlers } from "../../../../../steps/quickStartStepHandlers.server";
import { startQuickStartTitleSurveyWorkflow } from "../../../../../workflows/quickStartTitleSurveyWorkflow.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  type: z.enum(["quick_start_title_survey"]),
});

const IdempotencyKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9._:-]+$/, "Invalid Idempotency-Key");

const RUN_SELECTOR_LIMIT = 25;
const RUN_START_LOCK_NAMESPACE = 32_011;

function agentBundleVersion(): string {
  const configured =
    process.env.ORBITAL_AGENT_BUNDLE_VERSION?.trim() ??
    process.env.AGENT_BUNDLE_VERSION?.trim() ??
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ??
    "";
  if (!configured) return "git:dev";
  if (/^[a-f0-9]{7,40}$/i.test(configured)) return `git:${configured.slice(0, 7)}`;
  return configured;
}

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type LatestRunGateRow = {
  id: string;
  state: string;
};

type RunSelectorRow = {
  id: string;
  state: string;
  created_at: Date;
  updated_at: Date;
};

type StartRunDecision =
  | { kind: "existing"; run: RunRow }
  | { kind: "not_found" }
  | { kind: "duplicate"; latestRun: LatestRunGateRow }
  | {
      kind: "blocked";
      folderState: string;
      readinessReasonCode: string;
      readinessReason: string;
      missingDocuments: string[];
    }
  | {
      kind: "created";
      runId: string;
      indexVersion: string;
      questionSetVersion: string;
      questionsTotal: number;
    };

function runsErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
}): ReturnType<typeof safeErrorEnvelope> {
  return safeErrorEnvelope({
    code: opts.code,
    message: opts.message,
    details: opts.details,
    traceId: opts.traceId,
    retryable: opts.code === "INTERNAL",
  });
}

function runResponse(row: RunRow) {
  return {
    run: {
      id: row.id,
      folder_id: row.folder_id,
      state: row.state,
      index_version: row.index_version,
      agent_bundle_version: row.agent_bundle_version,
      question_set_version: row.question_set_version,
    },
  };
}

function runStartConflictForLatestRun(state: string): string {
  if (state === "completed") {
    return "Latest analysis run already completed. Review the outputs below, or load the pack again to create a fresh matter.";
  }
  return `Analysis already ${state} for this matter. Wait for this run to finish, or load the pack again to create a fresh matter.`;
}

function runStartLockScope(args: { folderId: string; runType: string }): string {
  return `${args.folderId}:${args.runType}`;
}

async function findRunByIdempotencyKey(args: { folderId: string; idempotencyKey: string; db?: typeof sql }): Promise<RunRow | null> {
  const db = args.db ?? sql;
  const runs = await db<RunRow[]>`
    SELECT id, folder_id, state, index_version, agent_bundle_version, question_set_version
    FROM runs
    WHERE folder_id = ${args.folderId}
      AND idempotency_key = ${args.idempotencyKey}
    LIMIT 1
  `;
  return runs[0] ?? null;
}

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      runsErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const folders = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!folders[0]) {
    return Response.json(runsErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const runs = await sql<RunSelectorRow[]>`
    SELECT id, state, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND state = 'completed'
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT ${RUN_SELECTOR_LIMIT}
  `;

  return Response.json(
    {
      runs: runs.map((run) => ({
        run_id: run.id,
        status: run.state,
        created_at: run.created_at.toISOString(),
        updated_at: run.updated_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const ctGate = assertJsonContentType({ req, traceId, headers });
  if (ctGate) return ctGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      runsErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(runsErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      runsErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const rawKey = req.headers.get("Idempotency-Key");
  let idempotencyKey: string | null = null;
  if (rawKey !== null) {
    const parsedKey = IdempotencyKeySchema.safeParse(rawKey);
    if (!parsedKey.success) {
      return Response.json(
        runsErrorEnvelope({
          code: "VALIDATION_ERROR",
          message: "Invalid Idempotency-Key header.",
          details: parsedKey.error.flatten(),
          traceId,
        }),
        { status: 400, headers },
      );
    }
    idempotencyKey = parsedKey.data;

    const existing = await findRunByIdempotencyKey({ folderId: parsedParams.data.id, idempotencyKey });
    if (existing) return Response.json(runResponse(existing), { status: 200, headers });
  }

  const folderId = parsedParams.data.id;
  const runType = parsedBody.data.type;
  const agentVersion = agentBundleVersion();
  const lockScope = runStartLockScope({ folderId, runType });

  let startDecision: StartRunDecision;
  try {
    startDecision = await sql.begin(async (tx) => {
      // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
      const t = tx as unknown as typeof sql;
      await t`SELECT pg_advisory_xact_lock(${RUN_START_LOCK_NAMESPACE}, hashtext(${lockScope}))`;

      if (idempotencyKey) {
        const existing = await findRunByIdempotencyKey({ folderId, idempotencyKey, db: t });
        if (existing) return { kind: "existing", run: existing } as const;
      }

      const folders = await t<{ id: string; name: string; state: string; latest_index_version: string }[]>`
        SELECT id, name, state, latest_index_version
        FROM folders
        WHERE id = ${folderId}
        LIMIT 1
      `;
      if (!folders[0]) return { kind: "not_found" } as const;

      const latestRuns = await t<LatestRunGateRow[]>`
        SELECT id, state
        FROM runs
        WHERE folder_id = ${folderId}
          AND type = ${runType}
        ORDER BY created_at DESC, updated_at DESC, id DESC
        LIMIT 1
      `;
      const latestRun = latestRuns[0] ?? null;
      if (latestRun) return { kind: "duplicate", latestRun } as const;

      // Keep folder state consistent with latest persisted facts before enforcing runnable preconditions.
      await refreshFolderState(folderId);

      const refreshed = await t<{ name: string; state: string; latest_index_version: string }[]>`
        SELECT name, state, latest_index_version
        FROM folders
        WHERE id = ${folderId}
        LIMIT 1
      `;
      const folder = refreshed[0];
      if (!folder) return { kind: "not_found" } as const;

      const docs = await t<Array<{ filename: string }>>`
        SELECT filename
        FROM documents
        WHERE folder_id = ${folderId}
      `;
      const readiness = resolveCanonicalReadiness({
        folderState: folder.state,
        folderName: folder.name,
        documentFilenames: docs.map((doc) => doc.filename),
      });

      if (readiness.state !== "runnable") {
        return {
          kind: "blocked",
          folderState: folder.state,
          readinessReasonCode: readiness.reason_code,
          readinessReason: readiness.reason,
          missingDocuments: readiness.missing_documents,
        } as const;
      }

      const { version: questionSetVersion, questionSet } = await loadQuestionSetV1();

      const runId = newId("run");
      const indexVersion = folder.latest_index_version;
      const questionsTotal = questionSet.questions.length;
      try {
        await t`
          INSERT INTO runs (
            id,
            folder_id,
            type,
            state,
            index_version,
            agent_bundle_version,
            question_set_version,
            idempotency_key,
            trace_id,
            questions_total,
            questions_done,
            created_at,
            updated_at
          )
          VALUES (
            ${runId},
            ${folderId},
            ${runType},
            'queued',
            ${indexVersion},
            ${agentVersion},
            ${questionSetVersion},
            ${idempotencyKey},
            ${traceId},
            ${questionsTotal},
            0,
            now(),
            now()
          )
        `;
      } catch (err: unknown) {
        // Idempotency-key races should return the previously created run.
        const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
        if (idempotencyKey && code === "23505") {
          const existing = await findRunByIdempotencyKey({ folderId, idempotencyKey, db: t });
          if (existing) return { kind: "existing", run: existing } as const;
        }
        throw err;
      }

      return {
        kind: "created",
        runId,
        indexVersion,
        questionSetVersion,
        questionsTotal,
      } as const;
    });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error("runs.start failed", {
      trace_id: traceId,
      folder_id: folderId,
      run_type: runType,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(runsErrorEnvelope({ code: "INTERNAL", message: "Failed to start run.", traceId }), {
      status: 500,
      headers,
    });
  }

  if (startDecision.kind === "existing") return Response.json(runResponse(startDecision.run), { status: 200, headers });

  if (startDecision.kind === "not_found") {
    return Response.json(runsErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (startDecision.kind === "duplicate") {
    return Response.json(
      runsErrorEnvelope({
        code: "CONFLICT",
        message: runStartConflictForLatestRun(startDecision.latestRun.state),
        details: {
          run_id: startDecision.latestRun.id,
          run_state: startDecision.latestRun.state,
        },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  if (startDecision.kind === "blocked") {
    return Response.json(
      runsErrorEnvelope({
        code: "CONFLICT",
        message: startDecision.readinessReason,
        details: {
          folder_state: startDecision.folderState,
          readiness_reason_code: startDecision.readinessReasonCode,
          readiness_reason: startDecision.readinessReason,
          missing_documents: startDecision.missingDocuments,
        },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  const { runId, indexVersion, questionSetVersion, questionsTotal } = startDecision;

  const stepId = newId("stp");
  const stepKey = `quick_start:${questionSetVersion}:start`;
  await sql`
    INSERT INTO run_steps (
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      trace_id,
      question_id,
      created_at,
      updated_at
    )
    VALUES (
      ${stepId},
      ${runId},
      'workflow_start',
      'succeeded',
      1,
      ${stepKey},
      ${traceId},
      NULL,
      now(),
      now()
    )
    ON CONFLICT (run_id, step_key) DO NOTHING
  `;

  // eslint-disable-next-line no-console
  console.info("run.created", {
    orchestration: "wdk",
    trace_id: traceId,
    folder_id: folderId,
    run_id: runId,
    step_key: stepKey,
    run_type: runType,
    index_version: indexVersion,
    agent_bundle_version: agentVersion,
    question_set_version: questionSetVersion,
    questions_total: questionsTotal,
  });

  let scheduled: Awaited<ReturnType<typeof startQuickStartTitleSurveyWorkflow>>;
  try {
    scheduled = await startQuickStartTitleSurveyWorkflow({
      runId,
      questionSetVersion,
      traceId,
      db: sql,
    });
  } catch (err: unknown) {
    await transitionRunState({
      runId,
      to: "failed",
      errorJson: {
        code: "WORKFLOW_SCHEDULE_FAILED",
        message: "Failed to schedule analysis workflow steps.",
      },
      db: sql,
    });
    // eslint-disable-next-line no-console
    console.error("wdk.workflow_schedule_failed", {
      trace_id: traceId,
      run_id: runId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(runsErrorEnvelope({ code: "INTERNAL", message: "Failed to schedule run.", traceId }), {
      status: 500,
      headers,
    });
  }

  const runningTransition = await transitionRunState({ runId, to: "running", clearError: true, db: sql });
  if (!runningTransition.ok) {
    // eslint-disable-next-line no-console
    console.error("run.transition_to_running_failed", {
      trace_id: traceId,
      run_id: runId,
      reason: runningTransition.reason,
      current_state: runningTransition.currentState,
    });
    return Response.json(runsErrorEnvelope({ code: "INTERNAL", message: "Failed to initialize run state.", traceId }), {
      status: 500,
      headers,
    });
  }

  const created: RunRow = {
    id: runId,
    folder_id: folderId,
    state: "running",
    index_version: indexVersion,
    agent_bundle_version: agentVersion,
    question_set_version: questionSetVersion,
  };
  const insertedSteps = scheduled.steps.reduce((acc, s) => acc + (s.inserted ? 1 : 0), 0);

  // eslint-disable-next-line no-console
  console.info("wdk.workflow_scheduled", {
    orchestration: "wdk",
    trace_id: traceId,
    run_id: runId,
    workflow_type: runType,
    step_type: scheduled.stepType,
    steps_total: scheduled.steps.length,
    steps_inserted: insertedSteps,
  });

  // Local development fallback: drain freshly scheduled steps inline so Quick
  // Start progresses without requiring a separate worker process.
  kickInlineWdkWorker({ handlers: quickStartStepHandlers, runId, maxSteps: Math.max(25, questionsTotal) });

  return Response.json(runResponse(created), { status: 200, headers });
}
