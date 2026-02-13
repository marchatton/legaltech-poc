"use client";

import { useEffect, useMemo, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Alert } from "../../../ui/Alert";
import { Select } from "../../../ui/Input";
import { ExportCsvButton } from "../ExportCsvButton";
import type { RunSelectorOption } from "../runScope";

import { ExportMemoButton } from "./ExportMemoButton";

type Props = {
  folderId: string;
  runOptions: RunSelectorOption[];
  initialRunId: string | null;
  unsafeOverrideEnabled: boolean;
};

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toISOString().slice(0, 16).replace("T", " ");
}

function runOptionLabel(run: RunSelectorOption, index: number): string {
  const latest = index === 0 ? " (latest)" : "";
  return `${formatTimestamp(run.created_at)}${latest} — ${run.status}`;
}

export function ExportsPanel(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(props.initialRunId);

  useEffect(() => {
    setSelectedRunId(props.initialRunId);
  }, [props.initialRunId]);

  const selectedRun = useMemo(
    () => props.runOptions.find((run) => run.run_id === selectedRunId) ?? null,
    [props.runOptions, selectedRunId],
  );

  function syncRunIdInUrl(nextRunId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextRunId) params.set("run_id", nextRunId);
    else params.delete("run_id");
    params.set("tab", "exports");

    const qs = params.toString();
    router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onRunChange(nextValue: string) {
    const normalized = nextValue.trim();
    const nextRunId = normalized.length > 0 ? normalized : null;
    setSelectedRunId(nextRunId);
    syncRunIdInUrl(nextRunId);
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="grid w-full gap-1 text-left">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground" htmlFor="exports-run-selector">
            Source run
          </label>
          <Select
            id="exports-run-selector"
            value={selectedRun?.run_id ?? ""}
            onChange={(event) => onRunChange(event.currentTarget.value)}
            disabled={props.runOptions.length === 0}
            aria-label="Source run"
            className="w-full"
            uiSize="sm"
          >
            {props.runOptions.length === 0 ? (
              <option value="">No runs available</option>
            ) : (
              props.runOptions.map((run, index) => (
                <option key={run.run_id} value={run.run_id}>
                  {runOptionLabel(run, index)}
                </option>
              ))
            )}
          </Select>

          {selectedRun ? (
            selectedRun.status !== "completed" ? (
              <Alert variant="info" className="text-left">
                Exports are available once the selected run completes.
              </Alert>
            ) : null
          ) : (
            <Alert variant="info" className="text-left">
              Exports are available once this matter has at least one run.
            </Alert>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-ui-lg border border-border bg-card p-4 text-center shadow-ui-sm">
          <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-ui-md bg-secondary-100 text-secondary-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="text-xs font-medium text-foreground">Full Report</div>
          <div className="mt-3">
            <ExportMemoButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              unsafeOverrideEnabled={props.unsafeOverrideEnabled}
            />
          </div>
        </div>

        <div className="rounded-ui-lg border border-border bg-card p-4 text-center shadow-ui-sm">
          <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-ui-md bg-secondary-100 text-secondary-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
            </svg>
          </div>
          <div className="text-xs font-medium text-foreground">Summary</div>
          <div className="mt-3">
            <ExportCsvButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              kind="requirements_tracker"
              label="Download (csv)"
            />
          </div>
        </div>

        <div className="rounded-ui-lg border border-border bg-card p-4 text-center shadow-ui-sm">
          <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-ui-md bg-secondary-100 text-secondary-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <div className="text-xs font-medium text-foreground">Details</div>
          <div className="mt-3">
            <ExportCsvButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              kind="exceptions_table"
              label="Download (csv)"
            />
          </div>
        </div>

        <div className="rounded-ui-lg border border-border bg-card p-4 text-center shadow-ui-sm">
          <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-ui-md bg-secondary-100 text-secondary-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <div className="text-xs font-medium text-foreground">Citations</div>
          <div className="mt-3">
            <ExportCsvButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              kind="survey_issues"
              label="Download (csv)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
