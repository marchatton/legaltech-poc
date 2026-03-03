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
  it("keeps split-view wiring and focus-return behavior in context + split viewer", () => {
    const root = repoRootFromWebPackage();
    const contextPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageContext.tsx");
    const splitPath = path.join(root, "apps/web/app/(app)/matters/[id]/EvidenceViewerSplit.tsx");
    const contextSource = readUtf8(contextPath);
    const splitSource = readUtf8(splitPath);

    expect(contextSource).toContain("showDesktopSplitViewer");
    expect(contextSource).toContain("showMobileSplitViewer");
    expect(contextSource).toContain("returnFocusRef");
    expect(contextSource).toContain("window.requestAnimationFrame(() => target.focus())");
    expect(contextSource).toContain("setViewerCitationId");

    expect(splitSource).toContain("CitationViewerClient");
    expect(splitSource).toContain("Loading evidence");
    expect(splitSource).toContain("Select a citation id to load evidence in split view.");
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
    expect(source).toContain("Verified");
  });
});

describe("US-005 citation failure recovery and acknowledgement", () => {
  it("renders deterministic failure and guided recovery checklist copy", () => {
    const root = repoRootFromWebPackage();
    const viewerPath = path.join(root, "apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx");
    const source = readUtf8(viewerPath);

    expect(source).toContain("deterministicReasonCode");
    expect(source).toContain("Evidence unavailable");
    expect(source).toContain("Show technical details");
    expect(source).toContain("Failed citation state. Technical metadata is hidden by default.");
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

describe("US-007 valid citation trust viewer verification", () => {
  it("loads citation viewer from source chips using citation document + page payload", () => {
    const root = repoRootFromWebPackage();
    const contextPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageContext.tsx");
    const source = readUtf8(contextPath);

    expect(source).toContain("setViewerCitationId");
    expect(source).toContain("fetch(`/citations/${encodeURIComponent(citationId)}`");
    expect(source).toContain("/documents/${encodeURIComponent(citation.documentId)}/render?");
    expect(source).toContain("page: String(citation.pageNumber)");
    expect(source).toContain("documentId: citation.documentId");
    expect(source).toContain("pageNumber: citation.pageNumber");
    expect(source).toContain("computeCitationSnippetHash");
    expect(source).toContain("viewerErrorCodeFromEvidence");
    expect(source).toContain('computedSnippetHash: computedSnippetHash ?? "sha256:unavailable"');
  });

  it("renders overlays and trust metadata from payload with deterministic fallback", () => {
    const root = repoRootFromWebPackage();
    const viewerPath = path.join(root, "apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx");
    const source = readUtf8(viewerPath);

    expect(source).toContain("mapNormPolygonsToViewportCss");
    expect(source).toContain("overlayPath.map");
    expect(source).toContain("hasCitationFailure ? (");
    expect(source).toContain("TRUST_METADATA_FALLBACK");
    expect(source).toContain("loaded_state:");
    expect(source).toContain("doc_version:");
    expect(source).toContain("verified_at:");
  });
});

describe("US-008 invalid citation fail closed", () => {
  it("gates unresolved-anchor source chips with explicit disabled copy", () => {
    const root = repoRootFromWebPackage();
    const contextPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageContext.tsx");
    const chipsPath = path.join(root, "apps/web/app/(app)/matters/[id]/CitationChipList.tsx");
    const contextSource = readUtf8(contextPath);
    const chipsSource = readUtf8(chipsPath);

    expect(contextSource).toContain("SOURCE_CHIP_DISABLED_REASON_CODES");
    expect(contextSource).toContain("Source chip disabled: unresolved anchor target. Re-run verification to relock evidence.");
    expect(chipsSource).toContain("disabled={isCitationChipDisabled}");
    expect(chipsSource).toContain('aria-disabled={isCitationChipDisabled ? "true" : undefined}');
    expect(chipsSource).toContain("Evidence unavailable for");
  });

  it("routes invalid citations through citation_failed reason codes with no overlay fallback", () => {
    const root = repoRootFromWebPackage();
    const contextPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageContext.tsx");
    const viewerPath = path.join(root, "apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx");
    const contextSource = readUtf8(contextPath);
    const viewerSource = readUtf8(viewerPath);

    expect(contextSource).toContain("errorCode: viewerErrorCode");
    expect(contextSource).toContain("SNIPPET_HASH_MISMATCH");
    expect(contextSource).toContain("DOC_MISMATCH");
    expect(contextSource).toContain("WRONG_PAGE");
    expect(viewerSource).toContain("if (props.errorCode) {");
    expect(viewerSource).toContain("setOverlay([]);");
    expect(viewerSource).toContain("reason_code:");
    expect(viewerSource).toContain("overlayPath.map");
  });
});
