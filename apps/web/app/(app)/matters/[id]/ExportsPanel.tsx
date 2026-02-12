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
  return `${run.run_id}${latest} - ${run.status} - ${formatTimestamp(run.created_at)}`;
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
            className="w-full font-mono"
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
            <div className="grid gap-2">
              <p className="text-2xs text-muted-foreground">
                Selected run: <span className="font-mono">{selectedRun.run_id}</span> | status{" "}
                <span className="font-mono">{selectedRun.status}</span> | updated{" "}
                <span className="font-mono">{formatTimestamp(selectedRun.updated_at)}</span>
              </p>
              {selectedRun.status !== "completed" ? (
                <Alert variant="info" className="text-left">
                  Exports stay disabled until the selected run reaches{" "}
                  <span className="font-mono">completed</span>.
                </Alert>
              ) : null}
            </div>
          ) : (
            <Alert variant="info" className="text-left">
              Exports are available once this matter has at least one run.
            </Alert>
          )}
        </div>
      </div>

      <div className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Export options
        </p>
        <div className="grid gap-2">
          <ExportMemoButton
            folderId={props.folderId}
            runId={selectedRun?.run_id ?? null}
            runState={selectedRun?.status ?? null}
            unsafeOverrideEnabled={props.unsafeOverrideEnabled}
          />

          <div className="flex flex-wrap items-start gap-2">
            <ExportCsvButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              kind="requirements_tracker"
              label="Export requirements"
            />
            <ExportCsvButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              kind="exceptions_table"
              label="Export exceptions"
            />
            <ExportCsvButton
              folderId={props.folderId}
              runId={selectedRun?.run_id ?? null}
              runState={selectedRun?.status ?? null}
              kind="survey_issues"
              label="Export survey issues"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
