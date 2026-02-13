import fs from "node:fs/promises";
import path from "node:path";

export type OvernightStory = Readonly<{
  id: string;
  stage: string;
}>;

export type OvernightRunContext = Readonly<Record<string, unknown>>;

export type OvernightStoryExecutionSuccess = Readonly<{
  ok: true;
  runContext?: OvernightRunContext;
}>;

export type OvernightStoryExecutionFailure = Readonly<{
  ok: false;
  code: string;
  message: string;
  contractBreaking: boolean;
  runContext?: OvernightRunContext;
}>;

export type OvernightStoryExecutionResult = OvernightStoryExecutionSuccess | OvernightStoryExecutionFailure;

type OvernightCheckpointBase = Readonly<{
  version: 1;
  writtenAt: string;
  runContext: OvernightRunContext;
}>;

export type OvernightCompletedCheckpoint = OvernightCheckpointBase &
  Readonly<{
    status: "completed";
    completedStoryId: string;
    nextStoryId: string | null;
    resumeStoryId: string | null;
  }>;

export type OvernightFailedCheckpoint = OvernightCheckpointBase &
  Readonly<{
    status: "failed";
    failedStoryId: string;
    failedStage: string;
    haltBeforeStoryId: string | null;
    resumeStoryId: string;
    error: Readonly<{
      code: string;
      message: string;
      contractBreaking: boolean;
    }>;
  }>;

export type OvernightLoopCheckpoint = OvernightCompletedCheckpoint | OvernightFailedCheckpoint;

export type RunOvernightLoopResult =
  | Readonly<{
      status: "completed";
      executedStoryIds: string[];
      checkpoint: OvernightCompletedCheckpoint | null;
    }>
  | Readonly<{
      status: "halted_on_failure";
      executedStoryIds: string[];
      checkpoint: OvernightFailedCheckpoint;
      resumeStoryId: string;
      haltBeforeStoryId: string | null;
    }>
  | Readonly<{
      status: "blocked_by_existing_failure";
      executedStoryIds: [];
      checkpoint: OvernightFailedCheckpoint;
      resumeStoryId: string;
      haltBeforeStoryId: string | null;
    }>;

type PersistCompletedStoryCheckpointOptions = Readonly<{
  checkpointPath: string;
  runContext: OvernightRunContext;
  story: OvernightStory;
  nextStoryId: string | null;
}>;

type PersistFailedStoryCheckpointOptions = Readonly<{
  checkpointPath: string;
  runContext: OvernightRunContext;
  story: OvernightStory;
  haltBeforeStoryId: string | null;
  code: string;
  message: string;
  contractBreaking: boolean;
}>;

type RunOvernightStoryLoopOptions = Readonly<{
  stories: OvernightStory[];
  checkpointPath: string;
  runContext: OvernightRunContext;
  executeStory: (story: OvernightStory) => Promise<OvernightStoryExecutionResult>;
  resumeFromCheckpoint?: boolean;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`CHECKPOINT_INVALID_${field.toUpperCase()}`);
  }
  return value;
}

function asNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  return asString(value, field);
}

function mergeRunContext(
  runContext: OvernightRunContext,
  story: OvernightStory,
  storyContext: OvernightRunContext | undefined,
): OvernightRunContext {
  return {
    ...runContext,
    ...(storyContext ?? {}),
    story_id: story.id,
    stage: story.stage,
  };
}

async function writeCheckpoint(checkpointPath: string, checkpoint: OvernightLoopCheckpoint): Promise<void> {
  await fs.mkdir(path.dirname(checkpointPath), { recursive: true });
  await fs.writeFile(checkpointPath, `${JSON.stringify(checkpoint, null, 2)}\n`, "utf8");
}

function parseCheckpoint(raw: unknown): OvernightLoopCheckpoint {
  if (!isRecord(raw)) {
    throw new Error("CHECKPOINT_INVALID_SHAPE");
  }

  const version = raw.version;
  if (version !== 1) {
    throw new Error("CHECKPOINT_INVALID_VERSION");
  }

  const status = asString(raw.status, "status");
  const writtenAt = asString(raw.writtenAt, "writtenAt");
  const runContext = raw.runContext;
  if (!isRecord(runContext)) {
    throw new Error("CHECKPOINT_INVALID_RUN_CONTEXT");
  }

  if (status === "completed") {
    return {
      version: 1,
      status,
      writtenAt,
      runContext,
      completedStoryId: asString(raw.completedStoryId, "completedStoryId"),
      nextStoryId: asNullableString(raw.nextStoryId, "nextStoryId"),
      resumeStoryId: asNullableString(raw.resumeStoryId, "resumeStoryId"),
    };
  }

  if (status === "failed") {
    const error = raw.error;
    if (!isRecord(error)) {
      throw new Error("CHECKPOINT_INVALID_ERROR");
    }

    return {
      version: 1,
      status,
      writtenAt,
      runContext,
      failedStoryId: asString(raw.failedStoryId, "failedStoryId"),
      failedStage: asString(raw.failedStage, "failedStage"),
      haltBeforeStoryId: asNullableString(raw.haltBeforeStoryId, "haltBeforeStoryId"),
      resumeStoryId: asString(raw.resumeStoryId, "resumeStoryId"),
      error: {
        code: asString(error.code, "error.code"),
        message: asString(error.message, "error.message"),
        contractBreaking: Boolean(error.contractBreaking),
      },
    };
  }

  throw new Error("CHECKPOINT_INVALID_STATUS");
}

