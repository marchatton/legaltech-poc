import { afterEach, describe, expect, it } from "vitest";

const ORIGINAL_ORBITAL_MODE = process.env.ORBITAL_MODE;

afterEach(() => {
  if (ORIGINAL_ORBITAL_MODE === undefined) delete process.env.ORBITAL_MODE;
  else process.env.ORBITAL_MODE = ORIGINAL_ORBITAL_MODE;
});

describe("demo-prod JSON Content-Type enforcement", () => {
  it("rejects POST /folders/:id/runs when Content-Type is not application/json", async () => {
    process.env.ORBITAL_MODE = "demo-prod";
    const { POST } = await import("../app/(api)/folders/[id]/runs/route");

    const res = await POST(
      new Request("http://localhost/folders/fld_test/runs", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ type: "quick_start_title_survey" }),
      }),
      { params: Promise.resolve({ id: "fld_test" }) },
    );

    expect(res.status).toBe(415);
    const json = (await res.json().catch(() => null)) as any;
    expect(json?.error?.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("rejects POST /demo/load-pack when Content-Type is not application/json", async () => {
    process.env.ORBITAL_MODE = "demo-prod";
    const { POST } = await import("../app/(api)/demo/load-pack/route");

    const res = await POST(
      new Request("http://localhost/demo/load-pack", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ pack_id: "pack_01_clean" }),
      }),
    );

    expect(res.status).toBe(415);
    const json = (await res.json().catch(() => null)) as any;
    expect(json?.error?.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });
});

