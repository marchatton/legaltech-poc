import "server-only";

import type { Sql } from "../../db.server";

import { ensureChatSchema } from "./chat.server";
import { ensureCoreSchema } from "./core.server";
import { ensureRetrievalSchema } from "./retrieval.server";

export async function ensureAllSchemas(sql: Sql): Promise<void> {
  await ensureCoreSchema(sql);
  await ensureRetrievalSchema(sql);
  await ensureChatSchema(sql);
}

export { ensureCoreSchema } from "./core.server";
export { ensureRetrievalSchema } from "./retrieval.server";
export { ensureChatSchema } from "./chat.server";

