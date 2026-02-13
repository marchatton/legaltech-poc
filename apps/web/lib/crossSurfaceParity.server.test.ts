import { describe, expect, it } from "vitest";

import { assertSmokeReadinessParity, evaluateCrossSurfaceParity, type CrossSurfaceParityInput } from "./crossSurfaceParity.server";

const BASE_INPUT: CrossSurfaceParityInput = {
  context: {
    story_id: "US-012",
    pack_id: "pack_09_bad_citation",
    run_id: "run_us012_001",
  },
  surfaces: {
    list: {
      readiness_state: "runnable",
      readiness_reason_code: "READY",
    },
    detail: {
      readiness_state: "runnable",
      readiness_reason_code: "READY",
    },
    run: {
      run_id: "run_us012_001",
    },
    report: {
      run_id: "run_us012_001",
    },
    export: {
      run_id: "run_us012_001",
    },
  },
};

describe("cross-surface parity telemetry", () => {
  it("uses canonical telemetry tags across list/detail/run/report/export", () => {
    const result = evaluateCrossSurfaceParity(BASE_INPUT);

    expect(result.telemetry.list).toEqual({
      stage: "list",
      story_id: "US-012",
      pack_id: "pack_09_bad_citation",
      run_id: "run_us012_001",
    });
    expect(result.telemetry.detail).toEqual({
      stage: "detail",
      story_id: "US-012",
      pack_id: "pack_09_bad_citation",
      run_id: "run_us012_001",
    });
    expect(result.telemetry.run).toEqual({
      stage: "run",
      story_id: "US-012",
      pack_id: "pack_09_bad_citation",
      run_id: "run_us012_001",
    });
    expect(result.telemetry.report).toEqual({
      stage: "report",
      story_id: "US-012",
      pack_id: "pack_09_bad_citation",
      run_id: "run_us012_001",
    });
    expect(result.telemetry.export).toEqual({
      stage: "export",
      story_id: "US-012",
      pack_id: "pack_09_bad_citation",
      run_id: "run_us012_001",
    });
  });

  it("keeps parity counters at zero when list/detail/run/report/export stay aligned", () => {
    const result = evaluateCrossSurfaceParity(BASE_INPUT);

    expect(result.metrics).toEqual({
      readiness_state_mismatch_detected: 0,
      run_context_mismatch_detected: 0,
    });
    expect(result.mismatches).toEqual([]);
    expect(() => assertSmokeReadinessParity(result)).not.toThrow();
  });

  it("fails verification with exact stage and story on readiness mismatch", () => {
    const result = evaluateCrossSurfaceParity({
      ...BASE_INPUT,
      surfaces: {
        ...BASE_INPUT.surfaces,
        detail: {
          readiness_state: "blocked",
          readiness_reason_code: "MISSING_PREREQUISITE_DOCUMENT",
        },
      },
    });

    expect(result.metrics.readiness_state_mismatch_detected).toBe(1);
    const mismatch = result.mismatches[0];
    expect(mismatch?.metric).toBe("readiness_state_mismatch_detected");
    expect(mismatch?.stage).toBe("detail");
    expect(mismatch?.story_id).toBe("US-012");

    expect(() => assertSmokeReadinessParity(result)).toThrow(/stage=detail story_id=US-012/);
  });

  it("detects run context drift across run/report/export surfaces", () => {
    const result = evaluateCrossSurfaceParity({
      ...BASE_INPUT,
      surfaces: {
        ...BASE_INPUT.surfaces,
        report: {
          run_id: "run_wrong_context",
        },
      },
    });

    expect(result.metrics.run_context_mismatch_detected).toBe(1);
    expect(result.mismatches[0]?.metric).toBe("run_context_mismatch_detected");
    expect(result.mismatches[0]?.stage).toBe("report");
    expect(result.mismatches[0]?.expected).toBe(BASE_INPUT.context.run_id);
    expect(result.mismatches[0]?.actual).toBe("run_wrong_context");
  });
});
