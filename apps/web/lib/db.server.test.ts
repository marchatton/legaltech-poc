import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ensureAllSchemasMock = vi.fn(async () => undefined);
const postgresMock = vi.fn(() => vi.fn());

vi.mock("postgres", () => ({
  default: postgresMock,
}));

vi.mock("./db/schema/index.server", () => ({
  ensureAllSchemas: ensureAllSchemasMock,
}));

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;
const mutableEnv = process.env as Record<string, string | undefined>;

function resetDbGlobals(): void {
  const g = globalThis as typeof globalThis & {
    __orbitalSql?: unknown;
    __orbitalSchemaReady?: Promise<void>;
  };
  delete g.__orbitalSql;
  delete g.__orbitalSchemaReady;
}

describe("ensureSchema", () => {
  beforeEach(() => {
    vi.resetModules();
    ensureAllSchemasMock.mockReset();
    postgresMock.mockReset();
    process.env.DATABASE_URL = "postgresql://orbital:orbital@localhost:5432/orbital";
    resetDbGlobals();
  });

  afterEach(() => {
    if (ORIGINAL_NODE_ENV === undefined) delete mutableEnv.NODE_ENV;
    else mutableEnv.NODE_ENV = ORIGINAL_NODE_ENV;
    if (ORIGINAL_DATABASE_URL === undefined) delete mutableEnv.DATABASE_URL;
    else mutableEnv.DATABASE_URL = ORIGINAL_DATABASE_URL;
    resetDbGlobals();
  });

  it("re-runs schema ensure in development to avoid stale hot-reload cache", async () => {
    mutableEnv.NODE_ENV = "development";
    const { ensureSchema } = await import("./db.server");

    await ensureSchema();
    await ensureSchema();

    expect(ensureAllSchemasMock).toHaveBeenCalledTimes(2);
  });

  it("keeps schema ensure cached outside development", async () => {
    mutableEnv.NODE_ENV = "test";
    const { ensureSchema } = await import("./db.server");

    await ensureSchema();
    await ensureSchema();

    expect(ensureAllSchemasMock).toHaveBeenCalledTimes(1);
  });
});
