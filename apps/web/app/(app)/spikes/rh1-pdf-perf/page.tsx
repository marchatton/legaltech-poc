import { assertDevOnly } from "../../../../lib/devOnly";

import { PdfPerfClient } from "./PdfPerfClient";

export default function Rh1PdfPerfPage() {
  assertDevOnly();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold">RH1: pdf.js perf harness</h1>
      <p className="mt-2 text-muted-foreground">
        Dev-only harness for page jumps and jank on scanned/rotated PDFs (pack_07).
      </p>

      <div className="mt-6">
        <PdfPerfClient
          initialDoc={{
            pack: "pack_07_scans_rotated_low_quality",
            filename: "TitleCommitment_SCANNED_ROTATED.pdf",
          }}
        />
      </div>
    </main>
  );
}
