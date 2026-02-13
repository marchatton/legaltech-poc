import "server-only";

import postgres from "postgres";

import { ensureAllSchemas } from "./db/schema/index.server";

export type Sql = ReturnType<typeof postgres>;

type GlobalDb = typeof globalThis & {
  __orbitalSql?: Sql;
  __orbitalSchemaReady?: Promise<void>;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Some Sprite environments route `localhost` to an IPv6 host that Postgres
    // does not accept by default. Normalise to IPv4 for local/dev.
    if (process.env.NODE_ENV !== "production" && url.includes("@localhost:")) {
      return url.replace("@localhost:", "@127.0.0.1:");
    }
    return url;
  }

  // PoC default for local dev (matches docker-compose.yml).
  if (process.env.NODE_ENV !== "production") {
    return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
  }

  // Important: Next.js evaluates route modules at build time with
  // `NODE_ENV=production`, even when a database is not available/required.
  // Defer the hard failure until the first DB operation is attempted.
  return "";
}

function createThrowingSql(message: string): Sql {
  const err = new Error(message);
  const fn = (() => {
    throw err;
  }) as unknown as Sql;

  return new Proxy(fn, {
    apply() {
      throw err;
    },
    get(_target, prop) {
      // Ensure even helper calls like `sql.json()` fail loudly and consistently.
      if (prop === "unsafe") return createThrowingSql(message);
      return new Proxy(() => {
        throw err;
      }, {
        apply() {
          throw err;
        },
      });
    },
  });
}

function createSql(): Sql {
  const url = databaseUrl();
  if (!url) {
    return createThrowingSql("DATABASE_URL is required in production.");
  }

  return postgres(url, {
    // Keep the pool small; Next dev reloads modules frequently.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const g = globalThis as GlobalDb;

function getSql(): Sql {
  if (!g.__orbitalSql) g.__orbitalSql = createSql();
  return g.__orbitalSql;
}

// Lazy, build-safe SQL client.
// Next.js may import route modules during `next build` without runtime env vars.
export const sql: Sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_target, _thisArg, argArray) {
    const real = getSql() as unknown as (...args: unknown[]) => unknown;
    return real(...argArray);
  },
  get(_target, prop) {
    const real = getSql() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

async function ensureSchemaInner(): Promise<void> {
  await ensureAllSchemas(sql);
}

function shouldEnsureSchemaEveryCall(): boolean {
  return process.env.ORBITAL_SCHEMA_ENSURE_MODE === "always";
}

export async function ensureSchema(): Promise<void> {
  // Escape hatch for schema-authoring sessions where forcing DDL on each call
  // is desirable. Normal dev/runtime should cache to avoid request stalls.
  if (shouldEnsureSchemaEveryCall()) {
    await ensureSchemaInner();
    return;
  }

  if (!g.__orbitalSchemaReady) {
    g.__orbitalSchemaReady = ensureSchemaInner().catch((error) => {
      // Allow a clean retry after transient bootstrapping failures.
      delete g.__orbitalSchemaReady;
      throw error;
    });
  }
  await g.__orbitalSchemaReady;
}
