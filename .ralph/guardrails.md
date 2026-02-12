# Guardrails (Signs)

> Lessons learned from failures. Read before acting.

## Core Signs

### Sign: Read Before Writing
- **Trigger**: Before modifying any file
- **Instruction**: Read the file first
- **Added after**: Core principle

### Sign: Test Before Commit
- **Trigger**: Before committing changes
- **Instruction**: Run required tests and verify outputs
- **Added after**: Core principle

---

## Learned Signs

### Sign: Stabilize Flaky WDK Completion Assertions
- **Trigger**: When `pnpm test` fails on `foldersRunsRoute.wdk.int.test.ts` with final run state still `running`
- **Instruction**: Re-run the global test gate until one clean pass is observed, and log repeated failures in `.ralph/errors.log`
- **Added after**: Iteration 4 (`US-008`) - repeated transient WDK completion timing failure
- **Example**: `POST /folders/:id/runs` idempotency assertion expects `completed` but intermittently reads `running`
