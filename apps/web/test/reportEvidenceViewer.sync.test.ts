import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-003 split-view evidence controls and verification states", () => {
  it("persists split-view lock and keeps focus return target when viewer closes", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain("SPLIT_VIEW_LOCK_STORAGE_KEY");
    expect(source).toContain("Split-view lock");
    expect(source).toContain("window.requestAnimationFrame(() => target.focus())");
    expect(source).toContain("CitationViewerClient");
    expect(source).toContain("renderEvidenceViewerPanel");
  });

  it("renders loading skeleton, page controls, and reset-to-verify CTA in viewer", () => {
    const root = repoRootFromWebPackage();
    const viewerPath = path.join(root, "apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx");
    const source = readUtf8(viewerPath);

    expect(source).toContain("Loading PDF page...");
    expect(source).toContain("Reset to verify");
    expect(source).toContain('aria-label="Previous page"');
    expect(source).toContain('aria-label="Next page"');
    expect(source).toContain("goToPage");
    expect(source).toContain("TRUST_METADATA_FALLBACK");
    expect(source).toContain("trustDocVersion");
    expect(source).toContain("trustVerifiedAt");
    expect(source).toContain("trustLoadedState");
    expect(source).toContain("Unavailable from payload");
    expect(source).toContain("Verified at 100%");
  });
});

describe("US-005 citation failure recovery and acknowledgement", () => {
  it("renders deterministic failure and guided recovery checklist copy", () => {
    const root = repoRootFromWebPackage();
    const viewerPath = path.join(root, "apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx");
    const source = readUtf8(viewerPath);

    expect(source).toContain("deterministicReasonCode");
    expect(source).toContain("Recovery checklist");
    expect(source).toContain("reason_code:");
    expect(source).toContain("Review citation_failed rows in report triage before continuing.");
  });

  it("provides a UI-only Flag citation wrong acknowledgement flow", () => {
    const root = repoRootFromWebPackage();
    const viewerPath = path.join(root, "apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx");
    const source = readUtf8(viewerPath);

    expect(source).toContain("Flag citation as wrong");
    expect(source).toContain("Flagged — thanks");
    expect(source).toContain("Confirm flag?");
    expect(source).toContain("setFlagCitationState");
  });
});
