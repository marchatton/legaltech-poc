"use client";

import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { InlineStatus } from "../../../ui/InlineStatus";
import { cn } from "../../../ui/cn";
import { useReportTriage, statusPresentation } from "./ReportTriageContext";
import { CitationChipList } from "./CitationChipList";
import { DesktopEvidenceViewer, MobileEvidenceViewer } from "./EvidenceViewerSplit";
import { formatAnswerForDisplay } from "./matterDetailHelpers";

export function RowDetailDrawer() {
  const {
    selectedRow,
    pendingRowId,
    pendingCopyAction,
    feedback,
    answerExpanded,
    toggleAnswerExpanded,
    showDesktopSplitViewer,
    showMobileSplitViewer,
    closeRowDrawer,
    handleMarkReviewed,
    handleCopyExtractedAnswer,
  } = useReportTriage();

  if (!selectedRow) return null;
  const displayAnswer = formatAnswerForDisplay(selectedRow.answer);

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-background/45 backdrop-blur-[1px]"
        aria-hidden="true"
        onClick={closeRowDrawer}
      />
      <div className="fixed inset-0 z-[70] flex justify-end">
        {showDesktopSplitViewer ? <DesktopEvidenceViewer /> : null}

        <aside
          className={cn(
            "h-full shrink-0 border-l border-border bg-card shadow-ui-lg",
            showDesktopSplitViewer ? "w-[min(34rem,42vw)] min-w-[30rem]" : "w-[min(40rem,100vw)]",
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`row-drawer-title-${selectedRow.id}`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-ui-sm bg-card px-2 py-0.5 font-mono text-2xs text-muted-foreground ring-1 ring-inset ring-border/70">
                      {selectedRow.question_id}
                    </span>
                    <span className="text-2xs font-medium text-muted-foreground">
                      {statusPresentation(selectedRow.status).label}
                    </span>
                  </div>
                  <h2 id={`row-drawer-title-${selectedRow.id}`} className="font-serif text-lg font-medium leading-tight text-foreground line-clamp-2">
                    {selectedRow.question}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeRowDrawer}
                  aria-keyshortcuts="Escape"
                  className="shrink-0 rounded-ui-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {feedback.kind === "error" ? (
                <ErrorBanner
                  title="Row action failed"
                  code={feedback.error.code}
                  message={feedback.error.message}
                  traceId={feedback.error.traceId}
                  retryable={feedback.error.retryable}
                  showSupportAction={false}
                />
              ) : null}
              <div aria-live="polite">
                <InlineStatus kind={feedback.kind === "success" ? "success" : "idle"}>
                  {feedback.kind === "success" ? feedback.message : null}
                </InlineStatus>
              </div>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extracted answer</h3>
                <div className="group/answer relative mt-2 rounded-ui-md border border-border bg-background p-3 text-sm leading-relaxed text-foreground">
                  <div className={answerExpanded ? undefined : "line-clamp-2"}>
                    {displayAnswer.trim().length > 0 ? displayAnswer : "Not provided."}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    {displayAnswer.trim().length > 120 ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        onClick={toggleAnswerExpanded}
                      >
                        {answerExpanded ? "Show less" : "Show more"}
                      </button>
                    ) : <span />}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="opacity-0 transition-opacity group-hover/answer:opacity-100 focus-visible:opacity-100"
                      onClick={() => void handleCopyExtractedAnswer(selectedRow.id)}
                      loading={pendingCopyAction === "answer"}
                      loadingLabel="Copying"
                    >
                      Copy answer
                    </Button>
                  </div>
                </div>
              </section>

              <CitationChipList />

              {showMobileSplitViewer ? <MobileEvidenceViewer /> : null}
            </div>

            <div className="border-t border-border bg-card px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={() => void handleMarkReviewed(selectedRow.id)}
                  disabled={selectedRow.status === "reviewed"}
                  loading={pendingRowId === selectedRow.id}
                  loadingLabel="Marking"
                >
                  Mark reviewed
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={closeRowDrawer}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
