"use client";

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
  } = useReportTriage();

  if (!selectedRow) return null;
  const visibleCitationIds = selectedRow.citation_ids.slice(0, 6);
  const citationCountLabel = selectedRow.citation_count === 1 ? "1 linked citation" : `${selectedRow.citation_count} linked citations`;
  const hasLinkedCitations = selectedRow.citation_ids.length > 0;

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</h3>
      <div className="mt-2 space-y-2 rounded-ui-md border border-border bg-background p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{citationCountLabel}</span>
        </div>
        {hasLinkedCitations ? (
          <div className="grid gap-1">
            <div className="flex flex-wrap gap-1">
              {visibleCitationIds.map((citationId, idx) => {
                const isViewerOpen = viewerCitationId === citationId;
                const isCitationChipDisabled = selectedRowCitationGate?.disabled ?? false;
                const disabledTitle = isCitationChipDisabled ? selectedRowCitationGate?.helperText ?? undefined : undefined;
                const buttonLabel = visibleCitationIds.length === 1 ? "View citation" : `View citation ${idx + 1}`;
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
                    aria-label={
                      isCitationChipDisabled
                        ? `Evidence unavailable for ${buttonLabel.toLowerCase()}`
                        : `${buttonLabel}${isViewerOpen ? " (open)" : ""}`
                    }
                    className={cn(
                      "rounded-full px-2.5 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isCitationChipDisabled
                        ? "cursor-not-allowed bg-muted/60 text-muted-foreground ring-border/50 opacity-70"
                        : isViewerOpen
                          ? "bg-primary text-primary-foreground ring-primary/60 shadow-ui-sm"
                          : "bg-primary text-primary-foreground ring-primary/50 hover:bg-primary/90",
                    )}
                  >
                    {buttonLabel}
                  </button>
                );
              })}
              {selectedRow.citation_ids.length > visibleCitationIds.length ? (
                <span className="rounded-full bg-muted px-2.5 py-1 text-2xs text-muted-foreground ring-1 ring-inset ring-border/60">
                  +{selectedRow.citation_ids.length - visibleCitationIds.length} more
                </span>
              ) : null}
            </div>
            {selectedRowCitationGate?.helperText ? (
              <div className="rounded-ui-sm border border-border/70 bg-muted/40 px-2 py-1 text-2xs text-muted-foreground">
                {selectedRowCitationGate.helperText}
              </div>
            ) : null}
          </div>
        ) : (
          <div>No evidence found.</div>
        )}
        {hasLinkedCitations && selectedRowReasonPanel ? (
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
