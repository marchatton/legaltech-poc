import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-014 cross-surface error contract", () => {
  it("renders deterministic ErrorBanner wiring on chat, export, and quick start", () => {
    const root = repoRootFromWebPackage();
    const quickStart = readUtf8(path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx"));
    const chat = readUtf8(path.join(root, "apps/web/app/(app)/matters/[id]/ChatPanel.tsx"));
    const exportCsv = readUtf8(path.join(root, "apps/web/app/(app)/matters/ExportCsvButton.tsx"));

    expect(quickStart).toContain("<ErrorBanner");
    expect(quickStart).toContain("code={error.code}");
    expect(quickStart).toContain("message={error.message}");
    expect(quickStart).toContain("traceId={error.traceId}");
    expect(quickStart).toContain("supportRoute={`/matters/${props.folderId}`}");

    expect(chat).toContain("<ErrorBanner");
    expect(chat).toContain("code={m.error?.code ?? \"CHAT_FAILED\"}");
    expect(chat).toContain("message={m.error?.message ?? \"Chat failed. Please retry.\"}");
    expect(chat).toContain("traceId={m.error?.traceId}");
    expect(chat).toContain("supportRoute={`/matters/${props.folderId}`}");

    expect(exportCsv).toContain("<ErrorBanner");
    expect(exportCsv).toContain("code={state.error.code}");
    expect(exportCsv).toContain("message={state.error.message}");
    expect(exportCsv).toContain("traceId={state.error.traceId}");
    expect(exportCsv).toContain("supportRoute=\"/matters\"");
  });

  it("replays quick-start retry with deterministic idempotency", () => {
    const root = repoRootFromWebPackage();
    const quickStart = readUtf8(path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx"));

    expect(quickStart).toContain("QUICK_START_IDEMPOTENCY_KEY");
    expect(quickStart).toContain("\"Idempotency-Key\": QUICK_START_IDEMPOTENCY_KEY");
    expect(quickStart).toContain("onRetry={error.retryable === true ? start : undefined}");
  });

  it("keeps non-retryable validation errors without Retry CTA", () => {
    const root = repoRootFromWebPackage();
    const quickStart = readUtf8(path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx"));

    expect(quickStart).toContain("env.retryable ?? retryable");
    expect(quickStart).toContain("supportRoute={`/matters/${props.folderId}`}");
  });
});
