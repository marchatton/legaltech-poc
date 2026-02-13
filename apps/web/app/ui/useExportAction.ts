"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../lib/safeErrorDisplay";

export type ExportLoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; error: SafeErrorDisplay }
  | { kind: "error"; error: SafeErrorDisplay }
  | { kind: "done"; message: string };

export function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export type UseExportActionOptions = {
  endpoint: string;
  method?: string;
  buildBody: () => Record<string, unknown>;
  buildHeaders?: () => Record<string, string>;
  disabled: string | null;
  resetKeys: unknown[];
  onSuccess?: (json: unknown) => string;
};

export function useExportAction(options: UseExportActionOptions) {
  const router = useRouter();
  const [state, setState] = useState<ExportLoadState>({ kind: "idle" });

  useEffect(() => {
    setState({ kind: "idle" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options.resetKeys);

  async function run() {
    if (options.disabled) return;

    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch(options.endpoint, {
        method: options.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.buildHeaders?.(),
        },
        body: JSON.stringify(options.buildBody()),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", error: { code: "NETWORK_ERROR", message, retryable: true } });
      return;
    }

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const env = parseSafeErrorEnvelope(json);
      const error = env ?? {
        code: `HTTP_${res.status}`,
        message: `Request failed (${res.status}).`,
        retryable: res.status >= 500,
      };
      setState({ kind: error.code === "EXPORT_BLOCKED" ? "blocked" : "error", error });
      return;
    }

    const message = options.onSuccess?.(json) ?? "Export complete.";
    setState({ kind: "done", message });
    router.refresh();
  }

  return { state, setState, run } as const;
}
