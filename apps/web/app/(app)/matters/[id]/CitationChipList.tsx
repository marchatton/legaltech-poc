"use client";

import { Button } from "../../../ui/Button";
import { cn } from "../../../ui/cn";
import { useReportTriage } from "./ReportTriageContext";

export function CitationChipList() {
  const {
    selectedRow,
    selectedRowCitationGate,
    selectedRowReasonPanel,
    viewerCitationId,
    returnFocusRef,
    setViewerCitationId,
    closeEvidenceViewer,
  } = useReportTriage();

  if (!selectedRow) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Citation summary</h3>
      <div className="mt-2 space-y-2 rounded-ui-md border border-border bg-background p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>locked citations</span>
          <span className="font-mono text-foreground">{selectedRow.citation_count}</span>
        </div>
        {selectedRow.citation_ids.length ? (
          <div className="grid gap-1">
            <div className="text-muted-foreground">citation ids</div>
            <div className="flex flex-wrap gap-1">
              {selectedRow.citation_ids.slice(0, 8).map((citationId) => {
                const isViewerOpen = viewerCitationId === citationId;
                const isCitationChipDisabled = selectedRowCitationGate?.disabled ?? false;
                const disabledTitle = isCitationChipDisabled ? selectedRowCitationGate?.helperText ?? undefined : undefined;
                return (
                  <button
                    key={citationId}
                    ref={isViewerOpen ? returnFocusRef : null}
                    type="button"
                    disabled={isCitationChipDisabled}
                    title={disabledTitle}
                    onClick={(event) => {
                      if (isCitationChipDisabled) return;
                      returnFocusRef.current = event.currentTarget;
                      setViewerCitationId(citationId);
                    }}
                    aria-pressed={isViewerOpen}
                    aria-disabled={isCitationChipDisabled ? "true" : undefined}
                    aria-label={isCitationChipDisabled ? `Evidence unavailable for ${citationId}` : `Open evidence for ${citationId}`}
                    className={cn(
                      "rounded-ui-sm px-1.5 py-0.5 font-mono text-2xs ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isCitationChipDisabled ? "cursor-not-allowed bg-muted/60 text-muted-foreground ring-border/50 opacity-70" : null,
                      isViewerOpen
                        ? "bg-primary text-primary-foreground ring-primary/50"
                        : "bg-muted text-muted-foreground ring-border/60 hover:bg-muted/80",
                    )}
                  >
                    {citationId}
                  </button>
                );
              })}
              {selectedRow.citation_ids.length > 8 ? (
                <span className="rounded-ui-sm bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground ring-1 ring-inset ring-border/60">
                  +{selectedRow.citation_ids.length - 8} more
                </span>
              ) : null}
            </div>
            {selectedRowCitationGate?.helperText ? (
              <div className="rounded-ui-sm border border-border/70 bg-muted/40 px-2 py-1 text-2xs text-muted-foreground">
                {selectedRowCitationGate.helperText}
              </div>
            ) : null}
            {viewerCitationId ? (
              <div className="pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={closeEvidenceViewer}>
                  Close viewer
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div>No locked citation ids linked to this row.</div>
        )}
        {selectedRowReasonPanel ? (
          <div className="grid gap-1">
            <div className="flex items-center justify-between gap-2">
              <span>reason_code</span>
              <span className="font-mono text-foreground">{selectedRowReasonPanel.reasonCode}</span>
            </div>
            <div className="rounded-ui-sm border border-border/70 bg-muted/40 px-2 py-1 text-2xs text-muted-foreground">
              {selectedRowReasonPanel.helperText}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
