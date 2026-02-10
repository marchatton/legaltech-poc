import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./test/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    // These tests share a single Postgres instance. Running test files in
    // parallel can cause DDL lock contention during schema ensures, which makes
    // DB-backed queue tests flaky.
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
