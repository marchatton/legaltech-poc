import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { ensureSchema, sql } from "../lib/db.server";
import { processDocumentIngest } from "../lib/ingest/ingestProcessor.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  document_id: z.string().min(1),
  trace_id: z.string().min(1).nullable().optional(),
  run_id: z.string().min(1).optional(),
});

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function ingestDocumentProcessStep(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);
  const documentId = input.document_id;

  try {
    await processDocumentIngest(documentId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("document.ingest.step_failed", {
      document_id: documentId,
      run_id: args.step.run_id,
      step_key: args.step.step_key,
      attempt: args.step.attempt,
      message: safeErrMessage(err),
    });
    throw err;
  }

  if (!args.db) await ensureSchema();
  const s = args.db ?? sql;

  await s`UPDATE runs SET state = 'completed', updated_at = now() WHERE id = ${args.step.run_id}`;

  // eslint-disable-next-line no-console
  console.info("document.ingest.step_succeeded", {
    document_id: documentId,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    attempt: args.step.attempt,
  });

  return {
    output: {
      step: "ingest_document.process",
      document_id: documentId,
      run_id: args.step.run_id,
      worker_id: args.workerId,
      attempt: args.step.attempt,
      trace_id: input.trace_id ?? null,
    },
  };
}

