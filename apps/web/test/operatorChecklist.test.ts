import { describe, expect, it } from "vitest";

import { deriveOperatorChecklistSteps, formatOperatorElapsedLabel } from "../app/(app)/matters/[id]/operatorChecklist";

describe("operator checklist derivation", () => {
  it("returns all todo steps when no run exists", () => {
    const steps = deriveOperatorChecklistSteps(null);

    expect(steps.map((step) => step.state)).toEqual(["todo", "todo", "todo"]);
    expect(formatOperatorElapsedLabel(null)).toBe("Elapsed unavailable");
  });

  it("marks run phase as in progress when run is active", () => {
    const signal = {
      state: "running",
      createdAt: new Date("2026-02-11T10:00:00.000Z"),
      updatedAt: new Date("2026-02-11T10:02:00.000Z"),
      startedAt: null,
    };
    const now = new Date("2026-02-11T10:07:59.000Z");

    const steps = deriveOperatorChecklistSteps(signal);

    expect(steps.map((step) => step.state)).toEqual(["done", "in_progress", "todo"]);
    expect(formatOperatorElapsedLabel(signal, now)).toBe("7m elapsed");
  });

  it("marks completion done and freezes elapsed at updated_at for terminal states", () => {
    const signal = {
      state: "completed",
      createdAt: new Date("2026-02-11T10:00:00.000Z"),
      updatedAt: new Date("2026-02-11T10:12:11.000Z"),
      startedAt: new Date("2026-02-11T10:02:00.000Z"),
    };
    const now = new Date("2026-02-11T10:45:00.000Z");

    const steps = deriveOperatorChecklistSteps(signal);

    expect(steps.map((step) => step.state)).toEqual(["done", "done", "done"]);
    expect(formatOperatorElapsedLabel(signal, now)).toBe("10m elapsed");
  });

  it("keeps completion todo for failed terminal runs", () => {
    const signal = {
      state: "failed",
      createdAt: new Date("2026-02-11T10:00:00.000Z"),
      updatedAt: new Date("2026-02-11T10:03:00.000Z"),
      startedAt: null,
    };

    const steps = deriveOperatorChecklistSteps(signal);

    expect(steps.map((step) => step.state)).toEqual(["done", "done", "todo"]);
  });

  it("returns elapsed unavailable when timestamp baseline is missing", () => {
    const signal = {
      state: "running",
      createdAt: null,
      updatedAt: new Date("2026-02-11T10:03:00.000Z"),
      startedAt: null,
    };

    expect(formatOperatorElapsedLabel(signal, new Date("2026-02-11T10:04:00.000Z"))).toBe("Elapsed unavailable");
  });
});
