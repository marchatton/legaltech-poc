export type MatterSearchParamValue = string | string[] | undefined;

export type MatterTab = "report" | "exports" | "artefacts" | "chat";

export type RunSelectorOption = {
  run_id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export function firstSearchParamValue(value: MatterSearchParamValue): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const candidate of value) {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }

  return null;
}

export function resolveSelectedRunId(args: {
  availableRuns: ReadonlyArray<Pick<RunSelectorOption, "run_id">>;
  requestedRunId: string | null;
}): string | null {
  if (args.availableRuns.length === 0) return null;

  if (args.requestedRunId) {
    const requested = args.requestedRunId.trim();
    if (requested.length > 0) {
      const match = args.availableRuns.find((run) => run.run_id === requested);
      if (match) return match.run_id;
    }
  }

  return args.availableRuns[0]?.run_id ?? null;
}

export function buildMatterTabHref(args: {
  matterId: string;
  tab: MatterTab;
  runId?: string | null;
  status?: string | null;
}): string {
  const params = new URLSearchParams();
  params.set("tab", args.tab);

  const normalizedRunId = args.runId?.trim() ?? "";
  if (normalizedRunId.length > 0) params.set("run_id", normalizedRunId);

  const normalizedStatus = args.status?.trim() ?? "";
  if (normalizedStatus.length > 0) params.set("status", normalizedStatus);

  return `/matters/${encodeURIComponent(args.matterId)}?${params.toString()}`;
}
