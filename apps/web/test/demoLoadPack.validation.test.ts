import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_PACK_ALLOWLIST } from "../lib/demoPackAllowlist";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();

vi.mock("../lib/db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

const ORIGINAL_ORBITAL_MODE = process.env.ORBITAL_MODE;

beforeEach(() => {
  vi.resetModules();
  ensureSchemaMock.mockReset();
  sqlMock.mockReset();
});

afterEach(() => {
  if (ORIGINAL_ORBITAL_MODE === undefined) delete process.env.ORBITAL_MODE;
  else process.env.ORBITAL_MODE = ORIGINAL_ORBITAL_MODE;
});

describe("demo load-pack allowlist validation", () => {
  it.each(DEMO_PACK_ALLOWLIST)("accepts allowlisted pack id %s", async (packId) => {
    process.env.ORBITAL_MODE = "demo-prod";
    const { POST } = await import("../app/(api)/demo/load-pack/route");

    const res = await POST(
      new Request("http://localhost/demo/load-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      }),
    );

    expect(res.status).not.toBe(400);
    const json = (await res.json().catch(() => null)) as any;
    expect(json?.error?.code).not.toBe("VALIDATION_ERROR");
  });

  it("rejects non-allowlisted pack ids before touching matter DB flow", async () => {
    process.env.ORBITAL_MODE = "demo-prod";
    const { POST } = await import("../app/(api)/demo/load-pack/route");

    const res = await POST(
      new Request("http://localhost/demo/load-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: "pack_99_not_allowlisted" }),
      }),
    );

    expect(res.status).toBe(400);
    const json = (await res.json().catch(() => null)) as any;
    expect(json?.error?.code).toBe("VALIDATION_ERROR");
    expect(ensureSchemaMock).not.toHaveBeenCalled();
    expect(sqlMock).not.toHaveBeenCalled();
  });
});
