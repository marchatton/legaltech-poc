import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

describe("citations schema (one-of association)", () => {
  const url = databaseUrl();
  const sql = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  beforeAll(async () => {
    await ensureAllSchemas(sql);
  });

  afterAll(async () => {
    await sql.end({ timeout: 2 });
  });

  it("enforces report_row_id XOR chat_message_id", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;
    const reportRowId = `row_${randomUUID()}`;
    const questionId = `q_${randomUUID()}`;

    const documentId = `doc_${randomUUID()}`;
    const chatMessageId = `msg_${randomUUID()}`;
    const polygons = [[[0.1, 0.2], [0.4, 0.2], [0.4, 0.25], [0.1, 0.25]]];

    const reportCitationId = `cit_${randomUUID()}`;
    const chatCitationId = `cit_${randomUUID()}`;
    const invalidNeitherId = `cit_${randomUUID()}`;
    const invalidBothId = `cit_${randomUUID()}`;

    try {
      await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'citations test', 'empty')`;
      await sql`
        INSERT INTO runs (id, folder_id, type, state, index_version, agent_bundle_version, question_set_version)
        VALUES (${runId}, ${folderId}, 'citations_test', 'completed', 'v1', 'v0', 'v0')
      `;
      await sql`
        INSERT INTO report_rows (
          id,
          run_id,
          folder_id,
          question_set_version,
          question_id,
          question,
          answer,
          status
        )
        VALUES (
          ${reportRowId},
          ${runId},
          ${folderId},
          'v0',
          ${questionId},
          'What is the answer?',
          '42',
          'reviewed'
        )
      `;

      await sql`
        INSERT INTO citations (id, report_row_id, document_id, page_number, snippet, snippet_hash, polygons_json)
        VALUES (${reportCitationId}, ${reportRowId}, ${documentId}, 1, 'snippet', 'sha256:test', ${sql.json(polygons)})
      `;

      await sql`
        INSERT INTO citations (id, chat_message_id, document_id, page_number, snippet, snippet_hash, polygons_json)
        VALUES (${chatCitationId}, ${chatMessageId}, ${documentId}, 1, 'snippet', 'sha256:test', ${sql.json(polygons)})
      `;

      await expect(
        sql`
          INSERT INTO citations (id, document_id, page_number, snippet, snippet_hash, polygons_json)
          VALUES (${invalidNeitherId}, ${documentId}, 1, 'snippet', 'sha256:test', ${sql.json(polygons)})
        `,
      ).rejects.toMatchObject({
        code: "23514",
        message: expect.stringContaining("citations_assoc_oneof_chk"),
      });

      await expect(
        sql`
          INSERT INTO citations (
            id,
            report_row_id,
            chat_message_id,
            document_id,
            page_number,
            snippet,
            snippet_hash,
            polygons_json
          )
          VALUES (
            ${invalidBothId},
            ${reportRowId},
            ${chatMessageId},
            ${documentId},
            1,
            'snippet',
            'sha256:test',
            ${sql.json(polygons)}
          )
        `,
      ).rejects.toMatchObject({
        code: "23514",
        message: expect.stringContaining("citations_assoc_oneof_chk"),
      });

      const indexes = await sql<Array<{ indexname: string }>>`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = current_schema()
          AND tablename = 'citations'
      `;
      expect(indexes.map((i) => i.indexname)).toContain("citations_chat_message_idx");
    } finally {
      await sql`DELETE FROM citations WHERE id = ${reportCitationId}`;
      await sql`DELETE FROM citations WHERE id = ${chatCitationId}`;
      await sql`DELETE FROM report_rows WHERE id = ${reportRowId}`;
      await sql`DELETE FROM runs WHERE id = ${runId}`;
      await sql`DELETE FROM folders WHERE id = ${folderId}`;
    }
  });
});
