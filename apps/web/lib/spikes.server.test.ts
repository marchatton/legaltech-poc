import { afterEach, describe, expect, it } from "vitest";

import { assertSpikesEnabled } from "./spikes.server";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_ORBITAL_MODE = process.env.ORBITAL_MODE;
const ORIGINAL_SPIKES_ENABLED = process.env.SPIKES_ENABLED;

function restoreEnv(): void {
  // Some environments (and/or type defs) treat `process.env` as readonly.
  const env = process.env as Record<string, string | undefined>;

  if (ORIGINAL_NODE_ENV === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = ORIGINAL_NODE_ENV;

  if (ORIGINAL_ORBITAL_MODE === undefined) delete env.ORBITAL_MODE;
  else env.ORBITAL_MODE = ORIGINAL_ORBITAL_MODE;

  if (ORIGINAL_SPIKES_ENABLED === undefined) delete env.SPIKES_ENABLED;
  else env.SPIKES_ENABLED = ORIGINAL_SPIKES_ENABLED;
}

afterEach(() => {
  restoreEnv();
});

describe("assertSpikesEnabled", () => {
  it("allows spikes only when dev + SPIKES_ENABLED=1", () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = "development";
    delete env.ORBITAL_MODE;
    env.SPIKES_ENABLED = "1";

    expect(assertSpikesEnabled("t1", new Headers())).toBeNull();
  });

  it("blocks spikes when SPIKES_ENABLED is not set, even in dev", async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = "development";
    delete env.ORBITAL_MODE;
    delete env.SPIKES_ENABLED;

    const res = assertSpikesEnabled("t1", new Headers());
    expect(res?.status).toBe(404);

    const json = await res?.json();
    expect(json).toMatchObject({ error: { code: "NOT_FOUND" } });
  });

  it("blocks spikes in demo-prod even if SPIKES_ENABLED=1", async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = "development";
    env.ORBITAL_MODE = "demo-prod";
    env.SPIKES_ENABLED = "1";

    const res = assertSpikesEnabled("t1", new Headers());
    expect(res?.status).toBe(404);

    const json = await res?.json();
    expect(json).toMatchObject({ error: { code: "NOT_FOUND" } });
  });

  it("blocks spikes if ORBITAL_MODE=dev on a non-dev build", async () => {
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = "production";
    env.ORBITAL_MODE = "dev";
    env.SPIKES_ENABLED = "1";

    const res = assertSpikesEnabled("t1", new Headers());
    expect(res?.status).toBe(404);

    const json = await res?.json();
    expect(json).toMatchObject({ error: { code: "NOT_FOUND" } });
  });
});
