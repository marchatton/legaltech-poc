import { z } from "zod";

import { streamText } from "ai";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { chatModel } from "../../../../../lib/ai/gateway.server";
import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { hybridSearch } from "../../../../../lib/retrieval/types";
import { createTraceContext } from "../../../../../lib/trace.server";
import { MISSING_EVIDENCE_TEXT, type ChatSource } from "../../../../../lib/chat/protocol";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1).max(200),
});

const BodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

type FolderRow = {
  latest_index_version: string;
};

type ChunkRow = {
  id: string;
  document_id: string;
  page_start: number | null;
  page_end: number | null;
  text: string;
};

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function chatErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
  retryable?: boolean;
}): ReturnType<typeof safeErrorEnvelope> {
  return safeErrorEnvelope({
    code: opts.code,
    message: opts.message,
    details: opts.details,
    traceId: opts.traceId,
    retryable: opts.retryable ?? opts.code === "INTERNAL",
  });
}

function ndjsonStream(args: {
  traceId: string;
  folderId: string;
  message: string;
  indexVersion: string;
  abortSignal: AbortSignal;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(evt)}\n`));
      };

      // Ensure the client sees a started stream even if the model call fails
      // before producing any tokens.
      send({ type: "meta", trace_id: args.traceId });

      let terminalSent = false;
      const fail = (opts: { code: string; message: string; retryable: boolean }) => {
        if (terminalSent) return;
        terminalSent = true;
        send({
          type: "error",
          status: "citation_failed",
          code: opts.code,
          message: opts.message,
          trace_id: args.traceId,
          retryable: opts.retryable,
        });
        controller.close();
      };

      try {
        if (args.abortSignal.aborted) {
          fail({ code: "ABORTED", message: "Chat request was cancelled.", retryable: true });
          return;
        }

        const hits = await hybridSearch({
          folderId: args.folderId,
          indexVersion: args.indexVersion,
          queryText: args.message,
          opts: { kFinal: 6 },
        });

        if (hits.length === 0) {
          send({ type: "token", token: MISSING_EVIDENCE_TEXT });
          send({ type: "sources", sources: [] satisfies ChatSource[] });
          send({ type: "done", status: "complete" });
          controller.close();
          return;
        }

        const chunkIds = hits.map((h) => h.chunk_id);
        const chunkRows = await sql<ChunkRow[]>`
          SELECT id, document_id, page_start, page_end, text
          FROM chunks
          WHERE id = ANY(${chunkIds})
        `;

        const chunkById = new Map<string, ChunkRow>(chunkRows.map((c) => [c.id, c]));
        const sources: ChatSource[] = [];
        const sourceLines: string[] = [];

        hits.forEach((h, idx) => {
          const c = chunkById.get(h.chunk_id);
          const documentId = c?.document_id ?? h.document_id;
          const pageNumber = c?.page_start ?? h.page_start ?? h.page_end ?? 1;
          sources.push({ document_id: documentId, page_number: pageNumber });

          const snippet = (c?.text ?? "").trim().slice(0, 1200);
          sourceLines.push(`[S${idx + 1}] ${documentId} p.${pageNumber}\n${snippet}`);
        });

        const system =
          `Answer using only the provided sources.\n` +
          `If the answer is not supported by the sources, respond exactly with: ${JSON.stringify(MISSING_EVIDENCE_TEXT)}\n` +
          `Be concise.`;

        const user = `Question:\n${args.message}\n\nSources:\n${sourceLines.join("\n\n")}`;

        const result = streamText({
          model: chatModel(),
          system,
          messages: [{ role: "user", content: user }],
          abortSignal: args.abortSignal,
          maxRetries: 1,
        });

        for await (const delta of result.textStream) {
          send({ type: "token", token: delta });
        }

        send({ type: "sources", sources });
        send({ type: "done", status: "complete" });
        controller.close();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("chat.stream_failed", { trace_id: args.traceId, message: safeErrMessage(err) });
        fail({ code: "MODEL_STREAM_FAILED", message: "Chat response failed. Please retry.", retryable: true });
      }
    },
  });
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();

  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const chatEnabled = process.env.CHAT_ENABLED === "1";
  if (!chatEnabled) {
    return Response.json(chatErrorEnvelope({ code: "CHAT_DISABLED", message: "Chat is disabled.", traceId, retryable: false }), {
      status: 404,
      headers,
    });
  }

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      chatErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
        retryable: false,
      }),
      { status: 400, headers },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json(chatErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId, retryable: false }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(json);
  if (!parsedBody.success) {
    return Response.json(
      chatErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
        retryable: false,
      }),
      { status: 400, headers },
    );
  }

  await ensureSchema();

  const folderId = parsedParams.data.id;
  const folders = await sql<FolderRow[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return Response.json(chatErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId, retryable: false }), {
      status: 404,
      headers,
    });
  }

  headers.set("Content-Type", "application/x-ndjson; charset=utf-8");
  return new Response(
    ndjsonStream({
      traceId,
      folderId,
      message: parsedBody.data.message,
      indexVersion: folder.latest_index_version,
      abortSignal: req.signal,
    }),
    {
    status: 200,
    headers,
    },
  );
}
