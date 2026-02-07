import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  pack_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
});

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body." }), {
      status: 400,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
      }),
      { status: 400 },
    );
  }

  const snapshot = loadSeedSnapshot(parsed.data.pack_id);
  if (!snapshot) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Seed snapshot not found." }), {
      status: 404,
    });
  }

  const failed = snapshot.rows.filter((r) => r.status === "citation_failed").length;
  if (failed > 0) {
    return Response.json(
      safeErrorEnvelope({
        code: "EXPORT_BLOCKED",
        message: `Export blocked: ${failed} row(s) are citation_failed.`,
        details: { citation_failed_count: failed },
      }),
      { status: 409 },
    );
  }

  const header = ["question_id", "question", "answer", "status", "citation_ids"].join(",");
  const lines = snapshot.rows.map((r) =>
    [
      csvEscape(r.question_id),
      csvEscape(r.question),
      csvEscape(r.answer),
      csvEscape(r.status),
      csvEscape(r.citation_ids.join(" ")),
    ].join(","),
  );
  const csv = [header, ...lines].join("\n") + "\n";

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${parsed.data.pack_id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
