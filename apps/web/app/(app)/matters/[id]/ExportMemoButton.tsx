"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { InlineStatus } from "../../../ui/InlineStatus";
import { Input } from "../../../ui/Input";

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
  | { kind: "blocked"; error: SafeErrorDisplay; details: ExportBlockedDetails }
  | { kind: "error"; error: SafeErrorDisplay }
  | { kind: "done"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
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
        setState({
          kind: "error",
          error: {
            code: "VALIDATION_ERROR",
            message: "Admin token required for unsafe export.",
            retryable: false,
          },
        });
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
      setState({ kind: "error", error: { code: "NETWORK_ERROR", message, retryable: true } });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const env = parseSafeErrorEnvelope(json);
      if (env) {
        if (env.code === "EXPORT_BLOCKED") {
          const details = parseBlockedDetails(env.details);
          setState({
            kind: "blocked",
            error: env,
            details: details ?? { citationFailedCount: 0, failedQuestionIds: [], reasonCodes: [] },
          });
          return;
        }
        setState({ kind: "error", error: env });
        return;
      }
      setState({
        kind: "error",
        error: {
          code: `HTTP_${res.status}`,
          message: `Request failed (${res.status}).`,
          retryable: res.status >= 500,
        },
      });
      return;
    }

    setState({ kind: "done", message: "Memo exported. See Artefacts for download." });
    router.refresh();
  }

  return (
    <div className="grid justify-items-end gap-2">
      {state.kind === "blocked" ? (
        <ErrorBanner
          title="Export blocked"
          code={state.error.code}
          message={state.error.message}
          traceId={state.error.traceId}
          supportRoute={`/matters/${props.folderId}`}
          className="w-full max-w-md"
        >
          <div className="text-xs text-destructive">
            <div>
              {state.details.citationFailedCount} row(s) are <span className="font-mono">citation_failed</span>.
            </div>

            {state.details.failedQuestionIds.length ? (
              <div className="mt-2">
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
              <div className="mt-2">Next: open the run report to fix citations.</div>
            )}

            {props.unsafeOverrideEnabled ? (
              <div className="mt-3 rounded-ui-md border border-destructive/20 bg-card p-2">
                <div className="text-2xs font-semibold uppercase tracking-wide text-destructive">Unsafe export (demo only)</div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Admin token</span>
                    <Input
                      className="w-44 font-mono"
                      uiSize="sm"
                      type="password"
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      placeholder="x-orbital-admin-token"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => run({ unsafeOverride: true })}
                    disabled={Boolean(disabled)}
                  >
                    Export UNSAFE memo
                  </Button>
                </div>
                <div className="mt-2 text-2xs text-destructive">
                  This will create <span className="font-mono">memo.UNSAFE.docx</span> even if citations failed.
                </div>
              </div>
            ) : null}
          </div>
        </ErrorBanner>
      ) : null}

      <Button
        variant="neutral"
        size="sm"
        onClick={() => run({ unsafeOverride: false })}
        disabled={Boolean(disabled)}
        loading={state.kind === "loading"}
      >
        Export memo (Word)
      </Button>

      {disabled ? <div className="text-xs text-muted-foreground">{disabled}</div> : null}

      {state.kind === "error" ? (
        <ErrorBanner
          title="Export failed"
          code={state.error.code}
          message={state.error.message}
          traceId={state.error.traceId}
          supportRoute={`/matters/${props.folderId}`}
          retryable={state.error.retryable}
          onRetry={() => run({ unsafeOverride: false })}
          className="w-full max-w-md"
        />
      ) : null}
      <InlineStatus kind={state.kind === "done" ? "success" : "idle"}>{state.kind === "done" ? state.message : null}</InlineStatus>
    </div>
  );
}
