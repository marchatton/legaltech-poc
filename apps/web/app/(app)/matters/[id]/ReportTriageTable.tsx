"use client";

import { Badge } from "../../../ui/Badge";
import { TableFrame, Table, TH } from "../../../ui/Table";
import { cn } from "../../../ui/cn";
import { useReportTriage, statusPresentation } from "./ReportTriageContext";
import { formatAnswerForDisplay } from "./matterDetailHelpers";

export function ReportTriageTable() {
  const {
    rowTab,
    visibleRows,
    selectedRow,
    openRowDrawer,
  } = useReportTriage();

  return (
    <div className="mt-4">
      <TableFrame className="max-h-[34rem] shadow-ui-sm">
        <Table className="min-w-[640px] text-xs">
          <thead>
            <tr>
              <TH className="sticky top-0 z-10 w-16">ID</TH>
              <TH className="sticky top-0 z-10 w-1/3">Question</TH>
              <TH className="sticky top-0 z-10">Answer Preview</TH>
              <TH className="sticky top-0 z-10 w-32">Status</TH>
              <TH className="sticky top-0 z-10 w-10" />
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-sm text-muted-foreground" colSpan={5}>
                  No rows match <span className="font-mono">{rowTab}</span>.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => {
                const status = statusPresentation(row.status);
                const selected = selectedRow?.id === row.id;
                const displayAnswer = formatAnswerForDisplay(row.answer);
                return (
                  <tr
                    key={row.id}
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest("button")) return;
                      const btn = event.currentTarget.querySelector<HTMLButtonElement>("[data-row-trigger]");
                      if (btn) btn.click();
                    }}
                    className={cn(
                      "group cursor-pointer border-b border-border/60 align-top transition-colors hover:bg-muted/30",
                      selected ? "bg-muted/30" : null,
                    )}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="font-mono text-2xs text-muted-foreground">{row.question_id}</span>
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-sm font-medium leading-relaxed text-foreground line-clamp-2">{row.question}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {displayAnswer.trim().length > 0 ? displayAnswer : "\u2014"}
                      </p>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <button
                        type="button"
                        data-row-trigger
                        aria-label={`Open row drawer for ${row.question_id}`}
                        onClick={(event) => openRowDrawer(row.id, event.currentTarget)}
                        className="inline-flex items-center justify-center rounded-ui-md p-1.5 text-muted-foreground opacity-0 transition-all duration-micro ease-brand-standard hover:bg-muted hover:text-foreground group-hover:opacity-100"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </TableFrame>
    </div>
  );
}
