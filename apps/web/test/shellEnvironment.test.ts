import { describe, expect, it } from "vitest";

import { resolveShellEnvironment } from "../app/(app)/matters/shellEnvironment";

describe("US-001 shell environment contract", () => {
  it("maps dev demo mode to demo-dev", () => {
    expect(resolveShellEnvironment("dev", true)).toEqual({
      label: "demo-dev",
      badgeVariant: "warning",
    });
  });

  it("maps demo-prod mode to demo-prod", () => {
    expect(resolveShellEnvironment("demo-prod", false)).toEqual({
      label: "demo-prod",
      badgeVariant: "warning",
    });
  });

  it("falls back deterministically for non-demo modes", () => {
    expect(resolveShellEnvironment("dev", false)).toEqual({
      label: "dev",
      badgeVariant: "muted",
    });
    expect(resolveShellEnvironment("prod", false)).toEqual({
      label: "production",
      badgeVariant: "muted",
    });
  });
});
