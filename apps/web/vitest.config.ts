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
    // DB integration tests share a single Postgres instance; keep the runner
    // single-process to avoid DDL/lock contention across parallel workers.
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
