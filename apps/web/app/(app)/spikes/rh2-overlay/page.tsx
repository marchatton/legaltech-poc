import { z } from "zod";

import { assertDevOnly } from "../../../../lib/devOnly";

import { Page, PageHeader, PageSection } from "../../../ui/Page";

import { Rh2OverlayClient } from "./Rh2OverlayClient";
import { loadAnchorsFromFixture } from "./loadAnchors.server";

const SearchSchema = z.object({
  pack: z.enum(["pack_01_clean", "pack_07_scans_rotated_low_quality"]).optional(),
  doc: z.enum(["TitleCommitment", "ALTA_Survey"]).optional(),
});

function pdfFilenameFor(pack: string, docKey: "TitleCommitment" | "ALTA_Survey"): string {
  if (pack === "pack_07_scans_rotated_low_quality") return `${docKey}_SCANNED_ROTATED.pdf`;
  return `${docKey}.pdf`;
}

export default async function Rh2OverlayPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  const pack = parsed.success ? parsed.data.pack ?? "pack_01_clean" : "pack_01_clean";
  const docKey = parsed.success ? parsed.data.doc ?? "TitleCommitment" : "TitleCommitment";

  const { anchorIds, anchors } = loadAnchorsFromFixture({ pack, docKey });
  const pdfFilename = pdfFilenameFor(pack, docKey);
  const pdfUrl = `/spikes/local-pdf?${new URLSearchParams({ pack, filename: pdfFilename }).toString()}`;

  return (
    <Page width="lg">
      <PageHeader
        title="RH2: highlight overlay harness"
        subtitle="Dev-only harness to validate anchor mapping across zoom and rotation. Fail-closed on invalid geometry."
      />

      <PageSection>
        <div className="rounded-ui-lg border border-border/80 bg-card p-4 shadow-ui-sm">
          <Rh2OverlayClient
            pack={pack}
            docKey={docKey}
            pdfUrl={pdfUrl}
            pdfFilename={pdfFilename}
            anchorIds={anchorIds}
            anchors={anchors}
          />
        </div>
      </PageSection>
    </Page>
  );
}
