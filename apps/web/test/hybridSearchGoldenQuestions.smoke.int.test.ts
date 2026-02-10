import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hybridSearch } from "../lib/retrieval/types";
import { ensureAllSchemas } from "../lib/db/schema/index.server";

type GoldenQuestion = {
  id: string;
  queryText: string;
  expectedDocKey: "alpha" | "beta";
  expectedPage: number;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function loadGoldenQuestions(): GoldenQuestion[] {
  const url = new URL("./fixtures/retrieval_golden_questions.v0.json", import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as GoldenQuestion[];
}

describe("hybridSearch golden questions (smoke)", () => {
  const url = databaseUrl();
  const db = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  beforeAll(async () => {
    await ensureAllSchemas(db);
    // Ensure hybridSearch() uses the same database as this test.
    process.env.DATABASE_URL = url;
  });

  afterAll(async () => {
    await db.end({ timeout: 2 });
  });

  it("returns expected doc/page in top K for seeded folder", async () => {
    const folderId = `fld_${randomUUID()}`;
    const indexVersion = "v1";

    const docIds = {
      alpha: `doc_${randomUUID()}`,
      beta: `doc_${randomUUID()}`,
    } as const;

    await db`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'retrieval golden smoke', 'ready')`;
    await db`
      INSERT INTO documents (id, folder_id, filename, mime, bytes, parse_status, ocr_status)
      VALUES (${docIds.alpha}, ${folderId}, 'alpha.pdf', 'application/pdf', 0, 'parsed', 'done'),
             (${docIds.beta}, ${folderId}, 'beta.pdf', 'application/pdf', 0, 'parsed', 'done')
    `;

    // Seed small, unambiguous chunks so lexical retrieval is stable.
    await db`
      INSERT INTO chunks (
        id,
        document_id,
        index_version,
        chunk_index,
        page_start,
        page_end,
        text,
        metadata_json,
        text_hash,
        created_at
      )
      VALUES
        (
          ${`chk_${randomUUID()}`},
          ${docIds.alpha},
          ${indexVersion},
          0,
          2,
          2,
          'Survey exceptions include flood, fire, and termite damage.',
          ${db.json({})},
          'h_alpha_0',
          now()
        ),
        (
          ${`chk_${randomUUID()}`},
          ${docIds.beta},
          ${indexVersion},
          0,
          1,
          1,
          'Certification parties: Buyer, Seller, and Escrow Agent.',
          ${db.json({})},
          'h_beta_0',
          now()
        ),
        (
          ${`chk_${randomUUID()}`},
          ${docIds.beta},
          ${indexVersion},
          1,
          3,
          3,
          'Instrument No. 2020-ABCD-1234 is recorded in the public record.',
          ${db.json({})},
          'h_beta_1',
          now()
        )
    `;

    try {
      const golden = loadGoldenQuestions();
      expect(golden.length).toBeGreaterThanOrEqual(3);
      expect(golden.length).toBeLessThanOrEqual(10);

      for (const q of golden) {
        const hitsA = await hybridSearch({
          folderId,
          indexVersion,
          queryText: q.queryText,
          // CI-safe: do not require embeddings provider configuration.
          opts: { kLex: 20, kSem: 0, kFinal: 10 },
        });
        const hitsB = await hybridSearch({
          folderId,
          indexVersion,
          queryText: q.queryText,
          opts: { kLex: 20, kSem: 0, kFinal: 10 },
        });

        // Determinism: same state + same query => same ordered hits.
        expect(hitsB).toEqual(hitsA);

        const expectedDocId = docIds[q.expectedDocKey];
        const found = hitsA.some((h) => h.document_id === expectedDocId && (h.page_start === q.expectedPage || h.page_end === q.expectedPage));
        expect(found, `golden ${q.id} expected ${q.expectedDocKey} page ${q.expectedPage}`).toBe(true);
      }
    } finally {
      // Cascade deletes clear documents + chunks.
      await db`DELETE FROM folders WHERE id = ${folderId}`;
    }
  }, 20_000);
});

