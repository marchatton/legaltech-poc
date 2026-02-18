import Link from "next/link";

import { Card } from "./ui/Card";
import { Page, PageHeader, PageSection, SectionLabel } from "./ui/Page";

export default function HomePage() {
  return (
    <Page width="sm">
      <PageHeader
        title={<em>LegalTech</em>}
        subtitle="Choose a workspace: product parity surfaces or dev-only spike harnesses."
      />

      <PageSection>
        <SectionLabel>Routes</SectionLabel>
        <div className="mt-3 grid gap-3">
          <Card className="p-4">
            <Link className="text-sm font-semibold underline underline-offset-4 hover:text-primary" href="/matters">
              Matters workspace
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Main parity surface: list, detail tabs, evidence workflows, chat, and reports.
            </p>
          </Card>

          <Card className="p-4">
            <Link className="text-sm font-semibold underline underline-offset-4 hover:text-primary" href="/spikes/rh1-pdf-perf">
              RH1: pdf.js perf harness
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Dev-only performance diagnostics for heavy scanned/rotated PDFs.
            </p>
          </Card>

          <Card className="p-4">
            <Link className="text-sm font-semibold underline underline-offset-4 hover:text-primary" href="/spikes/rh2-overlay">
              RH2: highlight overlay harness
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Dev-only overlay/anchor mapping diagnostics across rotation and zoom.
            </p>
          </Card>
        </div>
      </PageSection>
    </Page>
  );
}
