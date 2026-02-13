import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readOvernightCheckpoint, runOvernightStoryLoop, type OvernightStory } from "../lib/overnightLoopCheckpoint.server";

const STORY_RUN: OvernightStory = { id: "US-004", stage: "run" };
const STORY_REPORT: OvernightStory = { id: "US-005", stage: "report" };
const STORY_EXPORT: OvernightStory = { id: "US-008", stage: "export" };

const BASE_RUN_CONTEXT = {
  run_id: "run_us010_test",
  iteration: 10,
  prd_path: "docs/05-reviews-audits/real-data-e2e-suite/prd.json",
};

describe("overnightLoopCheckpoint", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  async function createCheckpointPath(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "overnight-loop-checkpoint-"));
    tempDirs.push(dir);
    return path.join(dir, "checkpoint.json");
  }

  it("persists a checkpoint after each completed story with run context", async () => {
    const checkpointPath = await createCheckpointPath();
    let checkpointBeforeSecondStory = await readOvernightCheckpoint(checkpointPath);

    const result = await runOvernightStoryLoop({
      stories: [STORY_RUN, STORY_REPORT],
      checkpointPath,
      runContext: BASE_RUN_CONTEXT,
      executeStory: async (story) => {
        if (story.id === STORY_REPORT.id) {
          checkpointBeforeSecondStory = await readOvernightCheckpoint(checkpointPath);
        }

        return {
          ok: true,
          runContext: {
            handled_story: story.id,
          },
        };
      },
    });

    expect(result.status).toBe("completed");
    expect(result.executedStoryIds).toEqual([STORY_RUN.id, STORY_REPORT.id]);

    expect(checkpointBeforeSecondStory).not.toBeNull();
    expect(checkpointBeforeSecondStory?.status).toBe("completed");
    if (checkpointBeforeSecondStory?.status === "completed") {
      expect(checkpointBeforeSecondStory.completedStoryId).toBe(STORY_RUN.id);
      expect(checkpointBeforeSecondStory.nextStoryId).toBe(STORY_REPORT.id);
      expect(checkpointBeforeSecondStory.runContext.story_id).toBe(STORY_RUN.id);
      expect(checkpointBeforeSecondStory.runContext.run_id).toBe(BASE_RUN_CONTEXT.run_id);
    }

    const finalCheckpoint = await readOvernightCheckpoint(checkpointPath);
    expect(finalCheckpoint).not.toBeNull();
    expect(finalCheckpoint?.status).toBe("completed");
    if (finalCheckpoint?.status === "completed") {
      expect(finalCheckpoint.completedStoryId).toBe(STORY_REPORT.id);
      expect(finalCheckpoint.nextStoryId).toBeNull();
      expect(finalCheckpoint.resumeStoryId).toBeNull();
      expect(finalCheckpoint.runContext.story_id).toBe(STORY_REPORT.id);
      expect(finalCheckpoint.runContext.run_id).toBe(BASE_RUN_CONTEXT.run_id);
    }
  });

  it("halts at contract-breaking report failure before export and stores resume pointer", async () => {
    const checkpointPath = await createCheckpointPath();

    const result = await runOvernightStoryLoop({
      stories: [STORY_REPORT, STORY_EXPORT],
      checkpointPath,
      runContext: BASE_RUN_CONTEXT,
      executeStory: async (story) => {
        if (story.id === STORY_REPORT.id) {
          return {
            ok: false,
            code: "REPORT_CONTRACT_BROKEN",
            message: "Report contract mismatch",
            contractBreaking: true,
            runContext: { reason: "typed-envelope-missing" },
          };
        }

        return {
          ok: true,
        };
      },
    });

    expect(result.status).toBe("halted_on_failure");
    expect(result.executedStoryIds).toEqual([STORY_REPORT.id]);
    if (result.status === "halted_on_failure") {
      expect(result.resumeStoryId).toBe(STORY_REPORT.id);
      expect(result.haltBeforeStoryId).toBe(STORY_EXPORT.id);
      expect(result.checkpoint.failedStage).toBe("report");
      expect(result.checkpoint.error.contractBreaking).toBe(true);
    }

    const checkpoint = await readOvernightCheckpoint(checkpointPath);
    expect(checkpoint?.status).toBe("failed");
    if (checkpoint?.status === "failed") {
      expect(checkpoint.failedStoryId).toBe(STORY_REPORT.id);
      expect(checkpoint.failedStage).toBe("report");
      expect(checkpoint.resumeStoryId).toBe(STORY_REPORT.id);
      expect(checkpoint.haltBeforeStoryId).toBe(STORY_EXPORT.id);
      expect(checkpoint.runContext.story_id).toBe(STORY_REPORT.id);
    }
  });

  it("never auto-continues into downstream stories after upstream failure", async () => {
    const checkpointPath = await createCheckpointPath();

    await runOvernightStoryLoop({
      stories: [STORY_REPORT, STORY_EXPORT],
      checkpointPath,
      runContext: BASE_RUN_CONTEXT,
      executeStory: async () => ({
        ok: false,
        code: "REPORT_CONTRACT_BROKEN",
        message: "Report contract mismatch",
        contractBreaking: true,
      }),
    });

    let called = false;
    const blockedResult = await runOvernightStoryLoop({
      stories: [STORY_REPORT, STORY_EXPORT],
      checkpointPath,
      runContext: BASE_RUN_CONTEXT,
      executeStory: async () => {
        called = true;
        return {
          ok: true,
        };
      },
    });

    expect(called).toBe(false);
    expect(blockedResult.status).toBe("blocked_by_existing_failure");
    expect(blockedResult.executedStoryIds).toEqual([]);
    if (blockedResult.status === "blocked_by_existing_failure") {
      expect(blockedResult.resumeStoryId).toBe(STORY_REPORT.id);
      expect(blockedResult.haltBeforeStoryId).toBe(STORY_EXPORT.id);
    }
  });

  it("resumes from stored checkpoint only when explicitly requested", async () => {
    const checkpointPath = await createCheckpointPath();

    await runOvernightStoryLoop({
      stories: [STORY_REPORT, STORY_EXPORT],
      checkpointPath,
      runContext: BASE_RUN_CONTEXT,
      executeStory: async (story) => {
        if (story.id === STORY_REPORT.id) {
          return {
            ok: false,
            code: "REPORT_CONTRACT_BROKEN",
            message: "Report contract mismatch",
            contractBreaking: true,
          };
        }

        return {
          ok: true,
        };
      },
    });

    const resumedResult = await runOvernightStoryLoop({
      stories: [STORY_REPORT, STORY_EXPORT],
      checkpointPath,
      runContext: BASE_RUN_CONTEXT,
      resumeFromCheckpoint: true,
      executeStory: async () => ({
        ok: true,
      }),
    });

    expect(resumedResult.status).toBe("completed");
    expect(resumedResult.executedStoryIds).toEqual([STORY_REPORT.id, STORY_EXPORT.id]);

    const checkpoint = await readOvernightCheckpoint(checkpointPath);
    expect(checkpoint?.status).toBe("completed");
    if (checkpoint?.status === "completed") {
      expect(checkpoint.completedStoryId).toBe(STORY_EXPORT.id);
      expect(checkpoint.nextStoryId).toBeNull();
    }
  });
});
