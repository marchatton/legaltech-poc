import Link from "next/link";

import { Page, PageHeader } from "./ui/Page";

export default function HomePage() {
  return (
    <Page width="sm">
      <PageHeader
        title={<em>Orbital</em>}
        subtitle="Dev-only spike harness routes live under /spikes."
      />

      <ul className="mt-8 grid gap-3">
        <li>
          <Link className="text-sm font-medium underline underline-offset-4 hover:text-primary" href="/matters">
            Matters: demo UI (citation chips, viewer, overlay)
          </Link>
        </li>
        <li>
          <Link className="text-sm font-medium underline underline-offset-4 hover:text-primary" href="/spikes/rh1-pdf-perf">
            RH1: pdf.js perf harness
          </Link>
        </li>
        <li>
          <Link className="text-sm font-medium underline underline-offset-4 hover:text-primary" href="/spikes/rh2-overlay">
            RH2: highlight overlay harness
          </Link>
        </li>
      </ul>
    </Page>
  );
}
