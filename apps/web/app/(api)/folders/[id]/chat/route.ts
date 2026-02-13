import { z } from "zod";

import { streamText } from "ai";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { chatModel } from "../../../../../lib/ai/gateway.server";
import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { primeFolderChunkEmbeddings } from "../../../../../lib/retrieval/embedChunks.server";
import { hybridSearch } from "../../../../../lib/retrieval/types";
import { isDevOrDemoProd } from "../../../../../lib/runtimeMode";
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

type CitationSnippetRow = {
  document_id: string;
  page_number: number;
  snippet: string;
};

type SourceContext = {
  documentId: string;
  pageNumber: number;
  snippet: string;
  anchorReady: boolean;
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

function shouldUseDemoFallback(): boolean {
  if (!isDevOrDemoProd()) return false;
  return !process.env.AI_GATEWAY_API_KEY?.trim();
}

async function loadCitationSnippetFallback(args: { folderId: string; limit: number }): Promise<CitationSnippetRow[]> {
  if (args.limit <= 0) return [];
  const rows = await sql<CitationSnippetRow[]>`
    SELECT c.document_id, c.page_number, c.snippet
    FROM citations c
    JOIN report_rows rr ON rr.id = c.report_row_id
    WHERE rr.folder_id = ${args.folderId}
      AND rr.run_id = (
        SELECT r.id
        FROM runs r
        WHERE r.folder_id = ${args.folderId}
        ORDER BY (CASE WHEN r.state = 'completed' THEN 1 ELSE 0 END) DESC, r.created_at DESC
        LIMIT 1
      )
    ORDER BY c.locked_at DESC
    LIMIT ${args.limit}
  `;

  const deduped: CitationSnippetRow[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const documentId = typeof row.document_id === "string" ? row.document_id.trim() : "";
    const pageNumber = Number.isInteger(row.page_number) && row.page_number > 0 ? row.page_number : 1;
    const snippet = typeof row.snippet === "string" ? row.snippet.trim() : "";
    if (!documentId || !snippet) continue;
    const key = `${documentId}:${pageNumber}:${snippet}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ document_id: documentId, page_number: pageNumber, snippet });
  }

  return deduped;
}

function ndjsonStream(args: {
  traceId: string;
  folderId: string;
  message: string;
  indexVersion: string;
  abortSignal: AbortSignal;
  fallbackToMissingEvidence: boolean;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let streamClosed = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: unknown): boolean => {
        if (streamClosed) return false;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(evt)}\n`));
          return true;
        } catch {
          // Consumer disconnected while streaming; stop emitting.
          streamClosed = true;
          return false;
        }
      };

      const close = () => {
        if (streamClosed) return;
        streamClosed = true;
        try {
          controller.close();
        } catch {
          // Ignore close failures when stream was already cancelled.
        }
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
        close();
      };

      const abortListener = () => {
        fail({ code: "ABORTED", message: "Chat request was cancelled.", retryable: true });
      };
      args.abortSignal.addEventListener("abort", abortListener, { once: true });

      try {
        if (args.abortSignal.aborted) {
          fail({ code: "ABORTED", message: "Chat request was cancelled.", retryable: true });
          return;
        }

        if (args.fallbackToMissingEvidence) {
          send({ type: "token", token: MISSING_EVIDENCE_TEXT });
          send({ type: "sources", sources: [] satisfies ChatSource[] });
          send({ type: "done", status: "complete" });
          close();
          return;
        }

        const semanticPrime = await primeFolderChunkEmbeddings({
          folderId: args.folderId,
          indexVersion: args.indexVersion,
          traceId: args.traceId,
        });
        if (semanticPrime.embedded > 0) {
          // eslint-disable-next-line no-console
          console.info("chat.semantic_prime_folder", {
            trace_id: args.traceId,
            folder_id: args.folderId,
            index_version: args.indexVersion,
            attempted: semanticPrime.attempted,
            embedded: semanticPrime.embedded,
          });
        }

        const hits = await hybridSearch({
          folderId: args.folderId,
          indexVersion: args.indexVersion,
          queryText: args.message,
          opts: { kFinal: 6 },
        });

        let contexts: SourceContext[] = [];
        if (hits.length > 0) {
          const chunkIds = hits.map((h) => h.chunk_id);
          const chunkRows = await sql<ChunkRow[]>`
            SELECT id, document_id, page_start, page_end, text
            FROM chunks
            WHERE id = ANY(${chunkIds})
          `;
          const chunkById = new Map<string, ChunkRow>(chunkRows.map((c) => [c.id, c]));
          contexts = hits.map((h) => {
            const c = chunkById.get(h.chunk_id);
            const documentId = c?.document_id ?? h.document_id;
            const anchorPage = c?.page_start ?? h.page_start ?? h.page_end ?? null;
            const anchorReady = typeof anchorPage === "number" && Number.isInteger(anchorPage) && anchorPage > 0;
            const pageNumber = anchorReady ? anchorPage : 1;
            const snippet = (c?.text ?? "").trim().slice(0, 1200);
            return { documentId, pageNumber, snippet, anchorReady };
          });
        } else {
          const citationSnippets = await loadCitationSnippetFallback({ folderId: args.folderId, limit: 6 });
          contexts = citationSnippets.map((row) => ({
            documentId: row.document_id,
            pageNumber: row.page_number,
            snippet: row.snippet.slice(0, 1200),
            anchorReady: true,
          }));
        }

        if (contexts.length === 0) {
          send({ type: "token", token: MISSING_EVIDENCE_TEXT });
          send({ type: "sources", sources: [] satisfies ChatSource[] });
          send({ type: "done", status: "complete" });
          close();
          return;
        }

        const sources: ChatSource[] = [];
        const sourceLines: string[] = [];

        contexts.forEach((ctx, idx) => {
          sources.push(
            ctx.anchorReady
              ? {
                  document_id: ctx.documentId,
                  page_number: ctx.pageNumber,
                  anchor_state: "ready",
                }
              : {
                  document_id: ctx.documentId,
                  page_number: ctx.pageNumber,
                  anchor_state: "unavailable",
                  anchor_reason: "Source anchor is unavailable for this citation.",
                },
          );
          sourceLines.push(`[S${idx + 1}] ${ctx.documentId} p.${ctx.pageNumber}\n${ctx.snippet}`);
        });

        const system =
          `Answer using only the provided sources.\n` +
          `If the answer is not supported by the sources, respond exactly with: ${JSON.stringify(MISSING_EVIDENCE_TEXT)}\n` +
          `For broad questions, synthesize across relevant sources before answering.\n` +
          `Be concise and do not invent facts.`;

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
        close();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("chat.stream_failed", { trace_id: args.traceId, message: safeErrMessage(err) });
        fail({ code: "MODEL_STREAM_FAILED", message: "Chat response failed. Please retry.", retryable: true });
      } finally {
        args.abortSignal.removeEventListener("abort", abortListener);
      }
    },
    cancel() {
      streamClosed = true;
    },
  });
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();

  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

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
      fallbackToMissingEvidence: shouldUseDemoFallback(),
    }),
    {
    status: 200,
    headers,
    },
  );
}
