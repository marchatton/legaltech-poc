"use client";

import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { Skeleton, SkeletonLine } from "../../../ui/Skeleton";
import { CitationViewerClient } from "../viewer/CitationViewerClient";
import { useReportTriage } from "./ReportTriageContext";

function EvidenceViewerPanelContent() {
  const { viewerState } = useReportTriage();

  if (viewerState.kind === "loading") {
    return (
      <div className="space-y-3 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Loading evidence</div>
        <Skeleton className="h-40 w-full" />
        <SkeletonLine width="88%" />
        <SkeletonLine width="74%" />
        <SkeletonLine width="92%" />
      </div>
    );
  }

  if (viewerState.kind === "error") {
    return (
      <div className="p-4">
        <ErrorBanner
          title="Evidence viewer failed"
          code={viewerState.code}
          message={viewerState.message}
          showSupportAction={false}
        />
      </div>
    );
  }

  if (viewerState.kind === "ready") {
    return (
      <div className="overflow-y-auto p-4">
        <CitationViewerClient
          packId={null}
          citationId={viewerState.data.citationId}
          pdfUrl={viewerState.data.pdfUrl}
          documentId={viewerState.data.documentId}
          documentLabel={viewerState.data.documentLabel}
          pageNumber={viewerState.data.pageNumber}
          polygons={viewerState.data.polygons}
          snippet={viewerState.data.snippet}
          answerText={viewerState.data.answerText}
          snippetHash={viewerState.data.snippetHash}
          computedSnippetHash={viewerState.data.computedSnippetHash}
          errorCode={viewerState.data.errorCode}
          docVersion={viewerState.data.docVersion}
          verifiedAt={viewerState.data.verifiedAt}
          loadedState={viewerState.data.loadedState}
        />
      </div>
    );
  }

  return (
    <div className="p-4 text-sm text-muted-foreground">
      Select a citation id to load evidence in split view.
    </div>
  );
}

export function DesktopEvidenceViewer() {
  const { closeEvidenceViewer } = useReportTriage();

  return (
    <aside
      className="hidden xl:flex h-full min-w-0 flex-1 bg-background"
      role="region"
      aria-label="Evidence viewer panel"
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Evidence viewer</div>
            <div className="text-sm text-foreground">Linked citation</div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={closeEvidenceViewer}>
            Close evidence
          </Button>
        </div>
        <div className="flex-1 bg-background">
          <EvidenceViewerPanelContent />
        </div>
      </div>
    </aside>
  );
}

export function MobileEvidenceViewer() {
  const { closeEvidenceViewer } = useReportTriage();

  return (
    <section className="xl:hidden">
      <div className="rounded-ui-md border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence viewer</h3>
          <Button type="button" variant="secondary" size="sm" onClick={closeEvidenceViewer}>
            Close
          </Button>
        </div>
        <div className="mt-3 rounded-ui-sm border border-border bg-background">
          <EvidenceViewerPanelContent />
        </div>
      </div>
    </section>
  );
}
