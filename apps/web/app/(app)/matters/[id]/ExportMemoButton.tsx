"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

type Props = {
  folderId: string;
  runId: string | null;
  runState: string | null;
  unsafeOverrideEnabled: boolean;
};

type ExportBlockedDetails = {
  citationFailedCount: number;
  failedQuestionIds: string[];
  reasonCodes: string[];
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; message: string; details: ExportBlockedDetails }
  | { kind: "error"; message: string }
  | { kind: "done"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function readSafeError(json: unknown): { code: string; message: string; details: unknown } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  if (!code || !message) return null;
  return { code, message, details: (env as { details?: unknown }).details };
}

function parseBlockedDetails(details: unknown): ExportBlockedDetails | null {
  if (!isRecord(details)) return null;
  const rawCount = details.citation_failed_count;
  const citationFailedCount = typeof rawCount === "number" && Number.isFinite(rawCount) ? rawCount : null;

  const failedQuestionIds = Array.isArray(details.failed_question_ids)
    ? details.failed_question_ids
        .filter((qid): qid is string => typeof qid === "string")
        .map((qid) => qid.trim())
        .filter(Boolean)
    : [];

  const reasonCodes = Array.isArray(details.reason_codes)
    ? details.reason_codes
        .filter((code): code is string => typeof code === "string")
        .map((code) => code.trim())
        .filter(Boolean)
    : [];

  if (citationFailedCount === null) return null;
  return { citationFailedCount, failedQuestionIds, reasonCodes };
}

function disabledReason(props: Props): string | null {
  if (!props.runId) return "Export is disabled until a run exists.";
  if (props.runState !== "completed") return `Export is disabled until the run completes (current: ${props.runState ?? "unknown"}).`;
  return null;
}

export function ExportMemoButton(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const [adminToken, setAdminToken] = useState("");

  const disabled = disabledReason(props);

  const reportHref = props.runId
    ? `/folders/${encodeURIComponent(props.folderId)}/report?${new URLSearchParams({
        run_id: props.runId,
      }).toString()}`
    : null;

  async function run(args: { unsafeOverride: boolean }) {
    if (disabled) return;
    if (!props.runId) return;

    if (args.unsafeOverride) {
      const token = adminToken.trim();
      if (!token) {
        setState({ kind: "error", message: "Admin token required for unsafe export." });
        return;
      }
    }

    setState({ kind: "loading" });

    let res: Response;
    try {
      const token = adminToken.trim();
      res = await fetch("/export/docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(args.unsafeOverride ? { "x-orbital-admin-token": token } : {}),
        },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: "memo",
          unsafe_override: args.unsafeOverride,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const env = readSafeError(json);
      if (env) {
        if (env.code === "EXPORT_BLOCKED") {
          const details = parseBlockedDetails(env.details);
          setState({
            kind: "blocked",
            message: env.message,
            details: details ?? { citationFailedCount: 0, failedQuestionIds: [], reasonCodes: [] },
          });
          return;
        }
        setState({ kind: "error", message: `${env.code}: ${env.message}` });
        return;
      }
      setState({ kind: "error", message: `Request failed (${res.status}).` });
      return;
    }

    setState({ kind: "done", message: "Memo exported. See Artefacts for download." });
    router.refresh();
  }

  return (
    <div className="grid justify-items-end gap-2">
      {state.kind === "blocked" ? (
        <div className="w-full max-w-sm rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">
          <div className="font-semibold">Export blocked</div>
          <div className="mt-1 text-red-800">
            {state.details.citationFailedCount} row(s) are <span className="font-mono">citation_failed</span>.
          </div>

          {state.details.failedQuestionIds.length ? (
            <div className="mt-2 text-red-800">
              Failed:{" "}
              <span className="font-mono">
                {state.details.failedQuestionIds.slice(0, 6).join(", ")}
                {state.details.failedQuestionIds.length > 6 ? "…" : ""}
              </span>
            </div>
          ) : null}

          {reportHref ? (
            <div className="mt-2">
              <a className="font-medium underline" href={reportHref} target="_blank" rel="noreferrer">
                Next: open Report JSON to fix citations
              </a>
            </div>
          ) : (
            <div className="mt-2 text-red-800">Next: open the run report to fix citations.</div>
          )}

          {props.unsafeOverrideEnabled ? (
            <div className="mt-3 rounded border border-red-200 bg-white p-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-red-700">Unsafe export (demo only)</div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <label className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-700">Admin token</span>
                  <input
                    className="h-8 w-44 rounded border border-slate-300 bg-white px-2 font-mono text-xs text-slate-900"
                    type="password"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="x-orbital-admin-token"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>

                <button
                  className="rounded bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={() => run({ unsafeOverride: true })}
                  disabled={Boolean(disabled) || state.kind === "loading"}
                >
                  Export UNSAFE memo
                </button>
              </div>
              <div className="mt-2 text-[11px] text-red-700">
                This will create <span className="font-mono">memo.UNSAFE.docx</span> even if citations failed.
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={() => run({ unsafeOverride: false })}
        disabled={Boolean(disabled) || state.kind === "loading"}
      >
        {state.kind === "loading" ? "Exporting…" : "Export memo (Word)"}
      </button>

      {disabled ? <div className="text-xs text-slate-600">{disabled}</div> : null}

      {state.kind === "error" ? <div className="text-xs font-medium text-red-700">{state.message}</div> : null}
      {state.kind === "done" ? <div className="text-xs font-medium text-emerald-700">{state.message}</div> : null}
    </div>
  );
}
