import { describe, expect, it } from "vitest";

import {
  applyArtefactFilters,
  buildPassthroughSearchEntries,
  parseArtefactFilters,
  searchFromEntries,
  uniqueFilterValues,
  type ArtefactFilterSearchParams,
} from "./artefactsFilters";

type TestArtefact = {
  id: string;
  kind: string;
  type: string;
  filename: string;
  source_run_id: string | null;
  metadata_json: unknown;
};

const ARTEFACTS: TestArtefact[] = [
  {
    id: "art_csv_safe",
    kind: "requirements_tracker",
    type: "csv",
    filename: "requirements_tracker.csv",
    source_run_id: "run_safe",
    metadata_json: {},
  },
  {
    id: "art_csv_unsafe",
    kind: "requirements_tracker",
    type: "csv",
    filename: "requirements_tracker.UNSAFE.csv",
    source_run_id: "run_unsafe_csv",
    metadata_json: {},
  },
  {
    id: "art_docx_unsafe",
    kind: "memo",
    type: "docx",
    filename: "memo.docx",
    source_run_id: "run_unsafe_docx",
    metadata_json: { unsafe_override: true },
  },
];

describe("artefacts filters", () => {
  it("normalizes and sorts filter option values", () => {
    expect(uniqueFilterValues([" csv ", "docx", "csv", "", "docx"])).toEqual(["csv", "docx"]);
  });

  it("parses filter params only when values exist in available options", () => {
    const searchParams: ArtefactFilterSearchParams = {
      artefact_kind: "requirements_tracker",
      artefact_type: "csv",
      artefact_safety: "unsafe",
    };

    expect(
      parseArtefactFilters({
        searchParams,
        availableKinds: ["requirements_tracker", "memo"],
        availableTypes: ["csv", "docx"],
        availableSourceRunIds: ["run_safe", "run_unsafe_csv", "run_unsafe_docx"],
      }),
    ).toEqual({
      kind: "requirements_tracker",
      type: "csv",
      safety: "unsafe",
      sourceRunId: null,
    });
  });

  it("falls back to default filters for invalid values", () => {
    const searchParams: ArtefactFilterSearchParams = {
      artefact_kind: "unknown",
      artefact_type: "pdf",
      artefact_safety: "not-a-safety",
    };

    expect(
      parseArtefactFilters({
        searchParams,
        availableKinds: ["requirements_tracker", "memo"],
        availableTypes: ["csv", "docx"],
        availableSourceRunIds: ["run_safe", "run_unsafe_csv", "run_unsafe_docx"],
      }),
    ).toEqual({
      kind: null,
      type: null,
      safety: "all",
      sourceRunId: null,
    });
  });

  it("filters to unsafe artefacts and preserves provenance fields", () => {
    const filtered = applyArtefactFilters(ARTEFACTS, {
      kind: null,
      type: null,
      safety: "unsafe",
      sourceRunId: null,
    });

    expect(filtered.map((artefact) => artefact.id)).toEqual(["art_csv_unsafe", "art_docx_unsafe"]);
    expect(filtered[0]?.source_run_id).toBe("run_unsafe_csv");
    expect(filtered[1]?.source_run_id).toBe("run_unsafe_docx");
  });

  it("supports combined kind/type/safe filters", () => {
    const filtered = applyArtefactFilters(ARTEFACTS, {
      kind: "requirements_tracker",
      type: "csv",
      safety: "safe",
      sourceRunId: null,
    });

    expect(filtered).toEqual([
      expect.objectContaining({
        id: "art_csv_safe",
        source_run_id: "run_safe",
      }),
    ]);
  });

  it("keeps non-filter query params for form submits", () => {
    const entries = buildPassthroughSearchEntries({
      tab: "artefacts",
      run_id: "run_123",
      status: ["failed", "completed"],
      row_tab: "citation_failed",
      artefact_kind: "memo",
      artefact_type: "docx",
      artefact_safety: "unsafe",
      artefact_run_id: "run_123",
    });

    expect(entries).toEqual([
      ["tab", "artefacts"],
      ["run_id", "run_123"],
      ["status", "failed"],
      ["status", "completed"],
      ["row_tab", "citation_failed"],
    ]);
    expect(searchFromEntries(entries)).toBe(
      "?tab=artefacts&run_id=run_123&status=failed&status=completed&row_tab=citation_failed",
    );
  });

  it("filters by source run id", () => {
    const filtered = applyArtefactFilters(ARTEFACTS, {
      kind: null,
      type: null,
      safety: "all",
      sourceRunId: "run_unsafe_docx",
    });

    expect(filtered.map((artefact) => artefact.id)).toEqual(["art_docx_unsafe"]);
  });
});
