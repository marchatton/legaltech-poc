import "server-only";

import type { Sql } from "../../db.server";

export async function ensureChatSchema(_sql: Sql): Promise<void> {
  // PR0: no chat tables yet. PRD B owns this module.
}

