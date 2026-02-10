import "server-only";

import type { Sql } from "../../db.server";

import { ensureChatSchema } from "./chat.server";
import { ensureCoreSchema } from "./core.server";
import { ensureRetrievalSchema } from "./retrieval.server";

const SCHEMA_ADVISORY_LOCK_KEY1 = 11_011;
const SCHEMA_ADVISORY_LOCK_KEY2 = 1;

export async function ensureAllSchemas(sql: Sql): Promise<void> {
  const conn = await sql.reserve();
  try {
    // Ensure schema DDL doesn't race across parallel test workers / dev servers.
    await conn`SELECT pg_advisory_lock(${SCHEMA_ADVISORY_LOCK_KEY1}, ${SCHEMA_ADVISORY_LOCK_KEY2})`;
    try {
      await ensureCoreSchema(conn as unknown as Sql);
      await ensureRetrievalSchema(conn as unknown as Sql);
      await ensureChatSchema(conn as unknown as Sql);
    } finally {
      await conn`SELECT pg_advisory_unlock(${SCHEMA_ADVISORY_LOCK_KEY1}, ${SCHEMA_ADVISORY_LOCK_KEY2})`;
    }
  } finally {
    conn.release();
  }
}

export { ensureCoreSchema } from "./core.server";
export { ensureRetrievalSchema } from "./retrieval.server";
export { ensureChatSchema } from "./chat.server";
