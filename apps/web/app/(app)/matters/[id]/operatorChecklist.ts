export type OperatorChecklistState = "todo" | "in_progress" | "done";

export type OperatorChecklistStep = {
  id: string;
  label: string;
  state: OperatorChecklistState;
};

export type OperatorChecklistSignal = {
  state: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  startedAt?: Date | null;
} | null;

const TERMINAL_RUN_STATES = new Set(["completed", "partial", "failed", "cancelled"]);

const ORDERED_STEP_LABELS = [
  { id: "run_created", label: "Run started" },
  { id: "run_phase", label: "Processing questions" },
  { id: "run_completed", label: "Outputs ready" },
] as const;

function isValidDate(value: Date | null | undefined): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isTerminalState(state: string): boolean {
  return TERMINAL_RUN_STATES.has(state);
}

export function deriveOperatorChecklistSteps(signal: OperatorChecklistSignal): OperatorChecklistStep[] {
  if (!signal) {
    return ORDERED_STEP_LABELS.map((step) => ({ ...step, state: "todo" }));
  }

  const runPhaseState: OperatorChecklistState = isTerminalState(signal.state) ? "done" : "in_progress";

  return [
    { ...ORDERED_STEP_LABELS[0], state: "done" },
    { ...ORDERED_STEP_LABELS[1], state: runPhaseState },
    { ...ORDERED_STEP_LABELS[2], state: signal.state === "completed" ? "done" : "todo" },
  ];
}

export function summarizeOperatorChecklist(steps: OperatorChecklistStep[]): string {
  if (steps.length === 0) return "0/0 steps complete";
  const doneCount = steps.reduce((count, step) => (step.state === "done" ? count + 1 : count), 0);
  return `${doneCount}/${steps.length} steps complete`;
}

export function formatOperatorElapsedLabel(signal: OperatorChecklistSignal, now: Date = new Date()): string {
  if (!signal) return "Elapsed unavailable";

  const baseline = isValidDate(signal.startedAt) ? signal.startedAt : signal.createdAt;
  if (!isValidDate(baseline)) return "Elapsed unavailable";

  const end = isTerminalState(signal.state) ? signal.updatedAt : now;
  if (!isValidDate(end)) return "Elapsed unavailable";

  const elapsedMinutes = Math.max(0, Math.floor((end.getTime() - baseline.getTime()) / 60_000));
  return `${elapsedMinutes}m elapsed`;
}