function findStoryIndex(stories: OvernightStory[], storyId: string): number {
  const index = stories.findIndex((story) => story.id === storyId);
  if (index === -1) {
    throw new Error(`CHECKPOINT_STORY_NOT_FOUND:${storyId}`);
  }
  return index;
}

export async function readOvernightCheckpoint(checkpointPath: string): Promise<OvernightLoopCheckpoint | null> {
  try {
    const payload = await fs.readFile(checkpointPath, "utf8");
    const parsed = JSON.parse(payload) as unknown;
    return parseCheckpoint(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function persistCompletedStoryCheckpoint(
  options: PersistCompletedStoryCheckpointOptions,
): Promise<OvernightCompletedCheckpoint> {
  const checkpoint: OvernightCompletedCheckpoint = {
    version: 1,
    status: "completed",
    writtenAt: new Date().toISOString(),
    runContext: options.runContext,
    completedStoryId: options.story.id,
    nextStoryId: options.nextStoryId,
    resumeStoryId: options.nextStoryId,
  };
  await writeCheckpoint(options.checkpointPath, checkpoint);
  return checkpoint;
}

export async function persistFailedStoryCheckpoint(
  options: PersistFailedStoryCheckpointOptions,
): Promise<OvernightFailedCheckpoint> {
  const checkpoint: OvernightFailedCheckpoint = {
    version: 1,
    status: "failed",
    writtenAt: new Date().toISOString(),
    runContext: options.runContext,
    failedStoryId: options.story.id,
    failedStage: options.story.stage,
    haltBeforeStoryId: options.haltBeforeStoryId,
    resumeStoryId: options.story.id,
    error: {
      code: options.code,
      message: options.message,
      contractBreaking: options.contractBreaking,
    },
  };
  await writeCheckpoint(options.checkpointPath, checkpoint);
  return checkpoint;
}

export async function runOvernightStoryLoop(options: RunOvernightStoryLoopOptions): Promise<RunOvernightLoopResult> {
  const existingCheckpoint = await readOvernightCheckpoint(options.checkpointPath);
  const resumeFromCheckpoint = options.resumeFromCheckpoint ?? false;

  let startIndex = 0;
  if (existingCheckpoint?.status === "failed") {
    if (!resumeFromCheckpoint) {
      return {
        status: "blocked_by_existing_failure",
        executedStoryIds: [],
        checkpoint: existingCheckpoint,
        resumeStoryId: existingCheckpoint.resumeStoryId,
        haltBeforeStoryId: existingCheckpoint.haltBeforeStoryId,
      };
    }

    startIndex = findStoryIndex(options.stories, existingCheckpoint.resumeStoryId);
  } else if (existingCheckpoint?.status === "completed" && resumeFromCheckpoint && existingCheckpoint.nextStoryId) {
    startIndex = findStoryIndex(options.stories, existingCheckpoint.nextStoryId);
  }

  const executedStoryIds: string[] = [];
  let checkpoint: OvernightCompletedCheckpoint | null = null;

  for (let index = startIndex; index < options.stories.length; index += 1) {
    const story = options.stories[index]!;
    const result = await options.executeStory(story);
    executedStoryIds.push(story.id);

    if (!result.ok) {
      const failedCheckpoint = await persistFailedStoryCheckpoint({
        checkpointPath: options.checkpointPath,
        runContext: mergeRunContext(options.runContext, story, result.runContext),
        story,
        haltBeforeStoryId: options.stories[index + 1]?.id ?? null,
        code: result.code,
        message: result.message,
        contractBreaking: result.contractBreaking,
      });
      return {
        status: "halted_on_failure",
        executedStoryIds,
        checkpoint: failedCheckpoint,
        resumeStoryId: failedCheckpoint.resumeStoryId,
        haltBeforeStoryId: failedCheckpoint.haltBeforeStoryId,
      };
    }

    checkpoint = await persistCompletedStoryCheckpoint({
      checkpointPath: options.checkpointPath,
      runContext: mergeRunContext(options.runContext, story, result.runContext),
      story,
      nextStoryId: options.stories[index + 1]?.id ?? null,
    });
  }

  return {
    status: "completed",
    executedStoryIds,
    checkpoint,
  };
}
