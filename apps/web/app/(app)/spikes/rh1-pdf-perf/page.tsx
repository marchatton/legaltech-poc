import { assertDevOnly } from "../../../../lib/devOnly";

import { Page, PageHeader, PageSection } from "../../../ui/Page";

import { PdfPerfClient } from "./PdfPerfClient";

export default function Rh1PdfPerfPage() {
  assertDevOnly();

  return (
    <Page width="lg">
      <PageHeader
        title="RH1: pdf.js perf harness"
        subtitle="Dev-only harness for page jumps and jank on scanned/rotated PDFs (pack_07)."
      />

      <PageSection>
        <div className="rounded-ui-lg border border-border/80 bg-card p-4 shadow-ui-sm">
          <PdfPerfClient
            initialDoc={{
              pack: "pack_07_scans_rotated_low_quality",
              filename: "TitleCommitment_SCANNED_ROTATED.pdf",
            }}
          />
        </div>
      </PageSection>
    </Page>
  );
}
